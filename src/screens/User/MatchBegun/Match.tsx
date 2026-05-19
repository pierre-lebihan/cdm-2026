import { useBetFromUser } from '../../../hooks/bets'
import Flag from '../../../components/Flag'
import PointsWon from './PointsWon'
import { isNumber } from 'lodash'
import { useNavigate, useParams } from 'react-router-dom'
import InformationMatch from '../../Matches/MatchToBet/InformationMatch'
import { cardBgClassForUserBet } from '../../../lib/betOutcomeStatus'
import BetDistributionBar from '../../Matches/MatchBegun/BetDistributionBar'

const Match = ({ match }) => {
  const { id } = useParams()
  const [currentBet] = useBetFromUser(match.id, id)
  const navigate = useNavigate()

  if (!match.display) return null

  const cardBg = cardBgClassForUserBet({
    hasBet: isNumber(currentBet?.betTeamA) && isNumber(currentBet?.betTeamB),
    scoreA: match.scores.A,
    scoreB: match.scores.B,
    outcomeStatus: currentBet?.outcomeStatus,
    betTeamA: currentBet?.betTeamA,
    betTeamB: currentBet?.betTeamB,
    pointsWon: currentBet?.pointsWon,
  })

  return (
    <div
      className={`w-full rounded-[14px] py-3.5 px-4 shadow-card text-left flex flex-col gap-2.5 transition-all duration-150 cursor-pointer hover:shadow-card-hover hover:-translate-y-px ${cardBg}`}
      onClick={() => navigate(`/matches/${match.id}`)}
      role="button"
    >
      <div className="flex justify-between items-center">
        <InformationMatch
          tournamentPhase={match.tournamentPhase}
          groupName={match.groupName}
        />
      </div>

      <div className="flex items-center justify-between gap-2">
        <div className="flex flex-col items-center gap-1.5 w-[90px] shrink-0">
          <Flag
            country={match.teamACode}
            className="h-9 w-9 object-contain rounded"
          />
          <span className="text-xs font-semibold text-navy text-center leading-tight">
            {match.teamAName ?? 'À déterminer'}
          </span>
        </div>

        <span className="inline-block text-xl font-extrabold text-navy bg-gray-100 py-1.5 px-3.5 rounded-[10px]">
          {match.scores.A} – {match.scores.B}
        </span>

        <div className="flex flex-col items-center gap-1.5 w-[90px] shrink-0">
          <Flag
            country={match.teamBCode}
            className="h-9 w-9 object-contain rounded"
          />
          <span className="text-xs font-semibold text-navy text-center leading-tight">
            {match.teamBName ?? 'À déterminer'}
          </span>
        </div>
      </div>

      <div className="flex justify-between items-center gap-2 pt-2 border-t border-gray-100">
        <div className="flex flex-col items-center gap-0.5">
          <span className="text-[0.625rem] text-gray-400 font-medium uppercase tracking-wide">
            Son prono
          </span>
          <span className="text-xs font-bold text-navy">
            {currentBet?.betTeamA ?? '–'} – {currentBet?.betTeamB ?? '–'}
          </span>
        </div>
        <PointsWon {...match} {...currentBet} />
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
