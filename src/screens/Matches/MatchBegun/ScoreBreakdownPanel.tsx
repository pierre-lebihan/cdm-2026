import { formatOdds, type ScoringBreakdown } from '../../../lib/scoring'
import { formatTournamentPhaseLabel } from '../../../lib/matchEnums'
import type { MatchTournamentPhase } from '../../../lib/matchEnums'

export interface ScoreBreakdownPanelProps {
  breakdown: ScoringBreakdown | null
  tournamentPhase: MatchTournamentPhase
  teamAName: string | null
  teamBName: string | null
  scoreA: number | null
  scoreB: number | null
  betTeamA: number | null | undefined
  betTeamB: number | null | undefined
  pointsWon: number | null | undefined
}

interface BaseLineProps {
  label: string
  value: number
  maxValue: number
}

const BaseLine = ({ label, value, maxValue }: BaseLineProps) => (
  <div className="flex justify-between items-center gap-3">
    <span className="text-xs text-gray-600">{label}</span>
    <span
      className={`text-xs font-semibold tabular-nums ${value > 0 ? 'text-navy' : 'text-gray-300'}`}
    >
      {value} / {maxValue}
    </span>
  </div>
)

const ScoreBreakdownPanel = ({
  breakdown,
  tournamentPhase,
  teamAName,
  teamBName,
  scoreA,
  scoreB,
  betTeamA,
  betTeamB,
  pointsWon,
}: ScoreBreakdownPanelProps) => {
  const hasBet =
    betTeamA !== null &&
    betTeamA !== undefined &&
    betTeamB !== null &&
    betTeamB !== undefined

  return (
    <>
      <div className="text-xs text-gray-500 mb-4 leading-relaxed">
        <span className="font-semibold text-navy">
          {teamAName ?? '—'} {scoreA} – {scoreB} {teamBName ?? '—'}
        </span>{' '}
        · {formatTournamentPhaseLabel(tournamentPhase)}
      </div>

      {!hasBet && (
        <div className="text-sm text-gray-500 bg-gray-50 rounded-xl p-4 border border-gray-100">
          Pas de pronostic pour ce match.
        </div>
      )}

      {hasBet && breakdown === null && (
        <div className="text-sm text-gray-500 bg-gray-50 rounded-xl p-4 border border-gray-100">
          Score du match non publié.
        </div>
      )}

      {hasBet && breakdown && (
        <div className="space-y-5">
          <section>
            <h3 className="text-xs font-bold uppercase tracking-wide text-gray-400 mb-2">
              Points de base
            </h3>
            <div className="bg-gray-50 rounded-xl p-3 border border-gray-100 space-y-1.5">
              <BaseLine label="Résultat correct (1 / N / 2)" value={breakdown.resultat} maxValue={2} />
              <BaseLine label="Gagnant effectif" value={breakdown.gagnant} maxValue={8} />
              <BaseLine label="Proximité du score" value={breakdown.proximite} maxValue={3} />
              <BaseLine label="Écart de buts" value={breakdown.ecart} maxValue={3} />
              <BaseLine label="Bonus score exact" value={breakdown.bonus} maxValue={4} />
              <div className="flex justify-between items-center pt-2 mt-2 border-t border-gray-200">
                <span className="text-xs font-semibold text-navy">Total de base</span>
                <span className="text-sm font-bold text-navy tabular-nums">
                  {breakdown.base} / 20
                </span>
              </div>
            </div>
          </section>

          <section>
            <h3 className="text-xs font-bold uppercase tracking-wide text-gray-400 mb-2">
              Multiplicateurs
            </h3>
            <div className="bg-gray-50 rounded-xl p-3 border border-gray-100 space-y-1.5">
              <div className="flex justify-between items-center gap-3">
                <span className="text-xs text-gray-600">Cote gagnante (popularité)</span>
                <span className="text-xs font-semibold text-navy tabular-nums">
                  × {formatOdds(breakdown.winningOdds)}
                </span>
              </div>
              <div className="flex justify-between items-center gap-3">
                <span className="text-xs text-gray-600">Multiplicateur de phase</span>
                <span className="text-xs font-semibold text-navy tabular-nums">
                  × {breakdown.phaseMultiplier}
                </span>
              </div>
            </div>
          </section>

          <section>
            <div className="bg-navy rounded-xl p-4 text-white">
              <div className="text-[0.65rem] uppercase tracking-wide text-white/60 mb-1 font-semibold">
                Calcul final
              </div>
              <div className="text-sm font-mono mb-2 text-white/90">
                {breakdown.base} × {formatOdds(breakdown.winningOdds)} × {breakdown.phaseMultiplier}
              </div>
              <div className="flex items-end gap-2">
                <span className="text-3xl font-extrabold tabular-nums">
                  {breakdown.total}
                </span>
                <span className="text-sm text-white/70 mb-1">points</span>
              </div>
              {pointsWon !== undefined &&
                pointsWon !== null &&
                pointsWon !== breakdown.total && (
                  <div className="mt-2 text-xs text-amber-200">
                    ⚠️ Points en base : {pointsWon}. Un recalcul admin peut
                    réaligner.
                  </div>
                )}
            </div>
          </section>
        </div>
      )}
    </>
  )
}

export default ScoreBreakdownPanel
