import type { MatchBetFormat } from './matchEnums'

export type PlayoffWinnerSide = 'A' | 'B' | null | undefined

export function isDrawScore(
  scoreA: number | null | undefined,
  scoreB: number | null | undefined,
): boolean {
  if (scoreA === null || scoreA === undefined) {
    return false
  }

  if (scoreB === null || scoreB === undefined) {
    return false
  }

  return scoreA === scoreB
}

export function getPlayoffWinnerName(
  playoffWinner: PlayoffWinnerSide,
  teamAName: string | null | undefined,
  teamBName: string | null | undefined,
): string | null {
  if (playoffWinner === 'A') {
    return teamAName ?? 'Équipe A'
  }

  if (playoffWinner === 'B') {
    return teamBName ?? 'Équipe B'
  }

  return null
}

export function shouldShowPlayoffWinner(
  betFormat: MatchBetFormat,
  scoreA: number | null | undefined,
  scoreB: number | null | undefined,
  playoffWinner: PlayoffWinnerSide,
): boolean {
  if (betFormat !== 'knockout_decider') {
    return false
  }

  if (!isDrawScore(scoreA, scoreB)) {
    return false
  }

  return playoffWinner === 'A' || playoffWinner === 'B'
}

export function getDrawBetPlayoffWinnerName(
  betTeamA: number | null | undefined,
  betTeamB: number | null | undefined,
  betPlayoffWinner: PlayoffWinnerSide,
  teamAName: string | null | undefined,
  teamBName: string | null | undefined,
): string | null {
  if (!isDrawScore(betTeamA, betTeamB)) {
    return null
  }

  return getPlayoffWinnerName(betPlayoffWinner, teamAName, teamBName)
}
