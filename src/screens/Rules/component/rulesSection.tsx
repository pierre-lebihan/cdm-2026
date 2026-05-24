import type { ReactNode } from 'react'
import Mascot from '../../../components/Mascot'
import type { MascotId } from '../../../lib/mascots'

interface RulesSectionProps {
  children?: ReactNode
  mascot?: MascotId
}

const RulesSection = ({ children, mascot }: RulesSectionProps) => (
  <div className="relative bg-white rounded-2xl p-5 shadow-card [&_p]:text-sm [&_p]:text-gray-600 [&_p]:leading-relaxed [&_p]:mb-2 [&_ol]:text-sm [&_ol]:text-gray-600 [&_ol]:leading-relaxed [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:mb-3 [&_li]:mb-1 [&_a]:font-medium [&_a]:text-indigo-500">
    {mascot && (
      <div className="absolute -top-5 -right-2 ring-4 ring-cream rounded-full shadow-md">
        <Mascot id={mascot} size="md" />
      </div>
    )}
    <div className={mascot ? 'pr-16 sm:pr-20' : ''}>{children}</div>
  </div>
)

export default RulesSection
