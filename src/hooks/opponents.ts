import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useCompetition } from '../contexts/CompetitionContext'

interface Opponent {
  id: string
  display_name: string | null
  avatar_url: string | null
  score: number | null
  winner_team: string | null
}

export function useOpponents(userIds: string[] | undefined): Opponent[] {
  const [opponents, setOpponents] = useState<Opponent[]>([])
  const { activeCompetitionId } = useCompetition()

  useEffect(() => {
    if (!userIds?.length || !activeCompetitionId) return

    supabase
      .from('competition_profiles')
      .select('user_id, score, winner_team, ...profiles(id, display_name, avatar_url)')
      .eq('competition_id', activeCompetitionId)
      .in('user_id', userIds)
      .then(({ data, error }) => {
        if (error) {
          // Fallback: fetch from profiles directly (pre-migration compat)
          supabase
            .from('profiles')
            .select('id, display_name, avatar_url, score, winner_team')
            .in('id', userIds)
            .then(({ data: fallback }) => setOpponents(fallback ?? []))
          return
        }
        setOpponents(
          (data ?? []).map((row: any) => ({
            id: row.id ?? row.user_id,
            display_name: row.display_name ?? null,
            avatar_url: row.avatar_url ?? null,
            score: row.score ?? 0,
            winner_team: row.winner_team ?? null,
          })),
        )
      })
  }, [JSON.stringify(userIds), activeCompetitionId])

  return opponents
}

export function useAllOpponents(): Opponent[] {
  const [opponents, setOpponents] = useState<Opponent[]>([])
  const { activeCompetitionId } = useCompetition()

  useEffect(() => {
    if (!activeCompetitionId) return

    supabase
      .from('competition_profiles')
      .select('user_id, score, winner_team, ...profiles(id, display_name, avatar_url)')
      .eq('competition_id', activeCompetitionId)
      .then(({ data, error }) => {
        if (error) {
          supabase
            .from('profiles')
            .select('id, display_name, avatar_url, score, winner_team')
            .then(({ data: fallback }) => setOpponents(fallback ?? []))
          return
        }
        setOpponents(
          (data ?? []).map((row: any) => ({
            id: row.id ?? row.user_id,
            display_name: row.display_name ?? null,
            avatar_url: row.avatar_url ?? null,
            score: row.score ?? 0,
            winner_team: row.winner_team ?? null,
          })),
        )
      })
  }, [activeCompetitionId])

  return opponents
}

export function useOpponent(userId: string | undefined): Opponent | null {
  const [opponent, setOpponent] = useState<Opponent | null>(null)
  const { activeCompetitionId } = useCompetition()

  useEffect(() => {
    if (!userId || !activeCompetitionId) return

    supabase
      .from('competition_profiles')
      .select('user_id, score, winner_team, ...profiles(id, display_name, avatar_url)')
      .eq('competition_id', activeCompetitionId)
      .eq('user_id', userId)
      .single()
      .then(({ data, error }) => {
        if (error) {
          supabase
            .from('profiles')
            .select('id, display_name, avatar_url, score, winner_team')
            .eq('id', userId)
            .single()
            .then(({ data: fallback }) => setOpponent(fallback))
          return
        }
        const row = data as any
        setOpponent({
          id: row.id ?? row.user_id,
          display_name: row.display_name ?? null,
          avatar_url: row.avatar_url ?? null,
          score: row.score ?? 0,
          winner_team: row.winner_team ?? null,
        })
      })
  }, [userId, activeCompetitionId])

  return opponent
}
