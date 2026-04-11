import { requestJson, requestVoid } from '../lib/rest-adapter'
import type { PracticionerDto } from '../types'

export async function fetchPracticionersBySimilarName(
  token: string,
  name: string,
): Promise<PracticionerDto[]> {
  const q = name.trim()
  if (!q) throw new Error('Practicioner search name is required')

  return requestJson<PracticionerDto[]>(
    `/api/v1/practicioner/find_by_similar_name?name=${encodeURIComponent(q)}`,
    { token, fallbackErrorMessage: 'Failed to fetch practicioners' },
  )
}

export async function createPracticioner(
  token: string,
  dto: PracticionerDto,
): Promise<PracticionerDto> {
  return requestJson<PracticionerDto>('/api/v1/practicioner', {
    method: 'POST',
    token,
    jsonBody: dto,
    fallbackErrorMessage: 'Failed to create practicioner',
  })
}

export async function updatePracticioner(
  token: string,
  dto: PracticionerDto,
): Promise<PracticionerDto> {
  return requestJson<PracticionerDto>('/api/v1/practicioner', {
    method: 'PUT',
    token,
    jsonBody: dto,
    fallbackErrorMessage: 'Failed to update practicioner',
  })
}

export async function deletePracticioner(token: string, id: string): Promise<void> {
  await requestVoid(`/api/v1/practicioner/${encodeURIComponent(id)}`, {
    method: 'DELETE',
    token,
    fallbackErrorMessage: 'Failed to delete practicioner',
  })
}
