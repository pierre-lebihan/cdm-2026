import { useBet } from '../../../hooks/bets'
import Flag from '../../../components/Flag'
import PointsWon from './PointsWon'
import { isNumber } from 'lodash'
import { useNavigate } from 'react-router-dom'
import InformationMatch from '../MatchToBet/InformationMatch'
import { cardBgClassForUserBet } from '../../../lib/betOutcomeStatus'
import BetDistributionBar from './BetDistributionBar'

const Match = ({
  match,
  clickable = true,
}: {
  match: any
  clickable?: boolean
}) => {
  const [currentBet] = useBet(match.id)
  const navigate = useNavigate()

  if (!match.display) return null

  const hasBet =
    isNumber(currentBet?.betTeamA) && isNumber(currentBet?.betTeamB)

  const cardBg = cardBgClassForUserBet({
    hasBet,
    scoreA: match.scores.A,
    scoreB: match.scores.B,
    outcomeStatus: currentBet?.outcomeStatus,
    betTeamA: currentBet?.betTeamA,
    betTeamB: currentBet?.betTeamB,
    pointsWon: currentBet?.pointsWon,
  })

  return (
    <div
      className={`relative w-full rounded-[14px] py-3.5 px-4 shadow-card text-left flex flex-col gap-3 transition-all duration-150 ${cardBg} ${clickable ? 'cursor-pointer hover:shadow-card-hover hover:-translate-y-px' : ''}`}
      onClick={clickable ? () => navigate(`/matches/${match.id}`) : undefined}
      role={clickable ? 'button' : undefined}
    >
      <PointsWon {...match} {...currentBet} />

      <div className="flex justify-between items-center pr-14">
        <InformationMatch
          tournamentPhase={match.tournamentPhase}
          groupName={match.groupName}
        />
      </div>

      <div className="flex items-center justify-between gap-2">
        <div className="flex flex-col items-center gap-1.5 w-[72px] shrink-0">
          <Flag
            country={match.teamACode}
            className="h-9 w-9 object-contain rounded"
          />
          <span className="text-xs font-semibold text-navy text-center leading-tight">
            {match.teamAName ?? 'À déterminer'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex flex-col items-center gap-1">
            <span className="text-[0.625rem] text-gray-500 font-semibold uppercase tracking-wide">
              Score final
            </span>
            <span className="inline-block text-xl font-extrabold text-navy bg-white py-1.5 px-3.5 rounded-[10px] border border-gray-200">
              {match.scores.A} – {match.scores.B}
            </span>
          </div>

          <div className="flex flex-col items-center gap-1">
            <span className="text-[0.625rem] text-gray-400 font-semibold uppercase tracking-wide">
              Prono
            </span>
            <span className="inline-block text-lg font-bold text-navy/70 bg-gray-100 py-1.5 px-3.5 rounded-[10px]">
              {hasBet ? `${currentBet.betTeamA} – ${currentBet.betTeamB}` : '– – –'}
            </span>
          </div>
        </div>

        <div className="flex flex-col items-center gap-1.5 w-[72px] shrink-0">
          <Flag
            country={match.teamBCode}
            className="h-9 w-9 object-contain rounded"
          />
          <span className="text-xs font-semibold text-navy text-center leading-tight">
            {match.teamBName ?? 'À déterminer'}
          </span>
        </div>
      </div>

      <BetDistributionBar
        matchId={match.id}
        betFormat={match.betFormat}
        odds={match.odds}
      />
    </div>
  )
}

export default Match
