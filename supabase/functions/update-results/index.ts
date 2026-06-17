import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'jsr:@supabase/supabase-js@2'

const DEFAULT_GEMINI_MODELS: string[] = ['gemini-3.1-flash-lite']
const GEMINI_API_BASE =
  'https://generativelanguage.googleapis.com/v1beta/models'
const MATCH_LOOKBACK_MINUTES = 720
const MATCH_FIRST_CHECK_DELAY_MINUTES = 0
const MATCH_CHECK_THROTTLE_MINUTES = 9
const STANDARD_FINAL_LOCK_MINUTES = 130
const KNOCKOUT_FINAL_LOCK_MINUTES = 180
const FINISHED_RECHECK_WINDOW_MINUTES = 240
const GEMINI_REQUEST_TIMEOUT_MS = readPositiveIntegerEnv(
  'GEMINI_REQUEST_TIMEOUT_MS',
  12000,
)
const JSON_HEADERS = { 'Content-Type': 'application/json' }

type Confidence = 'high' | 'medium' | 'low'
type GeminiMatchStatus =
  | 'not_started'
  | 'in_progress'
  | 'halftime'
  | 'finished'
  | 'postponed'
  | 'abandoned'
  | 'unknown'
type MatchStatus = 'PLANNED' | 'ONGOING' | 'FINISHED'
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
  status: MatchStatus
  scoreProvider: string | null
}

interface GeminiScoreResult {
  available: boolean
  status: GeminiMatchStatus
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
  credentialLabel: string
  result: GeminiScoreResult
  webSearchQueries: string[]
}

interface GeminiCredential {
  apiKey: string
  label: string
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

function readPositiveIntegerEnv(name: string, fallback: number): number {
  const value = Deno.env.get(name)
  if (!value) {
    return fallback
  }

  const parsed = Number(value)
  if (!Number.isInteger(parsed)) {
    return fallback
  }

  if (parsed <= 0) {
    return fallback
  }

  return parsed
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
      description:
        'current live goals for team_a, or final goals when finished; for knockout_decider after regulation time, use the 90-minute regulation score before extra time or penalties',
    },
    score_b: {
      type: ['integer', 'null'],
      minimum: 0,
      maximum: 99,
      description:
        'current live goals for team_b, or final goals when finished; for knockout_decider after regulation time, use the 90-minute regulation score before extra time or penalties',
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

function normalizeStatus(value: unknown): GeminiMatchStatus {
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

function normalizePersistedMatchStatus(value: unknown): MatchStatus {
  if (value === 'ONGOING') {
    return 'ONGOING'
  }

  if (value === 'FINISHED') {
    return 'FINISHED'
  }

  return 'PLANNED'
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
    status: normalizePersistedMatchStatus(value.status),
    scoreProvider: readString(value, 'score_provider'),
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
  const betFormat = match.betFormat ?? 'standard'

  return [
    'Use Google Search to find the current live or final score for this football/soccer match.',
    `team_a: ${teamA}`,
    `team_b: ${teamB}`,
    `scheduled_kickoff_utc: ${kickoff}`,
    `bet_format: ${betFormat}`,
    'If the match is live, score_a and score_b must be the current live score.',
    'If the match is finished and bet_format=standard, score_a and score_b must be the final score after regulation time.',
    'Set status=finished only when the source explicitly shows FT, full-time, final, match ended, or an official final result.',
    'A score shown at 90 minutes, 90+ minutes, stoppage time, or without an explicit full-time/final label is still in_progress.',
    'If bet_format=knockout_decider and regulation time is still in progress, score_a and score_b must be the current live regulation-time score.',
    'If bet_format=knockout_decider and regulation time is over, score_a and score_b must remain the 90-minute regulation score, before extra time or penalties.',
    'If bet_format=knockout_decider and the match is tied after 90 minutes then decided after extra time or penalties, keep the tied 90-minute score and set winner_side to the team that advanced or won.',
    'Example for bet_format=knockout_decider: if team_a wins 2-1 after extra time after a 1-1 draw at 90 minutes, return score_a=1, score_b=1, winner_side=A.',
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
      maxOutputTokens: 512,
      thinkingConfig: {
        thinkingLevel: 'minimal',
      },
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
  credential: GeminiCredential,
  model: string,
  match: MatchRow,
): Promise<GeminiScoreLookup> {
  const response = await fetch(`${GEMINI_API_BASE}/${model}:generateContent`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-goog-api-key': credential.apiKey,
    },
    signal: AbortSignal.timeout(GEMINI_REQUEST_TIMEOUT_MS),
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
    credentialLabel: credential.label,
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

function splitConfiguredCredentials(value: string): string[] {
  const credentials: string[] = []
  for (const rawCredential of value.split(',')) {
    const credential = rawCredential.trim()
    if (credential) {
      credentials.push(credential)
    }
  }

  return credentials
}

function addUniqueCredential(
  credentials: GeminiCredential[],
  apiKey: string,
): void {
  for (const credential of credentials) {
    if (credential.apiKey === apiKey) {
      return
    }
  }

  credentials.push({
    apiKey,
    label: `key_${credentials.length + 1}`,
  })
}

function resolveGeminiCredentials(): GeminiCredential[] {
  const credentials: GeminiCredential[] = []
  const configured = Deno.env.get('GEMINI_API_KEYS')
  if (configured) {
    for (const credential of splitConfiguredCredentials(configured)) {
      addUniqueCredential(credentials, credential)
    }
  }

  const fallback = Deno.env.get('GEMINI_API_KEY')
  if (fallback) {
    addUniqueCredential(credentials, fallback)
  }

  return credentials
}

function stableIndex(value: string, length: number): number {
  let hash = 0
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 31 + value.charCodeAt(i)) % length
  }

  return hash
}

function rotateCredentials(
  credentials: GeminiCredential[],
  matchId: string,
): GeminiCredential[] {
  if (credentials.length <= 1) {
    return credentials
  }

  const ordered: GeminiCredential[] = []
  const start = stableIndex(matchId, credentials.length)
  for (let i = 0; i < credentials.length; i += 1) {
    const index = (start + i) % credentials.length
    ordered.push(credentials[index])
  }

  return ordered
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

function isSpendingCapGeminiError(error: unknown): boolean {
  if (!(error instanceof GeminiRequestError)) {
    return false
  }

  const message = error.message.toLowerCase()
  if (message.includes('spending cap')) {
    return true
  }

  if (message.includes('no credits')) {
    return true
  }

  return message.includes('prepay')
}

function shouldStopModelFallback(error: unknown): boolean {
  if (isAuthGeminiError(error)) {
    return true
  }

  return isSpendingCapGeminiError(error)
}

async function fetchGeminiScoreWithModelFallback(
  credential: GeminiCredential,
  models: string[],
  match: MatchRow,
): Promise<GeminiScoreLookup> {
  const errors: string[] = []

  for (const model of models) {
    try {
      return await fetchGeminiScore(credential, model, match)
    } catch (error) {
      const message = errorMessage(error)
      errors.push(`${credential.label}/${model}: ${message}`)

      if (shouldStopModelFallback(error)) {
        throw new Error(errors.join(' | '))
      }

      console.warn(
        `[update-results] ${match.id} ${credential.label}/${model} failed: ${message}`,
      )
    }
  }

  throw new Error(
    `All Gemini models failed for ${credential.label}: ${errors.join(' | ')}`,
  )
}

async function fetchGeminiScoreWithFallback(
  credentials: GeminiCredential[],
  models: string[],
  match: MatchRow,
): Promise<GeminiScoreLookup> {
  const errors: string[] = []
  const orderedCredentials = rotateCredentials(credentials, match.id)

  for (const credential of orderedCredentials) {
    try {
      return await fetchGeminiScoreWithModelFallback(credential, models, match)
    } catch (error) {
      const message = errorMessage(error)
      errors.push(message)
      console.warn(
        `[update-results] ${match.id} ${credential.label} exhausted: ${message}`,
      )
    }
  }

  throw new Error(`All Gemini credentials failed: ${errors.join(' | ')}`)
}

function buildFailurePayload(
  match: MatchRow,
  message: string,
  models: string[],
  credentials: GeminiCredential[],
  checkedAt: string,
): Record<string, unknown> {
  return {
    provider: 'gemini',
    match_id: match.id,
    checked_at: checkedAt,
    attempted_models: models,
    attempted_credentials: credentials.map((credential) => credential.label),
    error: message,
  }
}

async function recordMatchCheckFailure(
  supabase: SupabaseClient,
  match: MatchRow,
  message: string,
  models: string[],
  credentials: GeminiCredential[],
): Promise<void> {
  const checkedAt = new Date().toISOString()
  const { error } = await supabase
    .from('matches')
    .update({
      status: 'ONGOING',
      score_provider: 'gemini',
      score_payload: buildFailurePayload(
        match,
        message,
        models,
        credentials,
        checkedAt,
      ),
      score_checked_at: checkedAt,
    })
    .eq('id', match.id)

  if (error) {
    throw error
  }
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

function elapsedMinutesSinceKickoff(match: MatchRow, now: Date): number | null {
  if (!match.dateTime) {
    return null
  }

  const kickoff = new Date(match.dateTime)
  const kickoffTime = kickoff.getTime()
  if (Number.isNaN(kickoffTime)) {
    return null
  }

  return Math.floor((now.getTime() - kickoffTime) / 60000)
}

function finalLockMinutesForMatch(match: MatchRow): number {
  if (match.betFormat === 'knockout_decider') {
    return KNOCKOUT_FINAL_LOCK_MINUTES
  }

  return STANDARD_FINAL_LOCK_MINUTES
}

function canLockFinishedStatus(
  match: MatchRow,
  result: GeminiScoreResult,
  now: Date,
): boolean {
  if (!isFinishedResult(result)) {
    return false
  }

  const elapsedMinutes = elapsedMinutesSinceKickoff(match, now)
  if (elapsedMinutes === null) {
    return false
  }

  return elapsedMinutes >= finalLockMinutesForMatch(match)
}

function lifecycleStatusFromResult(
  match: MatchRow,
  result: GeminiScoreResult,
  now: Date,
): MatchStatus {
  if (canLockFinishedStatus(match, result, now)) {
    return 'FINISHED'
  }

  return 'ONGOING'
}

function resolvePlayoffWinner(
  match: MatchRow,
  result: GeminiScoreResult,
  status: MatchStatus,
): string | null {
  if (match.betFormat !== 'knockout_decider') {
    return null
  }

  if (status !== 'FINISHED') {
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

function shouldCheckMatch(match: MatchRow, now: Date): boolean {
  if (match.status !== 'FINISHED') {
    return true
  }

  if (match.scoreProvider === 'manual') {
    return false
  }

  const elapsedMinutes = elapsedMinutesSinceKickoff(match, now)
  if (elapsedMinutes === null) {
    return false
  }

  return elapsedMinutes <= FINISHED_RECHECK_WINDOW_MINUTES
}

function buildScorePayload(
  match: MatchRow,
  lookup: GeminiScoreLookup,
  checkedAt: string,
  status: MatchStatus,
  elapsedMinutes: number | null,
): Record<string, unknown> {
  return {
    provider: 'gemini',
    model: lookup.model,
    credential: lookup.credentialLabel,
    match_id: match.id,
    checked_at: checkedAt,
    persisted_status: status,
    final_lock: {
      elapsed_minutes: elapsedMinutes,
      minimum_elapsed_minutes: finalLockMinutesForMatch(match),
      accepted_finished: status === 'FINISHED',
    },
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
  const now = new Date()
  const checkedAt = now.toISOString()
  const status = lifecycleStatusFromResult(match, lookup.result, now)
  const elapsedMinutes = elapsedMinutesSinceKickoff(match, now)
  const update: Record<string, unknown> = {
    status,
    score_provider: 'gemini',
    score_payload: buildScorePayload(
      match,
      lookup,
      checkedAt,
      status,
      elapsedMinutes,
    ),
    score_checked_at: checkedAt,
  }

  if (isPersistableScore(lookup.result)) {
    update.score_a = lookup.result.scoreA
    update.score_b = lookup.result.scoreB
  }

  const playoffWinner = resolvePlayoffWinner(match, lookup.result, status)
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
    credential: lookup.credentialLabel,
    status: lookup.result.status,
    score_a: lookup.result.scoreA,
    score_b: lookup.result.scoreB,
    match_status: update.status,
    confidence: lookup.result.confidence,
  }
}

async function markStartedMatchesOngoing(
  supabase: SupabaseClient,
): Promise<number> {
  const now = new Date()
  const { data, error } = await supabase
    .from('matches')
    .update({ status: 'ONGOING' })
    .eq('status', 'PLANNED')
    .eq('visible_to_users', true)
    .not('date_time', 'is', null)
    .lte('date_time', now.toISOString())
    .select('id')

  if (error) {
    throw error
  }

  return data?.length ?? 0
}

async function findMatchesToUpdate(
  supabase: SupabaseClient,
): Promise<MatchRow[]> {
  const now = new Date()
  const startedAfter = new Date(
    now.getTime() - MATCH_LOOKBACK_MINUTES * 60 * 1000,
  )
  const firstCheckBefore = new Date(
    now.getTime() - MATCH_FIRST_CHECK_DELAY_MINUTES * 60 * 1000,
  )
  const lastCheckedBefore = new Date(
    now.getTime() - MATCH_CHECK_THROTTLE_MINUTES * 60 * 1000,
  )

  const { data, error } = await supabase
    .from('matches_with_teams')
    .select(
      'id, date_time, team_a_name, team_a_code, team_b_name, team_b_code, bet_format, status, score_provider',
    )
    .eq('visible_to_users', true)
    .not('date_time', 'is', null)
    .gte('date_time', startedAfter.toISOString())
    .lte('date_time', firstCheckBefore.toISOString())
    .or(
      `score_checked_at.is.null,score_checked_at.lte.${lastCheckedBefore.toISOString()}`,
    )
    .order('date_time', { ascending: true })

  if (error) {
    throw error
  }

  const matches = normalizeMatchRows(data)
  const matchesToCheck: MatchRow[] = []
  for (const match of matches) {
    if (shouldCheckMatch(match, now)) {
      matchesToCheck.push(match)
    }
  }

  return matchesToCheck
}

async function handleRequest(_req: Request): Promise<Response> {
  const supabaseUrl = Deno.env.get('SUPABASE_URL')
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

  if (!supabaseUrl || !serviceKey) {
    return jsonResponse({ error: 'Missing Supabase env' }, 500)
  }

  const supabase = createClient(supabaseUrl, serviceKey)

  try {
    const ongoingCount = await markStartedMatchesOngoing(supabase)
    if (ongoingCount > 0) {
      console.log(`[update-results] marked ${ongoingCount} match(es) ongoing`)
    }

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

    const credentials = resolveGeminiCredentials()
    if (credentials.length === 0) {
      return jsonResponse({ error: 'Missing Gemini API key env' }, 500)
    }

    const models = resolveGeminiModels()
    const results: Record<string, unknown>[] = []

    for (const match of matches) {
      const label = `${match.teamAName ?? '?'} vs ${match.teamBName ?? '?'}`
      try {
        const lookup = await fetchGeminiScoreWithFallback(
          credentials,
          models,
          match,
        )
        const result = await updateMatchScore(supabase, match, lookup)
        console.log(
          `[update-results] ${match.id} ${label} → credential=${lookup.credentialLabel} model=${lookup.model} status=${lookup.result.status} match_status=${result.match_status} score=${lookup.result.scoreA}-${lookup.result.scoreB} confidence=${lookup.result.confidence}`,
        )
        results.push(result)
      } catch (error) {
        let message = errorMessage(error)
        try {
          await recordMatchCheckFailure(
            supabase,
            match,
            message,
            models,
            credentials,
          )
        } catch (recordError) {
          message = `${message}; failed to store check failure: ${errorMessage(recordError)}`
        }
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
