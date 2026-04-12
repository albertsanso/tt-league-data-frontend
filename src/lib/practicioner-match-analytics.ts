import type { GraphqlMatchSearchRow } from '../services/graphql/matches'

/** Y-axis letter order for the practitioner match scatter chart (spec). */
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

/** Deterministic pseudo-random in [0, 1) for stable jitter per match id. */
function stableUnitFromId(seed: string, salt: string): number {
  let h = 0
  const s = seed + salt
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0
  return (h % 10007) / 10007
}

export interface PractitionerScatterPoint {
  /** Own score clamped to [0, 3], with tiny jitter for overlapping points. */
  x: number
  /** Index in `SCATTER_LETTER_ORDER` with tiny jitter. */
  y: number
  yLabel: ScatterLetter
}

/**
 * One scatter point per match: X = own points (clamped 0–3), Y = assigned letter A/B/C/X/Y/Z.
 * Returns null if side unknown, scores invalid, or letter not in the allowed set.
 */
/** Practitioner’s own score clamped to [0, 3] for display (no jitter). */
export function getOwnScoreClamped(row: GraphqlMatchSearchRow, fullName: string): number | null {
  const side = getPractitionerSide(row, fullName)
  if (side === 'unknown') return null
  const ownScore = parseMatchScore(side === 'home' ? row.localPlayerScore : row.visitorPlayerScore)
  if (ownScore === null) return null
  return Math.min(3, Math.max(0, ownScore))
}

export function getScatterPoint(
  row: GraphqlMatchSearchRow,
  fullName: string,
): PractitionerScatterPoint | null {
  const side = getPractitionerSide(row, fullName)
  if (side === 'unknown') return null
  const letterRaw = (side === 'home' ? row.localPlayerLetter : row.visitorPlayerLetter).trim().toUpperCase()
  if (!isScatterLetter(letterRaw)) return null
  const ownScore = parseMatchScore(side === 'home' ? row.localPlayerScore : row.visitorPlayerScore)
  if (ownScore === null) return null
  const clamped = Math.min(3, Math.max(0, ownScore))
  const yIndex = SCATTER_LETTER_ORDER.indexOf(letterRaw)
  const jx = (stableUnitFromId(row.id, 'x') - 0.5) * 0.14
  const jy = (stableUnitFromId(row.id, 'y') - 0.5) * 0.22
  return { x: clamped + jx, y: yIndex + jy, yLabel: letterRaw }
}

export interface MatchOutcomeSummary {
  total: number
  wins: number
  losses: number
  ties: number
  unscored: number
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
