/** Mirrors `components.schemas` in root `openapi.yaml` (tt-data-league-api v1). */

export interface ClubDto {
  id: string
  name: string
  yearRanges?: string[]
}

export interface PracticionerDto {
  id: string
  fullName: string
  firstName?: string
  secondName?: string
  birthDate?: string
}

export interface SeasonPlayerDto {
  id: string
  clubMemberId: string
  licenseId: string
  licenseTag: string
  yearRange: string
}

export interface CompetitionInfoDto {
  type?: string
  category?: string
  scope?: string
  scopeTag?: string
  group?: string
  gender?: string
}

export interface MatchSeasonPlayerResultDto {
  seasonPlayer?: SeasonPlayerDto
  matchDay?: string
  matchDayNumber?: number
  matchGamePoints?: string
  matchGamesWon?: number
  matchPlayerLetter?: string
}

export interface MatchDto {
  id: string
  homeTeam: string
  awayTeam: string
  matchDate: string
  homeScore?: number
  awayScore?: number
}

export interface FindMatchesRequestBodyDto {
  season: string
  matchDayNumber: number
  competitionType?: string
  competitionCategory?: string
  competitionScope?: string
  competitionScopeTag?: string
  competitionGroup?: string
  competitionGender?: string
  practitionerName?: string
}

export interface EnrichedMatchDto {
  id: string
  season: string
  competitionInfo: CompetitionInfoDto
  matchDayNumber: number
  playerLocalResultDto?: MatchSeasonPlayerResultDto
  playerVisitorResultDto?: MatchSeasonPlayerResultDto
  uniqueRowMatchId?: string
}

export interface SeasonPlayerResultDto {
  competitionInfo?: CompetitionInfoDto
  seasonPlayer?: SeasonPlayerDto
  matchDay?: string
  matchDayNumber?: number
  matchGamePoints?: string
  matchGamesWon?: number
  matchLinkageId?: string
  matchPlayerLetter?: string
}

export interface Users {
  username: string
  password: string
  id?: number
}

export interface ErrorResponse {
  code: string
  message: string
  details?: Record<string, unknown>
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
