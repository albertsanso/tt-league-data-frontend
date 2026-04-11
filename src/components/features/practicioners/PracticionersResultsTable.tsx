import type { PracticionerDto } from '../../../types'
import { Button } from '../../ui/Button'

export interface PracticionersResultsTableProps {
  practicioners: PracticionerDto[]
  onEdit: (p: PracticionerDto) => void
  onDelete: (p: PracticionerDto) => void
}

function shortId(id: string): string {
  if (id.length <= 12) return id
  return `${id.slice(0, 8)}…${id.slice(-4)}`
}

export function PracticionersResultsTable({
  practicioners,
  onEdit,
  onDelete,
}: PracticionersResultsTableProps) {
  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200">
      <table className="w-full min-w-[720px] border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50">
            <th className="px-4 py-3 font-semibold text-gray-900">Full name</th>
            <th className="px-4 py-3 font-semibold text-gray-900">ID</th>
            <th className="px-4 py-3 font-semibold text-gray-900">First</th>
            <th className="px-4 py-3 font-semibold text-gray-900">Second</th>
            <th className="px-4 py-3 font-semibold text-gray-900">Birth date</th>
            <th className="px-4 py-3 font-semibold text-gray-900">Actions</th>
          </tr>
        </thead>
        <tbody>
          {practicioners.map((p) => (
            <tr key={p.id} className="border-b border-gray-100 last:border-0">
              <td className="px-4 py-3 font-medium text-gray-900">{p.fullName}</td>
              <td className="px-4 py-3 font-mono text-xs text-gray-600" title={p.id}>
                {shortId(p.id)}
              </td>
              <td className="px-4 py-3 text-gray-600">{p.firstName ?? '—'}</td>
              <td className="px-4 py-3 text-gray-600">{p.secondName ?? '—'}</td>
              <td className="px-4 py-3 text-gray-600">{p.birthDate ?? '—'}</td>
              <td className="px-4 py-3">
                <div className="flex flex-wrap gap-2">
                  <Button type="button" variant="secondary" onClick={() => onEdit(p)}>
                    Edit
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    className="border border-red-200 bg-white text-red-700 hover:bg-red-50"
                    onClick={() => onDelete(p)}
                  >
                    Delete
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
