import { isPast, format, isSameDay } from 'date-fns'
import { fr } from 'date-fns/locale'
import map from 'lodash/map'
import { Suspense, useCallback, useEffect, useMemo, useState } from 'react'
import { Sparkles } from 'lucide-react'
import { useCompetitionData } from '../../hooks/competition'
import { useMatches, isMatchFinished, type NormalizedMatch } from '../../hooks/matches'
import { useAllUserBets } from '../../hooks/bets'
import { useIsUserAdmin, useIsUserConnected } from '../../hooks/user'
import MatchToBet from './MatchToBet/Match'
import MatchBegun from './MatchBegun/Match'
import AiBetModal from './AiBetModal'
import { useLocation, useNavigate } from 'react-router-dom'

function groupMatchesByDate(matches: NormalizedMatch[]) {
  const groups: { date: Date; matches: NormalizedMatch[] }[] = []
  for (const match of matches) {
    if (!match.dateTime) continue
    const matchDate = new Date(match.dateTime.seconds * 1000)
    const lastGroup = groups[groups.length - 1]
    if (lastGroup && isSameDay(lastGroup.date, matchDate)) {
      lastGroup.matches.push(match)
    } else {
      groups.push({ date: matchDate, matches: [match] })
    }
  }
  return groups
}

const Matches = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const isAdmin = useIsUserAdmin()
  const isConnected = useIsUserConnected()
  const { bettedMatchIds, refresh: refreshBets } = useAllUserBets()
  const [aiModalOpen, setAiModalOpen] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  const urlParams = useMemo(() => new URLSearchParams(location.search), [location.search])
  const [selectedTab, setSelectedTab] = useState(Number(urlParams.get('tab') || '0'))
  const [comparingDate, setComparingDate] = useState(Date.now())

  const handleTabChange = (value: number) => {
    setSelectedTab(value)
    navigate(`${location.pathname}?tab=${value}`)
  }

  const handleOpenAiModal = useCallback(() => {
    setAiModalOpen(true)
  }, [])
  const handleCloseAiModal = useCallback(() => {
    setAiModalOpen(false)
  }, [])
  const handleAiComplete = useCallback(() => {
    setRefreshKey((k) => k + 1)
    refreshBets()
  }, [refreshBets])

  useEffect(() => {
    const handle = setInterval(() => setComparingDate(Date.now()), 5000)
    return () => clearInterval(handle)
  }, [])

  useEffect(() => {
    const tabFromUrl = urlParams.get('tab') || '0'
    setSelectedTab(Number(tabFromUrl))
  }, [urlParams])

  const matches = useMatches()
  const competitionData = useCompetitionData()

  const visibleMatches = useMemo(() => {
    if (!matches) return []
    return matches.filter((match) => match.visibleToUsers)
  }, [matches])

  const upcomingMatches = useMemo(() => {
    return visibleMatches.filter((match) => !isMatchFinished(match, comparingDate))
  }, [visibleMatches, comparingDate])

  const filteredMatches = useMemo(() => {
    if (selectedTab === 0) return upcomingMatches
    return visibleMatches.filter((match) => isMatchFinished(match, comparingDate)).reverse()
  }, [visibleMatches, selectedTab, upcomingMatches, comparingDate])

  const hasUnbettedMatches = useMemo(() => {
    if (!bettedMatchIds) return false
    return upcomingMatches.some((m) => !bettedMatchIds.has(m.id))
  }, [upcomingMatches, bettedMatchIds])

  const showAiButton = isConnected && selectedTab === 0 && bettedMatchIds !== null && upcomingMatches.length > 0 && (hasUnbettedMatches || isAdmin)

  const dateGroups = useMemo(() => groupMatchesByDate(filteredMatches), [filteredMatches])

  if (!competitionData?.launchBet) return null
  const LaunchBetDate = new Date(competitionData.launchBet.seconds * 1000)
  if (!isPast(LaunchBetDate)) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] px-6">
        <div className="text-center max-w-md">
          <div className="text-5xl mb-4">🏆</div>
          <h1 className="text-xl font-bold text-navy mb-2">Bientôt disponible</h1>
          <p className="text-gray-500">Les pronostics seront bientôt accessibles ! D'ici là, vous pouvez créer votre groupe et inviter vos amis !</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <div className="sticky top-14 z-10 flex gap-1 justify-center py-3 px-4 bg-cream/[0.85] backdrop-blur-sm">
        <button className={`py-2 px-6 rounded-full text-sm font-semibold border-[1.5px] cursor-pointer transition-all duration-200 ${selectedTab === 0 ? 'text-white bg-navy border-navy' : 'text-gray-500 bg-transparent border-gray-200 hover:text-navy hover:border-navy'}`} onClick={() => handleTabChange(0)}>À venir</button>
        <button className={`py-2 px-6 rounded-full text-sm font-semibold border-[1.5px] cursor-pointer transition-all duration-200 ${selectedTab === 1 ? 'text-white bg-navy border-navy' : 'text-gray-500 bg-transparent border-gray-200 hover:text-navy hover:border-navy'}`} onClick={() => handleTabChange(1)}>Terminés</button>
      </div>

      {showAiButton && (
        <div className="flex justify-center py-2 px-4">
          <button className="flex items-center gap-2 py-2.5 px-5 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-sm font-semibold shadow-lg hover:shadow-xl transition-all hover:scale-[1.02]" onClick={handleOpenAiModal}>
            <Sparkles size={18} />
            <span>J'ai pas le temps, laisse l'IA pronostiquer !</span>
          </button>
        </div>
      )}

      <div className="max-w-[520px] mx-auto py-2 px-4 pb-10">
        {dateGroups.length === 0 && (<p className="text-gray-400 text-center py-12">Aucun match à afficher</p>)}
        {dateGroups.map((group) => (
          <div key={group.date.toISOString()} className="mb-6">
            <div className="relative z-[5] py-2 mb-2">
              <span className="inline-block text-xs font-bold uppercase tracking-wide text-navy bg-cream py-0.5">{format(group.date, 'EEEE d MMMM', { locale: fr })}</span>
            </div>
            <div className="flex flex-col gap-2.5">
              {selectedTab === 0
                ? map(group.matches, (match) => (<MatchToBet match={match} key={`${match.id}-${refreshKey}`} />))
                : map(group.matches, (match) => (<MatchBegun match={match} key={match.id} />))}
            </div>
          </div>
        ))}
      </div>

      {isConnected && bettedMatchIds && (
        <AiBetModal open={aiModalOpen} onClose={handleCloseAiModal} onComplete={handleAiComplete} matches={upcomingMatches} bettedMatchIds={bettedMatchIds} isAdmin={isAdmin} />
      )}
    </div>
  )
}

const MatchesSuspense = (props: Record<string, unknown>) => {
  return (
    <Suspense fallback="Loading matches...">
      <Matches {...props} />
    </Suspense>
  )
}

export default MatchesSuspense
