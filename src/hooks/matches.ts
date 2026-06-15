import { keepPreviousData, useQuery } from '@tanstack/react-query'
import type { QueryFunctionContext } from '@tanstack/react-query'
import { useMemo } from 'react'
import { supabase } from '../lib/supabase'
import { useCompetition } from '../contexts/CompetitionContext'
import { useLanguage } from '../contexts/LanguageContext'
import type { Tables } from '../lib/database.types'
import { getLocalizedCountryName } from '../lib/localizedNames'
import {
  normalizeMatchStatus,
  type MatchBetFormat,
  type MatchStatus,
  type MatchTournamentPhase,
} from '../lib/matchEnums'
import type { LanguageCode } from '../lib/i18n'
import { matchDetailQueryKey, matchesListQueryKey } from '../lib/queryKeys'
import { queryKeyNumberValue, queryKeyStringValue } from '../lib/queryHelpers'

type MatchWithTeamsRow = Tables<'matches_with_teams'>

export interface NormalizedMatch {
  id: string
  dateTime: { seconds: number } | null
  ville: string | null
  teamA: string | null
  teamB: string | null
  teamAName: string | null
  teamACode: string | null
  teamBName: string | null
  teamBCode: string | null
  streaming: string | null
  scores: { A: number | null; B: number | null }
  odds: { PA: number | null; PB: number | null; PN: number | null }
  tournamentPhase: MatchTournamentPhase
  betFormat: MatchBetFormat
  playoffWinner: 'A' | 'B' | null
  status: MatchStatus
  display: boolean
  visibleToUsers: boolean
  idApiRugby: string | null
  groupName: string | null
  competitionId: string | null
}

function normalizePlayoffWinner(
  value: string | null | undefined,
): 'A' | 'B' | null {
  if (value === 'A' || value === 'B') {
    return value
  }

  return null
}

function normalizeMatch(
  row: MatchWithTeamsRow,
  language: LanguageCode,
  localeCode: string,
): NormalizedMatch {
  return {
    id: row.id ?? '',
    dateTime: row.date_time
      ? { seconds: new Date(row.date_time).getTime() / 1000 }
      : null,
    ville: row.city,
    teamA: row.team_a,
    teamB: row.team_b,
    teamAName: getLocalizedCountryName(
      row.team_a_code,
      row.team_a_name,
      language,
      localeCode,
    ),
    teamACode: row.team_a_code ?? null,
    teamBName: getLocalizedCountryName(
      row.team_b_code,
      row.team_b_name,
      language,
      localeCode,
    ),
    teamBCode: row.team_b_code ?? null,
    streaming: row.streaming,
    scores: { A: row.score_a, B: row.score_b },
    odds: { PA: row.odds_a, PB: row.odds_b, PN: row.odds_draw },
    tournamentPhase: row.tournament_phase ?? 'group',
    betFormat: row.bet_format ?? 'regulation_1x2',
    playoffWinner: normalizePlayoffWinner(row.playoff_winner),
    status: normalizeMatchStatus(row.status),
    display: true,
    visibleToUsers: row.visible_to_users !== false,
    idApiRugby: row.api_id,
    groupName: row.group_name ?? null,
    competitionId: row.competition_id ?? null,
  }
}

async function fetchMatches(
  competitionId: string,
): Promise<MatchWithTeamsRow[] | null> {
  const { data, error } = await supabase
    .from('matches_with_teams')
    .select('*')
    .eq('competition_id', competitionId)
    .order('date_time', { ascending: true })

  if (error) {
    throw error
  }

  return data ?? null
}

async function fetchMatchesQuery(
  context: QueryFunctionContext,
): Promise<MatchWithTeamsRow[] | null> {
  const competitionId = queryKeyStringValue(context.queryKey[2])

  if (!competitionId) {
    return null
  }

  return fetchMatches(competitionId)
}

async function fetchMatch(matchId: string): Promise<MatchWithTeamsRow | null> {
  const { data, error } = await supabase
    .from('matches_with_teams')
    .select('*')
    .eq('id', matchId)
    .single()

  if (error) {
    throw error
  }

  return data ?? null
}

async function fetchMatchQuery(
  context: QueryFunctionContext,
): Promise<MatchWithTeamsRow | null> {
  const matchId = queryKeyStringValue(context.queryKey[2])

  if (!matchId) {
    return null
  }

  return fetchMatch(matchId)
}

export function useMatches(refreshKey: number = 0): NormalizedMatch[] | null {
  const { activeCompetitionId } = useCompetition()
  const { language, localeCode } = useLanguage()
  const query = useQuery({
    enabled: Boolean(activeCompetitionId),
    placeholderData: keepPreviousData,
    queryFn: fetchMatchesQuery,
    queryKey: matchesListQueryKey(
      activeCompetitionId,
      queryKeyNumberValue(refreshKey),
    ),
    refetchInterval: 60 * 1000,
  })

  const matches = useMemo(() => {
    if (!query.data) {
      return null
    }

    return query.data.map((row) => normalizeMatch(row, language, localeCode))
  }, [query.data, language, localeCode])

  return matches
}

export function useMatch(matchId: string | undefined): NormalizedMatch | null {
  const { language, localeCode } = useLanguage()
  const query = useQuery({
    enabled: Boolean(matchId),
    placeholderData: keepPreviousData,
    queryFn: fetchMatchQuery,
    queryKey: matchDetailQueryKey(matchId),
    refetchInterval: 60 * 1000,
  })

  const match = useMemo(() => {
    if (!query.data) {
      return null
    }

    return normalizeMatch(query.data, language, localeCode)
  }, [query.data, language, localeCode])

  return match
}

function hasMatchKickoffPassed(
  match: NormalizedMatch,
  comparingDate?: number,
): boolean {
  const timestamp = match.dateTime?.seconds ? match.dateTime.seconds * 1000 : 0
  if (timestamp === 0) {
    return false
  }

  return timestamp <= (comparingDate ?? Date.now())
}

export function isMatchStarted(
  match: NormalizedMatch,
  comparingDate?: number,
): boolean {
  if (match.status !== 'PLANNED') {
    return true
  }

  return hasMatchKickoffPassed(match, comparingDate)
}

export function isMatchFinished(match: NormalizedMatch): boolean {
  return match.status === 'FINISHED'
}

export function isMatchBettingClosed(
  match: NormalizedMatch,
  comparingDate?: number,
): boolean {
  if (match.status !== 'PLANNED') {
    return true
  }

  return hasMatchKickoffPassed(match, comparingDate)
}
