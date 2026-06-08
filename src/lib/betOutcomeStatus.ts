import isNumber from 'lodash/isNumber'
import type { BetOutcomeStatusEnum } from './database.types'

export type BetOutcomeStatus = BetOutcomeStatusEnum

export function matchHasPublishedScore(
  scoreA: number | null | undefined,
  scoreB: number | null | undefined,
): boolean {
  return (
    scoreA !== null &&
    scoreA !== undefined &&
    scoreB !== null &&
    scoreB !== undefined
  )
}

export function betOutcomeTooltipSelf(
  status: BetOutcomeStatus | null | undefined,
): string | null {
  if (status === 'perfect_score') {
    return 'Score parfait'
  }
  if (status === 'good_result') {
    return 'Bon résultat (points partiels)'
  }
  if (status === 'rate') {
    return 'Raté'
  }
  return null
}

export function betOutcomeTooltipOther(
  status: BetOutcomeStatus | null | undefined,
): string | null {
  if (status === 'perfect_score') {
    return 'Score parfait'
  }
  if (status === 'good_result') {
    return 'Bon résultat'
  }
  if (status === 'rate') {
    return 'Raté'
  }
  return null
}

export function pointsWonTitleSelf(
  betTeamA: unknown,
  betTeamB: unknown,
  pointsWon: number | null | undefined,
  outcomeStatus: BetOutcomeStatus | null | undefined,
  scoreA: number | null | undefined,
  scoreB: number | null | undefined,
): string {
  const hasBet = isNumber(betTeamA) && isNumber(betTeamB)
  if (!hasBet) {
    return "Vous n'avez pas pronostiqué"
  }
  if (matchHasPublishedScore(scoreA, scoreB)) {
    const fromStatus = betOutcomeTooltipSelf(outcomeStatus)
    if (fromStatus) {
      return fromStatus
    }
  }
  if (!pointsWon) {
    return "Vous n'avez pas marqué de points"
  }
  return 'Vous avez pronostiqué le bon résultat'
}

export function pointsWonTitleOther(
  betTeamA: unknown,
  betTeamB: unknown,
  pointsWon: number | null | undefined,
  outcomeStatus: BetOutcomeStatus | null | undefined,
  scoreA: number | null | undefined,
  scoreB: number | null | undefined,
): string {
  const hasBet = isNumber(betTeamA) && isNumber(betTeamB)
  if (!hasBet) {
    return "Il n'a pas pronostiqué"
  }
  if (matchHasPublishedScore(scoreA, scoreB)) {
    const fromStatus = betOutcomeTooltipOther(outcomeStatus)
    if (fromStatus) {
      return fromStatus
    }
  }
  if (!pointsWon) {
    return "Il n'a pas marqué de points"
  }
  return 'Des points marqués sur ce match'
}

export function cardBgClassForUserBet(params: {
  hasBet: boolean
  scoreA: number | null | undefined
  scoreB: number | null | undefined
  outcomeStatus: BetOutcomeStatus | null | undefined
  betTeamA: number | null | undefined
  betTeamB: number | null | undefined
  pointsWon: number | null | undefined
}): string {
  const {
    hasBet,
    scoreA,
    scoreB,
    outcomeStatus,
    betTeamA,
    betTeamB,
    pointsWon,
  } = params
  if (!hasBet) {
    return 'bg-gray-100 border border-gray-300'
  }
  if (!matchHasPublishedScore(scoreA, scoreB)) {
    return 'bg-gray-100 border border-gray-300'
  }
  if (outcomeStatus === 'perfect_score') {
    return 'bg-green-50 border border-green-200'
  }
  if (outcomeStatus === 'good_result') {
    return 'bg-amber-50 border border-amber-200'
  }
  if (outcomeStatus === 'rate') {
    return 'bg-red-50 border border-red-200'
  }
  const pw = pointsWon ?? 0
  if (pw <= 0) {
    return 'bg-red-50 border border-red-200'
  }
  const exact = betTeamA === scoreA && betTeamB === scoreB
  if (exact) {
    return 'bg-green-50 border border-green-200'
  }
  return 'bg-amber-50 border border-amber-200'
}
