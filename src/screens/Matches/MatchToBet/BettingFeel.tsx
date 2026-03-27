import { HelpCircle } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useAuth } from '../../../contexts/AuthContext'
import { useBetsFromGame } from '../../../hooks/bets'
import {
  estimatedGainRange,
  formatMultiplierLabel,
  mergeBetsWithDraft,
  predictionPopularityKey,
  statsForPopularity,
  type BetLike,
} from '../../../lib/bettingOdds'
import ScoringHelpModal from './ScoringHelpModal'

const MAX_BASE_POINTS = 20

interface BettingFeelProps {
  matchId: string
  phase: string | null
  betTeamA: number | null | undefined
  betTeamB: number | null | undefined
  betPlayoffWinner: 'A' | 'B' | null | undefined
}

function thermoMessage(popularity: number, totalValid: number): string | null {
  if (totalValid < 4) {
    return 'Encore peu de monde a parié ici : la tendance se précise bientôt.'
  }
  if (popularity > 0.5) {
    return '🛡️ Choix sécu (gain potentiel plus modeste)'
  }
  if (popularity < 0.28) {
    return '🎯 Coup de poker (gain potentiel qui peut exploser !)'
  }
  return '⚖️ Prono équilibré : ni trop sage, ni trop exotique'
}

const BettingFeel = ({
  matchId,
  phase,
  betTeamA,
  betTeamB,
  betPlayoffWinner,
}: BettingFeelProps) => {
  const { user } = useAuth()
  const [helpOpen, setHelpOpen] = useState(false)
  const uid = user?.id
  const betsRows = useBetsFromGame(matchId, Boolean(uid))

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
    return predictionPopularityKey(phase, betTeamA ?? null, betTeamB ?? null, betPlayoffWinner ?? null)
  }, [phase, betTeamA, betTeamB, betPlayoffWinner])

  const betLikes: BetLike[] = useMemo(() => {
    return (betsRows ?? []).map((b) => ({
      userId: b.uid,
      betTeamA: b.betTeamA,
      betTeamB: b.betTeamB,
      betPlayoffWinner: b.betPlayoffWinner,
    }))
  }, [betsRows])

  const merged = useMemo(() => {
    return mergeBetsWithDraft(phase, betLikes, uid, draft)
  }, [phase, betLikes, uid, draft])

  const { totalValid, sameCount, multiplier } = useMemo(() => {
    if (draftKey === null) {
      return { totalValid: 0, sameCount: 0, multiplier: 1 }
    }
    return statsForPopularity(phase, merged, draftKey)
  }, [phase, merged, draftKey])

  const popularity = totalValid > 0 ? sameCount / totalValid : 0
  const thermo = thermoMessage(popularity, totalValid)
  const gain = estimatedGainRange(MAX_BASE_POINTS, multiplier)

  const showLive = uid && draftKey !== null
  const badgeText = showLive ? formatMultiplierLabel(multiplier) : null

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-2 pt-0.5 border-t border-gray-100">
        <div className="flex flex-wrap items-center gap-2 min-w-0">
          {showLive && badgeText && (
            <span className="inline-flex items-center rounded-full bg-navy/[0.06] px-2.5 py-1 text-[11px] font-bold text-navy tabular-nums">
              Cote actuelle : {badgeText}
            </span>
          )}
          <button
            type="button"
            className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-600 hover:text-indigo-800"
            onClick={() => setHelpOpen(true)}
            aria-label="Aide sur le calcul des points"
          >
            <HelpCircle size={14} className="shrink-0" />
            <span>Comment les points sont calculés ?</span>
          </button>
        </div>
      </div>
      {showLive && thermo && (
        <p className="text-[11px] text-gray-500 m-0 leading-snug">{thermo}</p>
      )}
      {showLive && (
        <p className="text-[11px] text-indigo-700/90 font-medium m-0 leading-snug">
          Gain potentiel estimé : entre {gain.min} et {gain.max} pts
        </p>
      )}
      <ScoringHelpModal open={helpOpen} onClose={() => setHelpOpen(false)} />
    </>
  )
}

export default BettingFeel
