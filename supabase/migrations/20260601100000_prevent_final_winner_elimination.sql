CREATE OR REPLACE FUNCTION public.ensure_final_winner_not_eliminated()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.final_winner_team IS NOT NULL THEN
    UPDATE public.teams t
    SET elimination = false
    WHERE t.id = NEW.final_winner_team
      AND t.competition_id = NEW.id;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS competitions_ensure_final_winner_not_eliminated
  ON public.competitions;
CREATE TRIGGER competitions_ensure_final_winner_not_eliminated
  AFTER INSERT OR UPDATE OF final_winner_team
  ON public.competitions
  FOR EACH ROW
  EXECUTE FUNCTION public.ensure_final_winner_not_eliminated();

CREATE OR REPLACE FUNCTION public.prevent_final_winner_elimination()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.elimination IS TRUE THEN
    PERFORM 1
    FROM public.competitions c
    WHERE c.id = NEW.competition_id
      AND c.final_winner_team = NEW.id;

    IF FOUND THEN
      RAISE EXCEPTION 'final winner team cannot be eliminated';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS teams_prevent_final_winner_elimination
  ON public.teams;
CREATE TRIGGER teams_prevent_final_winner_elimination
  BEFORE UPDATE OF elimination
  ON public.teams
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_final_winner_elimination();

UPDATE public.teams t
SET elimination = false
FROM public.competitions c
WHERE c.id = t.competition_id
  AND c.final_winner_team = t.id
  AND t.elimination IS TRUE;
