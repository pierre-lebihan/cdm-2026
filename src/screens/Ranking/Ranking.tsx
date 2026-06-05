import isEmpty from 'lodash/isEmpty'
import { Suspense, useEffect, useMemo, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useGroupsForUserMember } from '../../hooks/groups'
import GroupRanking from './GroupRanking/GroupRanking'
import Loader from '../../components/Loader'
import { useAllOpponents } from '../../hooks/opponents'
import { captureEvent } from '../../lib/posthog'

const Ranking = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const urlParams = useMemo(
    () => new URLSearchParams(location.search),
    [location.search],
  )
  const [selectedTab, setSelectedTab] = useState(
    Number(urlParams.get('tab') || '0'),
  )

  useEffect(() => {
    const tabFromUrl = urlParams.get('tab') || '0'
    setSelectedTab(Number(tabFromUrl))
  }, [urlParams])

  const groups = useGroupsForUserMember()
  const handleTabChange = (value: number) => {
    captureEvent('ranking_tab_changed', {
      tab_index: value,
      scope: value === 0 ? 'global' : 'group',
    })
    setSelectedTab(value)
    navigate(`${location.pathname}?tab=${value}`)
  }

  const allOpponents = useAllOpponents()

  if (isEmpty(groups)) {
    return (
      <div className="max-w-[600px] mx-auto py-6 px-4 text-center pt-[60px]">
        <p className="text-gray-500 text-[0.9rem]">
          Pour voir le classement, il faut d'abord{' '}
          <Link to="/groups" className="text-indigo-500 font-semibold">
            créer ou rejoindre une tribu
          </Link>
          .
        </p>
      </div>
    )
  }

  const tabs = [
    { label: 'Général', key: 'general' },
    ...groups.map((g) => ({
      label: g.name,
      key: g.id,
    })),
  ]

  return (
    <div className="min-h-screen">
      <div className="sticky top-14 z-10 flex gap-1 justify-center py-3 px-4 bg-cream/[0.85] backdrop-blur-sm flex-wrap">
        {tabs.map((tab, i) => (
          <button
            key={tab.key}
            className={`py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
              selectedTab === i
                ? 'bg-indigo-100 text-indigo-700 font-semibold'
                : 'text-gray-500 hover:text-navy'
            }`}
            onClick={() => handleTabChange(i)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="max-w-[600px] mx-auto p-4">
        {selectedTab === 0 ? (
          <GroupRanking name="Général" opponentsProvided={allOpponents} />
        ) : (
          <GroupRanking
            name={groups[selectedTab - 1]?.name}
            memberIds={groups[selectedTab - 1]?.memberIds}
          />
        )}
      </div>
    </div>
  )
}

const RankingWithSuspense = (props: Record<string, unknown>) => {
  return (
    <Suspense fallback={<Loader />}>
      <Ranking {...props} />
    </Suspense>
  )
}

export default RankingWithSuspense
