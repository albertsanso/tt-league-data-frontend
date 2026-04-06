import { apiBase } from '../lib/api'
import type { SeasonPlayer } from '../types'

export async function fetchSeasonPlayersByName(name: string): Promise<SeasonPlayer[]> {
  const res = await fetch(`${apiBase}/api/v1/season_player/search_by_name/${encodeURIComponent(name)}`)
  if (!res.ok) throw new Error('Failed to fetch season players')
  return res.json() as Promise<SeasonPlayer[]>
}

export async function fetchSeasonPlayersByPracticionerId(practicionerId: string): Promise<SeasonPlayer[]> {
  const res = await fetch(`${apiBase}/api/v1/season_player/find_by_practicioner/${encodeURIComponent(practicionerId)}`)
  if (!res.ok) throw new Error('Failed to fetch season players')
  return res.json() as Promise<SeasonPlayer[]>
}
