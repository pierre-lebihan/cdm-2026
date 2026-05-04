ALTER TABLE public.matches
  ADD COLUMN IF NOT EXISTS score_provider TEXT,
  ADD COLUMN IF NOT EXISTS score_payload JSONB,
  ADD COLUMN IF NOT EXISTS score_checked_at TIMESTAMPTZ;

SELECT cron.unschedule('update-results-cron');

SELECT cron.schedule(
  'update-results-cron',
  '*/5 * * * *',
  $$
  SELECT net.http_post(
    url := 'https://mpsaxiwzscaekahzwjlq.supabase.co/functions/v1/update-results',
    body := '{}'::jsonb,
    headers := '{"Content-Type": "application/json"}'::jsonb
  );
  $$
);
