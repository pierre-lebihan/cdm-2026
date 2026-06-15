DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_type
    WHERE typname = 'match_status'
      AND typnamespace = 'public'::regnamespace
  ) THEN
    CREATE TYPE public.match_status AS ENUM ('PLANNED', 'ONGOING', 'FINISHED');
  END IF;
END $$;

ALTER TABLE public.matches
  ADD COLUMN IF NOT EXISTS status public.match_status;

UPDATE public.matches
SET status = CASE
  WHEN COALESCE(finished, false) THEN 'FINISHED'::public.match_status
  WHEN date_time IS NOT NULL AND date_time <= now() THEN 'ONGOING'::public.match_status
  ELSE 'PLANNED'::public.match_status
END
WHERE status IS NULL;

ALTER TABLE public.matches
  ALTER COLUMN status SET DEFAULT 'PLANNED'::public.match_status,
  ALTER COLUMN status SET NOT NULL;

DROP INDEX IF EXISTS public.idx_matches_results_window;
DROP INDEX IF EXISTS public.idx_matches_pre_match_window;

DROP VIEW IF EXISTS public.matches_with_teams;

CREATE VIEW public.matches_with_teams AS
SELECT
  m.id,
  m.date_time,
  m.city,
  m.team_a,
  m.team_b,
  m.streaming,
  m.score_a,
  m.score_b,
  m.odds_a,
  m.odds_b,
  m.odds_draw,
  m.status,
  m.api_id,
  m.competition_id,
  m.pre_match_reminder_sent_at,
  m.playoff_winner,
  m.visible_to_users,
  m.tournament_phase,
  m.bet_format,
  ta.name AS team_a_name,
  ta.code AS team_a_code,
  tb.name AS team_b_name,
  tb.code AS team_b_code,
  ta.group_name,
  m.score_provider,
  m.score_payload,
  m.score_checked_at
FROM public.matches m
LEFT JOIN public.teams ta ON m.team_a = ta.id
LEFT JOIN public.teams tb ON m.team_b = tb.id;

ALTER VIEW public.matches_with_teams SET (security_invoker = true);

ALTER TABLE public.matches
  DROP COLUMN IF EXISTS finished;

CREATE INDEX IF NOT EXISTS idx_matches_results_window
  ON public.matches (date_time)
  WHERE status <> 'FINISHED'::public.match_status
    AND visible_to_users = true
    AND date_time IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_matches_pre_match_window
  ON public.matches (date_time)
  WHERE status = 'PLANNED'::public.match_status
    AND visible_to_users = true
    AND pre_match_reminder_sent_at IS NULL
    AND date_time IS NOT NULL;

CREATE OR REPLACE FUNCTION public.handle_bet_odds_refresh()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  v_match_id TEXT;
  v_start TIMESTAMPTZ;
  v_status public.match_status;
BEGIN
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

CREATE OR REPLACE FUNCTION public.prevent_late_bets()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  match_start TIMESTAMPTZ;
  match_visible BOOLEAN;
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

  SELECT date_time, COALESCE(visible_to_users, true), status
  INTO match_start, match_visible, current_status
  FROM public.matches
  WHERE id = NEW.match_id;

  IF NOT COALESCE(match_visible, true) THEN
    RAISE EXCEPTION 'Ce match n''est pas ouvert aux pronostics';
  END IF;

  IF match_start IS NOT NULL AND match_start <= now() THEN
    RAISE EXCEPTION 'Les paris sont fermés pour ce match (déjà commencé)';
  END IF;

  IF current_status IS DISTINCT FROM 'PLANNED'::public.match_status THEN
    RAISE EXCEPTION 'Les paris sont fermés pour ce match';
  END IF;

  RETURN NEW;
END;
$$;
