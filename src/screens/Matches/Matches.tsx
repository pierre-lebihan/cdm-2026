import { isPast, format, isSameDay } from 'date-fns'
import { fr } from 'date-fns/locale'
import map from 'lodash/map'
import { Suspense, useCallback, useEffect, useMemo, useState } from 'react'
import { ArrowRight, HelpCircle, Sparkles } from 'lucide-react'
import { useCompetitionData } from '../../hooks/competition'
import {
  useMatches,
  isMatchFinished,
  type NormalizedMatch,
} from '../../hooks/matches'
import { useAllUserBets } from '../../hooks/bets'
import { useIsUserAdmin, useIsUserConnected } from '../../hooks/user'
import MatchToBet from './MatchToBet/Match'
import MatchBegun from './MatchBegun/Match'
import AiBetModal from './AiBetModal'
import Loader from '../../components/Loader'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import ScoringHelpModal from './MatchToBet/ScoringHelpModal'
import { useSelectedWinner } from '../../hooks/winner'
import { useTeams, type NormalizedTeam } from '../../hooks/teams'
import Flag from '../../components/Flag'

interface ScoringHelpButtonProps {
  onClick: () => void
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

const ScoringHelpButton = ({ onClick }: ScoringHelpButtonProps) => {
  return (
    <button
      type="button"
      className="inline-flex min-h-9 items-center gap-1.5 rounded-full border border-indigo-100 bg-white px-4 py-2 text-xs font-semibold text-indigo-600 shadow-sm transition-colors hover:border-indigo-200 hover:text-indigo-800"
      onClick={onClick}
      aria-label="Aide sur le calcul des points"
    >
      <HelpCircle size={15} className="shrink-0" />
      <span>Comment les points sont calculés ?</span>
    </button>
  )
}

interface FinalWinnerReminderProps {
  hasWinner: boolean
  selectedTeam: NormalizedTeam | null
}

interface FinalWinnerAliveReminderProps {
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

function formatWinnerOdd(winOdd: number | null): string | null {
  if (winOdd == null) {
    return null
  }

  return new Intl.NumberFormat('fr-FR', {
    maximumFractionDigits: 2,
  }).format(winOdd)
}

const FinalWinnerReminder = ({
  hasWinner,
  selectedTeam,
}: FinalWinnerReminderProps) => {
  const formattedOdd = formatWinnerOdd(selectedTeam?.winOdd ?? null)
  const title = hasWinner
    ? `Ton vainqueur : ${selectedTeam?.name ?? 'choix enregistré'}`
    : 'Il te manque le vainqueur final'
  const description = hasWinner
    ? formattedOdd
      ? `Cote associée : ${formattedOdd}. Clique ici pour changer ton choix.`
      : 'Clique ici pour changer ton choix.'
    : "Tu n'as pas encore tenté le gros bonus. Choisis ton champion maintenant."
  const actionLabel = hasWinner ? 'Changer' : 'Choisir'
  const ariaLabel = hasWinner
    ? 'Changer le pronostic du vainqueur final'
    : 'Choisir le vainqueur final'

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
  selectedTeam,
}: FinalWinnerAliveReminderProps) => {
  const formattedOdd = formatWinnerOdd(selectedTeam.winOdd)
  const potentialGain = formattedOdd
    ? `+${formattedOdd} pts`
    : 'le bonus vainqueur final'

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
            Ton vainqueur est toujours en course
          </p>
          <p className="m-0 text-xs leading-snug text-gray-500">
            {selectedTeam.name} peut encore te rapporter {potentialGain} si elle
            va au bout.
          </p>
        </div>
      </div>
    </div>
  )
}

const Matches = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const isAdmin = useIsUserAdmin()
  const isConnected = useIsUserConnected()
  const { bettedMatchIds, refresh: refreshBets } = useAllUserBets()
  const [selectedWinner] = useSelectedWinner()
  const teams = useTeams()
  const [aiModalOpen, setAiModalOpen] = useState(false)
  const [scoringHelpOpen, setScoringHelpOpen] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)
  const handleOpenScoringHelp = setScoringHelpOpen.bind(null, true)
  const handleCloseScoringHelp = setScoringHelpOpen.bind(null, false)

  const urlParams = useMemo(
    () => new URLSearchParams(location.search),
    [location.search],
  )
  const [selectedTab, setSelectedTab] = useState(
    Number(urlParams.get('tab') || '0'),
  )
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
    return visibleMatches.filter(
      (match) => !isMatchFinished(match, comparingDate),
    )
  }, [visibleMatches, comparingDate])

  const filteredMatches = useMemo(() => {
    if (selectedTab === 0) return upcomingMatches
    return visibleMatches
      .filter((match) => isMatchFinished(match, comparingDate))
      .reverse()
  }, [visibleMatches, selectedTab, upcomingMatches, comparingDate])

  const hasUnbettedMatches = useMemo(() => {
    if (!bettedMatchIds) return false
    return upcomingMatches.some((m) => !bettedMatchIds.has(m.id))
  }, [upcomingMatches, bettedMatchIds])

  const showAiButton =
    isConnected &&
    selectedTab === 0 &&
    bettedMatchIds !== null &&
    upcomingMatches.length > 0 &&
    (hasUnbettedMatches || isAdmin)

  const finalWinnerLocked = useMemo(() => {
    if (!competitionData?.start_date) return true
    return isPast(new Date(competitionData.start_date))
  }, [competitionData?.start_date])

  const showFinalWinnerReminder =
    isConnected &&
    selectedTab === 0 &&
    selectedWinner !== undefined &&
    !finalWinnerLocked

  const selectedWinnerTeam = findTeamById(teams, selectedWinner)
  const hasSelectedWinner = selectedWinner != null
  const selectedWinnerStillAlive =
    selectedWinnerTeam != null && selectedWinnerTeam.elimination !== true

  const showFinalWinnerAliveReminder =
    isConnected &&
    selectedTab === 1 &&
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
            Bientôt disponible
          </h1>
          <p className="text-gray-500">
            Les pronostics seront bientôt accessibles ! D'ici là, vous pouvez
            créer votre groupe et inviter vos amis !
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <div className="sticky top-14 z-10 flex gap-1 justify-center py-3 px-4 bg-cream/[0.85] backdrop-blur-sm">
        <button
          className={`py-2 px-6 rounded-full text-sm font-semibold border-[1.5px] cursor-pointer transition-all duration-200 ${selectedTab === 0 ? 'text-white bg-navy border-navy' : 'text-gray-500 bg-transparent border-gray-200 hover:text-navy hover:border-navy'}`}
          onClick={() => handleTabChange(0)}
        >
          À venir
        </button>
        <button
          className={`py-2 px-6 rounded-full text-sm font-semibold border-[1.5px] cursor-pointer transition-all duration-200 ${selectedTab === 1 ? 'text-white bg-navy border-navy' : 'text-gray-500 bg-transparent border-gray-200 hover:text-navy hover:border-navy'}`}
          onClick={() => handleTabChange(1)}
        >
          Terminés
        </button>
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
        <FinalWinnerAliveReminder selectedTeam={selectedWinnerTeam} />
      )}

      {showAiButton && (
        <div className="flex justify-center py-2 px-4">
          <button
            className="flex items-center gap-2 py-2.5 px-5 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-sm font-semibold shadow-lg hover:shadow-xl transition-all hover:scale-[1.02]"
            onClick={handleOpenAiModal}
          >
            <Sparkles size={18} />
            <span>Laisse l'IA pronostiquer !</span>
          </button>
        </div>
      )}

      <div className="max-w-[520px] mx-auto py-2 px-4 pb-10">
        {dateGroups.length === 0 && (
          <p className="text-gray-400 text-center py-12">
            Aucun match à afficher
          </p>
        )}
        {dateGroups.map((group) => (
          <div key={group.date.toISOString()} className="mb-6">
            <div className="relative z-[5] py-2 mb-2">
              <span className="inline-block text-xs font-bold uppercase tracking-wide text-navy bg-cream py-0.5">
                {format(group.date, 'EEEE d MMMM', { locale: fr })}
              </span>
            </div>
            <div className="flex flex-col gap-2.5">
              {selectedTab === 0
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
          isAdmin={isAdmin}
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
