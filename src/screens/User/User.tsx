import { isPast, format, isSameDay } from 'date-fns'
import { fr } from 'date-fns/locale'
import map from 'lodash/map'
import { Suspense, useEffect, useMemo, useState } from 'react'
import { useCompetitionData } from '../../hooks/competition'
import { useMatches, isMatchFinished, type NormalizedMatch } from '../../hooks/matches'
import MatchBegun from './MatchBegun/Match'
import InlineAvatar from 'components/Avatar'
import Loader from 'components/Loader'
import { useOpponent } from 'hooks/opponents'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

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

const User = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [comparingDate, setComparingDate] = useState(Date.now())
  const opponent = useOpponent(id)

  useEffect(() => {
    const handle = setInterval(() => setComparingDate(Date.now()), 5000)
    return () => clearInterval(handle)
  }, [])

  const matches = useMatches()
  const competitionData = useCompetitionData()

  const filteredMatches = useMemo(() => {
    if (!matches) return []
    return matches
      .filter((match) => isMatchFinished(match, comparingDate))
      .sort((a, b) => {
        const tA = a.dateTime?.seconds || 0
        const tB = b.dateTime?.seconds || 0
        return tB - tA
      })
  }, [matches, comparingDate])

  const dateGroups = useMemo(() => groupMatchesByDate(filteredMatches), [filteredMatches])

  if (!competitionData?.launchBet || !opponent) return null

  const LaunchBetDate = new Date(competitionData.launchBet.seconds * 1000)
  if (!isPast(LaunchBetDate)) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] px-6">
        <p className="text-gray-500 text-center">Les pronostics seront bientôt accessibles !</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <div className="sticky top-20 z-10 flex items-center gap-4 py-3 px-4 bg-cream/[0.85] backdrop-blur-sm">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-navy/[0.06] rounded-full transition-colors" aria-label="Retour">
          <ArrowLeft size={20} />
        </button>
        <InlineAvatar avatarUrl={opponent.avatar_url} displayName={opponent.display_name} />
      </div>

      <div className="max-w-[520px] mx-auto py-2 px-4 pb-10">
        {dateGroups.map((group) => (
          <div key={group.date.toISOString()} className="mb-6">
            <div className="relative z-[5] py-2 mb-2">
              <span className="inline-block text-xs font-bold uppercase tracking-wide text-navy bg-cream py-0.5">{format(group.date, 'EEEE d MMMM', { locale: fr })}</span>
            </div>
            <div className="flex flex-col gap-2.5">
              {map(group.matches, (match) => (<MatchBegun match={match} key={match.id} />))}
            </div>
          </div>
        ))}
        {dateGroups.length === 0 && (
          <p className="text-gray-500 text-center mt-8">Aucun match terminé pour le moment.</p>
        )}
      </div>
    </div>
  )
}

const UserSuspense = (props: Record<string, unknown>) => {
  return (
    <Suspense fallback={<Loader />}>
      <User {...props} />
    </Suspense>
  )
}

export default UserSuspense
