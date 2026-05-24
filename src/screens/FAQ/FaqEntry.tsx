import { ChevronDown } from 'lucide-react'
import { memo, type ReactNode } from 'react'
import Mascot from '../../components/Mascot'
import { MASCOTS, type MascotId } from '../../lib/mascots'

interface FaqEntryProps {
  question: string
  answer: ReactNode
  mascot?: MascotId
  punchline?: string
}

const FaqEntry = ({ question, answer, mascot, punchline }: FaqEntryProps) => {
  const mascotInfo = mascot ? MASCOTS[mascot] : null

  return (
    <details className="group bg-white rounded-xl mb-2 overflow-hidden shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
      <summary className="w-full flex items-center gap-3 p-4 text-left cursor-pointer list-none [&::-webkit-details-marker]:hidden">
        {mascotInfo && (
          <Mascot
            id={mascotInfo.id}
            size="sm"
            className="shrink-0 ring-2 ring-white shadow-sm"
          />
        )}
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-navy text-sm m-0 leading-snug">
            {question}
          </p>
          {punchline && (
            <p
              className={`text-[0.7rem] italic m-0 mt-0.5 leading-snug ${mascotInfo?.accent ?? 'text-gray-400'}`}
            >
              « {punchline} »
            </p>
          )}
        </div>
        <ChevronDown
          size={16}
          className="w-4 h-4 text-gray-400 shrink-0 transition-transform group-open:rotate-180"
        />
      </summary>
      <div className="px-4 pb-4 text-sm text-gray-600 [&_a]:text-indigo-500 [&_a]:font-medium">
        {answer}
      </div>
    </details>
  )
}

export default memo(FaqEntry)
