ALTER TABLE public.competitions
  ADD COLUMN IF NOT EXISTS final_winner_reminder_sent_at TIMESTAMPTZ;

SELECT cron.unschedule('notify-final-winner-cron')
WHERE EXISTS (
  SELECT 1
  FROM cron.job
  WHERE jobname = 'notify-final-winner-cron'
);

SELECT cron.schedule(
  'notify-final-winner-cron',
  '0 * * * *',
  $$
  SELECT net.http_post(
    url := 'https://mpsaxiwzscaekahzwjlq.supabase.co/functions/v1/notify-final-winner',
    body := '{}'::jsonb,
    headers := '{"Content-Type": "application/json"}'::jsonb
  );
  $$
);
