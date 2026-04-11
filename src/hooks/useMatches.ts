import { useEffect, useState } from 'react'
import { fetchMatchById } from '../services/matches'
import { useAuth } from '../store/AuthContext'
import type { MatchDto } from '../types'

export function useMatch(id: string) {
  const { session } = useAuth()
  const [match, setMatch] = useState<MatchDto | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const token = session?.token
    if (!token) {
      setError('Sign in required')
      setMatch(null)
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)
    fetchMatchById(token, id)
      .then(setMatch)
      .catch((err: unknown) => setError(err instanceof Error ? err.message : 'Unknown error'))
      .finally(() => setLoading(false))
  }, [id, session?.token])

  return { match, loading, error }
}
