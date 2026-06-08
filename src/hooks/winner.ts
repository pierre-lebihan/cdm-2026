import { useCallback, useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { useCompetition } from '../contexts/CompetitionContext'
import { useLanguage } from '../contexts/LanguageContext'
import { captureEvent } from '../lib/posthog'

export function useSelectedWinner(): [
  string | null | undefined,
  (team: string) => Promise<void>,
] {
  const { user } = useAuth()
  const { activeCompetitionId } = useCompetition()
  const { t } = useLanguage()
  const [winnerTeam, setWinnerTeam] = useState<string | null | undefined>(
    undefined,
  )

  useEffect(() => {
    if (!user?.id || !activeCompetitionId) return
    supabase
      .from('competition_profiles')
      .select('winner_team')
      .eq('competition_id', activeCompetitionId)
      .eq('user_id', user.id)
      .maybeSingle()
      .then(({ data }) => {
        setWinnerTeam(data?.winner_team ?? null)
      })
  }, [user?.id, activeCompetitionId])

  const updater = useCallback(
    async (team: string) => {
      if (!user?.id || !activeCompetitionId) return

      const { error } = await supabase.from('competition_profiles').upsert(
        {
          competition_id: activeCompetitionId,
          user_id: user.id,
          winner_team: team,
        },
        { onConflict: 'competition_id,user_id' },
      )

      if (error) {
        captureEvent('final_winner_save_failed', {
          competition_id: activeCompetitionId,
          team_id: team,
        })
        toast.error(t.toasts.finalWinnerSaveError)
        return
      }
      setWinnerTeam(team)
      captureEvent('final_winner_selected', {
        competition_id: activeCompetitionId,
        team_id: team,
      })
      toast.success(t.toasts.finalWinnerSaved)
    },
    [
      user?.id,
      activeCompetitionId,
      t.toasts.finalWinnerSaveError,
      t.toasts.finalWinnerSaved,
    ],
  )

  return [winnerTeam, updater]
}
