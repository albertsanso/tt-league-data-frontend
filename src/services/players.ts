import { requestJson, requestVoid } from '../lib/rest-adapter'
import type { SeasonPlayerCreateDto, SeasonPlayerDto } from '../types'

export async function fetchSeasonPlayersByName(
  token: string,
  name: string,
): Promise<SeasonPlayerDto[]> {
  const q = name.trim()
  if (!q) throw new Error('Season player search name is required')
  return requestJson<SeasonPlayerDto[]>(
    `/api/v1/season_player/search_by_name/${encodeURIComponent(q)}`,
    { token, fallbackErrorMessage: 'Failed to fetch season players' },
  )
}

export async function fetchSeasonPlayersByNames(
  token: string,
  names: string,
): Promise<SeasonPlayerDto[]> {
  const q = names.trim()
  if (!q) throw new Error('Season player names query is required')
  return requestJson<SeasonPlayerDto[]>(
    `/api/v1/season_player/search_by_names/${encodeURIComponent(q)}`,
    { token, fallbackErrorMessage: 'Failed to fetch season players' },
  )
}

export async function fetchSeasonPlayersByLicense(token: string): Promise<SeasonPlayerDto[]> {
  return requestJson<SeasonPlayerDto[]>('/api/v1/season_player/find_by_license', {
    method: 'POST',
    token,
    fallbackErrorMessage: 'Failed to fetch season players',
  })
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

export async function createSeasonPlayer(
  token: string,
  dto: SeasonPlayerCreateDto,
): Promise<SeasonPlayerDto> {
  return requestJson<SeasonPlayerDto>('/api/v1/season_player', {
    method: 'POST',
    token,
    jsonBody: dto,
    fallbackErrorMessage: 'Failed to create season player',
  })
}

export async function fetchSeasonPlayerById(token: string, id: string): Promise<SeasonPlayerDto> {
  return requestJson<SeasonPlayerDto>(`/api/v1/season_player/${encodeURIComponent(id)}`, {
    token,
    fallbackErrorMessage: 'Failed to fetch season player',
  })
}

export async function deleteSeasonPlayer(token: string, id: string): Promise<void> {
  await requestVoid(`/api/v1/season_player/${encodeURIComponent(id)}`, {
    method: 'DELETE',
    token,
    fallbackErrorMessage: 'Failed to delete season player',
  })
}
