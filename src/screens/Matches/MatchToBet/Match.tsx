import conformsTo from 'lodash/conformsTo'
import isNumber from 'lodash/isNumber'
import { useEffect, useState } from 'react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { useBet } from '../../../hooks/bets'
import InformationMatch from './InformationMatch'
import Odds from './Odds'
import ValidIcon from './ValidIcon'
import Flag from '../../../components/Flag'
import PlayoffWinnerSelector from './PlayoffWinnerSelector'

const PLAYOFF_PHASES = new Set(['1', '2', '3', '4', '5', '6'])

const Match = ({ match }) => {
  const [bet, saveBet] = useBet(match.id)
  const [currentBet, setCurrentBet] = useState(bet)

  useEffect(() => {
    if (bet !== undefined) {
      setCurrentBet(bet)
    }
  }, [bet])

  const isPlayoff = PLAYOFF_PHASES.has(match.phase)
  const isDraw =
    isNumber(currentBet?.betTeamA) &&
    currentBet?.betTeamA >= 0 &&
    isNumber(currentBet?.betTeamB) &&
    currentBet?.betTeamB >= 0 &&
    currentBet?.betTeamA === currentBet?.betTeamB

  const isBetValid = (updatedBet) => {
    const scoreValidator = (score) => isNumber(score) && score >= 0
    const scoresOk = conformsTo(updatedBet, {
      betTeamA: scoreValidator,
      betTeamB: scoreValidator,
    })
    if (!scoresOk) return false
    // Pour un match de phase finale avec score nul, le vainqueur est obligatoire
    if (isPlayoff && updatedBet.betTeamA === updatedBet.betTeamB) {
      return updatedBet.betPlayoffWinner === 'A' || updatedBet.betPlayoffWinner === 'B'
    }
    return true
  }

  const handleScoreChange =
    (team) =>
    ({ target: { value } }) => {
      const updatedBet = {
        ...currentBet,
        [`betTeam${team}`]: Number(value),
        // Si on change le score et que ce n'est plus un nul, on reset le playoff winner
        betPlayoffWinner:
          team === 'A'
            ? Number(value) !== currentBet?.betTeamB
              ? null
              : currentBet?.betPlayoffWinner
            : Number(value) !== currentBet?.betTeamA
              ? null
              : currentBet?.betPlayoffWinner,
      }
      setCurrentBet(updatedBet)
      saveBetIfValid(updatedBet)
    }

  const handlePlayoffWinnerChange = (winner: 'A' | 'B') => {
    const updatedBet = { ...currentBet, betPlayoffWinner: winner }
    setCurrentBet(updatedBet)
    saveBetIfValid(updatedBet)
  }

  const handleTeamAChange = handleScoreChange('A')
  const handleTeamBChange = handleScoreChange('B')

  const saveBetIfValid = (updatedBet) => {
    if (isBetValid(updatedBet)) {
      saveBet(updatedBet)
    }
  }

  const betSaved = () => {
    if (!isBetValid(currentBet)) return false
    return (
      currentBet?.betTeamA === bet?.betTeamA &&
      currentBet?.betTeamB === bet?.betTeamB &&
      currentBet?.betPlayoffWinner === bet?.betPlayoffWinner
    )
  }

  if (!match.display) return null

  const dateTime = match.dateTime
    ? new Date(match.dateTime.seconds * 1000)
    : null
  const timeStr = dateTime ? format(dateTime, 'HH:mm', { locale: fr }) : ''

  return (
    <div className="w-full bg-white rounded-[14px] py-3.5 px-4 shadow-card border-none text-left flex flex-col gap-2.5 transition-all duration-150">
      <div className="flex justify-between items-center">
        <InformationMatch phase={match.phase} groupName={match.groupName} />
        <span className="text-xs font-semibold text-gray-400">{timeStr}</span>
      </div>

      <div className="flex items-center justify-between gap-2">
        <div className="flex flex-col items-center gap-1.5 w-[90px] shrink-0">
          <Flag country={match.teamACode} className="h-9 w-9 object-contain rounded" />
          <span className="text-xs font-semibold text-navy text-center leading-tight">
            {match.teamAName ?? 'À déterminer'}
          </span>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <input
            type="text"
            placeholder="–"
            className="w-11 h-11 rounded-[10px] border-[1.5px] border-gray-200 text-center text-xl font-bold text-navy bg-gray-50 outline-none transition-colors focus:border-indigo-500 focus:bg-white placeholder:text-gray-300"
            inputMode="numeric"
            pattern="[0-9]*"
            value={
              currentBet?.betTeamA !== undefined && currentBet?.betTeamA >= 0
                ? currentBet?.betTeamA
                : ''
            }
            onChange={handleTeamAChange}
          />
          <ValidIcon valid={betSaved()} />
          <input
            type="text"
            placeholder="–"
            className="w-11 h-11 rounded-[10px] border-[1.5px] border-gray-200 text-center text-xl font-bold text-navy bg-gray-50 outline-none transition-colors focus:border-indigo-500 focus:bg-white placeholder:text-gray-300"
            inputMode="numeric"
            pattern="[0-9]*"
            value={currentBet?.betTeamB >= 0 ? currentBet?.betTeamB : ''}
            onChange={handleTeamBChange}
          />
        </div>

        <div className="flex flex-col items-center gap-1.5 w-[90px] shrink-0">
          <Flag country={match.teamBCode} className="h-9 w-9 object-contain rounded" />
          <span className="text-xs font-semibold text-navy text-center leading-tight">
            {match.teamBName ?? 'À déterminer'}
          </span>
        </div>
      </div>

      {isPlayoff && isDraw && (
        <PlayoffWinnerSelector
          teamAName={match.teamAName}
          teamBName={match.teamBName}
          value={currentBet?.betPlayoffWinner ?? null}
          onChange={handlePlayoffWinnerChange}
        />
      )}

      <Odds
        {...match}
        scoreA={currentBet?.betTeamA}
        scoreB={currentBet?.betTeamB}
      />
    </div>
  )
}

export default Match
