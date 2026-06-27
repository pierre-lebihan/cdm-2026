UPDATE public.matches AS match
SET
  team_a = confirmed.team_a,
  team_b = confirmed.team_b
FROM (
  VALUES
    ('r32-01', 'za', 'ca'),
    ('r32-02', 'br', 'jp'),
    ('r32-03', 'de', 'py'),
    ('r32-04', 'nl', 'ma'),
    ('r32-05', 'ci', 'no'),
    ('r32-06', 'fr', 'barrage-b'),
    ('r32-10', 'us', 'barrage-a'),
    ('r32-14', 'au', 'eg'),
    ('r32-15', 'ar', 'cv')
) AS confirmed(match_id, team_a, team_b)
WHERE match.id = confirmed.match_id
  AND match.tournament_phase = 'round_of_16';
