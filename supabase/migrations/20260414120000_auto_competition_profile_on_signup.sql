-- ================================================================
-- Fix: users who sign up after competition_profiles bulk insert
-- are not visible in the ranking.
--
-- 1. Backfill any profiles missing a competition_profiles entry
--    for the currently active competition.
-- 2. Add a trigger on profiles so every new signup automatically
--    gets a competition_profiles row for every active competition.
-- ================================================================

-- 1. Backfill missing entries
INSERT INTO competition_profiles (competition_id, user_id, score)
SELECT c.id, p.id, 0
FROM competitions c
CROSS JOIN profiles p
WHERE c.active = true
ON CONFLICT (competition_id, user_id) DO NOTHING;

-- 2. Trigger function: create competition_profiles on new profile
CREATE OR REPLACE FUNCTION handle_new_profile()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO competition_profiles (competition_id, user_id, score)
  SELECT c.id, NEW.id, 0
  FROM competitions c
  WHERE c.active = true
  ON CONFLICT (competition_id, user_id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_profile_created ON profiles;
CREATE TRIGGER on_profile_created
  AFTER INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_profile();
