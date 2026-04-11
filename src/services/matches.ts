import { apiBase } from '../lib/api'
import { readApiErrorMessage } from '../lib/read-api-error'
import type { EnrichedMatchDto, FindMatchesRequestBodyDto, MatchDto } from '../types'

export async function fetchMatchById(id: string): Promise<MatchDto> {
  const res = await fetch(`${apiBase}/api/v1/match/${encodeURIComponent(id)}`)
  if (!res.ok) {
    const detail = await readApiErrorMessage(res)
    throw new Error(detail ?? 'Failed to fetch match')
  }
  return res.json() as Promise<MatchDto>
}

export async function findEnrichedMatches(
  body: FindMatchesRequestBodyDto
): Promise<EnrichedMatchDto[]> {
  const res = await fetch(`${apiBase}/api/v1/match/enriched/find_matches`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const detail = await readApiErrorMessage(res)
    throw new Error(detail ?? 'Failed to find matches')
  }
  return res.json() as Promise<EnrichedMatchDto[]>
}
