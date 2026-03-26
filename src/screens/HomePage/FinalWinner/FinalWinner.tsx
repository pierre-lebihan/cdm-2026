import { isPast } from 'date-fns'
import { Suspense, useCallback, useMemo, type ChangeEvent } from 'react'
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

  const handleChange = useCallback(
    (e: ChangeEvent<HTMLSelectElement>) => {
      saveWinner(e.target.value)
    },
    [saveWinner],
  )

  if (!CompetitionStartDate) return null

  const locked = isPast(CompetitionStartDate)

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
      </p>
      <Suspense fallback={null}>
        <FinalWinnerChoice userTeam={team} disabled={locked} onValueChange={handleChange} />
      </Suspense>
    </div>
  )
}

export default FinalWinner
