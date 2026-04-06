import { useEffect, useState } from 'react'
import { fetchMatches } from '../services/matches'
import type { PlayersSingleMatch } from '../types'

export function useMatches() {
  const [matches, setMatches] = useState<PlayersSingleMatch[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchMatches()
      .then(setMatches)
      .catch((err: unknown) => setError(err instanceof Error ? err.message : 'Unknown error'))
      .finally(() => setLoading(false))
  }, [])

  return { matches, loading, error }
}
