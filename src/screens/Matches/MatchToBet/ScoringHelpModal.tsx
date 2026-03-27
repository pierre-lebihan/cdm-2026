import { X } from 'lucide-react'
import { Link } from 'react-router-dom'

interface ScoringHelpModalProps {
  open: boolean
  onClose: () => void
}

const ScoringHelpModal = ({ open, onClose }: ScoringHelpModalProps) => {
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
          <h2 id="scoring-help-title" className="text-lg font-extrabold text-navy m-0 pr-2">
            Comment sont calculés les points ?
          </h2>
          <button
            type="button"
            className="p-1.5 rounded-full text-gray-400 hover:bg-gray-100 hover:text-navy shrink-0"
            aria-label="Fermer"
            onClick={onClose}
          >
            <X size={20} />
          </button>
        </div>
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
        </div>
      </div>
    </div>
  )
}

export default ScoringHelpModal
