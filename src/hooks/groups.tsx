import { useCallback, useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { v4 as uuidv4 } from 'uuid'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import type { Tables } from '../lib/database.types'
import { captureEvent } from '../lib/posthog'

type GroupRow = Tables<'groups'>

export interface GroupWithMembers extends GroupRow {
  memberIds: string[]
  awaitingIds: string[]
}

export function useCreateGroup() {
  const { user } = useAuth()
  const [applyInGroup] = useApplyInGroup()

  return async (group: { name: string }) => {
    const joinKey = uuidv4().slice(0, 5).toUpperCase()
    const { error } = await supabase.from('groups').insert({
      ...group,
      created_by: user!.id,
      created_at: new Date().toISOString(),
      join_key: joinKey,
    })

    if (error) {
      captureEvent('group_create_failed', {
        name_length: group.name.length,
      })
      toast.error('Erreur lors de la création du groupe')
      return
    }

    await applyInGroup(joinKey)

    captureEvent('group_created', {
      name_length: group.name.length,
      join_key_length: joinKey.length,
    })
    toast.success(`Groupe ${group.name} créé avec le code ${joinKey}.`)
  }
}

export function useApplyInGroup(): [(joinKey: string) => Promise<void>] {
  const { user } = useAuth()

  const applyFn = useCallback(
    async (joinKey: string) => {
      const { data: groups } = await supabase
        .from('groups')
        .select('*')
        .eq('join_key', joinKey)

      if (!groups?.length) {
        captureEvent('group_join_code_not_found', {
          join_key_length: joinKey.length,
        })
        toast.error(`Aucune tribu avec le code ${joinKey} n'existe`)
        return
      }

      const group = groups[0]

      const { data: existing } = await supabase
        .from('group_members')
        .select('user_id')
        .eq('group_id', group.id)
        .eq('user_id', user!.id)
        .maybeSingle()

      if (existing) {
        captureEvent('group_join_duplicate', {
          group_id: group.id,
        })
        toast(`Vous appartenez déjà à la tribu ${group.name}`)
        return
      }

      const { error } = await supabase.from('group_apply').upsert({
        id: `${group.id}_${user!.id}`,
        user_id: user!.id,
        group_id: group.id,
      })

      if (error) {
        captureEvent('group_join_request_failed', {
          group_id: group.id,
        })
        toast.error("Erreur lors de l'inscription")
        return
      }

      captureEvent('group_join_requested', {
        group_id: group.id,
      })
      toast.success(`Inscription dans la tribu ${group.name} !`)
    },
    [user?.id],
  )

  return [applyFn]
}

function normalizeGroupsWithMembers(
  groupsWithMembers: Array<{
    id: string
    created_at: string | null
    created_by: string | null
    join_key: string | null
    name: string
    group_members: Array<{ user_id: string; status: string }>
  }>,
): GroupWithMembers[] {
  return groupsWithMembers.map((g) => {
    const { group_members, ...group } = g
    const membersList = group_members || []
    return {
      ...group,
      memberIds: membersList
        .filter((m) => m.status === 'member')
        .map((m) => m.user_id),
      awaitingIds: membersList
        .filter((m) => m.status === 'awaiting')
        .map((m) => m.user_id),
    }
  })
}

export function useGroupsForUserMember(): GroupWithMembers[] {
  const { user } = useAuth()
  const [groups, setGroups] = useState<GroupWithMembers[]>([])

  useEffect(() => {
    if (!user) return

    fetchGroupsForUser(user.id, 'member').then(setGroups)
  }, [user?.id])

  return groups
}

export function useGroupsForUser(): {
  groups: GroupWithMembers[]
  refetch: () => void
} {
  const { user } = useAuth()
  const [groups, setGroups] = useState<GroupWithMembers[]>([])
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    if (!user) return
    fetchGroupsForUser(user.id, null).then(setGroups)
  }, [user?.id, refreshKey])

  const refetch = useCallback(() => {
    setRefreshKey((k) => k + 1)
  }, [])

  return { groups, refetch }
}

async function fetchGroupsForUser(
  userId: string,
  status: 'member' | 'awaiting' | null,
): Promise<GroupWithMembers[]> {
  let query = supabase
    .from('group_members')
    .select('group_id')
    .eq('user_id', userId)

  if (status) {
    query = query.eq('status', status)
  }

  const { data: myMemberships, error } = await query

  if (error) {
    console.error('Error fetching group_members:', error)
  }

  console.log('MY MEMBERSHIPS:', myMemberships)

  if (!myMemberships || myMemberships.length === 0) return []

  const groupIds = myMemberships.map((m) => m.group_id)

  const { data: groupsWithMembers, error: groupsError } = await supabase
    .from('groups')
    .select(
      `
      *,
      group_members(user_id, status)
    `,
    )
    .in('id', groupIds)

  if (groupsError) {
    console.error('Error fetching groups with members:', groupsError)
  }

  console.log('GROUPS WITH MEMBERS:', groupsWithMembers)

  if (!groupsWithMembers) return []

  return normalizeGroupsWithMembers(groupsWithMembers)
}

export function useRenameGroup() {
  return useCallback(async (groupId: string, name: string) => {
    const { error } = await supabase
      .from('groups')
      .update({ name })
      .eq('id', groupId)

    if (error) {
      captureEvent('group_rename_failed', {
        group_id: groupId,
        name_length: name.length,
      })
      toast.error('Erreur lors du renommage de la tribu')
      return false
    }

    captureEvent('group_renamed', {
      group_id: groupId,
      name_length: name.length,
    })
    toast.success('Tribu renommée')
    return true
  }, [])
}

export function useValidApply(groupId: string, userId: string) {
  return useCallback(async () => {
    const { error } = await supabase.rpc('validate_group_apply', {
      p_group_id: groupId,
      p_user_id: userId,
    })

    if (error) {
      captureEvent('group_apply_validation_failed', {
        group_id: groupId,
      })
      toast.error(error.message)
      return
    }

    captureEvent('group_apply_validated', {
      group_id: groupId,
    })
    toast.success('Joueur validé')
  }, [groupId, userId])
}
