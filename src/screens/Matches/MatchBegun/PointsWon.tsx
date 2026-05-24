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
  const points = pointsWon || 0
  const isPositive = points > 0

  const title = pointsWonTitleSelf(
    betTeamA,
    betTeamB,
    pointsWon,
    outcomeStatus,
    A,
    B,
  )

  const bubbleClass = isPositive
    ? 'bg-green-500 text-white shadow-md'
    : 'bg-gray-200 text-gray-500'

  return (
    <div
      title={title}
      className={`absolute -top-2 -right-2 z-10 flex flex-col items-center justify-center min-w-[44px] h-[44px] px-2 rounded-full font-extrabold text-sm leading-none ring-2 ring-cream ${bubbleClass}`}
    >
      <span className="text-[0.6rem] font-semibold uppercase tracking-wide opacity-80">
        pts
      </span>
      <span className="text-base">
        {isPositive ? '+' : ''}
        {points}
      </span>
    </div>
  )
}

export default PointsWon
