import { useBet, useBetDistribution } from '../../../hooks/bets'
import { useLanguage } from '../../../contexts/LanguageContext'
import Flag from '../../../components/Flag'
import PointsWon from './PointsWon'
import { isNumber } from 'lodash'
import { useNavigate } from 'react-router-dom'
import InformationMatch from '../MatchToBet/InformationMatch'
import { cardBgClassForUserBet } from '../../../lib/betOutcomeStatus'
import BetDistributionBar from './BetDistributionBar'
import MatchSkeleton from './MatchSkeleton'
import {
  getDrawBetPlayoffWinnerName,
  getPlayoffWinnerName,
  shouldShowPlayoffWinner,
} from '../../../lib/playoffWinner'

const Match = ({
  match,
  clickable = true,
}: {
  match: any
  clickable?: boolean
}) => {
  const { t } = useLanguage()
  const [currentBet, , betLoading] = useBet(match.id)
  const [distribution, distributionLoading] = useBetDistribution(match.id)
  const navigate = useNavigate()

  if (!match.display) return null

  if (betLoading || distributionLoading) {
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

  const playoffWinnerName = shouldShowPlayoffWinner(
    match.betFormat,
    match.scores.A,
    match.scores.B,
    match.playoffWinner,
  )
    ? getPlayoffWinnerName(
        match.playoffWinner,
        match.teamAName,
        match.teamBName,
      )
    : null

  const betPlayoffWinnerName = getDrawBetPlayoffWinnerName(
    currentBet?.betTeamA,
    currentBet?.betTeamB,
    currentBet?.betPlayoffWinner,
    match.teamAName,
    match.teamBName,
  )

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

      <div className="flex items-center justify-between gap-1.5">
        <div className="flex flex-col items-center gap-1.5 w-[60px] shrink-0">
          <Flag
            country={match.teamACode}
            className="h-9 w-9 object-contain rounded"
          />
          <span className="text-[0.7rem] font-semibold text-navy text-center leading-tight">
            {match.teamAName ?? t.common.tbd}
          </span>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <div className="flex flex-col items-center gap-1">
            <span className="text-[0.6rem] text-gray-500 font-semibold uppercase tracking-wide whitespace-nowrap">
              {t.matches.scoreFinal}
            </span>
            <span className="inline-block text-lg font-extrabold text-navy bg-white py-1 px-2.5 rounded-[10px] border border-gray-200 whitespace-nowrap">
              {match.scores.A} – {match.scores.B}
            </span>
          </div>

          <div className="flex flex-col items-center gap-1">
            <span className="text-[0.6rem] text-gray-400 font-semibold uppercase tracking-wide whitespace-nowrap">
              {t.scoring.prediction}
            </span>
            <span className="inline-block text-lg font-extrabold text-navy/70 bg-gray-100 py-1 px-2.5 rounded-[10px] whitespace-nowrap">
              {hasBet
                ? `${currentBet.betTeamA} – ${currentBet.betTeamB}`
                : '– – –'}
            </span>
          </div>
        </div>

        <div className="flex flex-col items-center gap-1.5 w-[60px] shrink-0">
          <Flag
            country={match.teamBCode}
            className="h-9 w-9 object-contain rounded"
          />
          <span className="text-[0.7rem] font-semibold text-navy text-center leading-tight">
            {match.teamBName ?? t.common.tbd}
          </span>
        </div>
      </div>

      {(playoffWinnerName || betPlayoffWinnerName) && (
        <div className="flex flex-wrap gap-2">
          {playoffWinnerName && (
            <span className="inline-flex items-center rounded-full bg-amber-100 px-3 py-1 text-[0.7rem] font-bold text-amber-900">
              {t.scoring.finalWinner} : {playoffWinnerName}
            </span>
          )}
          {betPlayoffWinnerName && (
            <span className="inline-flex items-center rounded-full bg-indigo-50 px-3 py-1 text-[0.7rem] font-bold text-indigo-700">
              {t.matches.playoffWinnerInDraw} : {betPlayoffWinnerName}
            </span>
          )}
        </div>
      )}

      <BetDistributionBar
        distribution={distribution}
        betFormat={match.betFormat}
      />
    </div>
  )
}

export default Match
