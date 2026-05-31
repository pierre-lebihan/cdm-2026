import orderBy from 'lodash/orderBy'
import { useMemo } from 'react'
import { useAuth } from '../../../contexts/AuthContext'
import forgotBetImgUrl from '../../../assets/icons/ForgotBet.png'
import imgUrl from '../../../assets/icons/mask6.png'
import { useOpponents } from '../../../hooks/opponents'
import { useTeams, type NormalizedTeam } from '../../../hooks/teams'
import OwnRank from './OwnRank'
import { useNavigate } from 'react-router-dom'
import Flag from 'components/Flag'
import Tooltip from 'components/Tooltip'

interface GroupRankingProps {
  name?: string
  memberIds?: string[]
  opponentsProvided?: Array<{
    id: string
    display_name?: string | null
    avatar_url?: string | null
    final_winner_points?: number | null
    score?: number | null
    winner_team?: string | null
  }>
}

function shouldHideOpponentWinner(
  isOwn: boolean,
  team: NormalizedTeam | null,
): boolean {
  if (isOwn) {
    return false
  }

  if (!team) {
    return false
  }

  return team.elimination !== true
}

const GroupRanking = ({
  name,
  memberIds,
  opponentsProvided,
}: GroupRankingProps) => {
  const { user } = useAuth()
  const uid = user?.id
  const opponents = useOpponents(memberIds)
  const navigate = useNavigate()

  const opponentsUsed = opponentsProvided || opponents

  const sortedOpponents = useMemo(
    () => orderBy(opponentsUsed, (u) => u.score ?? 0, ['desc']),
    [opponentsUsed],
  )

  const teams = useTeams()

  return (
    <>
      <OwnRank opponents={sortedOpponents} />

      <div className="w-full bg-white rounded-[14px] shadow-card">
        {sortedOpponents.map((opponent, index) => {
          if (!opponent) return null

          const team = opponent.winner_team
            ? teams.find((t) => t.id === opponent.winner_team)
            : null
          const isLast = index === sortedOpponents.length - 1
          const isOwn = opponent.id === uid
          const hideWinner = shouldHideOpponentWinner(isOwn, team ?? null)

          return (
            <div
              key={opponent.id}
              className={`flex items-center py-2.5 px-3.5 gap-3 cursor-pointer transition-colors first:rounded-t-[14px] last:rounded-b-[14px] ${
                isOwn
                  ? 'bg-amber-100 hover:bg-amber-200'
                  : 'hover:bg-cream-dark'
              } ${!isLast ? 'border-b border-gray-100' : ''}`}
              onClick={() => navigate(`/user/${opponent.id}`)}
            >
              <span className="text-xs font-bold text-gray-400 w-7 text-center shrink-0">
                #{index + 1}
              </span>

              <div className="shrink-0">
                {opponent.avatar_url ? (
                  <img
                    src={opponent.avatar_url}
                    alt={opponent.display_name ?? ''}
                    className="w-8 h-8 rounded-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-semibold text-gray-500">
                    {(opponent.display_name ?? '?')[0]}
                  </div>
                )}
              </div>

              <span className="flex-1 text-sm font-semibold text-navy overflow-hidden text-ellipsis whitespace-nowrap">
                {opponent.display_name ?? 'Anonyme'}
              </span>

              <span className="text-xs font-bold text-indigo-500 shrink-0">
                {(opponent.score || 0).toLocaleString()} pts
              </span>

              <div className="shrink-0 w-8 h-8">
                {team ? (
                  hideWinner ? (
                    <Tooltip content="Vainqueur encore secret">
                      <img
                        src={imgUrl}
                        style={{ width: 28, height: 28 }}
                        alt="Mystère"
                      />
                    </Tooltip>
                  ) : team.elimination ? (
                    <Flag
                      tooltipText={'Éliminé : ' + team.name}
                      country={team.code}
                      style={{
                        width: 28,
                        height: 28,
                        opacity: 0.4,
                        filter: 'grayscale(1)',
                      }}
                    />
                  ) : team.unveiled ? (
                    <Flag
                      tooltipText={team.name}
                      country={team.code}
                      style={{ width: 28, height: 28 }}
                    />
                  ) : (
                    <Tooltip content="Vainqueur mystère">
                      <img
                        src={imgUrl}
                        style={{ width: 28, height: 28 }}
                        alt="Mystère"
                      />
                    </Tooltip>
                  )
                ) : (
                  <Tooltip content="Pas de vainqueur sélectionné">
                    <img
                      src={forgotBetImgUrl}
                      style={{ width: 28, height: 28, opacity: 0.4 }}
                      alt="Aucun"
                    />
                  </Tooltip>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </>
  )
}

export default GroupRanking
