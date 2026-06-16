CREATE OR REPLACE VIEW public.bet_distribution_by_match AS
WITH keyed_bets AS (
  SELECT
    b.competition_id,
    b.match_id,
    public.match_prediction_popularity_key(
      m.bet_format,
      b.bet_team_a,
      b.bet_team_b,
      b.bet_playoff_winner
    ) AS popularity_key
  FROM public.bets b
  JOIN public.matches m ON m.id = b.match_id
  WHERE b.competition_id IS NOT NULL
    AND b.match_id IS NOT NULL
    AND b.bet_team_a IS NOT NULL
    AND b.bet_team_b IS NOT NULL
)
SELECT
  competition_id,
  match_id,
  COUNT(*) FILTER (WHERE popularity_key IN ('G_A', 'P_A'))::INTEGER AS count_a,
  COUNT(*) FILTER (WHERE popularity_key = 'G_N')::INTEGER AS count_n,
  COUNT(*) FILTER (WHERE popularity_key IN ('G_B', 'P_B'))::INTEGER AS count_b,
  COUNT(*)::INTEGER AS total
FROM keyed_bets
WHERE popularity_key IS NOT NULL
GROUP BY competition_id, match_id;

ALTER VIEW public.bet_distribution_by_match SET (security_invoker = true);
