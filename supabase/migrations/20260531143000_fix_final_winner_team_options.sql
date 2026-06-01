CREATE OR REPLACE FUNCTION public.validate_competition_final_winner_team()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.final_winner_team IS NULL THEN
    RETURN NEW;
  END IF;

  PERFORM 1
  FROM public.teams t
  WHERE t.id = NEW.final_winner_team
    AND t.competition_id = NEW.id
    AND t.code <> 'tbd'
    AND LOWER(t.name) NOT IN ('à définir', 'a definir');

  IF NOT FOUND THEN
    RAISE EXCEPTION 'final_winner_team must be a selectable team from the same competition';
  END IF;

  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.validate_competition_profile_winner_team()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.winner_team IS NULL THEN
    RETURN NEW;
  END IF;

  PERFORM 1
  FROM public.teams t
  WHERE t.id = NEW.winner_team
    AND t.competition_id = NEW.competition_id
    AND t.code <> 'tbd'
    AND LOWER(t.name) NOT IN ('à définir', 'a definir');

  IF NOT FOUND THEN
    RAISE EXCEPTION 'winner_team must be a selectable team from the same competition as competition_profiles.competition_id';
  END IF;

  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.recompute_final_winner_odds(
  p_competition_id UUID
) RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_total_valid INTEGER;
BEGIN
  IF p_competition_id IS NULL THEN
    RETURN;
  END IF;

  SELECT COUNT(*)::INTEGER INTO v_total_valid
  FROM public.competition_profiles cp
  JOIN public.teams t
    ON t.id = cp.winner_team
   AND t.competition_id = p_competition_id
   AND t.code <> 'tbd'
   AND LOWER(t.name) NOT IN ('à définir', 'a definir')
  WHERE cp.competition_id = p_competition_id
    AND cp.winner_team IS NOT NULL;

  UPDATE public.teams t
  SET win_odd = NULL
  WHERE t.competition_id = p_competition_id
    AND (
      t.code = 'tbd'
      OR LOWER(t.name) IN ('à définir', 'a definir')
    );

  UPDATE public.teams t
  SET win_odd = public.final_winner_odds_value(
    v_total_valid,
    (
      SELECT COUNT(*)::INTEGER
      FROM public.competition_profiles cp
      WHERE cp.competition_id = p_competition_id
        AND cp.winner_team = t.id
    )
  )
  WHERE t.competition_id = p_competition_id
    AND t.code <> 'tbd'
    AND LOWER(t.name) NOT IN ('à définir', 'a definir');
END;
$$;

REVOKE EXECUTE ON FUNCTION public.recompute_final_winner_odds(UUID) FROM PUBLIC;

WITH placeholder_teams AS (
  SELECT t.id, t.competition_id
  FROM public.teams t
  WHERE t.code = 'tbd'
     OR LOWER(t.name) IN ('à définir', 'a definir')
),
cleared_placeholder_profiles AS (
  UPDATE public.competition_profiles cp
  SET winner_team = NULL
  FROM placeholder_teams pt
  WHERE cp.competition_id = pt.competition_id
    AND cp.winner_team = pt.id
  RETURNING cp.competition_id
),
cleared_placeholder_competitions AS (
  UPDATE public.competitions c
  SET final_winner_team = NULL
  FROM placeholder_teams pt
  WHERE c.id = pt.competition_id
    AND c.final_winner_team = pt.id
  RETURNING c.id AS competition_id
),
updated_placeholders AS (
  UPDATE public.teams t
  SET win_odd = NULL
  FROM placeholder_teams pt
  WHERE t.id = pt.id
  RETURNING t.competition_id
),
invalid_italy AS (
  SELECT t.id, t.competition_id
  FROM public.teams t
  JOIN public.competitions c
    ON c.id = t.competition_id
  WHERE t.code = 'it'
    AND t.name = 'Italie'
    AND c.name NOT ILIKE '%Coupe du Monde%'
),
cleared_italy_profiles AS (
  UPDATE public.competition_profiles cp
  SET winner_team = NULL
  FROM invalid_italy it
  WHERE cp.competition_id = it.competition_id
    AND cp.winner_team = it.id
  RETURNING cp.competition_id
),
cleared_italy_competitions AS (
  UPDATE public.competitions c
  SET final_winner_team = NULL
  FROM invalid_italy it
  WHERE c.id = it.competition_id
    AND c.final_winner_team = it.id
  RETURNING c.id AS competition_id
),
deleted_invalid_italy AS (
  DELETE FROM public.teams t
  USING invalid_italy it
  WHERE t.id = it.id
  RETURNING t.competition_id
),
world_cup_competitions AS (
  SELECT c.id
  FROM public.competitions c
  WHERE c.name ILIKE '%Coupe du Monde%'
),
upserted_italy AS (
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
  FROM world_cup_competitions c
  ON CONFLICT (id) DO UPDATE SET
    code = EXCLUDED.code,
    group_name = EXCLUDED.group_name,
    name = EXCLUDED.name,
    elimination = EXCLUDED.elimination,
    unveiled = EXCLUDED.unveiled,
    competition_id = EXCLUDED.competition_id
  RETURNING competition_id
),
affected_competitions AS (
  SELECT competition_id FROM cleared_placeholder_profiles
  UNION
  SELECT competition_id FROM cleared_placeholder_competitions
  UNION
  SELECT competition_id FROM updated_placeholders
  UNION
  SELECT competition_id FROM cleared_italy_profiles
  UNION
  SELECT competition_id FROM cleared_italy_competitions
  UNION
  SELECT competition_id FROM deleted_invalid_italy
  UNION
  SELECT competition_id FROM upserted_italy
)
SELECT public.recompute_final_winner_odds(competition_id)
FROM affected_competitions
WHERE competition_id IS NOT NULL
GROUP BY competition_id;
