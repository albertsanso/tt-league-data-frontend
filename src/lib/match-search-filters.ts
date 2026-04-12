/** Sentinel for “-All-” selectors; maps to omitted GraphQL input fields or wildcard strings where the schema requires `String!`. */
export const MATCH_SEARCH_ALL = '__ALL__' as const

export type MatchSearchAll = typeof MATCH_SEARCH_ALL

export interface MatchSearchFilters {
  season: string | MatchSearchAll
  competitionScope: string | MatchSearchAll
  competitionScopeTag: string | MatchSearchAll
  competitionType: string | MatchSearchAll
  competitionCategory: string | MatchSearchAll
  matchDayNumber: string
  practitionerName: string
}

export const MATCH_SEASON_OPTIONS: readonly (string | MatchSearchAll)[] = [
  '2018-2019',
  '2019-2020',
  '2020-2021',
  '2021-2022',
  '2022-2023',
  '2023-2024',
  '2024-2025',
]

export const MATCH_COMPETITION_SCOPE_OPTIONS: readonly (string | MatchSearchAll)[] = [
  MATCH_SEARCH_ALL,
  'provincial',
  'nacional',
]

export const MATCH_COMPETITION_SCOPE_TAG_OPTIONS: readonly (string | MatchSearchAll)[] = [
  MATCH_SEARCH_ALL,
  'esp',
  'bcn',
]

export const MATCH_COMPETITION_TYPE_OPTIONS: readonly (string | MatchSearchAll)[] = [
  MATCH_SEARCH_ALL,
  'senior',
  'SENIOR',
  'VETERANS',
]

export const MATCH_COMPETITION_CATEGORY_OPTIONS: readonly (string | MatchSearchAll)[] = [
  MATCH_SEARCH_ALL,
  'divisio-honor',
  'primera-nacional',
  'segona-nacional',
  'super-divisio',
  'BCN_SENIOR_PROVINCIAL_1A',
  'BCN_SENIOR_PROVINCIAL_2A_A',
  'BCN_SENIOR_PROVINCIAL_2A_B',
  'BCN_SENIOR_PROVINCIAL_3A_A',
  'BCN_SENIOR_PROVINCIAL_3A_B',
  'BCN_SENIOR_PROVINCIAL_4A',
  'BCN_VETERANS_1A',
  'BCN_VETERANS_2A_A',
  'BCN_VETERANS_2A_B',
  'BCN_VETERANS_3A_A',
  'BCN_VETERANS_3A_B',
  'BCN_VETERANS_4A_A',
  'BCN_VETERANS_4A_B',
]

export function defaultMatchSearchFilters(): MatchSearchFilters {
  return {
    season: MATCH_SEARCH_ALL,
    competitionScope: MATCH_SEARCH_ALL,
    competitionScopeTag: MATCH_SEARCH_ALL,
    competitionType: MATCH_SEARCH_ALL,
    competitionCategory: MATCH_SEARCH_ALL,
    matchDayNumber: '',
    practitionerName: '',
  }
}

export function matchSearchAllLabel(value: string | MatchSearchAll): string {
  return value === MATCH_SEARCH_ALL ? '-All-' : value
}
