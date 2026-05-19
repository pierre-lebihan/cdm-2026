import { useState, useMemo } from 'react'
import { useBetsFromGame } from '../../../hooks/bets'
import { predictionPopularityKey } from '../../../lib/bettingOdds'
import { formatOdds } from '../../../lib/scoring'
import type { MatchBetFormat } from '../../../lib/matchEnums'

interface BetDistributionBarProps {
  matchId: string
  betFormat: MatchBetFormat
  odds: { PA: number | null; PB: number | null; PN: number | null }
}

interface BetItem {
  betTeamA: number | null
  betTeamB: number | null
  betPlayoffWinner: 'A' | 'B' | null
}

interface SegmentData {
  key: string
  color: string
  count: number
  pct: number
  odd: number | null
}

function computeDistribution(
  bets: BetItem[],
  betFormat: MatchBetFormat,
): { countA: number; countN: number; countB: number; total: number } {
  let countA = 0
  let countN = 0
  let countB = 0
  for (const bet of bets) {
    const key = predictionPopularityKey(
      betFormat,
      bet.betTeamA,
      bet.betTeamB,
      bet.betPlayoffWinner,
    )
    if (key === 'G_A' || key === 'P_A') {
      countA += 1
    } else if (key === 'G_N') {
      countN += 1
    } else if (key === 'G_B' || key === 'P_B') {
      countB += 1
    }
  }
  return { countA, countN, countB, total: countA + countN + countB }
}

function pctLabel(count: number, total: number): string {
  if (total === 0) {
    return '0%'
  }
  return `${Math.round((count / total) * 100)}%`
}

function buildSegments(
  dist: { countA: number; countN: number; countB: number; total: number },
  betFormat: MatchBetFormat,
  odds: { PA: number | null; PB: number | null; PN: number | null },
): SegmentData[] {
  const isKnockout = betFormat === 'knockout_decider'
  const all = [
    { key: '1', color: 'bg-emerald-500', count: dist.countA, odd: odds.PA },
    ...(isKnockout
      ? []
      : [{ key: 'N', color: 'bg-slate-400', count: dist.countN, odd: odds.PN }]),
    { key: '2', color: 'bg-orange-400', count: dist.countB, odd: odds.PB },
  ]
  return all
    .filter((s) => s.count > 0)
    .map((s) => ({
      ...s,
      pct: s.count / dist.total,
    }))
}

const MIN_FLEX = 0.08

const BetDistributionBar = ({
  matchId,
  betFormat,
  odds,
}: BetDistributionBarProps) => {
  const bets = useBetsFromGame(matchId, true)
  const [showOdds, setShowOdds] = useState(false)

  const dist = useMemo(() => {
    if (!bets) {
      return { countA: 0, countN: 0, countB: 0, total: 0 }
    }
    return computeDistribution(bets, betFormat)
  }, [bets, betFormat])

  const segments = useMemo(() => {
    if (dist.total === 0) {
      return []
    }
    return buildSegments(dist, betFormat, odds)
  }, [dist, betFormat, odds])

  if (!bets || segments.length === 0) {
    return null
  }

  return (
    <div
      className="w-full"
      onClick={(e) => {
        e.stopPropagation()
        setShowOdds((prev) => !prev)
      }}
      role="button"
    >
      <div className="flex w-full h-7 rounded-lg overflow-hidden gap-[1.5px]">
        {segments.map((seg) => (
          <div
            key={seg.key}
            className={`${seg.color} flex items-center justify-center transition-all duration-300`}
            style={{ flex: Math.max(seg.pct, MIN_FLEX) }}
          >
            {seg.pct >= 0.12 && (
              <span className="text-[11px] font-bold text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.15)]">
                {showOdds
                  ? `x${formatOdds(seg.odd)}`
                  : pctLabel(seg.count, dist.total)}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default BetDistributionBar
