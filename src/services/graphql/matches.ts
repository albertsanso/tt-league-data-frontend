import { requestGraphql } from '../../lib/graphql-adapter'
import type { MatchSearchFilters } from '../../lib/match-search-filters'
import { MATCH_SEARCH_ALL } from '../../lib/match-search-filters'
import type { GraphqlCompetitionInput, GraphqlMatch } from '../../types'

const FIND_MATCH_BY_ID = `
  query FindMatchById($id: ID!) {
    findMatchById(id: $id) {
      id
      season
      competitionType
      competitionCategory
      competitionScope
      competitionScopeTag
      competitionGroup
      competitionGender
      matchDayNumber
      uniqueRowMatchId
      localPlayerName
      localPlayerLetter
      localPlayerScore
      visitorPlayerName
      visitorPlayerLetter
      visitorPlayerScore
      matchDateTime
    }
  }
`

export async function fetchMatchByIdGraphql(token: string, id: string): Promise<GraphqlMatch | null> {
  const data = await requestGraphql<{ findMatchById: GraphqlMatch | null }>({
    query: FIND_MATCH_BY_ID,
    variables: { id },
    token,
    fallbackErrorMessage: 'GraphQL findMatchById failed',
  })
  return data.findMatchById
}

const FIND_MATCHES_BY_SEARCH = `
  query FindMatchesBySearch(
    $season: String!
    $competitionInfo: CompetitionInput!
    $matchDayNumber: Int
    $practitionerName: String!
  ) {
    findMatchesBySeasonAndCompetitionAndMatchDayAndPracticionerName(
      season: $season
      competitionInfo: $competitionInfo
      matchDayNumber: $matchDayNumber
      practitionerName: $practitionerName
    ) {
      id
      season
      matchDayNumber
      matchDateTime
      localPlayerName
      localPlayerLetter
      localPlayerScore
      visitorPlayerName
      visitorPlayerLetter
      visitorPlayerScore
    }
  }
`

export interface FindMatchesGraphqlVariables {
  season: string
  competitionInfo: GraphqlCompetitionInput
  matchDayNumber?: number
  practitionerName: string
}

/** Subset of `GraphqlMatch` fields returned by the search query above. */
export type GraphqlMatchSearchRow = Pick<
  GraphqlMatch,
  | 'id'
  | 'season'
  | 'matchDayNumber'
  | 'matchDateTime'
  | 'localPlayerName'
  | 'localPlayerLetter'
  | 'localPlayerScore'
  | 'visitorPlayerName'
  | 'visitorPlayerLetter'
  | 'visitorPlayerScore'
>

/**
 * Maps UI filters to GraphQL variables. `season` and `practitionerName` are `String!` in
 * `schema.graphqls`; use empty string when the UI means “any” (backend treats as wildcard).
 */
export function matchSearchFiltersToGraphqlVariables(
  filters: MatchSearchFilters,
): FindMatchesGraphqlVariables {
  const competitionInfo: GraphqlCompetitionInput = {}
  if (filters.competitionScope !== MATCH_SEARCH_ALL) {
    competitionInfo.competitionScope = filters.competitionScope
  }
  if (filters.competitionScopeTag !== MATCH_SEARCH_ALL) {
    competitionInfo.competitionScopeTag = filters.competitionScopeTag
  }
  if (filters.competitionType !== MATCH_SEARCH_ALL) {
    competitionInfo.competitionType = filters.competitionType
  }
  if (filters.competitionCategory !== MATCH_SEARCH_ALL) {
    competitionInfo.competitionCategory = filters.competitionCategory
  }

  const dayTrim = filters.matchDayNumber.trim()
  let matchDayNumber: number | undefined
  if (dayTrim !== '') {
    const n = Number.parseInt(dayTrim, 10)
    if (!Number.isNaN(n)) matchDayNumber = n
  }

  return {
    season: filters.season === MATCH_SEARCH_ALL ? '' : filters.season,
    competitionInfo,
    matchDayNumber,
    practitionerName: filters.practitionerName.trim(),
  }
}

export async function findMatchesBySeasonAndCompetitionGraphql(
  token: string,
  variables: FindMatchesGraphqlVariables,
): Promise<GraphqlMatchSearchRow[]> {
  const data = await requestGraphql<{
    findMatchesBySeasonAndCompetitionAndMatchDayAndPracticionerName: GraphqlMatchSearchRow[]
  }>({
    query: FIND_MATCHES_BY_SEARCH,
    variables: {
      season: variables.season,
      competitionInfo: variables.competitionInfo,
      matchDayNumber: variables.matchDayNumber ?? null,
      practitionerName: variables.practitionerName,
    },
    token,
    fallbackErrorMessage: 'GraphQL match search failed',
  })
  return data.findMatchesBySeasonAndCompetitionAndMatchDayAndPracticionerName
}
