import type { NormalizedMatch } from '../hooks/matches'
import { formatTournamentPhaseLabel } from './matchEnums'

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions'

export type AiProvider = 'openai' | 'deepseek' | 'mistral'

const MODEL_MAP: Record<AiProvider, string> = {
  openai: 'openai/gpt-4o-mini',
  deepseek: 'deepseek/deepseek-chat',
  mistral: 'mistralai/mistral-small-3.2-24b-instruct',
}

export interface MatchPrediction {
  match_id: string
  score_a: number
  score_b: number
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
    '- Format exact : [{"match_id":"id","score_a":X,"score_b":Y}, ...]',
    '- score_a = score de la première équipe listée, score_b = score de la deuxième',
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
        `- ID: ${m.id} | ${m.teamAName ?? '?'} vs ${m.teamBName ?? '?'} (${formatTournamentPhaseLabel(m.tournamentPhase)})`,
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

function parseAiResponse(content: string): MatchPrediction[] {
  const cleaned = content
    .trim()
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim()
  return JSON.parse(cleaned)
}

function filterValidPredictions(
  predictions: MatchPrediction[],
  validMatchIds: Set<string>,
): MatchPrediction[] {
  return predictions.filter(
    (p) =>
      validMatchIds.has(p.match_id) &&
      typeof p.score_a === 'number' &&
      typeof p.score_b === 'number' &&
      p.score_a >= 0 &&
      p.score_a <= 99 &&
      p.score_b >= 0 &&
      p.score_b <= 99,
  )
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
        { role: 'system', content: buildSystemPrompt(competitionLabel) },
        { role: 'user', content: buildUserPrompt(matches, preferences) },
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

  const predictions = parseAiResponse(content)
  const validMatchIds = new Set(matches.map((m) => m.id))
  return filterValidPredictions(predictions, validMatchIds)
}
