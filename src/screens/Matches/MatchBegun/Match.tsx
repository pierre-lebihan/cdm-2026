import { useCallback, useMemo, useState } from 'react'
import { useBet } from '../../../hooks/bets'
import Flag from '../../../components/Flag'
import PointsWon from './PointsWon'
import { isNumber } from 'lodash'
import { useNavigate } from 'react-router-dom'
import InformationMatch from '../MatchToBet/InformationMatch'
import { tournamentPhaseMultiplier } from '../../../lib/matchEnums'
import { cardBgClassForUserBet } from '../../../lib/betOutcomeStatus'
import { computeScoringBreakdown, formatOdds } from '../../../lib/scoring'
import ScoreBreakdownModal from './ScoreBreakdownModal'

const Match = ({
  match,
  clickable = true,
}: {
  match: any
  clickable?: boolean
}) => {
  const [currentBet] = useBet(match.id)
  const navigate = useNavigate()
  const [breakdownOpen, setBreakdownOpen] = useState(false)

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

  const breakdown = useMemo(
    () =>
      computeScoringBreakdown({
        scoreA: match.scores.A,
        scoreB: match.scores.B,
        playoffWinner: match.playoffWinner,
        betTeamA: currentBet?.betTeamA,
        betTeamB: currentBet?.betTeamB,
        betPlayoffWinner: currentBet?.betPlayoffWinner,
        betFormat: match.betFormat,
        tournamentPhase: match.tournamentPhase,
        oddsA: match.odds.PA,
        oddsB: match.odds.PB,
        oddsDraw: match.odds.PN,
      }),
    [match, currentBet],
  )

  const handleScoreClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    setBreakdownOpen(true)
  }, [])

  const handleCloseBreakdown = useCallback(() => {
    setBreakdownOpen(false)
  }, [])

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
      className={`w-full rounded-[14px] py-3.5 px-4 shadow-card text-left flex flex-col gap-2.5 transition-all duration-150 ${cardBg} ${clickable ? 'cursor-pointer hover:shadow-card-hover hover:-translate-y-px' : ''}`}
      onClick={clickable ? () => navigate(`/matches/${match.id}`) : undefined}
      role={clickable ? 'button' : undefined}
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
          <button
            type="button"
            onClick={handleScoreClick}
            className="inline-block text-xl font-extrabold text-navy bg-gray-100 py-1.5 px-3.5 rounded-[10px] border-none cursor-pointer hover:bg-gray-200 transition-colors"
            title="Voir le détail du calcul"
          >
            {match.scores.A} – {match.scores.B}
          </button>
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
            Ma cote
          </span>
          <span className="text-xs font-bold text-navy">{formatOdds(myOdd)}</span>
        </div>
        <div className="flex flex-col items-center gap-0.5">
          <span className="text-[0.625rem] text-gray-400 font-medium uppercase tracking-wide">
            Cote gagnante
          </span>
          <span className="text-xs font-bold text-navy">{formatOdds(winningOdd)}</span>
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
            Mon prono
          </span>
          <span className="text-xs font-bold text-navy">
            {currentBet?.betTeamA ?? '–'} – {currentBet?.betTeamB ?? '–'}
          </span>
        </div>
        <PointsWon {...match} {...currentBet} />
      </div>

      <ScoreBreakdownModal
        open={breakdownOpen}
        onClose={handleCloseBreakdown}
        breakdown={breakdown}
        tournamentPhase={match.tournamentPhase}
        teamAName={match.teamAName}
        teamBName={match.teamBName}
        scoreA={match.scores.A}
        scoreB={match.scores.B}
        betTeamA={currentBet?.betTeamA}
        betTeamB={currentBet?.betTeamB}
        pointsWon={currentBet?.pointsWon}
        title="Détail de mes points"
      />
    </div>
  )
}

export default Match
