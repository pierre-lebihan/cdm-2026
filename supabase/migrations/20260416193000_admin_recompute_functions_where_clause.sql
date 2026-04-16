-- 1. Fix `UPDATE competition_profiles SET score = 0` sans clause WHERE :
--    pgaudit (et certaines polices Supabase) le refusent avec l'erreur
--    "UPDATE requires a WHERE clause" (SQLSTATE 21000).
--
-- 2. Ajoute `admin_recalculate_all_odds` : recalcule les cotes de tous les
--    matchs non démarrés (utile après changement de formule de popularité ou
--    pour forcer un rafraîchissement général).

CREATE OR REPLACE FUNCTION public.admin_recalculate_all_scores()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  match_row     RECORD;
  bet_row       RECORD;
  real_result   TEXT;
  bet_result    TEXT;
  total_diff    INTEGER;
  real_margin   INTEGER;
  bet_margin    INTEGER;
  base_points   INTEGER;
  points        INTEGER;
  p_resultat    INTEGER;
  p_gagnant     INTEGER;
  p_proximite   INTEGER;
  p_ecart       INTEGER;
  p_bonus       INTEGER;
  phase_mult    INTEGER;
  winning_odds  NUMERIC;
  outcome       public.bet_outcome_status;
  v_matches     INTEGER := 0;
  v_bets        INTEGER := 0;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Seuls les admins peuvent recalculer les scores';
  END IF;

  UPDATE public.competition_profiles SET score = 0 WHERE TRUE;

  FOR match_row IN
    SELECT * FROM public.matches
    WHERE score_a IS NULL OR score_b IS NULL
  LOOP
    UPDATE public.bets SET points_won = 0, outcome_status = NULL
    WHERE match_id = match_row.id;
  END LOOP;

  FOR match_row IN
    SELECT * FROM public.matches
    WHERE score_a IS NOT NULL AND score_b IS NOT NULL
    ORDER BY date_time ASC
  LOOP
    v_matches := v_matches + 1;

    real_result := CASE
      WHEN match_row.score_a > match_row.score_b THEN 'A'
      WHEN match_row.score_a = match_row.score_b THEN 'N'
      ELSE 'B'
    END;

    real_margin := ABS(match_row.score_a - match_row.score_b);

    winning_odds := public.match_winning_odds(
      match_row.bet_format,
      match_row.score_a,
      match_row.score_b,
      match_row.playoff_winner,
      match_row.odds_a,
      match_row.odds_b,
      match_row.odds_draw
    );

    phase_mult := public.tournament_phase_multiplier(match_row.tournament_phase);

    FOR bet_row IN SELECT * FROM public.bets WHERE match_id = match_row.id LOOP
      v_bets := v_bets + 1;

      bet_result := CASE
        WHEN bet_row.bet_team_a > bet_row.bet_team_b THEN 'A'
        WHEN bet_row.bet_team_a = bet_row.bet_team_b THEN 'N'
        ELSE 'B'
      END;

      IF match_row.bet_format = 'regulation_1x2' THEN
        p_gagnant := CASE WHEN bet_result = real_result THEN 8 ELSE 0 END;
      ELSE
        DECLARE
          eff_real_winner TEXT;
          eff_bet_winner  TEXT;
        BEGIN
          eff_real_winner := CASE WHEN real_result != 'N' THEN real_result ELSE match_row.playoff_winner END;
          eff_bet_winner  := CASE WHEN bet_result  != 'N' THEN bet_result  ELSE bet_row.bet_playoff_winner END;
          p_gagnant := CASE
            WHEN eff_real_winner IS NOT NULL AND eff_bet_winner = eff_real_winner THEN 8
            ELSE 0
          END;
        END;
      END IF;

      p_resultat := CASE WHEN bet_result = real_result THEN 2 ELSE 0 END;

      p_bonus := CASE
        WHEN bet_result = real_result
         AND bet_row.bet_team_a = match_row.score_a
         AND bet_row.bet_team_b = match_row.score_b THEN 4
        ELSE 0
      END;

      IF bet_result = real_result OR p_gagnant > 0 THEN
        total_diff := ABS(match_row.score_a - bet_row.bet_team_a)
                    + ABS(match_row.score_b - bet_row.bet_team_b);
        p_proximite := GREATEST(3 - total_diff, 0);

        bet_margin  := ABS(bet_row.bet_team_a - bet_row.bet_team_b);
        p_ecart     := GREATEST(3 - ABS(real_margin - bet_margin), 0);
      ELSE
        p_proximite := 0;
        p_ecart     := 0;
      END IF;

      base_points := p_resultat + p_gagnant + p_proximite + p_ecart + p_bonus;

      IF winning_odds IS NULL OR base_points = 0 THEN
        points := 0;
      ELSE
        points := ROUND(base_points::NUMERIC * winning_odds * phase_mult)::INTEGER;
      END IF;

      IF bet_row.bet_team_a IS NOT DISTINCT FROM match_row.score_a
         AND bet_row.bet_team_b IS NOT DISTINCT FROM match_row.score_b THEN
        outcome := 'perfect_score'::public.bet_outcome_status;
      ELSIF points <= 0 THEN
        outcome := 'rate'::public.bet_outcome_status;
      ELSE
        outcome := 'good_result'::public.bet_outcome_status;
      END IF;

      UPDATE public.bets
      SET points_won = points, outcome_status = outcome
      WHERE id = bet_row.id;

      UPDATE public.competition_profiles
      SET score = COALESCE(score, 0) + points
      WHERE user_id = bet_row.user_id
        AND competition_id = bet_row.competition_id;
    END LOOP;
  END LOOP;

  RETURN jsonb_build_object(
    'matches_processed', v_matches,
    'bets_processed', v_bets
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_recalculate_all_odds()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  m_row     RECORD;
  v_count   INTEGER := 0;
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
    v_count := v_count + 1;
  END LOOP;

  RETURN jsonb_build_object('matches_refreshed', v_count);
END;
$$;
