import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useAuth } from '../contexts/AuthContext'
import { useCompetition } from '../contexts/CompetitionContext'
import {
  allOpponentsQueryKey,
  betForUserQueryKey,
  betsForMatchQueryKey,
  betsRootQueryKey,
  matchesRootQueryKey,
  rankingsRootQueryKey,
  teamsRootQueryKey,
  userBetsRootQueryKey,
} from '../lib/queryKeys'
import { supabase } from '../lib/supabase'

function stringRecordValue(record, key: string): string | null {
  if (!record) {
    return null
  }

  const value = record[key]
  if (typeof value === 'string') {
    return value
  }

  return null
}

function payloadRecordValue(payload, key: string): string | null {
  const newValue = stringRecordValue(payload.new, key)
  if (newValue) {
    return newValue
  }

  return stringRecordValue(payload.old, key)
}

function invalidateMatchChange(queryClient): void {
  queryClient.invalidateQueries({ queryKey: matchesRootQueryKey() })
}

function invalidateTeamChange(queryClient): void {
  queryClient.invalidateQueries({ queryKey: teamsRootQueryKey() })
  queryClient.invalidateQueries({ queryKey: matchesRootQueryKey() })
  queryClient.invalidateQueries({ queryKey: rankingsRootQueryKey() })
}

function invalidateRankingChange(queryClient, competitionId: string): void {
  queryClient.invalidateQueries({ queryKey: rankingsRootQueryKey() })
  queryClient.invalidateQueries({
    queryKey: allOpponentsQueryKey(competitionId),
  })
}

function invalidateBetChange(queryClient, payload, userId: string | undefined) {
  const matchId = payloadRecordValue(payload, 'match_id')
  const betUserId = payloadRecordValue(payload, 'user_id')

  if (matchId) {
    queryClient.invalidateQueries({ queryKey: betsForMatchQueryKey(matchId) })
  } else {
    queryClient.invalidateQueries({ queryKey: betsRootQueryKey() })
  }

  queryClient.invalidateQueries({ queryKey: matchesRootQueryKey() })

  if (!userId || betUserId !== userId) {
    return
  }

  queryClient.invalidateQueries({ queryKey: userBetsRootQueryKey() })
  if (matchId) {
    queryClient.invalidateQueries({
      queryKey: betForUserQueryKey(matchId, userId),
    })
  }
}

function buildRealtimeFilter(competitionId: string): string {
  return `competition_id=eq.${competitionId}`
}

function createCriticalDataChannel(
  queryClient,
  competitionId: string,
  userId: string | undefined,
) {
  const competitionFilter = buildRealtimeFilter(competitionId)

  return supabase
    .channel(`critical-data-${competitionId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        filter: competitionFilter,
        schema: 'public',
        table: 'matches',
      },
      () => {
        invalidateMatchChange(queryClient)
      },
    )
    .on(
      'postgres_changes',
      {
        event: '*',
        filter: competitionFilter,
        schema: 'public',
        table: 'bets',
      },
      (payload) => {
        invalidateBetChange(queryClient, payload, userId)
      },
    )
    .on(
      'postgres_changes',
      {
        event: '*',
        filter: competitionFilter,
        schema: 'public',
        table: 'competition_profiles',
      },
      () => {
        invalidateRankingChange(queryClient, competitionId)
      },
    )
    .on(
      'postgres_changes',
      {
        event: '*',
        filter: competitionFilter,
        schema: 'public',
        table: 'teams',
      },
      () => {
        invalidateTeamChange(queryClient)
      },
    )
    .subscribe()
}

const DataRealtime = () => {
  const queryClient = useQueryClient()
  const { activeCompetitionId } = useCompetition()
  const { user } = useAuth()

  useEffect(() => {
    if (!activeCompetitionId) {
      return
    }

    const channel = createCriticalDataChannel(
      queryClient,
      activeCompetitionId,
      user?.id,
    )

    return () => {
      supabase.removeChannel(channel)
    }
  }, [activeCompetitionId, queryClient, user?.id])

  return null
}

export default DataRealtime
