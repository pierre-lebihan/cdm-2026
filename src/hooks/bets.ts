import { useCallback, useMemo } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import type { QueryClient, QueryFunctionContext } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { useCompetition } from '../contexts/CompetitionContext'
import { useLanguage } from '../contexts/LanguageContext'
import type { BetOutcomeStatusEnum, Tables } from '../lib/database.types'
import type { MatchPrediction } from '../lib/openrouter'
import type { BetDistributionCounts } from '../lib/bettingOdds'
import { captureEvent } from '../lib/posthog'
import {
  betDistributionsQueryKey,
  betDistributionsRootQueryKey,
  betForUserQueryKey,
  betsForMatchQueryKey,
  betsRootQueryKey,
  matchesRootQueryKey,
  userBetsByMatchQueryKey,
  userBetsByMatchRootQueryKey,
  userBetsQueryKey,
  userBetsRootQueryKey,
} from '../lib/queryKeys'
import { queryKeyStringValue } from '../lib/queryHelpers'
import { queryClient as appQueryClient } from '../lib/queryClient'

type BetRow = Tables<'bets'>
type BetDistributionRow = Tables<'bet_distribution_by_match'>
type NormalizedBetsByMatch = Record<string, NormalizedBet>
type BetDistributionsByMatch = Record<string, BetDistributionCounts>

interface NormalizedBet {
  id: string
  competitionId: string | null
  matchId: string | null
  uid: string | null
  betTeamA: number | null
  betTeamB: number | null
  betPlayoffWinner: 'A' | 'B' | null
  outcomeStatus: BetOutcomeStatusEnum | null
  pointsWon: number | null
  updatedAt: string | null
  competition_id: string | null
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
    competitionId: row.competition_id,
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

function normalizeBetsByMatch(rows: BetRow[] | null): NormalizedBetsByMatch {
  const byMatch: NormalizedBetsByMatch = {}

  for (const row of rows ?? []) {
    const bet = normalizeBet(row)
    if (bet?.matchId) {
      byMatch[bet.matchId] = bet
    }
  }

  return byMatch
}

function normalizeBetDistribution(
  row: BetDistributionRow,
): { matchId: string; distribution: BetDistributionCounts } | null {
  if (!row.match_id) {
    return null
  }

  return {
    matchId: row.match_id,
    distribution: {
      countA: row.count_a ?? 0,
      countN: row.count_n ?? 0,
      countB: row.count_b ?? 0,
      total: row.total ?? 0,
    },
  }
}

function normalizeBetDistributionsByMatch(
  rows: BetDistributionRow[] | null,
): BetDistributionsByMatch {
  const byMatch: BetDistributionsByMatch = {}

  for (const row of rows ?? []) {
    const item = normalizeBetDistribution(row)
    if (item) {
      byMatch[item.matchId] = item.distribution
    }
  }

  return byMatch
}

function mergeBetByMatch(
  current: NormalizedBetsByMatch | undefined,
  bet: NormalizedBet,
): NormalizedBetsByMatch {
  const next: NormalizedBetsByMatch = { ...(current ?? {}) }

  if (bet.matchId) {
    next[bet.matchId] = bet
  }

  return next
}

function setCachedUserBet(
  queryClient: QueryClient,
  competitionId: string | null,
  userId: string,
  bet: NormalizedBet,
): void {
  const key = userBetsByMatchQueryKey(competitionId, userId)
  const current = queryClient.getQueryData<NormalizedBetsByMatch>(key)
  queryClient.setQueryData(key, mergeBetByMatch(current, bet))
}

function betFromMap(
  betsByMatch: NormalizedBetsByMatch | undefined,
  matchId: string | undefined,
): NormalizedBet | null | undefined {
  if (!matchId) {
    return undefined
  }

  if (!betsByMatch) {
    return undefined
  }

  return betsByMatch[matchId] ?? null
}

function bettedMatchIdsFromMap(
  betsByMatch: NormalizedBetsByMatch | undefined,
): Set<string> | null {
  if (!betsByMatch) {
    return null
  }

  return new Set(Object.keys(betsByMatch))
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

async function fetchUserBetsByMatch(
  competitionId: string,
  userId: string,
): Promise<NormalizedBetsByMatch> {
  const { data, error } = await supabase
    .from('bets')
    .select('*')
    .eq('user_id', userId)
    .eq('competition_id', competitionId)

  if (error) {
    throw error
  }

  return normalizeBetsByMatch(data ?? null)
}

async function fetchUserBetsByMatchQuery(
  context: QueryFunctionContext,
): Promise<NormalizedBetsByMatch> {
  const competitionId = queryKeyStringValue(context.queryKey[2])
  const uid = queryKeyStringValue(context.queryKey[3])

  if (!competitionId || !uid) {
    return {}
  }

  return fetchUserBetsByMatch(competitionId, uid)
}

async function fetchBetDistributions(
  competitionId: string,
): Promise<BetDistributionsByMatch> {
  const { data, error } = await supabase
    .from('bet_distribution_by_match')
    .select('*')
    .eq('competition_id', competitionId)

  if (error) {
    throw error
  }

  return normalizeBetDistributionsByMatch(data ?? null)
}

async function fetchBetDistributionsQuery(
  context: QueryFunctionContext,
): Promise<BetDistributionsByMatch> {
  const competitionId = queryKeyStringValue(context.queryKey[2])

  if (!competitionId) {
    return {}
  }

  return fetchBetDistributions(competitionId)
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
  const { activeCompetitionId } = useCompetition()
  const { user } = useAuth()
  const query = useQuery({
    enabled: Boolean(activeCompetitionId && uid && user?.id),
    queryFn: fetchUserBetsByMatchQuery,
    queryKey: userBetsByMatchQueryKey(activeCompetitionId, uid),
  })

  return [
    betFromMap(query.data, matchId),
    query.isPending &&
      Boolean(matchId && activeCompetitionId && uid && user?.id),
  ]
}

export function useBetDistribution(
  matchId: string | undefined,
  enabled: boolean = true,
): [BetDistributionCounts | null, boolean] {
  const { activeCompetitionId } = useCompetition()
  const { user } = useAuth()
  const query = useQuery({
    enabled: Boolean(activeCompetitionId && user?.id && enabled),
    queryFn: fetchBetDistributionsQuery,
    queryKey: betDistributionsQueryKey(activeCompetitionId),
  })

  const distribution =
    matchId && query.data ? (query.data[matchId] ?? null) : null

  return [
    distribution,
    query.isPending &&
      Boolean(matchId && activeCompetitionId && user?.id && enabled),
  ]
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
    enabled: Boolean(activeCompetitionId && uid),
    queryFn: fetchUserBetsByMatchQuery,
    queryKey: userBetsByMatchQueryKey(activeCompetitionId, uid),
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
        const normalizedBet = normalizeBet(data)
        queryClient.setQueryData(
          betForUserQueryKey(matchId, uid),
          normalizedBet ?? null,
        )
        if (normalizedBet) {
          setCachedUserBet(queryClient, activeCompetitionId, uid, normalizedBet)
        }
        queryClient.invalidateQueries({
          queryKey: betsForMatchQueryKey(matchId),
        })
        queryClient.invalidateQueries({
          queryKey: betDistributionsRootQueryKey(),
        })
        queryClient.invalidateQueries({ queryKey: matchesRootQueryKey() })
        queryClient.invalidateQueries({
          queryKey: userBetsByMatchQueryKey(activeCompetitionId, uid),
        })
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
    betFromMap(query.data, matchId) ?? undefined,
    setBet,
    query.isPending && Boolean(matchId && activeCompetitionId && uid),
  ]
}

export function useAllUserBets() {
  const { user } = useAuth()
  const { activeCompetitionId } = useCompetition()
  const queryClient = useQueryClient()
  const query = useQuery({
    enabled: Boolean(user?.id && activeCompetitionId),
    queryFn: fetchUserBetsByMatchQuery,
    queryKey: userBetsByMatchQueryKey(activeCompetitionId, user?.id),
  })

  const bettedMatchIds = useMemo(() => {
    return bettedMatchIdsFromMap(query.data)
  }, [query.data])

  const refresh = useCallback(() => {
    queryClient.invalidateQueries({
      queryKey: userBetsByMatchQueryKey(activeCompetitionId, user?.id),
    })
  }, [activeCompetitionId, queryClient, user?.id])

  return { bettedMatchIds, refresh }
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
    bet_playoff_winner: p.playoff_winner,
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
  appQueryClient.invalidateQueries({ queryKey: betDistributionsRootQueryKey() })
  appQueryClient.invalidateQueries({ queryKey: matchesRootQueryKey() })
  appQueryClient.invalidateQueries({ queryKey: userBetsByMatchRootQueryKey() })
  appQueryClient.invalidateQueries({ queryKey: userBetsRootQueryKey() })
  appQueryClient.invalidateQueries({
    queryKey: userBetsByMatchQueryKey(competitionId, userId),
  })
  appQueryClient.invalidateQueries({
    queryKey: userBetsQueryKey(competitionId, userId),
  })

  return rows.length
}
