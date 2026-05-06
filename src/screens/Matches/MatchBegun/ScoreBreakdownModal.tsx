import { X } from 'lucide-react'
import ScoreBreakdownPanel, {
  type ScoreBreakdownPanelProps,
} from './ScoreBreakdownPanel'

interface ScoreBreakdownModalProps extends ScoreBreakdownPanelProps {
  open: boolean
  onClose: () => void
  title: string
}

const ScoreBreakdownModal = ({
  open,
  onClose,
  title,
  ...panelProps
}: ScoreBreakdownModalProps) => {
  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-[1200] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-navy/40 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="score-breakdown-title"
      onClick={onClose}
    >
      <div
        className="w-full sm:max-w-md bg-white rounded-t-2xl sm:rounded-2xl shadow-card p-5 pb-8 sm:pb-5 max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-start gap-3 mb-4">
          <h2 id="score-breakdown-title" className="text-lg font-extrabold text-navy m-0 pr-2">
            {title}
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

        <ScoreBreakdownPanel {...panelProps} />
      </div>
    </div>
  )
}

export default ScoreBreakdownModal
