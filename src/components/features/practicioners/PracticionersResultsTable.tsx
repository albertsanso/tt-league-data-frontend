import type { KeyboardEvent } from 'react'
import { cn } from '../../../lib/utils'
import type { PracticionerDto } from '../../../types'

export interface PracticionersResultsTableProps {
  practicioners: PracticionerDto[]
  selectedId: string | null
  onSelect: (practicioner: PracticionerDto) => void
}

function shortId(id: string): string {
  if (id.length <= 12) return id
  return `${id.slice(0, 8)}…${id.slice(-4)}`
}

export function PracticionersResultsTable({
  practicioners,
  selectedId,
  onSelect,
}: PracticionersResultsTableProps) {
  function onRowKeyDown(e: KeyboardEvent, p: PracticionerDto) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      onSelect(p)
    }
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200">
      <table className="w-full min-w-[560px] border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50">
            <th className="px-4 py-3 font-semibold text-gray-900">Full name</th>
            <th className="px-4 py-3 font-semibold text-gray-900">ID</th>
            <th className="px-4 py-3 font-semibold text-gray-900">First</th>
            <th className="px-4 py-3 font-semibold text-gray-900">Second</th>
            <th className="px-4 py-3 font-semibold text-gray-900">Birth date</th>
          </tr>
        </thead>
        <tbody>
          {practicioners.map((p) => (
            <tr
              key={p.id}
              className={cn(
                'cursor-pointer border-b border-gray-100 transition-colors last:border-0 focus-within:outline focus-within:ring-2 focus-within:ring-inset focus-within:ring-blue-500',
                selectedId === p.id ? 'bg-blue-50' : 'hover:bg-gray-50',
              )}
              aria-selected={selectedId === p.id}
              tabIndex={0}
              onClick={() => onSelect(p)}
              onKeyDown={(e) => onRowKeyDown(e, p)}
            >
              <td className="px-4 py-3 font-medium text-gray-900">{p.fullName}</td>
              <td className="px-4 py-3 font-mono text-xs text-gray-600" title={p.id}>
                {shortId(p.id)}
              </td>
              <td className="px-4 py-3 text-gray-600">{p.firstName}</td>
              <td className="px-4 py-3 text-gray-600">{p.secondName}</td>
              <td className="px-4 py-3 text-gray-600">{p.birthDate}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
