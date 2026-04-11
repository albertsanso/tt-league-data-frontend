import { useCallback, useEffect, useMemo, useState } from 'react'
import type { PracticionerDto } from '../../../types'
import { fetchPracticionersBySimilarName } from '../../../services/practicioners'
import { useAuth } from '../../../store/AuthContext'
import { Button } from '../../ui/Button'
import { DeletePracticionerConfirmModal } from './DeletePracticionerConfirmModal'
import { PracticionerFormModal } from './PracticionerFormModal'
import { PracticionerSearchForm } from './PracticionerSearchForm'
import { PracticionersPagination } from './PracticionersPagination'
import { PracticionersResultsTable } from './PracticionersResultsTable'

const PAGE_SIZE = 10

export function PracticionersSearchPage() {
  const { session } = useAuth()
  const authToken = session?.token

  const [lastSearchTerm, setLastSearchTerm] = useState<string | null>(null)
  const [results, setResults] = useState<PracticionerDto[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [formOpen, setFormOpen] = useState(false)
  const [formMode, setFormMode] = useState<'add' | 'edit'>('add')
  const [editing, setEditing] = useState<PracticionerDto | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<PracticionerDto | null>(null)

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

  const refetch = useCallback(async () => {
    if (lastSearchTerm === null || !authToken) return
    setLoading(true)
    setError(null)
    try {
      const data = await fetchPracticionersBySimilarName(authToken, lastSearchTerm)
      setResults(data)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Search failed')
      setResults([])
    } finally {
      setLoading(false)
    }
  }, [lastSearchTerm, authToken])

  async function runSearch(term: string) {
    if (!term) {
      setError('Enter a name to search')
      return
    }
    if (!authToken) {
      setError('You must be signed in to search practicioners.')
      return
    }
    setLastSearchTerm(term)
    setPage(1)
    setLoading(true)
    setError(null)
    try {
      const data = await fetchPracticionersBySimilarName(authToken, term)
      setResults(data)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Search failed')
      setResults([])
    } finally {
      setLoading(false)
    }
  }

  const hasSearched = lastSearchTerm !== null

  return (
    <div className="flex flex-col gap-6">
      {!authToken ? (
        <p className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
          No session token. Sign in again to use practicioners search.
        </p>
      ) : null}
      <div className="flex justify-end">
        <Button
          type="button"
          disabled={!authToken}
          onClick={() => {
            setFormMode('add')
            setEditing(null)
            setFormOpen(true)
          }}
        >
          Add new practicioner
        </Button>
      </div>

      <section aria-labelledby="practicioner-search-heading">
        <h2 id="practicioner-search-heading" className="mb-3 text-sm font-semibold text-gray-900">
          Search
        </h2>
        <PracticionerSearchForm
          onSearch={(t) => void runSearch(t)}
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
        <p className="text-sm text-gray-600">Enter a name and search to see practicioners.</p>
      ) : null}

      {hasSearched && !loading && results.length === 0 && !error ? (
        <p className="text-sm text-gray-600">No practicioners match this search.</p>
      ) : null}

      {results.length > 0 ? (
        <>
          <PracticionersResultsTable
            practicioners={pageItems}
            onEdit={(p) => {
              setFormMode('edit')
              setEditing(p)
              setFormOpen(true)
            }}
            onDelete={setDeleteTarget}
          />
          <PracticionersPagination
            page={Math.min(page, pageCount)}
            pageCount={pageCount}
            onPageChange={setPage}
          />
        </>
      ) : null}

      <PracticionerFormModal
        authToken={authToken ?? ''}
        open={formOpen}
        mode={formMode}
        editing={formMode === 'edit' ? editing : null}
        onOpenChange={(open) => {
          setFormOpen(open)
          if (!open) setEditing(null)
        }}
        onSaved={() => void refetch()}
      />

      <DeletePracticionerConfirmModal
        authToken={authToken ?? ''}
        practicioner={deleteTarget}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null)
        }}
        onDeleted={() => void refetch()}
      />
    </div>
  )
}
