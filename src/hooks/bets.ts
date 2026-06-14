import { useCallback } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import type { QueryFunctionContext } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { useCompetition } from '../contexts/CompetitionContext'
import { useLanguage } from '../contexts/LanguageContext'
import type { BetOutcomeStatusEnum, Tables } from '../lib/database.types'
import type { MatchPrediction } from '../lib/openrouter'
import { captureEvent } from '../lib/posthog'
import {
  betForUserQueryKey,
  betsForMatchQueryKey,
  betsRootQueryKey,
  matchesRootQueryKey,
  userBetsQueryKey,
  userBetsRootQueryKey,
} from '../lib/queryKeys'
import { queryKeyStringValue } from '../lib/queryHelpers'
import { queryClient as appQueryClient } from '../lib/queryClient'

type BetRow = Tables<'bets'>

interface NormalizedBet {
  id: string
  matchId: string | null
  uid: string | null
  betTeamA: number | null
  betTeamB: number | null
  betPlayoffWinner: 'A' | 'B' | null
  outcomeStatus: BetOutcomeStatusEnum | null
  pointsWon: number | null
  updatedAt: string | null
  match_id: string | null
  user_id: string | null
  bet_team_a: number | null
  bet_team_b: number | null
  bet_playoff_winner: string | null
  outcome_status: BetOutcomeStatusEnum | null
  points_won: number | null
  updated_at: string | null
}

function normalizeBetPlayoffWinner(value: string | null): 'A' | 'B' | null {
  if (value === 'A' || value === 'B') {
    return value
  }

  return null
}

function normalizeBet(row: BetRow | null): NormalizedBet | undefined {
  if (!row) return undefined
  return {
    ...row,
    matchId: row.match_id,
    uid: row.user_id,
    betTeamA: row.bet_team_a,
    betTeamB: row.bet_team_b,
    betPlayoffWinner: normalizeBetPlayoffWinner(row.bet_playoff_winner),
    outcomeStatus: row.outcome_status,
    pointsWon: row.points_won,
    updatedAt: row.updated_at,
  }
}

async function fetchBetsFromGame(
  matchId: string,
): Promise<NormalizedBet[] | null> {
  const { data, error } = await supabase
    .from('bets')
    .select('*')
    .eq('match_id', matchId)

  if (error) {
    throw error
  }

  return (
    data?.flatMap((b) => {
      const n = normalizeBet(b)
      return n ? [n] : []
    }) ?? null
  )
}

async function fetchBetsFromGameQuery(
  context: QueryFunctionContext,
): Promise<NormalizedBet[] | null> {
  const matchId = queryKeyStringValue(context.queryKey[2])

  if (!matchId) {
    return null
  }

  return fetchBetsFromGame(matchId)
}

async function fetchBetFromUser(
  matchId: string,
  uid: string,
): Promise<NormalizedBet | null> {
  const { data, error } = await supabase
    .from('bets')
    .select('*')
    .eq('match_id', matchId)
    .eq('user_id', uid)
    .maybeSingle()

  if (error) {
    throw error
  }

  return normalizeBet(data) ?? null
}

async function fetchBetFromUserQuery(
  context: QueryFunctionContext,
): Promise<NormalizedBet | null> {
  const matchId = queryKeyStringValue(context.queryKey[2])
  const uid = queryKeyStringValue(context.queryKey[3])

  if (!matchId || !uid) {
    return null
  }

  return fetchBetFromUser(matchId, uid)
}

async function fetchAllUserBets(
  competitionId: string,
  userId: string,
): Promise<Set<string> | null> {
  const { data, error } = await supabase
    .from('bets')
    .select('match_id')
    .eq('user_id', userId)
    .eq('competition_id', competitionId)

  if (error) {
    throw error
  }

  const ids = new Set(
    (data ?? []).flatMap((b) => (b.match_id ? [b.match_id] : [])),
  )

  return ids
}

async function fetchAllUserBetsQuery(
  context: QueryFunctionContext,
): Promise<Set<string> | null> {
  const competitionId = queryKeyStringValue(context.queryKey[2])
  const userId = queryKeyStringValue(context.queryKey[3])

  if (!competitionId || !userId) {
    return null
  }

  return fetchAllUserBets(competitionId, userId)
}

export function useBetsFromGame(
  matchId: string | undefined,
  enabled: boolean,
): [NormalizedBet[] | null, boolean] {
  const query = useQuery({
    enabled: Boolean(matchId && enabled),
    queryFn: fetchBetsFromGameQuery,
    queryKey: betsForMatchQueryKey(matchId),
  })

  return [query.data ?? null, query.isPending && Boolean(matchId && enabled)]
}

export function useBetFromUser(
  matchId: string | undefined,
  uid: string | undefined,
): [NormalizedBet | null | undefined, boolean] {
  const query = useQuery({
    enabled: Boolean(matchId && uid),
    queryFn: fetchBetFromUserQuery,
    queryKey: betForUserQueryKey(matchId, uid),
  })

  return [query.data, query.isPending && Boolean(matchId && uid)]
}

export function useBet(
  matchId: string | undefined,
): [
  NormalizedBet | undefined,
  (betData: {
    betTeamA: number
    betTeamB: number
    betPlayoffWinner?: 'A' | 'B' | null
  }) => Promise<void>,
  boolean,
] {
  const { user } = useAuth()
  const { activeCompetitionId } = useCompetition()
  const { t } = useLanguage()
  const uid = user?.id
  const queryClient = useQueryClient()
  const query = useQuery({
    enabled: Boolean(matchId && uid),
    queryFn: fetchBetFromUserQuery,
    queryKey: betForUserQueryKey(matchId, uid),
  })

  const setBet = useCallback(
    async (betData: {
      betTeamA: number
      betTeamB: number
      betPlayoffWinner?: 'A' | 'B' | null
    }) => {
      if (!uid || !matchId) return
      const id = `${matchId}_${uid}`
      const row = {
        id,
        match_id: matchId,
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

      const toastId = `bet-${matchId}`
      if (error) {
        console.error('Erreur upsert bet:', error)
        captureEvent('bet_save_failed', {
          match_id: matchId,
          competition_id: activeCompetitionId,
        })
        toast.error(t.toasts.betSaveError, {
          id: toastId,
        })
      } else if (data) {
        queryClient.setQueryData(
          betForUserQueryKey(matchId, uid),
          normalizeBet(data) ?? null,
        )
        queryClient.invalidateQueries({
          queryKey: betsForMatchQueryKey(matchId),
        })
        queryClient.invalidateQueries({ queryKey: matchesRootQueryKey() })
        queryClient.invalidateQueries({
          queryKey: userBetsQueryKey(activeCompetitionId, uid),
        })
        captureEvent('bet_saved', {
          match_id: matchId,
          competition_id: activeCompetitionId,
          bet_team_a: betData.betTeamA,
          bet_team_b: betData.betTeamB,
          has_playoff_winner: betData.betPlayoffWinner != null,
        })
        toast.success(t.toasts.betSaved, { id: toastId })
      }
    },
    [
      matchId,
      uid,
      activeCompetitionId,
      queryClient,
      t.toasts.betSaveError,
      t.toasts.betSaved,
    ],
  )

  return [
    query.data ?? undefined,
    setBet,
    query.isPending && Boolean(matchId && uid),
  ]
}

export function useAllUserBets() {
  const { user } = useAuth()
  const { activeCompetitionId } = useCompetition()
  const queryClient = useQueryClient()
  const query = useQuery({
    enabled: Boolean(user?.id && activeCompetitionId),
    queryFn: fetchAllUserBetsQuery,
    queryKey: userBetsQueryKey(activeCompetitionId, user?.id),
  })

  const refresh = useCallback(() => {
    queryClient.invalidateQueries({
      queryKey: userBetsQueryKey(activeCompetitionId, user?.id),
    })
  }, [activeCompetitionId, queryClient, user?.id])

  return { bettedMatchIds: query.data ?? null, refresh }
}

export async function saveBatchBets(
  userId: string,
  predictions: MatchPrediction[],
  competitionId: string | null,
  saveErrorMessage: string,
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
    captureEvent('ai_batch_bets_save_failed', {
      competition_id: competitionId,
      predictions_count: rows.length,
    })
    throw new Error(saveErrorMessage)
  }

  captureEvent('ai_batch_bets_saved', {
    competition_id: competitionId,
    predictions_count: rows.length,
  })

  appQueryClient.invalidateQueries({ queryKey: betsRootQueryKey() })
  appQueryClient.invalidateQueries({ queryKey: matchesRootQueryKey() })
  appQueryClient.invalidateQueries({ queryKey: userBetsRootQueryKey() })
  appQueryClient.invalidateQueries({
    queryKey: userBetsQueryKey(competitionId, userId),
  })

  return rows.length
}
