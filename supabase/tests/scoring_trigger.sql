-- ============================================================
-- Tests du trigger calculate_match_scores
-- Exécution : psql <url> -f supabase/tests/scoring_trigger.sql
-- Tout s'exécute dans une transaction → ROLLBACK final.
--
-- IMPORTANT : le trigger se déclenche sur UPDATE de matches.
-- Les paris doivent donc être insérés AVANT que le score soit
-- posé, sinon leurs points ne sont jamais calculés.
-- ============================================================

BEGIN;

ALTER TABLE bets DISABLE TRIGGER prevent_late_bets;

-- ── Données de base ────────────────────────────────────────
INSERT INTO auth.users (id, email, encrypted_password, created_at, updated_at)
VALUES
  ('00000000-0000-0000-0000-000000000001', 'test1@test.com', '', now(), now()),
  ('00000000-0000-0000-0000-000000000002', 'test2@test.com', '', now(), now());

INSERT INTO competitions (id) VALUES ('aaaaaaaa-0000-0000-0000-000000000001');

INSERT INTO competition_profiles (user_id, competition_id, score)
VALUES
  ('00000000-0000-0000-0000-000000000001', 'aaaaaaaa-0000-0000-0000-000000000001', 0),
  ('00000000-0000-0000-0000-000000000002', 'aaaaaaaa-0000-0000-0000-000000000001', 0);

INSERT INTO matches (id, competition_id, team_a, team_b, phase)
VALUES
  ('test-group-1',   'aaaaaaaa-0000-0000-0000-000000000001', 'cl-arsenal', 'cl-psg', '0'),
  ('test-playoff-1', 'aaaaaaaa-0000-0000-0000-000000000001', 'cl-arsenal', 'cl-psg', '4');

-- ── Helpers ────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION _bet(
  p_id TEXT, p_match TEXT, p_user UUID,
  p_a INTEGER, p_b INTEGER,
  p_pw TEXT DEFAULT NULL
) RETURNS VOID AS $$
  INSERT INTO bets (id, match_id, user_id, competition_id, bet_team_a, bet_team_b, bet_playoff_winner)
  VALUES (p_id, p_match, p_user, 'aaaaaaaa-0000-0000-0000-000000000001', p_a, p_b, p_pw);
$$ LANGUAGE sql;

CREATE OR REPLACE FUNCTION _pts(p_id TEXT) RETURNS INTEGER AS $$
  SELECT points_won FROM bets WHERE id = p_id;
$$ LANGUAGE sql;

CREATE OR REPLACE FUNCTION _assert(ok BOOLEAN, msg TEXT) RETURNS VOID AS $$
BEGIN
  IF NOT ok THEN RAISE EXCEPTION 'ECHEC : %', msg; END IF;
  RAISE NOTICE 'OK : %', msg;
END;
$$ LANGUAGE plpgsql;

-- ════════════════════════════════════════════════════════════
-- PHASE DE GROUPE – score exact victoire
-- Paris en premier, score ensuite.
-- ════════════════════════════════════════════════════════════
DO $$
BEGIN
  -- Tous les paris insérés avant le score
  PERFORM _bet('g-exact-win',  'test-group-1', '00000000-0000-0000-0000-000000000001', 3, 0);  -- exact
  PERFORM _bet('g-diff2-win',  'test-group-1', '00000000-0000-0000-0000-000000000002', 2, 1);  -- bon vainqueur diff 2
  PERFORM _bet('g-margin-win', 'test-group-1', '00000000-0000-0000-0000-000000000001', 4, 1);  -- bon vainqueur diff 2 même marge
  PERFORM _bet('g-wrong-win',  'test-group-1', '00000000-0000-0000-0000-000000000002', 0, 2);  -- mauvais vainqueur
  -- 4-3 : bon vainqueur, diff = |3-4|+|0-3| = 4 → proximite=0, ecart: 3≠1 → 0
  PERFORM _bet('g-far-win',    'test-group-1', '00000000-0000-0000-0000-000000000001', 4, 3);

  UPDATE matches SET score_a = 3, score_b = 0 WHERE id = 'test-group-1';

  -- 3-0 exact  : 2+8+3+3+4 = 20
  PERFORM _assert(_pts('g-exact-win') = 20,  'Groupe – score exact victoire = 20');
  -- 2-1        : 2+8+1+0+0 = 11  (diff=2, marge 3≠1)
  PERFORM _assert(_pts('g-diff2-win') = 11,  'Groupe – bon vainqueur diff 2 = 11');
  -- 4-1        : 2+8+1+3+0 = 14  (diff=2, marge 3=3)
  PERFORM _assert(_pts('g-margin-win') = 14, 'Groupe – bon vainqueur diff 2 meme marge = 14');
  -- 0-2        : 0
  PERFORM _assert(_pts('g-wrong-win') = 0,   'Groupe – mauvais vainqueur = 0');
  -- 4-3        : 2+8+0+0+0 = 10  (diff=4, proximite=0, marge 3≠1)
  PERFORM _assert(_pts('g-far-win') = 10,    'Groupe – diff 4 proximite=0 = 10');
END $$;

-- ════════════════════════════════════════════════════════════
-- PHASE DE GROUPE – score exact nul + remise à zéro
-- ════════════════════════════════════════════════════════════
DO $$
BEGIN
  UPDATE matches SET score_a = NULL, score_b = NULL WHERE id = 'test-group-1';

  -- Remise à zéro des anciens paris
  PERFORM _assert(_pts('g-exact-win') = 0, 'Groupe – remise a 0 apres suppression score');

  PERFORM _bet('g-exact-draw', 'test-group-1', '00000000-0000-0000-0000-000000000001', 1, 1);
  PERFORM _bet('g-diff-draw',  'test-group-1', '00000000-0000-0000-0000-000000000002', 0, 0);  -- nul correct diff 2
  PERFORM _bet('g-wrong-draw', 'test-group-1', '00000000-0000-0000-0000-000000000001', 2, 0);  -- prono victoire sur nul

  UPDATE matches SET score_a = 1, score_b = 1 WHERE id = 'test-group-1';

  -- 1-1 exact  : 2+8+3+3+4 = 20  (nul correct = gagnant aussi)
  PERFORM _assert(_pts('g-exact-draw') = 20, 'Groupe – score exact nul = 20');
  -- 0-0        : 2+8+1+3+0 = 14  (diff=2, marge 0=0)
  PERFORM _assert(_pts('g-diff-draw')  = 14, 'Groupe – nul correct diff 2 = 14');
  -- 2-0        : 0
  PERFORM _assert(_pts('g-wrong-draw') = 0,  'Groupe – prono victoire sur nul = 0');
END $$;

-- ════════════════════════════════════════════════════════════
-- PHASE FINALE – victoire 90min
-- ════════════════════════════════════════════════════════════
DO $$
BEGIN
  PERFORM _bet('p-exact-win',  'test-playoff-1', '00000000-0000-0000-0000-000000000001', 2, 1, 'A');
  PERFORM _bet('p-wrong-win',  'test-playoff-1', '00000000-0000-0000-0000-000000000002', 1, 2, 'B');
  PERFORM _bet('p-margin-win', 'test-playoff-1', '00000000-0000-0000-0000-000000000001', 3, 2, 'A');

  UPDATE matches SET score_a = 2, score_b = 1, playoff_winner = 'A' WHERE id = 'test-playoff-1';

  -- 2-1 exact  : 20
  PERFORM _assert(_pts('p-exact-win') = 20,  'Playoff – victoire exacte 90min = 20');
  -- 1-2        : 0
  PERFORM _assert(_pts('p-wrong-win') = 0,   'Playoff – mauvais vainqueur 90min = 0');
  -- 3-2        : 2+8+1+3+0 = 14  (diff=1+1=2, marge 1=1)
  PERFORM _assert(_pts('p-margin-win') = 14, 'Playoff – bon vainqueur diff 2 meme marge = 14');
END $$;

-- ════════════════════════════════════════════════════════════
-- PHASE FINALE – nul 90min + vainqueur aux penalties
-- ════════════════════════════════════════════════════════════
DO $$
BEGIN
  UPDATE matches SET score_a = NULL, score_b = NULL, playoff_winner = NULL WHERE id = 'test-playoff-1';

  PERFORM _bet('p-draw-good', 'test-playoff-1', '00000000-0000-0000-0000-000000000001', 1, 1, 'A');  -- nul exact + bon vainqueur
  PERFORM _bet('p-draw-bad',  'test-playoff-1', '00000000-0000-0000-0000-000000000002', 1, 1, 'B');  -- nul exact + mauvais vainqueur
  PERFORM _bet('p-draw-diff', 'test-playoff-1', '00000000-0000-0000-0000-000000000001', 2, 2, 'A');  -- nul diff 2 + bon vainqueur
  -- Prono victoire A (2-0) sur un match qui finit 1-1 puis A gagne aux penalties.
  -- Résultat 90min faux → 0 résultat. Vainqueur effectif parié = A = réel → 8 gagnant.
  PERFORM _bet('p-draw-no90', 'test-playoff-1', '00000000-0000-0000-0000-000000000002', 2, 0, 'A');

  UPDATE matches SET score_a = 1, score_b = 1, playoff_winner = 'A' WHERE id = 'test-playoff-1';

  -- nul exact + bon vainqueur   : 2+8+3+3+4 = 20
  PERFORM _assert(_pts('p-draw-good') = 20, 'Playoff – nul exact + bon vainqueur penalties = 20');
  -- nul exact + mauvais vainqueur : 2+0+3+3+4 = 12
  PERFORM _assert(_pts('p-draw-bad')  = 12, 'Playoff – nul exact + mauvais vainqueur penalties = 12');
  -- nul diff 2 + bon vainqueur  : 2+8+1+3+0 = 14  (2-2 vs 1-1, diff=2, marge 0=0)
  PERFORM _assert(_pts('p-draw-diff') = 14, 'Playoff – nul diff 2 + bon vainqueur penalties = 14');
  -- prono victoire A (2-0), réel nul + A gagne → résultat 90min faux mais bon vainqueur : 0+8 = 8
  PERFORM _assert(_pts('p-draw-no90') = 8,  'Playoff – prono victoire A sur nul + A gagne = 8 (gagnant seul)');
END $$;

-- ════════════════════════════════════════════════════════════
-- Recalcul à la mise à jour de playoff_winner seul
-- ════════════════════════════════════════════════════════════
DO $$
BEGIN
  UPDATE matches SET score_a = NULL, score_b = NULL, playoff_winner = NULL WHERE id = 'test-playoff-1';

  PERFORM _bet('p-pw-update', 'test-playoff-1', '00000000-0000-0000-0000-000000000001', 0, 0, 'A');

  -- Pose le score mais pas encore le vainqueur
  UPDATE matches SET score_a = 0, score_b = 0 WHERE id = 'test-playoff-1';
  PERFORM _assert(_pts('p-pw-update') = 12, 'Playoff – 0-0 sans playoff_winner = 12');

  -- Maintenant on ajoute le bon vainqueur → doit recalculer à 20
  UPDATE matches SET playoff_winner = 'A' WHERE id = 'test-playoff-1';
  PERFORM _assert(_pts('p-pw-update') = 20, 'Playoff – recalcul apres maj playoff_winner = 20');
END $$;

-- ════════════════════════════════════════════════════════════
-- PHASE FINALE – gagnant indépendant du résultat 90min
-- ════════════════════════════════════════════════════════════
DO $$
BEGIN
  UPDATE matches SET score_a = NULL, score_b = NULL, playoff_winner = NULL WHERE id = 'test-playoff-1';

  -- Prono nul + bon vainqueur, mais réel est une victoire sèche → 0+8+0+0+0 = 8
  -- Real: 2-0 (A gagne à 90min). Bet: 1-1 (nul) + A gagne.
  -- Résultat 90min faux → 0 pts résultat/prox/écart/bonus.
  -- Mais vainqueur effectif parié = A (via bet_playoff_winner), réel = A → 8 pts gagnant.
  PERFORM _bet('p-draw-bet-real-win', 'test-playoff-1', '00000000-0000-0000-0000-000000000001', 1, 1, 'A');
  UPDATE matches SET score_a = 2, score_b = 0, playoff_winner = 'A' WHERE id = 'test-playoff-1';
  PERFORM _assert(_pts('p-draw-bet-real-win') = 8, 'Playoff – prono nul + bon vainqueur sur victoire reelle = 8');

  -- Prono victoire A + real nul + A gagne aux penaltys → 0+8+0+0+0 = 8
  -- Real: 1-1 puis A gagne. Bet: 2-0 (victoire A).
  -- Résultat 90min faux → 0 résultat. Vainqueur effectif parié = A, réel = A → 8 pts.
  UPDATE matches SET score_a = NULL, score_b = NULL, playoff_winner = NULL WHERE id = 'test-playoff-1';
  PERFORM _bet('p-win-bet-real-draw', 'test-playoff-1', '00000000-0000-0000-0000-000000000002', 2, 0, 'A');
  UPDATE matches SET score_a = 1, score_b = 1, playoff_winner = 'A' WHERE id = 'test-playoff-1';
  PERFORM _assert(_pts('p-win-bet-real-draw') = 8, 'Playoff – prono victoire A sur nul + A gagne penaltys = 8');

  -- Prono nul + mauvais vainqueur, réel est victoire → 0 pts
  UPDATE matches SET score_a = NULL, score_b = NULL, playoff_winner = NULL WHERE id = 'test-playoff-1';
  PERFORM _bet('p-draw-wrong-winner', 'test-playoff-1', '00000000-0000-0000-0000-000000000001', 1, 1, 'B');
  UPDATE matches SET score_a = 2, score_b = 0, playoff_winner = 'A' WHERE id = 'test-playoff-1';
  PERFORM _assert(_pts('p-draw-wrong-winner') = 0, 'Playoff – prono nul + mauvais vainqueur sur victoire reelle = 0');
END $$;

-- ── Vérification du score de competition_profiles ──────────
DO $$
DECLARE s INTEGER;
BEGIN
  SELECT score INTO s FROM competition_profiles
  WHERE user_id = '00000000-0000-0000-0000-000000000001'
    AND competition_id = 'aaaaaaaa-0000-0000-0000-000000000001';
  PERFORM _assert(s > 0, 'competition_profiles.score mis a jour par le trigger');
END $$;

ALTER TABLE bets ENABLE TRIGGER prevent_late_bets;

DO $$ BEGIN RAISE NOTICE ''; END $$;
DO $$ BEGIN RAISE NOTICE 'Tous les tests sont passes.'; END $$;

ROLLBACK;
