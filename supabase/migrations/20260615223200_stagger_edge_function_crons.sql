DO $$
DECLARE
  job RECORD;
BEGIN
  FOR job IN
    SELECT jobid
    FROM cron.job
    WHERE jobname IN (
      'update-results-cron',
      'notify-pre-match-cron'
    )
      OR command LIKE '%/functions/v1/update-results%'
      OR command LIKE '%/functions/v1/notify-pre-match%'
  LOOP
    PERFORM cron.unschedule(job.jobid);
  END LOOP;
END $$;

SELECT cron.schedule(
  'update-results-cron',
  '5-55/10 0-7,16-23 * * *',
  $$
  SELECT net.http_post(
    url := 'https://mpsaxiwzscaekahzwjlq.supabase.co/functions/v1/update-results',
    body := '{}'::jsonb,
    headers := '{"Content-Type": "application/json"}'::jsonb,
    timeout_milliseconds := 30000
  );
  $$
);

SELECT cron.schedule(
  'notify-pre-match-cron',
  '2-57/5 0-4,15-23 * * *',
  $$
  SELECT net.http_post(
    url := 'https://mpsaxiwzscaekahzwjlq.supabase.co/functions/v1/notify-pre-match',
    body := '{}'::jsonb,
    headers := '{"Content-Type": "application/json"}'::jsonb
  );
  $$
);
