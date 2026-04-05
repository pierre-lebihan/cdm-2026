-- Remplace la colonne texte `phase` par :
--   - tournament_phase : étape de la compétition (groupes, 8es, quarts, etc.)
--   - bet_format       : type de pari (90 min 1/N/2 vs vainqueur match avec départage prolongations)

CREATE TYPE public.match_tournament_phase AS ENUM (
  'group',
  'round_of_16',
  'round_of_8',
  'quarter_final',
  'semi_final',
  'third_place',
  'final'
);

CREATE TYPE public.match_bet_format AS ENUM (
  'regulation_1x2',
  'knockout_decider'
);

ALTER TABLE public.matches
  ADD COLUMN tournament_phase public.match_tournament_phase,
  ADD COLUMN bet_format public.match_bet_format;

UPDATE public.matches SET
  tournament_phase = CASE COALESCE(phase, '0')
    WHEN '0' THEN 'group'::public.match_tournament_phase
    WHEN '5' THEN 'round_of_16'::public.match_tournament_phase
    WHEN '6' THEN 'round_of_8'::public.match_tournament_phase
    WHEN '4' THEN 'quarter_final'::public.match_tournament_phase
    WHEN '2' THEN 'semi_final'::public.match_tournament_phase
    WHEN '3' THEN 'third_place'::public.match_tournament_phase
    WHEN '1' THEN 'final'::public.match_tournament_phase
    ELSE 'group'::public.match_tournament_phase
  END,
  bet_format = CASE COALESCE(phase, '0')
    WHEN '0' THEN 'regulation_1x2'::public.match_bet_format
    ELSE 'knockout_decider'::public.match_bet_format
  END;

UPDATE public.matches m
SET bet_format = 'regulation_1x2'::public.match_bet_format
FROM public.competitions c
WHERE m.competition_id = c.id
  AND c.name ILIKE '%Ligue des champions%'
  AND m.tournament_phase IS DISTINCT FROM 'final'::public.match_tournament_phase;

ALTER TABLE public.matches
  ALTER COLUMN tournament_phase SET NOT NULL,
  ALTER COLUMN bet_format SET NOT NULL,
  ALTER COLUMN tournament_phase SET DEFAULT 'group'::public.match_tournament_phase,
  ALTER COLUMN bet_format SET DEFAULT 'regulation_1x2'::public.match_bet_format;

CREATE OR REPLACE FUNCTION public._prediction_popularity_key_new(
  p_bet_format public.match_bet_format,
  bet_a INTEGER,
  bet_b INTEGER,
  bet_pw TEXT
) RETURNS TEXT
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT CASE
    WHEN bet_a IS NULL OR bet_b IS NULL OR bet_a < 0 OR bet_b < 0 THEN NULL::TEXT
    WHEN p_bet_format = 'regulation_1x2' THEN
      CASE
        WHEN bet_a > bet_b THEN 'G_A'
        WHEN bet_a < bet_b THEN 'G_B'
        ELSE 'G_N'
      END
    WHEN bet_a = bet_b THEN
      CASE
        WHEN bet_pw = 'A' THEN 'P_A'
        WHEN bet_pw = 'B' THEN 'P_B'
        ELSE NULL::TEXT
      END
    WHEN bet_a > bet_b THEN 'P_A'
    ELSE 'P_B'
  END;
$$;

DROP FUNCTION IF EXISTS public.prediction_popularity_key(text, integer, integer, text);

ALTER FUNCTION public._prediction_popularity_key_new(
  public.match_bet_format,
  integer,
  integer,
  text
) RENAME TO prediction_popularity_key;

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
  pop_key       TEXT;
  total_valid   INTEGER;
  same_count    INTEGER;
  mult          NUMERIC;
BEGIN
  IF (NEW.score_a IS NOT DISTINCT FROM OLD.score_a)
     AND (NEW.score_b IS NOT DISTINCT FROM OLD.score_b)
     AND (NEW.playoff_winner IS NOT DISTINCT FROM OLD.playoff_winner) THEN
    RETURN NEW;
  END IF;

  IF (NEW.score_a IS NULL OR NEW.score_b IS NULL)
     AND (OLD.score_a IS NOT NULL AND OLD.score_b IS NOT NULL) THEN
    FOR bet_row IN SELECT * FROM bets WHERE match_id = NEW.id LOOP
      old_points := COALESCE(bet_row.points_won, 0);
      UPDATE bets SET points_won = 0 WHERE id = bet_row.id;
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

  SELECT COUNT(*)::INTEGER INTO total_valid
  FROM bets b
  WHERE b.match_id = NEW.id
    AND public.prediction_popularity_key(
      NEW.bet_format, b.bet_team_a, b.bet_team_b, b.bet_playoff_winner
    ) IS NOT NULL;

  real_result := CASE
    WHEN NEW.score_a > NEW.score_b THEN 'A'
    WHEN NEW.score_a = NEW.score_b THEN 'N'
    ELSE 'B'
  END;

  real_margin := ABS(NEW.score_a - NEW.score_b);

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

    pop_key := public.prediction_popularity_key(
      NEW.bet_format,
      bet_row.bet_team_a,
      bet_row.bet_team_b,
      bet_row.bet_playoff_winner
    );

    IF pop_key IS NULL THEN
      mult := 1;
    ELSE
      SELECT COUNT(*)::INTEGER INTO same_count
      FROM bets b
      WHERE b.match_id = NEW.id
        AND public.prediction_popularity_key(
          NEW.bet_format, b.bet_team_a, b.bet_team_b, b.bet_playoff_winner
        ) = pop_key;

      mult := public.prediction_popularity_multiplier(total_valid, same_count);
    END IF;

    points := ROUND(base_points::NUMERIC * mult)::INTEGER;

    UPDATE bets SET points_won = points WHERE id = bet_row.id;

    UPDATE competition_profiles
    SET score = COALESCE(score, 0) - old_points + points
    WHERE user_id = bet_row.user_id
      AND competition_id = bet_row.competition_id;
  END LOOP;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

ALTER TABLE public.matches DROP COLUMN phase;

CREATE OR REPLACE VIEW matches_with_teams AS
SELECT
  m.*,
  ta.name AS team_a_name,
  ta.code AS team_a_code,
  tb.name AS team_b_name,
  tb.code AS team_b_code,
  ta.group_name AS group_name
FROM matches m
LEFT JOIN teams ta ON m.team_a = ta.id
LEFT JOIN teams tb ON m.team_b = tb.id;
