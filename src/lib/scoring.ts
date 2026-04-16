import type { MatchBetFormat, MatchTournamentPhase } from './matchEnums'
import { tournamentPhaseMultiplier } from './matchEnums'

export interface ScoringBreakdownInput {
  scoreA: number | null | undefined
  scoreB: number | null | undefined
  playoffWinner: 'A' | 'B' | null | undefined
  betTeamA: number | null | undefined
  betTeamB: number | null | undefined
  betPlayoffWinner: 'A' | 'B' | null | undefined
  betFormat: MatchBetFormat
  tournamentPhase: MatchTournamentPhase
  oddsA: number | null | undefined
  oddsB: number | null | undefined
  oddsDraw: number | null | undefined
}

export interface ScoringBreakdown {
  resultat: number
  gagnant: number
  proximite: number
  ecart: number
  bonus: number
  base: number
  winningOdds: number | null
  phaseMultiplier: number
  total: number
}

type Side = 'A' | 'B' | 'N'

function sideOf(a: number, b: number): Side {
  if (a > b) return 'A'
  if (a < b) return 'B'
  return 'N'
}

export function computeScoringBreakdown(
  input: ScoringBreakdownInput,
): ScoringBreakdown | null {
  const {
    scoreA,
    scoreB,
    playoffWinner,
    betTeamA,
    betTeamB,
    betPlayoffWinner,
    betFormat,
    tournamentPhase,
    oddsA,
    oddsB,
    oddsDraw,
  } = input

  if (
    scoreA === null ||
    scoreA === undefined ||
    scoreB === null ||
    scoreB === undefined ||
    betTeamA === null ||
    betTeamA === undefined ||
    betTeamB === null ||
    betTeamB === undefined
  ) {
    return null
  }

  const realResult = sideOf(scoreA, scoreB)
  const betResult = sideOf(betTeamA, betTeamB)
  const realMargin = Math.abs(scoreA - scoreB)
  const betMargin = Math.abs(betTeamA - betTeamB)

  let gagnant = 0
  if (betFormat === 'regulation_1x2') {
    gagnant = betResult === realResult ? 8 : 0
  } else {
    const effReal = realResult !== 'N' ? realResult : playoffWinner ?? null
    const effBet = betResult !== 'N' ? betResult : betPlayoffWinner ?? null
    gagnant = effReal !== null && effBet === effReal ? 8 : 0
  }

  const resultat = betResult === realResult ? 2 : 0

  const bonus =
    betResult === realResult && betTeamA === scoreA && betTeamB === scoreB
      ? 4
      : 0

  let proximite = 0
  let ecart = 0
  if (betResult === realResult || gagnant > 0) {
    const totalDiff = Math.abs(scoreA - betTeamA) + Math.abs(scoreB - betTeamB)
    proximite = Math.max(3 - totalDiff, 0)
    ecart = Math.max(3 - Math.abs(realMargin - betMargin), 0)
  }

  const base = resultat + gagnant + proximite + ecart + bonus

  let winningOdds: number | null
  if (betFormat === 'regulation_1x2') {
    if (scoreA > scoreB) winningOdds = oddsA ?? null
    else if (scoreA < scoreB) winningOdds = oddsB ?? null
    else winningOdds = oddsDraw ?? null
  } else {
    if (scoreA > scoreB) winningOdds = oddsA ?? null
    else if (scoreA < scoreB) winningOdds = oddsB ?? null
    else if (playoffWinner === 'A') winningOdds = oddsA ?? null
    else if (playoffWinner === 'B') winningOdds = oddsB ?? null
    else winningOdds = null
  }

  const phaseMultiplier = tournamentPhaseMultiplier(tournamentPhase)

  const total =
    base === 0 || winningOdds === null
      ? 0
      : Math.round(base * winningOdds * phaseMultiplier)

  return {
    resultat,
    gagnant,
    proximite,
    ecart,
    bonus,
    base,
    winningOdds,
    phaseMultiplier,
    total,
  }
}

export function formatOdds(odds: number | null | undefined): string {
  if (odds === null || odds === undefined) return '–'
  return odds.toFixed(2)
}
