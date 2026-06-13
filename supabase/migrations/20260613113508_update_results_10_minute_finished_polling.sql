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
  '*/10 0-7,16-23 * * *',
  $$
  SELECT net.http_post(
    url := 'https://mpsaxiwzscaekahzwjlq.supabase.co/functions/v1/update-results',
    body := '{}'::jsonb,
    headers := '{"Content-Type": "application/json"}'::jsonb,
    timeout_milliseconds := 30000
  );
  $$
);
