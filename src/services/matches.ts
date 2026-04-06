import type { PlayersSingleMatch } from '../types'

const BASE_URL = import.meta.env.VITE_API_BASE_URL

export async function fetchMatches(): Promise<PlayersSingleMatch[]> {
  const res = await fetch(`${BASE_URL}/matches`)
  if (!res.ok) throw new Error('Failed to fetch matches')
  return res.json() as Promise<PlayersSingleMatch[]>
}
