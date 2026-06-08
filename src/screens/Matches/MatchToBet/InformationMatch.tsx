import type { MatchTournamentPhase } from '../../../lib/matchEnums'
import { getTournamentPhaseStyle } from '../../../lib/matchEnums'
import { useLanguage } from '../../../contexts/LanguageContext'

interface InformationMatchProps {
  tournamentPhase: MatchTournamentPhase
  groupName: string | null
}

const InformationMatch = ({
  tournamentPhase,
  groupName,
}: InformationMatchProps) => {
  const { t } = useLanguage()
  const config = getTournamentPhaseStyle(tournamentPhase)
  const label =
    tournamentPhase === 'group'
      ? `${t.matchPhases.group} ${groupName ?? '?'}`
      : t.matchPhases[tournamentPhase]

  return (
    <span
      className="inline-flex items-center cursor-help"
      title={`${t.scoring.tooltip} ×${config.multiplier}`}
    >
      <span
        className="inline-block text-[0.65rem] font-bold px-2.5 py-[3px] rounded-full text-white tracking-wide uppercase"
        style={{ backgroundColor: config.color }}
      >
        {label}
      </span>
    </span>
  )
}

export default InformationMatch
