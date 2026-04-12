/** Mirrors `components.schemas` in root `openapi.yaml` (tt-data-league-api v1). */

export interface ClubDto {
  id: string
  name: string
  /** Not listed in OpenAPI `ClubDto`; included for forms/APIs that accept season ranges. */
  yearRanges?: string[]
}

export interface PracticionerDto {
  id: string
  fullName: string
  firstName: string
  secondName: string
  birthDate: string
}

export interface SeasonPlayerDto {
  id: string
  clubMemberId: string
  licenseId: string
  licenseTag: string
  yearRange: string
}

/** Body for `POST /season_player` when the server assigns `id`. */
export type SeasonPlayerCreateDto = Omit<SeasonPlayerDto, 'id'> & { id?: string }

export interface ClubMemberDto {
  id: string
  clubId: string
  practicionerId: string
}

/** Body for `POST /club_member` when the server assigns `id`. */
export type ClubMemberCreateDto = Omit<ClubMemberDto, 'id'> & { id?: string }

export interface EnrichedClubMemberDto {
  id: string
  club: ClubDto
  practicioner: PracticionerDto
}

export interface LicenseDto {
  licenseId: string
  licenseTag: string
}

export interface CompetitionInfoDto {
  type: string
  category: string
  scope: string
  scopeTag: string
  group: string
  gender: string
}

export interface MatchSeasonPlayerResultDto {
  seasonPlayer: SeasonPlayerDto
  matchDay: string
  matchDayNumber: number
  matchGamePoints: string
  matchGamesWon: number
  matchPlayerLetter: string
}

export interface MatchDto {
  id: string
  homeTeam: string
  awayTeam: string
  matchDate: string
  homeScore: number
  awayScore: number
}

export interface FindMatchesRequestBodyDto {
  season: string
  matchDayNumber: number
  competitionType: string
  competitionCategory: string
  competitionScope: string
  competitionScopeTag: string
  competitionGroup: string
  competitionGender: string
  practitionerName: string
}

export interface EnrichedMatchDto {
  id: string
  season: string
  competitionInfo: CompetitionInfoDto
  matchDayNumber: number
  playerLocalResultDto: MatchSeasonPlayerResultDto
  playerVisitorResultDto: MatchSeasonPlayerResultDto
  uniqueRowMatchId: string
}

/** `Match` from root `schema.graphqls` (GraphQL); not the same shape as REST `MatchDto`. */
export interface GraphqlMatch {
  id: string
  season: string
  competitionType: string
  competitionCategory: string
  competitionScope: string
  competitionScopeTag: string
  competitionGroup: string
  competitionGender: string
  matchDayNumber: string
  uniqueRowMatchId: string
  localPlayerName: string
  localPlayerLetter: string
  localPlayerScore: string
  visitorPlayerName: string
  visitorPlayerLetter: string
  visitorPlayerScore: string
  matchDateTime: string
}

/** `CompetitionInput` in `schema.graphqls` for GraphQL variables. */
export interface GraphqlCompetitionInput {
  competitionType?: string
  competitionCategory?: string
  competitionScope?: string
  competitionScopeTag?: string
  competitionGroup?: string
  competitionGender?: string
}

export interface SeasonPlayerResultDto {
  competitionInfo: CompetitionInfoDto
  seasonPlayer: SeasonPlayerDto
  matchDay: string
  matchDayNumber: number
  matchGamePoints: string
  matchGamesWon: number
  matchLinkageId: string
  matchPlayerLetter: string
}

/** OpenAPI `RegisterRequest` lists extra generated noise; the API accepts these fields. */
export interface RegisterCredentials {
  username: string
  email: string
  password: string
}

export interface AuthCredentials {
  username: string
  password: string
}

export interface LoginResponse {
  token: string
  type: string
  username: string
}

export interface AuthSession {
  username: string
  token: string
}

export interface ErrorResponse {
  code: string
  message: string
  details?: Record<string, unknown>
}

/** Same shape as `ErrorResponseDto` in OpenAPI (code + message only). */
export interface ErrorResponseDto {
  code: string
  message: string
}
