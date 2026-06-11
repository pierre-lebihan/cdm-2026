DO $$
DECLARE
  job RECORD;
BEGIN
  FOR job IN
    SELECT jobid
    FROM cron.job
    WHERE jobname IN (
      'update-results-cron',
      'notify-pre-match-cron',
      'notify-final-winner-cron',
      'update-odds-cron',
      'purge-cron-net-history'
    )
      OR command LIKE '%/functions/v1/update-results%'
      OR command LIKE '%/functions/v1/notify-pre-match%'
      OR command LIKE '%/functions/v1/notify-final-winner%'
      OR command LIKE '%/functions/v1/update-odds%'
      OR command LIKE '%net._http_response%'
      OR command LIKE '%cron.job_run_details%'
  LOOP
    PERFORM cron.unschedule(job.jobid);
  END LOOP;
END $$;

SELECT cron.schedule(
  'update-results-cron',
  '*/5 0-4,15-23 * * *',
  $$
  SELECT net.http_post(
    url := 'https://mpsaxiwzscaekahzwjlq.supabase.co/functions/v1/update-results',
    body := '{}'::jsonb,
    headers := '{"Content-Type": "application/json"}'::jsonb
  );
  $$
);

SELECT cron.schedule(
  'notify-pre-match-cron',
  '*/5 0-4,15-23 * * *',
  $$
  SELECT net.http_post(
    url := 'https://mpsaxiwzscaekahzwjlq.supabase.co/functions/v1/notify-pre-match',
    body := '{}'::jsonb,
    headers := '{"Content-Type": "application/json"}'::jsonb
  );
  $$
);

SELECT cron.schedule(
  'notify-final-winner-cron',
  '0 */4 * * *',
  $$
  SELECT net.http_post(
    url := 'https://mpsaxiwzscaekahzwjlq.supabase.co/functions/v1/notify-final-winner',
    body := '{}'::jsonb,
    headers := '{"Content-Type": "application/json"}'::jsonb
  );
  $$
);

SELECT cron.schedule(
  'purge-cron-net-history',
  '15 * * * *',
  $$
  DELETE FROM net._http_response WHERE created < now() - interval '6 hours';
  DELETE FROM cron.job_run_details WHERE end_time < now() - interval '1 day';
  $$
);

CREATE INDEX IF NOT EXISTS idx_matches_competition_date
  ON public.matches (competition_id, date_time);

CREATE INDEX IF NOT EXISTS idx_matches_results_window
  ON public.matches (date_time)
  WHERE finished = false
    AND visible_to_users = true
    AND date_time IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_matches_pre_match_window
  ON public.matches (date_time)
  WHERE finished = false
    AND visible_to_users = true
    AND pre_match_reminder_sent_at IS NULL
    AND date_time IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_bets_match_user_complete
  ON public.bets (match_id, user_id)
  WHERE bet_team_a IS NOT NULL
    AND bet_team_b IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_bets_user_competition_match
  ON public.bets (user_id, competition_id, match_id);

CREATE INDEX IF NOT EXISTS idx_teams_competition_id
  ON public.teams (competition_id);
