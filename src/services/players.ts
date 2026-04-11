import { requestJson } from '../lib/rest-adapter'
import type { SeasonPlayerDto } from '../types'

export async function fetchSeasonPlayersByName(
  token: string,
  name: string,
): Promise<SeasonPlayerDto[]> {
  return requestJson<SeasonPlayerDto[]>(
    `/api/v1/season_player/search_by_name/${encodeURIComponent(name)}`,
    { token, fallbackErrorMessage: 'Failed to fetch season players' },
  )
}

export async function fetchSeasonPlayersByPracticionerId(
  token: string,
  practicionerId: string,
): Promise<SeasonPlayerDto[]> {
  return requestJson<SeasonPlayerDto[]>(
    `/api/v1/season_player/find_by_practicioner/${encodeURIComponent(practicionerId)}`,
    { token, fallbackErrorMessage: 'Failed to fetch season players' },
  )
}
