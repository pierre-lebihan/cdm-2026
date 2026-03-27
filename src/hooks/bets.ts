import { useCallback, useEffect, useState, useMemo } from 'react'
import toast from 'react-hot-toast'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { useCompetition } from '../contexts/CompetitionContext'
import type { Tables } from '../lib/database.types'
import type { MatchPrediction } from '../lib/openrouter'

type BetRow = Tables<'bets'>

interface NormalizedBet {
  id: string
  matchId: string | null
  uid: string | null
  betTeamA: number | null
  betTeamB: number | null
  betPlayoffWinner: 'A' | 'B' | null
  pointsWon: number | null
  updatedAt: string | null
  match_id: string | null
  user_id: string | null
  bet_team_a: number | null
  bet_team_b: number | null
  bet_playoff_winner: string | null
  points_won: number | null
  updated_at: string | null
}

function normalizeBet(row: BetRow | null): NormalizedBet | undefined {
  if (!row) return undefined
  return {
    ...row,
    matchId: row.match_id,
    uid: row.user_id,
    betTeamA: row.bet_team_a,
    betTeamB: row.bet_team_b,
    betPlayoffWinner: (row.bet_playoff_winner as 'A' | 'B' | null) ?? null,
    pointsWon: row.points_won,
    updatedAt: row.updated_at,
  }
}

export function useBetsFromGame(matchId: string | undefined, enabled: boolean) {
  const [bets, setBets] = useState<NormalizedBet[] | null>(null)

  useEffect(() => {
    if (!matchId || !enabled) {
      if (!enabled) {
        setBets(null)
      }
      return
    }
    supabase
      .from('bets')
      .select('*')
      .eq('match_id', matchId)
      .then(({ data }) =>
        setBets(
          data?.flatMap((b) => {
            const n = normalizeBet(b)
            return n ? [n] : []
          }) ?? null,
        ),
      )
  }, [matchId, enabled])

  return bets
}

export function useBetFromUser(matchId: string | undefined, uid: string | undefined) {
  const [bet, setBet] = useState<NormalizedBet | null | undefined>(null)

  useEffect(() => {
    if (!matchId || !uid) return
    supabase
      .from('bets')
      .select('*')
      .eq('match_id', matchId)
      .eq('user_id', uid)
      .maybeSingle()
      .then(({ data }) => setBet(normalizeBet(data) ?? null))
  }, [matchId, uid])

  return [bet]
}

export function useBet(matchId: string | undefined): [NormalizedBet | undefined, (betData: { betTeamA: number; betTeamB: number; betPlayoffWinner?: 'A' | 'B' | null }) => Promise<void>] {
  const { user } = useAuth()
  const { activeCompetitionId } = useCompetition()
  const uid = user?.id
  const [bet, setBetState] = useState<BetRow | null>(null)

  useEffect(() => {
    if (!matchId || !uid) return
    supabase
      .from('bets')
      .select('*')
      .eq('match_id', matchId)
      .eq('user_id', uid)
      .maybeSingle()
      .then(({ data }) => setBetState(data))
  }, [matchId, uid])

  const setBet = useCallback(
    async (betData: { betTeamA: number; betTeamB: number; betPlayoffWinner?: 'A' | 'B' | null }) => {
      if (!uid) return
      const id = `${matchId}_${uid}`
      const row = {
        id,
        match_id: matchId!,
        user_id: uid,
        competition_id: activeCompetitionId,
        bet_team_a: betData.betTeamA,
        bet_team_b: betData.betTeamB,
        bet_playoff_winner: betData.betPlayoffWinner ?? null,
        updated_at: new Date().toISOString(),
      }
      const { data, error } = await supabase
        .from('bets')
        .upsert(row, { onConflict: 'id' })
        .select()
        .single()

      if (error) {
        console.error('Erreur upsert bet:', error)
        toast.error('Erreur lors de la sauvegarde du pronostic')
      } else if (data) {
        setBetState(data)
        toast.success('Pronostic sauvegardé')
      }
    },
    [matchId, uid, activeCompetitionId],
  )

  const normalizedBet = useMemo(() => normalizeBet(bet), [bet])

  return [normalizedBet, setBet]
}

export function useAllUserBets() {
  const { user } = useAuth()
  const { activeCompetitionId } = useCompetition()
  const [bettedMatchIds, setBettedMatchIds] = useState<Set<string> | null>(null)
  const [version, setVersion] = useState(0)

  useEffect(() => {
    if (!user || !activeCompetitionId) return
    supabase
      .from('bets')
      .select('match_id')
      .eq('user_id', user.id)
      .eq('competition_id', activeCompetitionId)
      .then(({ data }) => {
        const ids = new Set(
          (data ?? []).flatMap((b) => b.match_id ? [b.match_id] : [])
        )
        setBettedMatchIds(ids)
      })
  }, [user, activeCompetitionId, version])

  const refresh = useCallback(() => {
    setVersion((v) => v + 1)
  }, [])

  return { bettedMatchIds, refresh }
}

export async function saveBatchBets(
  userId: string,
  predictions: MatchPrediction[],
  competitionId: string | null,
): Promise<number> {
  const rows = predictions.map((p) => ({
    id: `${p.match_id}_${userId}`,
    match_id: p.match_id,
    user_id: userId,
    competition_id: competitionId,
    bet_team_a: p.score_a,
    bet_team_b: p.score_b,
    updated_at: new Date().toISOString(),
  }))

  const { error } = await supabase
    .from('bets')
    .upsert(rows, { onConflict: 'id' })

  if (error) {
    throw new Error('Erreur lors de la sauvegarde des pronostics')
  }

  return rows.length
}
