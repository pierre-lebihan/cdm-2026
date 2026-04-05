import { useBetFromUser } from '../../../hooks/bets'
import Flag from '../../../components/Flag'
import PointsWon from './PointsWon'
import { isNumber } from 'lodash'
import { useNavigate, useParams } from 'react-router-dom'
import InformationMatch from '../../Matches/MatchToBet/InformationMatch'
import { tournamentPhaseMultiplier } from '../../../lib/matchEnums'

function getCardBgClass(
  betTeamA: number | null | undefined,
  betTeamB: number | null | undefined,
  pointsWon: number | null | undefined,
  scoreA: number | null,
  scoreB: number | null,
): string {
  const hasBet = isNumber(betTeamA) && isNumber(betTeamB)

  if (!hasBet) return 'bg-gray-100 border border-gray-300'

  if (!pointsWon || pointsWon <= 0) return 'bg-red-50 border border-red-200'

  const isExactScore = betTeamA === scoreA && betTeamB === scoreB
  if (isExactScore) return 'bg-green-50 border border-green-200'

  return 'bg-amber-50 border border-amber-200'
}

const Match = ({ match }) => {
  const { id } = useParams()
  const [currentBet] = useBetFromUser(match.id, id)
  const navigate = useNavigate()

  const myOdd =
    !isNumber(currentBet?.betTeamA) || !isNumber(currentBet?.betTeamB)
      ? null
      : currentBet?.betTeamA > currentBet?.betTeamB
        ? match.odds.PA
        : currentBet?.betTeamA < currentBet?.betTeamB
          ? match.odds.PB
          : match.odds.PN

  const winningOdd =
    match.scores.A > match.scores.B
      ? match.odds.PA
      : match.scores.A < match.scores.B
        ? match.odds.PB
        : match.odds.PN

  if (!match.display) return null

  const cardBg = getCardBgClass(
    currentBet?.betTeamA,
    currentBet?.betTeamB,
    currentBet?.pointsWon,
    match.scores.A,
    match.scores.B,
  )

  return (
    <button
      className={`w-full rounded-[14px] py-3.5 px-4 shadow-card text-left flex flex-col gap-2.5 transition-all duration-150 cursor-pointer hover:shadow-card-hover hover:-translate-y-px ${cardBg}`}
      onClick={() => navigate(`/matches/${match.id}`)}
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

        <div className="shrink-0">
          <span className="inline-block text-xl font-extrabold text-navy bg-gray-100 py-1.5 px-3.5 rounded-[10px]">
            {match.scores.A} – {match.scores.B}
          </span>
        </div>

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

      <div className="flex justify-between items-center gap-1 pt-2 border-t border-gray-100">
        <div className="flex flex-col items-center gap-0.5">
          <span className="text-[0.625rem] text-gray-400 font-medium uppercase tracking-wide">
            Sa cote
          </span>
          <span className="text-xs font-bold text-navy">{myOdd ?? '–'}</span>
        </div>
        <div className="flex flex-col items-center gap-0.5">
          <span className="text-[0.625rem] text-gray-400 font-medium uppercase tracking-wide">
            Cote gagnante
          </span>
          <span className="text-xs font-bold text-navy">{winningOdd}</span>
        </div>
        <div className="flex flex-col items-center gap-0.5">
          <span className="text-[0.625rem] text-gray-400 font-medium uppercase tracking-wide">
            Multiplicateur
          </span>
          <span className="text-xs font-bold text-navy">
            x{tournamentPhaseMultiplier(match.tournamentPhase)}
          </span>
        </div>
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
    </button>
  )
}

export default Match
