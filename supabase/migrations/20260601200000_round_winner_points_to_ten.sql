CREATE OR REPLACE FUNCTION public.refresh_final_winner_scores(
  p_competition_id UUID
) RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_winner_team   TEXT;
  v_winner_points INTEGER;
BEGIN
  IF p_competition_id IS NULL THEN
    RETURN;
  END IF;

  UPDATE public.competition_profiles cp
  SET score = COALESCE(cp.score, 0) - COALESCE(cp.final_winner_points, 0),
      final_winner_points = 0
  WHERE cp.competition_id = p_competition_id;

  SELECT c.final_winner_team,
         (ROUND(COALESCE(t.win_odd, 0) / 10) * 10)::INTEGER
  INTO v_winner_team,
       v_winner_points
  FROM public.competitions c
  LEFT JOIN public.teams t
    ON t.id = c.final_winner_team
   AND t.competition_id = c.id
  WHERE c.id = p_competition_id;

  IF v_winner_team IS NULL THEN
    RETURN;
  END IF;

  UPDATE public.competition_profiles cp
  SET final_winner_points = COALESCE(v_winner_points, 0),
      score = COALESCE(cp.score, 0) + COALESCE(v_winner_points, 0)
  WHERE cp.competition_id = p_competition_id
    AND cp.winner_team = v_winner_team;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.refresh_final_winner_scores(UUID) FROM PUBLIC;
