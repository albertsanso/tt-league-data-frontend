import { requestJson } from '../lib/rest-adapter'
import type { EnrichedMatchDto, FindMatchesRequestBodyDto, MatchDto } from '../types'

export async function fetchMatchById(token: string, id: string): Promise<MatchDto> {
  return requestJson<MatchDto>(`/api/v1/match/${encodeURIComponent(id)}`, {
    token,
    fallbackErrorMessage: 'Failed to fetch match',
  })
}

export async function findEnrichedMatches(
  token: string,
  body: FindMatchesRequestBodyDto,
): Promise<EnrichedMatchDto[]> {
  return requestJson<EnrichedMatchDto[]>('/api/v1/match/enriched/find_matches', {
    method: 'POST',
    token,
    jsonBody: body,
    fallbackErrorMessage: 'Failed to find matches',
  })
}
