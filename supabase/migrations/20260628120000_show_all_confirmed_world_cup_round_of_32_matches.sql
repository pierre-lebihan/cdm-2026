-- World Cup round of 32: once both teams are known, the match should be visible to users.
UPDATE public.matches
SET visible_to_users = true
WHERE competition_id IN (
  SELECT id
  FROM public.competitions
  WHERE name ILIKE '%Coupe du Monde%'
)
  AND tournament_phase = 'round_of_16'
  AND team_a IS NOT NULL
  AND team_b IS NOT NULL;
