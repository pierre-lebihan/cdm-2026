import { useMemo, useState, type FocusEvent, type MouseEvent } from 'react'
import {
  dynamicMultiplier,
  emptyBetDistribution,
  predictionPopularityKey,
  type BetDistributionCounts,
} from '../../../lib/bettingOdds'
import { formatOdds } from '../../../lib/scoring'
import type { MatchBetFormat } from '../../../lib/matchEnums'
import { useLanguage } from '../../../contexts/LanguageContext'

interface BetItem {
  betTeamA: number | null
  betTeamB: number | null
  betPlayoffWinner: 'A' | 'B' | null
  userId?: string | null
}

interface BetDistributionBarProps {
  bets?: BetItem[] | null
  distribution?: BetDistributionCounts | null
  betFormat: MatchBetFormat
}

interface SegmentData {
  key: string
  color: string
  count: number
  pct: number
  odd: number | null
}

interface SegmentViewData extends SegmentData {
  compactLabel: string
  detailsLabel: string
  flex: number
  showCompactLabel: boolean
}

function computeDistribution(
  bets: BetItem[],
  betFormat: MatchBetFormat,
): BetDistributionCounts {
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
  dist: BetDistributionCounts,
  betFormat: MatchBetFormat,
): SegmentData[] {
  const isKnockout = betFormat === 'knockout_decider'
  const oddA = dynamicMultiplier(dist.total, dist.countA)
  const oddN = dynamicMultiplier(dist.total, dist.countN)
  const oddB = dynamicMultiplier(dist.total, dist.countB)
  const all = [
    { key: '1', color: 'bg-emerald-500', count: dist.countA, odd: oddA },
    ...(isKnockout
      ? []
      : [{ key: 'N', color: 'bg-slate-400', count: dist.countN, odd: oddN }]),
    { key: '2', color: 'bg-orange-400', count: dist.countB, odd: oddB },
  ]
  return all
    .filter((s) => s.count > 0)
    .map((s) => ({
      ...s,
      pct: s.count / dist.total,
    }))
}

const MIN_FLEX = 0.1
const MIN_PERCENT_LABEL_FLEX = 0.08
const MIN_ODDS_LABEL_FLEX = 0.16

function segmentName(key: string): string {
  if (key === '1') {
    return '1'
  }
  if (key === 'N') {
    return 'N'
  }
  return '2'
}

function pluralProno(count: number): string {
  if (count > 1) {
    return 'pronos'
  }
  return 'prono'
}

function compactLabel(
  seg: SegmentData,
  total: number,
  showOdds: boolean,
): string {
  if (showOdds) {
    return `×${formatOdds(seg.odd)}`
  }
  return pctLabel(seg.count, total)
}

function detailsLabel(seg: SegmentData, total: number): string {
  return `${segmentName(seg.key)} : ${pctLabel(seg.count, total)} · cote ×${formatOdds(seg.odd)} · ${seg.count} ${pluralProno(seg.count)}`
}

function canShowCompactLabel(displayFlex: number, showOdds: boolean): boolean {
  if (showOdds) {
    return displayFlex >= MIN_ODDS_LABEL_FLEX
  }
  return displayFlex >= MIN_PERCENT_LABEL_FLEX
}

function buildSegmentViews(
  segments: SegmentData[],
  total: number,
  showOdds: boolean,
): SegmentViewData[] {
  const views: SegmentViewData[] = []

  for (const seg of segments) {
    const flex = Math.max(seg.pct, MIN_FLEX)
    views.push({
      ...seg,
      compactLabel: compactLabel(seg, total, showOdds),
      detailsLabel: detailsLabel(seg, total),
      flex,
      showCompactLabel: canShowCompactLabel(flex, showOdds),
    })
  }

  return views
}

function findSegmentView(
  segments: SegmentViewData[],
  key: string | null,
): SegmentViewData | null {
  if (key === null) {
    return null
  }

  for (const seg of segments) {
    if (seg.key === key) {
      return seg
    }
  }

  return null
}

function segmentKeyFromEvent(
  event: MouseEvent<HTMLButtonElement> | FocusEvent<HTMLButtonElement>,
): string | null {
  return event.currentTarget.dataset.segmentKey ?? null
}

const BetDistributionBar = ({
  bets,
  distribution,
  betFormat,
}: BetDistributionBarProps) => {
  const [showOdds, setShowOdds] = useState(false)
  const [hoveredSegmentKey, setHoveredSegmentKey] = useState<string | null>(
    null,
  )
  const [pinnedSegmentKey, setPinnedSegmentKey] = useState<string | null>(null)
  const { t } = useLanguage()

  const dist = useMemo(() => {
    if (distribution) {
      return distribution
    }

    if (!bets) {
      return emptyBetDistribution()
    }

    return computeDistribution(bets, betFormat)
  }, [bets, distribution, betFormat])

  const segments = useMemo(() => {
    if (dist.total === 0) {
      return []
    }
    return buildSegments(dist, betFormat)
  }, [dist, betFormat])

  const segmentViews = useMemo(() => {
    return buildSegmentViews(segments, dist.total, showOdds)
  }, [segments, dist.total, showOdds])

  if (segmentViews.length === 0) {
    return null
  }

  const handleToggle = (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation()
    setShowOdds((prev) => !prev)
  }

  const handleSegmentMouseEnter = (event: MouseEvent<HTMLButtonElement>) => {
    setHoveredSegmentKey(segmentKeyFromEvent(event))
  }

  const handleSegmentMouseLeave = () => {
    setHoveredSegmentKey(null)
  }

  const handleSegmentFocus = (event: FocusEvent<HTMLButtonElement>) => {
    setHoveredSegmentKey(segmentKeyFromEvent(event))
  }

  const handleSegmentBlur = () => {
    setHoveredSegmentKey(null)
  }

  const handleSegmentClick = (event: MouseEvent<HTMLButtonElement>) => {
    const key = segmentKeyFromEvent(event)

    event.stopPropagation()
    setPinnedSegmentKey((currentKey) => {
      if (currentKey === key) {
        return null
      }
      return key
    })
  }

  const activeSegment = findSegmentView(
    segmentViews,
    pinnedSegmentKey ?? hoveredSegmentKey,
  )

  return (
    <div className="w-full space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-[0.625rem] text-gray-400 font-medium uppercase tracking-wide">
          {t.betting.distributionTitle}
        </span>
        <button
          type="button"
          className="flex items-center gap-0 text-[0.6rem] font-semibold rounded-full overflow-hidden border border-gray-200"
          onClick={handleToggle}
        >
          <span
            className={`px-2 py-0.5 transition-colors ${!showOdds ? 'bg-navy text-white' : 'bg-white text-gray-400'}`}
          >
            %
          </span>
          <span
            className={`px-2 py-0.5 transition-colors ${showOdds ? 'bg-navy text-white' : 'bg-white text-gray-400'}`}
          >
            {t.betting.odds}
          </span>
        </button>
      </div>
      <div className="relative">
        <div className="flex w-full h-7 rounded-lg overflow-hidden gap-[1.5px]">
          {segmentViews.map((seg) => (
            <button
              key={seg.key}
              type="button"
              data-segment-key={seg.key}
              className={`${seg.color} flex min-w-0 appearance-none items-center justify-center border-0 p-0 transition-all duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-white`}
              style={{ flex: seg.flex }}
              title={seg.detailsLabel}
              aria-label={seg.detailsLabel}
              aria-pressed={pinnedSegmentKey === seg.key}
              onClick={handleSegmentClick}
              onMouseEnter={handleSegmentMouseEnter}
              onMouseLeave={handleSegmentMouseLeave}
              onFocus={handleSegmentFocus}
              onBlur={handleSegmentBlur}
            >
              {seg.showCompactLabel && (
                <span className="min-w-0 px-1 text-[11px] font-bold text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.15)]">
                  {seg.compactLabel}
                </span>
              )}
            </button>
          ))}
        </div>
        {activeSegment && (
          <div className="absolute left-1/2 top-full z-20 mt-1 w-max max-w-[min(18rem,calc(100vw-2rem))] -translate-x-1/2 rounded-lg border border-gray-100 bg-white px-2.5 py-1 text-[11px] font-semibold text-navy shadow-card">
            {activeSegment.detailsLabel}
          </div>
        )}
      </div>
    </div>
  )
}

export default BetDistributionBar
