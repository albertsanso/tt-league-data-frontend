import { requestGraphql } from '../../lib/graphql-adapter'

const FIND_PRACTICIONER_MEMBERSHIPS = `
  query FindPracticionerMemberships($id: ID!) {
    findPracticionerById(id: $id) {
      id
      fullName
      memberships {
        id
        yearRanges
        club {
          id
          name
        }
      }
    }
  }
`

export interface GraphqlClubMembershipRow {
  id: string
  yearRanges: string[]
  club: { id: string; name: string }
}

export interface GraphqlPracticionerWithMemberships {
  id: string
  fullName: string
  memberships: GraphqlClubMembershipRow[]
}

export async function fetchPracticionerMembershipsGraphql(
  token: string,
  practicionerId: string,
): Promise<GraphqlPracticionerWithMemberships | null> {
  const data = await requestGraphql<{ findPracticionerById: GraphqlPracticionerWithMemberships | null }>({
    query: FIND_PRACTICIONER_MEMBERSHIPS,
    variables: { id: practicionerId },
    token,
    fallbackErrorMessage: 'GraphQL findPracticionerById failed',
  })
  return data.findPracticionerById
}
