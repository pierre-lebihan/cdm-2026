-- Fix scoring algorithm:
--   1. Écart de Buts becomes graded: GREATEST(3 - ABS(real_margin - bet_margin), 0)
--      instead of binary (0 or 3)
--   2. Proximité + Écart are awarded if the 90min result is correct OR if the
--      effective winner is correct (playoff only) — e.g. predicting a draw with
--      the right winner still earns proximity and margin points.

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

    -- ── Gagnant Correct : 8 pts ──────────────────────────────────────────
    -- Groupe   : gagnant = résultat correct (V/N/D identiques)
    -- Playoffs : vainqueur effectif = côté gagnant si non-nul, sinon playoff_winner
    --   → Prédire un nul + bon vainqueur sur une victoire réelle = 8 pts
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

    -- ── Résultat Correct : 2 pts ─────────────────────────────────────────
    -- Uniquement si résultat 90min identique (V/N/D)
    p_resultat := CASE WHEN bet_result = real_result THEN 2 ELSE 0 END;

    -- ── Bonus Score Exact : 4 pts ─────────────────────────────────────────
    -- Uniquement si score 90min exactement correct
    p_bonus := CASE
      WHEN bet_result = real_result
       AND bet_row.bet_team_a = NEW.score_a
       AND bet_row.bet_team_b = NEW.score_b THEN 4
      ELSE 0
    END;

    -- ── Proximité et Écart ────────────────────────────────────────────────
    -- Attribués si : résultat 90min correct  OU  gagnant correct (playoffs).
    -- Cela permet de récompenser un pronostic nul + bon vainqueur même si le
    -- match se gagne en 90min, et vice-versa.
    --
    -- Proximité du Score : max(3 − écart total des buts, 0)  → 0..3 pts
    -- Écart de Buts      : max(3 − |marge_réelle − marge_pariée|, 0) → 0..3 pts (gradué)
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
