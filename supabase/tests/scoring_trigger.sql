-- ============================================================
-- Tests du trigger calculate_match_scores
-- Exécution : psql <url> -f supabase/tests/scoring_trigger.sql
-- Tout s'exécute dans une transaction → ROLLBACK final.
--
-- Un pari par match sur les scénarios « base » : un seul prono valide
-- sur le match → cote = 1, puis application du multiplicateur de phase.
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

CREATE OR REPLACE FUNCTION _outcome(p_id TEXT) RETURNS public.bet_outcome_status AS $$
  SELECT outcome_status FROM bets WHERE id = p_id;
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
  INSERT INTO matches (id, competition_id, team_a, team_b, tournament_phase, bet_format) VALUES
    ('g-exact-win-m',  'aaaaaaaa-0000-0000-0000-000000000001', 'cl-arsenal', 'cl-psg', 'group', 'regulation_1x2'),
    ('g-diff2-win-m',  'aaaaaaaa-0000-0000-0000-000000000001', 'cl-arsenal', 'cl-psg', 'group', 'regulation_1x2'),
    ('g-margin-win-m', 'aaaaaaaa-0000-0000-0000-000000000001', 'cl-arsenal', 'cl-psg', 'group', 'regulation_1x2'),
    ('g-wrong-win-m',  'aaaaaaaa-0000-0000-0000-000000000001', 'cl-arsenal', 'cl-psg', 'group', 'regulation_1x2'),
    ('g-far-win-m',    'aaaaaaaa-0000-0000-0000-000000000001', 'cl-arsenal', 'cl-psg', 'group', 'regulation_1x2');

  PERFORM _bet('g-exact-win',  'g-exact-win-m',  '00000000-0000-0000-0000-000000000001', 3, 0);
  PERFORM _bet('g-diff2-win',  'g-diff2-win-m',  '00000000-0000-0000-0000-000000000002', 2, 1);
  PERFORM _bet('g-margin-win', 'g-margin-win-m', '00000000-0000-0000-0000-000000000001', 4, 1);
  PERFORM _bet('g-wrong-win',  'g-wrong-win-m',  '00000000-0000-0000-0000-000000000002', 0, 2);
  PERFORM _bet('g-far-win',    'g-far-win-m',    '00000000-0000-0000-0000-000000000001', 4, 3);

  UPDATE matches SET score_a = 3, score_b = 0
  WHERE id IN ('g-exact-win-m', 'g-diff2-win-m', 'g-margin-win-m', 'g-wrong-win-m', 'g-far-win-m');

  PERFORM _assert(_pts('g-exact-win') = 15,  'Groupe – score exact victoire = 15');
  PERFORM _assert(_pts('g-diff2-win') = 9,   'Groupe – bon vainqueur diff 2 = 9');
  PERFORM _assert(_pts('g-margin-win') = 11, 'Groupe – bon vainqueur meme marge = 11');
  PERFORM _assert(_pts('g-wrong-win') = 0,   'Groupe – mauvais vainqueur = 0');
  PERFORM _assert(_pts('g-far-win') = 8,     'Groupe – diff 4 proximite=0 ecart=1 = 8');

  PERFORM _assert(_outcome('g-exact-win') = 'perfect_score'::public.bet_outcome_status, 'Groupe – statut score parfait');
  PERFORM _assert(_outcome('g-diff2-win') = 'good_result'::public.bet_outcome_status, 'Groupe – statut bon resultat (diff2)');
  PERFORM _assert(_outcome('g-wrong-win') = 'rate'::public.bet_outcome_status, 'Groupe – statut rate');
END $$;

-- ════════════════════════════════════════════════════════════
-- PHASE DE GROUPE – nul + remise à zéro
-- ════════════════════════════════════════════════════════════
DO $$
BEGIN
  UPDATE matches SET score_a = NULL, score_b = NULL
  WHERE id IN ('g-exact-win-m', 'g-diff2-win-m', 'g-margin-win-m', 'g-wrong-win-m', 'g-far-win-m');

  PERFORM _assert(_pts('g-exact-win') = 0, 'Groupe – remise a 0 apres suppression score');
  PERFORM _assert(_outcome('g-exact-win') IS NULL, 'Groupe – statut NULL apres suppression score');

  INSERT INTO matches (id, competition_id, team_a, team_b, tournament_phase, bet_format) VALUES
    ('g-exact-draw-m', 'aaaaaaaa-0000-0000-0000-000000000001', 'cl-arsenal', 'cl-psg', 'group', 'regulation_1x2'),
    ('g-diff-draw-m',  'aaaaaaaa-0000-0000-0000-000000000001', 'cl-arsenal', 'cl-psg', 'group', 'regulation_1x2'),
    ('g-wrong-draw-m', 'aaaaaaaa-0000-0000-0000-000000000001', 'cl-arsenal', 'cl-psg', 'group', 'regulation_1x2');

  PERFORM _bet('g-exact-draw', 'g-exact-draw-m', '00000000-0000-0000-0000-000000000001', 1, 1);
  PERFORM _bet('g-diff-draw',  'g-diff-draw-m',  '00000000-0000-0000-0000-000000000002', 0, 0);
  PERFORM _bet('g-wrong-draw', 'g-wrong-draw-m', '00000000-0000-0000-0000-000000000001', 2, 0);

  UPDATE matches SET score_a = 1, score_b = 1
  WHERE id IN ('g-exact-draw-m', 'g-diff-draw-m', 'g-wrong-draw-m');

  PERFORM _assert(_pts('g-exact-draw') = 15, 'Groupe – score exact nul = 15');
  PERFORM _assert(_pts('g-diff-draw')  = 11, 'Groupe – nul correct diff 2 = 11');
  PERFORM _assert(_pts('g-wrong-draw') = 0,  'Groupe – prono victoire sur nul = 0');
END $$;

-- ════════════════════════════════════════════════════════════
-- PHASE FINALE – victoire 90min
-- ════════════════════════════════════════════════════════════
DO $$
BEGIN
  INSERT INTO matches (id, competition_id, team_a, team_b, tournament_phase, bet_format) VALUES
    ('p-exact-win-m',  'aaaaaaaa-0000-0000-0000-000000000001', 'cl-arsenal', 'cl-psg', 'quarter_final', 'knockout_decider'),
    ('p-wrong-win-m',  'aaaaaaaa-0000-0000-0000-000000000001', 'cl-arsenal', 'cl-psg', 'quarter_final', 'knockout_decider'),
    ('p-margin-win-m', 'aaaaaaaa-0000-0000-0000-000000000001', 'cl-arsenal', 'cl-psg', 'quarter_final', 'knockout_decider');

  PERFORM _bet('p-exact-win',  'p-exact-win-m',  '00000000-0000-0000-0000-000000000001', 2, 1, 'A');
  PERFORM _bet('p-wrong-win',  'p-wrong-win-m',  '00000000-0000-0000-0000-000000000002', 1, 2, 'B');
  PERFORM _bet('p-margin-win', 'p-margin-win-m', '00000000-0000-0000-0000-000000000001', 3, 2, 'A');

  UPDATE matches SET score_a = 2, score_b = 1, playoff_winner = 'A'
  WHERE id IN ('p-exact-win-m', 'p-wrong-win-m', 'p-margin-win-m');

  PERFORM _assert(_pts('p-exact-win') = 60,  'Playoff – victoire exacte 90min = 60');
  PERFORM _assert(_pts('p-wrong-win') = 0,   'Playoff – mauvais vainqueur 90min = 0');
  PERFORM _assert(_pts('p-margin-win') = 42, 'Playoff – bon vainqueur diff 2 meme marge = 42');
END $$;

-- ════════════════════════════════════════════════════════════
-- PHASE FINALE – nul 90min + vainqueur aux penalties
-- ════════════════════════════════════════════════════════════
DO $$
BEGIN
  INSERT INTO matches (id, competition_id, team_a, team_b, tournament_phase, bet_format) VALUES
    ('p-draw-good-m', 'aaaaaaaa-0000-0000-0000-000000000001', 'cl-arsenal', 'cl-psg', 'quarter_final', 'knockout_decider'),
    ('p-draw-bad-m',  'aaaaaaaa-0000-0000-0000-000000000001', 'cl-arsenal', 'cl-psg', 'quarter_final', 'knockout_decider'),
    ('p-draw-diff-m', 'aaaaaaaa-0000-0000-0000-000000000001', 'cl-arsenal', 'cl-psg', 'quarter_final', 'knockout_decider'),
    ('p-draw-no90-m', 'aaaaaaaa-0000-0000-0000-000000000001', 'cl-arsenal', 'cl-psg', 'quarter_final', 'knockout_decider');

  PERFORM _bet('p-draw-good', 'p-draw-good-m', '00000000-0000-0000-0000-000000000001', 1, 1, 'A');
  PERFORM _bet('p-draw-bad',  'p-draw-bad-m',  '00000000-0000-0000-0000-000000000002', 1, 1, 'B');
  PERFORM _bet('p-draw-diff', 'p-draw-diff-m', '00000000-0000-0000-0000-000000000001', 2, 2, 'A');
  PERFORM _bet('p-draw-no90', 'p-draw-no90-m', '00000000-0000-0000-0000-000000000002', 2, 0, 'A');

  UPDATE matches SET score_a = 1, score_b = 1, playoff_winner = 'A'
  WHERE id IN ('p-draw-good-m', 'p-draw-bad-m', 'p-draw-diff-m', 'p-draw-no90-m');

  PERFORM _assert(_pts('p-draw-good') = 60, 'Playoff – nul exact + bon vainqueur penalties = 60');
  PERFORM _assert(_pts('p-draw-bad')  = 36, 'Playoff – nul exact + mauvais vainqueur penalties = 36');
  PERFORM _assert(_pts('p-draw-diff') = 42, 'Playoff – nul diff 2 + bon vainqueur penalties = 42');
  PERFORM _assert(_pts('p-draw-no90') = 24, 'Playoff – mauvais resultat + bon gagnant, sans proximite ni ecart = 24');
END $$;

-- ════════════════════════════════════════════════════════════
-- Recalcul à la mise à jour de playoff_winner seul
-- ════════════════════════════════════════════════════════════
DO $$
BEGIN
  INSERT INTO matches (id, competition_id, team_a, team_b, tournament_phase, bet_format) VALUES
    ('p-pw-update-m', 'aaaaaaaa-0000-0000-0000-000000000001', 'cl-arsenal', 'cl-psg', 'quarter_final', 'knockout_decider');

  PERFORM _bet('p-pw-update', 'p-pw-update-m', '00000000-0000-0000-0000-000000000001', 0, 0, 'A');

  UPDATE matches SET score_a = 0, score_b = 0, playoff_winner = NULL WHERE id = 'p-pw-update-m';
  PERFORM _assert(_pts('p-pw-update') = 36, 'Playoff – 0-0 sans playoff_winner = 36');

  UPDATE matches SET playoff_winner = 'A' WHERE id = 'p-pw-update-m';
  PERFORM _assert(_pts('p-pw-update') = 60, 'Playoff – recalcul apres maj playoff_winner = 60');
END $$;

-- ════════════════════════════════════════════════════════════
-- PHASE FINALE – gagnant indépendant du résultat 90min
-- ════════════════════════════════════════════════════════════
DO $$
BEGIN
  INSERT INTO matches (id, competition_id, team_a, team_b, tournament_phase, bet_format) VALUES
    ('p-draw-bet-real-win-m', 'aaaaaaaa-0000-0000-0000-000000000001', 'cl-arsenal', 'cl-psg', 'quarter_final', 'knockout_decider'),
    ('p-win-bet-real-draw-m', 'aaaaaaaa-0000-0000-0000-000000000001', 'cl-arsenal', 'cl-psg', 'quarter_final', 'knockout_decider'),
    ('p-draw-wrong-winner-m', 'aaaaaaaa-0000-0000-0000-000000000001', 'cl-arsenal', 'cl-psg', 'quarter_final', 'knockout_decider');

  PERFORM _bet('p-draw-bet-real-win', 'p-draw-bet-real-win-m', '00000000-0000-0000-0000-000000000001', 1, 1, 'A');
  UPDATE matches SET score_a = 2, score_b = 0, playoff_winner = 'A' WHERE id = 'p-draw-bet-real-win-m';
  PERFORM _assert(_pts('p-draw-bet-real-win') = 24, 'Playoff – prono nul + bon vainqueur sur victoire reelle = 24');

  PERFORM _bet('p-win-bet-real-draw', 'p-win-bet-real-draw-m', '00000000-0000-0000-0000-000000000002', 2, 0, 'A');
  UPDATE matches SET score_a = 1, score_b = 1, playoff_winner = 'A' WHERE id = 'p-win-bet-real-draw-m';
  PERFORM _assert(_pts('p-win-bet-real-draw') = 24, 'Playoff – prono victoire A sur nul + A gagne penaltys = 24');

  PERFORM _bet('p-draw-wrong-winner', 'p-draw-wrong-winner-m', '00000000-0000-0000-0000-000000000001', 1, 1, 'B');
  UPDATE matches SET score_a = 2, score_b = 0, playoff_winner = 'A' WHERE id = 'p-draw-wrong-winner-m';
  PERFORM _assert(_pts('p-draw-wrong-winner') = 0, 'Playoff – prono nul + mauvais vainqueur sur victoire reelle = 0');
END $$;

-- ════════════════════════════════════════════════════════════
-- Multiplicateur : 2 paris même « issue » (victoire A) sur le même match
-- mult = exp(-(1)^(1/2)*2)*10 ≈ 1.35335, arrondi sur base*mult*0.75
-- ════════════════════════════════════════════════════════════
DO $$
DECLARE
  m NUMERIC;
BEGIN
  m := public.prediction_popularity_multiplier(2, 2);
  PERFORM _assert(ABS(m - 1.353352832366127) < 0.0001, 'Helper mult p=1');
  m := public.prediction_popularity_multiplier(4, 1);
  PERFORM _assert(ABS(m - 3.6787944117144233) < 0.0001, 'Helper mult p=0.25');

  INSERT INTO matches (id, competition_id, team_a, team_b, tournament_phase, bet_format) VALUES
    ('mult-2p-m', 'aaaaaaaa-0000-0000-0000-000000000001', 'cl-arsenal', 'cl-psg', 'group', 'regulation_1x2');

  PERFORM _bet('mult-exact', 'mult-2p-m', '00000000-0000-0000-0000-000000000001', 3, 0);
  PERFORM _bet('mult-diff',  'mult-2p-m', '00000000-0000-0000-0000-000000000002', 2, 1);

  UPDATE matches SET score_a = 3, score_b = 0 WHERE id = 'mult-2p-m';

  PERFORM _assert(_pts('mult-exact') = 20, 'Mult – score exact 20 * mult * 0.75 ≈ 20');
  PERFORM _assert(_pts('mult-diff')  = 12, 'Mult – base 12 * mult * 0.75 ≈ 12');
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
