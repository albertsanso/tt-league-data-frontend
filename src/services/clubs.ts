import { apiBase, bearerAuth, jsonAuthHeaders } from '../lib/api'
import { readApiErrorMessage } from '../lib/read-api-error'
import type { ClubDto } from '../types'

export async function fetchClubsBySimilarName(token: string, name: string): Promise<ClubDto[]> {
  const q = name.trim()
  if (!q) throw new Error('Club search name is required')

  const res = await fetch(
    `${apiBase}/api/v1/club/find_by_similar_name?name=${encodeURIComponent(q)}`,
    { headers: bearerAuth(token) },
  )
  if (!res.ok) {
    const detail = await readApiErrorMessage(res)
    throw new Error(detail ?? 'Failed to fetch clubs')
  }
  return res.json() as Promise<ClubDto[]>
}

export async function createClub(token: string, dto: ClubDto): Promise<ClubDto> {
  const res = await fetch(`${apiBase}/api/v1/club`, {
    method: 'POST',
    headers: jsonAuthHeaders(token),
    body: JSON.stringify(dto),
  })
  if (!res.ok) {
    const detail = await readApiErrorMessage(res)
    throw new Error(detail ?? 'Failed to create club')
  }
  return res.json() as Promise<ClubDto>
}

export async function updateClub(token: string, dto: ClubDto): Promise<ClubDto> {
  const res = await fetch(`${apiBase}/api/v1/club`, {
    method: 'PUT',
    headers: jsonAuthHeaders(token),
    body: JSON.stringify(dto),
  })
  if (!res.ok) {
    const detail = await readApiErrorMessage(res)
    throw new Error(detail ?? 'Failed to update club')
  }
  return res.json() as Promise<ClubDto>
}

export async function deleteClub(token: string, id: string): Promise<void> {
  const res = await fetch(`${apiBase}/api/v1/club/${encodeURIComponent(id)}`, {
    method: 'DELETE',
    headers: bearerAuth(token),
  })
  if (!res.ok) {
    const detail = await readApiErrorMessage(res)
    throw new Error(detail ?? 'Failed to delete club')
  }
}
