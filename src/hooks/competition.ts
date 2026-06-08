import { useMemo } from 'react'
import { useCompetition } from '../contexts/CompetitionContext'
import { useLanguage } from '../contexts/LanguageContext'
import { getLocalizedCompetitionName } from '../lib/localizedNames'

export function useCompetitionDisplayName(): string {
  const { competition } = useCompetition()
  const { language } = useLanguage()
  return getLocalizedCompetitionName(competition?.name, language)
}

interface CompetitionData {
  id: string
  final_winner_team: string | null
  launch_bet: string | null
  start_date: string | null
  name: string
  active: boolean
  launchBet: { seconds: number } | null
}

export function useCompetitionData(): CompetitionData | null {
  const { competitions, activeCompetitionId } = useCompetition()

  return useMemo(() => {
    const comp = competitions.find((c) => c.id === activeCompetitionId)
    if (!comp) return null
    return {
      ...comp,
      launchBet: comp.launch_bet
        ? { seconds: new Date(comp.launch_bet).getTime() / 1000 }
        : null,
    }
  }, [competitions, activeCompetitionId])
}
