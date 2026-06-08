import isEmpty from 'lodash/isEmpty'
import { Suspense, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useGroupsForUserMember } from '../../../hooks/groups'
import GroupMatchDetails from './GroupMatchDetails'
import { useAllOpponents } from '../../../hooks/opponents'
import { useMatch } from 'hooks/matches'
import { useBet } from '../../../hooks/bets'
import MatchBegun from '../MatchBegun/Match'
import ScoreBreakdownPanel from '../MatchBegun/ScoreBreakdownPanel'
import Loader from '../../../components/Loader'
import { computeScoringBreakdown } from '../../../lib/scoring'
import { useLanguage } from '../../../contexts/LanguageContext'

const Details = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [selectedTab, setSelectedTab] = useState(0)
  const groups = useGroupsForUserMember()
  const match = useMatch(id)
  const allOpponents = useAllOpponents()
  const [currentBet] = useBet(match?.id)
  const hasLoaded = useRef(false)
  const { t } = useLanguage()

  useEffect(() => {
    if (match) {
      hasLoaded.current = true
    }
    if (hasLoaded.current && !match) {
      navigate('/matches')
    }
  }, [match, navigate])

  const breakdown = useMemo(() => {
    if (!match) return null
    return computeScoringBreakdown({
      scoreA: match.scores.A,
      scoreB: match.scores.B,
      playoffWinner: match.playoffWinner,
      betTeamA: currentBet?.betTeamA,
      betTeamB: currentBet?.betTeamB,
      betPlayoffWinner: currentBet?.betPlayoffWinner,
      betFormat: match.betFormat,
      tournamentPhase: match.tournamentPhase,
      oddsA: match.odds.PA,
      oddsB: match.odds.PB,
      oddsDraw: match.odds.PN,
    })
  }, [match, currentBet])

  if (!match) {
    return <Loader />
  }

  const tabs = [
    { label: t.ranking.general, key: 'general' },
    ...groups.map((g) => ({
      label: g.name.length > 10 ? `${g.name.slice(0, 8)}…` : g.name,
      key: g.id,
    })),
  ]

  return (
    <div className="min-h-screen max-w-[600px] mx-auto py-4 px-4 pb-10">
      <div className="mb-4">
        <MatchBegun match={match} clickable={false} />
      </div>

      <div className="bg-white rounded-2xl p-5 shadow-card mb-4">
        <h3 className="text-center text-lg font-bold text-navy mb-3">
          {t.matches.myPointsDetail}
        </h3>
        <ScoreBreakdownPanel
          breakdown={breakdown}
          betFormat={match.betFormat}
          tournamentPhase={match.tournamentPhase}
          teamAName={match.teamAName}
          teamBName={match.teamBName}
          scoreA={match.scores.A}
          scoreB={match.scores.B}
          playoffWinner={match.playoffWinner}
          betTeamA={currentBet?.betTeamA}
          betTeamB={currentBet?.betTeamB}
          betPlayoffWinner={currentBet?.betPlayoffWinner}
          pointsWon={currentBet?.pointsWon}
        />
      </div>

      {isEmpty(groups) ? (
        <div className="bg-white rounded-2xl p-5 shadow-card text-center">
          <p className="text-sm text-gray-500">
            {t.matches.moreInfoPrefix}{' '}
            <Link to="/groups" className="text-indigo-500 font-semibold">
              {t.matches.moreInfoLink}
            </Link>
            {t.matches.moreInfoSuffix}
          </p>
        </div>
      ) : (
        <>
          <div className="flex gap-1 justify-center py-3">
            {tabs.map((tab, i) => (
              <button
                key={tab.key}
                className={`py-2 px-5 rounded-full text-xs font-semibold border-[1.5px] cursor-pointer transition-all duration-200 ${
                  selectedTab === i
                    ? 'text-white bg-navy border-navy'
                    : 'text-gray-500 bg-transparent border-gray-200 hover:text-navy hover:border-navy'
                }`}
                onClick={() => setSelectedTab(i)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {selectedTab === 0 ? (
            <GroupMatchDetails
              name={t.ranking.general}
              opponents={allOpponents}
              match={match}
            />
          ) : (
            <GroupMatchDetails
              name={groups[selectedTab - 1]?.name ?? ''}
              match={match}
              opponents={allOpponents.filter((opponent) =>
                groups[selectedTab - 1]?.memberIds?.includes(opponent.id),
              )}
            />
          )}
        </>
      )}
    </div>
  )
}

const DetailsWithSuspense = (props: Record<string, unknown>) => {
  return (
    <Suspense fallback={<Loader />}>
      <Details {...props} />
    </Suspense>
  )
}

export default DetailsWithSuspense
