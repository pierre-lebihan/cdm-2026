import { useGroupsForUser } from '../../hooks/groups'
import CreateGroup from './CreateGroup/CreateGroup'
import JoinGroup from './JoinGroup'
import MyGroups from './MyGroups/MyGroups'
import { useLanguage } from '../../contexts/LanguageContext'

const Groups = () => {
  const { groups, refetch } = useGroupsForUser()
  const { t } = useLanguage()

  return (
    <div className="max-w-[600px] mx-auto py-6 px-4 pb-12 flex flex-col gap-5">
      <div className="text-center mb-1">
        <h1 className="text-xl font-extrabold text-navy m-0 mb-1">
          {t.groups.title}
        </h1>
        <p className="text-sm text-gray-500 m-0 mb-5">{t.groups.subtitle}</p>
      </div>
      <MyGroups groups={groups} onChange={refetch} />
      <JoinGroup onSuccess={refetch} />
      <CreateGroup onSuccess={refetch} />
    </div>
  )
}

export default Groups
