BEGIN;

DELETE FROM public.group_apply;
DELETE FROM public.group_members;
DELETE FROM public.groups;
DELETE FROM public.bets;
DELETE FROM public.competition_profiles;
DELETE FROM public.profiles;
DELETE FROM auth.users;

DO $$
DECLARE
  match_row RECORD;
  competition_row RECORD;
BEGIN
  FOR match_row IN
    SELECT id
    FROM public.matches
    WHERE score_a IS NULL
      AND (date_time IS NULL OR date_time > NOW())
  LOOP
    PERFORM public.recompute_match_odds(match_row.id);
  END LOOP;

  FOR competition_row IN
    SELECT id
    FROM public.competitions
  LOOP
    PERFORM public.recompute_final_winner_odds(competition_row.id);
  END LOOP;
END $$;

COMMIT;
