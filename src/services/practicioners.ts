import { requestJson } from '../lib/rest-adapter'
import type { PracticionerDto } from '../types'

/**
 * Published OpenAPI v1 only exposes `GET /practicioner/find_by_similar_name`.
 * Create/update/delete practicioner routes are not in the contract — use other tools or wait for a new spec drop.
 */
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
