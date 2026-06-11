-- Reduce disk IO: restrict update-results cron to match hours (0-4 + 15-23 UTC),
-- same window as notify-pre-match. No CDM match is played between 4:00 and 15:00 UTC,
-- so polling Gemini during those hours is wasted IO/WAL on the Nano instance.

SELECT cron.unschedule(jobid)
FROM cron.job
WHERE jobname = 'update-results-cron';

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

-- Tighten pg_net/cron history retention: responses are never read, keep them short.
SELECT cron.unschedule(jobid)
FROM cron.job
WHERE jobname = 'purge-cron-net-history';

SELECT cron.schedule(
  'purge-cron-net-history',
  '0 5 * * *',
  $$
  DELETE FROM net._http_response WHERE created < now() - interval '6 hours';
  DELETE FROM cron.job_run_details WHERE end_time < now() - interval '1 day';
  $$
);
