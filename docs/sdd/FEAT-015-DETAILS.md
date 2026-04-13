# FEAT-015 — Feature details

Narrow the Practicioner details **Stats** tab filters to **three** competition dimensions only: **competition scope**, **competition type**, and **competition category**. Remove scope tag, match day, and player-name filters. The win/loss bar chart and “showing *n* of *N*” line must use the filtered match subset (AND across the three active selections).

**Depends on [FEAT-014](./FEAT-014-DETAILS.md)** (search rows already include `competitionScope`, `competitionType`, `competitionCategory`; no GraphQL change expected unless the backend stops returning category).

---

# Build Plan

1. **Filter model and helpers** (`src/lib/practitioner-stats-match-filter.ts`)
   - **`StatsFilterOptions`:** keep lists for scope and type; **add** `competitionCategories` from unique non-empty `competitionCategory` (sorted). **Remove** `competitionScopeTags`, `matchDayNumbers`, `playerNames`.
   - **`buildStatsFilterOptions`:** populate only scope, type, category (trim; skip empty strings).
   - **`StatsFilterSelection` / `DEFAULT_STATS_FILTER_SELECTION`:** only `competitionScope`, `competitionType`, `competitionCategory`, each defaulting to `MATCH_SEARCH_ALL` from `src/lib/match-search-filters.ts`.
   - **`filterMatchesForStats`:** apply three predicates only (trimmed equality, or skip when `MATCH_SEARCH_ALL`).

2. **Stats UI** (`src/components/features/practicioners/PracticionerDetailsPanel.tsx`)
   - Remove the `<select>` blocks (and labels) for **Scope tag**, **Match day**, and **Player on match**.
   - Keep **Competition scope** and **Competition type**; **add** **Competition category** (same Tailwind/select pattern as the others).
   - Point `statsFilterSelection` / `setStatsFilterSelection` at the new three-field shape; keep resetting filters when the **season** changes (via updated `DEFAULT_STATS_FILTER_SELECTION`).
   - Continue passing **`filteredMatchesForStats`** into `PractitionerMatchDistributionBarChart` and the “Showing *n* of *N* matches” copy.
   - Keep the **no matches match the selected filters** message when *N* &gt; 0 and the filtered set is empty.
   - Adjust the Stats intro paragraph so it does not promise filters that no longer exist.

3. **Summaries**
   - Keep **`statsFilteredSummary`** (e.g. unscored footnote) derived from **`filteredMatchesForStats`** so it stays aligned with the chart.

4. **Verify**
   - `npm run type-check`, `npm run lint`, `npm run build`.
   - Manual: only three dropdowns; each filter narrows the bar chart and the count line; **Matches** tab still lists all loaded season matches unless product expands scope later.

---

# Implementation guidelines

- Reuse `MATCH_SEARCH_ALL`, `cn()`, and existing select styling in the panel.
- Do not add new dependencies; keep filtering logic pure in `practitioner-stats-match-filter.ts`.
- **Out of scope unless FEATURES changes:** syncing these filters with the **Matches** tab list.

---

# Notes

- Registry wording “The matches are displayed… are filtered” means: **the data driving Stats (chart + counts)** respects the three competition filters — not that match rows are duplicated inside Stats as a list.
- Registry: FEAT-015 is under **Done** in [FEATURES.md](./FEATURES.md) with acceptance criteria ticked (second criterion clarified: Stats chart/counts use the filtered subset).
