import { MATCH_SEARCH_ALL } from './match-search-filters'
import type { GraphqlMatchSearchRow } from '../services/graphql/matches'

export interface StatsFilterOptions {
  competitionScopes: string[]
  competitionTypes: string[]
  competitionCategories: string[]
}

export function buildStatsFilterOptions(matches: GraphqlMatchSearchRow[]): StatsFilterOptions {
  const scopes = new Set<string>()
  const types = new Set<string>()
  const categories = new Set<string>()
  for (const m of matches) {
    const cs = m.competitionScope.trim()
    if (cs) scopes.add(cs)
    const ty = m.competitionType.trim()
    if (ty) types.add(ty)
    const cat = m.competitionCategory.trim()
    if (cat) categories.add(cat)
  }
  return {
    competitionScopes: [...scopes].sort((a, b) => a.localeCompare(b)),
    competitionTypes: [...types].sort((a, b) => a.localeCompare(b)),
    competitionCategories: [...categories].sort((a, b) => a.localeCompare(b)),
  }
}

export interface StatsFilterSelection {
  competitionScope: string
  competitionType: string
  competitionCategory: string
}

export const DEFAULT_STATS_FILTER_SELECTION: StatsFilterSelection = {
  competitionScope: MATCH_SEARCH_ALL,
  competitionType: MATCH_SEARCH_ALL,
  competitionCategory: MATCH_SEARCH_ALL,
}

export function filterMatchesForStats(
  matches: GraphqlMatchSearchRow[],
  sel: StatsFilterSelection,
): GraphqlMatchSearchRow[] {
  return matches.filter((row) => {
    if (sel.competitionScope !== MATCH_SEARCH_ALL) {
      if (row.competitionScope.trim() !== sel.competitionScope) return false
    }
    if (sel.competitionType !== MATCH_SEARCH_ALL) {
      if (row.competitionType.trim() !== sel.competitionType) return false
    }
    if (sel.competitionCategory !== MATCH_SEARCH_ALL) {
      if (row.competitionCategory.trim() !== sel.competitionCategory) return false
    }
    return true
  })
}
