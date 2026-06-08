import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useCompetition } from '../contexts/CompetitionContext'
import { useLanguage } from '../contexts/LanguageContext'
import type { Tables } from '../lib/database.types'
import type { LanguageCode } from '../lib/i18n'
import { getLocalizedCountryName } from '../lib/localizedNames'

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

export function useTeam(id: string | null | undefined): NormalizedTeam | null {
  const [team, setTeam] = useState<NormalizedTeam | null>(null)
  const { language, localeCode } = useLanguage()

  useEffect(() => {
    if (!id) return
    supabase
      .from('teams')
      .select('*')
      .eq('id', id)
      .single()
      .then(({ data }) => setTeam(normalizeTeam(data, language, localeCode)))
  }, [id, language, localeCode])

  return team
}

export function useTeams(refreshKey: number = 0): NormalizedTeam[] {
  const [teams, setTeams] = useState<NormalizedTeam[]>([])
  const { activeCompetitionId } = useCompetition()
  const { language, localeCode } = useLanguage()

  useEffect(() => {
    if (!activeCompetitionId) return
    supabase
      .from('teams')
      .select('*')
      .eq('competition_id', activeCompetitionId)
      .order('win_odd', { ascending: true })
      .then(({ data }) =>
        setTeams(
          data?.flatMap((t) => {
            const n = normalizeTeam(t, language, localeCode)
            return n ? [n] : []
          }) ?? [],
        ),
      )
  }, [activeCompetitionId, refreshKey, language, localeCode])

  return teams
}
