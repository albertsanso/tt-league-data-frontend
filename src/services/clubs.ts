import { apiBase } from '../lib/api'
import { readApiErrorMessage } from '../lib/read-api-error'
import type { ClubDto } from '../types'

export async function fetchClubsBySimilarName(name: string): Promise<ClubDto[]> {
  const q = name.trim()
  if (!q) throw new Error('Club search name is required')

  const res = await fetch(
    `${apiBase}/api/v1/club/find_by_similar_name?name=${encodeURIComponent(q)}`
  )
  if (!res.ok) {
    const detail = await readApiErrorMessage(res)
    throw new Error(detail ?? 'Failed to fetch clubs')
  }
  return res.json() as Promise<ClubDto[]>
}
