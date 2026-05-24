import { useBetFromUser, useBetsFromGame } from '../../../hooks/bets'
import Flag from '../../../components/Flag'
import PointsWon from './PointsWon'
import { isNumber } from 'lodash'
import { useNavigate, useParams } from 'react-router-dom'
import InformationMatch from '../../Matches/MatchToBet/InformationMatch'
import { cardBgClassForUserBet } from '../../../lib/betOutcomeStatus'
import BetDistributionBar from '../../Matches/MatchBegun/BetDistributionBar'
import MatchSkeleton from '../../Matches/MatchBegun/MatchSkeleton'

const Match = ({ match }) => {
  const { id } = useParams()
  const [currentBet, betLoading] = useBetFromUser(match.id, id)
  const [allBets, betsLoading] = useBetsFromGame(match.id, true)
  const navigate = useNavigate()

  if (!match.display) return null

  if (betLoading || betsLoading) {
    return <MatchSkeleton />
  }

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
      className={`relative w-full rounded-[14px] py-3.5 px-4 shadow-card text-left flex flex-col gap-3 transition-all duration-150 cursor-pointer hover:shadow-card-hover hover:-translate-y-px ${cardBg}`}
      onClick={() => navigate(`/matches/${match.id}`)}
      role="button"
    >
      <PointsWon {...match} {...currentBet} />

      <div className="flex justify-between items-center pr-14">
        <InformationMatch
          tournamentPhase={match.tournamentPhase}
          groupName={match.groupName}
        />
      </div>

      <div className="flex items-center justify-between gap-1.5">
        <div className="flex flex-col items-center gap-1.5 w-[60px] shrink-0">
          <Flag
            country={match.teamACode}
            className="h-9 w-9 object-contain rounded"
          />
          <span className="text-[0.7rem] font-semibold text-navy text-center leading-tight">
            {match.teamAName ?? 'À déterminer'}
          </span>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <div className="flex flex-col items-center gap-1">
            <span className="text-[0.6rem] text-gray-500 font-semibold uppercase tracking-wide whitespace-nowrap">
              Score final
            </span>
            <span className="inline-block text-lg font-extrabold text-navy bg-white py-1 px-2.5 rounded-[10px] border border-gray-200 whitespace-nowrap">
              {match.scores.A} – {match.scores.B}
            </span>
          </div>

          <div className="flex flex-col items-center gap-1">
            <span className="text-[0.6rem] text-gray-400 font-semibold uppercase tracking-wide whitespace-nowrap">
              Son prono
            </span>
            <span className="inline-block text-lg font-extrabold text-navy/70 bg-gray-100 py-1 px-2.5 rounded-[10px] whitespace-nowrap">
              {hasBet ? `${currentBet.betTeamA} – ${currentBet.betTeamB}` : '– – –'}
            </span>
          </div>
        </div>

        <div className="flex flex-col items-center gap-1.5 w-[60px] shrink-0">
          <Flag
            country={match.teamBCode}
            className="h-9 w-9 object-contain rounded"
          />
          <span className="text-[0.7rem] font-semibold text-navy text-center leading-tight">
            {match.teamBName ?? 'À déterminer'}
          </span>
        </div>
      </div>

      <BetDistributionBar bets={allBets} betFormat={match.betFormat} />
    </div>
  )
}

export default Match
