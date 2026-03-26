import { isPast } from 'date-fns'
import { useMemo } from 'react'
import {
  useCompetitionData,
  useCompetitionDisplayName,
} from '../../hooks/competition'
import { useIsUserConnected } from '../../hooks/user'
import FinalWinner from './FinalWinner/FinalWinner'
import { useNavigate } from 'react-router'

const WinnerChoice = () => {
  const competitionData = useCompetitionData()

  const launchBetOk = useMemo(() => {
    if (!competitionData?.launch_bet) return true
    return isPast(new Date(competitionData.launch_bet))
  }, [competitionData?.launch_bet])

  if (!competitionData?.start_date) return null

  if (!launchBetOk) {
    return (
      <div className="bg-white rounded-2xl p-5 shadow-card text-center">
        <p className="text-gray-500 text-sm">
          Le pronostic du vainqueur final sera bientôt accessible !
        </p>
      </div>
    )
  }

  return (
    <div className="mb-7">
      <FinalWinner />
    </div>
  )
}

const HomePage = () => {
  const navigate = useNavigate()
  const signedIn = useIsUserConnected()
  const competitionTitle = useCompetitionDisplayName()

  return (
    <div className="py-8 px-4 pb-12 max-w-[520px] mx-auto">
      <div className="text-center mb-7">
        <div className="text-5xl mb-2">🏆</div>
        <h1 className="text-2xl font-extrabold text-navy m-0 mb-2">
          {competitionTitle}
        </h1>
        <p className="text-sm text-gray-500 leading-relaxed">
          Pronostiquez les résultats des matches, marquez des points et
          affrontez vos amis et votre famille dans votre tribu !
        </p>
      </div>

      <div className="flex flex-wrap gap-2.5 justify-center mb-7">
        <button
          type="button"
          className="flex-1 min-w-[140px] max-w-[200px] bg-white rounded-[14px] p-4 text-center shadow-card cursor-pointer transition-all border-none hover:shadow-card-hover hover:-translate-y-px"
          onClick={() => navigate('/rules')}
        >
          <div className="text-2xl mb-1.5">📋</div>
          <div className="text-xs font-semibold text-navy">Règles</div>
        </button>

        {signedIn && (
          <>
            <button
              type="button"
              className="flex-1 min-w-[140px] max-w-[200px] bg-white rounded-[14px] p-4 text-center shadow-card cursor-pointer transition-all border-none hover:shadow-card-hover hover:-translate-y-px"
              onClick={() => navigate('/matches')}
            >
              <div className="text-2xl mb-1.5">⚽</div>
              <div className="text-xs font-semibold text-navy">Pronostics</div>
            </button>
            <button
              type="button"
              className="flex-1 min-w-[140px] max-w-[200px] bg-white rounded-[14px] p-4 text-center shadow-card cursor-pointer transition-all border-none hover:shadow-card-hover hover:-translate-y-px"
              onClick={() => navigate('/ranking')}
            >
              <div className="text-2xl mb-1.5">🥇</div>
              <div className="text-xs font-semibold text-navy">Classement</div>
            </button>
          </>
        )}
      </div>

      {signedIn && <WinnerChoice />}

      {!signedIn && (
        <div className="bg-white rounded-2xl p-5 shadow-card text-center mt-3">
          <p className="text-sm text-gray-500">
            Connectez-vous pour commencer à pronostiquer !
          </p>
        </div>
      )}
    </div>
  )
}

export default HomePage
