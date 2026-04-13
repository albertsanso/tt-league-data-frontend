import type { GraphqlMatchSearchRow } from '../services/graphql/matches'

/** Slot letter order for practitioner match distribution charts (bar chart, etc.). */
export const SCATTER_LETTER_ORDER = ['A', 'B', 'C', 'X', 'Y', 'Z'] as const

export type ScatterLetter = (typeof SCATTER_LETTER_ORDER)[number]

const SCATTER_LETTER_SET: ReadonlySet<string> = new Set(SCATTER_LETTER_ORDER)

export function normalizePractitionerName(name: string): string {
  return name.trim().toLowerCase()
}

export type PractitionerMatchSide = 'home' | 'away' | 'unknown'

/** Home = local, away = visitor (GraphQL field names). */
export function getPractitionerSide(
  row: GraphqlMatchSearchRow,
  fullName: string,
): PractitionerMatchSide {
  const n = normalizePractitionerName(fullName)
  const local = normalizePractitionerName(row.localPlayerName)
  const visitor = normalizePractitionerName(row.visitorPlayerName)
  if (n === local) return 'home'
  if (n === visitor) return 'away'
  return 'unknown'
}

export function parseMatchScore(score: string): number | null {
  const t = score.trim()
  if (t === '') return null
  const n = Number.parseInt(t, 10)
  return Number.isNaN(n) ? null : n
}

export type PractitionerMatchOutcome = 'win' | 'loss' | 'tie' | 'unscored'

export function getOutcomeForPractitioner(
  row: GraphqlMatchSearchRow,
  fullName: string,
): PractitionerMatchOutcome {
  const side = getPractitionerSide(row, fullName)
  if (side === 'unknown') return 'unscored'
  const home = parseMatchScore(row.localPlayerScore)
  const away = parseMatchScore(row.visitorPlayerScore)
  if (home === null || away === null) return 'unscored'
  const own = side === 'home' ? home : away
  const opp = side === 'home' ? away : home
  if (own > opp) return 'win'
  if (own < opp) return 'loss'
  return 'tie'
}

function isScatterLetter(s: string): s is ScatterLetter {
  return SCATTER_LETTER_SET.has(s)
}

/**
 * Slot letter (A–C, X–Z) for the practitioner in this row, if side and scores are valid for charting.
 * Same eligibility as the former scatter chart (ties still counted via `getOutcomeForPractitioner`).
 */
function getEligibleLetterForPractitioner(
  row: GraphqlMatchSearchRow,
  fullName: string,
): ScatterLetter | null {
  const side = getPractitionerSide(row, fullName)
  if (side === 'unknown') return null
  const letterRaw = (side === 'home' ? row.localPlayerLetter : row.visitorPlayerLetter).trim().toUpperCase()
  if (!isScatterLetter(letterRaw)) return null
  const ownScore = parseMatchScore(side === 'home' ? row.localPlayerScore : row.visitorPlayerScore)
  if (ownScore === null) return null
  return letterRaw
}

export interface MatchOutcomeSummary {
  total: number
  wins: number
  losses: number
  ties: number
  unscored: number
}

export interface WinsLossesByLetter {
  wins: number
  losses: number
}

/**
 * Win/loss counts per slot letter (A–C, X–Z), same eligibility as the former scatter chart.
 * Ties and unscored matches are omitted.
 */
export function summarizeWinsLossesByLetter(
  matches: GraphqlMatchSearchRow[],
  fullName: string,
): Record<ScatterLetter, WinsLossesByLetter> {
  const byLetter = Object.fromEntries(
    SCATTER_LETTER_ORDER.map((L) => [L, { wins: 0, losses: 0 }]),
  ) as Record<ScatterLetter, WinsLossesByLetter>
  for (const m of matches) {
    const letter = getEligibleLetterForPractitioner(m, fullName)
    if (!letter) continue
    const o = getOutcomeForPractitioner(m, fullName)
    if (o === 'win') byLetter[letter].wins += 1
    else if (o === 'loss') byLetter[letter].losses += 1
  }
  return byLetter
}

export function summarizeMatchOutcomes(
  matches: GraphqlMatchSearchRow[],
  fullName: string,
): MatchOutcomeSummary {
  let wins = 0
  let losses = 0
  let ties = 0
  let unscored = 0
  for (const m of matches) {
    const o = getOutcomeForPractitioner(m, fullName)
    if (o === 'win') wins += 1
    else if (o === 'loss') losses += 1
    else if (o === 'tie') ties += 1
    else unscored += 1
  }
  return { total: matches.length, wins, losses, ties, unscored }
}

export function outcomeToneFromOutcome(
  outcome: PractitionerMatchOutcome,
): 'win' | 'loss' | 'tie' | undefined {
  if (outcome === 'unscored') return undefined
  return outcome
}
