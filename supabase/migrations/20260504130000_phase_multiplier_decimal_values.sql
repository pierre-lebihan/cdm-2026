-- Mise a jour du bareme des multiplicateurs de phase :
--   group         : 0.75  (etait 1)
--   round_of_16   : 1
--   round_of_8    : 1.5   (etait 2)
--   quarter_final : 3
--   semi_final    : 6     (etait 5)
--   third_place   : 8     (etait 7)
--   final         : 12    (etait 10)
--
-- Le retour de tournament_phase_multiplier passe d'INTEGER a NUMERIC pour
-- accepter les valeurs decimales. Les fonctions consommatrices sont mises
-- a jour en consequence (variables NUMERIC). Les scores des matchs deja
-- termines sont recalcules en fin de migration.

DROP FUNCTION IF EXISTS public.tournament_phase_multiplier(public.match_tournament_phase);

CREATE OR REPLACE FUNCTION public.tournament_phase_multiplier(
  p_phase public.match_tournament_phase
) RETURNS NUMERIC
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT (CASE p_phase
    WHEN 'group'         THEN 0.75
    WHEN 'round_of_16'   THEN 1
    WHEN 'round_of_8'    THEN 1.5
    WHEN 'quarter_final' THEN 3
    WHEN 'semi_final'    THEN 6
    WHEN 'third_place'   THEN 8
    WHEN 'final'         THEN 12
    ELSE 1
  END)::NUMERIC;
$$;

CREATE OR REPLACE FUNCTION calculate_match_scores()
RETURNS TRIGGER AS $$
DECLARE
  bet_row       RECORD;
  real_result   TEXT;
  bet_result    TEXT;
  total_diff    INTEGER;
  real_margin   INTEGER;
  bet_margin    INTEGER;
  base_points   INTEGER;
  points        INTEGER;
  old_points    INTEGER;
  p_resultat    INTEGER;
  p_gagnant     INTEGER;
  p_proximite   INTEGER;
  p_ecart       INTEGER;
  p_bonus       INTEGER;
  phase_mult    NUMERIC;
  winning_odds  NUMERIC;
  outcome       public.bet_outcome_status;
BEGIN
  IF (NEW.score_a IS NOT DISTINCT FROM OLD.score_a)
     AND (NEW.score_b IS NOT DISTINCT FROM OLD.score_b)
     AND (NEW.playoff_winner IS NOT DISTINCT FROM OLD.playoff_winner)
     AND (NEW.odds_a IS NOT DISTINCT FROM OLD.odds_a)
     AND (NEW.odds_b IS NOT DISTINCT FROM OLD.odds_b)
     AND (NEW.odds_draw IS NOT DISTINCT FROM OLD.odds_draw)
     AND (NEW.tournament_phase IS NOT DISTINCT FROM OLD.tournament_phase)
     AND (NEW.bet_format IS NOT DISTINCT FROM OLD.bet_format) THEN
    RETURN NEW;
  END IF;

  IF (NEW.score_a IS NULL OR NEW.score_b IS NULL)
     AND (OLD.score_a IS NOT NULL AND OLD.score_b IS NOT NULL) THEN
    FOR bet_row IN SELECT * FROM bets WHERE match_id = NEW.id LOOP
      old_points := COALESCE(bet_row.points_won, 0);
      UPDATE bets SET points_won = 0, outcome_status = NULL WHERE id = bet_row.id;
      UPDATE competition_profiles
      SET score = COALESCE(score, 0) - old_points
      WHERE user_id = bet_row.user_id
        AND competition_id = bet_row.competition_id;
    END LOOP;
    RETURN NEW;
  END IF;

  IF NEW.score_a IS NULL OR NEW.score_b IS NULL THEN
    RETURN NEW;
  END IF;

  real_result := CASE
    WHEN NEW.score_a > NEW.score_b THEN 'A'
    WHEN NEW.score_a = NEW.score_b THEN 'N'
    ELSE 'B'
  END;

  real_margin := ABS(NEW.score_a - NEW.score_b);

  winning_odds := public.match_winning_odds(
    NEW.bet_format,
    NEW.score_a,
    NEW.score_b,
    NEW.playoff_winner,
    NEW.odds_a,
    NEW.odds_b,
    NEW.odds_draw
  );

  phase_mult := public.tournament_phase_multiplier(NEW.tournament_phase);

  FOR bet_row IN SELECT * FROM bets WHERE match_id = NEW.id LOOP
    old_points := COALESCE(bet_row.points_won, 0);

    bet_result := CASE
      WHEN bet_row.bet_team_a > bet_row.bet_team_b THEN 'A'
      WHEN bet_row.bet_team_a = bet_row.bet_team_b THEN 'N'
      ELSE 'B'
    END;

    IF NEW.bet_format = 'regulation_1x2' THEN
      p_gagnant := CASE WHEN bet_result = real_result THEN 8 ELSE 0 END;
    ELSE
      DECLARE
        eff_real_winner TEXT;
        eff_bet_winner  TEXT;
      BEGIN
        eff_real_winner := CASE WHEN real_result != 'N' THEN real_result ELSE NEW.playoff_winner END;
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
       AND bet_row.bet_team_a = NEW.score_a
       AND bet_row.bet_team_b = NEW.score_b THEN 4
      ELSE 0
    END;

    IF bet_result = real_result OR p_gagnant > 0 THEN
      total_diff := ABS(NEW.score_a - bet_row.bet_team_a)
                  + ABS(NEW.score_b - bet_row.bet_team_b);
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

    IF bet_row.bet_team_a IS NOT DISTINCT FROM NEW.score_a
       AND bet_row.bet_team_b IS NOT DISTINCT FROM NEW.score_b THEN
      outcome := 'perfect_score'::public.bet_outcome_status;
    ELSIF points <= 0 THEN
      outcome := 'rate'::public.bet_outcome_status;
    ELSE
      outcome := 'good_result'::public.bet_outcome_status;
    END IF;

    UPDATE bets SET points_won = points, outcome_status = outcome WHERE id = bet_row.id;

    UPDATE competition_profiles
    SET score = COALESCE(score, 0) - old_points + points
    WHERE user_id = bet_row.user_id
      AND competition_id = bet_row.competition_id;
  END LOOP;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.admin_recalculate_all_scores()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  match_row     RECORD;
  bet_row       RECORD;
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
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Seuls les admins peuvent recalculer les scores';
  END IF;

  UPDATE public.competition_profiles SET score = 0 WHERE TRUE;

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

  RETURN jsonb_build_object(
    'matches_processed', v_matches,
    'bets_processed', v_bets
  );
END;
$$;

-- Recalcul immediat des scores avec les nouveaux multiplicateurs.
DO $$
DECLARE
  match_row     RECORD;
  bet_row       RECORD;
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
BEGIN
  UPDATE public.competition_profiles SET score = 0 WHERE TRUE;

  UPDATE public.bets SET points_won = 0, outcome_status = NULL
  WHERE match_id IN (
    SELECT id FROM public.matches WHERE score_a IS NULL OR score_b IS NULL
  );

  FOR match_row IN
    SELECT * FROM public.matches
    WHERE score_a IS NOT NULL AND score_b IS NOT NULL
    ORDER BY date_time ASC
  LOOP
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
END $$;
