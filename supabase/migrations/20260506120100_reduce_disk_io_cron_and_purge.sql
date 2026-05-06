-- Reduce disk IO: lower notify-pre-match cron frequency, purge cron/pg_net history, add partial index

-- 1. Reschedule notify-pre-match: every 5 min during match hours (0-4 + 15-23 UTC)
SELECT cron.unschedule(jobid)
FROM cron.job
WHERE jobname = 'notify-pre-match-cron';

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

-- 2. Daily purge of pg_net + pg_cron history
SELECT cron.unschedule(jobid)
FROM cron.job
WHERE jobname = 'purge-cron-net-history';

SELECT cron.schedule(
  'purge-cron-net-history',
  '0 5 * * *',
  $$
  DELETE FROM net._http_response WHERE created < now() - interval '2 days';
  DELETE FROM cron.job_run_details WHERE end_time < now() - interval '2 days';
  $$
);

-- 3. Partial index matching the notify-pre-match query
CREATE INDEX IF NOT EXISTS idx_matches_pre_match_window
  ON public.matches (date_time)
  WHERE finished = false
    AND visible_to_users = true
    AND pre_match_reminder_sent_at IS NULL;
