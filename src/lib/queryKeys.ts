export function matchesRootQueryKey(): string[] {
  return ['matches']
}

export function matchesListQueryKey(
  competitionId: string | null,
  refreshKey: number,
): Array<string | number> {
  return ['matches', 'list', competitionId ?? '', refreshKey]
}

export function matchDetailQueryKey(
  matchId: string | undefined,
): Array<string | undefined> {
  return ['matches', 'detail', matchId]
}

export function teamsRootQueryKey(): string[] {
  return ['teams']
}

export function teamsListQueryKey(
  competitionId: string | null,
  refreshKey: number,
): Array<string | number> {
  return ['teams', 'list', competitionId ?? '', refreshKey]
}

export function teamDetailQueryKey(
  teamId: string | null | undefined,
): Array<string | null | undefined> {
  return ['teams', 'detail', teamId]
}

export function betsRootQueryKey(): string[] {
  return ['bets']
}

export function betsForMatchQueryKey(
  matchId: string | undefined,
): Array<string | undefined> {
  return ['bets', 'match', matchId]
}

export function betForUserQueryKey(
  matchId: string | undefined,
  userId: string | undefined,
): Array<string | undefined> {
  return ['bets', 'user', matchId, userId]
}

export function userBetsRootQueryKey(): string[] {
  return ['bets', 'user-match-ids']
}

export function userBetsQueryKey(
  competitionId: string | null,
  userId: string | undefined,
): Array<string | undefined> {
  return ['bets', 'user-match-ids', competitionId ?? '', userId]
}

export function rankingsRootQueryKey(): string[] {
  return ['rankings']
}

export function allOpponentsQueryKey(
  competitionId: string | null,
): Array<string> {
  return ['rankings', 'all', competitionId ?? '']
}

export function opponentsQueryKey(
  competitionId: string | null,
  userIds: string[] | undefined,
): Array<string | string[] | undefined> {
  return ['rankings', 'group', competitionId ?? '', userIds]
}
