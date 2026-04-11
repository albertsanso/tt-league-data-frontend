import { requestJson, requestVoid } from '../lib/rest-adapter'
import type { ClubDto } from '../types'

export async function fetchClubById(token: string, id: string): Promise<ClubDto> {
  return requestJson<ClubDto>(`/api/v1/club/find_by_id?id=${encodeURIComponent(id)}`, {
    token,
    fallbackErrorMessage: 'Failed to fetch club',
  })
}

export async function fetchClubByName(token: string, name: string): Promise<ClubDto> {
  const q = name.trim()
  if (!q) throw new Error('Club name is required')
  return requestJson<ClubDto>(`/api/v1/club/find_by_name?name=${encodeURIComponent(q)}`, {
    token,
    fallbackErrorMessage: 'Failed to fetch club',
  })
}

export async function fetchClubsBySimilarName(token: string, name: string): Promise<ClubDto[]> {
  const q = name.trim()
  if (!q) throw new Error('Club search name is required')

  return requestJson<ClubDto[]>(
    `/api/v1/club/find_by_similar_name?name=${encodeURIComponent(q)}`,
    { token, fallbackErrorMessage: 'Failed to fetch clubs' },
  )
}

export async function createClub(token: string, dto: ClubDto): Promise<ClubDto> {
  return requestJson<ClubDto>('/api/v1/club', {
    method: 'POST',
    token,
    jsonBody: dto,
    fallbackErrorMessage: 'Failed to create club',
  })
}

export async function updateClub(token: string, dto: ClubDto): Promise<ClubDto> {
  return requestJson<ClubDto>('/api/v1/club', {
    method: 'PUT',
    token,
    jsonBody: dto,
    fallbackErrorMessage: 'Failed to update club',
  })
}

export async function deleteClub(token: string, id: string): Promise<void> {
  await requestVoid(`/api/v1/club/${encodeURIComponent(id)}`, {
    method: 'DELETE',
    token,
    fallbackErrorMessage: 'Failed to delete club',
  })
}
