-- Add playoff winner columns for knockout rounds where a match can be level
-- at 90 min then decided by extra time / penalties.
--
-- matches.playoff_winner : 'A' or 'B' — the team that ultimately won the match
--   (filled only for knockout matches, NULL for group stage or if not yet played)
--
-- bets.bet_playoff_winner : 'A' or 'B' — the team the user bets will win the match
--   (only relevant for knockout matches)

ALTER TABLE matches ADD COLUMN IF NOT EXISTS playoff_winner TEXT
  CHECK (playoff_winner IN ('A', 'B'));

ALTER TABLE bets ADD COLUMN IF NOT EXISTS bet_playoff_winner TEXT
  CHECK (bet_playoff_winner IN ('A', 'B'));
