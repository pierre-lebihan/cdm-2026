import { format, isPast } from 'date-fns'
import { fr } from 'date-fns/locale'
import { Suspense, useCallback, useMemo } from 'react'
import { useSelectedWinner } from '../../../hooks/winner'
import {
  useCompetitionData,
  useCompetitionDisplayName,
} from '../../../hooks/competition'
import FinalWinnerChoice from './FinalWinnerChoice'

const FinalWinner = () => {
  const [team, saveWinner] = useSelectedWinner()
  const competitionData = useCompetitionData()
  const competitionLabel = useCompetitionDisplayName()

  const CompetitionStartDate = useMemo(() => {
    if (!competitionData?.start_date) return null
    return new Date(competitionData.start_date)
  }, [competitionData?.start_date])

  const handleTeamSelect = useCallback(
    (teamId: string) => {
      saveWinner(teamId)
    },
    [saveWinner],
  )

  if (!CompetitionStartDate) return null

  const locked = isPast(CompetitionStartDate)

  const lockLabel = useMemo(() => {
    if (!competitionData?.start_date) return null
    return format(new Date(competitionData.start_date), "d MMMM yyyy 'à' HH:mm", {
      locale: fr,
    })
  }, [competitionData?.start_date])

  return (
    <div className="bg-white rounded-2xl py-6 px-5 text-center shadow-card">
      <h3 className="text-lg font-bold text-navy m-0 mb-1">
        {locked ? 'Votre vainqueur final' : 'Choisissez le vainqueur'}
      </h3>
      <p className="text-xs text-gray-400 m-0 mb-4">
        {locked
          ? 'Vous avez parié pour :'
          : competitionLabel === 'Pronostics'
            ? 'Qui sera le vainqueur final ?'
            : `Qui gagnera ${competitionLabel} ?`}
        {!locked && lockLabel != null && (
          <span className="block mt-2 text-gray-500">
            Clôture des pronostics vainqueur au coup d&apos;envoi du premier quart de finale (
            {lockLabel}).
          </span>
        )}
      </p>
      <Suspense fallback={null}>
        <FinalWinnerChoice userTeam={team} disabled={locked} onTeamSelect={handleTeamSelect} />
      </Suspense>
    </div>
  )
}

export default FinalWinner
