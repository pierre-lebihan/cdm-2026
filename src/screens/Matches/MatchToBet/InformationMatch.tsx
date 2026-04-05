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
    <span className="inline-flex items-center gap-1.5">
      <span
        className="inline-block text-[0.65rem] font-bold px-2.5 py-[3px] rounded-full text-white tracking-wide uppercase"
        style={{ backgroundColor: config.color }}
      >
        {label}
      </span>
      {config.multiplier > 1 && (
        <span
          className="inline-flex items-center justify-center text-[0.65rem] font-extrabold px-1.5 py-[2px] rounded-md border"
          style={{
            color: config.color,
            backgroundColor: `${config.color}10`,
            borderColor: `${config.color}25`,
          }}
        >
          ×{config.multiplier}
        </span>
      )}
    </span>
  )
}

export default InformationMatch
