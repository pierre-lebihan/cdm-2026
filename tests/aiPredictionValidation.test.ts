import assert from 'node:assert/strict'
import test from 'node:test'
import {
  validateAiPredictions,
  type AiPredictionMatch,
  type RawMatchPrediction,
} from '../src/lib/aiPredictionValidation.ts'

const groupMatch: AiPredictionMatch = {
  id: 'group-match',
  betFormat: 'regulation_1x2',
}

const knockoutMatch: AiPredictionMatch = {
  id: 'knockout-match',
  betFormat: 'knockout_decider',
}

const knockoutDrawWithoutWinner: RawMatchPrediction[] = [
  {
    match_id: knockoutMatch.id,
    score_a: 0,
    score_b: 0,
  },
]

function validateKnockoutDrawWithoutWinner(): void {
  validateAiPredictions(knockoutDrawWithoutWinner, [knockoutMatch])
}

function validateGroupDrawWithoutWinner(): void {
  const predictions: RawMatchPrediction[] = [
    {
      match_id: groupMatch.id,
      score_a: 1,
      score_b: 1,
    },
  ]

  const result = validateAiPredictions(predictions, [groupMatch])

  assert.deepEqual(result, [
    {
      match_id: groupMatch.id,
      score_a: 1,
      score_b: 1,
      playoff_winner: null,
    },
  ])
}

function validateKnockoutDrawWithWinner(): void {
  const predictions: RawMatchPrediction[] = [
    {
      match_id: knockoutMatch.id,
      score_a: 2,
      score_b: 2,
      playoff_winner: 'b',
    },
  ]

  const result = validateAiPredictions(predictions, [knockoutMatch])

  assert.deepEqual(result, [
    {
      match_id: knockoutMatch.id,
      score_a: 2,
      score_b: 2,
      playoff_winner: 'B',
    },
  ])
}

function rejectKnockoutDrawWithoutWinner(): void {
  assert.throws(validateKnockoutDrawWithoutWinner, {
    message: `L'IA n'a pas indiqué de vainqueur pour le match ${knockoutMatch.id}`,
  })
}

function clearWinnerForDecisiveScore(): void {
  const predictions: RawMatchPrediction[] = [
    {
      match_id: knockoutMatch.id,
      score_a: 3,
      score_b: 1,
      playoff_winner: 'B',
    },
  ]

  const result = validateAiPredictions(predictions, [knockoutMatch])

  assert.equal(result[0].playoff_winner, null)
}

test('accepte un nul de groupes sans vainqueur', validateGroupDrawWithoutWinner)
test(
  'normalise le vainqueur fourni pour un nul éliminatoire',
  validateKnockoutDrawWithWinner,
)
test(
  'refuse un nul éliminatoire sans vainqueur',
  rejectKnockoutDrawWithoutWinner,
)
test(
  'ignore le vainqueur de départage lorsque le score est décisif',
  clearWinnerForDecisiveScore,
)
