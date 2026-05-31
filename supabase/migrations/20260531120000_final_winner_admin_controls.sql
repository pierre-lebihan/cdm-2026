ALTER TABLE public.competitions
  ADD COLUMN IF NOT EXISTS final_winner_team TEXT REFERENCES public.teams(id);

ALTER TABLE public.competition_profiles
  ADD COLUMN IF NOT EXISTS final_winner_points INTEGER NOT NULL DEFAULT 0;

CREATE OR REPLACE FUNCTION public.validate_competition_final_winner_team()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.final_winner_team IS NULL THEN
    RETURN NEW;
  END IF;

  PERFORM 1
  FROM public.teams t
  WHERE t.id = NEW.final_winner_team
    AND t.competition_id = NEW.id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'final_winner_team must belong to the same competition';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS competitions_validate_final_winner_team
  ON public.competitions;
CREATE TRIGGER competitions_validate_final_winner_team
  BEFORE INSERT OR UPDATE OF final_winner_team
  ON public.competitions
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_competition_final_winner_team();

CREATE OR REPLACE FUNCTION public.refresh_final_winner_scores(
  p_competition_id UUID
) RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_winner_team   TEXT;
  v_winner_points INTEGER;
BEGIN
  IF p_competition_id IS NULL THEN
    RETURN;
  END IF;

  UPDATE public.competition_profiles cp
  SET score = COALESCE(cp.score, 0) - COALESCE(cp.final_winner_points, 0),
      final_winner_points = 0
  WHERE cp.competition_id = p_competition_id;

  SELECT c.final_winner_team,
         ROUND(COALESCE(t.win_odd, 0))::INTEGER
  INTO v_winner_team,
       v_winner_points
  FROM public.competitions c
  LEFT JOIN public.teams t
    ON t.id = c.final_winner_team
   AND t.competition_id = c.id
  WHERE c.id = p_competition_id;

  IF v_winner_team IS NULL THEN
    RETURN;
  END IF;

  UPDATE public.competition_profiles cp
  SET final_winner_points = COALESCE(v_winner_points, 0),
      score = COALESCE(cp.score, 0) + COALESCE(v_winner_points, 0)
  WHERE cp.competition_id = p_competition_id
    AND cp.winner_team = v_winner_team;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.refresh_final_winner_scores(UUID) FROM PUBLIC;

CREATE OR REPLACE FUNCTION public.handle_competition_final_winner_scores()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'UPDATE' THEN
    IF NEW.final_winner_team IS NOT DISTINCT FROM OLD.final_winner_team THEN
      RETURN NEW;
    END IF;
  END IF;

  PERFORM public.refresh_final_winner_scores(NEW.id);
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS competitions_refresh_final_winner_scores
  ON public.competitions;
CREATE TRIGGER competitions_refresh_final_winner_scores
  AFTER INSERT OR UPDATE OF final_winner_team
  ON public.competitions
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_competition_final_winner_scores();

CREATE OR REPLACE FUNCTION public.handle_competition_profile_final_winner_scores()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    PERFORM public.refresh_final_winner_scores(OLD.competition_id);
    RETURN OLD;
  END IF;

  IF TG_OP = 'UPDATE' THEN
    IF NEW.competition_id IS NOT DISTINCT FROM OLD.competition_id
       AND NEW.winner_team IS NOT DISTINCT FROM OLD.winner_team THEN
      RETURN NEW;
    END IF;

    IF NEW.competition_id IS DISTINCT FROM OLD.competition_id THEN
      PERFORM public.refresh_final_winner_scores(OLD.competition_id);
    END IF;
  END IF;

  PERFORM public.refresh_final_winner_scores(NEW.competition_id);
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS competition_profiles_refresh_final_winner_scores
  ON public.competition_profiles;
CREATE TRIGGER competition_profiles_refresh_final_winner_scores
  AFTER INSERT OR UPDATE OF competition_id, winner_team OR DELETE
  ON public.competition_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_competition_profile_final_winner_scores();

CREATE OR REPLACE FUNCTION public.handle_team_final_winner_points_refresh()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'UPDATE'
     AND NEW.win_odd IS NOT DISTINCT FROM OLD.win_odd THEN
    RETURN NEW;
  END IF;

  PERFORM public.refresh_final_winner_scores(c.id)
  FROM public.competitions c
  WHERE c.final_winner_team = NEW.id;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS teams_refresh_final_winner_points
  ON public.teams;
CREATE TRIGGER teams_refresh_final_winner_points
  AFTER UPDATE OF win_odd
  ON public.teams
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_team_final_winner_points_refresh();

CREATE OR REPLACE FUNCTION public.admin_recalculate_all_scores()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  match_row     RECORD;
  bet_row       RECORD;
  competition_row RECORD;
  real_result   TEXT;
  bet_result    TEXT;
  total_diff    INTEGER;
  real_margin   INTEGER;
  bet_margin    INTEGER;
  base_points   INTEGER;
  points        INTEGER;
  p_resultat    INTEGER;
  p_gagnant     INTEGER;
  p_proximite   INTEGER;
  p_ecart       INTEGER;
  p_bonus       INTEGER;
  phase_mult    NUMERIC;
  winning_odds  NUMERIC;
  outcome       public.bet_outcome_status;
  v_matches     INTEGER := 0;
  v_bets        INTEGER := 0;
  v_final_winner_profiles INTEGER := 0;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Seuls les admins peuvent recalculer les scores';
  END IF;

  UPDATE public.competition_profiles
  SET score = 0,
      final_winner_points = 0
  WHERE TRUE;

  FOR match_row IN
    SELECT * FROM public.matches
    WHERE score_a IS NULL OR score_b IS NULL
  LOOP
    UPDATE public.bets SET points_won = 0, outcome_status = NULL
    WHERE match_id = match_row.id;
  END LOOP;

  FOR match_row IN
    SELECT * FROM public.matches
    WHERE score_a IS NOT NULL AND score_b IS NOT NULL
    ORDER BY date_time ASC
  LOOP
    v_matches := v_matches + 1;

    real_result := CASE
      WHEN match_row.score_a > match_row.score_b THEN 'A'
      WHEN match_row.score_a = match_row.score_b THEN 'N'
      ELSE 'B'
    END;

    real_margin := ABS(match_row.score_a - match_row.score_b);

    winning_odds := public.match_winning_odds(
      match_row.bet_format,
      match_row.score_a,
      match_row.score_b,
      match_row.playoff_winner,
      match_row.odds_a,
      match_row.odds_b,
      match_row.odds_draw
    );

    phase_mult := public.tournament_phase_multiplier(match_row.tournament_phase);

    FOR bet_row IN SELECT * FROM public.bets WHERE match_id = match_row.id LOOP
      v_bets := v_bets + 1;

      bet_result := CASE
        WHEN bet_row.bet_team_a > bet_row.bet_team_b THEN 'A'
        WHEN bet_row.bet_team_a = bet_row.bet_team_b THEN 'N'
        ELSE 'B'
      END;

      IF match_row.bet_format = 'regulation_1x2' THEN
        p_gagnant := CASE WHEN bet_result = real_result THEN 8 ELSE 0 END;
      ELSE
        DECLARE
          eff_real_winner TEXT;
          eff_bet_winner  TEXT;
        BEGIN
          eff_real_winner := CASE WHEN real_result != 'N' THEN real_result ELSE match_row.playoff_winner END;
          eff_bet_winner  := CASE WHEN bet_result  != 'N' THEN bet_result  ELSE bet_row.bet_playoff_winner END;
          p_gagnant := CASE
            WHEN eff_real_winner IS NOT NULL AND eff_bet_winner = eff_real_winner THEN 8
            ELSE 0
          END;
        END;
      END IF;

      p_resultat := CASE WHEN bet_result = real_result THEN 2 ELSE 0 END;

      p_bonus := CASE
        WHEN bet_result = real_result
         AND bet_row.bet_team_a = match_row.score_a
         AND bet_row.bet_team_b = match_row.score_b THEN 4
        ELSE 0
      END;

      IF bet_result = real_result OR p_gagnant > 0 THEN
        total_diff := ABS(match_row.score_a - bet_row.bet_team_a)
                    + ABS(match_row.score_b - bet_row.bet_team_b);
        p_proximite := GREATEST(3 - total_diff, 0);

        bet_margin  := ABS(bet_row.bet_team_a - bet_row.bet_team_b);
        p_ecart     := GREATEST(3 - ABS(real_margin - bet_margin), 0);
      ELSE
        p_proximite := 0;
        p_ecart     := 0;
      END IF;

      base_points := p_resultat + p_gagnant + p_proximite + p_ecart + p_bonus;

      IF winning_odds IS NULL OR base_points = 0 THEN
        points := 0;
      ELSE
        points := ROUND(base_points::NUMERIC * winning_odds * phase_mult)::INTEGER;
      END IF;

      IF bet_row.bet_team_a IS NOT DISTINCT FROM match_row.score_a
         AND bet_row.bet_team_b IS NOT DISTINCT FROM match_row.score_b THEN
        outcome := 'perfect_score'::public.bet_outcome_status;
      ELSIF points <= 0 THEN
        outcome := 'rate'::public.bet_outcome_status;
      ELSE
        outcome := 'good_result'::public.bet_outcome_status;
      END IF;

      UPDATE public.bets
      SET points_won = points, outcome_status = outcome
      WHERE id = bet_row.id;

      UPDATE public.competition_profiles
      SET score = COALESCE(score, 0) + points
      WHERE user_id = bet_row.user_id
        AND competition_id = bet_row.competition_id;
    END LOOP;
  END LOOP;

  FOR competition_row IN
    SELECT id FROM public.competitions
  LOOP
    PERFORM public.refresh_final_winner_scores(competition_row.id);
  END LOOP;

  SELECT COUNT(*)::INTEGER INTO v_final_winner_profiles
  FROM public.competition_profiles
  WHERE final_winner_points > 0;

  RETURN jsonb_build_object(
    'matches_processed', v_matches,
    'bets_processed', v_bets,
    'final_winner_profiles', v_final_winner_profiles
  );
END;
$$;

DO $$
DECLARE
  competition_row RECORD;
BEGIN
  FOR competition_row IN
    SELECT id FROM public.competitions
  LOOP
    PERFORM public.refresh_final_winner_scores(competition_row.id);
  END LOOP;
END $$;
