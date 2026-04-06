import type { Player, SeasonPlayer } from '../types'

const BASE_URL = import.meta.env.VITE_API_BASE_URL

export async function fetchPlayers(): Promise<Player[]> {
  const res = await fetch(`${BASE_URL}/players`)
  if (!res.ok) throw new Error('Failed to fetch players')
  return res.json() as Promise<Player[]>
}

export async function fetchSeasonPlayers(season: string): Promise<SeasonPlayer[]> {
  const res = await fetch(`${BASE_URL}/season-players?season=${encodeURIComponent(season)}`)
  if (!res.ok) throw new Error('Failed to fetch season players')
  return res.json() as Promise<SeasonPlayer[]>
}
