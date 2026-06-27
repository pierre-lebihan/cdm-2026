UPDATE public.matches
SET visible_to_users = true
WHERE id IN (
  'r32-01',
  'r32-02',
  'r32-03',
  'r32-04',
  'r32-05',
  'r32-06',
  'r32-10',
  'r32-14',
  'r32-15'
)
  AND team_a IS NOT NULL
  AND team_b IS NOT NULL;
