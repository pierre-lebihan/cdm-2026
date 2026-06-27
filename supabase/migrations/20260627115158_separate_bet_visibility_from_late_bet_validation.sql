CREATE OR REPLACE FUNCTION public.prevent_late_bets()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  match_start TIMESTAMPTZ;
  current_status public.match_status;
BEGIN
  IF TG_OP = 'UPDATE'
     AND NEW.bet_team_a IS NOT DISTINCT FROM OLD.bet_team_a
     AND NEW.bet_team_b IS NOT DISTINCT FROM OLD.bet_team_b
     AND NEW.bet_playoff_winner IS NOT DISTINCT FROM OLD.bet_playoff_winner THEN
    RETURN NEW;
  END IF;

  IF public.is_admin() THEN
    RETURN NEW;
  END IF;

  SELECT date_time, status
  INTO match_start, current_status
  FROM public.matches
  WHERE id = NEW.match_id;

  IF match_start IS NOT NULL AND match_start <= now() THEN
    RAISE EXCEPTION 'Les paris sont fermés pour ce match (déjà commencé)';
  END IF;

  IF current_status IS DISTINCT FROM 'PLANNED'::public.match_status THEN
    RAISE EXCEPTION 'Les paris sont fermés pour ce match';
  END IF;

  RETURN NEW;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.prevent_late_bets()
FROM PUBLIC, anon, authenticated;
