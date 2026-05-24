import { X } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useIsUserAdmin } from '../../../hooks/user'
import Mascot from '../../../components/Mascot'

interface ScoringHelpModalProps {
  open: boolean
  onClose: () => void
}

const ScoringHelpModal = ({ open, onClose }: ScoringHelpModalProps) => {
  const isAdmin = useIsUserAdmin()

  if (!open) {
    return null
  }

  return (
    <div
      className="fixed inset-0 z-[1200] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-navy/40 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="scoring-help-title"
      onClick={onClose}
    >
      <div
        className="w-full sm:max-w-md bg-white rounded-t-2xl sm:rounded-2xl shadow-card p-5 pb-8 sm:pb-5 max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-start gap-3 mb-4">
          <div className="flex items-center gap-3">
            <Mascot id="mexico" size="sm" className="ring-2 ring-emerald-100 shadow-sm" />
            <h2 id="scoring-help-title" className="text-lg font-extrabold text-navy m-0">
              Comment sont calculés les points ?
            </h2>
          </div>
          <button
            type="button"
            className="p-1.5 rounded-full text-gray-400 hover:bg-gray-100 hover:text-navy shrink-0"
            aria-label="Fermer"
            onClick={onClose}
          >
            <X size={20} />
          </button>
        </div>
        <p className="text-xs italic text-emerald-700 mb-3">
          « Diego t'explique : sois précis, mais aussi malin ! »
        </p>
        <div className="text-sm text-gray-600 space-y-4 leading-relaxed">
          <p className="m-0">
            <span className="font-semibold text-navy">La précision.</span> Sur chaque match, tu peux marquer jusqu’à
            une vingtaine de points de base si ton pronostic colle bien au réel : bon vainqueur ou bon nul, score
            proche, petits bonus si tu es tout proche ou pile juste.
          </p>
          <p className="m-0">
            <span className="font-semibold text-navy">Le multiplicateur dynamique.</span> Ensuite, ces points sont
            amplifiés par une cote « anti-mouton » : si ton choix est très majoritaire chez les joueurs, la cote
            reste modeste ; si tu es dans le camp des originaux, la cote peut monter fort — toujours dans une
            fourchette raisonnable pour que le jeu reste équilibré.
          </p>
          <p className="m-0 text-xs text-gray-500">
            Tout le détail des barèmes et la formule officielle :{' '}
            <Link to="/rules/algorithm" className="text-indigo-600 font-medium hover:underline" onClick={onClose}>
              règlement détaillé et algorithme
            </Link>
            .
          </p>
          {isAdmin && (
            <p className="m-0 text-xs text-amber-950 bg-amber-50 rounded-xl p-3 border border-amber-100/80 leading-relaxed">
              <span className="font-semibold text-navy">Admin.</span> Tu peux rendre un match visible ou le masquer
              (liste des matchs et pronostics des joueurs) depuis{' '}
              <Link to="/admin" className="text-indigo-600 font-medium hover:underline" onClick={onClose}>
                Administration
              </Link>
              , pour chaque rencontre.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

export default ScoringHelpModal
