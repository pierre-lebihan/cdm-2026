-- Popularité des pronos : clé par match (3 issues en phase de groupe, 2 en phase finale).

CREATE OR REPLACE FUNCTION public.prediction_popularity_key(
  p_phase TEXT,
  bet_a INTEGER,
  bet_b INTEGER,
  bet_pw TEXT
) RETURNS TEXT
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT CASE
    WHEN bet_a IS NULL OR bet_b IS NULL OR bet_a < 0 OR bet_b < 0 THEN NULL::TEXT
    WHEN COALESCE(p_phase, '0') = '0' THEN
      CASE
        WHEN bet_a > bet_b THEN 'G_A'
        WHEN bet_a < bet_b THEN 'G_B'
        ELSE 'G_N'
      END
    WHEN bet_a = bet_b THEN
      CASE
        WHEN bet_pw = 'A' THEN 'P_A'
        WHEN bet_pw = 'B' THEN 'P_B'
        ELSE NULL::TEXT
      END
    WHEN bet_a > bet_b THEN 'P_A'
    ELSE 'P_B'
  END;
$$;

CREATE OR REPLACE FUNCTION public.prediction_popularity_multiplier(
  p_total_valid INTEGER,
  p_same_count INTEGER
) RETURNS NUMERIC
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT CASE
    WHEN p_total_valid IS NULL OR p_total_valid < 2 THEN 1::NUMERIC
    ELSE LEAST(
      10::NUMERIC,
      GREATEST(
        1::NUMERIC,
        EXP(-POWER(p_same_count::NUMERIC / NULLIF(p_total_valid, 0)::NUMERIC, 2) * 2) * 10
      )
    )
  END;
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
  pop_key       TEXT;
  total_valid   INTEGER;
  same_count    INTEGER;
  mult          NUMERIC;
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
      UPDATE bets SET points_won = 0 WHERE id = bet_row.id;
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
    AND public.prediction_popularity_key(NEW.phase, b.bet_team_a, b.bet_team_b, b.bet_playoff_winner) IS NOT NULL;

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

    IF COALESCE(NEW.phase, '0') = '0' THEN
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

    IF bet_result != real_result THEN
      p_resultat  := 0;
      p_proximite := 0;
      p_ecart     := 0;
      p_bonus     := 0;
    ELSE
      p_resultat := 2;

      p_bonus := CASE
        WHEN bet_row.bet_team_a = NEW.score_a
         AND bet_row.bet_team_b = NEW.score_b THEN 4
        ELSE 0
      END;

      total_diff := ABS(NEW.score_a - bet_row.bet_team_a)
                  + ABS(NEW.score_b - bet_row.bet_team_b);
      p_proximite := GREATEST(3 - total_diff, 0);

      bet_margin := ABS(bet_row.bet_team_a - bet_row.bet_team_b);
      p_ecart := CASE WHEN real_margin = bet_margin THEN 3 ELSE 0 END;
    END IF;

    base_points := p_resultat + p_gagnant + p_proximite + p_ecart + p_bonus;

    pop_key := public.prediction_popularity_key(
      NEW.phase,
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
        AND public.prediction_popularity_key(NEW.phase, b.bet_team_a, b.bet_team_b, b.bet_playoff_winner) = pop_key;

      mult := public.prediction_popularity_multiplier(total_valid, same_count);
    END IF;

    points := ROUND(base_points::NUMERIC * mult)::INTEGER;

    UPDATE bets SET points_won = points WHERE id = bet_row.id;

    UPDATE competition_profiles
    SET score = COALESCE(score, 0) - old_points + points
    WHERE user_id = bet_row.user_id
      AND competition_id = bet_row.competition_id;
  END LOOP;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
