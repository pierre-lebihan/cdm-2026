import { isPast, format, isSameDay } from 'date-fns'
import map from 'lodash/map'
import { Suspense, useCallback, useEffect, useMemo, useState } from 'react'
import { ArrowRight, HelpCircle, Sparkles } from 'lucide-react'
import { useCompetitionData } from '../../hooks/competition'
import {
  useMatches,
  isMatchBettingClosed,
  type NormalizedMatch,
} from '../../hooks/matches'
import { useAllUserBets } from '../../hooks/bets'
import { useIsUserConnected } from '../../hooks/user'
import MatchToBet from './MatchToBet/Match'
import MatchBegun from './MatchBegun/Match'
import AiBetModal from './AiBetModal'
import Loader from '../../components/Loader'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import ScoringHelpModal from './MatchToBet/ScoringHelpModal'
import { useSelectedWinner } from '../../hooks/winner'
import { useTeams, type NormalizedTeam } from '../../hooks/teams'
import Flag from '../../components/Flag'
import { captureEvent } from '../../lib/posthog'
import { useLanguage } from '../../contexts/LanguageContext'

interface ScoringHelpButtonProps {
  onClick: () => void
}

type MatchTabKey = 'upcoming' | 'live' | 'finished'

type MatchTab = {
  key: MatchTabKey
  label: string
}

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

function normalizeMatchesTab(value: string | null): MatchTabKey {
  if (value === 'live') {
    return 'live'
  }

  if (value === 'finished' || value === '1') {
    return 'finished'
  }

  return 'upcoming'
}

function isUpcomingMatch(
  match: NormalizedMatch,
  comparingDate: number,
): boolean {
  return !isMatchBettingClosed(match, comparingDate)
}

function isLiveMatch(match: NormalizedMatch, comparingDate: number): boolean {
  if (match.status === 'FINISHED') {
    return false
  }

  if (match.status === 'ONGOING') {
    return true
  }

  return isMatchBettingClosed(match, comparingDate)
}

function isFinishedMatch(match: NormalizedMatch): boolean {
  return match.status === 'FINISHED'
}

function matchTabExists(tabs: MatchTab[], selectedTab: MatchTabKey): boolean {
  for (let i = 0; i < tabs.length; i += 1) {
    if (tabs[i].key === selectedTab) {
      return true
    }
  }

  return false
}

const ScoringHelpButton = ({ onClick }: ScoringHelpButtonProps) => {
  const { t } = useLanguage()

  return (
    <button
      type="button"
      className="inline-flex min-h-9 items-center gap-1.5 rounded-full border border-indigo-100 bg-white px-4 py-2 text-xs font-semibold text-indigo-600 shadow-sm transition-colors hover:border-indigo-200 hover:text-indigo-800"
      onClick={onClick}
      aria-label={t.matches.scoringHelp}
    >
      <HelpCircle size={15} className="shrink-0" />
      <span>{t.matches.scoringHelp}</span>
    </button>
  )
}

interface FinalWinnerReminderProps {
  hasWinner: boolean
  selectedTeam: NormalizedTeam | null
}

interface FinalWinnerAliveReminderProps {
  isOfficialWinner: boolean
  selectedTeam: NormalizedTeam
}

function findTeamById(
  teams: NormalizedTeam[],
  teamId: string | null | undefined,
): NormalizedTeam | null {
  if (!teamId) {
    return null
  }

  for (const team of teams) {
    if (team.id === teamId) {
      return team
    }
  }

  return null
}

function formatWinnerOdd(
  winOdd: number | null,
  localeCode: string,
): string | null {
  if (winOdd == null) {
    return null
  }

  return new Intl.NumberFormat(localeCode, {
    maximumFractionDigits: 0,
  }).format(Math.round(winOdd / 10) * 10)
}

function formatPotentialPoints(
  points: number | null,
  localeCode: string,
): string | null {
  if (points == null) {
    return null
  }

  return new Intl.NumberFormat(localeCode, {
    maximumFractionDigits: 0,
  }).format(Math.round(points / 10) * 10)
}

const FinalWinnerReminder = ({
  hasWinner,
  selectedTeam,
}: FinalWinnerReminderProps) => {
  const { localeCode, t } = useLanguage()
  const formattedOdd = formatWinnerOdd(selectedTeam?.winOdd ?? null, localeCode)
  const title = hasWinner
    ? `${t.matches.finalWinnerSelectedPrefix} ${
        selectedTeam?.name ?? t.matches.finalWinnerRecordedChoice
      }`
    : t.matches.finalWinnerMissingTitle
  const description = hasWinner
    ? formattedOdd
      ? `${t.matches.finalWinnerOddPrefix} ${formattedOdd}. ${t.matches.finalWinnerChangeHint}`
      : t.matches.finalWinnerChangeHint
    : t.matches.finalWinnerMissingDescription
  const actionLabel = hasWinner
    ? t.matches.finalWinnerChange
    : t.matches.finalWinnerChoose
  const ariaLabel = hasWinner
    ? t.matches.finalWinnerChange
    : t.matches.finalWinnerChoose

  return (
    <div className="px-4 pt-2">
      <Link
        to="/#final-winner"
        aria-label={ariaLabel}
        className="group mx-auto flex max-w-[520px] items-center gap-3 rounded-lg border border-amber-100 bg-white px-4 py-3 text-left shadow-card transition-all hover:-translate-y-px hover:border-amber-200 hover:shadow-card-hover focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 focus:ring-offset-cream"
      >
        <span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-amber-50 ring-1 ring-amber-100">
          <Flag
            country={selectedTeam?.code}
            tooltipText={selectedTeam?.name}
            className="h-full w-full rounded-full object-cover"
          />
        </span>
        <div className="min-w-0 flex-1 text-left">
          <p className="m-0 text-sm font-bold leading-snug text-navy">
            {title}
          </p>
          <p className="m-0 text-xs leading-snug text-gray-500">
            {description}
          </p>
        </div>
        <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-navy px-3 py-2 text-xs font-semibold text-white transition-colors group-hover:bg-navy-light">
          <span>{actionLabel}</span>
          <ArrowRight size={14} />
        </span>
      </Link>
    </div>
  )
}

const FinalWinnerAliveReminder = ({
  isOfficialWinner,
  selectedTeam,
}: FinalWinnerAliveReminderProps) => {
  const { localeCode, t } = useLanguage()
  const formattedPoints = formatPotentialPoints(selectedTeam.winOdd, localeCode)
  const potentialGain = formattedPoints
    ? `+${formattedPoints} ${t.common.pointsShort}`
    : t.matches.finalWinnerWinnerBonus
  const title = isOfficialWinner
    ? t.matches.finalWinnerOfficialTitle
    : t.matches.finalWinnerAliveTitle
  const description = isOfficialWinner
    ? `${selectedTeam.name} ${t.matches.finalWinnerOfficialDescriptionSuffix}`
    : `${selectedTeam.name} ${t.matches.finalWinnerAliveDescriptionPrefix} ${potentialGain} ${t.matches.finalWinnerAliveDescriptionSuffix}`

  return (
    <div className="px-4 pt-2">
      <div className="mx-auto flex max-w-[520px] items-center gap-3 rounded-lg border border-emerald-100 bg-white px-4 py-3 text-left shadow-card">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-emerald-50 ring-1 ring-emerald-100">
          <Flag
            country={selectedTeam.code}
            tooltipText={selectedTeam.name}
            className="h-full w-full rounded-full object-cover"
          />
        </span>
        <div className="min-w-0 flex-1 text-left">
          <p className="m-0 text-sm font-bold leading-snug text-navy">
            {title}
          </p>
          <p className="m-0 text-xs leading-snug text-gray-500">
            {description}
          </p>
        </div>
      </div>
    </div>
  )
}

const Matches = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const isConnected = useIsUserConnected()
  const { dateLocale, t } = useLanguage()
  const { bettedMatchIds, refresh: refreshBets } = useAllUserBets()
  const [selectedWinner] = useSelectedWinner()
  const teams = useTeams()
  const [aiModalOpen, setAiModalOpen] = useState(false)
  const [scoringHelpOpen, setScoringHelpOpen] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  const urlParams = useMemo(
    () => new URLSearchParams(location.search),
    [location.search],
  )
  const [selectedTab, setSelectedTab] = useState<MatchTabKey>(() => {
    return normalizeMatchesTab(urlParams.get('tab'))
  })
  const [comparingDate, setComparingDate] = useState(Date.now())

  const handleTabChange = (value: MatchTabKey) => {
    captureEvent('matches_tab_changed', {
      tab: value,
    })
    setSelectedTab(value)
    navigate(`${location.pathname}?tab=${value}`)
  }

  const handleOpenAiModal = useCallback(() => {
    captureEvent('ai_bet_button_clicked')
    setAiModalOpen(true)
  }, [])
  const handleCloseAiModal = useCallback(() => {
    setAiModalOpen(false)
  }, [])
  const handleAiComplete = useCallback(() => {
    setRefreshKey((k) => k + 1)
    refreshBets()
  }, [refreshBets])

  const handleOpenScoringHelp = () => {
    captureEvent('scoring_help_opened')
    setScoringHelpOpen(true)
  }

  const handleCloseScoringHelp = () => {
    captureEvent('scoring_help_closed')
    setScoringHelpOpen(false)
  }

  useEffect(() => {
    const handle = setInterval(() => setComparingDate(Date.now()), 5000)
    return () => clearInterval(handle)
  }, [])

  useEffect(() => {
    setSelectedTab(normalizeMatchesTab(urlParams.get('tab')))
  }, [urlParams])

  const matches = useMatches()
  const competitionData = useCompetitionData()

  const visibleMatches = useMemo(() => {
    if (!matches) return []
    return matches.filter((match) => match.visibleToUsers)
  }, [matches])

  const upcomingMatches = useMemo(() => {
    return visibleMatches.filter((match) => {
      return isUpcomingMatch(match, comparingDate)
    })
  }, [visibleMatches, comparingDate])

  const liveMatches = useMemo(() => {
    return visibleMatches.filter((match) => {
      return isLiveMatch(match, comparingDate)
    })
  }, [visibleMatches, comparingDate])

  const finishedMatches = useMemo(() => {
    return visibleMatches.filter(isFinishedMatch).reverse()
  }, [visibleMatches])

  const tabs = useMemo(() => {
    const nextTabs: MatchTab[] = [
      {
        key: 'upcoming',
        label: t.matches.tabUpcoming,
      },
    ]

    if (liveMatches.length > 0) {
      nextTabs.push({
        key: 'live',
        label: t.matches.tabLive,
      })
    }

    nextTabs.push({
      key: 'finished',
      label: t.matches.tabFinished,
    })

    return nextTabs
  }, [
    liveMatches.length,
    t.matches.tabFinished,
    t.matches.tabLive,
    t.matches.tabUpcoming,
  ])

  useEffect(() => {
    if (!matches) {
      return
    }

    if (matchTabExists(tabs, selectedTab)) {
      return
    }

    setSelectedTab('upcoming')
    navigate(`${location.pathname}?tab=upcoming`, { replace: true })
  }, [location.pathname, matches, navigate, selectedTab, tabs])

  const filteredMatches = useMemo(() => {
    if (selectedTab === 'upcoming') {
      return upcomingMatches
    }

    if (selectedTab === 'live') {
      return liveMatches
    }

    return finishedMatches
  }, [finishedMatches, liveMatches, selectedTab, upcomingMatches])

  const showAiButton =
    isConnected &&
    selectedTab === 'upcoming' &&
    bettedMatchIds !== null &&
    upcomingMatches.length > 0

  const finalWinnerLocked = useMemo(() => {
    if (!competitionData?.start_date) return true
    return isPast(new Date(competitionData.start_date))
  }, [competitionData?.start_date])

  const showFinalWinnerReminder =
    isConnected &&
    selectedTab === 'upcoming' &&
    selectedWinner !== undefined &&
    !finalWinnerLocked

  const selectedWinnerTeam = findTeamById(teams, selectedWinner)
  const hasSelectedWinner = selectedWinner != null
  const selectedWinnerIsOfficialWinner =
    selectedWinnerTeam != null &&
    selectedWinnerTeam.id === competitionData?.final_winner_team
  const selectedWinnerStillAlive =
    selectedWinnerTeam != null &&
    (selectedWinnerTeam.elimination !== true || selectedWinnerIsOfficialWinner)

  const showFinalWinnerAliveReminder =
    isConnected &&
    selectedTab === 'finished' &&
    finalWinnerLocked &&
    selectedWinnerStillAlive

  const dateGroups = useMemo(
    () => groupMatchesByDate(filteredMatches),
    [filteredMatches],
  )

  if (!competitionData?.launchBet) return null
  const LaunchBetDate = new Date(competitionData.launchBet.seconds * 1000)
  if (!isPast(LaunchBetDate)) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] px-6">
        <div className="text-center max-w-md">
          <div className="text-5xl mb-4">🏆</div>
          <h1 className="text-xl font-bold text-navy mb-2">
            {t.matches.launchTitle}
          </h1>
          <p className="text-gray-500">{t.matches.launchText}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <div className="sticky top-14 z-10 flex flex-wrap gap-1 justify-center py-3 px-4 bg-cream/[0.85] backdrop-blur-sm">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            className={`py-2 px-4 rounded-full text-sm font-semibold border-[1.5px] cursor-pointer transition-all duration-200 ${selectedTab === tab.key ? 'text-white bg-navy border-navy' : 'text-gray-500 bg-transparent border-gray-200 hover:text-navy hover:border-navy'}`}
            onClick={() => handleTabChange(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex justify-center px-4 pt-3 pb-1">
        <ScoringHelpButton onClick={handleOpenScoringHelp} />
      </div>

      {showFinalWinnerReminder && (
        <FinalWinnerReminder
          hasWinner={hasSelectedWinner}
          selectedTeam={selectedWinnerTeam}
        />
      )}

      {showFinalWinnerAliveReminder && selectedWinnerTeam && (
        <FinalWinnerAliveReminder
          isOfficialWinner={selectedWinnerIsOfficialWinner}
          selectedTeam={selectedWinnerTeam}
        />
      )}

      {showAiButton && (
        <div className="flex justify-center py-2 px-4">
          <button
            className="flex items-center gap-2 py-2.5 px-5 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-sm font-semibold shadow-lg hover:shadow-xl transition-all hover:scale-[1.02]"
            onClick={handleOpenAiModal}
          >
            <Sparkles size={18} />
            <span>{t.matches.aiButton}</span>
          </button>
        </div>
      )}

      <div className="max-w-[520px] mx-auto py-2 px-4 pb-10">
        {dateGroups.length === 0 && (
          <p className="text-gray-400 text-center py-12">{t.matches.empty}</p>
        )}
        {dateGroups.map((group) => (
          <div key={group.date.toISOString()} className="mb-6">
            <div className="relative z-[5] py-2 mb-2">
              <span className="inline-block text-xs font-bold uppercase tracking-wide text-navy bg-cream py-0.5">
                {format(group.date, 'EEEE d MMMM', { locale: dateLocale })}
              </span>
            </div>
            <div className="flex flex-col gap-2.5">
              {selectedTab === 'upcoming'
                ? map(group.matches, (match) => (
                    <MatchToBet
                      match={match}
                      key={`${match.id}-${refreshKey}`}
                    />
                  ))
                : map(group.matches, (match) => (
                    <MatchBegun match={match} key={match.id} />
                  ))}
            </div>
          </div>
        ))}
      </div>

      {isConnected && bettedMatchIds && (
        <AiBetModal
          open={aiModalOpen}
          onClose={handleCloseAiModal}
          onComplete={handleAiComplete}
          matches={upcomingMatches}
          bettedMatchIds={bettedMatchIds}
        />
      )}
      <ScoringHelpModal
        open={scoringHelpOpen}
        onClose={handleCloseScoringHelp}
      />
    </div>
  )
}

const MatchesSuspense = (props: Record<string, unknown>) => {
  return (
    <Suspense fallback={<Loader />}>
      <Matches {...props} />
    </Suspense>
  )
}

export default MatchesSuspense
