-- Active competition: Ligue des champions 2024-25, quarts de finale (8 équipes, 8 matchs aller-retour)

INSERT INTO competitions (name, launch_bet, start_date, active)
SELECT
  'Ligue des champions 2024-25',
  TIMESTAMPTZ '2025-03-01 00:00:00+00',
  TIMESTAMPTZ '2025-04-08 19:00:00+00',
  false
WHERE NOT EXISTS (
  SELECT 1 FROM competitions WHERE name = 'Ligue des champions 2024-25'
);

UPDATE competitions SET active = (name = 'Ligue des champions 2024-25');

DELETE FROM bets
WHERE competition_id = (
  SELECT id FROM competitions WHERE name = 'Ligue des champions 2024-25' LIMIT 1
);

DELETE FROM matches
WHERE competition_id = (
  SELECT id FROM competitions WHERE name = 'Ligue des champions 2024-25' LIMIT 1
);

DELETE FROM teams
WHERE competition_id = (
  SELECT id FROM competitions WHERE name = 'Ligue des champions 2024-25' LIMIT 1
);

WITH ldc AS (
  SELECT id FROM competitions WHERE name = 'Ligue des champions 2024-25' LIMIT 1
)
INSERT INTO teams (id, code, group_name, name, win_odd, elimination, unveiled, competition_id)
SELECT v.id, v.code, v.group_name, v.name, NULL, false, true, ldc.id
FROM ldc
CROSS JOIN (
  VALUES
    ('cl-arsenal', 'ars', 'Quarts de finale', 'Arsenal'),
    ('cl-realmadrid', 'rma', 'Quarts de finale', 'Real Madrid'),
    ('cl-psg', 'psg', 'Quarts de finale', 'Paris Saint-Germain'),
    ('cl-astonvilla', 'avl', 'Quarts de finale', 'Aston Villa'),
    ('cl-barcelona', 'bar', 'Quarts de finale', 'FC Barcelone'),
    ('cl-dortmund', 'dort', 'Quarts de finale', 'Borussia Dortmund'),
    ('cl-bayern', 'bay', 'Quarts de finale', 'Bayern Munich'),
    ('cl-inter', 'it', 'Quarts de finale', 'Inter Milan')
) AS v(id, code, group_name, name);

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
  competition_id
)
SELECT
  m.id,
  m.date_time::timestamptz,
  m.city,
  m.team_a,
  m.team_b,
  m.streaming,
  NULL,
  NULL,
  m.odds_a,
  m.odds_b,
  m.odds_draw,
  m.phase,
  false,
  NULL,
  ldc.id
FROM ldc
CROSS JOIN (
  VALUES
    (
      'ucl25-qf1-l1',
      '2025-04-08 19:00:00+00',
      'Londres',
      'cl-arsenal',
      'cl-realmadrid',
      NULL::text,
      2.10,
      3.20,
      3.40,
      '3'
    ),
    (
      'ucl25-qf1-l2',
      '2025-04-15 19:00:00+00',
      'Madrid',
      'cl-realmadrid',
      'cl-arsenal',
      NULL::text,
      2.05,
      3.25,
      3.50,
      '3'
    ),
    (
      'ucl25-qf2-l1',
      '2025-04-09 19:00:00+00',
      'Paris',
      'cl-psg',
      'cl-astonvilla',
      NULL::text,
      1.45,
      4.50,
      6.00,
      '3'
    ),
    (
      'ucl25-qf2-l2',
      '2025-04-15 20:00:00+00',
      'Birmingham',
      'cl-astonvilla',
      'cl-psg',
      NULL::text,
      3.80,
      3.60,
      1.95,
      '3'
    ),
    (
      'ucl25-qf3-l1',
      '2025-04-09 19:00:00+00',
      'Barcelone',
      'cl-barcelona',
      'cl-dortmund',
      NULL::text,
      1.65,
      4.00,
      4.80,
      '3'
    ),
    (
      'ucl25-qf3-l2',
      '2025-04-15 19:00:00+00',
      'Dortmund',
      'cl-dortmund',
      'cl-barcelona',
      NULL::text,
      2.90,
      3.40,
      2.35,
      '3'
    ),
    (
      'ucl25-qf4-l1',
      '2025-04-08 19:00:00+00',
      'Munich',
      'cl-bayern',
      'cl-inter',
      NULL::text,
      1.75,
      3.70,
      4.40,
      '3'
    ),
    (
      'ucl25-qf4-l2',
      '2025-04-16 19:00:00+00',
      'Milan',
      'cl-inter',
      'cl-bayern',
      NULL::text,
      3.10,
      3.50,
      2.20,
      '3'
    )
) AS m(
  id,
  date_time,
  city,
  team_a,
  team_b,
  streaming,
  odds_a,
  odds_b,
  odds_draw,
  phase
);

INSERT INTO competition_profiles (competition_id, user_id, score)
SELECT c.id, p.id, 0
FROM competitions c
CROSS JOIN profiles p
WHERE c.name = 'Ligue des champions 2024-25'
ON CONFLICT (competition_id, user_id) DO NOTHING;
