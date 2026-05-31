import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useCompetition } from '../contexts/CompetitionContext'
import type { Tables } from '../lib/database.types'

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

function normalizeTeam(row: TeamRow | null): NormalizedTeam | null {
  if (!row) return null
  return {
    id: row.id,
    code: row.code,
    group: row.group_name,
    name: row.name,
    winOdd: row.win_odd,
    elimination: row.elimination,
    unveiled: row.unveiled,
  }
}

export function useTeam(id: string | null | undefined): NormalizedTeam | null {
  const [team, setTeam] = useState<NormalizedTeam | null>(null)

  useEffect(() => {
    if (!id) return
    supabase
      .from('teams')
      .select('*')
      .eq('id', id)
      .single()
      .then(({ data }) => setTeam(normalizeTeam(data)))
  }, [id])

  return team
}

export function useTeams(refreshKey: number = 0): NormalizedTeam[] {
  const [teams, setTeams] = useState<NormalizedTeam[]>([])
  const { activeCompetitionId } = useCompetition()

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
            const n = normalizeTeam(t)
            return n ? [n] : []
          }) ?? [],
        ),
      )
  }, [activeCompetitionId, refreshKey])

  return teams
}
