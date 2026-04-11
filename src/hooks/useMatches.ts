import { useEffect, useState } from 'react'
import { fetchMatchById } from '../services/matches'
import type { MatchDto } from '../types'

export function useMatch(id: string) {
  const [match, setMatch] = useState<MatchDto | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchMatchById(id)
      .then(setMatch)
      .catch((err: unknown) => setError(err instanceof Error ? err.message : 'Unknown error'))
      .finally(() => setLoading(false))
  }, [id])

  return { match, loading, error }
}
