import { keepPreviousData, useQuery } from '@tanstack/react-query'
import type { QueryFunctionContext } from '@tanstack/react-query'
import { useMemo } from 'react'
import { supabase } from '../lib/supabase'
import { useCompetition } from '../contexts/CompetitionContext'
import { useLanguage } from '../contexts/LanguageContext'
import type { Tables } from '../lib/database.types'
import type { LanguageCode } from '../lib/i18n'
import { getLocalizedCountryName } from '../lib/localizedNames'
import { teamDetailQueryKey, teamsListQueryKey } from '../lib/queryKeys'
import { queryKeyNumberValue, queryKeyStringValue } from '../lib/queryHelpers'

type TeamRow = Tables<'teams'>

export interface NormalizedTeam {
  id: string
  code: string
  group: string | null
  name: string
  winOdd: number | null
  elimination: boolean | null
  unveiled: boolean | null
}

function normalizeTeam(
  row: TeamRow | null,
  language: LanguageCode,
  localeCode: string,
): NormalizedTeam | null {
  if (!row) return null
  return {
    id: row.id,
    code: row.code,
    group: row.group_name,
    name:
      getLocalizedCountryName(row.code, row.name, language, localeCode) ??
      row.name,
    winOdd: row.win_odd,
    elimination: row.elimination,
    unveiled: row.unveiled,
  }
}

function isPlaceholderTeam(team: NormalizedTeam): boolean {
  const normalizedName = team.name.trim().toLowerCase()

  if (team.code === 'tbd') {
    return true
  }

  return normalizedName === 'à définir' || normalizedName === 'a definir'
}

export function getFinalWinnerEligibleTeams(
  teams: NormalizedTeam[],
): NormalizedTeam[] {
  const eligibleTeams: NormalizedTeam[] = []

  for (const team of teams) {
    if (!isPlaceholderTeam(team)) {
      eligibleTeams.push(team)
    }
  }

  return eligibleTeams
}

async function fetchTeam(id: string): Promise<TeamRow | null> {
  const { data, error } = await supabase
    .from('teams')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    throw error
  }

  return data ?? null
}

async function fetchTeams(competitionId: string): Promise<TeamRow[]> {
  const { data, error } = await supabase
    .from('teams')
    .select('*')
    .eq('competition_id', competitionId)
    .order('win_odd', { ascending: true })

  if (error) {
    throw error
  }

  return data ?? []
}

async function fetchTeamsQuery(
  context: QueryFunctionContext,
): Promise<TeamRow[]> {
  const competitionId = queryKeyStringValue(context.queryKey[2])

  if (!competitionId) {
    return []
  }

  return fetchTeams(competitionId)
}

async function fetchTeamQuery(
  context: QueryFunctionContext,
): Promise<TeamRow | null> {
  const teamId = queryKeyStringValue(context.queryKey[2])

  if (!teamId) {
    return null
  }

  return fetchTeam(teamId)
}

export function useTeam(id: string | null | undefined): NormalizedTeam | null {
  const { language, localeCode } = useLanguage()
  const query = useQuery({
    enabled: Boolean(id),
    queryFn: fetchTeamQuery,
    queryKey: teamDetailQueryKey(id),
  })

  const team = useMemo(() => {
    return normalizeTeam(query.data ?? null, language, localeCode)
  }, [query.data, language, localeCode])

  return team
}

export function useTeams(refreshKey: number = 0): NormalizedTeam[] {
  const { activeCompetitionId } = useCompetition()
  const { language, localeCode } = useLanguage()
  const query = useQuery({
    enabled: Boolean(activeCompetitionId),
    placeholderData: keepPreviousData,
    queryFn: fetchTeamsQuery,
    queryKey: teamsListQueryKey(
      activeCompetitionId,
      queryKeyNumberValue(refreshKey),
    ),
    refetchInterval: 2 * 60 * 1000,
  })

  const teams = useMemo(() => {
    return (query.data ?? []).flatMap((t) => {
      const n = normalizeTeam(t, language, localeCode)
      return n ? [n] : []
    })
  }, [query.data, language, localeCode])

  return teams
}
