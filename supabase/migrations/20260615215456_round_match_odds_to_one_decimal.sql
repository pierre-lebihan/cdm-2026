CREATE OR REPLACE FUNCTION public.popularity_odds_value(
  p_total_valid INTEGER,
  p_same_count INTEGER
) RETURNS NUMERIC
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT CASE
    WHEN p_total_valid IS NULL OR p_total_valid = 0 OR p_same_count IS NULL OR p_same_count = 0 THEN NULL::NUMERIC
    WHEN p_total_valid < 2 THEN 1.0::NUMERIC
    ELSE ROUND(
      LEAST(
        10::NUMERIC,
        GREATEST(
          1::NUMERIC,
          EXP(-POWER(p_same_count::NUMERIC / p_total_valid::NUMERIC, 0.5) * 2) * 10
        )
      ),
      1
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
    WHEN p_total_valid IS NULL OR p_total_valid < 2 THEN 1.0::NUMERIC
    ELSE ROUND(
      LEAST(
        10::NUMERIC,
        GREATEST(
          1::NUMERIC,
          EXP(-POWER(p_same_count::NUMERIC / NULLIF(p_total_valid, 0)::NUMERIC, 0.5) * 2) * 10
        )
      ),
      1
    )
  END;
$$;

UPDATE public.matches
SET odds_a = ROUND(odds_a, 1),
    odds_b = ROUND(odds_b, 1),
    odds_draw = ROUND(odds_draw, 1)
WHERE odds_a IS NOT NULL
   OR odds_b IS NOT NULL
   OR odds_draw IS NOT NULL;
