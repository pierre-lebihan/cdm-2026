import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { supabase } from '../lib/supabase'
import type { Tables } from '../lib/database.types'

type Competition = Tables<'competitions'>

interface CompetitionContextValue {
  /** The currently active competition (visible to all users) */
  competition: Competition | null
  /** All available competitions */
  competitions: Competition[]
  /** The competition ID currently being viewed (admin can override) */
  activeCompetitionId: string | null
  /** Admin: switch the viewed competition */
  setActiveCompetitionId: (id: string) => void
  /** Admin: change which competition is active (visible to users) */
  setPublicCompetition: (id: string) => Promise<void>
  refreshCompetitions: () => Promise<void>
  loading: boolean
}

const CompetitionContext = createContext<CompetitionContextValue | null>(null)

function DocumentTitleFromCompetition() {
  const { competition, loading } = useCompetition()

  useEffect(() => {
    if (loading) {
      return
    }
    const name = competition?.name?.trim()
    if (name != null && name !== '') {
      document.title = `${name} · Make Prono Great Again`
    } else {
      document.title = 'Make Prono Great Again'
    }
    const meta = document.querySelector('meta[name="description"]')
    if (meta != null && name != null && name !== '') {
      meta.setAttribute(
        'content',
        `Pronostics ${name} entre amis · Make Prono Great Again`,
      )
    }
  }, [competition?.name, loading])

  return null
}

export function CompetitionProvider({ children }: { children: ReactNode }) {
  const [competitions, setCompetitions] = useState<Competition[]>([])
  const [activeCompetitionId, setActiveCompetitionId] = useState<string | null>(
    null,
  )
  const [loading, setLoading] = useState(true)

  const refreshCompetitions = useCallback(async () => {
    const { data } = await supabase
      .from('competitions')
      .select('*')
      .order('start_date', { ascending: false })

    const list = data ?? []
    setCompetitions(list)
    setActiveCompetitionId((currentId) => {
      const current = list.find((c) => c.id === currentId)
      if (current) {
        return current.id
      }

      const active = list.find((c) => c.active) ?? list[0] ?? null
      return active?.id ?? null
    })
    setLoading(false)
  }, [])

  useEffect(() => {
    refreshCompetitions()
  }, [refreshCompetitions])

  const competition = useMemo(
    () => competitions.find((c) => c.active) ?? null,
    [competitions],
  )

  const setPublicCompetition = useCallback(async (id: string) => {
    // Deactivate all others, then activate the chosen one
    await supabase.from('competitions').update({ active: false }).neq('id', id)
    await supabase.from('competitions').update({ active: true }).eq('id', id)
    setCompetitions((prev) => prev.map((c) => ({ ...c, active: c.id === id })))
    setActiveCompetitionId(id)
  }, [])

  const value = useMemo<CompetitionContextValue>(
    () => ({
      competition,
      competitions,
      activeCompetitionId,
      setActiveCompetitionId,
      setPublicCompetition,
      refreshCompetitions,
      loading,
    }),
    [
      competition,
      competitions,
      activeCompetitionId,
      setPublicCompetition,
      refreshCompetitions,
      loading,
    ],
  )

  return (
    <CompetitionContext.Provider value={value}>
      <DocumentTitleFromCompetition />
      {children}
    </CompetitionContext.Provider>
  )
}

export function useCompetition(): CompetitionContextValue {
  const ctx = useContext(CompetitionContext)
  if (!ctx) {
    throw new Error('useCompetition must be used within a CompetitionProvider')
  }
  return ctx
}
