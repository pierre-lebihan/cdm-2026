import { formatOdds, type ScoringBreakdown } from '../../../lib/scoring'
import type {
  MatchBetFormat,
  MatchTournamentPhase,
} from '../../../lib/matchEnums'
import {
  getDrawBetPlayoffWinnerName,
  getPlayoffWinnerName,
  shouldShowPlayoffWinner,
} from '../../../lib/playoffWinner'
import { useLanguage } from '../../../contexts/LanguageContext'

export interface ScoreBreakdownPanelProps {
  breakdown: ScoringBreakdown | null
  betFormat: MatchBetFormat
  tournamentPhase: MatchTournamentPhase
  teamAName: string | null
  teamBName: string | null
  scoreA: number | null
  scoreB: number | null
  playoffWinner?: 'A' | 'B' | null
  betTeamA: number | null | undefined
  betTeamB: number | null | undefined
  betPlayoffWinner?: 'A' | 'B' | null
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
  betFormat,
  tournamentPhase,
  teamAName,
  teamBName,
  scoreA,
  scoreB,
  playoffWinner,
  betTeamA,
  betTeamB,
  betPlayoffWinner,
  pointsWon,
}: ScoreBreakdownPanelProps) => {
  const { t } = useLanguage()
  const hasBet =
    betTeamA !== null &&
    betTeamA !== undefined &&
    betTeamB !== null &&
    betTeamB !== undefined

  const playoffWinnerName = shouldShowPlayoffWinner(
    betFormat,
    scoreA,
    scoreB,
    playoffWinner,
  )
    ? getPlayoffWinnerName(playoffWinner, teamAName, teamBName)
    : null

  const betPlayoffWinnerName = getDrawBetPlayoffWinnerName(
    betTeamA,
    betTeamB,
    betPlayoffWinner,
    teamAName,
    teamBName,
  )

  return (
    <>
      <div className="text-xs text-gray-500 mb-4 leading-relaxed">
        <div>
          <span className="font-semibold text-navy">
            {t.scoring.finalScore} : {teamAName ?? '—'} {scoreA} – {scoreB}{' '}
            {teamBName ?? '—'}
          </span>{' '}
          · {t.matchPhases[tournamentPhase]}
        </div>
        {playoffWinnerName && (
          <div className="mt-1 font-semibold text-amber-700">
            {t.scoring.finalWinner} : {playoffWinnerName}
          </div>
        )}
        {hasBet && (
          <div className="mt-1">
            {t.scoring.prediction} : {betTeamA} – {betTeamB}
            {betPlayoffWinnerName && (
              <span className="font-semibold text-indigo-700">
                {' '}
                · {t.scoring.winnerIfDraw} : {betPlayoffWinnerName}
              </span>
            )}
          </div>
        )}
      </div>

      {!hasBet && (
        <div className="text-sm text-gray-500 bg-gray-50 rounded-xl p-4 border border-gray-100">
          {t.scoring.noBet}
        </div>
      )}

      {hasBet && breakdown === null && (
        <div className="text-sm text-gray-500 bg-gray-50 rounded-xl p-4 border border-gray-100">
          {t.scoring.pendingScore}
        </div>
      )}

      {hasBet && breakdown && (
        <div className="space-y-5">
          <section>
            <h3 className="text-xs font-bold uppercase tracking-wide text-gray-400 mb-2">
              {t.scoring.basePoints}
            </h3>
            <div className="bg-gray-50 rounded-xl p-3 border border-gray-100 space-y-1.5">
              <BaseLine
                label={t.scoring.resultCorrect}
                value={breakdown.resultat}
                maxValue={2}
              />
              <BaseLine
                label={t.scoring.goodWinner}
                value={breakdown.gagnant}
                maxValue={8}
              />
              <BaseLine
                label={t.scoring.scoreProximity}
                value={breakdown.proximite}
                maxValue={3}
              />
              <BaseLine
                label={t.scoring.goalDifference}
                value={breakdown.ecart}
                maxValue={3}
              />
              <BaseLine
                label={t.scoring.scoreExactBonus}
                value={breakdown.bonus}
                maxValue={4}
              />
              <div className="flex justify-between items-center pt-2 mt-2 border-t border-gray-200">
                <span className="text-xs font-semibold text-navy">
                  {t.scoring.baseTotal}
                </span>
                <span className="text-sm font-bold text-navy tabular-nums">
                  {breakdown.base} / 20
                </span>
              </div>
            </div>
          </section>

          <section>
            <h3 className="text-xs font-bold uppercase tracking-wide text-gray-400 mb-2">
              {t.scoring.phaseMultiplier}
            </h3>
            <div className="bg-gray-50 rounded-xl p-3 border border-gray-100 space-y-1.5">
              <div className="flex justify-between items-center gap-3">
                <span className="text-xs text-gray-600">
                  {t.scoring.winningOdds}
                </span>
                <span className="text-xs font-semibold text-navy tabular-nums">
                  × {formatOdds(breakdown.winningOdds)}
                </span>
              </div>
              <div className="flex justify-between items-center gap-3">
                <span className="text-xs text-gray-600">
                  {t.scoring.phaseMultiplier}
                </span>
                <span className="text-xs font-semibold text-navy tabular-nums">
                  × {breakdown.phaseMultiplier}
                </span>
              </div>
            </div>
          </section>

          <section>
            <div className="bg-navy rounded-xl p-4 text-white">
              <div className="text-[0.65rem] uppercase tracking-wide text-white/60 mb-1 font-semibold">
                {t.scoring.calculation}
              </div>
              <div className="text-sm font-mono mb-2 text-white/90">
                {breakdown.base} × {formatOdds(breakdown.winningOdds)} ×{' '}
                {breakdown.phaseMultiplier}
              </div>
              <div className="flex items-end gap-2">
                <span className="text-3xl font-extrabold tabular-nums">
                  {breakdown.total}
                </span>
                <span className="text-sm text-white/70 mb-1">
                  {t.common.points}
                </span>
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
