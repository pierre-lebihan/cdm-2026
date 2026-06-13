CREATE OR REPLACE VIEW public.matches_with_teams AS
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
  m.finished,
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

DO $$
DECLARE
  job RECORD;
BEGIN
  FOR job IN
    SELECT jobid
    FROM cron.job
    WHERE jobname = 'update-results-cron'
      OR command LIKE '%/functions/v1/update-results%'
  LOOP
    PERFORM cron.unschedule(job.jobid);
  END LOOP;
END $$;

SELECT cron.schedule(
  'update-results-cron',
  '*/15 0-7,16-23 * * *',
  $$
  SELECT net.http_post(
    url := 'https://mpsaxiwzscaekahzwjlq.supabase.co/functions/v1/update-results',
    body := '{}'::jsonb,
    headers := '{"Content-Type": "application/json"}'::jsonb,
    timeout_milliseconds := 30000
  );
  $$
);
