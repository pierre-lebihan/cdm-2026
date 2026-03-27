-- New fixed-points scoring algorithm (replaces odds-based system)
--
-- Max 20 points per match (group stage AND knockout):
--   Résultat Correct (V/N/D)  :  2 pts
--   Gagnant Correct            :  8 pts
--     → Phase de groupe : vainqueur au score 90min (pas de gagnant si nul)
--     → Phase finale    : matches.playoff_winner vs bets.bet_playoff_winner
--       (nul 90min possible → vainqueur désigné après prolongations/penalties)
--   Proximité du Score         :  3 pts  (3 − écart total des buts, min 0)
--   Écart de Buts              :  3 pts  (bonne marge de victoire/nul)
--   Bonus Score Exact          :  4 pts  (score 90min 100% exact)

CREATE OR REPLACE FUNCTION calculate_match_scores()
RETURNS TRIGGER AS $$
DECLARE
  bet_row       RECORD;
  real_result   TEXT;
  bet_result    TEXT;
  total_diff    INTEGER;
  real_margin   INTEGER;
  bet_margin    INTEGER;
  points        INTEGER;
  old_points    INTEGER;
  p_resultat    INTEGER;
  p_gagnant     INTEGER;
  p_proximite   INTEGER;
  p_ecart       INTEGER;
  p_bonus       INTEGER;
BEGIN
  IF (NEW.score_a IS NOT DISTINCT FROM OLD.score_a)
     AND (NEW.score_b IS NOT DISTINCT FROM OLD.score_b)
     AND (NEW.playoff_winner IS NOT DISTINCT FROM OLD.playoff_winner) THEN
    RETURN NEW;
  END IF;

  -- Score cleared: revert all points for this match
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

    -- ── Gagnant Correct : 8 pts ─────────────────────────────
    -- Phase de groupe ('0') : gagnant = résultat correct (V/N/D)
    -- Phase finale (≠ '0')  : gagnant basé sur le vainqueur EFFECTIF du match,
    --   indépendamment du résultat 90min.
    --   Vainqueur effectif réel  : score si non-nul, sinon playoff_winner
    --   Vainqueur effectif parié : côté gagnant du pari si non-nul, sinon bet_playoff_winner
    --   → Permet de gagner le gagnant même si on a prédit un nul mais le bon vainqueur.
    IF COALESCE(NEW.phase, '0') = '0' THEN
      -- Groupe : gagnant lié au résultat
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

    -- ── Résultat, Proximité, Écart, Bonus : nécessitent résultat 90min correct ──
    IF bet_result != real_result THEN
      p_resultat  := 0;
      p_proximite := 0;
      p_ecart     := 0;
      p_bonus     := 0;
    ELSE
      -- Résultat Correct: 2 pts
      p_resultat := 2;

      -- Bonus Score Exact: 4 pts
      p_bonus := CASE
        WHEN bet_row.bet_team_a = NEW.score_a
         AND bet_row.bet_team_b = NEW.score_b THEN 4
        ELSE 0
      END;

      -- Proximité du Score: max(3 − total_diff, 0)
      total_diff := ABS(NEW.score_a - bet_row.bet_team_a)
                  + ABS(NEW.score_b - bet_row.bet_team_b);
      p_proximite := GREATEST(3 - total_diff, 0);

      -- Écart de Buts: 3 pts if goal margin matches
      bet_margin := ABS(bet_row.bet_team_a - bet_row.bet_team_b);
      p_ecart := CASE WHEN real_margin = bet_margin THEN 3 ELSE 0 END;
    END IF;

    points := p_resultat + p_gagnant + p_proximite + p_ecart + p_bonus;

    UPDATE bets SET points_won = points WHERE id = bet_row.id;

    UPDATE competition_profiles
    SET score = COALESCE(score, 0) - old_points + points
    WHERE user_id = bet_row.user_id
      AND competition_id = bet_row.competition_id;
  END LOOP;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
