import isEmpty from 'lodash/isEmpty'
import toast from 'react-hot-toast'
import { useAuth } from '../../../contexts/AuthContext'
import type { GroupWithMembers } from '../../../hooks/groups'

const MyGroups = ({ groups }: { groups: GroupWithMembers[] }) => {
  if (isEmpty(groups)) return null

  return (
    <div className="bg-white rounded-2xl p-5 shadow-card">
      <h3 className="text-lg font-bold text-navy m-0 mb-1">Mes tribus</h3>
      <p className="text-xs text-gray-400 m-0 mb-4">
        Les tribus dont vous faites partie
      </p>

      <div className="flex flex-col gap-2 mt-3">
        {groups.map((group) => (
          <GroupItem group={group} key={group.id} />
        ))}
      </div>
    </div>
  )
}

const GroupItem = ({ group }: { group: GroupWithMembers }) => {
  const { user } = useAuth()
  const uid = user?.id

  const isAdmin = group.created_by === uid
  const isMember = group.memberIds.includes(uid ?? '')
  const isAwaiting = group.awaitingIds.includes(uid ?? '')

  const badgeLabel = isAdmin
    ? 'Admin'
    : isMember
      ? 'Membre'
      : isAwaiting
        ? 'En attente'
        : ''

  const badgeClasses = isAdmin
    ? 'bg-green-100 text-green-800'
    : isMember
      ? 'bg-blue-100 text-blue-800'
      : isAwaiting
        ? 'bg-amber-100 text-amber-800'
        : ''

  return (
    <div className="flex items-center gap-3 py-2.5 px-3.5 rounded-[10px] bg-gray-50">
      <span className="flex-1 text-sm font-semibold text-navy">{group.name}</span>
      <span className="text-xs text-gray-400">
        {group.memberIds.length} membres
      </span>
      {group.join_key && (
        <button
          type="button"
          onClick={() => {
            navigator.clipboard.writeText(group.join_key ?? '').then(() => {
              toast.success('Code copié !', { duration: 2000 })
            })
          }}
          className="text-[0.7rem] font-mono text-indigo-500 bg-indigo-50 py-0.5 px-2 rounded-md active:scale-95 transition-transform cursor-pointer"
          title="Copier le code d'invitation"
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
