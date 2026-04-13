# FEAT-016 — Feature details

Add **competition scope**, **competition type**, and **competition category** filtering for the Practicioner details **Matches** tab. Options come from the **loaded** GraphQL match list for the selected season and practitioner. Use native **dropdowns** (`<select>`), same styling as today’s Stats filters.

**Registry requirement (updated):** filter state is **shared** between **Matches** and **Stats** — one selection drives the match **list**, the **summary cards** on Matches, and the **Stats** bar chart / counts.

**Depends on [FEAT-014](./FEAT-014-DETAILS.md)** (competition fields on search rows). **[FEAT-015](./FEAT-015-DETAILS.md)** already added the three Stats dropdowns; FEAT-016 **unifies** that state with Matches and surfaces controls where the product expects them.

---

# Build Plan

## 1. Shared state and naming (`src/lib/practitioner-stats-match-filter.ts`)

- Optionally **rename** for clarity now that filters are cross-tab:
  - e.g. `StatsFilterOptions` → `CompetitionFilterOptions`, `StatsFilterSelection` → `CompetitionFilterSelection`, `DEFAULT_STATS_FILTER_SELECTION` → `DEFAULT_COMPETITION_FILTER_SELECTION`, `filterMatchesForStats` → `filterMatchesByCompetition`.
- **Behavior unchanged:** AND across the three fields; `MATCH_SEARCH_ALL` from `match-search-filters.ts` means “All”.
- Update **Stats** and any imports to the new names if you rename (single mechanical pass).

## 2. Single filter state in the panel (`PracticionerDetailsPanel.tsx`)

- Keep **one** piece of state for the three selections (today: `statsFilterSelection` — rename to `competitionFilterSelection` if you rename the type).
- **Reset** to defaults when **`selectedSeason`** changes (existing effect).
- **One** `useMemo` for options: `buildStatsFilterOptions(matchesState.data)` when load succeeds (today’s `statsFilterOptions`; rename to `competitionFilterOptions` if desired).

## 3. Derived data — both tabs read the same subset

- **`filteredMatchesByCompetition`** (or keep `filteredMatchesForStats` name but use everywhere):  
  `filter…(matchesState.data, sharedSelection)` when `matchesState.status === 'success'`.
- **Stats tab:** pass **`filteredMatchesByCompetition`** into `PractitionerMatchDistributionBarChart`; **`statsFilteredSummary`** = `summarizeMatchOutcomes(filtered…, fullName)` (already aligned; ensure it uses the same filtered array).
- **Matches tab:**
  - **`sortedMatches`:** sort **`filteredMatchesByCompetition`** by match day (asc/desc), **not** raw `matchesState.data`.
  - **`matchSummary`:** `summarizeMatchOutcomes(filtered…, fullName)` so totals / wins / losses / ties / unscored match the **visible** list.
- **Empty filter result:** if season has matches but the shared filter excludes all rows, Matches tab shows a clear message (same idea as Stats); Stats keeps its existing empty-filter pattern.

## 4. Where to render the three `<select>`s (pick one; default recommended)

**Recommended — shared toolbar (one set of controls):**

- Render the three dropdowns **once**, in **shared chrome** between the **tab list** and the **tab panels** (still inside the practitioner details card).
- Copy can state that filters apply to **Matches** and **Stats** for the selected season.
- Satisfies **shared** AC; avoids duplicating six dropdowns across tabs.

**Alternative — duplicate controls, shared state:**

- Keep the existing Stats filter block and add an **identical** three-select block on the **Matches** tab, both bound to the **same** `useState`.
- Satisfies literal “filters … in the Matches subsection” while Stats still shows filters; more UI duplication.

Choose in implementation; document the choice in a one-line PR note.

## 5. Accessibility and polish

- Stable `id` / `htmlFor` on labels and selects (avoid duplicate ids if you use the duplicate-controls approach — each tab panel needs **unique** element ids, or use `aria-labelledby` without duplicate ids by rendering filters only once).

## 6. Verify

- `npm run type-check`, `npm run lint`, `npm run build`.
- Manual: change filter on Matches → switch to Stats → chart/counts reflect same filter; change on Stats → Matches list/summary match; season change resets filters; `MATCH_SEARCH_ALL` restores full season subset.

---

# Implementation guidelines

- No GraphQL changes if `GraphqlMatchSearchRow` already includes scope, type, category.
- **Do not** maintain two filter states (`matchesFilterSelection` vs `statsFilterSelection`) — registry requires **shared** state.
- Reuse `practitioner-stats-match-filter.ts`; do not fork filter predicates.

---

# Notes

- Acceptance criteria in [FEATURES.md](./FEATURES.md): (1) filters present for Matches behavior, (2) list filtered by the three fields, (3) **same state** as Stats. The recommended **single toolbar** satisfies (3) without requiring duplicate dropdowns inside both panels; if QA expects controls physically inside the Matches panel, use the duplicate-controls alternative with unique ids.
- Registry: FEAT-016 is under **Done** in [FEATURES.md](./FEATURES.md) with acceptance criteria ticked.
