DO $$
DECLARE
  competition_row RECORD;
  team_row RECORD;
BEGIN
  FOR competition_row IN
    SELECT c.id
    FROM public.competitions c
    WHERE c.name ILIKE '%Ligue des champions%'
       OR c.name ILIKE '%LDC%'
  LOOP
    FOR team_row IN
      SELECT t.id
      FROM public.teams t
      WHERE t.competition_id = competition_row.id
        AND t.code = 'it'
        AND t.name = 'Italie'
    LOOP
      UPDATE public.competitions
      SET final_winner_team = NULL
      WHERE id = competition_row.id
        AND final_winner_team = team_row.id;

      UPDATE public.competition_profiles
      SET winner_team = NULL
      WHERE competition_id = competition_row.id
        AND winner_team = team_row.id;

      DELETE FROM public.teams
      WHERE id = team_row.id;
    END LOOP;

    PERFORM public.recompute_final_winner_odds(competition_row.id);
    PERFORM public.refresh_final_winner_scores(competition_row.id);
  END LOOP;

  FOR competition_row IN
    SELECT c.id
    FROM public.competitions c
    WHERE c.name ILIKE '%Coupe du Monde%'
  LOOP
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
    VALUES (
      'italy-wildcard-' || competition_row.id::text,
      'it',
      'Hors compétition',
      'Italie',
      8000::numeric,
      false,
      true,
      competition_row.id
    )
    ON CONFLICT (id) DO UPDATE SET
      code = EXCLUDED.code,
      group_name = EXCLUDED.group_name,
      name = EXCLUDED.name,
      elimination = EXCLUDED.elimination,
      unveiled = EXCLUDED.unveiled,
      competition_id = EXCLUDED.competition_id;

    PERFORM public.recompute_final_winner_odds(competition_row.id);
    PERFORM public.refresh_final_winner_scores(competition_row.id);
  END LOOP;
END $$;
