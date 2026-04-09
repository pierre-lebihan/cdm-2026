CREATE TYPE public.bet_outcome_status AS ENUM (
  'rate',
  'good_result',
  'perfect_score'
);

ALTER TABLE public.bets
  ADD COLUMN outcome_status public.bet_outcome_status;

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
  pop_key       TEXT;
  total_valid   INTEGER;
  same_count    INTEGER;
  mult          NUMERIC;
  outcome       public.bet_outcome_status;
BEGIN
  IF (NEW.score_a IS NOT DISTINCT FROM OLD.score_a)
     AND (NEW.score_b IS NOT DISTINCT FROM OLD.score_b)
     AND (NEW.playoff_winner IS NOT DISTINCT FROM OLD.playoff_winner) THEN
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

  SELECT COUNT(*)::INTEGER INTO total_valid
  FROM bets b
  WHERE b.match_id = NEW.id
    AND public.match_prediction_popularity_key(
      NEW.bet_format, b.bet_team_a, b.bet_team_b, b.bet_playoff_winner
    ) IS NOT NULL;

  real_result := CASE
    WHEN NEW.score_a > NEW.score_b THEN 'A'
    WHEN NEW.score_a = NEW.score_b THEN 'N'
    ELSE 'B'
  END;

  real_margin := ABS(NEW.score_a - NEW.score_b);

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

    pop_key := public.match_prediction_popularity_key(
      NEW.bet_format,
      bet_row.bet_team_a,
      bet_row.bet_team_b,
      bet_row.bet_playoff_winner
    );

    IF pop_key IS NULL THEN
      mult := 1;
    ELSE
      SELECT COUNT(*)::INTEGER INTO same_count
      FROM bets b
      WHERE b.match_id = NEW.id
        AND public.match_prediction_popularity_key(
          NEW.bet_format, b.bet_team_a, b.bet_team_b, b.bet_playoff_winner
        ) = pop_key;

      mult := public.prediction_popularity_multiplier(total_valid, same_count);
    END IF;

    points := ROUND(base_points::NUMERIC * mult)::INTEGER;

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

UPDATE public.bets b
SET outcome_status = CASE
  WHEN b.bet_team_a IS NOT DISTINCT FROM m.score_a
   AND b.bet_team_b IS NOT DISTINCT FROM m.score_b
  THEN 'perfect_score'::public.bet_outcome_status
  WHEN COALESCE(b.points_won, 0) <= 0
  THEN 'rate'::public.bet_outcome_status
  ELSE 'good_result'::public.bet_outcome_status
END
FROM public.matches m
WHERE b.match_id = m.id
  AND m.score_a IS NOT NULL
  AND m.score_b IS NOT NULL;
