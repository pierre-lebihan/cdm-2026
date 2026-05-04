import type { MatchTournamentPhase } from '../../../lib/matchEnums'
import { getTournamentPhaseStyle } from '../../../lib/matchEnums'

interface InformationMatchProps {
  tournamentPhase: MatchTournamentPhase
  groupName: string | null
}

const InformationMatch = ({
  tournamentPhase,
  groupName,
}: InformationMatchProps) => {
  const config = getTournamentPhaseStyle(tournamentPhase)
  const label =
    tournamentPhase === 'group' ? `Groupe ${groupName ?? '?'}` : config.label

  return (
    <span
      className="inline-flex items-center cursor-help"
      title={`Multiplicateur de phase : ×${config.multiplier}`}
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
