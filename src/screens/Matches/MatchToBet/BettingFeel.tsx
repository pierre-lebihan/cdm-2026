import { Scale, Shield, Target, UsersRound } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useAuth } from '../../../contexts/AuthContext'
import { useLanguage } from '../../../contexts/LanguageContext'
import {
  dynamicMultiplier,
  emptyBetDistribution,
  estimatedPotentialGain,
  predictionPopularityKey,
  type BetDistributionCounts,
} from '../../../lib/bettingOdds'
import {
  tournamentPhaseMultiplier,
  type MatchBetFormat,
  type MatchTournamentPhase,
} from '../../../lib/matchEnums'
import BetDistributionBar from '../MatchBegun/BetDistributionBar'

const MAX_BASE_POINTS = 20

type BettingFeelKind = 'cold' | 'safe' | 'risky' | 'balanced'

interface BettingFeelStatus {
  kind: BettingFeelKind
  message: string
}

interface BetRow {
  betTeamA: number | null
  betTeamB: number | null
  betPlayoffWinner: 'A' | 'B' | null
}

interface BettingFeelInput {
  distribution: BetDistributionCounts | null
  savedBet: BetRow | null | undefined
  betFormat: MatchBetFormat
  tournamentPhase: MatchTournamentPhase
  betTeamA: number | null | undefined
  betTeamB: number | null | undefined
  betPlayoffWinner: 'A' | 'B' | null | undefined
}

interface BettingFeelData {
  distribution: BetDistributionCounts
  showLive: boolean
  gainMax: number
  thermo: string | null
  thermoKind: BettingFeelKind | null
}

interface BettingFeelProps {
  betFormat: MatchBetFormat
  data: BettingFeelData
}

interface BettingPotentialGainProps {
  data: BettingFeelData
}

function thermoStatus(
  popularity: number,
  totalValid: number,
  t: ReturnType<typeof useLanguage>['t'],
): BettingFeelStatus {
  if (totalValid < 4) {
    return {
      kind: 'cold',
      message: t.betting.thermoCold,
    }
  }
  if (popularity > 0.5) {
    return {
      kind: 'safe',
      message: t.betting.thermoSafe,
    }
  }
  if (popularity < 0.28) {
    return {
      kind: 'risky',
      message: t.betting.thermoRisky,
    }
  }
  return {
    kind: 'balanced',
    message: t.betting.thermoBalanced,
  }
}

function iconForThermoKind(kind: BettingFeelKind | null) {
  if (kind === 'safe') {
    return Shield
  }
  if (kind === 'risky') {
    return Target
  }
  if (kind === 'balanced') {
    return Scale
  }
  return UsersRound
}

function bucketForPopularityKey(key: string | null): 'A' | 'N' | 'B' | null {
  if (key === 'G_A' || key === 'P_A') {
    return 'A'
  }

  if (key === 'G_N') {
    return 'N'
  }

  if (key === 'G_B' || key === 'P_B') {
    return 'B'
  }

  return null
}

function decrementBucket(
  distribution: BetDistributionCounts,
  bucket: 'A' | 'N' | 'B' | null,
): void {
  if (bucket === 'A' && distribution.countA > 0) {
    distribution.countA -= 1
  }

  if (bucket === 'N' && distribution.countN > 0) {
    distribution.countN -= 1
  }

  if (bucket === 'B' && distribution.countB > 0) {
    distribution.countB -= 1
  }
}

function incrementBucket(
  distribution: BetDistributionCounts,
  bucket: 'A' | 'N' | 'B' | null,
): void {
  if (bucket === 'A') {
    distribution.countA += 1
  }

  if (bucket === 'N') {
    distribution.countN += 1
  }

  if (bucket === 'B') {
    distribution.countB += 1
  }
}

function adjustedDistributionForDraft(
  distribution: BetDistributionCounts,
  savedKey: string | null,
  draftKey: string | null,
): BetDistributionCounts {
  const next = {
    ...distribution,
  }

  if (draftKey === null) {
    return next
  }

  if (draftKey !== savedKey) {
    decrementBucket(next, bucketForPopularityKey(savedKey))
    incrementBucket(next, bucketForPopularityKey(draftKey))
  }

  next.total = next.countA + next.countN + next.countB

  return next
}

function sameCountForPopularityKey(
  distribution: BetDistributionCounts,
  key: string | null,
): number {
  const bucket = bucketForPopularityKey(key)

  if (bucket === 'A') {
    return distribution.countA
  }

  if (bucket === 'N') {
    return distribution.countN
  }

  if (bucket === 'B') {
    return distribution.countB
  }

  return 0
}

export function useBettingFeelData({
  distribution,
  savedBet,
  betFormat,
  tournamentPhase,
  betTeamA,
  betTeamB,
  betPlayoffWinner,
}: BettingFeelInput): BettingFeelData {
  const { user } = useAuth()
  const { t } = useLanguage()
  const uid = user?.id

  const draftKey = useMemo(() => {
    return predictionPopularityKey(
      betFormat,
      betTeamA ?? null,
      betTeamB ?? null,
      betPlayoffWinner ?? null,
    )
  }, [betFormat, betTeamA, betTeamB, betPlayoffWinner])

  const savedKey = useMemo(() => {
    if (!savedBet) {
      return null
    }

    return predictionPopularityKey(
      betFormat,
      savedBet.betTeamA,
      savedBet.betTeamB,
      savedBet.betPlayoffWinner,
    )
  }, [betFormat, savedBet])

  const liveDistribution = useMemo(() => {
    const baseDistribution = distribution ?? emptyBetDistribution()
    return adjustedDistributionForDraft(baseDistribution, savedKey, draftKey)
  }, [distribution, savedKey, draftKey])

  const { totalValid, sameCount, multiplier } = useMemo(() => {
    if (draftKey === null) {
      return { totalValid: 0, sameCount: 0, multiplier: 1 }
    }
    const count = sameCountForPopularityKey(liveDistribution, draftKey)
    return {
      totalValid: liveDistribution.total,
      sameCount: count,
      multiplier: dynamicMultiplier(liveDistribution.total, count),
    }
  }, [liveDistribution, draftKey])

  const popularity = totalValid > 0 ? sameCount / totalValid : 0
  const thermo = thermoStatus(popularity, totalValid, t)
  const phaseMultiplier = tournamentPhaseMultiplier(tournamentPhase)
  const gainMax = estimatedPotentialGain(
    MAX_BASE_POINTS,
    multiplier,
    phaseMultiplier,
  )
  const showLive = Boolean(uid && draftKey !== null)

  return {
    distribution: liveDistribution,
    showLive,
    gainMax,
    thermo: thermo.message,
    thermoKind: thermo.kind,
  }
}

export const BettingPotentialGain = ({ data }: BettingPotentialGainProps) => {
  const [feelOpen, setFeelOpen] = useState(false)
  const { t } = useLanguage()

  const handleToggleFeel = () => {
    setFeelOpen(!feelOpen)
  }

  if (!data.showLive || data.gainMax <= 0) {
    return null
  }

  const ThermoIcon = iconForThermoKind(data.thermoKind)

  return (
    <div className="relative flex min-h-[44px] items-start justify-center gap-1.5">
      <div
        title={`${t.betting.titlePotentialGain} ${data.gainMax} ${t.common.points}`}
        className="flex h-[44px] min-w-[76px] flex-col items-center justify-center rounded-full bg-green-500 px-2.5 text-white shadow-md ring-2 ring-cream"
      >
        <span className="text-[0.56rem] font-semibold uppercase leading-none opacity-85">
          {t.betting.gainMax}
        </span>
        <span className="mt-0.5 text-base font-extrabold leading-none tabular-nums whitespace-nowrap">
          +{data.gainMax}
        </span>
      </div>
      {data.thermo && (
        <button
          type="button"
          className="mt-1 flex h-6 w-6 items-center justify-center rounded-full bg-navy/[0.06] text-navy transition-colors hover:bg-navy hover:text-white"
          onClick={handleToggleFeel}
          aria-label={t.betting.showTrend}
          aria-expanded={feelOpen}
        >
          <ThermoIcon size={14} />
        </button>
      )}
      {feelOpen && data.thermo && (
        <div className="absolute left-1/2 top-full z-20 mt-1 w-44 -translate-x-1/2 rounded-xl border border-gray-100 bg-white p-2 text-center text-[11px] font-medium leading-snug text-gray-600 shadow-card">
          {data.thermo}
        </div>
      )}
    </div>
  )
}

const BettingFeel = ({ betFormat, data }: BettingFeelProps) => {
  return (
    <div className="space-y-2 pt-0.5 border-t border-gray-100">
      <BetDistributionBar
        distribution={data.distribution}
        betFormat={betFormat}
      />
    </div>
  )
}

export default BettingFeel
