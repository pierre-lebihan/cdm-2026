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
  label: string
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
    {
      key: '1',
      label: '1',
      color: 'bg-emerald-500',
      count: dist.countA,
      odd: odds.PA,
    },
    ...(isKnockout
      ? []
      : [
          {
            key: 'N',
            label: 'N',
            color: 'bg-gray-400',
            count: dist.countN,
            odd: odds.PN,
          },
        ]),
    {
      key: '2',
      label: '2',
      color: 'bg-orange-500',
      count: dist.countB,
      odd: odds.PB,
    },
  ]
  return all
    .filter((s) => s.count > 0)
    .map((s) => ({
      ...s,
      pct: s.count / dist.total,
    }))
}

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
      className="w-full pt-2"
      onClick={(e) => {
        e.stopPropagation()
        setShowOdds((prev) => !prev)
      }}
      role="button"
    >
      <div className="flex w-full h-2.5 rounded-full overflow-hidden gap-[2px]">
        {segments.map((seg) => (
          <div
            key={seg.key}
            className={`${seg.color} transition-all duration-300 first:rounded-l-full last:rounded-r-full`}
            style={{ flex: Math.max(seg.pct, 0.06) }}
          />
        ))}
      </div>
      <div className="flex w-full mt-1">
        {segments.map((seg) => (
          <div
            key={seg.key}
            className="text-center"
            style={{ flex: Math.max(seg.pct, 0.06) }}
          >
            <span className="text-[10px] font-semibold text-gray-500">
              {showOdds
                ? `${seg.label} · x${formatOdds(seg.odd)}`
                : `${seg.label} · ${pctLabel(seg.count, dist.total)}`}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default BetDistributionBar
