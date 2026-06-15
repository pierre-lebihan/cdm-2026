CREATE OR REPLACE FUNCTION public.handle_bet_odds_refresh()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  v_match_id TEXT;
  v_start TIMESTAMPTZ;
  v_status public.match_status;
BEGIN
  IF TG_OP = 'UPDATE'
     AND NEW.match_id IS NOT DISTINCT FROM OLD.match_id
     AND NEW.competition_id IS NOT DISTINCT FROM OLD.competition_id
     AND NEW.bet_team_a IS NOT DISTINCT FROM OLD.bet_team_a
     AND NEW.bet_team_b IS NOT DISTINCT FROM OLD.bet_team_b
     AND NEW.bet_playoff_winner IS NOT DISTINCT FROM OLD.bet_playoff_winner THEN
    RETURN NEW;
  END IF;

  IF TG_OP = 'DELETE' THEN
    v_match_id := OLD.match_id;
  ELSE
    v_match_id := NEW.match_id;
  END IF;

  SELECT m.date_time, m.status
  INTO v_start, v_status
  FROM public.matches m
  WHERE m.id = v_match_id;

  IF v_status IS DISTINCT FROM 'PLANNED'::public.match_status THEN
    RETURN COALESCE(NEW, OLD);
  END IF;

  IF v_start IS NOT NULL AND v_start <= NOW() THEN
    RETURN COALESCE(NEW, OLD);
  END IF;

  PERFORM public.recompute_match_odds(v_match_id);
  RETURN COALESCE(NEW, OLD);
END;
$$;
