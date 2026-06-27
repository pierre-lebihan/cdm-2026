import type { MatchBetFormat } from './matchEnums'

export interface AiPredictionMatch {
  id: string
  betFormat: MatchBetFormat
}

export interface MatchPrediction {
  match_id: string
  score_a: number
  score_b: number
  playoff_winner: 'A' | 'B' | null
}

export interface RawMatchPrediction {
  match_id?: unknown
  score_a?: unknown
  score_b?: unknown
  playoff_winner?: unknown
}

export class MissingPlayoffWinnerError extends Error {
  matchId: string

  constructor(matchId: string) {
    super(`L'IA n'a pas indiqué de vainqueur pour le match ${matchId}`)
    this.name = 'MissingPlayoffWinnerError'
    this.matchId = matchId
  }
}

function isValidScore(value: unknown): value is number {
  return typeof value === 'number' && value >= 0 && value <= 99
}

function normalizePlayoffWinner(value: unknown): 'A' | 'B' | null {
  if (typeof value !== 'string') {
    return null
  }

  const normalized = value.toUpperCase()
  if (normalized === 'A' || normalized === 'B') {
    return normalized
  }

  return null
}

export function validateAiPredictions(
  predictions: RawMatchPrediction[],
  matches: AiPredictionMatch[],
): MatchPrediction[] {
  const matchesById = new Map<string, AiPredictionMatch>()
  const validPredictions = new Map<string, MatchPrediction>()

  for (const match of matches) {
    matchesById.set(match.id, match)
  }

  for (const prediction of predictions) {
    if (!prediction || typeof prediction !== 'object') {
      continue
    }

    if (typeof prediction.match_id !== 'string') {
      continue
    }

    const match = matchesById.get(prediction.match_id)
    if (!match) {
      continue
    }

    if (
      !isValidScore(prediction.score_a) ||
      !isValidScore(prediction.score_b)
    ) {
      continue
    }

    const isKnockoutDraw =
      match.betFormat === 'knockout_decider' &&
      prediction.score_a === prediction.score_b
    const playoffWinner = normalizePlayoffWinner(prediction.playoff_winner)

    if (isKnockoutDraw && playoffWinner === null) {
      throw new MissingPlayoffWinnerError(prediction.match_id)
    }

    validPredictions.set(prediction.match_id, {
      match_id: prediction.match_id,
      score_a: prediction.score_a,
      score_b: prediction.score_b,
      playoff_winner: isKnockoutDraw ? playoffWinner : null,
    })
  }

  return Array.from(validPredictions.values())
}
