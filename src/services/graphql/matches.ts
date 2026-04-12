import { requestGraphql } from '../../lib/graphql-adapter'
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
  | 'matchDateTime'
  | 'localPlayerName'
  | 'localPlayerLetter'
  | 'localPlayerScore'
  | 'visitorPlayerName'
  | 'visitorPlayerLetter'
  | 'visitorPlayerScore'
>

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
