import { apiBase } from '../lib/api'
import type { PlayersSingleMatch } from '../types'

export async function fetchMatchById(id: string): Promise<PlayersSingleMatch> {
  const res = await fetch(`${apiBase}/api/v1/match/${encodeURIComponent(id)}`)
  if (!res.ok) throw new Error('Failed to fetch match')
  return res.json() as Promise<PlayersSingleMatch>
}
