import type { NormalizedMatch } from '../hooks/matches'
import { formatTournamentPhaseLabel } from './matchEnums'
import {
  MissingPlayoffWinnerError,
  validateAiPredictions,
  type AiPredictionMatch,
  type MatchPrediction,
  type RawMatchPrediction,
} from './aiPredictionValidation'

export type { MatchPrediction } from './aiPredictionValidation'

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions'

export type AiProvider = 'openai' | 'deepseek' | 'mistral'

const MODEL_MAP: Record<AiProvider, string> = {
  openai: 'openai/gpt-4o-mini',
  deepseek: 'deepseek/deepseek-chat',
  mistral: 'mistralai/mistral-small-3.2-24b-instruct',
}

function buildSystemPrompt(competitionLabel: string): string {
  const scope =
    competitionLabel.trim() === ''
      ? 'cette compétition'
      : competitionLabel.trim()
  return [
    'Tu es un expert en football et en pronostics sportifs.',
    `On te demande de prédire les scores des matchs (${scope}).`,
    '',
    'Règles strictes :',
    '- Retourne UNIQUEMENT un tableau JSON valide, sans texte avant ni après, sans blocs markdown',
    '- Chaque objet contient exactement match_id, score_a, score_b et playoff_winner',
    '- Exemple sans départage : {"match_id":"id-1","score_a":2,"score_b":1,"playoff_winner":null}',
    '- Exemple de nul éliminatoire qualifié par la première équipe : {"match_id":"id-2","score_a":1,"score_b":1,"playoff_winner":"A"}',
    '- score_a = score de la première équipe listée, score_b = score de la deuxième',
    '- playoff_winner vaut "A", "B" ou null',
    '- Pour un match à élimination directe avec un score nul, playoff_winner est OBLIGATOIRE : "A" pour la première équipe ou "B" pour la deuxième',
    '- Pour un match à élimination directe, les scores sont ceux à la fin du temps réglementaire ; playoff_winner désigne le qualifié après prolongation ou tirs au but',
    '- Pour tout score non nul ou tout match de groupes, playoff_winner doit être null',
    '- Les scores doivent être réalistes (0 à 5)',
    "- Prends en compte les préférences de l'utilisateur si fournies",
    '- Propose des scores variés et réalistes, pas toujours 1-0 ou 2-1',
  ].join('\n')
}

function buildUserPrompt(
  matches: NormalizedMatch[],
  preferences: string,
): string {
  const matchList = matches
    .map(
      (m) =>
        `- ID: ${m.id} | A: ${m.teamAName ?? '?'} vs B: ${m.teamBName ?? '?'} (${formatTournamentPhaseLabel(m.tournamentPhase)} ; format: ${m.betFormat})`,
    )
    .join('\n')

  const parts: string[] = []
  if (preferences.trim()) {
    parts.push(`Mes préférences : ${preferences.trim()}`)
    parts.push('')
  }
  parts.push('Voici les matchs à pronostiquer :')
  parts.push(matchList)
  return parts.join('\n')
}

function parseAiResponse(content: string): RawMatchPrediction[] {
  const cleaned = content
    .trim()
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim()
  const parsed = JSON.parse(cleaned)
  if (!Array.isArray(parsed)) {
    return []
  }

  return parsed
}

async function requestPredictionBatch(
  apiKey: string,
  provider: AiProvider,
  systemPrompt: string,
  userPrompt: string,
): Promise<RawMatchPrediction[]> {
  const response = await fetch(OPENROUTER_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
      'HTTP-Referer': window.location.origin,
    },
    body: JSON.stringify({
      model: MODEL_MAP[provider],
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.8,
      max_tokens: 4096,
    }),
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(
      errorData?.error?.message || `Erreur API (${response.status})`,
    )
  }

  const data = await response.json()
  const content = data.choices?.[0]?.message?.content?.trim()

  if (!content) {
    throw new Error("L'IA n'a pas retourné de réponse")
  }

  return parseAiResponse(content)
}

function buildRetryPrompt(userPrompt: string, matchId: string): string {
  return [
    userPrompt,
    '',
    `Ta réponse précédente était invalide : le match ${matchId} avait un score nul sans playoff_winner.`,
    'Recommence toute la réponse. Pour chaque nul à élimination directe, indique obligatoirement "A" ou "B" dans playoff_winner.',
  ].join('\n')
}

export async function generatePredictions(
  matches: NormalizedMatch[],
  preferences: string,
  provider: AiProvider,
  competitionLabel: string,
): Promise<MatchPrediction[]> {
  const apiKey = import.meta.env.VITE_OPENROUTER_KEY || ''
  if (!apiKey) {
    throw new Error('Clé OpenRouter non configurée')
  }

  const systemPrompt = buildSystemPrompt(competitionLabel)
  const userPrompt = buildUserPrompt(matches, preferences)
  const predictionMatches: AiPredictionMatch[] = []

  for (const match of matches) {
    predictionMatches.push({
      id: match.id,
      betFormat: match.betFormat,
    })
  }

  const predictions = await requestPredictionBatch(
    apiKey,
    provider,
    systemPrompt,
    userPrompt,
  )

  try {
    return validateAiPredictions(predictions, predictionMatches)
  } catch (error: unknown) {
    if (!(error instanceof MissingPlayoffWinnerError)) {
      throw error
    }

    const retryPrompt = buildRetryPrompt(userPrompt, error.matchId)
    const retryPredictions = await requestPredictionBatch(
      apiKey,
      provider,
      systemPrompt,
      retryPrompt,
    )
    return validateAiPredictions(retryPredictions, predictionMatches)
  }
}
