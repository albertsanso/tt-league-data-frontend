import { useCallback, useEffect, useMemo, useState, type KeyboardEvent } from 'react'
import {
  getOutcomeForPractitioner,
  outcomeToneFromOutcome,
  summarizeMatchOutcomes,
} from '../../../lib/practicioner-match-analytics'
import { matchSeasonOptionsDescending } from '../../../lib/match-search-filters'
import { LATEST_LEAGUE_SEASON } from '../../../lib/season-config'
import { cn } from '../../../lib/utils'
import { fetchClubById } from '../../../services/clubs'
import { fetchClubMembersByPracticionerId } from '../../../services/club-members'
import {
  fetchPracticionerMembershipsGraphql,
  findMatchesBySeasonAndCompetitionGraphql,
  findMatchesVariablesForPractitionerInSeason,
  type GraphqlMatchSearchRow,
} from '../../../services/graphql'
import { fetchSeasonPlayersByPracticionerId } from '../../../services/players'
import type { PracticionerDto, SeasonPlayerDto } from '../../../types'
import { Button } from '../../ui/Button'
import { MatchResultCard } from '../matches/MatchResultCard'
import { PractitionerMatchScatterChart } from './PractitionerMatchScatterChart'

export interface PracticionerDetailsPanelProps {
  practicioner: PracticionerDto
  authToken: string
  onCloseSelection?: () => void
}

type DetailTab = 'matches' | 'clubs' | 'stats'

interface ClubRowDisplay {
  membershipId: string
  clubId: string
  clubName: string
  yearRangesLabel: string
}

type SliceState<T> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; message: string }

type SortDir = 'asc' | 'desc'

function matchDayNumeric(row: GraphqlMatchSearchRow): number {
  const n = Number.parseInt(row.matchDayNumber.trim(), 10)
  return Number.isNaN(n) ? 0 : n
}

function shortId(id: string): string {
  if (id.length <= 12) return id
  return `${id.slice(0, 8)}…${id.slice(-4)}`
}

/** Client filter: membership row is shown for `season` if any displayed range mentions that label, or ranges are unknown (REST). */
function clubMembershipTouchesSeason(row: ClubRowDisplay, season: string): boolean {
  const label = row.yearRangesLabel.trim()
  if (label === '' || label === '—') return true
  return label.includes(season)
}

async function loadClubRowsRestFallback(token: string, practicionerId: string): Promise<ClubRowDisplay[]> {
  const members = await fetchClubMembersByPracticionerId(token, practicionerId)
  const nameByClubId = new Map<string, string>()
  const rows: ClubRowDisplay[] = []
  for (const m of members) {
    let name = nameByClubId.get(m.clubId)
    if (!name) {
      const club = await fetchClubById(token, m.clubId)
      name = club.name
      nameByClubId.set(m.clubId, name)
    }
    rows.push({
      membershipId: m.id,
      clubId: m.clubId,
      clubName: name,
      yearRangesLabel: '—',
    })
  }
  return rows
}

async function loadClubRows(token: string, practicionerId: string): Promise<ClubRowDisplay[]> {
  try {
    const gql = await fetchPracticionerMembershipsGraphql(token, practicionerId)
    if (gql?.memberships?.length) {
      return gql.memberships.map((m) => ({
        membershipId: m.id,
        clubId: m.club.id,
        clubName: m.club.name,
        yearRangesLabel: m.yearRanges.length > 0 ? m.yearRanges.join(', ') : '—',
      }))
    }
  } catch {
    // GraphQL missing or error — REST membership rows without year ranges from this DTO.
  }
  return loadClubRowsRestFallback(token, practicionerId)
}

function PracticionerDetailsPanelInner({
  practicioner,
  authToken,
  onCloseSelection,
}: PracticionerDetailsPanelProps) {
  const [activeTab, setActiveTab] = useState<DetailTab>('matches')
  const [selectedSeason, setSelectedSeason] = useState<string>(LATEST_LEAGUE_SEASON)
  const [matchesDaySort, setMatchesDaySort] = useState<SortDir>('asc')
  const [clubsNameSort, setClubsNameSort] = useState<SortDir>('asc')
  const [matchesState, setMatchesState] = useState<SliceState<GraphqlMatchSearchRow[]>>({ status: 'idle' })
  const [clubsState, setClubsState] = useState<SliceState<ClubRowDisplay[]>>({ status: 'idle' })
  const [seasonPlayersState, setSeasonPlayersState] = useState<SliceState<SeasonPlayerDto[]>>({
    status: 'idle',
  })

  const loadMatchesData = useCallback(async () => {
    setMatchesState((s) => (s.status === 'loading' ? s : { status: 'loading' }))
    try {
      const data = await findMatchesBySeasonAndCompetitionGraphql(
        authToken,
        findMatchesVariablesForPractitionerInSeason(practicioner.fullName, selectedSeason),
      )
      setMatchesState({ status: 'success', data })
    } catch (e) {
      setMatchesState({
        status: 'error',
        message: e instanceof Error ? e.message : 'Failed to load matches',
      })
    }
  }, [authToken, practicioner.fullName, selectedSeason])

  const loadClubsData = useCallback(async () => {
    setClubsState((s) => (s.status === 'loading' ? s : { status: 'loading' }))
    try {
      const data = await loadClubRows(authToken, practicioner.id)
      setClubsState({ status: 'success', data })
    } catch (e) {
      setClubsState({
        status: 'error',
        message: e instanceof Error ? e.message : 'Failed to load clubs',
      })
    }
  }, [authToken, practicioner.id])

  const loadSeasonPlayersData = useCallback(async () => {
    setSeasonPlayersState((s) => (s.status === 'loading' ? s : { status: 'loading' }))
    try {
      const data = await fetchSeasonPlayersByPracticionerId(authToken, practicioner.id)
      setSeasonPlayersState({ status: 'success', data })
    } catch (e) {
      setSeasonPlayersState({
        status: 'error',
        message: e instanceof Error ? e.message : 'Failed to load season registrations',
      })
    }
  }, [authToken, practicioner.id])

  useEffect(() => {
    setMatchesState({ status: 'idle' })
  }, [selectedSeason])

  useEffect(() => {
    if (activeTab !== 'matches') return
    if (matchesState.status === 'success' || matchesState.status === 'loading') return
    void loadMatchesData()
  }, [activeTab, matchesState.status, loadMatchesData])

  useEffect(() => {
    if (activeTab !== 'clubs') return
    if (clubsState.status === 'success' || clubsState.status === 'loading') return
    void loadClubsData()
  }, [activeTab, clubsState.status, loadClubsData])

  useEffect(() => {
    if (activeTab !== 'stats') return
    if (matchesState.status === 'idle') void loadMatchesData()
  }, [activeTab, matchesState.status, loadMatchesData])

  useEffect(() => {
    if (activeTab !== 'stats') return
    if (seasonPlayersState.status === 'idle') void loadSeasonPlayersData()
  }, [activeTab, seasonPlayersState.status, loadSeasonPlayersData])

  const matchSummary = useMemo(() => {
    if (matchesState.status !== 'success') return null
    return summarizeMatchOutcomes(matchesState.data, practicioner.fullName)
  }, [matchesState, practicioner.fullName])

  const sortedMatches = useMemo(() => {
    if (matchesState.status !== 'success') return []
    const copy = [...matchesState.data]
    copy.sort((a, b) => {
      const da = matchDayNumeric(a)
      const db = matchDayNumeric(b)
      return matchesDaySort === 'asc' ? da - db : db - da
    })
    return copy
  }, [matchesState, matchesDaySort])

  const sortedClubRows = useMemo(() => {
    if (clubsState.status !== 'success') return []
    const copy = clubsState.data.filter((row) => clubMembershipTouchesSeason(row, selectedSeason))
    copy.sort((a, b) =>
      clubsNameSort === 'asc'
        ? a.clubName.localeCompare(b.clubName)
        : b.clubName.localeCompare(a.clubName),
    )
    return copy
  }, [clubsState, clubsNameSort, selectedSeason])

  const registrationsForSeason = useMemo(() => {
    if (seasonPlayersState.status !== 'success') return []
    return seasonPlayersState.data.filter(
      (sp) => sp.yearRange === selectedSeason || sp.yearRange.includes(selectedSeason),
    )
  }, [seasonPlayersState, selectedSeason])

  const tabIds = {
    matches: 'pract-detail-tab-matches',
    clubs: 'pract-detail-tab-clubs',
    stats: 'pract-detail-tab-stats',
  } as const

  const panelIds = {
    matches: 'pract-detail-panel-matches',
    clubs: 'pract-detail-panel-clubs',
    stats: 'pract-detail-panel-stats',
  } as const

  function onTabKeyDown(e: KeyboardEvent, tab: DetailTab) {
    const order: DetailTab[] = ['matches', 'clubs', 'stats']
    const i = order.indexOf(tab)
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveTab(order[(i + 1) % order.length])
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveTab(order[(i - 1 + order.length) % order.length])
    } else if (e.key === 'Home') {
      e.preventDefault()
      setActiveTab('matches')
    } else if (e.key === 'End') {
      e.preventDefault()
      setActiveTab('stats')
    }
  }

  return (
    <section
      className="rounded-xl border border-gray-200 bg-white shadow-sm"
      aria-labelledby="pract-detail-title"
    >
      <div className="border-b border-gray-200 px-4 py-4 sm:px-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 id="pract-detail-title" className="text-lg font-semibold text-gray-900">
              {practicioner.fullName}
            </h2>
            <p className="mt-1 text-sm text-gray-600">
              Born {practicioner.birthDate}
              <span className="mx-2 text-gray-300">·</span>
              <span className="font-mono text-xs" title={practicioner.id}>
                {shortId(practicioner.id)}
              </span>
            </p>
          </div>
          {onCloseSelection ? (
            <Button type="button" variant="secondary" onClick={onCloseSelection}>
              Clear selection
            </Button>
          ) : null}
        </div>
      </div>

      <div className="border-b border-gray-200 bg-gray-50/80 px-4 py-3 sm:px-5">
        <label htmlFor="pract-detail-season" className="mr-2 text-sm font-medium text-gray-700">
          Season
        </label>
        <select
          id="pract-detail-season"
          className="rounded-md border border-gray-300 bg-white px-2 py-1.5 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          value={selectedSeason}
          onChange={(e) => setSelectedSeason(e.target.value)}
        >
          {matchSeasonOptionsDescending().map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <p className="mt-2 text-xs text-gray-500">
          Matches and stats use this season. Clubs list shows memberships whose season ranges mention it (or all rows
          when ranges are unavailable).
        </p>
      </div>

      <div role="tablist" aria-label="Practicioner sections" className="flex border-b border-gray-200">
        {(
          [
            { id: tabIds.matches, tab: 'matches' as const, label: 'Matches' },
            { id: tabIds.clubs, tab: 'clubs' as const, label: 'Clubs' },
            { id: tabIds.stats, tab: 'stats' as const, label: 'Stats' },
          ] as const
        ).map(({ id, tab, label }) => (
          <button
            key={tab}
            id={id}
            type="button"
            role="tab"
            aria-selected={activeTab === tab}
            aria-controls={panelIds[tab]}
            tabIndex={activeTab === tab ? 0 : -1}
            className={cn(
              'min-w-0 flex-1 px-3 py-3 text-sm font-medium transition-colors focus-visible:outline focus-visible:ring-2 focus-visible:ring-blue-500',
              activeTab === tab
                ? 'border-b-2 border-blue-600 bg-gray-50 text-gray-900'
                : 'border-b-2 border-transparent text-gray-600 hover:bg-gray-50 hover:text-gray-900',
            )}
            onClick={() => setActiveTab(tab)}
            onKeyDown={(e) => onTabKeyDown(e, tab)}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="min-h-[12rem] p-4 sm:p-5">
        <div
          id={panelIds.matches}
          role="tabpanel"
          aria-labelledby={tabIds.matches}
          hidden={activeTab !== 'matches'}
          className={cn(activeTab !== 'matches' && 'hidden')}
        >
          <p className="mb-3 text-xs text-gray-500">
            Matches in season <span className="font-medium text-gray-700">{selectedSeason}</span> (name search).
          </p>
          {matchesState.status === 'loading' ? (
            <p className="text-sm text-gray-600">Loading matches…</p>
          ) : null}
          {matchesState.status === 'error' ? (
            <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
              {matchesState.message}
            </p>
          ) : null}
          {matchesState.status === 'success' && matchesState.data.length === 0 ? (
            <p className="text-sm text-gray-600">No matches found for this season.</p>
          ) : null}
          {matchesState.status === 'success' && matchesState.data.length > 0 ? (
            <>
              {matchSummary ? (
                <dl className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  <div className="rounded-lg border border-gray-100 bg-gray-50 px-3 py-2">
                    <dt className="text-xs font-medium uppercase tracking-wide text-gray-500">Total matches</dt>
                    <dd className="mt-0.5 text-xl font-semibold tabular-nums text-gray-900">
                      {matchSummary.total}
                    </dd>
                  </div>
                  <div className="rounded-lg border border-emerald-100 bg-emerald-50/60 px-3 py-2">
                    <dt className="text-xs font-medium uppercase tracking-wide text-emerald-800">Total wins</dt>
                    <dd className="mt-0.5 text-xl font-semibold tabular-nums text-emerald-900">
                      {matchSummary.wins}
                    </dd>
                  </div>
                  <div className="rounded-lg border border-red-100 bg-red-50/60 px-3 py-2">
                    <dt className="text-xs font-medium uppercase tracking-wide text-red-800">Total losses</dt>
                    <dd className="mt-0.5 text-xl font-semibold tabular-nums text-red-900">
                      {matchSummary.losses}
                    </dd>
                  </div>
                  <div className="rounded-lg border border-amber-100 bg-amber-50/60 px-3 py-2">
                    <dt className="text-xs font-medium uppercase tracking-wide text-amber-800">Total ties</dt>
                    <dd className="mt-0.5 text-xl font-semibold tabular-nums text-amber-900">
                      {matchSummary.ties}
                    </dd>
                  </div>
                </dl>
              ) : null}
              {matchSummary && matchSummary.unscored > 0 ? (
                <p className="mb-3 text-xs text-gray-500">
                  {matchSummary.unscored} match{matchSummary.unscored === 1 ? '' : 'es'} could not be scored
                  (name or score mismatch).
                </p>
              ) : null}
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <label htmlFor="pract-matches-sort" className="text-sm font-medium text-gray-700">
                  Sort by match day
                </label>
                <select
                  id="pract-matches-sort"
                  className="rounded-md border border-gray-300 bg-white px-2 py-1.5 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  value={matchesDaySort}
                  onChange={(e) => setMatchesDaySort(e.target.value as SortDir)}
                >
                  <option value="asc">Ascending</option>
                  <option value="desc">Descending</option>
                </select>
              </div>
              <ul className="flex max-h-[28rem] flex-col gap-3 overflow-y-auto" aria-label="Matches">
                {sortedMatches.map((m) => {
                  const outcome = getOutcomeForPractitioner(m, practicioner.fullName)
                  const tone = outcomeToneFromOutcome(outcome)
                  return (
                    <li key={m.id}>
                      <MatchResultCard match={m} outcomeTone={tone} />
                    </li>
                  )
                })}
              </ul>
            </>
          ) : null}
        </div>

        <div
          id={panelIds.clubs}
          role="tabpanel"
          aria-labelledby={tabIds.clubs}
          hidden={activeTab !== 'clubs'}
          className={cn(activeTab !== 'clubs' && 'hidden')}
        >
          {clubsState.status === 'loading' ? (
            <p className="text-sm text-gray-600">Loading clubs…</p>
          ) : null}
          {clubsState.status === 'error' ? (
            <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
              {clubsState.message}
            </p>
          ) : null}
          {clubsState.status === 'success' && clubsState.data.length === 0 ? (
            <p className="text-sm text-gray-600">No club memberships found.</p>
          ) : null}
          {clubsState.status === 'success' && clubsState.data.length > 0 && sortedClubRows.length === 0 ? (
            <p className="text-sm text-gray-600">
              No club memberships for season <span className="font-medium text-gray-800">{selectedSeason}</span>.
            </p>
          ) : null}
          {clubsState.status === 'success' && sortedClubRows.length > 0 ? (
            <>
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <label htmlFor="pract-clubs-sort" className="text-sm font-medium text-gray-700">
                  Sort clubs by name
                </label>
                <select
                  id="pract-clubs-sort"
                  className="rounded-md border border-gray-300 bg-white px-2 py-1.5 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  value={clubsNameSort}
                  onChange={(e) => setClubsNameSort(e.target.value as SortDir)}
                >
                  <option value="asc">A–Z</option>
                  <option value="desc">Z–A</option>
                </select>
              </div>
              <div className="overflow-x-auto rounded-lg border border-gray-200">
                <table className="w-full min-w-[400px] border-collapse text-left text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50">
                      <th className="px-4 py-3 font-semibold text-gray-900">Club</th>
                      <th className="px-4 py-3 font-semibold text-gray-900">Season ranges</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedClubRows.map((row) => (
                      <tr key={row.membershipId} className="border-b border-gray-100 last:border-0">
                        <td className="px-4 py-3 font-medium text-gray-900">{row.clubName}</td>
                        <td className="px-4 py-3 text-gray-600">{row.yearRangesLabel}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          ) : null}
        </div>

        <div
          id={panelIds.stats}
          role="tabpanel"
          aria-labelledby={tabIds.stats}
          hidden={activeTab !== 'stats'}
          className={cn(activeTab !== 'stats' && 'hidden')}
        >
          <p className="mb-4 text-sm text-gray-600">
            Match scatter for season <span className="font-medium text-gray-800">{selectedSeason}</span> — points
            scored vs assigned letter (A–C, X–Z).
          </p>
          {matchesState.status === 'loading' ? (
            <p className="text-sm text-gray-600">Loading matches…</p>
          ) : null}
          {matchesState.status === 'error' ? (
            <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
              {matchesState.message}
            </p>
          ) : null}
          {matchesState.status === 'success' ? (
            <div className="flex flex-col gap-4">
              <PractitionerMatchScatterChart
                matches={matchesState.data}
                practitionerFullName={practicioner.fullName}
              />
              {matchSummary && matchSummary.unscored > 0 ? (
                <p className="text-xs text-gray-500">
                  {matchSummary.unscored} match{matchSummary.unscored === 1 ? '' : 'es'} omitted from the chart
                  (side or score unknown, or letter outside A–C / X–Z).
                </p>
              ) : null}
              {seasonPlayersState.status === 'loading' ? (
                <p className="text-sm text-gray-600">Loading season registrations…</p>
              ) : null}
              {seasonPlayersState.status === 'error' ? (
                <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
                  Registrations: {seasonPlayersState.message}
                </p>
              ) : null}
              {seasonPlayersState.status === 'success' && registrationsForSeason.length > 0 ? (
                <div>
                  <h3 className="mb-2 text-sm font-semibold text-gray-900">
                    Registrations for {selectedSeason}
                  </h3>
                  <div className="overflow-x-auto rounded-lg border border-gray-200">
                    <table className="w-full min-w-[360px] border-collapse text-left text-sm">
                      <thead>
                        <tr className="border-b border-gray-200 bg-gray-50">
                          <th className="px-4 py-3 font-semibold text-gray-900">Season</th>
                          <th className="px-4 py-3 font-semibold text-gray-900">License</th>
                        </tr>
                      </thead>
                      <tbody>
                        {registrationsForSeason.map((sp) => (
                          <tr key={sp.id} className="border-b border-gray-100 last:border-0">
                            <td className="px-4 py-3 text-gray-900">{sp.yearRange}</td>
                            <td className="px-4 py-3 text-gray-600">{sp.licenseTag}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : null}
              {seasonPlayersState.status === 'success' &&
              seasonPlayersState.data.length > 0 &&
              registrationsForSeason.length === 0 ? (
                <p className="text-sm text-gray-600">No season registrations for {selectedSeason}.</p>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  )
}

export function PracticionerDetailsPanel(props: PracticionerDetailsPanelProps) {
  return <PracticionerDetailsPanelInner key={props.practicioner.id} {...props} />
}
