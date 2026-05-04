import { useCallback, useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { useIsUserAdmin } from '../hooks/user'
import { useMatches, type NormalizedMatch } from '../hooks/matches'
import { useCompetition } from '../contexts/CompetitionContext'
import Flag from 'components/Flag'
import { formatTournamentPhaseLabel } from '../lib/matchEnums'

type MatchScoreEdit = {
  scoreA: string
  scoreB: string
}

function jsonNumberField(value: unknown, key: string): number {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) {
    return 0
  }

  const entries = Object.entries(value)
  for (let i = 0; i < entries.length; i += 1) {
    const entry = entries[i]
    if (entry[0] === key && typeof entry[1] === 'number') {
      return entry[1]
    }
  }

  return 0
}

function AdminMatchRow({
  match,
  onSave,
  onClear,
  onVisibilityChange,
}: {
  match: NormalizedMatch
  onSave: (matchId: string, scoreA: number, scoreB: number) => Promise<void>
  onClear: (matchId: string) => Promise<void>
  onVisibilityChange: (matchId: string, visible: boolean) => Promise<void>
}) {
  const [scores, setScores] = useState<MatchScoreEdit>({
    scoreA: match.scores.A?.toString() ?? '',
    scoreB: match.scores.B?.toString() ?? '',
  })
  const [saving, setSaving] = useState(false)
  const [clearing, setClearing] = useState(false)
  const [visibilityBusy, setVisibilityBusy] = useState(false)

  const hasScore = match.scores.A !== null && match.scores.B !== null

  const hasChanges =
    scores.scoreA !== (match.scores.A?.toString() ?? '') ||
    scores.scoreB !== (match.scores.B?.toString() ?? '')

  const isValid = scores.scoreA !== '' && scores.scoreB !== ''

  const handleSave = useCallback(async () => {
    if (!isValid || !hasChanges) return
    setSaving(true)
    await onSave(match.id, parseInt(scores.scoreA), parseInt(scores.scoreB))
    setSaving(false)
  }, [match.id, scores, isValid, hasChanges, onSave])

  const handleClear = useCallback(async () => {
    setClearing(true)
    await onClear(match.id)
    setClearing(false)
  }, [match.id, onClear])

  const handleVisibilityClick = useCallback(async () => {
    setVisibilityBusy(true)
    await onVisibilityChange(match.id, !match.visibleToUsers)
    setVisibilityBusy(false)
  }, [match.id, match.visibleToUsers, onVisibilityChange])

  return (
    <div
      className={`bg-white rounded-xl p-3 shadow-card flex flex-col gap-2 ${match.finished ? 'opacity-60' : ''}`}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Flag
            country={match.teamACode ?? ''}
            style={{ width: 24, height: 24 }}
          />
          <span className="text-sm font-medium text-navy">
            {match.teamAName ?? match.teamA}
          </span>
        </div>
        <span className="text-xs text-gray-400">vs</span>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-navy">
            {match.teamBName ?? match.teamB}
          </span>
          <Flag
            country={match.teamBCode ?? ''}
            style={{ width: 24, height: 24 }}
          />
        </div>
      </div>

      <div className="flex items-center justify-between gap-2 flex-wrap">
        <span className="text-xs text-gray-400">
          {formatPhaseAdmin(match)} — {match.groupName ?? ''}
        </span>
        <div className="flex items-center gap-2">
          {!match.visibleToUsers && (
            <span className="text-[0.65rem] font-semibold py-0.5 px-2 rounded-full bg-amber-100 text-amber-900">
              Masqué (joueurs)
            </span>
          )}
          {match.finished && (
            <span className="text-[0.65rem] font-semibold py-0.5 px-2 rounded-full bg-green-100 text-green-800">
              Terminé
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center">
        <button
          type="button"
          className={`text-xs font-semibold py-1.5 px-3 rounded-full border-none cursor-pointer transition-colors ${
            match.visibleToUsers
              ? 'bg-gray-100 text-navy hover:bg-gray-200'
              : 'bg-amber-200 text-amber-900 hover:bg-amber-300'
          }`}
          disabled={visibilityBusy}
          onClick={handleVisibilityClick}
        >
          {visibilityBusy ? '...' : match.visibleToUsers ? 'Masquer' : 'Rendre visible'}
        </button>
      </div>

      <div className="flex items-center gap-2">
        <input
          type="number"
          min="0"
          className="w-12 h-10 rounded-lg border-[1.5px] border-gray-200 text-center text-lg font-bold text-navy bg-gray-50 outline-none focus:border-indigo-500"
          value={scores.scoreA}
          onChange={(e) => setScores({ ...scores, scoreA: e.target.value })}
          placeholder="—"
        />
        <span className="text-gray-400">–</span>
        <input
          type="number"
          min="0"
          className="w-12 h-10 rounded-lg border-[1.5px] border-gray-200 text-center text-lg font-bold text-navy bg-gray-50 outline-none focus:border-indigo-500"
          value={scores.scoreB}
          onChange={(e) => setScores({ ...scores, scoreB: e.target.value })}
          placeholder="—"
        />

        <button
          className={`ml-auto text-xs font-semibold py-1.5 px-3 rounded-full border-none cursor-pointer transition-all ${
            hasChanges && isValid
              ? 'bg-navy text-white hover:bg-navy-light'
              : 'bg-gray-100 text-gray-400'
          }`}
          disabled={!hasChanges || !isValid || saving}
          onClick={handleSave}
        >
          {saving ? '...' : 'Sauver'}
        </button>

        {hasScore && (
          <button
            className="text-xs font-semibold py-1.5 px-3 rounded-full border border-red-200 text-red-500 bg-white cursor-pointer hover:bg-red-50 transition-colors"
            disabled={clearing}
            onClick={handleClear}
          >
            {clearing ? '...' : 'Vider'}
          </button>
        )}
      </div>
    </div>
  )
}

function formatPhaseAdmin(match: NormalizedMatch): string {
  const phaseLabel = formatTournamentPhaseLabel(match.tournamentPhase)
  const betLabel =
    match.betFormat === 'regulation_1x2'
      ? 'Pari 1 / N / 2 (90 min)'
      : 'Pari avec vainqueur si nul'
  return `${phaseLabel} · ${betLabel}`
}

const Admin = () => {
  const { user, profile, loading: authLoading } = useAuth()
  const isAdmin = useIsUserAdmin()
  const navigate = useNavigate()
  const [matchesRefreshKey, setMatchesRefreshKey] = useState(0)
  const matches = useMatches(matchesRefreshKey)
  const {
    competitions,
    activeCompetitionId,
    setActiveCompetitionId,
    competition: publicCompetition,
    setPublicCompetition,
  } = useCompetition()
  const [filter, setFilter] = useState<'all' | 'pending' | 'finished'>(
    'pending',
  )
  const [recalculating, setRecalculating] = useState(false)
  const [refreshingOdds, setRefreshingOdds] = useState(false)

  useEffect(() => {
    if (authLoading) return
    if (!user) {
      navigate('/')
      return
    }
    if (profile === null) return
    if (!isAdmin) {
      navigate('/')
    }
  }, [authLoading, user, profile, isAdmin, navigate])

  const bumpMatchesList = useCallback(() => {
    setMatchesRefreshKey((k) => k + 1)
  }, [])

  const handleSaveScore = useCallback(
    async (matchId: string, scoreA: number, scoreB: number) => {
      const { error } = await supabase
        .from('matches')
        .update({ score_a: scoreA, score_b: scoreB, finished: true })
        .eq('id', matchId)

      if (error) {
        toast.error(`Erreur: ${error.message}`)
        return
      }
      toast.success('Score mis à jour — points recalculés')
      bumpMatchesList()
    },
    [bumpMatchesList],
  )

  const handleClearScore = useCallback(
    async (matchId: string) => {
      const { error } = await supabase
        .from('matches')
        .update({ score_a: null, score_b: null, finished: false })
        .eq('id', matchId)

      if (error) {
        toast.error(`Erreur: ${error.message}`)
        return
      }
      toast.success('Score vidé')
      bumpMatchesList()
    },
    [bumpMatchesList],
  )

  const handleMatchVisibilityChange = useCallback(
    async (matchId: string, visible: boolean) => {
      const { error } = await supabase
        .from('matches')
        .update({ visible_to_users: visible })
        .eq('id', matchId)

      if (error) {
        toast.error(`Erreur: ${error.message}`)
        return
      }
      toast.success(
        visible
          ? 'Match visible pour les joueurs'
          : 'Match masqué pour les joueurs',
      )
      bumpMatchesList()
    },
    [bumpMatchesList],
  )

  const handleSetPublic = useCallback(
    async (id: string) => {
      await setPublicCompetition(id)
      toast.success('Compétition publique mise à jour')
    },
    [setPublicCompetition],
  )

  const handleRecalculateAllScores = useCallback(async () => {
    const confirmed = window.confirm(
      'ATTENTION : cela va remettre à zéro tous les scores puis recalculer TOUS les paris de TOUTES les compétitions avec la formule actuelle (base × cote × multiplicateur de phase).\n\nLes classements vont changer. Continuer ?',
    )
    if (!confirmed) return

    setRecalculating(true)
    const { data, error } = await supabase.rpc('admin_recalculate_all_scores')
    setRecalculating(false)

    if (error) {
      toast.error(`Erreur: ${error.message}`)
      return
    }

    const matchesProcessed = jsonNumberField(data, 'matches_processed')
    const betsProcessed = jsonNumberField(data, 'bets_processed')
    toast.success(
      `Recalcul terminé : ${matchesProcessed} match(s), ${betsProcessed} pari(s)`,
    )
    bumpMatchesList()
  }, [bumpMatchesList])

  const handleRecalculateAllOdds = useCallback(async () => {
    const confirmed = window.confirm(
      'Cela va recalculer les cotes (popularité) de tous les matchs non démarrés à partir des paris actuels.\n\nLes prochains paris mettront à jour ces cotes automatiquement. Continuer ?',
    )
    if (!confirmed) return

    setRefreshingOdds(true)
    const { data, error } = await supabase.rpc('admin_recalculate_all_odds')
    setRefreshingOdds(false)

    if (error) {
      toast.error(`Erreur: ${error.message}`)
      return
    }

    const refreshed = jsonNumberField(data, 'matches_refreshed')
    const winnerTeamsRefreshed = jsonNumberField(
      data,
      'winner_teams_refreshed',
    )
    toast.success(
      `Cotes recalculées : ${refreshed} match(s), ${winnerTeamsRefreshed} équipe(s)`,
    )
    bumpMatchesList()
  }, [bumpMatchesList])

  if (authLoading || (user !== null && profile === null)) {
    return (
      <div className="flex items-center justify-center min-h-[40vh] text-gray-400">
        Chargement...
      </div>
    )
  }

  if (!isAdmin) return null
  if (!matches) {
    return (
      <div className="flex items-center justify-center min-h-[40vh] text-gray-400">
        Chargement...
      </div>
    )
  }

  const filteredMatches = matches.filter((m) => {
    if (filter === 'pending') return !m.finished
    if (filter === 'finished') return m.finished
    return true
  })

  const groupedByPhase = filteredMatches.reduce<
    Record<string, NormalizedMatch[]>
  >((acc, match) => {
    const key = formatPhaseAdmin(match)
    if (!acc[key]) acc[key] = []
    acc[key].push(match)
    return acc
  }, {})

  return (
    <div className="max-w-[600px] mx-auto py-6 px-4 pb-12">
      <h1 className="text-xl font-extrabold text-navy mb-1">Administration</h1>
      <p className="text-sm text-gray-500 mb-5">
        Mettre à jour les scores déclenche le recalcul automatique des points.
        La visibilité par match contrôle l’affichage sur le site et la
        possibilité de pronostiquer (hors admin).
      </p>

      <div className="bg-white rounded-xl p-4 shadow-card mb-6 border border-red-100">
        <h2 className="text-sm font-bold text-navy mb-1">Outils de recalcul</h2>
        <p className="text-xs text-gray-500 mb-3">
          <span className="font-semibold">Scores</span> : remet à zéro tous les
          classements puis recalcule tous les paris avec la formule actuelle
          (base × cote × multiplicateur de phase).
          <br />
          <span className="font-semibold">Cotes</span> : recalcule les cotes
          de popularité de tous les matchs non démarrés et les cotes de
          vainqueur final.
        </p>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className={`text-xs font-semibold py-2 px-4 rounded-full border-none transition-colors ${
              recalculating
                ? 'bg-gray-200 text-gray-400 cursor-wait'
                : 'bg-red-500 text-white cursor-pointer hover:bg-red-600'
            }`}
            disabled={recalculating}
            onClick={handleRecalculateAllScores}
          >
            {recalculating ? 'Recalcul en cours...' : 'Recalculer tous les scores'}
          </button>
          <button
            type="button"
            className={`text-xs font-semibold py-2 px-4 rounded-full border-none transition-colors ${
              refreshingOdds
                ? 'bg-gray-200 text-gray-400 cursor-wait'
                : 'bg-indigo-500 text-white cursor-pointer hover:bg-indigo-600'
            }`}
            disabled={refreshingOdds}
            onClick={handleRecalculateAllOdds}
          >
            {refreshingOdds ? 'Recalcul des cotes...' : 'Recalculer les cotes'}
          </button>
        </div>
      </div>

      {/* Competition selector */}
      <div className="bg-white rounded-xl p-4 shadow-card mb-6">
        <h2 className="text-sm font-bold text-navy mb-3">Compétition</h2>

        <div className="flex flex-col gap-2">
          <label className="text-xs text-gray-500">
            Vue admin (ce que je vois) :
          </label>
          <select
            className="w-full py-2 px-3 border border-gray-200 rounded-lg text-sm bg-white outline-none focus:border-indigo-500"
            value={activeCompetitionId ?? ''}
            onChange={(e) => setActiveCompetitionId(e.target.value)}
          >
            {competitions.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} {c.active ? '(publique)' : ''}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-2 mt-3">
          <label className="text-xs text-gray-500">
            Compétition publique (vue par les utilisateurs) :
            <span className="font-semibold text-navy ml-1">
              {publicCompetition?.name ?? '—'}
            </span>
          </label>
          {activeCompetitionId &&
            activeCompetitionId !== publicCompetition?.id && (
              <button
                className="text-xs font-semibold py-1.5 px-4 rounded-full bg-indigo-500 text-white border-none cursor-pointer hover:bg-indigo-600 transition-colors self-start"
                onClick={() => handleSetPublic(activeCompetitionId)}
              >
                Rendre cette compétition publique
              </button>
            )}
        </div>
      </div>

      <div className="flex gap-1 justify-center mb-6">
        <button
          className={`py-2 px-6 rounded-full text-sm font-semibold border-[1.5px] cursor-pointer transition-all duration-200 ${filter === 'pending' ? 'text-white bg-navy border-navy' : 'text-gray-500 bg-transparent border-gray-200 hover:text-navy hover:border-navy'}`}
          onClick={() => setFilter('pending')}
        >
          À jouer ({matches.filter((m) => !m.finished).length})
        </button>
        <button
          className={`py-2 px-6 rounded-full text-sm font-semibold border-[1.5px] cursor-pointer transition-all duration-200 ${filter === 'finished' ? 'text-white bg-navy border-navy' : 'text-gray-500 bg-transparent border-gray-200 hover:text-navy hover:border-navy'}`}
          onClick={() => setFilter('finished')}
        >
          Terminés ({matches.filter((m) => m.finished).length})
        </button>
        <button
          className={`py-2 px-6 rounded-full text-sm font-semibold border-[1.5px] cursor-pointer transition-all duration-200 ${filter === 'all' ? 'text-white bg-navy border-navy' : 'text-gray-500 bg-transparent border-gray-200 hover:text-navy hover:border-navy'}`}
          onClick={() => setFilter('all')}
        >
          Tous ({matches.length})
        </button>
      </div>

      {Object.entries(groupedByPhase).map(([phase, phaseMatches]) => (
        <div key={phase} className="mb-6">
          <h2 className="text-base font-bold text-navy mb-3">{phase}</h2>
          <div className="flex flex-col gap-2">
            {phaseMatches.map((match) => (
              <AdminMatchRow
                key={match.id}
                match={match}
                onSave={handleSaveScore}
                onClear={handleClearScore}
                onVisibilityChange={handleMatchVisibilityChange}
              />
            ))}
          </div>
        </div>
      ))}

      {filteredMatches.length === 0 && (
        <p className="text-center text-gray-400 py-10">
          Aucun match dans cette catégorie.
        </p>
      )}
    </div>
  )
}

export default Admin
