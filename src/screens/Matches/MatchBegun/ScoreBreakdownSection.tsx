import { ChevronDown } from 'lucide-react'
import { type ReactNode } from 'react'
import ScoreBreakdownPanel, {
  type ScoreBreakdownPanelProps,
} from './ScoreBreakdownPanel'

interface ScoreBreakdownSectionProps extends ScoreBreakdownPanelProps {
  title: ReactNode
}

const ScoreBreakdownSection = ({
  title,
  ...panelProps
}: ScoreBreakdownSectionProps) => {
  return (
    <details
      className="group bg-white rounded-2xl shadow-card mb-4 overflow-hidden"
      open
    >
      <summary className="flex items-center justify-center gap-2 p-5 cursor-pointer list-none [&::-webkit-details-marker]:hidden">
        <span className="text-lg font-bold text-navy text-center break-words min-w-0">
          {title}
        </span>
        <ChevronDown
          size={18}
          className="text-gray-400 shrink-0 transition-transform group-open:rotate-180"
        />
      </summary>
      <div className="px-5 pb-5">
        <ScoreBreakdownPanel {...panelProps} />
      </div>
    </details>
  )
}

export default ScoreBreakdownSection
