export interface Club {
  id: string
  name: string
}

export interface Player {
  id: string
  firstName: string
  lastName: string
  clubId: string
}

export interface SeasonPlayer {
  id: string
  playerId: string
  season: string
  license: string
}

export interface SeasonPlayerResult {
  id: string
  seasonPlayerId: string
  matchId: string
  score: number
}

export interface PlayersSingleMatch {
  id: string
  homeSeasonPlayerId: string
  awaySeasonPlayerId: string
  date: string
  results: SeasonPlayerResult[]
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
