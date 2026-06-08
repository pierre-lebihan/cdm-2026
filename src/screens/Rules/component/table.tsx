import type { ReactNode } from 'react'

interface RuleTableProps {
  header?: ReactNode[]
  rows?: ReactNode[][]
}

const RuleTable = ({ header = [], rows = [[]] }: RuleTableProps) => (
  <div className="overflow-x-auto">
    <table className="w-full text-sm">
      <thead>
        <tr className="border-b border-gray-200">
          {header.map((col, i) => (
            <th
              key={i}
              className="text-left py-2 px-3 font-semibold text-gray-500"
            >
              {col}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, i) => (
          <tr key={i} className="border-b border-gray-100">
            {row.map((col, j) => (
              <td key={j} className="py-2 px-3">
                {col}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
)

export default RuleTable
