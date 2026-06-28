UPDATE public.matches AS match
SET
  team_a = confirmed.team_a,
  team_b = confirmed.team_b,
  visible_to_users = true
FROM (
  VALUES
    ('r32-07', 'mx', 'ec'),
    ('r32-08', 'gb-eng', 'barrage-int2'),
    ('r32-09', 'be', 'sn'),
    ('r32-11', 'es', 'at'),
    ('r32-12', 'pt', 'hr'),
    ('r32-13', 'ch', 'dz'),
    ('r32-16', 'co', 'gh')
) AS confirmed(match_id, team_a, team_b)
WHERE match.id = confirmed.match_id
  AND match.competition_id IN (
    SELECT id
    FROM public.competitions
    WHERE name = 'Coupe du Monde 2026'
  )
  AND match.tournament_phase = 'round_of_16';
