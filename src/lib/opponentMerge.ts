export interface ProfileRow {
  id: string
  display_name: string | null
  avatar_url: string | null
}

export interface CpRow {
  user_id: string
  score: number | null
  winner_team: string | null
}

export interface OpponentMerged {
  id: string
  display_name: string | null
  avatar_url: string | null
  score: number | null
  winner_team: string | null
}

export function mergeCpWithProfilesForUserIds(
  userIds: string[],
  cpRows: CpRow[],
  profileRows: ProfileRow[],
): OpponentMerged[] {
  const cpByUser = new Map<string, CpRow>()
  for (const r of cpRows) {
    cpByUser.set(r.user_id, r)
  }
  const profileById = new Map<string, ProfileRow>()
  for (const p of profileRows) {
    profileById.set(p.id, p)
  }
  const result: OpponentMerged[] = []
  for (const uid of userIds) {
    const cp = cpByUser.get(uid)
    const p = profileById.get(uid)
    result.push({
      id: uid,
      display_name: p?.display_name ?? null,
      avatar_url: p?.avatar_url ?? null,
      score: cp?.score ?? 0,
      winner_team: cp?.winner_team ?? null,
    })
  }
  return result
}

export function mergeCpWithProfiles(cpRows: CpRow[], profileRows: ProfileRow[]): OpponentMerged[] {
  const profileById = new Map<string, ProfileRow>()
  for (const p of profileRows) {
    profileById.set(p.id, p)
  }
  const result: OpponentMerged[] = []
  for (const row of cpRows) {
    const p = profileById.get(row.user_id)
    result.push({
      id: row.user_id,
      display_name: p?.display_name ?? null,
      avatar_url: p?.avatar_url ?? null,
      score: row.score ?? 0,
      winner_team: row.winner_team ?? null,
    })
  }
  return result
}
