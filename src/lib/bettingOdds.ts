import isNumber from 'lodash/isNumber'
import type { MatchBetFormat } from './matchEnums'

export type PlayoffSide = 'A' | 'B'

export interface BetLike {
  betTeamA: number | null
  betTeamB: number | null
  betPlayoffWinner: PlayoffSide | null
  userId: string | null
}

function isRegulation1x2(betFormat: MatchBetFormat): boolean {
  return betFormat === 'regulation_1x2'
}

export function predictionPopularityKey(
  betFormat: MatchBetFormat,
  betA: number | null,
  betB: number | null,
  betPw: PlayoffSide | null,
): string | null {
  if (!isNumber(betA) || !isNumber(betB) || betA < 0 || betB < 0) {
    return null
  }
  if (isRegulation1x2(betFormat)) {
    if (betA > betB) {
      return 'G_A'
    }
    if (betA < betB) {
      return 'G_B'
    }
    return 'G_N'
  }
  if (betA === betB) {
    if (betPw === 'A') {
      return 'P_A'
    }
    if (betPw === 'B') {
      return 'P_B'
    }
    return null
  }
  if (betA > betB) {
    return 'P_A'
  }
  return 'P_B'
}

export function dynamicMultiplier(
  totalValid: number,
  sameCount: number,
): number {
  if (totalValid < 2) {
    return 1
  }
  const p = sameCount / totalValid
  const raw = Math.exp(-p * p * 2) * 10
  if (raw < 1) {
    return 1
  }
  if (raw > 10) {
    return 10
  }
  return raw
}

export function mergeBetsWithDraft(
  betFormat: MatchBetFormat,
  rows: BetLike[],
  myUserId: string | undefined,
  draft: BetLike | null,
): BetLike[] {
  if (!myUserId || !draft) {
    return rows
  }
  const keyDraft = predictionPopularityKey(
    betFormat,
    draft.betTeamA,
    draft.betTeamB,
    draft.betPlayoffWinner,
  )
  if (keyDraft === null) {
    return rows
  }
  const others = rows.filter((r) => r.userId !== myUserId)
  const merged: BetLike = {
    userId: myUserId,
    betTeamA: draft.betTeamA,
    betTeamB: draft.betTeamB,
    betPlayoffWinner: draft.betPlayoffWinner,
  }
  return [...others, merged]
}

export function statsForPopularity(
  betFormat: MatchBetFormat,
  rows: BetLike[],
  draftKey: string | null,
): { totalValid: number; sameCount: number; multiplier: number } {
  const keys = rows
    .map((r) =>
      predictionPopularityKey(
        betFormat,
        r.betTeamA,
        r.betTeamB,
        r.betPlayoffWinner,
      ),
    )
    .filter((k): k is string => k !== null)
  const totalValid = keys.length
  if (draftKey === null || totalValid === 0) {
    return { totalValid, sameCount: 0, multiplier: 1 }
  }
  let sameCount = 0
  for (let i = 0; i < keys.length; i += 1) {
    if (keys[i] === draftKey) {
      sameCount += 1
    }
  }
  return {
    totalValid,
    sameCount,
    multiplier: dynamicMultiplier(totalValid, sameCount),
  }
}

export function formatMultiplierLabel(mult: number): string {
  const rounded = Math.round(mult * 10) / 10
  const s = rounded.toFixed(1).replace('.', ',')
  if (mult >= 7) {
    return `🔥 x${s}`
  }
  return `x${s}`
}

export function estimatedGainRange(
  maxBasePoints: number,
  mult: number,
): { min: number; max: number } {
  return { min: 0, max: Math.round(maxBasePoints * mult) }
}
