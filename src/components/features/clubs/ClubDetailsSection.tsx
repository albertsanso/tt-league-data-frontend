import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import type { ClubDto, EnrichedClubMemberDto, SeasonPlayerDto } from '../../../types'
import { cn } from '../../../lib/utils'
import { fetchEnrichedClubMembersByClubId } from '../../../services/club-members'
import { fetchSeasonPlayersByPracticionerId } from '../../../services/players'
import { Button } from '../../ui/Button'

export interface ClubDetailsSectionProps {
  club: ClubDto
  authToken: string
  onClear: () => void
}

type SeasonPlayersState =
  | { kind: 'loading' }
  | { kind: 'error' }
  | { kind: 'ok'; rows: SeasonPlayerDto[] }

function rowsForSelectedYear(
  rows: SeasonPlayerDto[],
  selectedYearRange: string | 'all',
): SeasonPlayerDto[] {
  if (selectedYearRange === 'all') return rows
  return rows.filter((r) => r.yearRange === selectedYearRange)
}

function dedupeLicenseLabels(rows: SeasonPlayerDto[]): string[] {
  const seen = new Set<string>()
  const out: string[] = []
  for (const r of rows) {
    const id = (r.licenseId ?? '').trim()
    const tag = (r.licenseTag ?? '').trim()
    const label = id ? (tag && tag !== id ? `${id} (${tag})` : id) : tag
    if (!label || seen.has(label)) continue
    seen.add(label)
    out.push(label)
  }
  return out
}

/** Year range column: matches the FEAT-022 filter; “All” means licenses aggregate every loaded season row. */
function yearRangeColumnLabel(selectedYearRange: string | 'all'): string {
  return selectedYearRange === 'all' ? 'All' : selectedYearRange
}

export function ClubDetailsSection({ club, authToken, onClear }: ClubDetailsSectionProps) {
  const seasonPlayerCacheRef = useRef<Map<string, SeasonPlayerDto[]>>(new Map())

  const [selectedYearRange, setSelectedYearRange] = useState<string | 'all'>('all')

  const [membersLoading, setMembersLoading] = useState(false)
  const [membersError, setMembersError] = useState<string | null>(null)
  const [members, setMembers] = useState<EnrichedClubMemberDto[]>([])

  const [seasonPlayersByPractitionerId, setSeasonPlayersByPractitionerId] = useState<
    Record<string, SeasonPlayersState>
  >({})

  useEffect(() => {
    setSelectedYearRange('all')
  }, [club.id])

  useEffect(() => {
    let cancelled = false

    async function loadMembers(): Promise<EnrichedClubMemberDto[]> {
      setMembersLoading(true)
      setMembersError(null)
      setMembers([])
      setSeasonPlayersByPractitionerId({})
      try {
        const list = await fetchEnrichedClubMembersByClubId(authToken, club.id)
        if (cancelled) return []
        setMembers(list)
        return list
      } catch (e) {
        if (!cancelled) {
          setMembersError(e instanceof Error ? e.message : 'Failed to load members')
        }
        return []
      } finally {
        if (!cancelled) setMembersLoading(false)
      }
    }

    async function loadSeasonPlayers(list: EnrichedClubMemberDto[]) {
      const ids = [...new Set(list.map((m) => m.practicioner.id))]
      const initial: Record<string, SeasonPlayersState> = {}
      for (const id of ids) initial[id] = { kind: 'loading' }
      if (!cancelled) setSeasonPlayersByPractitionerId(initial)

      await Promise.all(
        ids.map(async (practicionerId) => {
          try {
            let rows = seasonPlayerCacheRef.current.get(practicionerId)
            if (!rows) {
              rows = await fetchSeasonPlayersByPracticionerId(authToken, practicionerId)
              seasonPlayerCacheRef.current.set(practicionerId, rows)
            }
            if (cancelled) return
            setSeasonPlayersByPractitionerId((prev) => ({
              ...prev,
              [practicionerId]: { kind: 'ok', rows },
            }))
          } catch {
            if (!cancelled) {
              setSeasonPlayersByPractitionerId((prev) => ({
                ...prev,
                [practicionerId]: { kind: 'error' },
              }))
            }
          }
        }),
      )
    }

    void (async () => {
      const list = await loadMembers()
      if (cancelled || list.length === 0) return
      await loadSeasonPlayers(list)
    })()

    return () => {
      cancelled = true
    }
  }, [authToken, club.id])

  const filteredMembers = useMemo(() => {
    if (selectedYearRange === 'all') return members
    return members.filter((m) => {
      const pid = m.practicioner.id
      const st = seasonPlayersByPractitionerId[pid]
      if (!st || st.kind === 'loading') return true
      if (st.kind === 'error') return false
      return st.rows.some((r) => r.yearRange === selectedYearRange)
    })
  }, [members, seasonPlayersByPractitionerId, selectedYearRange])

  const sortedFilteredMembers = useMemo(
    () =>
      [...filteredMembers].sort((a, b) =>
        a.practicioner.fullName.localeCompare(b.practicioner.fullName, undefined, {
          sensitivity: 'base',
        }),
      ),
    [filteredMembers],
  )

  const yearRangeLabel = yearRangeColumnLabel(selectedYearRange)

  const hasYearRangeOptions = Boolean(club.yearRanges?.length)

  return (
    <section
      aria-labelledby="club-details-heading"
      className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm"
    >
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <h3 id="club-details-heading" className="text-base font-semibold text-gray-900">
          Club details
        </h3>
        <Button type="button" variant="ghost" onClick={onClear}>
          Clear selection
        </Button>
      </div>

      <dl className="grid gap-3 text-sm sm:grid-cols-[8rem_1fr] sm:gap-x-4">
        <dt className="font-medium text-gray-600">Name</dt>
        <dd className="text-gray-900">{club.name}</dd>

        <dt className="font-medium text-gray-600">ID</dt>
        <dd className="break-all font-mono text-xs text-gray-800" title={club.id}>
          {club.id}
        </dd>

        <dt className="font-medium text-gray-600">Seasons</dt>
        <dd className="text-gray-900">
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
        </dd>
      </dl>

      <div className="mt-6">
        <h4 className="mb-2 text-sm font-semibold text-gray-900">Members</h4>
        {membersLoading ? (
          <p className="text-sm text-gray-600" role="status">
            Loading members…
          </p>
        ) : null}
        {membersError ? (
          <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
            {membersError}
          </p>
        ) : null}
        {!membersLoading && !membersError && members.length === 0 ? (
          <p className="text-sm text-gray-600">No members for this club.</p>
        ) : null}
        {members.length > 0 ? (
          <>
            {hasYearRangeOptions ? (
              <div className="mb-3 flex flex-wrap items-end gap-3">
                <div className="flex min-w-[12rem] flex-col gap-1">
                  <label htmlFor="club-members-year-filter" className="text-sm font-medium text-gray-700">
                    Year range
                  </label>
                  <select
                    id="club-members-year-filter"
                    className="rounded border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    value={selectedYearRange}
                    onChange={(e) => {
                      const v = e.target.value
                      setSelectedYearRange(v === 'all' ? 'all' : v)
                    }}
                  >
                    <option value="all">All</option>
                    {(club.yearRanges ?? []).map((y) => (
                      <option key={y} value={y}>
                        {y}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            ) : null}
            {!membersLoading && !membersError && filteredMembers.length === 0 ? (
              <p className="text-sm text-gray-600">No members for selected year range.</p>
            ) : null}
            {filteredMembers.length > 0 ? (
              <div className="overflow-x-auto rounded-md border border-gray-100">
                <table className="w-full min-w-[40rem] border-collapse text-left text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50">
                      <th className="px-3 py-2 font-semibold text-gray-900">Name</th>
                      <th className="px-3 py-2 font-semibold text-gray-900">Year range</th>
                      <th className="px-3 py-2 font-semibold text-gray-900">License ID</th>
                      <th className="px-3 py-2 font-semibold text-gray-900">Search</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedFilteredMembers.map((m) => {
                      const pid = m.practicioner.id
                      const st = seasonPlayersByPractitionerId[pid]
                      let licensesCell: ReactNode
                      if (!st || st.kind === 'loading') {
                        licensesCell = (
                          <span className="text-gray-500" role="status">
                            Loading…
                          </span>
                        )
                      } else if (st.kind === 'error') {
                        licensesCell = <span className="text-gray-400">—</span>
                      } else {
                        const slice = rowsForSelectedYear(st.rows, selectedYearRange)
                        const labels = dedupeLicenseLabels(slice)
                        if (labels.length === 0) {
                          licensesCell = <span className="text-gray-400">—</span>
                        } else {
                          licensesCell = labels.join(', ')
                        }
                      }
                      const searchHref = `/practicioners?q=${encodeURIComponent(m.practicioner.fullName)}`
                      return (
                        <tr key={m.id} className="border-b border-gray-100 last:border-0">
                          <td className="px-3 py-2 font-medium text-gray-900">
                            {m.practicioner.fullName}
                          </td>
                          <td className="px-3 py-2 text-gray-700">{yearRangeLabel}</td>
                          <td className="px-3 py-2 text-gray-700">{licensesCell}</td>
                          <td className="px-3 py-2">
                            <Link
                              to={searchHref}
                              aria-label={`Open practicioners search for ${m.practicioner.fullName}`}
                              className={cn(
                                'inline-flex items-center justify-center rounded px-3 py-1.5 text-xs font-medium transition-colors',
                                'bg-gray-100 text-gray-900 hover:bg-gray-200',
                              )}
                            >
                              Practicioners
                            </Link>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            ) : null}
          </>
        ) : null}
      </div>
    </section>
  )
}
