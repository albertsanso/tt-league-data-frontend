import { useEffect, useMemo, useState } from 'react'
import type { MatchSearchFilters } from '../../../lib/match-search-filters'
import {
  findMatchesBySeasonAndCompetitionGraphql,
  matchSearchFiltersToGraphqlVariables,
  type GraphqlMatchSearchRow,
} from '../../../services/graphql/matches'
import { useAuth } from '../../../store/AuthContext'
import { MatchResultCard } from './MatchResultCard'
import { MatchesPagination } from './MatchesPagination'
import { MatchesSearchForm } from './MatchesSearchForm'

const PAGE_SIZE = 10

export function MatchesSearchPage() {
  const { session } = useAuth()
  const authToken = session?.token

  const [hasSearched, setHasSearched] = useState(false)
  const [results, setResults] = useState<GraphqlMatchSearchRow[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)

  const pageCount = useMemo(
    () => Math.max(1, Math.ceil(results.length / PAGE_SIZE)),
    [results.length],
  )

  useEffect(() => {
    if (page > pageCount) setPage(pageCount)
  }, [page, pageCount])

  const pageItems = useMemo(() => {
    const p = Math.min(page, pageCount)
    const start = (p - 1) * PAGE_SIZE
    return results.slice(start, start + PAGE_SIZE)
  }, [page, pageCount, results])

  async function runSearch(filters: MatchSearchFilters) {
    const dayTrim = filters.matchDayNumber.trim()
    if (dayTrim !== '') {
      const n = Number.parseInt(dayTrim, 10)
      if (Number.isNaN(n)) {
        setError('Match day number must be a whole number.')
        return
      }
    }

    if (!authToken) {
      setError('You must be signed in to search matches.')
      return
    }

    setHasSearched(true)
    setPage(1)
    setLoading(true)
    setError(null)
    try {
      const variables = matchSearchFiltersToGraphqlVariables(filters)
      const data = await findMatchesBySeasonAndCompetitionGraphql(authToken, variables)
      setResults(data)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Search failed')
      setResults([])
    } finally {
      setLoading(false)
    }
  }

  function handleClearResults() {
    setHasSearched(false)
    setResults([])
    setPage(1)
    setError(null)
  }

  return (
    <div className="flex flex-col gap-6">
      {!authToken ? (
        <p className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
          No session token. Sign in again to use match search.
        </p>
      ) : null}

      <section aria-labelledby="matches-search-heading">
        <h2 id="matches-search-heading" className="mb-3 text-sm font-semibold text-gray-900">
          Search
        </h2>
        <MatchesSearchForm
          onSearch={(f) => void runSearch(f)}
          onClearFilters={handleClearResults}
          disabled={loading || !authToken}
        />
      </section>

      {loading ? (
        <p className="text-sm text-gray-600" role="status">
          Loading…
        </p>
      ) : null}
      {error ? (
        <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          {error}
        </p>
      ) : null}

      {!hasSearched && !loading ? (
        <p className="text-sm text-gray-600">Set filters and search to see matches.</p>
      ) : null}

      {hasSearched && !loading && results.length === 0 && !error ? (
        <p className="text-sm text-gray-600">No matches match this search.</p>
      ) : null}

      {results.length > 0 ? (
        <>
          <ul className="flex flex-col gap-3" aria-label="Match results">
            {pageItems.map((m) => (
              <li key={m.id}>
                <MatchResultCard match={m} />
              </li>
            ))}
          </ul>
          <MatchesPagination
            page={Math.min(page, pageCount)}
            pageCount={pageCount}
            onPageChange={setPage}
          />
        </>
      ) : null}
    </div>
  )
}
