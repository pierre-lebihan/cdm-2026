-- Per-match visibility (hidden matches: no listing, no bets for non-admins).
-- LDC 2024-25: quarts (tirage réel avril 2026), demi-finales et finale créées mais masquées.

ALTER TABLE matches
  ADD COLUMN IF NOT EXISTS visible_to_users BOOLEAN NOT NULL DEFAULT true;

DROP POLICY IF EXISTS "matches_select_all" ON matches;
CREATE POLICY "matches_select_visible_or_admin" ON matches
  FOR SELECT TO anon, authenticated
  USING (COALESCE(visible_to_users, true) OR public.is_admin());

DROP POLICY IF EXISTS "bets_insert_own" ON bets;
CREATE POLICY "bets_insert_own" ON bets
  FOR INSERT TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    AND (
      public.is_admin()
      OR EXISTS (
        SELECT 1 FROM matches m
        WHERE m.id = match_id AND COALESCE(m.visible_to_users, true)
      )
    )
  );

DROP POLICY IF EXISTS "bets_update_own" ON bets;
CREATE POLICY "bets_update_own" ON bets
  FOR UPDATE TO authenticated
  USING (
    user_id = auth.uid()
    AND (
      public.is_admin()
      OR EXISTS (
        SELECT 1 FROM matches m
        WHERE m.id = match_id AND COALESCE(m.visible_to_users, true)
      )
    )
  )
  WITH CHECK (
    user_id = auth.uid()
    AND (
      public.is_admin()
      OR EXISTS (
        SELECT 1 FROM matches m
        WHERE m.id = match_id AND COALESCE(m.visible_to_users, true)
      )
    )
  );

CREATE OR REPLACE FUNCTION public.prevent_late_bets()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  match_start TIMESTAMPTZ;
  match_visible BOOLEAN;
BEGIN
  IF TG_OP = 'UPDATE'
     AND NEW.bet_team_a IS NOT DISTINCT FROM OLD.bet_team_a
     AND NEW.bet_team_b IS NOT DISTINCT FROM OLD.bet_team_b
     AND NEW.bet_playoff_winner IS NOT DISTINCT FROM OLD.bet_playoff_winner THEN
    RETURN NEW;
  END IF;

  IF public.is_admin() THEN
    RETURN NEW;
  END IF;

  SELECT date_time, COALESCE(visible_to_users, true)
  INTO match_start, match_visible
  FROM matches
  WHERE id = NEW.match_id;

  IF NOT COALESCE(match_visible, true) THEN
    RAISE EXCEPTION 'Ce match n''est pas ouvert aux pronostics';
  END IF;

  IF match_start IS NOT NULL AND match_start <= now() THEN
    RAISE EXCEPTION 'Les paris sont fermés pour ce match (déjà commencé)';
  END IF;

  RETURN NEW;
END;
$$;

WITH ldc AS (
  SELECT id FROM competitions WHERE name = 'Ligue des champions 2024-25' LIMIT 1
)
DELETE FROM bets
WHERE competition_id IN (SELECT id FROM ldc);

INSERT INTO teams (id, code, group_name, name, win_odd, elimination, unveiled, competition_id)
SELECT 'cl-tbd', 'tbd', 'Phase finale', 'À définir', NULL, false, true, c.id
FROM competitions c
WHERE c.name = 'Ligue des champions 2024-25'
  AND NOT EXISTS (SELECT 1 FROM teams WHERE id = 'cl-tbd')
LIMIT 1;

UPDATE teams SET
  code = 'sporting',
  name = 'Sporting CP',
  group_name = 'Quarts de finale',
  win_odd = 14.0
WHERE id = 'cl-astonvilla';

UPDATE teams SET
  code = 'atletico',
  name = 'Atlético Madrid',
  group_name = 'Quarts de finale',
  win_odd = 11.0
WHERE id = 'cl-dortmund';

UPDATE teams SET
  code = 'liv',
  name = 'Liverpool FC',
  group_name = 'Quarts de finale',
  win_odd = 8.5
WHERE id = 'cl-inter';

UPDATE matches SET
  date_time = TIMESTAMPTZ '2026-04-07 20:00:00+00',
  city = 'Madrid',
  team_a = 'cl-realmadrid',
  team_b = 'cl-bayern',
  phase = '4',
  visible_to_users = true,
  odds_a = 2.15,
  odds_b = 3.10,
  odds_draw = 3.35
WHERE id = 'ucl25-qf1-l1';

UPDATE matches SET
  date_time = TIMESTAMPTZ '2026-04-15 20:00:00+00',
  city = 'Munich',
  team_a = 'cl-bayern',
  team_b = 'cl-realmadrid',
  phase = '4',
  visible_to_users = true,
  odds_a = 2.20,
  odds_b = 3.05,
  odds_draw = 3.30
WHERE id = 'ucl25-qf1-l2';

UPDATE matches SET
  date_time = TIMESTAMPTZ '2026-04-07 20:00:00+00',
  city = 'Lisbonne',
  team_a = 'cl-astonvilla',
  team_b = 'cl-arsenal',
  phase = '4',
  visible_to_users = true,
  odds_a = 3.40,
  odds_b = 2.05,
  odds_draw = 3.50
WHERE id = 'ucl25-qf2-l1';

UPDATE matches SET
  date_time = TIMESTAMPTZ '2026-04-15 20:00:00+00',
  city = 'Londres',
  team_a = 'cl-arsenal',
  team_b = 'cl-astonvilla',
  phase = '4',
  visible_to_users = true,
  odds_a = 1.55,
  odds_b = 4.80,
  odds_draw = 4.00
WHERE id = 'ucl25-qf2-l2';

UPDATE matches SET
  date_time = TIMESTAMPTZ '2026-04-08 20:00:00+00',
  city = 'Barcelone',
  team_a = 'cl-barcelona',
  team_b = 'cl-dortmund',
  phase = '4',
  visible_to_users = true,
  odds_a = 1.85,
  odds_b = 3.90,
  odds_draw = 3.70
WHERE id = 'ucl25-qf3-l1';

UPDATE matches SET
  date_time = TIMESTAMPTZ '2026-04-14 20:00:00+00',
  city = 'Madrid',
  team_a = 'cl-dortmund',
  team_b = 'cl-barcelona',
  phase = '4',
  visible_to_users = true,
  odds_a = 3.20,
  odds_b = 2.10,
  odds_draw = 3.50
WHERE id = 'ucl25-qf3-l2';

UPDATE matches SET
  date_time = TIMESTAMPTZ '2026-04-08 20:00:00+00',
  city = 'Paris',
  team_a = 'cl-psg',
  team_b = 'cl-inter',
  phase = '4',
  visible_to_users = true,
  odds_a = 1.95,
  odds_b = 3.60,
  odds_draw = 3.80
WHERE id = 'ucl25-qf4-l1';

UPDATE matches SET
  date_time = TIMESTAMPTZ '2026-04-14 20:00:00+00',
  city = 'Liverpool',
  team_a = 'cl-inter',
  team_b = 'cl-psg',
  phase = '4',
  visible_to_users = true,
  odds_a = 2.85,
  odds_b = 2.35,
  odds_draw = 3.45
WHERE id = 'ucl25-qf4-l2';

WITH ldc AS (
  SELECT id FROM competitions WHERE name = 'Ligue des champions 2024-25' LIMIT 1
)
INSERT INTO matches (
  id,
  date_time,
  city,
  team_a,
  team_b,
  streaming,
  score_a,
  score_b,
  odds_a,
  odds_b,
  odds_draw,
  phase,
  finished,
  api_id,
  competition_id,
  visible_to_users
)
SELECT
  m.id,
  m.date_time::timestamptz,
  m.city,
  m.team_a,
  m.team_b,
  NULL::text,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  m.phase,
  false,
  NULL,
  ldc.id,
  false
FROM ldc
CROSS JOIN (
  VALUES
    ('ucl25-sf1-l1', '2026-04-28 20:00:00+00', NULL::text, 'cl-tbd', 'cl-tbd', '2'),
    ('ucl25-sf1-l2', '2026-04-29 20:00:00+00', NULL::text, 'cl-tbd', 'cl-tbd', '2'),
    ('ucl25-sf2-l1', '2026-05-05 20:00:00+00', NULL::text, 'cl-tbd', 'cl-tbd', '2'),
    ('ucl25-sf2-l2', '2026-05-06 20:00:00+00', NULL::text, 'cl-tbd', 'cl-tbd', '2'),
    ('ucl25-final', '2026-05-30 17:00:00+00', NULL::text, 'cl-tbd', 'cl-tbd', '1')
) AS m(id, date_time, city, team_a, team_b, phase)
ON CONFLICT (id) DO UPDATE SET
  date_time = EXCLUDED.date_time,
  team_a = EXCLUDED.team_a,
  team_b = EXCLUDED.team_b,
  phase = EXCLUDED.phase,
  visible_to_users = EXCLUDED.visible_to_users;

UPDATE competitions SET
  start_date = TIMESTAMPTZ '2026-04-07 20:00:00+00'
WHERE name = 'Ligue des champions 2024-25';
