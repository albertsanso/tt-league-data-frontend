import { apiBase } from '../lib/api'
import { readApiErrorMessage } from '../lib/read-api-error'
import type { SeasonPlayerDto } from '../types'

export async function fetchSeasonPlayersByName(name: string): Promise<SeasonPlayerDto[]> {
  const res = await fetch(
    `${apiBase}/api/v1/season_player/search_by_name/${encodeURIComponent(name)}`
  )
  if (!res.ok) {
    const detail = await readApiErrorMessage(res)
    throw new Error(detail ?? 'Failed to fetch season players')
  }
  return res.json() as Promise<SeasonPlayerDto[]>
}

export async function fetchSeasonPlayersByPracticionerId(
  practicionerId: string
): Promise<SeasonPlayerDto[]> {
  const res = await fetch(
    `${apiBase}/api/v1/season_player/find_by_practicioner/${encodeURIComponent(practicionerId)}`
  )
  if (!res.ok) {
    const detail = await readApiErrorMessage(res)
    throw new Error(detail ?? 'Failed to fetch season players')
  }
  return res.json() as Promise<SeasonPlayerDto[]>
}
