-- ============================================================
-- Tests du trigger calculate_match_scores
-- Exécution : psql <url> -f supabase/tests/scoring_trigger.sql
-- Tout s'exécute dans une transaction → ROLLBACK final.
--
-- Un pari par match sur les scénarios « base » : un seul prono valide
-- sur le match → multiplicateur = 1 (comportement identique aux points de base).
-- ============================================================

BEGIN;

ALTER TABLE bets DISABLE TRIGGER prevent_late_bets;

INSERT INTO auth.users (id, email, encrypted_password, created_at, updated_at)
VALUES
  ('00000000-0000-0000-0000-000000000001', 'test1@test.com', '', now(), now()),
  ('00000000-0000-0000-0000-000000000002', 'test2@test.com', '', now(), now());

INSERT INTO competitions (id) VALUES ('aaaaaaaa-0000-0000-0000-000000000001');

INSERT INTO competition_profiles (user_id, competition_id, score)
VALUES
  ('00000000-0000-0000-0000-000000000001', 'aaaaaaaa-0000-0000-0000-000000000001', 0),
  ('00000000-0000-0000-0000-000000000002', 'aaaaaaaa-0000-0000-0000-000000000001', 0);

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
-- PHASE DE GROUPE – score exact victoire (1 pari / match)
-- ════════════════════════════════════════════════════════════
DO $$
BEGIN
  INSERT INTO matches (id, competition_id, team_a, team_b, phase) VALUES
    ('g-exact-win-m',  'aaaaaaaa-0000-0000-0000-000000000001', 'cl-arsenal', 'cl-psg', '0'),
    ('g-diff2-win-m',  'aaaaaaaa-0000-0000-0000-000000000001', 'cl-arsenal', 'cl-psg', '0'),
    ('g-margin-win-m', 'aaaaaaaa-0000-0000-0000-000000000001', 'cl-arsenal', 'cl-psg', '0'),
    ('g-wrong-win-m',  'aaaaaaaa-0000-0000-0000-000000000001', 'cl-arsenal', 'cl-psg', '0'),
    ('g-far-win-m',    'aaaaaaaa-0000-0000-0000-000000000001', 'cl-arsenal', 'cl-psg', '0');

  PERFORM _bet('g-exact-win',  'g-exact-win-m',  '00000000-0000-0000-0000-000000000001', 3, 0);
  PERFORM _bet('g-diff2-win',  'g-diff2-win-m',  '00000000-0000-0000-0000-000000000002', 2, 1);
  PERFORM _bet('g-margin-win', 'g-margin-win-m', '00000000-0000-0000-0000-000000000001', 4, 1);
  PERFORM _bet('g-wrong-win',  'g-wrong-win-m',  '00000000-0000-0000-0000-000000000002', 0, 2);
  PERFORM _bet('g-far-win',    'g-far-win-m',    '00000000-0000-0000-0000-000000000001', 4, 3);

  UPDATE matches SET score_a = 3, score_b = 0
  WHERE id IN ('g-exact-win-m', 'g-diff2-win-m', 'g-margin-win-m', 'g-wrong-win-m', 'g-far-win-m');

  PERFORM _assert(_pts('g-exact-win') = 20,  'Groupe – score exact victoire = 20');
  PERFORM _assert(_pts('g-diff2-win') = 11,  'Groupe – bon vainqueur diff 2 = 11');
  PERFORM _assert(_pts('g-margin-win') = 14, 'Groupe – bon vainqueur diff 2 meme marge = 14');
  PERFORM _assert(_pts('g-wrong-win') = 0,   'Groupe – mauvais vainqueur = 0');
  PERFORM _assert(_pts('g-far-win') = 10,    'Groupe – diff 4 proximite=0 = 10');
END $$;

-- ════════════════════════════════════════════════════════════
-- PHASE DE GROUPE – nul + remise à zéro
-- ════════════════════════════════════════════════════════════
DO $$
BEGIN
  UPDATE matches SET score_a = NULL, score_b = NULL
  WHERE id IN ('g-exact-win-m', 'g-diff2-win-m', 'g-margin-win-m', 'g-wrong-win-m', 'g-far-win-m');

  PERFORM _assert(_pts('g-exact-win') = 0, 'Groupe – remise a 0 apres suppression score');

  INSERT INTO matches (id, competition_id, team_a, team_b, phase) VALUES
    ('g-exact-draw-m', 'aaaaaaaa-0000-0000-0000-000000000001', 'cl-arsenal', 'cl-psg', '0'),
    ('g-diff-draw-m',  'aaaaaaaa-0000-0000-0000-000000000001', 'cl-arsenal', 'cl-psg', '0'),
    ('g-wrong-draw-m', 'aaaaaaaa-0000-0000-0000-000000000001', 'cl-arsenal', 'cl-psg', '0');

  PERFORM _bet('g-exact-draw', 'g-exact-draw-m', '00000000-0000-0000-0000-000000000001', 1, 1);
  PERFORM _bet('g-diff-draw',  'g-diff-draw-m',  '00000000-0000-0000-0000-000000000002', 0, 0);
  PERFORM _bet('g-wrong-draw', 'g-wrong-draw-m', '00000000-0000-0000-0000-000000000001', 2, 0);

  UPDATE matches SET score_a = 1, score_b = 1
  WHERE id IN ('g-exact-draw-m', 'g-diff-draw-m', 'g-wrong-draw-m');

  PERFORM _assert(_pts('g-exact-draw') = 20, 'Groupe – score exact nul = 20');
  PERFORM _assert(_pts('g-diff-draw')  = 14, 'Groupe – nul correct diff 2 = 14');
  PERFORM _assert(_pts('g-wrong-draw') = 0,  'Groupe – prono victoire sur nul = 0');
END $$;

-- ════════════════════════════════════════════════════════════
-- PHASE FINALE – victoire 90min
-- ════════════════════════════════════════════════════════════
DO $$
BEGIN
  INSERT INTO matches (id, competition_id, team_a, team_b, phase) VALUES
    ('p-exact-win-m',  'aaaaaaaa-0000-0000-0000-000000000001', 'cl-arsenal', 'cl-psg', '4'),
    ('p-wrong-win-m',  'aaaaaaaa-0000-0000-0000-000000000001', 'cl-arsenal', 'cl-psg', '4'),
    ('p-margin-win-m', 'aaaaaaaa-0000-0000-0000-000000000001', 'cl-arsenal', 'cl-psg', '4');

  PERFORM _bet('p-exact-win',  'p-exact-win-m',  '00000000-0000-0000-0000-000000000001', 2, 1, 'A');
  PERFORM _bet('p-wrong-win',  'p-wrong-win-m',  '00000000-0000-0000-0000-000000000002', 1, 2, 'B');
  PERFORM _bet('p-margin-win', 'p-margin-win-m', '00000000-0000-0000-0000-000000000001', 3, 2, 'A');

  UPDATE matches SET score_a = 2, score_b = 1, playoff_winner = 'A'
  WHERE id IN ('p-exact-win-m', 'p-wrong-win-m', 'p-margin-win-m');

  PERFORM _assert(_pts('p-exact-win') = 20,  'Playoff – victoire exacte 90min = 20');
  PERFORM _assert(_pts('p-wrong-win') = 0,   'Playoff – mauvais vainqueur 90min = 0');
  PERFORM _assert(_pts('p-margin-win') = 14, 'Playoff – bon vainqueur diff 2 meme marge = 14');
END $$;

-- ════════════════════════════════════════════════════════════
-- PHASE FINALE – nul 90min + vainqueur aux penalties
-- ════════════════════════════════════════════════════════════
DO $$
BEGIN
  INSERT INTO matches (id, competition_id, team_a, team_b, phase) VALUES
    ('p-draw-good-m', 'aaaaaaaa-0000-0000-0000-000000000001', 'cl-arsenal', 'cl-psg', '4'),
    ('p-draw-bad-m',  'aaaaaaaa-0000-0000-0000-000000000001', 'cl-arsenal', 'cl-psg', '4'),
    ('p-draw-diff-m', 'aaaaaaaa-0000-0000-0000-000000000001', 'cl-arsenal', 'cl-psg', '4'),
    ('p-draw-no90-m', 'aaaaaaaa-0000-0000-0000-000000000001', 'cl-arsenal', 'cl-psg', '4');

  PERFORM _bet('p-draw-good', 'p-draw-good-m', '00000000-0000-0000-0000-000000000001', 1, 1, 'A');
  PERFORM _bet('p-draw-bad',  'p-draw-bad-m',  '00000000-0000-0000-0000-000000000002', 1, 1, 'B');
  PERFORM _bet('p-draw-diff', 'p-draw-diff-m', '00000000-0000-0000-0000-000000000001', 2, 2, 'A');
  PERFORM _bet('p-draw-no90', 'p-draw-no90-m', '00000000-0000-0000-0000-000000000002', 2, 0, 'A');

  UPDATE matches SET score_a = 1, score_b = 1, playoff_winner = 'A'
  WHERE id IN ('p-draw-good-m', 'p-draw-bad-m', 'p-draw-diff-m', 'p-draw-no90-m');

  PERFORM _assert(_pts('p-draw-good') = 20, 'Playoff – nul exact + bon vainqueur penalties = 20');
  PERFORM _assert(_pts('p-draw-bad')  = 12, 'Playoff – nul exact + mauvais vainqueur penalties = 12');
  PERFORM _assert(_pts('p-draw-diff') = 14, 'Playoff – nul diff 2 + bon vainqueur penalties = 14');
  PERFORM _assert(_pts('p-draw-no90') = 8,  'Playoff – prono victoire A sur nul + A gagne = 8');
END $$;

-- ════════════════════════════════════════════════════════════
-- Recalcul à la mise à jour de playoff_winner seul
-- ════════════════════════════════════════════════════════════
DO $$
BEGIN
  INSERT INTO matches (id, competition_id, team_a, team_b, phase) VALUES
    ('p-pw-update-m', 'aaaaaaaa-0000-0000-0000-000000000001', 'cl-arsenal', 'cl-psg', '4');

  PERFORM _bet('p-pw-update', 'p-pw-update-m', '00000000-0000-0000-0000-000000000001', 0, 0, 'A');

  UPDATE matches SET score_a = 0, score_b = 0, playoff_winner = NULL WHERE id = 'p-pw-update-m';
  PERFORM _assert(_pts('p-pw-update') = 12, 'Playoff – 0-0 sans playoff_winner = 12');

  UPDATE matches SET playoff_winner = 'A' WHERE id = 'p-pw-update-m';
  PERFORM _assert(_pts('p-pw-update') = 20, 'Playoff – recalcul apres maj playoff_winner = 20');
END $$;

-- ════════════════════════════════════════════════════════════
-- PHASE FINALE – gagnant indépendant du résultat 90min
-- ════════════════════════════════════════════════════════════
DO $$
BEGIN
  INSERT INTO matches (id, competition_id, team_a, team_b, phase) VALUES
    ('p-draw-bet-real-win-m', 'aaaaaaaa-0000-0000-0000-000000000001', 'cl-arsenal', 'cl-psg', '4'),
    ('p-win-bet-real-draw-m', 'aaaaaaaa-0000-0000-0000-000000000001', 'cl-arsenal', 'cl-psg', '4'),
    ('p-draw-wrong-winner-m', 'aaaaaaaa-0000-0000-0000-000000000001', 'cl-arsenal', 'cl-psg', '4');

  PERFORM _bet('p-draw-bet-real-win', 'p-draw-bet-real-win-m', '00000000-0000-0000-0000-000000000001', 1, 1, 'A');
  UPDATE matches SET score_a = 2, score_b = 0, playoff_winner = 'A' WHERE id = 'p-draw-bet-real-win-m';
  PERFORM _assert(_pts('p-draw-bet-real-win') = 8, 'Playoff – prono nul + bon vainqueur sur victoire reelle = 8');

  PERFORM _bet('p-win-bet-real-draw', 'p-win-bet-real-draw-m', '00000000-0000-0000-0000-000000000002', 2, 0, 'A');
  UPDATE matches SET score_a = 1, score_b = 1, playoff_winner = 'A' WHERE id = 'p-win-bet-real-draw-m';
  PERFORM _assert(_pts('p-win-bet-real-draw') = 8, 'Playoff – prono victoire A sur nul + A gagne penaltys = 8');

  PERFORM _bet('p-draw-wrong-winner', 'p-draw-wrong-winner-m', '00000000-0000-0000-0000-000000000001', 1, 1, 'B');
  UPDATE matches SET score_a = 2, score_b = 0, playoff_winner = 'A' WHERE id = 'p-draw-wrong-winner-m';
  PERFORM _assert(_pts('p-draw-wrong-winner') = 0, 'Playoff – prono nul + mauvais vainqueur sur victoire reelle = 0');
END $$;

-- ════════════════════════════════════════════════════════════
-- Multiplicateur : 2 paris même « issue » (victoire A) sur le même match
-- mult = exp(-1^2*2)*10 ≈ 1.35335, arrondi sur base*mult
-- ════════════════════════════════════════════════════════════
DO $$
DECLARE
  m NUMERIC;
BEGIN
  m := public.prediction_popularity_multiplier(2, 2);
  PERFORM _assert(ABS(m - 1.353352832366127) < 0.0001, 'Helper mult p=1');

  INSERT INTO matches (id, competition_id, team_a, team_b, phase) VALUES
    ('mult-2p-m', 'aaaaaaaa-0000-0000-0000-000000000001', 'cl-arsenal', 'cl-psg', '0');

  PERFORM _bet('mult-exact', 'mult-2p-m', '00000000-0000-0000-0000-000000000001', 3, 0);
  PERFORM _bet('mult-diff',  'mult-2p-m', '00000000-0000-0000-0000-000000000002', 2, 1);

  UPDATE matches SET score_a = 3, score_b = 0 WHERE id = 'mult-2p-m';

  PERFORM _assert(_pts('mult-exact') = 27, 'Mult – score exact 20 * mult ≈ 27');
  PERFORM _assert(_pts('mult-diff')  = 15, 'Mult – base 11 * mult ≈ 15');
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
