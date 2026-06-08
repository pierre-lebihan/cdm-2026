import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ChangeEvent,
} from 'react'
import toast from 'react-hot-toast'
import {
  AlertTriangle,
  Search,
  Trash2,
  UserRound,
  Users,
  X,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { useIsUserAdmin } from '../hooks/user'
import { useMatches, type NormalizedMatch } from '../hooks/matches'
import { useCompetition } from '../contexts/CompetitionContext'
import type { Tables } from '../lib/database.types'
import {
  getFinalWinnerEligibleTeams,
  useTeams,
  type NormalizedTeam,
} from '../hooks/teams'
import Avatar from 'components/Avatar'
import Flag from 'components/Flag'
import Loader from 'components/Loader'
import { formatTournamentPhaseLabel } from '../lib/matchEnums'

type AdminTab = 'scores' | 'winner' | 'eliminations' | 'groups' | 'users'
type AdminMatchFilter = 'all' | 'pending' | 'finished'
type AdminPlayoffWinner = 'A' | 'B' | null
type AdminGroupRow = Tables<'groups'>
type AdminGroupMemberRow = Tables<'group_members'>
type AdminProfileRow = Pick<
  Tables<'profiles'>,
  'avatar_url' | 'display_name' | 'email' | 'id'
>

type AdminGroupMember = AdminGroupMemberRow & {
  profile: AdminProfileRow | null
}

type AdminGroupWithMembers = AdminGroupRow & {
  creatorProfile: AdminProfileRow | null
  members: AdminGroupMember[]
}

type AdminGroupsState = {
  groups: AdminGroupWithMembers[]
  loading: boolean
  error: string | null
}

type AdminUserRow = Pick<
  Tables<'profiles'>,
  | 'avatar_url'
  | 'display_name'
  | 'email'
  | 'id'
  | 'last_connection'
  | 'nb_connections'
  | 'role'
>

type AdminUsersState = {
  users: AdminUserRow[]
  loading: boolean
  error: string | null
}

type AdminUserGroupMembership = {
  groupId: string
  groupName: string
  status: string
}

function incrementNumber(value: number): number {
  return value + 1
}

function createAdminGroupsLoadingState(): AdminGroupsState {
  return {
    groups: [],
    loading: true,
    error: null,
  }
}

function createAdminGroupsReadyState(
  groups: AdminGroupWithMembers[],
): AdminGroupsState {
  return {
    groups,
    loading: false,
    error: null,
  }
}

function createAdminGroupsErrorState(message: string): AdminGroupsState {
  return {
    groups: [],
    loading: false,
    error: message,
  }
}

function getUnknownErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message
  }

  return 'Erreur inconnue'
}

function addAdminProfileId(
  ids: string[],
  seenIds: Set<string>,
  id: string | null,
): void {
  if (!id) {
    return
  }

  if (seenIds.has(id)) {
    return
  }

  seenIds.add(id)
  ids.push(id)
}

function collectAdminProfileIds(
  groups: AdminGroupRow[],
  members: AdminGroupMemberRow[],
): string[] {
  const ids: string[] = []
  const seenIds = new Set<string>()

  for (let i = 0; i < groups.length; i += 1) {
    addAdminProfileId(ids, seenIds, groups[i].created_by)
  }

  for (let i = 0; i < members.length; i += 1) {
    addAdminProfileId(ids, seenIds, members[i].user_id)
  }

  return ids
}

function buildAdminProfileMap(
  profiles: AdminProfileRow[],
): Map<string, AdminProfileRow> {
  const profileMap = new Map<string, AdminProfileRow>()

  for (let i = 0; i < profiles.length; i += 1) {
    profileMap.set(profiles[i].id, profiles[i])
  }

  return profileMap
}

function findAdminProfile(
  profileMap: Map<string, AdminProfileRow>,
  id: string | null,
): AdminProfileRow | null {
  if (!id) {
    return null
  }

  return profileMap.get(id) ?? null
}

function getAdminMemberStatusRank(status: string): number {
  if (status === 'member') {
    return 0
  }

  if (status === 'awaiting') {
    return 1
  }

  return 2
}

function getAdminProfileLabel(
  profile: AdminProfileRow | null,
  fallbackId: string | null,
): string {
  if (profile?.display_name) {
    return profile.display_name
  }

  if (profile?.email) {
    return profile.email
  }

  if (fallbackId) {
    return fallbackId.slice(0, 8)
  }

  return 'Utilisateur inconnu'
}

function getAdminMemberSortLabel(member: AdminGroupMember): string {
  return getAdminProfileLabel(member.profile, member.user_id).toLocaleLowerCase(
    'fr-FR',
  )
}

function compareAdminGroupMembers(
  a: AdminGroupMember,
  b: AdminGroupMember,
): number {
  const rankDelta =
    getAdminMemberStatusRank(a.status) - getAdminMemberStatusRank(b.status)

  if (rankDelta !== 0) {
    return rankDelta
  }

  return getAdminMemberSortLabel(a).localeCompare(
    getAdminMemberSortLabel(b),
    'fr-FR',
  )
}

function sortAdminGroupMembers(
  members: AdminGroupMember[],
): AdminGroupMember[] {
  return [...members].sort(compareAdminGroupMembers)
}

function buildAdminGroupsWithMembers(
  groups: AdminGroupRow[],
  members: AdminGroupMemberRow[],
  profiles: AdminProfileRow[],
): AdminGroupWithMembers[] {
  const profileMap = buildAdminProfileMap(profiles)
  const membersByGroup = new Map<string, AdminGroupMember[]>()
  const groupsWithMembers: AdminGroupWithMembers[] = []

  for (let i = 0; i < members.length; i += 1) {
    const member = members[i]
    const enrichedMember: AdminGroupMember = {
      ...member,
      profile: findAdminProfile(profileMap, member.user_id),
    }
    const existingMembers = membersByGroup.get(member.group_id) ?? []
    existingMembers.push(enrichedMember)
    membersByGroup.set(member.group_id, existingMembers)
  }

  for (let i = 0; i < groups.length; i += 1) {
    const group = groups[i]
    const groupMembers = membersByGroup.get(group.id) ?? []
    groupsWithMembers.push({
      ...group,
      creatorProfile: findAdminProfile(profileMap, group.created_by),
      members: sortAdminGroupMembers(groupMembers),
    })
  }

  return groupsWithMembers
}

async function fetchAdminGroupProfiles(
  profileIds: string[],
): Promise<AdminProfileRow[]> {
  if (profileIds.length === 0) {
    return []
  }

  const { data, error } = await supabase
    .from('profiles')
    .select('id, display_name, email, avatar_url')
    .in('id', profileIds)

  if (error) {
    throw new Error(error.message)
  }

  return data ?? []
}

async function fetchAdminGroups(): Promise<AdminGroupWithMembers[]> {
  const { data: groups, error: groupsError } = await supabase
    .from('groups')
    .select('*')
    .order('name', { ascending: true })

  if (groupsError) {
    throw new Error(groupsError.message)
  }

  const { data: members, error: membersError } = await supabase
    .from('group_members')
    .select('*')

  if (membersError) {
    throw new Error(membersError.message)
  }

  const adminGroups: AdminGroupRow[] = groups ?? []
  const adminMembers: AdminGroupMemberRow[] = members ?? []
  const profileIds = collectAdminProfileIds(adminGroups, adminMembers)
  const profiles = await fetchAdminGroupProfiles(profileIds)

  return buildAdminGroupsWithMembers(adminGroups, adminMembers, profiles)
}

async function deleteAdminGroup(groupId: string): Promise<boolean> {
  const { error: applyError } = await supabase
    .from('group_apply')
    .delete()
    .eq('group_id', groupId)

  if (applyError) {
    toast.error(`Erreur: ${applyError.message}`)
    return false
  }

  const { error } = await supabase.from('groups').delete().eq('id', groupId)

  if (error) {
    toast.error(`Erreur: ${error.message}`)
    return false
  }

  toast.success('Tribu supprimée')
  return true
}

function normalizeAdminSearch(value: string): string {
  return value.trim().toLocaleLowerCase('fr-FR')
}

function adminProfileMatchesSearch(
  profile: AdminProfileRow | null,
  userId: string | null,
  search: string,
): boolean {
  const label = getAdminProfileLabel(profile, userId).toLocaleLowerCase('fr-FR')

  if (label.includes(search)) {
    return true
  }

  if (profile?.email?.toLocaleLowerCase('fr-FR').includes(search)) {
    return true
  }

  if (userId?.toLocaleLowerCase('fr-FR').includes(search)) {
    return true
  }

  return false
}

function adminGroupMatchesSearch(
  group: AdminGroupWithMembers,
  search: string,
): boolean {
  if (search === '') {
    return true
  }

  if (group.name.toLocaleLowerCase('fr-FR').includes(search)) {
    return true
  }

  if (group.join_key?.toLocaleLowerCase('fr-FR').includes(search)) {
    return true
  }

  if (
    adminProfileMatchesSearch(group.creatorProfile, group.created_by, search)
  ) {
    return true
  }

  for (let i = 0; i < group.members.length; i += 1) {
    const member = group.members[i]
    if (adminProfileMatchesSearch(member.profile, member.user_id, search)) {
      return true
    }
  }

  return false
}

function filterAdminGroups(
  groups: AdminGroupWithMembers[],
  searchValue: string,
): AdminGroupWithMembers[] {
  const search = normalizeAdminSearch(searchValue)
  const filteredGroups: AdminGroupWithMembers[] = []

  for (let i = 0; i < groups.length; i += 1) {
    if (adminGroupMatchesSearch(groups[i], search)) {
      filteredGroups.push(groups[i])
    }
  }

  return filteredGroups
}

function isAdminGroupMemberActive(member: AdminGroupMember): boolean {
  return member.status === 'member'
}

function isAdminGroupMemberAwaiting(member: AdminGroupMember): boolean {
  return member.status === 'awaiting'
}

function getAdminGroupActiveMembers(
  group: AdminGroupWithMembers,
): AdminGroupMember[] {
  return group.members.filter(isAdminGroupMemberActive)
}

function getAdminGroupAwaitingMembers(
  group: AdminGroupWithMembers,
): AdminGroupMember[] {
  return group.members.filter(isAdminGroupMemberAwaiting)
}

function getAdminGroupMemberCountLabel(count: number): string {
  if (count > 1) {
    return `${count} membres`
  }

  return `${count} membre`
}

function optionalString(value: string | null | undefined): string | undefined {
  if (!value) {
    return undefined
  }

  return value
}

function useAdminGroups(
  refreshKey: number,
  enabled: boolean,
): AdminGroupsState {
  const [state, setState] = useState<AdminGroupsState>(
    createAdminGroupsLoadingState,
  )

  useEffect(() => {
    if (!enabled) {
      setState(createAdminGroupsReadyState([]))
      return
    }

    let active = true
    setState(createAdminGroupsLoadingState())

    fetchAdminGroups()
      .then((groups) => {
        if (!active) {
          return
        }

        setState(createAdminGroupsReadyState(groups))
      })
      .catch((error: unknown) => {
        if (!active) {
          return
        }

        setState(createAdminGroupsErrorState(getUnknownErrorMessage(error)))
      })

    return () => {
      active = false
    }
  }, [refreshKey, enabled])

  return state
}

function createAdminUsersLoadingState(): AdminUsersState {
  return {
    users: [],
    loading: true,
    error: null,
  }
}

function createAdminUsersReadyState(users: AdminUserRow[]): AdminUsersState {
  return {
    users,
    loading: false,
    error: null,
  }
}

function createAdminUsersErrorState(message: string): AdminUsersState {
  return {
    users: [],
    loading: false,
    error: message,
  }
}

function getAdminUserLabel(user: AdminUserRow): string {
  return getAdminProfileLabel(user, user.id)
}

function getAdminUserSortLabel(user: AdminUserRow): string {
  return getAdminUserLabel(user).toLocaleLowerCase('fr-FR')
}

function compareAdminUsers(a: AdminUserRow, b: AdminUserRow): number {
  return getAdminUserSortLabel(a).localeCompare(
    getAdminUserSortLabel(b),
    'fr-FR',
  )
}

function sortAdminUsers(users: AdminUserRow[]): AdminUserRow[] {
  return [...users].sort(compareAdminUsers)
}

async function fetchAdminUsers(): Promise<AdminUserRow[]> {
  const { data, error } = await supabase
    .from('profiles')
    .select(
      'id, display_name, email, avatar_url, role, nb_connections, last_connection',
    )

  if (error) {
    throw new Error(error.message)
  }

  const users: AdminUserRow[] = data ?? []
  return sortAdminUsers(users)
}

async function deleteAdminUser(userId: string): Promise<boolean> {
  const { error } = await supabase.rpc('admin_delete_user', {
    p_user_id: userId,
  })

  if (error) {
    toast.error(`Erreur: ${error.message}`)
    return false
  }

  toast.success('Utilisateur supprimé')
  return true
}

function getAdminUserGroupMemberships(
  userId: string,
  groups: AdminGroupWithMembers[],
): AdminUserGroupMembership[] {
  const memberships: AdminUserGroupMembership[] = []

  for (let i = 0; i < groups.length; i += 1) {
    const group = groups[i]

    for (let j = 0; j < group.members.length; j += 1) {
      const member = group.members[j]
      if (member.user_id === userId) {
        memberships.push({
          groupId: group.id,
          groupName: group.name,
          status: member.status,
        })
      }
    }
  }

  return memberships
}

function adminUserMembershipsMatchSearch(
  memberships: AdminUserGroupMembership[],
  search: string,
): boolean {
  for (let i = 0; i < memberships.length; i += 1) {
    const membership = memberships[i]
    if (membership.groupName.toLocaleLowerCase('fr-FR').includes(search)) {
      return true
    }
  }

  return false
}

function adminUserMatchesSearch(
  user: AdminUserRow,
  memberships: AdminUserGroupMembership[],
  search: string,
): boolean {
  if (search === '') {
    return true
  }

  if (adminProfileMatchesSearch(user, user.id, search)) {
    return true
  }

  if (user.role?.toLocaleLowerCase('fr-FR').includes(search)) {
    return true
  }

  return adminUserMembershipsMatchSearch(memberships, search)
}

function filterAdminUsers(
  users: AdminUserRow[],
  groups: AdminGroupWithMembers[],
  searchValue: string,
): AdminUserRow[] {
  const search = normalizeAdminSearch(searchValue)
  const filteredUsers: AdminUserRow[] = []

  for (let i = 0; i < users.length; i += 1) {
    const user = users[i]
    const memberships = getAdminUserGroupMemberships(user.id, groups)

    if (adminUserMatchesSearch(user, memberships, search)) {
      filteredUsers.push(user)
    }
  }

  return filteredUsers
}

function getAdminUserRoleLabel(role: string | null): string {
  if (role === 'admin') {
    return 'Admin'
  }

  return 'Joueur'
}

function getAdminUserRoleClasses(role: string | null): string {
  if (role === 'admin') {
    return 'bg-red-50 text-red-600'
  }

  return 'bg-blue-50 text-blue-700'
}

function getAdminUserGroupCountLabel(count: number): string {
  if (count > 1) {
    return `${count} tribus`
  }

  return `${count} tribu`
}

function getAdminMembershipStatusLabel(status: string): string {
  if (status === 'member') {
    return 'Membre'
  }

  if (status === 'awaiting') {
    return 'En attente'
  }

  return status
}

function getAdminMembershipStatusClasses(status: string): string {
  if (status === 'member') {
    return 'bg-green-50 text-green-700'
  }

  if (status === 'awaiting') {
    return 'bg-amber-50 text-amber-700'
  }

  return 'bg-gray-100 text-gray-500'
}

function formatAdminLastConnection(value: string | null): string {
  if (!value) {
    return 'Jamais connecté'
  }

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return 'Date inconnue'
  }

  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date)
}

function useAdminUsers(refreshKey: number, enabled: boolean): AdminUsersState {
  const [state, setState] = useState<AdminUsersState>(
    createAdminUsersLoadingState,
  )

  useEffect(() => {
    if (!enabled) {
      setState(createAdminUsersReadyState([]))
      return
    }

    let active = true
    setState(createAdminUsersLoadingState())

    fetchAdminUsers()
      .then((users) => {
        if (!active) {
          return
        }

        setState(createAdminUsersReadyState(users))
      })
      .catch((error: unknown) => {
        if (!active) {
          return
        }

        setState(createAdminUsersErrorState(getUnknownErrorMessage(error)))
      })

    return () => {
      active = false
    }
  }, [refreshKey, enabled])

  return state
}

type MatchScoreEdit = {
  scoreA: string
  scoreB: string
  playoffWinner: string
}

function normalizeAdminPlayoffWinner(value: string): AdminPlayoffWinner {
  if (value === 'A') {
    return 'A'
  }

  if (value === 'B') {
    return 'B'
  }

  return null
}

function scoreEditNeedsPlayoffWinner(
  match: NormalizedMatch,
  scores: MatchScoreEdit,
): boolean {
  if (match.betFormat !== 'knockout_decider') {
    return false
  }

  if (scores.scoreA === '' || scores.scoreB === '') {
    return false
  }

  return scores.scoreA === scores.scoreB
}

function getAdminMatchWinnerLabel(
  match: NormalizedMatch,
  winner: string,
): string {
  if (winner === 'A') {
    return match.teamAName ?? 'Équipe A'
  }

  if (winner === 'B') {
    return match.teamBName ?? 'Équipe B'
  }

  return 'À sélectionner'
}

function formatAdminPoints(points: number | null | undefined): string {
  if (points === null || points === undefined) {
    return '0'
  }

  return new Intl.NumberFormat('fr-FR', {
    maximumFractionDigits: 0,
  }).format(Math.round(points / 10) * 10)
}

function isFinalWinnerTeam(
  team: NormalizedTeam,
  finalWinnerTeam: string | null | undefined,
): boolean {
  if (!finalWinnerTeam) {
    return false
  }

  return team.id === finalWinnerTeam
}

function jsonNumberField(value: unknown, key: string): number {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) {
    return 0
  }

  const entries = Object.entries(value)
  for (let i = 0; i < entries.length; i += 1) {
    const entry = entries[i]
    if (entry[0] === key && typeof entry[1] === 'number') {
      return entry[1]
    }
  }

  return 0
}

function getAdminMatchTimestamp(match: NormalizedMatch): number {
  if (!match.dateTime) {
    return 0
  }

  return match.dateTime.seconds
}

function compareAdminMatchesNewestFirst(
  a: NormalizedMatch,
  b: NormalizedMatch,
): number {
  return getAdminMatchTimestamp(b) - getAdminMatchTimestamp(a)
}

function sortAdminFilteredMatches(
  matches: NormalizedMatch[],
  filter: AdminMatchFilter,
): NormalizedMatch[] {
  if (filter !== 'finished') {
    return matches
  }

  return [...matches].sort(compareAdminMatchesNewestFirst)
}

function AdminMatchRow({
  match,
  onSave,
  onClear,
  onVisibilityChange,
}: {
  match: NormalizedMatch
  onSave: (
    matchId: string,
    scoreA: number,
    scoreB: number,
    playoffWinner: AdminPlayoffWinner,
  ) => Promise<void>
  onClear: (matchId: string) => Promise<void>
  onVisibilityChange: (matchId: string, visible: boolean) => Promise<void>
}) {
  const [scores, setScores] = useState<MatchScoreEdit>({
    scoreA: match.scores.A?.toString() ?? '',
    scoreB: match.scores.B?.toString() ?? '',
    playoffWinner: match.playoffWinner ?? '',
  })
  const [saving, setSaving] = useState(false)
  const [clearing, setClearing] = useState(false)
  const [visibilityBusy, setVisibilityBusy] = useState(false)

  const hasScore = match.scores.A !== null && match.scores.B !== null

  const hasChanges =
    scores.scoreA !== (match.scores.A?.toString() ?? '') ||
    scores.scoreB !== (match.scores.B?.toString() ?? '') ||
    scores.playoffWinner !== (match.playoffWinner ?? '')

  const needsPlayoffWinner = scoreEditNeedsPlayoffWinner(match, scores)
  const isValid =
    scores.scoreA !== '' &&
    scores.scoreB !== '' &&
    (!needsPlayoffWinner || scores.playoffWinner !== '')

  useEffect(() => {
    setScores({
      scoreA: match.scores.A?.toString() ?? '',
      scoreB: match.scores.B?.toString() ?? '',
      playoffWinner: match.playoffWinner ?? '',
    })
  }, [match.scores.A, match.scores.B, match.playoffWinner])

  const handleSave = useCallback(async () => {
    if (!isValid || !hasChanges) return
    setSaving(true)
    const playoffWinner = needsPlayoffWinner
      ? normalizeAdminPlayoffWinner(scores.playoffWinner)
      : null
    await onSave(
      match.id,
      parseInt(scores.scoreA),
      parseInt(scores.scoreB),
      playoffWinner,
    )
    setSaving(false)
  }, [match.id, scores, isValid, hasChanges, needsPlayoffWinner, onSave])

  const handleClear = useCallback(async () => {
    setClearing(true)
    await onClear(match.id)
    setClearing(false)
  }, [match.id, onClear])

  const handleVisibilityClick = useCallback(async () => {
    setVisibilityBusy(true)
    await onVisibilityChange(match.id, !match.visibleToUsers)
    setVisibilityBusy(false)
  }, [match.id, match.visibleToUsers, onVisibilityChange])

  return (
    <div
      className={`bg-white rounded-xl p-3 shadow-card flex flex-col gap-2 ${match.finished ? 'opacity-60' : ''}`}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Flag
            country={match.teamACode ?? ''}
            style={{ width: 24, height: 24 }}
          />
          <span className="text-sm font-medium text-navy">
            {match.teamAName ?? match.teamA}
          </span>
        </div>
        <span className="text-xs text-gray-400">vs</span>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-navy">
            {match.teamBName ?? match.teamB}
          </span>
          <Flag
            country={match.teamBCode ?? ''}
            style={{ width: 24, height: 24 }}
          />
        </div>
      </div>

      <div className="flex items-center justify-between gap-2 flex-wrap">
        <span className="text-xs text-gray-400">
          {formatPhaseAdmin(match)} — {match.groupName ?? ''}
        </span>
        <div className="flex items-center gap-2">
          {!match.visibleToUsers && (
            <span className="text-[0.65rem] font-semibold py-0.5 px-2 rounded-full bg-amber-100 text-amber-900">
              Masqué (joueurs)
            </span>
          )}
          {match.finished && (
            <span className="text-[0.65rem] font-semibold py-0.5 px-2 rounded-full bg-green-100 text-green-800">
              Terminé
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center">
        <button
          type="button"
          className={`text-xs font-semibold py-1.5 px-3 rounded-full border-none cursor-pointer transition-colors ${
            match.visibleToUsers
              ? 'bg-gray-100 text-navy hover:bg-gray-200'
              : 'bg-amber-200 text-amber-900 hover:bg-amber-300'
          }`}
          disabled={visibilityBusy}
          onClick={handleVisibilityClick}
        >
          {visibilityBusy
            ? '...'
            : match.visibleToUsers
              ? 'Masquer'
              : 'Rendre visible'}
        </button>
      </div>

      <div className="flex items-center gap-2">
        <input
          type="number"
          min="0"
          className="w-12 h-10 rounded-lg border-[1.5px] border-gray-200 text-center text-lg font-bold text-navy bg-gray-50 outline-none focus:border-indigo-500"
          value={scores.scoreA}
          onChange={(e) => setScores({ ...scores, scoreA: e.target.value })}
          placeholder="—"
        />
        <span className="text-gray-400">–</span>
        <input
          type="number"
          min="0"
          className="w-12 h-10 rounded-lg border-[1.5px] border-gray-200 text-center text-lg font-bold text-navy bg-gray-50 outline-none focus:border-indigo-500"
          value={scores.scoreB}
          onChange={(e) => setScores({ ...scores, scoreB: e.target.value })}
          placeholder="—"
        />
      </div>

      {needsPlayoffWinner && (
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-gray-500">
            Vainqueur après prolongations / tirs au but
          </label>
          <select
            className="w-full py-2 px-3 border border-gray-200 rounded-lg text-sm bg-white outline-none focus:border-indigo-500"
            value={scores.playoffWinner}
            onChange={(e) =>
              setScores({ ...scores, playoffWinner: e.target.value })
            }
          >
            <option value="">À sélectionner</option>
            <option value="A">{getAdminMatchWinnerLabel(match, 'A')}</option>
            <option value="B">{getAdminMatchWinnerLabel(match, 'B')}</option>
          </select>
        </div>
      )}

      <div className="flex items-center gap-2">
        <button
          className={`ml-auto text-xs font-semibold py-1.5 px-3 rounded-full border-none cursor-pointer transition-all ${
            hasChanges && isValid
              ? 'bg-navy text-white hover:bg-navy-light'
              : 'bg-gray-100 text-gray-400'
          }`}
          disabled={!hasChanges || !isValid || saving}
          onClick={handleSave}
        >
          {saving ? '...' : 'Sauver'}
        </button>

        {hasScore && (
          <button
            className="text-xs font-semibold py-1.5 px-3 rounded-full border border-red-200 text-red-500 bg-white cursor-pointer hover:bg-red-50 transition-colors"
            disabled={clearing}
            onClick={handleClear}
          >
            {clearing ? '...' : 'Vider'}
          </button>
        )}
      </div>
    </div>
  )
}

function formatPhaseAdmin(match: NormalizedMatch): string {
  const phaseLabel = formatTournamentPhaseLabel(match.tournamentPhase)
  const betLabel =
    match.betFormat === 'regulation_1x2'
      ? 'Pari 1 / N / 2 (90 min)'
      : 'Pari avec vainqueur si nul'
  return `${phaseLabel} · ${betLabel}`
}

function AdminTeamEliminationRow({
  team,
  finalWinnerTeam,
  onToggle,
}: {
  team: NormalizedTeam
  finalWinnerTeam: string | null | undefined
  onToggle: (team: NormalizedTeam, eliminated: boolean) => Promise<void>
}) {
  const isFinalWinner = isFinalWinnerTeam(team, finalWinnerTeam)
  const isEliminated = team.elimination === true && !isFinalWinner

  return (
    <div className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
      <Flag
        country={team.code}
        className={`h-8 w-8 rounded object-contain ${
          isEliminated ? 'opacity-40 grayscale' : ''
        }`}
      />
      <div className="min-w-0 flex-1">
        <p className="m-0 text-sm font-bold text-navy">{team.name}</p>
        <p className="m-0 text-xs text-gray-500">
          {isFinalWinner
            ? 'Vainqueur officiel'
            : isEliminated
              ? 'Éliminée'
              : 'Encore en course'}
        </p>
      </div>
      <button
        type="button"
        className={`text-xs font-semibold py-1.5 px-3 rounded-full border transition-colors ${
          isFinalWinner
            ? 'border-gray-200 text-gray-400 bg-gray-100 cursor-not-allowed'
            : isEliminated
              ? 'border-emerald-200 text-emerald-700 bg-emerald-50 hover:bg-emerald-100'
              : 'border-red-200 text-red-500 bg-white hover:bg-red-50'
        }`}
        disabled={isFinalWinner}
        onClick={() => onToggle(team, !isEliminated)}
      >
        {isFinalWinner ? 'Protégée' : isEliminated ? 'Remettre' : 'Éliminer'}
      </button>
    </div>
  )
}

function AdminGroupMemberPill({ member }: { member: AdminGroupMember }) {
  const displayName = getAdminProfileLabel(member.profile, member.user_id)
  const email = member.profile?.email ?? ''

  return (
    <div className="min-w-0 flex items-center gap-2 rounded-lg bg-gray-50 px-2.5 py-2">
      <div className="min-w-0 [&_span]:truncate">
        <Avatar
          avatarUrl={optionalString(member.profile?.avatar_url)}
          displayName={displayName}
          size={26}
        />
      </div>
      {email && (
        <span className="hidden sm:inline min-w-0 truncate text-[0.68rem] text-gray-400">
          {email}
        </span>
      )}
    </div>
  )
}

function AdminGroupDeleteButton({
  group,
  onDelete,
}: {
  group: AdminGroupWithMembers
  onDelete: (groupId: string) => Promise<boolean>
}) {
  const [confirming, setConfirming] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const memberCount = getAdminGroupActiveMembers(group).length

  const handleOpen = useCallback(() => {
    if (deleting) {
      return
    }

    setConfirming(true)
  }, [deleting])

  const handleCancel = useCallback(() => {
    if (deleting) {
      return
    }

    setConfirming(false)
  }, [deleting])

  const handleConfirm = useCallback(async () => {
    if (deleting) {
      return
    }

    setDeleting(true)
    const deleted = await onDelete(group.id)
    setDeleting(false)

    if (deleted) {
      setConfirming(false)
    }
  }, [deleting, group.id, onDelete])

  return (
    <div className="relative">
      <button
        type="button"
        className="flex h-9 w-9 items-center justify-center rounded-lg border border-red-100 bg-white text-red-500 transition-colors hover:bg-red-50 disabled:cursor-wait disabled:opacity-50"
        disabled={deleting}
        onClick={handleOpen}
        title="Supprimer la tribu"
      >
        <Trash2 size={16} />
      </button>

      {confirming && (
        <div className="absolute right-0 top-full z-20 mt-2 w-64 rounded-lg border border-red-100 bg-white p-3 text-left shadow-card">
          <div className="absolute -top-1.5 right-3 h-3 w-3 rotate-45 border-l border-t border-red-100 bg-white" />
          <div className="mb-3 pr-6">
            <p className="m-0 text-xs font-bold text-navy">
              Supprimer {group.name} ?
            </p>
            <p className="m-0 mt-1 text-[0.7rem] leading-snug text-gray-500">
              {getAdminGroupMemberCountLabel(memberCount)} seront retirés de
              cette tribu.
            </p>
          </div>
          <button
            type="button"
            className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-md text-gray-400 hover:bg-gray-100 hover:text-navy"
            disabled={deleting}
            onClick={handleCancel}
            title="Annuler"
          >
            <X size={14} />
          </button>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              className="rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-500 hover:bg-gray-50"
              disabled={deleting}
              onClick={handleCancel}
            >
              Annuler
            </button>
            <button
              type="button"
              className="rounded-full border-none bg-red-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-600 disabled:cursor-wait disabled:bg-gray-200 disabled:text-gray-400"
              disabled={deleting}
              onClick={handleConfirm}
            >
              {deleting ? 'Suppression...' : 'Supprimer'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function AdminGroupCard({
  group,
  onDelete,
}: {
  group: AdminGroupWithMembers
  onDelete: (groupId: string) => Promise<boolean>
}) {
  const activeMembers = getAdminGroupActiveMembers(group)
  const awaitingMembers = getAdminGroupAwaitingMembers(group)
  const creatorName = getAdminProfileLabel(
    group.creatorProfile,
    group.created_by,
  )

  return (
    <div className="rounded-xl bg-white p-4 shadow-card">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="m-0 truncate text-base font-bold text-navy">
            {group.name}
          </h3>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-[0.7rem] text-gray-500">
            <span className="inline-flex items-center gap-1">
              <Users size={13} />
              {getAdminGroupMemberCountLabel(activeMembers.length)}
            </span>
            <span className="inline-flex min-w-0 items-center gap-1">
              <UserRound size={13} />
              <span className="truncate">Créée par {creatorName}</span>
            </span>
            {group.join_key && (
              <span className="rounded-md bg-indigo-50 px-2 py-0.5 font-mono text-indigo-600">
                {group.join_key}
              </span>
            )}
          </div>
        </div>
        <AdminGroupDeleteButton group={group} onDelete={onDelete} />
      </div>

      <div className="mt-4">
        <p className="m-0 mb-2 text-xs font-bold text-navy">Membres</p>
        {activeMembers.length > 0 ? (
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {activeMembers.map((member) => (
              <AdminGroupMemberPill
                key={`${member.group_id}_${member.user_id}`}
                member={member}
              />
            ))}
          </div>
        ) : (
          <p className="m-0 rounded-lg bg-gray-50 px-3 py-2 text-xs text-gray-400">
            Aucun membre validé
          </p>
        )}
      </div>

      {awaitingMembers.length > 0 && (
        <div className="mt-4">
          <p className="m-0 mb-2 text-xs font-bold text-amber-700">
            En attente
          </p>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {awaitingMembers.map((member) => (
              <AdminGroupMemberPill
                key={`${member.group_id}_${member.user_id}`}
                member={member}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function AdminGroupsPanel({
  state,
  search,
  filteredGroups,
  onSearchChange,
  onDelete,
}: {
  state: AdminGroupsState
  search: string
  filteredGroups: AdminGroupWithMembers[]
  onSearchChange: (value: string) => void
  onDelete: (groupId: string) => Promise<boolean>
}) {
  const handleSearchChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      onSearchChange(event.target.value)
    },
    [onSearchChange],
  )

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-xl bg-white p-4 shadow-card">
        <div className="relative">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2.5 pl-9 pr-3 text-sm text-navy outline-none transition-colors placeholder:text-gray-400 focus:border-indigo-500"
            value={search}
            onChange={handleSearchChange}
            placeholder="Chercher une tribu, un joueur, un email ou un code"
          />
        </div>
        <p className="m-0 mt-3 text-xs text-gray-500">
          {filteredGroups.length} / {state.groups.length} tribus affichées
        </p>
      </div>

      {state.loading && (
        <div className="rounded-xl bg-white p-6 text-center text-sm text-gray-400 shadow-card">
          Chargement des tribus...
        </div>
      )}

      {!state.loading && state.error && (
        <div className="rounded-xl border border-red-100 bg-white p-4 text-sm text-red-500 shadow-card">
          {state.error}
        </div>
      )}

      {!state.loading && !state.error && filteredGroups.length === 0 && (
        <div className="rounded-xl bg-white p-6 text-center text-sm text-gray-400 shadow-card">
          Aucune tribu trouvée.
        </div>
      )}

      {!state.loading &&
        !state.error &&
        filteredGroups.map((group) => (
          <AdminGroupCard key={group.id} group={group} onDelete={onDelete} />
        ))}
    </div>
  )
}

function AdminUserGroupChip({
  membership,
}: {
  membership: AdminUserGroupMembership
}) {
  return (
    <span
      className={`inline-flex min-w-0 items-center gap-1 rounded-full px-2 py-1 text-[0.68rem] font-semibold ${getAdminMembershipStatusClasses(
        membership.status,
      )}`}
      title={getAdminMembershipStatusLabel(membership.status)}
    >
      <span className="truncate">{membership.groupName}</span>
    </span>
  )
}

function AdminUserDeleteButton({
  adminUser,
  currentUserId,
  memberships,
  onDelete,
}: {
  adminUser: AdminUserRow
  currentUserId: string | null
  memberships: AdminUserGroupMembership[]
  onDelete: (userId: string) => Promise<boolean>
}) {
  const [confirming, setConfirming] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const isCurrentUser = adminUser.id === currentUserId
  const disabled = deleting || isCurrentUser

  const handleOpen = useCallback(() => {
    if (disabled) {
      return
    }

    setConfirming(true)
  }, [disabled])

  const handleCancel = useCallback(() => {
    if (deleting) {
      return
    }

    setConfirming(false)
  }, [deleting])

  const handleConfirm = useCallback(async () => {
    if (disabled) {
      return
    }

    setDeleting(true)
    const deleted = await onDelete(adminUser.id)
    setDeleting(false)

    if (deleted) {
      setConfirming(false)
    }
  }, [adminUser.id, disabled, onDelete])

  return (
    <div className="relative">
      <button
        type="button"
        className="flex h-9 w-9 items-center justify-center rounded-lg border border-red-100 bg-white text-red-500 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40"
        disabled={disabled}
        onClick={handleOpen}
        title={
          isCurrentUser
            ? 'Impossible de supprimer votre propre compte'
            : 'Supprimer l’utilisateur'
        }
      >
        <Trash2 size={16} />
      </button>

      {confirming && (
        <div className="absolute right-0 top-full z-20 mt-2 w-72 rounded-lg border border-red-100 bg-white p-3 text-left shadow-card">
          <div className="absolute -top-1.5 right-3 h-3 w-3 rotate-45 border-l border-t border-red-100 bg-white" />
          <div className="mb-3 flex gap-2 pr-6">
            <AlertTriangle className="mt-0.5 shrink-0 text-red-500" size={16} />
            <div className="min-w-0">
              <p className="m-0 text-xs font-bold text-navy">
                Supprimer {getAdminUserLabel(adminUser)} ?
              </p>
              <p className="m-0 mt-1 text-[0.7rem] leading-snug text-gray-500">
                Cette action supprime son compte, son profil, ses pronos, son
                score et ses appartenances à{' '}
                {getAdminUserGroupCountLabel(memberships.length)}.
              </p>
            </div>
          </div>
          <button
            type="button"
            className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-md text-gray-400 hover:bg-gray-100 hover:text-navy"
            disabled={deleting}
            onClick={handleCancel}
            title="Annuler"
          >
            <X size={14} />
          </button>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              className="rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-500 hover:bg-gray-50"
              disabled={deleting}
              onClick={handleCancel}
            >
              Annuler
            </button>
            <button
              type="button"
              className="rounded-full border-none bg-red-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-600 disabled:cursor-wait disabled:bg-gray-200 disabled:text-gray-400"
              disabled={deleting}
              onClick={handleConfirm}
            >
              {deleting ? 'Suppression...' : 'Supprimer'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function AdminUserCard({
  adminUser,
  currentUserId,
  memberships,
  onDelete,
}: {
  adminUser: AdminUserRow
  currentUserId: string | null
  memberships: AdminUserGroupMembership[]
  onDelete: (userId: string) => Promise<boolean>
}) {
  const displayName = getAdminUserLabel(adminUser)
  const email = adminUser.email ?? ''

  return (
    <div className="rounded-xl bg-white p-4 shadow-card">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="min-w-0 [&_span]:truncate">
            <Avatar
              avatarUrl={optionalString(adminUser.avatar_url)}
              displayName={displayName}
              size={34}
            />
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span
              className={`rounded-full px-2 py-0.5 text-[0.68rem] font-bold ${getAdminUserRoleClasses(
                adminUser.role,
              )}`}
            >
              {getAdminUserRoleLabel(adminUser.role)}
            </span>
            <span className="text-[0.7rem] text-gray-500">
              {adminUser.nb_connections ?? 0} connexions
            </span>
            <span className="text-[0.7rem] text-gray-400">
              Dernière : {formatAdminLastConnection(adminUser.last_connection)}
            </span>
          </div>
          {email && (
            <p className="m-0 mt-1 truncate text-xs text-gray-500">{email}</p>
          )}
        </div>

        <AdminUserDeleteButton
          adminUser={adminUser}
          currentUserId={currentUserId}
          memberships={memberships}
          onDelete={onDelete}
        />
      </div>

      <div className="mt-4">
        <p className="m-0 mb-2 text-xs font-bold text-navy">Tribus</p>
        {memberships.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {memberships.map((membership) => (
              <AdminUserGroupChip
                key={`${membership.groupId}_${membership.status}`}
                membership={membership}
              />
            ))}
          </div>
        ) : (
          <p className="m-0 rounded-lg bg-gray-50 px-3 py-2 text-xs text-gray-400">
            Aucune tribu
          </p>
        )}
      </div>
    </div>
  )
}

function AdminUsersPanel({
  state,
  groups,
  search,
  filteredUsers,
  currentUserId,
  onSearchChange,
  onDelete,
}: {
  state: AdminUsersState
  groups: AdminGroupWithMembers[]
  search: string
  filteredUsers: AdminUserRow[]
  currentUserId: string | null
  onSearchChange: (value: string) => void
  onDelete: (userId: string) => Promise<boolean>
}) {
  const handleSearchChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      onSearchChange(event.target.value)
    },
    [onSearchChange],
  )

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-xl bg-white p-4 shadow-card">
        <div className="relative">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2.5 pl-9 pr-3 text-sm text-navy outline-none transition-colors placeholder:text-gray-400 focus:border-indigo-500"
            value={search}
            onChange={handleSearchChange}
            placeholder="Chercher un joueur, un email, une tribu ou un rôle"
          />
        </div>
        <p className="m-0 mt-3 text-xs text-gray-500">
          {filteredUsers.length} / {state.users.length} utilisateurs affichés
        </p>
      </div>

      {state.loading && (
        <div className="rounded-xl bg-white p-6 text-center text-sm text-gray-400 shadow-card">
          Chargement des utilisateurs...
        </div>
      )}

      {!state.loading && state.error && (
        <div className="rounded-xl border border-red-100 bg-white p-4 text-sm text-red-500 shadow-card">
          {state.error}
        </div>
      )}

      {!state.loading && !state.error && filteredUsers.length === 0 && (
        <div className="rounded-xl bg-white p-6 text-center text-sm text-gray-400 shadow-card">
          Aucun utilisateur trouvé.
        </div>
      )}

      {!state.loading &&
        !state.error &&
        filteredUsers.map((adminUser) => (
          <AdminUserCard
            key={adminUser.id}
            adminUser={adminUser}
            currentUserId={currentUserId}
            memberships={getAdminUserGroupMemberships(adminUser.id, groups)}
            onDelete={onDelete}
          />
        ))}
    </div>
  )
}

const Admin = () => {
  const { user, profile, loading: authLoading } = useAuth()
  const isAdmin = useIsUserAdmin()
  const navigate = useNavigate()
  const [matchesRefreshKey, setMatchesRefreshKey] = useState(0)
  const [teamsRefreshKey, setTeamsRefreshKey] = useState(0)
  const [groupsRefreshKey, setGroupsRefreshKey] = useState(0)
  const [usersRefreshKey, setUsersRefreshKey] = useState(0)
  const matches = useMatches(matchesRefreshKey)
  const teams = useTeams(teamsRefreshKey)
  const adminGroupsState = useAdminGroups(groupsRefreshKey, isAdmin)
  const adminUsersState = useAdminUsers(usersRefreshKey, isAdmin)
  const {
    competitions,
    activeCompetitionId,
    setActiveCompetitionId,
    competition: publicCompetition,
    setPublicCompetition,
    refreshCompetitions,
  } = useCompetition()
  const activeCompetition = useMemo(() => {
    return competitions.find((competition) => {
      return competition.id === activeCompetitionId
    })
  }, [competitions, activeCompetitionId])
  const [adminTab, setAdminTab] = useState<AdminTab>('scores')
  const [finalWinnerTeam, setFinalWinnerTeam] = useState('')
  const [savingFinalWinner, setSavingFinalWinner] = useState(false)
  const [filter, setFilter] = useState<AdminMatchFilter>('pending')
  const [groupSearch, setGroupSearch] = useState('')
  const [userSearch, setUserSearch] = useState('')
  const [recalculating, setRecalculating] = useState(false)
  const [refreshingOdds, setRefreshingOdds] = useState(false)

  useEffect(() => {
    if (authLoading) return
    if (!user) {
      navigate('/')
      return
    }
    if (profile === null) return
    if (!isAdmin) {
      navigate('/')
    }
  }, [authLoading, user, profile, isAdmin, navigate])

  const bumpMatchesList = useCallback(() => {
    setMatchesRefreshKey((k) => k + 1)
  }, [])

  const bumpTeamsList = useCallback(() => {
    setTeamsRefreshKey((k) => k + 1)
  }, [])

  const bumpGroupsList = useCallback(() => {
    setGroupsRefreshKey(incrementNumber)
  }, [])

  const bumpUsersList = useCallback(() => {
    setUsersRefreshKey(incrementNumber)
  }, [])

  useEffect(() => {
    setFinalWinnerTeam(activeCompetition?.final_winner_team ?? '')
  }, [activeCompetition?.final_winner_team, activeCompetitionId])

  const handleSaveScore = useCallback(
    async (
      matchId: string,
      scoreA: number,
      scoreB: number,
      playoffWinner: AdminPlayoffWinner,
    ) => {
      const { error } = await supabase
        .from('matches')
        .update({
          score_a: scoreA,
          score_b: scoreB,
          finished: true,
          playoff_winner: playoffWinner,
        })
        .eq('id', matchId)

      if (error) {
        toast.error(`Erreur: ${error.message}`)
        return
      }
      toast.success('Score mis à jour — points recalculés')
      bumpMatchesList()
    },
    [bumpMatchesList],
  )

  const handleClearScore = useCallback(
    async (matchId: string) => {
      const { error } = await supabase
        .from('matches')
        .update({
          score_a: null,
          score_b: null,
          finished: false,
          playoff_winner: null,
        })
        .eq('id', matchId)

      if (error) {
        toast.error(`Erreur: ${error.message}`)
        return
      }
      toast.success('Score vidé')
      bumpMatchesList()
    },
    [bumpMatchesList],
  )

  const handleMatchVisibilityChange = useCallback(
    async (matchId: string, visible: boolean) => {
      const { error } = await supabase
        .from('matches')
        .update({ visible_to_users: visible })
        .eq('id', matchId)

      if (error) {
        toast.error(`Erreur: ${error.message}`)
        return
      }
      toast.success(
        visible
          ? 'Match visible pour les joueurs'
          : 'Match masqué pour les joueurs',
      )
      bumpMatchesList()
    },
    [bumpMatchesList],
  )

  const handleSetPublic = useCallback(
    async (id: string) => {
      await setPublicCompetition(id)
      toast.success('Compétition publique mise à jour')
    },
    [setPublicCompetition],
  )

  const handleSaveFinalWinner = useCallback(async () => {
    if (!activeCompetitionId) return
    setSavingFinalWinner(true)
    const winnerValue = finalWinnerTeam === '' ? null : finalWinnerTeam
    const { error } = await supabase
      .from('competitions')
      .update({ final_winner_team: winnerValue })
      .eq('id', activeCompetitionId)

    if (error) {
      setSavingFinalWinner(false)
      toast.error(`Erreur: ${error.message}`)
      return
    }

    if (winnerValue !== null) {
      const { error: teamError } = await supabase
        .from('teams')
        .update({ elimination: false })
        .eq('id', winnerValue)

      if (teamError) {
        setSavingFinalWinner(false)
        toast.error(`Erreur: ${teamError.message}`)
        return
      }
    }

    setSavingFinalWinner(false)
    await refreshCompetitions()
    bumpTeamsList()
    toast.success(
      winnerValue
        ? 'Vainqueur final mis à jour — bonus recalculés'
        : 'Vainqueur final purgé — bonus retirés',
    )
  }, [activeCompetitionId, finalWinnerTeam, refreshCompetitions, bumpTeamsList])

  const handleClearFinalWinner = useCallback(async () => {
    if (finalWinnerTeam === '') return
    setFinalWinnerTeam('')
    if (!activeCompetitionId) return
    setSavingFinalWinner(true)
    const { error } = await supabase
      .from('competitions')
      .update({ final_winner_team: null })
      .eq('id', activeCompetitionId)
    setSavingFinalWinner(false)

    if (error) {
      toast.error(`Erreur: ${error.message}`)
      return
    }

    await refreshCompetitions()
    toast.success('Vainqueur final purgé — bonus retirés')
  }, [activeCompetitionId, finalWinnerTeam, refreshCompetitions])

  const handleTeamEliminationChange = useCallback(
    async (team: NormalizedTeam, eliminated: boolean) => {
      if (
        eliminated &&
        isFinalWinnerTeam(team, activeCompetition?.final_winner_team)
      ) {
        toast.error("Impossible d'éliminer le vainqueur officiel")
        return
      }

      const { error } = await supabase
        .from('teams')
        .update({ elimination: eliminated })
        .eq('id', team.id)

      if (error) {
        toast.error(`Erreur: ${error.message}`)
        return
      }

      toast.success(
        eliminated
          ? `${team.name} marqué comme éliminé`
          : `${team.name} remis en course`,
      )
      bumpTeamsList()
    },
    [activeCompetition?.final_winner_team, bumpTeamsList],
  )

  const handleRecalculateAllScores = useCallback(async () => {
    const confirmed = window.confirm(
      'ATTENTION : cela va remettre à zéro tous les scores puis recalculer TOUS les paris de TOUTES les compétitions avec la formule actuelle (base × cote × multiplicateur de phase).\n\nLes classements vont changer. Continuer ?',
    )
    if (!confirmed) return

    setRecalculating(true)
    const { data, error } = await supabase.rpc('admin_recalculate_all_scores')
    setRecalculating(false)

    if (error) {
      toast.error(`Erreur: ${error.message}`)
      return
    }

    const matchesProcessed = jsonNumberField(data, 'matches_processed')
    const betsProcessed = jsonNumberField(data, 'bets_processed')
    const finalWinnerProfiles = jsonNumberField(data, 'final_winner_profiles')
    toast.success(
      `Recalcul terminé : ${matchesProcessed} match(s), ${betsProcessed} pari(s), ${finalWinnerProfiles} bonus vainqueur`,
    )
    bumpMatchesList()
  }, [bumpMatchesList])

  const handleRecalculateAllOdds = useCallback(async () => {
    const confirmed = window.confirm(
      'Cela va recalculer les cotes (popularité) de tous les matchs non démarrés à partir des paris actuels.\n\nLes prochains paris mettront à jour ces cotes automatiquement. Continuer ?',
    )
    if (!confirmed) return

    setRefreshingOdds(true)
    const { data, error } = await supabase.rpc('admin_recalculate_all_odds')
    setRefreshingOdds(false)

    if (error) {
      toast.error(`Erreur: ${error.message}`)
      return
    }

    const refreshed = jsonNumberField(data, 'matches_refreshed')
    const winnerTeamsRefreshed = jsonNumberField(data, 'winner_teams_refreshed')
    toast.success(
      `Cotes recalculées : ${refreshed} match(s), ${winnerTeamsRefreshed} équipe(s)`,
    )
    bumpMatchesList()
  }, [bumpMatchesList])

  const handleDeleteGroup = useCallback(
    async (groupId: string) => {
      const deleted = await deleteAdminGroup(groupId)

      if (deleted) {
        bumpGroupsList()
      }

      return deleted
    },
    [bumpGroupsList],
  )

  const handleDeleteUser = useCallback(
    async (userId: string) => {
      const deleted = await deleteAdminUser(userId)

      if (deleted) {
        bumpUsersList()
        bumpGroupsList()
      }

      return deleted
    },
    [bumpGroupsList, bumpUsersList],
  )

  if (authLoading || (user !== null && profile === null)) {
    return <Loader />
  }

  if (!isAdmin) return null
  if (!matches) {
    return <Loader />
  }

  const filteredMatchesRaw = matches.filter((m) => {
    if (filter === 'pending') return !m.finished
    if (filter === 'finished') return m.finished
    return true
  })
  const filteredMatches = sortAdminFilteredMatches(filteredMatchesRaw, filter)

  const groupedByPhase = filteredMatches.reduce<
    Record<string, NormalizedMatch[]>
  >((acc, match) => {
    const key = formatPhaseAdmin(match)
    if (!acc[key]) acc[key] = []
    acc[key].push(match)
    return acc
  }, {})

  const eligibleFinalWinnerTeams = getFinalWinnerEligibleTeams(teams)
  const selectedFinalWinnerTeam = eligibleFinalWinnerTeams.find((team) => {
    return team.id === finalWinnerTeam
  })

  const filteredAdminGroups = filterAdminGroups(
    adminGroupsState.groups,
    groupSearch,
  )
  const filteredAdminUsers = filterAdminUsers(
    adminUsersState.users,
    adminGroupsState.groups,
    userSearch,
  )

  return (
    <div className="max-w-[600px] mx-auto py-6 px-4 pb-12">
      <h1 className="text-xl font-extrabold text-navy mb-1">Administration</h1>
      <p className="text-sm text-gray-500 mb-5">
        Mettre à jour les scores déclenche le recalcul automatique des points.
        La visibilité par match contrôle l’affichage sur le site et la
        possibilité de pronostiquer (hors admin).
      </p>

      <div className="bg-white rounded-xl p-4 shadow-card mb-6 border border-red-100">
        <h2 className="text-sm font-bold text-navy mb-1">Outils de recalcul</h2>
        <p className="text-xs text-gray-500 mb-3">
          <span className="font-semibold">Scores</span> : remet à zéro tous les
          classements puis recalcule tous les paris avec la formule actuelle
          (base × cote × multiplicateur de phase).
          <br />
          <span className="font-semibold">Cotes</span> : recalcule les cotes de
          popularité de tous les matchs non démarrés et les cotes de vainqueur
          final.
        </p>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className={`text-xs font-semibold py-2 px-4 rounded-full border-none transition-colors ${
              recalculating
                ? 'bg-gray-200 text-gray-400 cursor-wait'
                : 'bg-red-500 text-white cursor-pointer hover:bg-red-600'
            }`}
            disabled={recalculating}
            onClick={handleRecalculateAllScores}
          >
            {recalculating
              ? 'Recalcul en cours...'
              : 'Recalculer tous les scores'}
          </button>
          <button
            type="button"
            className={`text-xs font-semibold py-2 px-4 rounded-full border-none transition-colors ${
              refreshingOdds
                ? 'bg-gray-200 text-gray-400 cursor-wait'
                : 'bg-indigo-500 text-white cursor-pointer hover:bg-indigo-600'
            }`}
            disabled={refreshingOdds}
            onClick={handleRecalculateAllOdds}
          >
            {refreshingOdds ? 'Recalcul des cotes...' : 'Recalculer les cotes'}
          </button>
        </div>
      </div>

      {/* Competition selector */}
      <div className="bg-white rounded-xl p-4 shadow-card mb-6">
        <h2 className="text-sm font-bold text-navy mb-3">Compétition</h2>

        <div className="flex flex-col gap-2">
          <label className="text-xs text-gray-500">
            Vue admin (ce que je vois) :
          </label>
          <select
            className="w-full py-2 px-3 border border-gray-200 rounded-lg text-sm bg-white outline-none focus:border-indigo-500"
            value={activeCompetitionId ?? ''}
            onChange={(e) => setActiveCompetitionId(e.target.value)}
          >
            {competitions.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} {c.active ? '(publique)' : ''}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-2 mt-3">
          <label className="text-xs text-gray-500">
            Compétition publique (vue par les utilisateurs) :
            <span className="font-semibold text-navy ml-1">
              {publicCompetition?.name ?? '—'}
            </span>
          </label>
          {activeCompetitionId &&
            activeCompetitionId !== publicCompetition?.id && (
              <button
                className="text-xs font-semibold py-1.5 px-4 rounded-full bg-indigo-500 text-white border-none cursor-pointer hover:bg-indigo-600 transition-colors self-start"
                onClick={() => handleSetPublic(activeCompetitionId)}
              >
                Rendre cette compétition publique
              </button>
            )}
        </div>
      </div>

      <div className="sticky top-14 z-10 flex flex-wrap gap-1 justify-center py-3 mb-6 bg-cream/[0.85] backdrop-blur-sm">
        <button
          className={`py-2 px-4 rounded-full text-sm font-semibold border-[1.5px] cursor-pointer transition-all duration-200 ${adminTab === 'scores' ? 'text-white bg-navy border-navy' : 'text-gray-500 bg-transparent border-gray-200 hover:text-navy hover:border-navy'}`}
          onClick={() => setAdminTab('scores')}
        >
          Matchs
        </button>
        <button
          className={`py-2 px-4 rounded-full text-sm font-semibold border-[1.5px] cursor-pointer transition-all duration-200 ${adminTab === 'winner' ? 'text-white bg-navy border-navy' : 'text-gray-500 bg-transparent border-gray-200 hover:text-navy hover:border-navy'}`}
          onClick={() => setAdminTab('winner')}
        >
          Vainqueur
        </button>
        <button
          className={`py-2 px-4 rounded-full text-sm font-semibold border-[1.5px] cursor-pointer transition-all duration-200 ${adminTab === 'eliminations' ? 'text-white bg-navy border-navy' : 'text-gray-500 bg-transparent border-gray-200 hover:text-navy hover:border-navy'}`}
          onClick={() => setAdminTab('eliminations')}
        >
          Éliminations
        </button>
        <button
          className={`py-2 px-4 rounded-full text-sm font-semibold border-[1.5px] cursor-pointer transition-all duration-200 ${adminTab === 'groups' ? 'text-white bg-navy border-navy' : 'text-gray-500 bg-transparent border-gray-200 hover:text-navy hover:border-navy'}`}
          onClick={() => setAdminTab('groups')}
        >
          Tribus
        </button>
        <button
          className={`py-2 px-4 rounded-full text-sm font-semibold border-[1.5px] cursor-pointer transition-all duration-200 ${adminTab === 'users' ? 'text-white bg-navy border-navy' : 'text-gray-500 bg-transparent border-gray-200 hover:text-navy hover:border-navy'}`}
          onClick={() => setAdminTab('users')}
        >
          Utilisateurs
        </button>
      </div>

      {adminTab === 'scores' && (
        <>
          <div className="flex gap-1 justify-center mb-6">
            <button
              className={`py-2 px-6 rounded-full text-sm font-semibold border-[1.5px] cursor-pointer transition-all duration-200 ${filter === 'pending' ? 'text-white bg-navy border-navy' : 'text-gray-500 bg-transparent border-gray-200 hover:text-navy hover:border-navy'}`}
              onClick={() => setFilter('pending')}
            >
              À jouer ({matches.filter((m) => !m.finished).length})
            </button>
            <button
              className={`py-2 px-6 rounded-full text-sm font-semibold border-[1.5px] cursor-pointer transition-all duration-200 ${filter === 'finished' ? 'text-white bg-navy border-navy' : 'text-gray-500 bg-transparent border-gray-200 hover:text-navy hover:border-navy'}`}
              onClick={() => setFilter('finished')}
            >
              Terminés ({matches.filter((m) => m.finished).length})
            </button>
            <button
              className={`py-2 px-6 rounded-full text-sm font-semibold border-[1.5px] cursor-pointer transition-all duration-200 ${filter === 'all' ? 'text-white bg-navy border-navy' : 'text-gray-500 bg-transparent border-gray-200 hover:text-navy hover:border-navy'}`}
              onClick={() => setFilter('all')}
            >
              Tous ({matches.length})
            </button>
          </div>

          {Object.entries(groupedByPhase).map(([phase, phaseMatches]) => (
            <div key={phase} className="mb-6">
              <h2 className="text-base font-bold text-navy mb-3">{phase}</h2>
              <div className="flex flex-col gap-2">
                {phaseMatches.map((match) => (
                  <AdminMatchRow
                    key={match.id}
                    match={match}
                    onSave={handleSaveScore}
                    onClear={handleClearScore}
                    onVisibilityChange={handleMatchVisibilityChange}
                  />
                ))}
              </div>
            </div>
          ))}

          {filteredMatches.length === 0 && (
            <p className="text-center text-gray-400 py-10">
              Aucun match dans cette catégorie.
            </p>
          )}
        </>
      )}

      {adminTab === 'winner' && (
        <div className="bg-white rounded-xl p-4 shadow-card">
          <h2 className="text-sm font-bold text-navy mb-1">Vainqueur final</h2>
          <p className="text-xs text-gray-500 mb-4">
            Sélectionner une équipe ajoute automatiquement le bonus aux joueurs
            qui l’avaient choisie. Vider le champ retire ces bonus du
            classement.
          </p>

          <div className="flex flex-col gap-2 mb-4">
            <label className="text-xs text-gray-500">
              Vainqueur officiel :
            </label>
            <select
              className="w-full py-2 px-3 border border-gray-200 rounded-lg text-sm bg-white outline-none focus:border-indigo-500"
              value={finalWinnerTeam}
              onChange={(e) => setFinalWinnerTeam(e.target.value)}
            >
              <option value="">Aucun vainqueur officiel</option>
              {eligibleFinalWinnerTeams.map((team) => (
                <option key={team.id} value={team.id}>
                  {team.name} · {formatAdminPoints(team.winOdd)} pts
                </option>
              ))}
            </select>
          </div>

          {selectedFinalWinnerTeam && (
            <div className="flex items-center gap-3 rounded-lg bg-cream p-3 mb-4">
              <Flag
                country={selectedFinalWinnerTeam.code}
                className="h-9 w-9 rounded object-contain"
              />
              <div className="min-w-0">
                <p className="m-0 text-sm font-bold text-navy">
                  {selectedFinalWinnerTeam.name}
                </p>
                <p className="m-0 text-xs text-gray-500">
                  Bonus appliqué :{' '}
                  {formatAdminPoints(selectedFinalWinnerTeam.winOdd)} points
                </p>
              </div>
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className={`text-xs font-semibold py-2 px-4 rounded-full border-none transition-colors ${
                savingFinalWinner
                  ? 'bg-gray-200 text-gray-400 cursor-wait'
                  : 'bg-navy text-white cursor-pointer hover:bg-navy-light'
              }`}
              disabled={savingFinalWinner}
              onClick={handleSaveFinalWinner}
            >
              {savingFinalWinner ? 'Mise à jour...' : 'Enregistrer'}
            </button>
            <button
              type="button"
              className="text-xs font-semibold py-2 px-4 rounded-full border border-red-200 text-red-500 bg-white cursor-pointer hover:bg-red-50 transition-colors"
              disabled={savingFinalWinner || finalWinnerTeam === ''}
              onClick={handleClearFinalWinner}
            >
              Purger le vainqueur
            </button>
          </div>
        </div>
      )}

      {adminTab === 'eliminations' && (
        <div className="bg-white rounded-xl p-4 shadow-card">
          <h2 className="text-sm font-bold text-navy mb-1">
            Équipes éliminées
          </h2>
          <p className="text-xs text-gray-500 mb-4">
            Cette valeur pilote l’indication du vainqueur final dans les pages
            joueur et pronostics.
          </p>
          <div className="flex flex-col divide-y divide-gray-100">
            {teams.map((team) => (
              <AdminTeamEliminationRow
                key={team.id}
                team={team}
                finalWinnerTeam={activeCompetition?.final_winner_team}
                onToggle={handleTeamEliminationChange}
              />
            ))}
          </div>
        </div>
      )}

      {adminTab === 'groups' && (
        <AdminGroupsPanel
          state={adminGroupsState}
          search={groupSearch}
          filteredGroups={filteredAdminGroups}
          onSearchChange={setGroupSearch}
          onDelete={handleDeleteGroup}
        />
      )}

      {adminTab === 'users' && (
        <AdminUsersPanel
          state={adminUsersState}
          groups={adminGroupsState.groups}
          search={userSearch}
          filteredUsers={filteredAdminUsers}
          currentUserId={user?.id ?? null}
          onSearchChange={setUserSearch}
          onDelete={handleDeleteUser}
        />
      )}
    </div>
  )
}

export default Admin
