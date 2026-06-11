DO $$
DECLARE
  job RECORD;
BEGIN
  FOR job IN
    SELECT jobid
    FROM cron.job
    WHERE jobname IN (
      'notify-final-winner-cron',
      'update-odds-cron'
    )
      OR command LIKE '%/functions/v1/notify-final-winner%'
      OR command LIKE '%/functions/v1/update-odds%'
  LOOP
    PERFORM cron.unschedule(job.jobid);
  END LOOP;
END $$;
