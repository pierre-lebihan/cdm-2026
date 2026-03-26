-- ================================================================
-- Multi-competition support
-- Adds competition_id to matches, teams, bets
-- Creates competition_profiles for per-competition scores
-- Migrates existing data to first competition
-- ================================================================

-- 1. Enrich competitions table
ALTER TABLE competitions
  ADD COLUMN IF NOT EXISTS name TEXT NOT NULL DEFAULT 'Coupe du Monde 2026',
  ADD COLUMN IF NOT EXISTS active BOOLEAN NOT NULL DEFAULT false;

-- Mark existing competition as active
UPDATE competitions SET active = true WHERE active = false;

-- 2. Add competition_id to teams
ALTER TABLE teams ADD COLUMN IF NOT EXISTS competition_id UUID REFERENCES competitions(id);

-- Backfill existing teams with the first competition
UPDATE teams SET competition_id = (SELECT id FROM competitions LIMIT 1)
WHERE competition_id IS NULL;

-- 3. Add competition_id to matches
ALTER TABLE matches ADD COLUMN IF NOT EXISTS competition_id UUID REFERENCES competitions(id);

UPDATE matches SET competition_id = (SELECT id FROM competitions LIMIT 1)
WHERE competition_id IS NULL;

-- 4. Add competition_id to bets
ALTER TABLE bets ADD COLUMN IF NOT EXISTS competition_id UUID REFERENCES competitions(id);

UPDATE bets SET competition_id = (
  SELECT m.competition_id FROM matches m WHERE m.id = bets.match_id
)
WHERE competition_id IS NULL;

-- 5. Create competition_profiles (per-competition score + winner_team)
CREATE TABLE IF NOT EXISTS competition_profiles (
  competition_id UUID NOT NULL REFERENCES competitions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  score INTEGER NOT NULL DEFAULT 0,
  winner_team TEXT REFERENCES teams(id),
  PRIMARY KEY (competition_id, user_id)
);

-- Migrate existing profiles data into competition_profiles
INSERT INTO competition_profiles (competition_id, user_id, score, winner_team)
SELECT
  (SELECT id FROM competitions WHERE active = true LIMIT 1),
  p.id,
  COALESCE(p.score, 0),
  p.winner_team
FROM profiles p
ON CONFLICT (competition_id, user_id) DO NOTHING;

-- 6–7. Recreate views: CREATE OR REPLACE cannot insert new columns inside m.* / b.*
-- (e.g. competition_id on matches) without breaking column order vs existing view.
DROP VIEW IF EXISTS ranking CASCADE;
DROP VIEW IF EXISTS bets_with_profiles CASCADE;
DROP VIEW IF EXISTS matches_with_teams CASCADE;

CREATE VIEW matches_with_teams AS
SELECT
  m.*,
  ta.name  AS team_a_name,
  ta.code  AS team_a_code,
  tb.name  AS team_b_name,
  tb.code  AS team_b_code,
  ta.group_name AS group_name
FROM matches m
LEFT JOIN teams ta ON m.team_a = ta.id
LEFT JOIN teams tb ON m.team_b = tb.id;

CREATE VIEW bets_with_profiles AS
SELECT
  b.*,
  p.display_name AS user_display_name,
  p.avatar_url   AS user_avatar_url
FROM bets b
LEFT JOIN profiles p ON b.user_id = p.id;

CREATE VIEW ranking AS
SELECT
  cp.competition_id,
  p.id,
  p.display_name,
  p.avatar_url,
  cp.score,
  cp.winner_team,
  t.name AS winner_team_name,
  t.code AS winner_team_code,
  RANK() OVER (PARTITION BY cp.competition_id ORDER BY cp.score DESC) AS rank
FROM competition_profiles cp
JOIN profiles p ON cp.user_id = p.id
LEFT JOIN teams t ON cp.winner_team = t.id;

-- 8. Update calculate_match_scores trigger
CREATE OR REPLACE FUNCTION calculate_match_scores()
RETURNS TRIGGER AS $$
DECLARE
  bet_row RECORD;
  real_result TEXT;
  bet_result TEXT;
  odd_bet NUMERIC;
  goals_diff INTEGER;
  phase_mult INTEGER;
  points INTEGER;
  old_points INTEGER;
  v_competition_id UUID;
BEGIN
  IF (NEW.score_a IS NOT DISTINCT FROM OLD.score_a)
     AND (NEW.score_b IS NOT DISTINCT FROM OLD.score_b) THEN
    RETURN NEW;
  END IF;

  v_competition_id := NEW.competition_id;

  -- Score cleared: revert all points for this match
  IF (NEW.score_a IS NULL OR NEW.score_b IS NULL)
     AND (OLD.score_a IS NOT NULL AND OLD.score_b IS NOT NULL) THEN
    FOR bet_row IN SELECT * FROM bets WHERE match_id = NEW.id LOOP
      old_points := COALESCE(bet_row.points_won, 0);
      UPDATE bets SET points_won = 0 WHERE id = bet_row.id;
      UPDATE competition_profiles
      SET score = COALESCE(score, 0) - old_points
      WHERE user_id = bet_row.user_id AND competition_id = v_competition_id;
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

  phase_mult := CASE COALESCE(NEW.phase, '0')
    WHEN '0' THEN 1
    WHEN '4' THEN 2
    WHEN '2' THEN 4
    WHEN '3' THEN 6
    WHEN '1' THEN 10
    ELSE 1
  END;

  FOR bet_row IN SELECT * FROM bets WHERE match_id = NEW.id LOOP
    old_points := COALESCE(bet_row.points_won, 0);

    bet_result := CASE
      WHEN bet_row.bet_team_a > bet_row.bet_team_b THEN 'A'
      WHEN bet_row.bet_team_a = bet_row.bet_team_b THEN 'N'
      ELSE 'B'
    END;

    IF bet_result != real_result THEN
      points := 0;
    ELSE
      odd_bet := CASE bet_result
        WHEN 'A' THEN COALESCE(NEW.odds_a, 0)
        WHEN 'N' THEN COALESCE(NEW.odds_draw, 0)
        WHEN 'B' THEN COALESCE(NEW.odds_b, 0)
      END;

      goals_diff := ABS(NEW.score_a - bet_row.bet_team_a)
                  + ABS(NEW.score_b - bet_row.bet_team_b);

      points := GREATEST(ROUND((odd_bet - goals_diff) * phase_mult), 0);
    END IF;

    UPDATE bets SET points_won = points WHERE id = bet_row.id;

    -- Upsert into competition_profiles (create row if user hasn't one yet)
    INSERT INTO competition_profiles (competition_id, user_id, score)
    VALUES (v_competition_id, bet_row.user_id, points)
    ON CONFLICT (competition_id, user_id)
    DO UPDATE SET score = competition_profiles.score - old_points + points;
  END LOOP;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. RLS for competition_profiles
ALTER TABLE competition_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "competition_profiles_select_authenticated" ON competition_profiles;
DROP POLICY IF EXISTS "competition_profiles_insert_own" ON competition_profiles;
DROP POLICY IF EXISTS "competition_profiles_update_own" ON competition_profiles;
DROP POLICY IF EXISTS "competition_profiles_admin_all" ON competition_profiles;

CREATE POLICY "competition_profiles_select_authenticated" ON competition_profiles
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "competition_profiles_insert_own" ON competition_profiles
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

CREATE POLICY "competition_profiles_update_own" ON competition_profiles
  FOR UPDATE TO authenticated USING (user_id = auth.uid());

CREATE POLICY "competition_profiles_admin_all" ON competition_profiles
  FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());

ALTER VIEW matches_with_teams SET (security_invoker = true);
ALTER VIEW bets_with_profiles SET (security_invoker = true);
ALTER VIEW ranking SET (security_invoker = true);
