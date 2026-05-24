import conformsTo from 'lodash/conformsTo'
import isNumber from 'lodash/isNumber'
import { useEffect, useRef, useState } from 'react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { useBet, useBetsFromGame } from '../../../hooks/bets'
import { useAuth } from '../../../contexts/AuthContext'
import InformationMatch from './InformationMatch'
import BettingFeel, {
  BettingPotentialGain,
  useBettingFeelData,
} from './BettingFeel'
import ValidIcon from './ValidIcon'
import Flag from '../../../components/Flag'
import PlayoffWinnerSelector from './PlayoffWinnerSelector'
import MatchSkeleton from '../MatchBegun/MatchSkeleton'

const MAX_SCORE = 10
const SAVE_DEBOUNCE_MS = 800

const Match = ({ match }) => {
  const { user } = useAuth()
  const [bet, saveBet, betLoading] = useBet(match.id)
  const [allBets, betsLoading] = useBetsFromGame(match.id, Boolean(user?.id))
  const [currentBet, setCurrentBet] = useState(bet)
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (bet !== undefined) {
      setCurrentBet(bet)
    }
  }, [bet])

  useEffect(() => {
    return () => {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current)
      }
    }
  }, [])

  const needsPlayoffWinnerOnDraw =
    match.betFormat === 'knockout_decider' &&
    isNumber(currentBet?.betTeamA) &&
    currentBet?.betTeamA >= 0 &&
    isNumber(currentBet?.betTeamB) &&
    currentBet?.betTeamB >= 0 &&
    currentBet?.betTeamA === currentBet?.betTeamB

  const isBetValid = (updatedBet) => {
    const scoreValidator = (score) =>
      isNumber(score) && score >= 0 && score <= MAX_SCORE
    const scoresOk = conformsTo(updatedBet, {
      betTeamA: scoreValidator,
      betTeamB: scoreValidator,
    })
    if (!scoresOk) return false
    if (
      match.betFormat === 'knockout_decider' &&
      updatedBet.betTeamA === updatedBet.betTeamB
    ) {
      return (
        updatedBet.betPlayoffWinner === 'A' ||
        updatedBet.betPlayoffWinner === 'B'
      )
    }
    return true
  }

  const saveBetIfValid = (updatedBet) => {
    if (isBetValid(updatedBet)) {
      saveBet(updatedBet)
    }
  }

  const debouncedSaveBetIfValid = (updatedBet) => {
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current)
    }
    if (!isBetValid(updatedBet)) return
    saveTimerRef.current = setTimeout(() => {
      saveBet(updatedBet)
    }, SAVE_DEBOUNCE_MS)
  }

  const updateScore = (team, newScore) => {
    const score = Math.min(Math.max(newScore, 0), MAX_SCORE)
    if (score === currentBet?.[`betTeam${team}`]) return
    const otherTeamScore =
      team === 'A' ? currentBet?.betTeamB : currentBet?.betTeamA
    const updatedBet = {
      ...currentBet,
      [`betTeam${team}`]: score,
      betPlayoffWinner:
        score !== otherTeamScore ? null : currentBet?.betPlayoffWinner,
    }
    setCurrentBet(updatedBet)
    debouncedSaveBetIfValid(updatedBet)
  }

  const handleScoreChange =
    (team) =>
    ({ target: { value } }) => {
      const parsed = Number(value)
      if (isNaN(parsed)) return
      updateScore(team, parsed)
    }

  const handleKeyDown = (team) => (e) => {
    if (e.key !== 'ArrowUp' && e.key !== 'ArrowDown') return
    e.preventDefault()
    const currentScore = currentBet?.[`betTeam${team}`]
    const base =
      typeof currentScore === 'number' && currentScore >= 0 ? currentScore : -1
    if (e.key === 'ArrowUp') {
      updateScore(team, base + 1)
    }
    if (e.key === 'ArrowDown') {
      updateScore(team, base - 1)
    }
  }

  const handlePlayoffWinnerChange = (winner: 'A' | 'B') => {
    const updatedBet = { ...currentBet, betPlayoffWinner: winner }
    setCurrentBet(updatedBet)
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current)
      saveTimerRef.current = null
    }
    saveBetIfValid(updatedBet)
  }

  const handleTeamAChange = handleScoreChange('A')
  const handleTeamBChange = handleScoreChange('B')

  const betSaved = () => {
    if (!isBetValid(currentBet)) return false
    return (
      currentBet?.betTeamA === bet?.betTeamA &&
      currentBet?.betTeamB === bet?.betTeamB &&
      currentBet?.betPlayoffWinner === bet?.betPlayoffWinner
    )
  }

  const bettingFeel = useBettingFeelData({
    bets: allBets,
    betFormat: match.betFormat,
    tournamentPhase: match.tournamentPhase,
    betTeamA: currentBet?.betTeamA,
    betTeamB: currentBet?.betTeamB,
    betPlayoffWinner: currentBet?.betPlayoffWinner,
  })

  if (!match.display) return null

  if (betLoading || betsLoading) {
    return <MatchSkeleton />
  }

  const dateTime = match.dateTime
    ? new Date(match.dateTime.seconds * 1000)
    : null
  const timeStr = dateTime ? format(dateTime, 'HH:mm', { locale: fr }) : ''

  return (
    <div className="w-full bg-white rounded-[14px] py-3.5 px-4 shadow-card border-none text-left flex flex-col gap-2.5 transition-all duration-150">
      <div className="flex justify-between items-center gap-2">
        <InformationMatch
          tournamentPhase={match.tournamentPhase}
          groupName={match.groupName}
        />
        <span className="text-xs font-semibold text-gray-400 shrink-0">
          {timeStr}
        </span>
      </div>

      <div className="flex items-end justify-between gap-2">
        <div className="flex flex-col items-center gap-1.5 w-[90px] shrink-0">
          <Flag
            country={match.teamACode}
            className="h-9 w-9 object-contain rounded"
          />
          <span className="text-xs font-semibold text-navy text-center leading-tight">
            {match.teamAName ?? 'À déterminer'}
          </span>
        </div>

        <div className="flex min-w-[120px] shrink-0 flex-col items-center gap-1.5">
          <BettingPotentialGain data={bettingFeel} />
          <div className="flex items-center gap-1.5">
            <input
              type="text"
              placeholder="–"
              className="w-11 h-11 rounded-[10px] border-[1.5px] border-gray-200 text-center text-xl font-bold text-navy bg-gray-50 outline-none transition-colors focus:border-indigo-500 focus:bg-white placeholder:text-gray-300"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={2}
              value={
                currentBet?.betTeamA !== undefined && currentBet?.betTeamA >= 0
                  ? currentBet?.betTeamA
                  : ''
              }
              onChange={handleTeamAChange}
              onKeyDown={handleKeyDown('A')}
            />
            <ValidIcon valid={betSaved()} />
            <input
              type="text"
              placeholder="–"
              className="w-11 h-11 rounded-[10px] border-[1.5px] border-gray-200 text-center text-xl font-bold text-navy bg-gray-50 outline-none transition-colors focus:border-indigo-500 focus:bg-white placeholder:text-gray-300"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={2}
              value={currentBet?.betTeamB >= 0 ? currentBet?.betTeamB : ''}
              onChange={handleTeamBChange}
              onKeyDown={handleKeyDown('B')}
            />
          </div>
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

      {needsPlayoffWinnerOnDraw && (
        <PlayoffWinnerSelector
          teamAName={match.teamAName}
          teamBName={match.teamBName}
          value={currentBet?.betPlayoffWinner ?? null}
          onChange={handlePlayoffWinnerChange}
        />
      )}

      <BettingFeel betFormat={match.betFormat} data={bettingFeel} />
    </div>
  )
}

export default Match
