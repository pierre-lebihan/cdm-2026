-- Cotes dynamiques basées sur la popularité des pronostics + scoring phasé.
--
-- 1. Les cotes (odds_a, odds_b, odds_draw) ne viennent plus de RapidAPI mais
--    sont recalculées à chaque INSERT/UPDATE/DELETE d'un pari tant que le
--    match n'a pas démarré.
--
-- 2. Formule de cote (par issue) :
--        p    = same / total_valid     (proportion des pariant sur cette issue)
--        cote = exp(-p² × 2) × 10      (bornée à [1 ; 10])
--    Si aucune valeur pour une issue (personne, total nul) : NULL.
--
-- 3. Sémantique des 3 colonnes par bet_format :
--        regulation_1x2      : odds_a = victoire A (90 min), odds_draw = nul,
--                              odds_b = victoire B (90 min).
--        knockout_decider    : odds_a = vainqueur final A, odds_b = vainqueur
--                              final B, odds_draw = NULL (inutilisée).
--
-- 4. Nouvelle formule de scoring :
--        points = base_points × cote_issue_gagnante × multiplicateur_phase
--
--    Multiplicateur de phase (aligné sur lib/matchEnums.ts) :
--        group, round_of_16      : 1
--        round_of_8              : 2
--        quarter_final           : 3
--        semi_final              : 5
--        third_place             : 7
--        final                   : 10

CREATE OR REPLACE FUNCTION public.tournament_phase_multiplier(
  p_phase public.match_tournament_phase
) RETURNS INTEGER
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT CASE p_phase
    WHEN 'group'         THEN 1
    WHEN 'round_of_16'   THEN 1
    WHEN 'round_of_8'    THEN 2
    WHEN 'quarter_final' THEN 3
    WHEN 'semi_final'    THEN 5
    WHEN 'third_place'   THEN 7
    WHEN 'final'         THEN 10
    ELSE 1
  END;
$$;

CREATE OR REPLACE FUNCTION public.popularity_odds_value(
  p_total_valid INTEGER,
  p_same_count INTEGER
) RETURNS NUMERIC
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT CASE
    WHEN p_total_valid IS NULL OR p_total_valid = 0 OR p_same_count IS NULL OR p_same_count = 0 THEN NULL::NUMERIC
    ELSE LEAST(
      10::NUMERIC,
      GREATEST(
        1::NUMERIC,
        EXP(-POWER(p_same_count::NUMERIC / p_total_valid::NUMERIC, 2) * 2) * 10
      )
    )
  END;
$$;

CREATE OR REPLACE FUNCTION public.recompute_match_odds(p_match_id TEXT)
RETURNS VOID
LANGUAGE plpgsql
AS $$
DECLARE
  v_bet_format public.match_bet_format;
  v_total_valid INTEGER;
  v_same_a INTEGER;
  v_same_b INTEGER;
  v_same_n INTEGER;
  v_odds_a NUMERIC;
  v_odds_b NUMERIC;
  v_odds_draw NUMERIC;
BEGIN
  SELECT bet_format INTO v_bet_format
  FROM public.matches
  WHERE id = p_match_id;

  IF NOT FOUND THEN
    RETURN;
  END IF;

  SELECT COUNT(*)::INTEGER INTO v_total_valid
  FROM public.bets b
  WHERE b.match_id = p_match_id
    AND public.match_prediction_popularity_key(
      v_bet_format, b.bet_team_a, b.bet_team_b, b.bet_playoff_winner
    ) IS NOT NULL;

  SELECT COUNT(*)::INTEGER INTO v_same_a
  FROM public.bets b
  WHERE b.match_id = p_match_id
    AND public.match_prediction_popularity_key(
      v_bet_format, b.bet_team_a, b.bet_team_b, b.bet_playoff_winner
    ) IN ('G_A', 'P_A');

  SELECT COUNT(*)::INTEGER INTO v_same_b
  FROM public.bets b
  WHERE b.match_id = p_match_id
    AND public.match_prediction_popularity_key(
      v_bet_format, b.bet_team_a, b.bet_team_b, b.bet_playoff_winner
    ) IN ('G_B', 'P_B');

  SELECT COUNT(*)::INTEGER INTO v_same_n
  FROM public.bets b
  WHERE b.match_id = p_match_id
    AND public.match_prediction_popularity_key(
      v_bet_format, b.bet_team_a, b.bet_team_b, b.bet_playoff_winner
    ) = 'G_N';

  v_odds_a := public.popularity_odds_value(v_total_valid, v_same_a);
  v_odds_b := public.popularity_odds_value(v_total_valid, v_same_b);

  IF v_bet_format = 'regulation_1x2' THEN
    v_odds_draw := public.popularity_odds_value(v_total_valid, v_same_n);
  ELSE
    v_odds_draw := NULL;
  END IF;

  UPDATE public.matches
  SET odds_a = v_odds_a,
      odds_b = v_odds_b,
      odds_draw = v_odds_draw
  WHERE id = p_match_id;
END;
$$;

-- Trigger function sur bets : recalcule les cotes du match affecté,
-- uniquement tant qu'il n'a pas démarré (on ne touche plus un match en cours
-- ou terminé pour que la cote gagnante utilisée dans les points reste figée).
CREATE OR REPLACE FUNCTION public.handle_bet_odds_refresh()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  v_match_id TEXT;
  v_start TIMESTAMPTZ;
  v_score_a INTEGER;
BEGIN
  IF TG_OP = 'DELETE' THEN
    v_match_id := OLD.match_id;
  ELSE
    v_match_id := NEW.match_id;
  END IF;

  SELECT m.date_time, m.score_a
  INTO v_start, v_score_a
  FROM public.matches m
  WHERE m.id = v_match_id;

  IF v_score_a IS NOT NULL THEN
    RETURN COALESCE(NEW, OLD);
  END IF;

  IF v_start IS NOT NULL AND v_start <= NOW() THEN
    RETURN COALESCE(NEW, OLD);
  END IF;

  PERFORM public.recompute_match_odds(v_match_id);
  RETURN COALESCE(NEW, OLD);
END;
$$;

DROP TRIGGER IF EXISTS bets_refresh_match_odds ON public.bets;
CREATE TRIGGER bets_refresh_match_odds
  AFTER INSERT OR UPDATE OR DELETE ON public.bets
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_bet_odds_refresh();

CREATE OR REPLACE FUNCTION public.match_winning_odds(
  p_bet_format public.match_bet_format,
  p_score_a INTEGER,
  p_score_b INTEGER,
  p_playoff_winner TEXT,
  p_odds_a NUMERIC,
  p_odds_b NUMERIC,
  p_odds_draw NUMERIC
) RETURNS NUMERIC
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT CASE
    WHEN p_score_a IS NULL OR p_score_b IS NULL THEN NULL::NUMERIC
    WHEN p_bet_format = 'regulation_1x2' THEN
      CASE
        WHEN p_score_a > p_score_b THEN p_odds_a
        WHEN p_score_a < p_score_b THEN p_odds_b
        ELSE p_odds_draw
      END
    ELSE
      CASE
        WHEN p_score_a > p_score_b THEN p_odds_a
        WHEN p_score_a < p_score_b THEN p_odds_b
        WHEN p_playoff_winner = 'A' THEN p_odds_a
        WHEN p_playoff_winner = 'B' THEN p_odds_b
        ELSE NULL::NUMERIC
      END
  END;
$$;

CREATE OR REPLACE FUNCTION calculate_match_scores()
RETURNS TRIGGER AS $$
DECLARE
  bet_row       RECORD;
  real_result   TEXT;
  bet_result    TEXT;
  total_diff    INTEGER;
  real_margin   INTEGER;
  bet_margin    INTEGER;
  base_points   INTEGER;
  points        INTEGER;
  old_points    INTEGER;
  p_resultat    INTEGER;
  p_gagnant     INTEGER;
  p_proximite   INTEGER;
  p_ecart       INTEGER;
  p_bonus       INTEGER;
  phase_mult    INTEGER;
  winning_odds  NUMERIC;
  outcome       public.bet_outcome_status;
BEGIN
  IF (NEW.score_a IS NOT DISTINCT FROM OLD.score_a)
     AND (NEW.score_b IS NOT DISTINCT FROM OLD.score_b)
     AND (NEW.playoff_winner IS NOT DISTINCT FROM OLD.playoff_winner)
     AND (NEW.odds_a IS NOT DISTINCT FROM OLD.odds_a)
     AND (NEW.odds_b IS NOT DISTINCT FROM OLD.odds_b)
     AND (NEW.odds_draw IS NOT DISTINCT FROM OLD.odds_draw)
     AND (NEW.tournament_phase IS NOT DISTINCT FROM OLD.tournament_phase)
     AND (NEW.bet_format IS NOT DISTINCT FROM OLD.bet_format) THEN
    RETURN NEW;
  END IF;

  IF (NEW.score_a IS NULL OR NEW.score_b IS NULL)
     AND (OLD.score_a IS NOT NULL AND OLD.score_b IS NOT NULL) THEN
    FOR bet_row IN SELECT * FROM bets WHERE match_id = NEW.id LOOP
      old_points := COALESCE(bet_row.points_won, 0);
      UPDATE bets SET points_won = 0, outcome_status = NULL WHERE id = bet_row.id;
      UPDATE competition_profiles
      SET score = COALESCE(score, 0) - old_points
      WHERE user_id = bet_row.user_id
        AND competition_id = bet_row.competition_id;
    END LOOP;
    RETURN NEW;
  END IF;

  IF NEW.score_a IS NULL OR NEW.score_b IS NULL THEN
    RETURN NEW;
  END IF;

  real_result := CASE
    WHEN NEW.score_a > NEW.score_b THEN 'A'
    WHEN NEW.score_a = NEW.score_b THEN 'N'
    ELSE 'B'
  END;

  real_margin := ABS(NEW.score_a - NEW.score_b);

  winning_odds := public.match_winning_odds(
    NEW.bet_format,
    NEW.score_a,
    NEW.score_b,
    NEW.playoff_winner,
    NEW.odds_a,
    NEW.odds_b,
    NEW.odds_draw
  );

  phase_mult := public.tournament_phase_multiplier(NEW.tournament_phase);

  FOR bet_row IN SELECT * FROM bets WHERE match_id = NEW.id LOOP
    old_points := COALESCE(bet_row.points_won, 0);

    bet_result := CASE
      WHEN bet_row.bet_team_a > bet_row.bet_team_b THEN 'A'
      WHEN bet_row.bet_team_a = bet_row.bet_team_b THEN 'N'
      ELSE 'B'
    END;

    IF NEW.bet_format = 'regulation_1x2' THEN
      p_gagnant := CASE WHEN bet_result = real_result THEN 8 ELSE 0 END;
    ELSE
      DECLARE
        eff_real_winner TEXT;
        eff_bet_winner  TEXT;
      BEGIN
        eff_real_winner := CASE WHEN real_result != 'N' THEN real_result ELSE NEW.playoff_winner END;
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
       AND bet_row.bet_team_a = NEW.score_a
       AND bet_row.bet_team_b = NEW.score_b THEN 4
      ELSE 0
    END;

    IF bet_result = real_result OR p_gagnant > 0 THEN
      total_diff := ABS(NEW.score_a - bet_row.bet_team_a)
                  + ABS(NEW.score_b - bet_row.bet_team_b);
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

    IF bet_row.bet_team_a IS NOT DISTINCT FROM NEW.score_a
       AND bet_row.bet_team_b IS NOT DISTINCT FROM NEW.score_b THEN
      outcome := 'perfect_score'::public.bet_outcome_status;
    ELSIF points <= 0 THEN
      outcome := 'rate'::public.bet_outcome_status;
    ELSE
      outcome := 'good_result'::public.bet_outcome_status;
    END IF;

    UPDATE bets SET points_won = points, outcome_status = outcome WHERE id = bet_row.id;

    UPDATE competition_profiles
    SET score = COALESCE(score, 0) - old_points + points
    WHERE user_id = bet_row.user_id
      AND competition_id = bet_row.competition_id;
  END LOOP;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recalcule tous les scores : utile après changement de formule ou pour
-- réparer les totaux. Réservé aux admins (vérifié côté fonction RPC).
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

  UPDATE public.competition_profiles SET score = 0;

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

-- Backfill : recalcule les cotes pour tous les matchs non démarrés,
-- puis recalcule les scores de tous les matchs terminés avec la nouvelle formule.
DO $$
DECLARE
  m_row RECORD;
BEGIN
  FOR m_row IN
    SELECT id FROM public.matches
    WHERE score_a IS NULL
      AND (date_time IS NULL OR date_time > NOW())
  LOOP
    PERFORM public.recompute_match_odds(m_row.id);
  END LOOP;
END $$;

-- Recalcul initial des scores (admin-only RPC bypass via SECURITY DEFINER ici).
DO $$
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
BEGIN
  UPDATE public.competition_profiles SET score = 0;

  UPDATE public.bets SET points_won = 0, outcome_status = NULL
  WHERE match_id IN (
    SELECT id FROM public.matches WHERE score_a IS NULL OR score_b IS NULL
  );

  FOR match_row IN
    SELECT * FROM public.matches
    WHERE score_a IS NOT NULL AND score_b IS NOT NULL
    ORDER BY date_time ASC
  LOOP
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
END $$;

-- Nettoyage : on abandonne la synchro RapidAPI des cotes.
SELECT cron.unschedule('update-odds-cron');
