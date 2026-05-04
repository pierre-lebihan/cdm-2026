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
        ) * 4.5
      ) * 8000
    )::NUMERIC,
    2
  );
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
  WHERE cp.competition_id = p_competition_id
    AND cp.winner_team IS NOT NULL;

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
  WHERE t.competition_id = p_competition_id;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.recompute_final_winner_odds(UUID) FROM PUBLIC;

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
    AND t.competition_id = NEW.competition_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'winner_team must belong to the same competition as competition_profiles.competition_id';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS competition_profiles_validate_winner_team
  ON public.competition_profiles;
CREATE TRIGGER competition_profiles_validate_winner_team
  BEFORE INSERT OR UPDATE OF competition_id, winner_team
  ON public.competition_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_competition_profile_winner_team();

CREATE OR REPLACE FUNCTION public.handle_final_winner_odds_refresh()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.winner_team IS NOT NULL THEN
      PERFORM public.recompute_final_winner_odds(NEW.competition_id);
    END IF;
    RETURN NEW;
  END IF;

  IF TG_OP = 'DELETE' THEN
    IF OLD.winner_team IS NOT NULL THEN
      PERFORM public.recompute_final_winner_odds(OLD.competition_id);
    END IF;
    RETURN OLD;
  END IF;

  IF NEW.competition_id IS NOT DISTINCT FROM OLD.competition_id
     AND NEW.winner_team IS NOT DISTINCT FROM OLD.winner_team THEN
    RETURN NEW;
  END IF;

  IF OLD.winner_team IS NOT NULL THEN
    PERFORM public.recompute_final_winner_odds(OLD.competition_id);
  END IF;

  IF NEW.winner_team IS NOT NULL THEN
    PERFORM public.recompute_final_winner_odds(NEW.competition_id);
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS competition_profiles_refresh_final_winner_odds
  ON public.competition_profiles;
CREATE TRIGGER competition_profiles_refresh_final_winner_odds
  AFTER INSERT OR UPDATE OR DELETE
  ON public.competition_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_final_winner_odds_refresh();

CREATE OR REPLACE FUNCTION public.admin_recalculate_all_odds()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  m_row                     RECORD;
  c_row                     RECORD;
  v_match_count             INTEGER := 0;
  v_winner_team_count       INTEGER := 0;
  v_competition_team_count  INTEGER;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Seuls les admins peuvent recalculer les cotes';
  END IF;

  FOR m_row IN
    SELECT id FROM public.matches
    WHERE score_a IS NULL
      AND (date_time IS NULL OR date_time > NOW())
  LOOP
    PERFORM public.recompute_match_odds(m_row.id);
    v_match_count := v_match_count + 1;
  END LOOP;

  FOR c_row IN
    SELECT id FROM public.competitions
  LOOP
    PERFORM public.recompute_final_winner_odds(c_row.id);

    SELECT COUNT(*)::INTEGER INTO v_competition_team_count
    FROM public.teams
    WHERE competition_id = c_row.id;

    v_winner_team_count := v_winner_team_count + v_competition_team_count;
  END LOOP;

  RETURN jsonb_build_object(
    'matches_refreshed', v_match_count,
    'winner_teams_refreshed', v_winner_team_count
  );
END;
$$;

DO $$
DECLARE
  c_row RECORD;
BEGIN
  FOR c_row IN
    SELECT id FROM public.competitions
  LOOP
    PERFORM public.recompute_final_winner_odds(c_row.id);
  END LOOP;
END $$;
