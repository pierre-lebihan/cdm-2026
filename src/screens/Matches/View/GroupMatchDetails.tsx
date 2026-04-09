import orderBy from 'lodash/orderBy'
import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../../contexts/AuthContext'
import InlineAvatar from 'components/Avatar'
import { useBetsFromGame } from 'hooks/bets'
import {
  betOutcomeCellClass,
  betOutcomeTableLabel,
  matchHasPublishedScore,
} from '../../../lib/betOutcomeStatus'

interface GroupMatchDetailsProps {
  name: string
  opponents?: Array<{
    id: string
    display_name?: string | null
    avatar_url?: string | null
  }>
  match: {
    id: string
    scores: { A: number | null; B: number | null }
  }
}

const GroupMatchDetails = ({ name, opponents, match }: GroupMatchDetailsProps) => {
  const { user } = useAuth()
  const uid = user?.id
  const navigate = useNavigate()
  const membersIds = opponents?.map((o) => o.id)

  const bets = useBetsFromGame(match.id, true)

  const normalizedBets = useMemo(
    () =>
      bets?.map((b) => ({
        ...b,
        uid: b.user_id,
        betTeamA: b.bet_team_a,
        betTeamB: b.bet_team_b,
        pointsWon: b.points_won,
        outcomeStatus: b.outcome_status,
      })),
    [bets],
  )

  const betsFiltered = useMemo(
    () =>
      membersIds
        ? normalizedBets?.filter((bet) => membersIds.includes(bet.uid))
        : normalizedBets,
    [normalizedBets, membersIds],
  )

  const rows = useMemo(() => {
    if (!opponents) return []

    const rowsData = opponents.map((opponent) => {
      const bet = betsFiltered?.find((b) => b.uid === opponent.id)
      return {
        opponent,
        bet,
        pointsWon: bet?.pointsWon ?? 0,
        hasBet: !!bet,
      }
    })

    return orderBy(
      rowsData,
      [(row) => row.hasBet, (row) => row.pointsWon],
      ['desc', 'desc'],
    )
  }, [opponents, betsFiltered])

  if (!bets) return null

  const ScoreA = match.scores.A
  const ScoreB = match.scores.B
  const showOutcomeColumn = matchHasPublishedScore(ScoreA, ScoreB)

  return (
    <div className="bg-white rounded-2xl p-5 shadow-card mb-4">
      <h3 className="text-center text-lg font-bold text-navy mb-3">{name}</h3>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr>
              <th className="p-2 text-left"></th>
              <th className="p-2 text-left">Nom</th>
              <th className="p-2 text-left">Prono</th>
              {showOutcomeColumn ? (
                <th className="p-2 text-left">Statut</th>
              ) : null}
              <th className="p-2 text-right">Points</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ opponent, bet, hasBet }, index) => {
              return (
                <tr
                  key={opponent.id}
                  className={`cursor-pointer transition-colors ${opponent.id === uid ? 'bg-cream/50 hover:bg-cream-dark' : 'hover:bg-black/5'}`}
                  onClick={() => navigate(`/user/${opponent.id}`)}
                >
                  <td className="p-2 text-xs text-gray-400 font-bold">
                    #{index + 1}
                  </td>
                  <td className="p-2">
                    <InlineAvatar
                      avatarUrl={opponent.avatar_url ?? undefined}
                      displayName={opponent.display_name ?? undefined}
                      size={24}
                    />
                  </td>
                  <td className="p-2 text-center text-sm">
                    {hasBet ? `${bet.betTeamA} : ${bet.betTeamB}` : '–'}
                  </td>
                  {showOutcomeColumn ? (
                    <td
                      className={`p-2 text-left text-sm ${betOutcomeCellClass(
                        hasBet ? bet?.outcomeStatus : null,
                      )}`}
                    >
                      {hasBet
                        ? betOutcomeTableLabel(bet?.outcomeStatus)
                        : '–'}
                    </td>
                  ) : null}
                  <td className="p-2 text-right font-semibold text-sm">
                    {(bet?.pointsWon || 0).toLocaleString()} pts
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default GroupMatchDetails
