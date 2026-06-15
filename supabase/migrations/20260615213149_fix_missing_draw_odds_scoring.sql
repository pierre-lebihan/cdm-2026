CREATE OR REPLACE FUNCTION public.match_winning_popularity_key(
  p_bet_format public.match_bet_format,
  p_score_a INTEGER,
  p_score_b INTEGER,
  p_playoff_winner TEXT
) RETURNS TEXT
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT CASE
    WHEN p_score_a IS NULL OR p_score_b IS NULL THEN NULL::TEXT
    WHEN p_bet_format = 'regulation_1x2' THEN
      CASE
        WHEN p_score_a > p_score_b THEN 'G_A'
        WHEN p_score_a < p_score_b THEN 'G_B'
        ELSE 'G_N'
      END
    ELSE
      CASE
        WHEN p_score_a > p_score_b THEN 'P_A'
        WHEN p_score_a < p_score_b THEN 'P_B'
        WHEN p_playoff_winner = 'A' THEN 'P_A'
        WHEN p_playoff_winner = 'B' THEN 'P_B'
        ELSE NULL::TEXT
      END
  END;
$$;

CREATE OR REPLACE FUNCTION public.match_winning_odds_from_bets(
  p_match_id TEXT,
  p_bet_format public.match_bet_format,
  p_score_a INTEGER,
  p_score_b INTEGER,
  p_playoff_winner TEXT
) RETURNS NUMERIC
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  v_winning_key TEXT;
  v_total_valid INTEGER;
  v_same_count INTEGER;
BEGIN
  v_winning_key := public.match_winning_popularity_key(
    p_bet_format,
    p_score_a,
    p_score_b,
    p_playoff_winner
  );

  IF v_winning_key IS NULL THEN
    RETURN NULL;
  END IF;

  SELECT COUNT(*)::INTEGER
  INTO v_total_valid
  FROM public.bets b
  WHERE b.match_id = p_match_id
    AND public.match_prediction_popularity_key(
      p_bet_format,
      b.bet_team_a,
      b.bet_team_b,
      b.bet_playoff_winner
    ) IS NOT NULL;

  SELECT COUNT(*)::INTEGER
  INTO v_same_count
  FROM public.bets b
  WHERE b.match_id = p_match_id
    AND public.match_prediction_popularity_key(
      p_bet_format,
      b.bet_team_a,
      b.bet_team_b,
      b.bet_playoff_winner
    ) = v_winning_key;

  RETURN public.popularity_odds_value(v_total_valid, v_same_count);
END;
$$;

CREATE OR REPLACE FUNCTION public.handle_bet_odds_refresh()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  v_match_id TEXT;
  v_start TIMESTAMPTZ;
  v_finished BOOLEAN;
BEGIN
  IF TG_OP = 'DELETE' THEN
    v_match_id := OLD.match_id;
  ELSE
    v_match_id := NEW.match_id;
  END IF;

  SELECT m.date_time, COALESCE(m.finished, false)
  INTO v_start, v_finished
  FROM public.matches m
  WHERE m.id = v_match_id;

  IF v_finished THEN
    RETURN COALESCE(NEW, OLD);
  END IF;

  IF v_start IS NOT NULL AND v_start <= NOW() THEN
    RETURN COALESCE(NEW, OLD);
  END IF;

  PERFORM public.recompute_match_odds(v_match_id);
  RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE OR REPLACE FUNCTION public.calculate_match_scores()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
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
    FOR bet_row IN SELECT * FROM public.bets WHERE match_id = NEW.id LOOP
      old_points := COALESCE(bet_row.points_won, 0);
      UPDATE public.bets SET points_won = 0, outcome_status = NULL WHERE id = bet_row.id;
      UPDATE public.competition_profiles
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

  IF winning_odds IS NULL THEN
    winning_odds := public.match_winning_odds_from_bets(
      NEW.id,
      NEW.bet_format,
      NEW.score_a,
      NEW.score_b,
      NEW.playoff_winner
    );
  END IF;

  phase_mult := public.tournament_phase_multiplier(NEW.tournament_phase);

  FOR bet_row IN SELECT * FROM public.bets WHERE match_id = NEW.id LOOP
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

    UPDATE public.bets SET points_won = points, outcome_status = outcome WHERE id = bet_row.id;

    UPDATE public.competition_profiles
    SET score = COALESCE(score, 0) - old_points + points
    WHERE user_id = bet_row.user_id
      AND competition_id = bet_row.competition_id;
  END LOOP;

  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_recalculate_all_scores()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
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

    IF winning_odds IS NULL THEN
      winning_odds := public.match_winning_odds_from_bets(
        match_row.id,
        match_row.bet_format,
        match_row.score_a,
        match_row.score_b,
        match_row.playoff_winner
      );
    END IF;

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

WITH scored_matches AS (
  SELECT
    m.id,
    public.match_winning_popularity_key(
      m.bet_format,
      m.score_a,
      m.score_b,
      m.playoff_winner
    ) AS winning_key,
    public.match_winning_odds(
      m.bet_format,
      m.score_a,
      m.score_b,
      m.playoff_winner,
      m.odds_a,
      m.odds_b,
      m.odds_draw
    ) AS current_winning_odds,
    public.match_winning_odds_from_bets(
      m.id,
      m.bet_format,
      m.score_a,
      m.score_b,
      m.playoff_winner
    ) AS repaired_winning_odds
  FROM public.matches m
  WHERE m.score_a IS NOT NULL
    AND m.score_b IS NOT NULL
),
repairable_matches AS (
  SELECT id, winning_key, repaired_winning_odds
  FROM scored_matches
  WHERE current_winning_odds IS NULL
    AND repaired_winning_odds IS NOT NULL
)
UPDATE public.matches m
SET odds_a = CASE
      WHEN r.winning_key IN ('G_A', 'P_A') AND m.odds_a IS NULL THEN r.repaired_winning_odds
      ELSE m.odds_a
    END,
    odds_b = CASE
      WHEN r.winning_key IN ('G_B', 'P_B') AND m.odds_b IS NULL THEN r.repaired_winning_odds
      ELSE m.odds_b
    END,
    odds_draw = CASE
      WHEN r.winning_key = 'G_N' AND m.odds_draw IS NULL THEN r.repaired_winning_odds
      ELSE m.odds_draw
    END
FROM repairable_matches r
WHERE m.id = r.id;
