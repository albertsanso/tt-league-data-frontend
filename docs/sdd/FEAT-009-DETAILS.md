# FEAT-009 — Matches search page

# Build Plan

1. **Constants (filter options)**  
   Add a small module (e.g. `src/components/features/matches/match-search-options.ts` or `src/lib/match-search-filters.ts`) exporting the literal option lists from [`FEATURES.md`](./FEATURES.md) (FEAT-009): seasons, competition scope, scope tag, type, category. Use a single sentinel value for “-All-” (e.g. `ALL`) so the UI and variable builder stay in sync.

2. **GraphQL service alignment**  
   In `src/services/graphql/matches.ts`:
   - Extend `FIND_MATCHES_BY_SEARCH` to request **`matchDayNumber`** (required on result cards per acceptance criteria; currently omitted from the selection set).
   - Keep using `findMatchesBySeasonAndCompetitionAndMatchDayAndPracticionerName` with `requestGraphql` and Bearer `token` (same pattern as `findMatchesBySeasonAndCompetitionGraphql`).
   - Add a thin helper (e.g. `buildMatchSearchVariables` or inline in the service) that maps form state → GraphQL variables: only include `CompetitionInput` fields when the user did not select “-All-”; omit `matchDayNumber` when the text field is empty (pass `null` for the variable as today).

3. **Schema vs product spec (required)**  
   In root [`schema.graphqls`](../../schema.graphqls), `season` and `practitionerName` are **`String!`**. The registry text says to omit them when “-All-” or when unspecified — that is only possible if the **backend** treats certain sentinels (e.g. empty string) as wildcards, or if the schema is relaxed. **Before shipping:** confirm with the API how “all seasons” and “any practitioner” are expressed; adjust variables accordingly. Do not hand-edit `schema.graphqls` in this repo except by replacing it from the backend ([`AGENTS.md`](../../AGENTS.md)).

4. **Feature UI**  
   Under `src/components/features/matches/`:
   - **`MatchesSearchForm`**: controlled fields for season, competition scope, scope tag, type, match day number (text), practitioner name (text), competition category; submit triggers search; **Clear filters** resets to “-All-” / empty and clears errors (optionally clear results or leave last results — default: reset form only; re-search after clear if you want empty state explicit).
   - **`MatchesSearchPage`**: `useAuth()` for `session?.token`; loading / error / empty states mirroring [`ClubsSearchPage.tsx`](../../src/components/features/clubs/ClubsSearchPage.tsx); call `findMatchesBySeasonAndCompetitionGraphql` on submit; store full result array in state.
   - **Result cards**: one card per row with **season**, **matchDayNumber**, **home** = GraphQL **local** (`localPlayerLetter`, `localPlayerName`, `localPlayerScore`), **away** = **visitor** (`visitorPlayerLetter`, `visitorPlayerName`, `visitorPlayerScore`).
   - **Pagination**: client-side window of **10** items per page (same pattern as clubs: `PAGE_SIZE = 10`, `useMemo` slice, prev/next). Reuse the UX pattern from [`ClubsPagination.tsx`](../../src/components/features/clubs/ClubsPagination.tsx) — either a `MatchesPagination` sibling or extract a shared primitive only if duplication becomes painful (keep scope small for this feature).

5. **Route and nav**  
   - Register a protected route (e.g. `matches` or `matches-search`) in [`src/router.tsx`](../../src/router.tsx), lazy-loaded like `ClubsSearch` / `PracticionersSearch`.
   - Add `{ to: '…', label: 'Matches search', icon: … }` to [`src/components/layout/protected-nav.ts`](../../src/components/layout/protected-nav.ts) (pick an appropriate `lucide-react` icon, e.g. `Trophy` or `Swords`).
   - Wire a page shell in `src/pages/` (`PageWrapper` title **Matches search**) that renders `MatchesSearchPage`, consistent with [`ClubsSearch.tsx`](../../src/pages/ClubsSearch.tsx).

6. **Types**  
   Extend `GraphqlMatchSearchRow` in the graphql matches service (or `src/types/index.ts` if you prefer a single export) to include `matchDayNumber` once the query returns it.

7. **Verification**  
   Run `npm run type-check` and `npm run lint`. Manually: sign in, open **Matches search**, run a query that returns data, paginate, clear filters.

# Implementation Guidelines

- **HTTP:** GraphQL only for this feature; no new REST paths. Use `src/lib/graphql-adapter.ts` via `src/services/graphql/matches.ts`.
- **Auth:** Every search call passes the session token into the service (protected GraphQL).
- **Styling:** Tailwind + `cn()` from `src/lib/utils.ts`; match spacing/typography of clubs/practicioners search.
- **Components:** Named exports, typed props; no API calls inside presentational subcomponents if avoidable (page owns fetch).
- **OpenAPI / schema:** Do not edit repository-root `openapi.yaml` or invent GraphQL fields; if the contract changes, replace `schema.graphqls` from the backend and then update types and queries.

# Notes

- [`src/pages/Matches.tsx`](../../src/pages/Matches.tsx) is currently a stub and **not** mounted in the router; either replace it with the new search page + route `matches`, or add `MatchesSearch.tsx` and delete/ignore the stub — avoid two competing “matches” entry points.
- If the backend cannot support “all seasons” / empty practitioner with the current schema, mark FEAT-009 **blocked** in [`FEATURES.md`](./FEATURES.md) until the schema or server behaviour is clarified.
