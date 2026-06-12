import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'jsr:@supabase/supabase-js@2'

const DEFAULT_GEMINI_MODELS: string[] = [
  'gemini-3.5-flash',
  'gemini-3-flash-preview',
]
const GEMINI_API_BASE =
  'https://generativelanguage.googleapis.com/v1beta/models'
const MATCH_LOOKBACK_MINUTES = 240
const JSON_HEADERS = { 'Content-Type': 'application/json' }

type Confidence = 'high' | 'medium' | 'low'
type MatchStatus =
  | 'not_started'
  | 'in_progress'
  | 'halftime'
  | 'finished'
  | 'postponed'
  | 'abandoned'
  | 'unknown'
type WinnerSide = 'A' | 'B' | 'unknown'
type SupabaseClient = ReturnType<typeof createClient>

interface MatchRow {
  id: string
  dateTime: string | null
  teamAName: string | null
  teamACode: string | null
  teamBName: string | null
  teamBCode: string | null
  betFormat: string | null
}

interface GeminiScoreResult {
  available: boolean
  status: MatchStatus
  scoreA: number | null
  scoreB: number | null
  winnerSide: WinnerSide
  sourceName: string | null
  sourceUrl: string | null
  checkedAt: string | null
  confidence: Confidence
}

interface GeminiScoreLookup {
  model: string
  result: GeminiScoreResult
  webSearchQueries: string[]
}

interface GeminiPart {
  text?: string
}

interface GeminiContent {
  parts?: GeminiPart[]
}

interface GeminiGroundingMetadata {
  webSearchQueries?: unknown
}

interface GeminiCandidate {
  content?: GeminiContent
  groundingMetadata?: GeminiGroundingMetadata
}

interface GeminiApiError {
  code?: number
  message?: string
  status?: string
}

interface GeminiApiResponse {
  candidates?: GeminiCandidate[]
  error?: GeminiApiError
}

class GeminiRequestError extends Error {
  statusCode: number
  apiStatus: string | null

  constructor(message: string, statusCode: number, apiStatus: string | null) {
    super(message)
    this.name = 'GeminiRequestError'
    this.statusCode = statusCode
    this.apiStatus = apiStatus
  }
}

const SCORE_RESPONSE_SCHEMA: Record<string, unknown> = {
  type: 'object',
  properties: {
    available: {
      type: 'boolean',
      description:
        'true only when the score was verified from current web data',
    },
    status: {
      type: 'string',
      enum: [
        'not_started',
        'in_progress',
        'halftime',
        'finished',
        'postponed',
        'abandoned',
        'unknown',
      ],
      description: 'current match status',
    },
    score_a: {
      type: ['integer', 'null'],
      minimum: 0,
      maximum: 99,
      description: 'goals for team_a exactly as provided in the prompt',
    },
    score_b: {
      type: ['integer', 'null'],
      minimum: 0,
      maximum: 99,
      description: 'goals for team_b exactly as provided in the prompt',
    },
    winner_side: {
      type: 'string',
      enum: ['A', 'B', 'unknown'],
      description:
        'A or B for the team that won or advanced; unknown for draws without a decider',
    },
    source_name: {
      type: ['string', 'null'],
      description: 'main source used for the score',
    },
    source_url: {
      type: ['string', 'null'],
      description: 'main source URL used for the score',
    },
    checked_at: {
      type: ['string', 'null'],
      format: 'date-time',
      description: 'time when the source appeared to be current',
    },
    confidence: {
      type: 'string',
      enum: ['high', 'medium', 'low'],
      description: 'confidence that the score belongs to this exact match',
    },
  },
  required: [
    'available',
    'status',
    'score_a',
    'score_b',
    'winner_side',
    'source_name',
    'source_url',
    'checked_at',
    'confidence',
  ],
  additionalProperties: false,
}

function jsonResponse(body: Record<string, unknown>, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: JSON_HEADERS,
  })
}

function errorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message
  }

  return String(error)
}

function isRecord(value: unknown): value is Record<string, unknown> {
  if (typeof value !== 'object') {
    return false
  }

  if (value === null) {
    return false
  }

  return !Array.isArray(value)
}

function readString(
  record: Record<string, unknown>,
  key: string,
): string | null {
  const value = record[key]
  if (typeof value === 'string') {
    return value
  }

  return null
}

function readBoolean(
  record: Record<string, unknown>,
  key: string,
): boolean | null {
  const value = record[key]
  if (typeof value === 'boolean') {
    return value
  }

  return null
}

function readIntegerOrNull(
  record: Record<string, unknown>,
  key: string,
): number | null {
  const value = record[key]
  if (value === null || value === undefined) {
    return null
  }

  if (typeof value !== 'number') {
    return null
  }

  if (!Number.isInteger(value)) {
    return null
  }

  if (value < 0 || value > 99) {
    return null
  }

  return value
}

function normalizeStatus(value: unknown): MatchStatus {
  if (value === 'not_started') {
    return 'not_started'
  }

  if (value === 'in_progress') {
    return 'in_progress'
  }

  if (value === 'halftime') {
    return 'halftime'
  }

  if (value === 'finished') {
    return 'finished'
  }

  if (value === 'postponed') {
    return 'postponed'
  }

  if (value === 'abandoned') {
    return 'abandoned'
  }

  return 'unknown'
}

function normalizeWinnerSide(value: unknown): WinnerSide {
  if (value === 'A') {
    return 'A'
  }

  if (value === 'B') {
    return 'B'
  }

  return 'unknown'
}

function normalizeConfidence(value: unknown): Confidence {
  if (value === 'high') {
    return 'high'
  }

  if (value === 'medium') {
    return 'medium'
  }

  return 'low'
}

function normalizeGeminiResult(value: unknown): GeminiScoreResult | null {
  if (!isRecord(value)) {
    return null
  }

  const available = readBoolean(value, 'available')
  if (available === null) {
    return null
  }

  return {
    available,
    status: normalizeStatus(value.status),
    scoreA: readIntegerOrNull(value, 'score_a'),
    scoreB: readIntegerOrNull(value, 'score_b'),
    winnerSide: normalizeWinnerSide(value.winner_side),
    sourceName: readString(value, 'source_name'),
    sourceUrl: readString(value, 'source_url'),
    checkedAt: readString(value, 'checked_at'),
    confidence: normalizeConfidence(value.confidence),
  }
}

function normalizeMatchRow(value: unknown): MatchRow | null {
  if (!isRecord(value)) {
    return null
  }

  const id = readString(value, 'id')
  if (!id) {
    return null
  }

  return {
    id,
    dateTime: readString(value, 'date_time'),
    teamAName: readString(value, 'team_a_name'),
    teamACode: readString(value, 'team_a_code'),
    teamBName: readString(value, 'team_b_name'),
    teamBCode: readString(value, 'team_b_code'),
    betFormat: readString(value, 'bet_format'),
  }
}

function normalizeMatchRows(rows: unknown): MatchRow[] {
  const matches: MatchRow[] = []
  if (!Array.isArray(rows)) {
    return matches
  }

  for (const row of rows) {
    const match = normalizeMatchRow(row)
    if (match) {
      matches.push(match)
    }
  }

  return matches
}

function teamLabel(
  name: string | null,
  code: string | null,
  fallback: string,
): string {
  if (name && code) {
    return `${name} (${code})`
  }

  if (name) {
    return name
  }

  if (code) {
    return code
  }

  return fallback
}

function buildPrompt(match: MatchRow): string {
  const teamA = teamLabel(match.teamAName, match.teamACode, 'team A')
  const teamB = teamLabel(match.teamBName, match.teamBCode, 'team B')
  const kickoff = match.dateTime ?? 'unknown kickoff time'

  return [
    'Use Google Search to find the current live or final score for this football/soccer match.',
    `team_a: ${teamA}`,
    `team_b: ${teamB}`,
    `scheduled_kickoff_utc: ${kickoff}`,
    'score_a must be the goals for team_a, and score_b must be the goals for team_b.',
    'If this is a knockout match decided after extra time or penalties, winner_side must be the team that advanced or won the match.',
    'If you cannot verify the exact match from current sources, set available to false, score_a and score_b to null, status to unknown, winner_side to unknown, and confidence to low.',
    'Do not infer or predict a score. Only report a score found in current web results.',
  ].join('\n')
}

function buildGeminiRequest(match: MatchRow): Record<string, unknown> {
  return {
    contents: [
      {
        parts: [
          {
            text: buildPrompt(match),
          },
        ],
      },
    ],
    tools: [
      {
        googleSearch: {},
      },
    ],
    generationConfig: {
      temperature: 0,
      responseMimeType: 'application/json',
      responseJsonSchema: SCORE_RESPONSE_SCHEMA,
    },
  }
}

function extractGeminiText(data: GeminiApiResponse): string | null {
  const candidate = data.candidates?.[0]
  const part = candidate?.content?.parts?.[0]
  if (!part?.text) {
    return null
  }

  return part.text
}

function extractSearchQueries(data: GeminiApiResponse): string[] {
  const queries: string[] = []
  const candidate = data.candidates?.[0]
  const rawQueries = candidate?.groundingMetadata?.webSearchQueries
  if (!Array.isArray(rawQueries)) {
    return queries
  }

  for (const query of rawQueries) {
    if (typeof query === 'string') {
      queries.push(query)
    }
  }

  return queries
}

async function fetchGeminiScore(
  apiKey: string,
  model: string,
  match: MatchRow,
): Promise<GeminiScoreLookup> {
  const response = await fetch(`${GEMINI_API_BASE}/${model}:generateContent`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-goog-api-key': apiKey,
    },
    body: JSON.stringify(buildGeminiRequest(match)),
  })

  const data: GeminiApiResponse = await response.json()

  if (!response.ok) {
    const message = data.error?.message ?? `Gemini API ${response.status}`
    throw new GeminiRequestError(
      message,
      response.status,
      data.error?.status ?? null,
    )
  }

  const text = extractGeminiText(data)
  if (!text) {
    throw new Error('Gemini response does not contain JSON text')
  }

  const parsed: unknown = JSON.parse(text)
  const result = normalizeGeminiResult(parsed)
  if (!result) {
    throw new Error('Gemini JSON does not match the expected score shape')
  }

  return {
    model,
    result,
    webSearchQueries: extractSearchQueries(data),
  }
}

function splitConfiguredModels(value: string): string[] {
  const models: string[] = []
  for (const rawModel of value.split(',')) {
    const model = rawModel.trim()
    if (model) {
      models.push(model)
    }
  }

  return models
}

function addUniqueModel(models: string[], model: string): void {
  if (models.includes(model)) {
    return
  }

  models.push(model)
}

function resolveGeminiModels(): string[] {
  const models: string[] = []
  const configured = Deno.env.get('GEMINI_MODEL')
  if (configured) {
    for (const model of splitConfiguredModels(configured)) {
      addUniqueModel(models, model)
    }
  }

  for (const model of DEFAULT_GEMINI_MODELS) {
    addUniqueModel(models, model)
  }

  return models
}

function isAuthGeminiError(error: unknown): boolean {
  if (!(error instanceof GeminiRequestError)) {
    return false
  }

  if (error.statusCode === 401) {
    return true
  }

  return error.statusCode === 403
}

async function fetchGeminiScoreWithFallback(
  apiKey: string,
  models: string[],
  match: MatchRow,
): Promise<GeminiScoreLookup> {
  const errors: string[] = []

  for (const model of models) {
    try {
      return await fetchGeminiScore(apiKey, model, match)
    } catch (error) {
      const message = errorMessage(error)
      errors.push(`${model}: ${message}`)

      if (isAuthGeminiError(error)) {
        throw new Error(errors.join(' | '))
      }

      console.warn(`[update-results] ${match.id} ${model} failed: ${message}`)
    }
  }

  throw new Error(`All Gemini models failed: ${errors.join(' | ')}`)
}

function isPersistableScore(result: GeminiScoreResult): boolean {
  if (!result.available) {
    return false
  }

  if (result.scoreA === null) {
    return false
  }

  return result.scoreB !== null
}

function isFinishedResult(result: GeminiScoreResult): boolean {
  return result.status === 'finished'
}

function resolvePlayoffWinner(
  match: MatchRow,
  result: GeminiScoreResult,
): string | null {
  if (match.betFormat !== 'knockout_decider') {
    return null
  }

  if (!isFinishedResult(result)) {
    return null
  }

  if (result.scoreA !== null && result.scoreB !== null) {
    if (result.scoreA > result.scoreB) {
      return 'A'
    }

    if (result.scoreB > result.scoreA) {
      return 'B'
    }
  }

  if (result.winnerSide === 'A') {
    return 'A'
  }

  if (result.winnerSide === 'B') {
    return 'B'
  }

  return null
}

function buildScorePayload(
  match: MatchRow,
  lookup: GeminiScoreLookup,
  checkedAt: string,
): Record<string, unknown> {
  return {
    provider: 'gemini',
    model: lookup.model,
    match_id: match.id,
    checked_at: checkedAt,
    result: {
      available: lookup.result.available,
      status: lookup.result.status,
      score_a: lookup.result.scoreA,
      score_b: lookup.result.scoreB,
      winner_side: lookup.result.winnerSide,
      source_name: lookup.result.sourceName,
      source_url: lookup.result.sourceUrl,
      source_checked_at: lookup.result.checkedAt,
      confidence: lookup.result.confidence,
    },
    web_search_queries: lookup.webSearchQueries,
  }
}

async function updateMatchScore(
  supabase: SupabaseClient,
  match: MatchRow,
  lookup: GeminiScoreLookup,
): Promise<Record<string, unknown>> {
  const checkedAt = new Date().toISOString()
  const update: Record<string, unknown> = {
    score_provider: 'gemini',
    score_payload: buildScorePayload(match, lookup, checkedAt),
    score_checked_at: checkedAt,
  }

  if (isPersistableScore(lookup.result)) {
    update.score_a = lookup.result.scoreA
    update.score_b = lookup.result.scoreB
    update.finished = isFinishedResult(lookup.result)
  }

  const playoffWinner = resolvePlayoffWinner(match, lookup.result)
  if (playoffWinner) {
    update.playoff_winner = playoffWinner
  }

  const { error } = await supabase
    .from('matches')
    .update(update)
    .eq('id', match.id)

  if (error) {
    throw error
  }

  return {
    match: match.id,
    success: true,
    model: lookup.model,
    status: lookup.result.status,
    score_a: lookup.result.scoreA,
    score_b: lookup.result.scoreB,
    finished: update.finished ?? false,
    confidence: lookup.result.confidence,
  }
}

async function findMatchesToUpdate(
  supabase: SupabaseClient,
): Promise<MatchRow[]> {
  const now = new Date()
  const startedAfter = new Date(
    now.getTime() - MATCH_LOOKBACK_MINUTES * 60 * 1000,
  )

  const { data, error } = await supabase
    .from('matches_with_teams')
    .select(
      'id, date_time, team_a_name, team_a_code, team_b_name, team_b_code, bet_format',
    )
    .eq('finished', false)
    .eq('visible_to_users', true)
    .not('date_time', 'is', null)
    .gte('date_time', startedAfter.toISOString())
    .lte('date_time', now.toISOString())
    .order('date_time', { ascending: true })

  if (error) {
    throw error
  }

  return normalizeMatchRows(data)
}

async function handleRequest(_req: Request): Promise<Response> {
  const supabaseUrl = Deno.env.get('SUPABASE_URL')
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

  if (!supabaseUrl || !serviceKey) {
    return jsonResponse({ error: 'Missing Supabase env' }, 500)
  }

  const supabase = createClient(supabaseUrl, serviceKey)

  try {
    const matches = await findMatchesToUpdate(supabase)
    if (matches.length === 0) {
      console.log('[update-results] no matches in lookback window')
      return jsonResponse({ message: 'No matches to update' }, 200)
    }

    console.log(
      `[update-results] checking ${matches.length} match(es): ${matches
        .map((m) => `${m.id} (${m.teamAName ?? '?'} vs ${m.teamBName ?? '?'})`)
        .join(', ')}`,
    )

    const geminiApiKey = Deno.env.get('GEMINI_API_KEY')
    if (!geminiApiKey) {
      return jsonResponse({ error: 'Missing GEMINI_API_KEY env' }, 500)
    }

    const models = resolveGeminiModels()
    const results: Record<string, unknown>[] = []

    for (const match of matches) {
      const label = `${match.teamAName ?? '?'} vs ${match.teamBName ?? '?'}`
      try {
        const lookup = await fetchGeminiScoreWithFallback(
          geminiApiKey,
          models,
          match,
        )
        const result = await updateMatchScore(supabase, match, lookup)
        console.log(
          `[update-results] ${match.id} ${label} → model=${lookup.model} status=${lookup.result.status} score=${lookup.result.scoreA}-${lookup.result.scoreB} finished=${result.finished} confidence=${lookup.result.confidence}`,
        )
        results.push(result)
      } catch (error) {
        const message = errorMessage(error)
        console.error(
          `[update-results] ${match.id} ${label} → error: ${message}`,
        )
        results.push({
          match: match.id,
          success: false,
          error: message,
        })
      }
    }

    return jsonResponse({ results }, 200)
  } catch (error) {
    return jsonResponse({ error: errorMessage(error) }, 500)
  }
}

Deno.serve(handleRequest)
