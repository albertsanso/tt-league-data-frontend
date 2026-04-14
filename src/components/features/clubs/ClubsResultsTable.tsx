import type { ClubDto } from '../../../types'
import { Button } from '../../ui/Button'

export interface ClubsResultsTableProps {
  clubs: ClubDto[]
  onSelect: (club: ClubDto) => void
  selectedClubId?: string | null
}

function shortId(id: string): string {
  if (id.length <= 12) return id
  return `${id.slice(0, 8)}…${id.slice(-4)}`
}

export function ClubsResultsTable({ clubs, onSelect, selectedClubId }: ClubsResultsTableProps) {
  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200">
      <table className="w-full min-w-[640px] border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50">
            <th className="px-4 py-3 font-semibold text-gray-900">Name</th>
            <th className="px-4 py-3 font-semibold text-gray-900">ID</th>
            <th className="px-4 py-3 font-semibold text-gray-900">Seasons</th>
            <th className="px-4 py-3 font-semibold text-gray-900">View</th>
          </tr>
        </thead>
        <tbody>
          {clubs.map((club) => (
            <tr
              key={club.id}
              className={[
                'border-b border-gray-100 last:border-0',
                selectedClubId === club.id ? 'bg-blue-50/50' : '',
              ].join(' ')}
            >
              <td className="px-4 py-3 font-medium text-gray-900">{club.name}</td>
              <td className="px-4 py-3 font-mono text-xs text-gray-600" title={club.id}>
                {shortId(club.id)}
              </td>
              <td className="px-4 py-3 text-gray-600">
                {club.yearRanges?.length ? (
                  <span className="flex flex-wrap gap-1">
                    {club.yearRanges.map((y) => (
                      <span
                        key={y}
                        className="rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-800"
                      >
                        {y}
                      </span>
                    ))}
                  </span>
                ) : (
                  <span className="text-gray-400">—</span>
                )}
              </td>
              <td className="px-4 py-3">
                <Button type="button" variant="secondary" onClick={() => onSelect(club)}>
                  {selectedClubId === club.id ? 'Selected' : 'View'}
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
