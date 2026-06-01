import { isPast, format, isSameDay } from 'date-fns'
import { fr } from 'date-fns/locale'
import map from 'lodash/map'
import { Suspense, useEffect, useMemo, useState } from 'react'
import { useCompetitionData } from '../../hooks/competition'
import {
  useMatches,
  isMatchFinished,
  type NormalizedMatch,
} from '../../hooks/matches'
import MatchBegun from './MatchBegun/Match'
import ScoreBreakdownPanel from '../Matches/MatchBegun/ScoreBreakdownPanel'
import InlineAvatar from 'components/Avatar'
import Loader from 'components/Loader'
import { useOpponent } from 'hooks/opponents'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { useTeams, type NormalizedTeam } from '../../hooks/teams'
import Flag from 'components/Flag'
import { useAuth } from '../../contexts/AuthContext'
import { useBetFromUser } from '../../hooks/bets'
import { computeScoringBreakdown } from '../../lib/scoring'

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

function formatWinnerPoints(points: number | null | undefined): string {
  if (points === null || points === undefined) {
    return '0'
  }

  return new Intl.NumberFormat('fr-FR', {
    maximumFractionDigits: 0,
  }).format(Math.round(points / 10) * 10)
}

function getPotentialWinnerPoints(team: NormalizedTeam | null): number {
  if (!team?.winOdd) {
    return 0
  }

  return Math.round(team.winOdd / 10) * 10
}

function UserWinnerStatus({
  team,
  finalWinnerTeam,
  finalWinnerPoints,
  isOwn,
}: {
  team: NormalizedTeam | null
  finalWinnerTeam: string | null | undefined
  finalWinnerPoints: number | null | undefined
  isOwn: boolean
}) {
  if (!team) {
    return (
      <div className="mb-4 rounded-xl bg-white p-4 shadow-card">
        <p className="m-0 text-sm font-bold text-navy">
          Aucun vainqueur final sélectionné.
        </p>
        <p className="m-0 mt-1 text-xs text-gray-500">
          Aucun bonus ne pourra être ajouté au classement.
        </p>
      </div>
    )
  }

  const finalWinnerKnown =
    finalWinnerTeam !== null && finalWinnerTeam !== undefined
  const isCorrectWinner = finalWinnerKnown && finalWinnerTeam === team.id
  const isEliminated = team.elimination === true && !isCorrectWinner
  const potentialPoints = getPotentialWinnerPoints(team)
  const revealTeam = isOwn || isEliminated || finalWinnerKnown
  const title = isCorrectWinner
    ? `Ce joueur a gagné ${formatWinnerPoints(finalWinnerPoints)} points`
    : finalWinnerKnown
      ? "Son vainqueur final n'a pas gagné : 0 point"
      : isEliminated
        ? 'Son vainqueur final est éliminé : 0 point'
        : `Ce joueur peut gagner ${formatWinnerPoints(potentialPoints)} points`
  const description = revealTeam
    ? `${team.name} ${
        isCorrectWinner
          ? 'a gagné la compétition.'
          : isEliminated
            ? 'est éliminé.'
            : 'est encore en course.'
      }`
    : 'Son choix reste masqué tant que cette équipe est encore en course.'

  return (
    <div className="mb-4 flex items-center gap-3 rounded-xl bg-white p-4 shadow-card">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-cream ring-1 ring-gray-100">
        {revealTeam ? (
          <Flag
            country={team.code}
            className={`h-full w-full rounded-full object-cover ${
              isEliminated ? 'opacity-40 grayscale' : ''
            }`}
          />
        ) : (
          <span className="text-lg font-extrabold text-navy">?</span>
        )}
      </span>
      <div className="min-w-0">
        <p className="m-0 text-sm font-bold text-navy">{title}</p>
        <p className="m-0 mt-1 text-xs text-gray-500">{description}</p>
      </div>
    </div>
  )
}

const User = () => {
  const { id, matchId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [comparingDate, setComparingDate] = useState(Date.now())
  const opponent = useOpponent(id)
  const teams = useTeams()

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

  const dateGroups = useMemo(
    () => groupMatchesByDate(filteredMatches),
    [filteredMatches],
  )
  const selectedMatch = useMemo(() => {
    if (!matchId) return null
    return (
      filteredMatches.find((match) => {
        return match.id === matchId
      }) ?? null
    )
  }, [filteredMatches, matchId])
  const winnerTeam = findTeamById(teams, opponent?.winner_team)
  const [selectedBet] = useBetFromUser(selectedMatch?.id, id)
  const selectedBreakdown = useMemo(() => {
    if (!selectedMatch) return null
    return computeScoringBreakdown({
      scoreA: selectedMatch.scores.A,
      scoreB: selectedMatch.scores.B,
      playoffWinner: selectedMatch.playoffWinner,
      betTeamA: selectedBet?.betTeamA,
      betTeamB: selectedBet?.betTeamB,
      betPlayoffWinner: selectedBet?.betPlayoffWinner,
      betFormat: selectedMatch.betFormat,
      tournamentPhase: selectedMatch.tournamentPhase,
      oddsA: selectedMatch.odds.PA,
      oddsB: selectedMatch.odds.PB,
      oddsDraw: selectedMatch.odds.PN,
    })
  }, [selectedMatch, selectedBet])

  if (!competitionData?.launchBet || !opponent) return null

  const LaunchBetDate = new Date(competitionData.launchBet.seconds * 1000)
  if (!isPast(LaunchBetDate)) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] px-6">
        <p className="text-gray-500 text-center">
          Les pronostics seront bientôt accessibles !
        </p>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <div className="sticky top-14 z-10 flex items-center gap-4 py-3 px-4 bg-cream/[0.85] backdrop-blur-sm">
        <button
          onClick={() => {
            if (matchId && id) {
              navigate(`/user/${id}`)
              return
            }
            navigate(-1)
          }}
          className="p-2 hover:bg-navy/[0.06] rounded-full transition-colors"
          aria-label="Retour"
        >
          <ArrowLeft size={20} />
        </button>
        <InlineAvatar
          avatarUrl={opponent.avatar_url}
          displayName={opponent.display_name}
        />
      </div>

      <div className="max-w-[520px] mx-auto py-2 px-4 pb-10">
        <UserWinnerStatus
          team={winnerTeam}
          finalWinnerTeam={competitionData.final_winner_team}
          finalWinnerPoints={opponent.final_winner_points}
          isOwn={user?.id === id}
        />

        {matchId && selectedMatch && (
          <>
            <div className="mb-4">
              <MatchBegun match={selectedMatch} clickable={false} />
            </div>
            <div className="bg-white rounded-2xl p-5 shadow-card mb-4">
              <h3 className="text-center text-lg font-bold text-navy mb-3">
                Détail des points de {opponent.display_name ?? 'ce joueur'}
              </h3>
              <ScoreBreakdownPanel
                breakdown={selectedBreakdown}
                betFormat={selectedMatch.betFormat}
                tournamentPhase={selectedMatch.tournamentPhase}
                teamAName={selectedMatch.teamAName}
                teamBName={selectedMatch.teamBName}
                scoreA={selectedMatch.scores.A}
                scoreB={selectedMatch.scores.B}
                playoffWinner={selectedMatch.playoffWinner}
                betTeamA={selectedBet?.betTeamA}
                betTeamB={selectedBet?.betTeamB}
                betPlayoffWinner={selectedBet?.betPlayoffWinner}
                pointsWon={selectedBet?.pointsWon}
              />
            </div>
          </>
        )}

        {matchId && !selectedMatch && (
          <p className="text-gray-500 text-center mt-8">
            Match introuvable ou pas encore terminé.
          </p>
        )}

        {!matchId && (
          <>
            {dateGroups.map((group) => (
              <div key={group.date.toISOString()} className="mb-6">
                <div className="relative z-[5] py-2 mb-2">
                  <span className="inline-block text-xs font-bold uppercase tracking-wide text-navy bg-cream py-0.5">
                    {format(group.date, 'EEEE d MMMM', { locale: fr })}
                  </span>
                </div>
                <div className="flex flex-col gap-2.5">
                  {map(group.matches, (match) => (
                    <MatchBegun match={match} key={match.id} />
                  ))}
                </div>
              </div>
            ))}
            {dateGroups.length === 0 && (
              <p className="text-gray-500 text-center mt-8">
                Aucun match terminé pour le moment.
              </p>
            )}
          </>
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
