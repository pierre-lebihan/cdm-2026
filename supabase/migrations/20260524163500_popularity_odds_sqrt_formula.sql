CREATE OR REPLACE FUNCTION public.popularity_odds_value(
  p_total_valid INTEGER,
  p_same_count INTEGER
) RETURNS NUMERIC
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT CASE
    WHEN p_total_valid IS NULL OR p_total_valid = 0 OR p_same_count IS NULL OR p_same_count = 0 THEN NULL::NUMERIC
    WHEN p_total_valid < 2 THEN 1::NUMERIC
    ELSE LEAST(
      10::NUMERIC,
      GREATEST(
        1::NUMERIC,
        EXP(-POWER(p_same_count::NUMERIC / p_total_valid::NUMERIC, 0.5) * 2) * 10
      )
    )
  END;
$$;

CREATE OR REPLACE FUNCTION public.prediction_popularity_multiplier(
  p_total_valid INTEGER,
  p_same_count INTEGER
) RETURNS NUMERIC
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT CASE
    WHEN p_total_valid IS NULL OR p_total_valid < 2 THEN 1::NUMERIC
    ELSE LEAST(
      10::NUMERIC,
      GREATEST(
        1::NUMERIC,
        EXP(-POWER(p_same_count::NUMERIC / NULLIF(p_total_valid, 0)::NUMERIC, 0.5) * 2) * 10
      )
    )
  END;
$$;

CREATE OR REPLACE FUNCTION public.tournament_phase_multiplier(
  p_phase public.match_tournament_phase
) RETURNS NUMERIC
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT (CASE p_phase
    WHEN 'group'         THEN 0.75
    WHEN 'round_of_16'   THEN 1
    WHEN 'round_of_8'    THEN 1.5
    WHEN 'quarter_final' THEN 3
    WHEN 'semi_final'    THEN 6
    WHEN 'third_place'   THEN 8
    WHEN 'final'         THEN 12
    ELSE 1
  END)::NUMERIC;
$$;

DO $$
DECLARE
  m_row RECORD;
BEGIN
  FOR m_row IN
    SELECT id FROM public.matches
  LOOP
    PERFORM public.recompute_match_odds(m_row.id);
  END LOOP;
END $$;
