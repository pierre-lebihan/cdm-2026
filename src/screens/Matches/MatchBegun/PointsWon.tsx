import { pointsWonTitleSelf } from '../../../lib/betOutcomeStatus'

const PointsWon = ({
  betTeamA,
  betTeamB,
  pointsWon,
  outcomeStatus,
  scores,
}) => {
  if (!scores) return null

  const { A, B } = scores

  const isPositive = pointsWon > 0

  const title = pointsWonTitleSelf(
    betTeamA,
    betTeamB,
    pointsWon,
    outcomeStatus,
    A,
    B,
  )

  return (
    <div title={title} className="flex flex-col items-center gap-0.5">
      <span className="text-[0.625rem] text-gray-400 font-medium uppercase tracking-wide">Points</span>
      <span
        className={`text-xs font-bold ${isPositive ? 'text-green-500' : 'text-navy'}`}
      >
        {pointsWon > 0 ? '+' : ''}
        {pointsWon || 0}
      </span>
    </div>
  )
}

export default PointsWon
