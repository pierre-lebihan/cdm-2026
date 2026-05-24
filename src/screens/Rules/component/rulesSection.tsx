import type { ReactNode } from 'react'

interface RulesSectionProps {
  children?: ReactNode
}

const RulesSection = ({ children }: RulesSectionProps) => (
  <div className="bg-white rounded-2xl p-5 shadow-card [&_p]:text-sm [&_p]:text-gray-600 [&_p]:leading-relaxed [&_p]:mb-2 [&_ol]:text-sm [&_ol]:text-gray-600 [&_ol]:leading-relaxed [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:mb-3 [&_li]:mb-1 [&_a]:font-medium [&_a]:text-indigo-500">
    {children}
  </div>
)

export default RulesSection
