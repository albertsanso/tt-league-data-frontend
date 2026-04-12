# FEAT-010 — Practicioners details section (search page)

## Target layout (wireframe)

Reference: [`.wireframes/practicioner_detail_layout-1.png`](../../.wireframes/practicioner_detail_layout-1.png) (repo root).

Structure to implement on **Practicioners search** after a row is selected:

1. **Header block** — “Practitioner name and info”: primary **full name**; secondary line optional (**birth date**, short id) using fields already on [`PracticionerDto`](../../src/types/index.ts) from search.
2. **Horizontal tab bar** — three controls in order: **Matches** · **Clubs** · **Stats** (wireframe shows equal segments along the top of the detail region).
3. **Large content panel** — single scrollable area below the tabs; body swaps by active tab (`<Subsection>` in the sketch).

Visual polish: bordered or elevated panel so the detail region reads as one unit below the search results table; active tab clearly indicated; keyboard-accessible tabs (`role="tablist"`, `role="tab"`, `role="tabpanel"`, arrow-key navigation optional but preferred).

---

# Build Plan

### 1. Selection state and table UX

- In [`PracticionersSearchPage.tsx`](../../src/components/features/practicioners/PracticionersSearchPage.tsx), add `selectedPracticioner: PracticionerDto | null`.
- Update [`PracticionersResultsTable.tsx`](../../src/components/features/practicioners/PracticionersResultsTable.tsx): support selection — e.g. click row to select (strengthen with `cursor-pointer`, `aria-selected`, focus ring) and/or explicit control. Only one selected row at a time.
- When search results change, clear selection if the selected `id` is no longer in `results` (or always clear on new search — pick one rule and document in code comment).
- Optional: “Clear selection” control in the detail header for discoverability.

### 2. `PracticionerDetailsPanel` component

New file under `src/components/features/practicioners/` (e.g. `PracticionerDetailsPanel.tsx`):

- **Props:** `practicioner: PracticionerDto`, `authToken: string`, `onCloseSelection?` optional.
- **Layout:** matches wireframe — header → tab strip → panel.
- **State:** `activeTab: 'matches' | 'clubs' | 'stats'` (default `'matches'`).

Split tab bodies into small presentational components or inline render functions to keep the panel readable:

- `PracticionerDetailHeader` — name + info line.
- `PracticionerDetailTabs` — three tab triggers + wiring to `activeTab`.
- `PracticionerDetailTabPanel` — wraps children with `role="tabpanel"` and `aria-labelledby`.

### 3. Matches tab (“last season”)

- **Season:** Use a single exported constant (e.g. in `src/lib/season-config.ts` or next to the feature) for **latest season** string (e.g. `'2024-2025'`), aligned with the highest season in [`match-search-filters.ts`](../../src/lib/match-search-filters.ts). Comment that it must be updated when the league rolls forward until an API provides “current season”.
- **Data:** [`findMatchesBySeasonAndCompetitionGraphql`](../../src/services/graphql/matches.ts) with `practitionerName` = selected `fullName` (trimmed), `season` = constant, `competitionInfo` = `{}`, and empty-string wildcards for any `String!` arguments per existing GraphQL conventions in this app.
- **UI:** Reuse or slim down [`MatchResultCard`](../../src/components/features/matches/MatchResultCard.tsx) / list layout; loading + error scoped to this tab.

### 4. Clubs tab (memberships / history)

- **Primary:** GraphQL `findPracticionerById(id)` with a selection set that includes `memberships { id yearRanges club { id name } }` (see [`schema.graphqls`](../../schema.graphqls)). Add [`src/services/graphql/practicioners.ts`](../../src/services/graphql/practicioners.ts) and re-export from [`src/services/graphql/index.ts`](../../src/services/graphql/index.ts). Define narrow TypeScript types for the query result.
- **Fallback** if GraphQL is not viable at runtime: [`fetchClubMembersByPracticionerId`](../../src/services/club-members.ts) + [`fetchClubById`](../../src/services/clubs.ts) per distinct `clubId` (N+1); cache by `clubId` in the hook/component layer to limit duplicate calls.
- **UI:** Table or card list — club **name**, **year ranges** (join `yearRanges` for display). Empty state copy when no memberships.

### 5. Stats tab

- No dedicated **stats** resource in published [`openapi.yaml`](../../openapi.yaml) or [`schema.graphqls`](../../schema.graphqls).
- **MVP (acceptable for acceptance):** Show **derived** metrics and small tables:
  - Count of matches returned for the last-season query (reuse Matches tab fetch or share cache).
  - [`fetchSeasonPlayersByPracticionerId`](../../src/services/players.ts) — list `yearRange`, `licenseTag` (season registrations).
  - Distinct club count from Clubs data (GraphQL memberships or REST fallback).
- Label the section honestly in UI helper text if needed (e.g. “Summary from available data”) so users know a future API may replace this.
- If product defines concrete KPIs later, add a follow-up feature once the contract exists (do not extend `openapi.yaml` by hand).

### 6. Loading and caching

- **Lazy per tab:** Load data when the user first activates a tab; keep a simple in-memory cache keyed by `practicionerId` + tab id to avoid refetch when switching back.
- **Parallel:** Optionally prefetch Matches when the panel opens (most important tab); Clubs/Stats on first visit.
- Failures isolated per tab (error message inside the tab panel, not whole page).

### 7. Integration and verification

- Render `PracticionerDetailsPanel` only when `selectedPracticioner !== null`, **below** the results table and pagination on [`PracticionersSearchPage`](../../src/components/features/practicioners/PracticionersSearchPage.tsx).
- `npm run type-check`, `npm run lint`. Manual: search → select → exercise all three tabs; change page of results; new search clears or preserves selection per chosen rule.

---

# Implementation Guidelines

- **Auth:** Pass `session?.token` from [`useAuth()`](../../src/store/AuthContext.tsx) into services; same rules as existing practicioners search ([`AGENTS.md`](../../AGENTS.md)).
- **REST:** `src/lib/rest-adapter.ts` only; thin service functions in `src/services/`.
- **GraphQL:** `src/services/graphql/*` + `requestGraphql`; no `fetch` in presentational components.
- **Styling:** Tailwind + [`cn()`](../../src/lib/utils.ts); align with existing search page spacing (e.g. `gap-6`, bordered panels like tables).
- **Types:** No `any`; add GraphQL result interfaces alongside the query or in `src/types/index.ts` if reused.

---

# Notes

- **Wireframe path in git:** Image at [`.wireframes/practicioner_detail_layout-1.png`](../../.wireframes/practicioner_detail_layout-1.png); [`FEATURES.md`](./FEATURES.md) links it with a path relative to `docs/sdd/`.
- **FEATURES.md** is authoritative for acceptance criteria; this file expands **how** to satisfy them and the **layout** contract from the wireframe.
- If backend GraphQL `findPracticionerById` omits nested `club` data, use the REST N+1 fallback and record the limitation in a short comment in `practicioners.ts` or here under Notes.
