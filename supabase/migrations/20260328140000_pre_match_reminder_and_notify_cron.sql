ALTER TABLE matches
  ADD COLUMN IF NOT EXISTS pre_match_reminder_sent_at TIMESTAMPTZ;

SELECT cron.schedule(
  'notify-pre-match-cron',
  '* * * * *',
  $$
  SELECT net.http_post(
    url := 'https://mpsaxiwzscaekahzwjlq.supabase.co/functions/v1/notify-pre-match',
    body := '{}'::jsonb,
    headers := '{"Content-Type": "application/json"}'::jsonb
  );
  $$
);
