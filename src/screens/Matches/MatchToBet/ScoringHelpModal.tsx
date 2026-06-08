import { X } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useIsUserAdmin } from '../../../hooks/user'
import { useHideCrisp } from '../../../hooks/useHideCrisp'
import Mascot from '../../../components/Mascot'
import { useLanguage } from '../../../contexts/LanguageContext'

interface ScoringHelpModalProps {
  open: boolean
  onClose: () => void
}

const ScoringHelpModal = ({ open, onClose }: ScoringHelpModalProps) => {
  const isAdmin = useIsUserAdmin()
  const { t } = useLanguage()
  useHideCrisp(open)

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
            <Mascot
              id="mexico"
              size="sm"
              className="ring-2 ring-emerald-100 shadow-sm"
            />
            <h2
              id="scoring-help-title"
              className="text-lg font-extrabold text-navy m-0"
            >
              {t.scoring.title}
            </h2>
          </div>
          <button
            type="button"
            className="p-1.5 rounded-full text-gray-400 hover:bg-gray-100 hover:text-navy shrink-0"
            aria-label={t.common.close}
            onClick={onClose}
          >
            <X size={20} />
          </button>
        </div>
        <p className="text-xs italic text-emerald-700 mb-3">
          {t.scoring.intro}
        </p>
        <div className="text-sm text-gray-600 space-y-4 leading-relaxed">
          <p className="m-0">
            <span className="font-semibold text-navy">
              {t.scoring.precisionTitle}
            </span>{' '}
            {t.scoring.precisionText}
          </p>
          <p className="m-0">
            <span className="font-semibold text-navy">
              {t.scoring.multiplierTitle}
            </span>{' '}
            {t.scoring.multiplierText}
          </p>
          <p className="m-0 text-xs text-gray-500">
            {t.scoring.algorithmIntro} :{' '}
            <Link
              to="/rules/algorithm"
              className="text-indigo-600 font-medium hover:underline"
              onClick={onClose}
            >
              {t.scoring.algorithmLink}
            </Link>
            .
          </p>
          {isAdmin && (
            <p className="m-0 text-xs text-amber-950 bg-amber-50 rounded-xl p-3 border border-amber-100/80 leading-relaxed">
              <span className="font-semibold text-navy">
                {t.scoring.adminLabel}
              </span>{' '}
              {t.scoring.adminHintPrefix}{' '}
              <Link
                to="/admin"
                className="text-indigo-600 font-medium hover:underline"
                onClick={onClose}
              >
                Administration
              </Link>
              {t.scoring.adminHintSuffix}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

export default ScoringHelpModal
