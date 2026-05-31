import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import {
  mergeCpWithProfiles,
  mergeCpWithProfilesForUserIds,
} from '../lib/opponentMerge'
import { useCompetition } from '../contexts/CompetitionContext'

interface Opponent {
  id: string
  display_name: string | null
  avatar_url: string | null
  final_winner_points: number | null
  score: number | null
  winner_team: string | null
}

export function useOpponents(userIds: string[] | undefined): Opponent[] {
  const [opponents, setOpponents] = useState<Opponent[]>([])
  const { activeCompetitionId } = useCompetition()

  useEffect(() => {
    if (!userIds?.length || !activeCompetitionId) return

    let cancelled = false

    Promise.all([
      supabase
        .from('competition_profiles')
        .select('user_id, final_winner_points, score, winner_team')
        .eq('competition_id', activeCompetitionId)
        .in('user_id', userIds),
      supabase
        .from('profiles')
        .select('id, display_name, avatar_url')
        .in('id', userIds),
    ]).then(([cpRes, prRes]) => {
      if (cancelled) return
      if (cpRes.error || prRes.error) {
        setOpponents([])
        return
      }
      setOpponents(
        mergeCpWithProfilesForUserIds(
          userIds,
          cpRes.data ?? [],
          prRes.data ?? [],
        ),
      )
    })

    return () => {
      cancelled = true
    }
  }, [JSON.stringify(userIds), activeCompetitionId])

  return opponents
}

export function useAllOpponents(): Opponent[] {
  const [opponents, setOpponents] = useState<Opponent[]>([])
  const { activeCompetitionId } = useCompetition()

  useEffect(() => {
    if (!activeCompetitionId) return

    let cancelled = false

    supabase
      .from('competition_profiles')
      .select('user_id, final_winner_points, score, winner_team')
      .eq('competition_id', activeCompetitionId)
      .then(({ data: cpRows, error: cpError }) => {
        if (cancelled) return
        if (cpError) {
          setOpponents([])
          return
        }
        const rows = cpRows ?? []
        if (rows.length === 0) {
          setOpponents([])
          return
        }
        const ids = rows.map((r) => r.user_id)
        supabase
          .from('profiles')
          .select('id, display_name, avatar_url')
          .in('id', ids)
          .then(({ data: profileRows, error: prError }) => {
            if (cancelled) return
            if (prError) {
              setOpponents([])
              return
            }
            setOpponents(mergeCpWithProfiles(rows, profileRows ?? []))
          })
      })

    return () => {
      cancelled = true
    }
  }, [activeCompetitionId])

  return opponents
}

export function useOpponent(userId: string | undefined): Opponent | null {
  const [opponent, setOpponent] = useState<Opponent | null>(null)
  const { activeCompetitionId } = useCompetition()

  useEffect(() => {
    if (!userId || !activeCompetitionId) return

    let cancelled = false

    Promise.all([
      supabase
        .from('competition_profiles')
        .select('user_id, final_winner_points, score, winner_team')
        .eq('competition_id', activeCompetitionId)
        .eq('user_id', userId)
        .maybeSingle(),
      supabase
        .from('profiles')
        .select('id, display_name, avatar_url')
        .eq('id', userId)
        .single(),
    ]).then(([cpRes, prRes]) => {
      if (cancelled) return
      if (cpRes.error || prRes.error) {
        setOpponent(null)
        return
      }
      const p = prRes.data
      if (!p) {
        setOpponent(null)
        return
      }
      const cp = cpRes.data
      setOpponent({
        id: userId,
        display_name: p.display_name ?? null,
        avatar_url: p.avatar_url ?? null,
        final_winner_points: cp?.final_winner_points ?? 0,
        score: cp?.score ?? 0,
        winner_team: cp?.winner_team ?? null,
      })
    })

    return () => {
      cancelled = true
    }
  }, [userId, activeCompetitionId])

  return opponent
}
