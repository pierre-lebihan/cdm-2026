CREATE OR REPLACE FUNCTION public.final_winner_odds_value(
  p_total_valid INTEGER,
  p_same_count INTEGER
) RETURNS NUMERIC
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT ROUND(
    (
      EXP(
        -SQRT(
          CASE
            WHEN COALESCE(p_total_valid, 0) <= 0 THEN 0::NUMERIC
            WHEN COALESCE(p_same_count, 0) <= 0 THEN 0::NUMERIC
            ELSE p_same_count::NUMERIC / p_total_valid::NUMERIC
          END
        ) * 3
      ) * 700
    )::NUMERIC,
    2
  );
$$;

DO $$
DECLARE
  competition_row RECORD;
BEGIN
  FOR competition_row IN
    SELECT id FROM public.competitions
  LOOP
    PERFORM public.recompute_final_winner_odds(competition_row.id);
  END LOOP;
END $$;
