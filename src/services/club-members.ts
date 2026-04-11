import { requestJson } from '../lib/rest-adapter'
import type { ClubMemberCreateDto, ClubMemberDto, EnrichedClubMemberDto } from '../types'

export async function createClubMember(
  token: string,
  dto: ClubMemberCreateDto,
): Promise<ClubMemberDto> {
  return requestJson<ClubMemberDto>('/api/v1/club_member', {
    method: 'POST',
    token,
    jsonBody: dto,
    fallbackErrorMessage: 'Failed to create club member',
  })
}

export async function fetchClubMembersByClubId(token: string, clubId: string): Promise<ClubMemberDto[]> {
  return requestJson<ClubMemberDto[]>(
    `/api/v1/club_member/find_by_club_id/${encodeURIComponent(clubId)}`,
    { token, fallbackErrorMessage: 'Failed to fetch club members' },
  )
}

export async function fetchEnrichedClubMembersByClubId(
  token: string,
  clubId: string,
): Promise<EnrichedClubMemberDto[]> {
  return requestJson<EnrichedClubMemberDto[]>(
    `/api/v1/club_member/enriched/find_by_club_id/${encodeURIComponent(clubId)}`,
    { token, fallbackErrorMessage: 'Failed to fetch club members' },
  )
}

export async function fetchClubMembersByPracticionerId(
  token: string,
  practicionerId: string,
): Promise<ClubMemberDto[]> {
  return requestJson<ClubMemberDto[]>(
    `/api/v1/club_member/find_by_practicioner_id/${encodeURIComponent(practicionerId)}`,
    { token, fallbackErrorMessage: 'Failed to fetch club members' },
  )
}
