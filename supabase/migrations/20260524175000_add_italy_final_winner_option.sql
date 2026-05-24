WITH target_competitions AS (
  SELECT id
  FROM public.competitions
  WHERE active = true
     OR name ILIKE '%Coupe du Monde%'
),
upserted AS (
  INSERT INTO public.teams (
    id,
    code,
    group_name,
    name,
    win_odd,
    elimination,
    unveiled,
    competition_id
  )
  SELECT
    'italy-wildcard-' || c.id::text,
    'it',
    'Hors compétition',
    'Italie',
    8000::numeric,
    false,
    true,
    c.id
  FROM target_competitions c
  ON CONFLICT (id) DO UPDATE SET
    code = EXCLUDED.code,
    group_name = EXCLUDED.group_name,
    name = EXCLUDED.name,
    elimination = EXCLUDED.elimination,
    unveiled = EXCLUDED.unveiled,
    competition_id = EXCLUDED.competition_id
  RETURNING competition_id
)
SELECT public.recompute_final_winner_odds(competition_id)
FROM upserted
GROUP BY competition_id;
