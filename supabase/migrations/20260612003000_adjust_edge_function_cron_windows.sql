-- pg_cron runs in UTC. During the 2026 World Cup window, Sofia is UTC+3.
-- update-results: 19:00-10:00 Sofia => 16:00-07:00 UTC.
-- notify-pre-match: 18:00-07:00 Sofia => 15:00-04:00 UTC.

SELECT cron.unschedule(jobid)
FROM cron.job
WHERE jobname = 'update-results-cron';

SELECT cron.schedule(
  'update-results-cron',
  '*/5 0-7,16-23 * * *',
  $$
  SELECT net.http_post(
    url := 'https://mpsaxiwzscaekahzwjlq.supabase.co/functions/v1/update-results',
    body := '{}'::jsonb,
    headers := '{"Content-Type": "application/json"}'::jsonb
  );
  $$
);

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
