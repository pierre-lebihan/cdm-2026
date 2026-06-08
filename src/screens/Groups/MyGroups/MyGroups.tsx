import { useState } from 'react'
import isEmpty from 'lodash/isEmpty'
import toast from 'react-hot-toast'
import { Pencil, Check, X } from 'lucide-react'
import { useAuth } from '../../../contexts/AuthContext'
import { useLanguage } from '../../../contexts/LanguageContext'
import { useRenameGroup, type GroupWithMembers } from '../../../hooks/groups'
import { captureEvent } from '../../../lib/posthog'

const MyGroups = ({
  groups,
  onChange,
}: {
  groups: GroupWithMembers[]
  onChange: () => void
}) => {
  const { t } = useLanguage()

  if (isEmpty(groups)) return null

  return (
    <div className="bg-white rounded-2xl p-5 shadow-card">
      <h3 className="text-lg font-bold text-navy m-0 mb-1">
        {t.groups.myGroupsTitle}
      </h3>
      <p className="text-xs text-gray-400 m-0 mb-4">
        {t.groups.myGroupsDescription}
      </p>

      <div className="flex flex-col gap-2 mt-3">
        {groups.map((group) => (
          <GroupItem group={group} key={group.id} onChange={onChange} />
        ))}
      </div>
    </div>
  )
}

const GroupItem = ({
  group,
  onChange,
}: {
  group: GroupWithMembers
  onChange: () => void
}) => {
  const { user } = useAuth()
  const { t } = useLanguage()
  const uid = user?.id
  const renameGroup = useRenameGroup()

  const [isEditing, setIsEditing] = useState(false)
  const [name, setName] = useState(group.name)
  const [saving, setSaving] = useState(false)

  const isAdmin = group.created_by === uid
  const isMember = group.memberIds.includes(uid ?? '')
  const isAwaiting = group.awaitingIds.includes(uid ?? '')

  const badgeLabel = isAdmin
    ? t.groups.adminBadge
    : isMember
      ? t.groups.memberBadge
      : isAwaiting
        ? t.groups.awaitingBadge
        : ''

  const badgeClasses = isAdmin
    ? 'bg-green-100 text-green-800'
    : isMember
      ? 'bg-blue-100 text-blue-800'
      : isAwaiting
        ? 'bg-amber-100 text-amber-800'
        : ''

  const trimmed = name.trim()
  const isValid =
    trimmed.length >= 2 && trimmed.length <= 20 && trimmed !== group.name

  const handleSave = async () => {
    if (!isValid || saving) return
    setSaving(true)
    const ok = await renameGroup(group.id, trimmed)
    setSaving(false)
    if (ok) {
      setIsEditing(false)
      onChange()
    }
  }

  const handleCancel = () => {
    setName(group.name)
    setIsEditing(false)
  }

  const handleCopyJoinKey = () => {
    if (!group.join_key) return
    navigator.clipboard.writeText(group.join_key).then(() => {
      captureEvent('group_join_key_copied', {
        group_id: group.id,
      })
      toast.success(t.groups.codeCopied, { duration: 2000 })
    })
  }

  if (isEditing) {
    return (
      <div className="flex items-center gap-2 py-2.5 px-3.5 rounded-[10px] bg-gray-50">
        <input
          autoFocus
          className="flex-1 py-1.5 px-2.5 border-[1.5px] border-gray-200 rounded-[8px] text-sm outline-none transition-colors bg-white focus:border-indigo-500"
          value={name}
          maxLength={20}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSave()
            if (e.key === 'Escape') handleCancel()
          }}
        />
        <button
          type="button"
          onClick={handleSave}
          disabled={!isValid || saving}
          className="p-1.5 rounded-md text-green-700 bg-green-100 hover:bg-green-200 disabled:opacity-40 disabled:cursor-not-allowed"
          title={t.common.save}
        >
          <Check size={16} />
        </button>
        <button
          type="button"
          onClick={handleCancel}
          disabled={saving}
          className="p-1.5 rounded-md text-gray-600 bg-gray-200 hover:bg-gray-300"
          title={t.common.cancel}
        >
          <X size={16} />
        </button>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-3 py-2.5 px-3.5 rounded-[10px] bg-gray-50">
      <span className="flex-1 text-sm font-semibold text-navy">
        {group.name}
      </span>
      {isAdmin && (
        <button
          type="button"
          onClick={() => setIsEditing(true)}
          className="p-1 rounded-md text-gray-500 hover:text-indigo-600 hover:bg-indigo-50"
          title={t.groups.renameGroup}
        >
          <Pencil size={14} />
        </button>
      )}
      <span className="text-xs text-gray-400">
        {group.memberIds.length}{' '}
        {group.memberIds.length > 1
          ? t.common.memberPlural
          : t.common.memberSingular}
      </span>
      {group.join_key && (
        <button
          type="button"
          onClick={handleCopyJoinKey}
          className="text-[0.7rem] font-mono text-indigo-500 bg-indigo-50 py-0.5 px-2 rounded-md active:scale-95 transition-transform cursor-pointer"
          title={t.groups.copyInviteCode}
        >
          {group.join_key}
        </button>
      )}
      {badgeLabel && (
        <span
          className={`text-[0.65rem] font-semibold py-0.5 px-2 rounded-full ${badgeClasses}`}
        >
          {badgeLabel}
        </span>
      )}
    </div>
  )
}

export default MyGroups
