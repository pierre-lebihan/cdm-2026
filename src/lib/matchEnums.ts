export type MatchTournamentPhase =
  | 'group'
  | 'round_of_16'
  | 'round_of_8'
  | 'quarter_final'
  | 'semi_final'
  | 'third_place'
  | 'final'

export type MatchBetFormat = 'regulation_1x2' | 'knockout_decider'

export type MatchStatus = 'PLANNED' | 'ONGOING' | 'FINISHED'

type PhaseStyle = {
  label: string
  color: string
  multiplier: number
}

const tournamentPhaseStyles: Record<MatchTournamentPhase, PhaseStyle> = {
  group: { label: '', color: '#6366f1', multiplier: 0.75 },
  round_of_16: { label: '16es de finale', color: '#8b5cf6', multiplier: 1 },
  round_of_8: { label: '8es de finale', color: '#a855f7', multiplier: 1.5 },
  quarter_final: { label: 'Quarts de finale', color: '#d946ef', multiplier: 3 },
  semi_final: { label: 'Demi-finales', color: '#ec4899', multiplier: 6 },
  third_place: { label: '3e place', color: '#f43f5e', multiplier: 8 },
  final: { label: 'Finale', color: '#eab308', multiplier: 12 },
}

export function getTournamentPhaseStyle(
  phase: MatchTournamentPhase,
): PhaseStyle {
  return tournamentPhaseStyles[phase]
}

export function formatTournamentPhaseLabel(
  phase: MatchTournamentPhase,
): string {
  if (phase === 'group') {
    return 'Groupes'
  }
  return tournamentPhaseStyles[phase].label
}

export function tournamentPhaseMultiplier(phase: MatchTournamentPhase): number {
  return tournamentPhaseStyles[phase].multiplier
}

export function normalizeMatchStatus(
  value: string | null | undefined,
): MatchStatus {
  if (value === 'ONGOING') {
    return 'ONGOING'
  }

  if (value === 'FINISHED') {
    return 'FINISHED'
  }

  return 'PLANNED'
}
