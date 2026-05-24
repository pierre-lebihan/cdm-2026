import { Scale, Shield, Target, UsersRound } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useAuth } from '../../../contexts/AuthContext'
import {
  estimatedPotentialGain,
  mergeBetsWithDraft,
  predictionPopularityKey,
  statsForPopularity,
  type BetLike,
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
  uid: string | null
  betTeamA: number | null
  betTeamB: number | null
  betPlayoffWinner: 'A' | 'B' | null
}

interface BettingFeelInput {
  bets: BetRow[] | null
  betFormat: MatchBetFormat
  tournamentPhase: MatchTournamentPhase
  betTeamA: number | null | undefined
  betTeamB: number | null | undefined
  betPlayoffWinner: 'A' | 'B' | null | undefined
}

interface BettingFeelData {
  merged: BetLike[]
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
): BettingFeelStatus {
  if (totalValid < 4) {
    return {
      kind: 'cold',
      message: 'Pas encore assez de pronos : la tendance va se préciser.',
    }
  }
  if (popularity > 0.5) {
    return {
      kind: 'safe',
      message: 'Choix sécu : gain potentiel plus modeste.',
    }
  }
  if (popularity < 0.28) {
    return {
      kind: 'risky',
      message: 'Coup de poker : le gain potentiel peut grimper fort.',
    }
  }
  return {
    kind: 'balanced',
    message: 'Prono équilibré : ni trop sage, ni trop exotique.',
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

export function useBettingFeelData({
  bets,
  betFormat,
  tournamentPhase,
  betTeamA,
  betTeamB,
  betPlayoffWinner,
}: BettingFeelInput): BettingFeelData {
  const { user } = useAuth()
  const uid = user?.id
  const betsRows = bets

  const draft: BetLike | null = useMemo(() => {
    if (!uid) {
      return null
    }
    return {
      userId: uid,
      betTeamA: betTeamA ?? null,
      betTeamB: betTeamB ?? null,
      betPlayoffWinner: betPlayoffWinner ?? null,
    }
  }, [uid, betTeamA, betTeamB, betPlayoffWinner])

  const draftKey = useMemo(() => {
    return predictionPopularityKey(
      betFormat,
      betTeamA ?? null,
      betTeamB ?? null,
      betPlayoffWinner ?? null,
    )
  }, [betFormat, betTeamA, betTeamB, betPlayoffWinner])

  const betLikes: BetLike[] = useMemo(() => {
    return (betsRows ?? []).map((b) => ({
      userId: b.uid,
      betTeamA: b.betTeamA,
      betTeamB: b.betTeamB,
      betPlayoffWinner: b.betPlayoffWinner,
    }))
  }, [betsRows])

  const merged = useMemo(() => {
    return mergeBetsWithDraft(betFormat, betLikes, uid, draft)
  }, [betFormat, betLikes, uid, draft])

  const { totalValid, sameCount, multiplier } = useMemo(() => {
    if (draftKey === null) {
      return { totalValid: 0, sameCount: 0, multiplier: 1 }
    }
    return statsForPopularity(betFormat, merged, draftKey)
  }, [betFormat, merged, draftKey])

  const popularity = totalValid > 0 ? sameCount / totalValid : 0
  const thermo = thermoStatus(popularity, totalValid)
  const phaseMultiplier = tournamentPhaseMultiplier(tournamentPhase)
  const gainMax = estimatedPotentialGain(
    MAX_BASE_POINTS,
    multiplier,
    phaseMultiplier,
  )
  const showLive = Boolean(uid && draftKey !== null)

  return {
    merged,
    showLive,
    gainMax,
    thermo: thermo.message,
    thermoKind: thermo.kind,
  }
}

export const BettingPotentialGain = ({ data }: BettingPotentialGainProps) => {
  const [feelOpen, setFeelOpen] = useState(false)

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
        title={`Gain potentiel estimé : jusqu'à ${data.gainMax} points`}
        className="flex h-[44px] min-w-[76px] flex-col items-center justify-center rounded-full bg-green-500 px-2.5 text-white shadow-md ring-2 ring-cream"
      >
        <span className="text-[0.56rem] font-semibold uppercase leading-none opacity-85">
          gain max
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
          aria-label="Afficher la tendance des pronostics"
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
      <BetDistributionBar bets={data.merged} betFormat={betFormat} />
    </div>
  )
}

export default BettingFeel
