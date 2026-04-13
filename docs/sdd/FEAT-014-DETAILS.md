# FEAT-014 — Feature details

Remove the practitioner match scatter (“point cloud”) chart from the Practicioner details **Stats** tab. Extend match search results with competition metadata, add client-side Stats filters that narrow the win/loss bar chart, and show competition fields on match cards.

---

# Build Plan

1. **Extend GraphQL match search payload and types** (`src/services/graphql/matches.ts`)
   - In `FIND_MATCHES_BY_SEARCH`, request fields present on `Match` in `schema.graphqls` and needed by filters/cards: `competitionType`, `competitionCategory`, `competitionScope`, `competitionScopeTag`.
   - Extend `GraphqlMatchSearchRow` (`Pick<GraphqlMatch, …>`) to include those fields.
   - **Blocker:** if `findMatchesBySeasonAndCompetitionAndMatchDayAndPracticionerName` does not resolve these fields, coordinate with the backend before merging UI that depends on them.

2. **Remove the scatter chart** (`src/components/features/practicioners/PracticionerDetailsPanel.tsx`)
   - Remove `PractitionerMatchScatterChart` import and usage from the Stats tab.
   - Delete `PractitionerMatchScatterChart.tsx` if it exists and nothing else imports it.

3. **Stats filters + filtered subset** (`src/lib/practitioner-stats-match-filter.ts`, `PracticionerDetailsPanel.tsx`)
   - After a successful match load for the selected season, derive option lists from `matchesState.data` (unique non-empty strings, sensible sort):
     - `competitionScope`, `competitionScopeTag`, `competitionType`
     - `matchDayNumber` (sort numerically where possible)
     - Player names from `localPlayerName` and `visitorPlayerName` (filter: row matches if the selected name equals local or visitor, or sentinel **All**)
   - Reuse `MATCH_SEARCH_ALL` from `src/lib/match-search-filters.ts` for “All”.
   - Local state per dimension; reset to defaults when the season changes.
   - `useMemo` → `filteredMatchesForStats` (AND-combine predicates).
   - Pass `filteredMatchesForStats` into `PractitionerMatchDistributionBarChart`; show “Showing *n* of *N* matches” and a short message when filters exclude every row but *N* &gt; 0.
   - Chart footnote for omitted matches should use summaries over the **filtered** set where applicable.

4. **Match cards: competition fields** (`src/components/features/matches/MatchResultCard.tsx`)
   - Display competition scope, type, and category in a compact meta row; use `—` (or equivalent) when a value is missing.

5. **Analytics cleanup** (`src/lib/practicioner-match-analytics.ts`)
   - Remove scatter-only exports (`getScatterPoint`, `getOwnScoreClamped`, `PractitionerScatterPoint`, jitter helpers).
   - Keep bar-chart eligibility aligned with the old scatter rules via an internal helper (e.g. `getEligibleLetterForPractitioner`) used by `summarizeWinsLossesByLetter`.

6. **Verify**
   - `npm run type-check`, `npm run lint`, `npm run build`.
   - Manual: practitioner with matches → Stats filters change the bar chart; Matches tab cards show competition lines; scatter chart gone.

---

# Implementation Guidelines

- Reuse existing patterns: `MATCH_SEARCH_ALL`, `matchSeasonOptionsDescending`, Tailwind + `cn()`.
- Keep filter construction and filtering **pure** in `practitioner-stats-match-filter.ts` where possible.
- Do not change `openapi.yaml`. GraphQL contract: align only with repo `schema.graphqls` / backend.
- Follow `AGENTS.md` / `CLAUDE.md`: no raw `fetch` in components; GraphQL stays in `src/services/graphql/`.

---

# Notes

- **Depends on FEAT-013:** bar chart and Stats layout; FEAT-014 removes scatter and narrows stats via filters.
- **Product default:** Stats remains **analytics only** (bar chart + filters); full match and club lists stay on their tabs unless product decides otherwise.
- **SDD drift:** [FEAT-013-DETAILS.md](./FEAT-013-DETAILS.md) and [FEAT-012-DETAILS.md](./FEAT-012-DETAILS.md) may still mention `getScatterPoint` / scatter chart; update those docs when refreshing historical accuracy.
- Registry: FEAT-014 is listed under **Done** in [FEATURES.md](./FEATURES.md) with the acceptance criterion ticked.
