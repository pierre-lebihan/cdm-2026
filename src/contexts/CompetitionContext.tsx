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
  loading: boolean
}

const CompetitionContext = createContext<CompetitionContextValue | null>(null)

export function CompetitionProvider({ children }: { children: ReactNode }) {
  const [competitions, setCompetitions] = useState<Competition[]>([])
  const [activeCompetitionId, setActiveCompetitionId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase
      .from('competitions')
      .select('*')
      .order('start_date', { ascending: false })
      .then(({ data }) => {
        const list = data ?? []
        setCompetitions(list)
        const active = list.find((c) => c.active) ?? list[0] ?? null
        if (active) {
          setActiveCompetitionId(active.id)
        }
        setLoading(false)
      })
  }, [])

  const competition = useMemo(
    () => competitions.find((c) => c.active) ?? null,
    [competitions],
  )

  const setPublicCompetition = useCallback(
    async (id: string) => {
      // Deactivate all, then activate the chosen one
      await supabase.from('competitions').update({ active: false }).neq('id', '')
      await supabase.from('competitions').update({ active: true }).eq('id', id)
      setCompetitions((prev) =>
        prev.map((c) => ({ ...c, active: c.id === id })),
      )
      setActiveCompetitionId(id)
    },
    [],
  )

  const value = useMemo<CompetitionContextValue>(
    () => ({
      competition,
      competitions,
      activeCompetitionId,
      setActiveCompetitionId,
      setPublicCompetition,
      loading,
    }),
    [competition, competitions, activeCompetitionId, setPublicCompetition, loading],
  )

  return (
    <CompetitionContext.Provider value={value}>
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
