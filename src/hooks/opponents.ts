import { keepPreviousData, useQuery } from '@tanstack/react-query'
import type { QueryFunctionContext } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import {
  mergeCpWithProfiles,
  mergeCpWithProfilesForUserIds,
} from '../lib/opponentMerge'
import { useCompetition } from '../contexts/CompetitionContext'
import { allOpponentsQueryKey, opponentsQueryKey } from '../lib/queryKeys'
import {
  queryKeyStringListValue,
  queryKeyStringValue,
} from '../lib/queryHelpers'

interface Opponent {
  id: string
  display_name: string | null
  avatar_url: string | null
  final_winner_points: number | null
  score: number | null
  winner_team: string | null
}

async function fetchOpponentsForUserIds(
  competitionId: string,
  userIds: string[],
): Promise<Opponent[]> {
  const [cpRes, prRes] = await Promise.all([
    supabase
      .from('competition_profiles')
      .select('user_id, final_winner_points, score, winner_team')
      .eq('competition_id', competitionId)
      .in('user_id', userIds),
    supabase
      .from('profiles')
      .select('id, display_name, avatar_url')
      .in('id', userIds),
  ])

  if (cpRes.error || prRes.error) {
    return []
  }

  return mergeCpWithProfilesForUserIds(
    userIds,
    cpRes.data ?? [],
    prRes.data ?? [],
  )
}

async function fetchOpponentsQuery(
  context: QueryFunctionContext,
): Promise<Opponent[]> {
  const competitionId = queryKeyStringValue(context.queryKey[2])
  const userIds = queryKeyStringListValue(context.queryKey[3])

  if (!competitionId || userIds.length === 0) {
    return []
  }

  return fetchOpponentsForUserIds(competitionId, userIds)
}

async function fetchAllOpponents(competitionId: string): Promise<Opponent[]> {
  const { data: cpRows, error: cpError } = await supabase
    .from('competition_profiles')
    .select('user_id, final_winner_points, score, winner_team')
    .eq('competition_id', competitionId)

  if (cpError) {
    return []
  }

  const rows = cpRows ?? []
  if (rows.length === 0) {
    return []
  }

  const ids = rows.map((r) => r.user_id)
  const { data: profileRows, error: prError } = await supabase
    .from('profiles')
    .select('id, display_name, avatar_url')
    .in('id', ids)

  if (prError) {
    return []
  }

  return mergeCpWithProfiles(rows, profileRows ?? [])
}

async function fetchAllOpponentsQuery(
  context: QueryFunctionContext,
): Promise<Opponent[]> {
  const competitionId = queryKeyStringValue(context.queryKey[2])

  if (!competitionId) {
    return []
  }

  return fetchAllOpponents(competitionId)
}

async function fetchOpponent(
  competitionId: string,
  userId: string,
): Promise<Opponent | null> {
  const [cpRes, prRes] = await Promise.all([
    supabase
      .from('competition_profiles')
      .select('user_id, final_winner_points, score, winner_team')
      .eq('competition_id', competitionId)
      .eq('user_id', userId)
      .maybeSingle(),
    supabase
      .from('profiles')
      .select('id, display_name, avatar_url')
      .eq('id', userId)
      .single(),
  ])

  if (cpRes.error || prRes.error) {
    return null
  }

  const p = prRes.data
  if (!p) {
    return null
  }

  const cp = cpRes.data
  return {
    id: userId,
    display_name: p.display_name ?? null,
    avatar_url: p.avatar_url ?? null,
    final_winner_points: cp?.final_winner_points ?? 0,
    score: cp?.score ?? 0,
    winner_team: cp?.winner_team ?? null,
  }
}

async function fetchOpponentQuery(
  context: QueryFunctionContext,
): Promise<Opponent | null> {
  const competitionId = queryKeyStringValue(context.queryKey[2])
  const userId = queryKeyStringValue(context.queryKey[3])

  if (!competitionId || !userId) {
    return null
  }

  return fetchOpponent(competitionId, userId)
}

export function useOpponents(userIds: string[] | undefined): Opponent[] {
  const { activeCompetitionId } = useCompetition()
  const query = useQuery({
    enabled: Boolean(userIds?.length && activeCompetitionId),
    placeholderData: keepPreviousData,
    queryFn: fetchOpponentsQuery,
    queryKey: opponentsQueryKey(activeCompetitionId, userIds),
    refetchInterval: 60 * 1000,
  })

  return query.data ?? []
}

export function useAllOpponents(): Opponent[] {
  const { activeCompetitionId } = useCompetition()
  const query = useQuery({
    enabled: Boolean(activeCompetitionId),
    placeholderData: keepPreviousData,
    queryFn: fetchAllOpponentsQuery,
    queryKey: allOpponentsQueryKey(activeCompetitionId),
    refetchInterval: 60 * 1000,
  })

  return query.data ?? []
}

export function useOpponent(userId: string | undefined): Opponent | null {
  const { activeCompetitionId } = useCompetition()
  const query = useQuery({
    enabled: Boolean(userId && activeCompetitionId),
    placeholderData: keepPreviousData,
    queryFn: fetchOpponentQuery,
    queryKey: ['rankings', 'user', activeCompetitionId ?? '', userId],
    refetchInterval: 60 * 1000,
  })

  return query.data ?? null
}
