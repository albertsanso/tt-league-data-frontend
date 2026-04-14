# Build Plan

## Goal
- Improve the **Members** table in **`ClubDetailsSection`** on the clubs search page (`ClubsSearchPage`).
- Each member row shows:
  - **Practitioner name**
  - **License ID** (and tag when applicable), scoped to the **year range** context from FEAT-022 (same slicing rules as today: filter by `selectedYearRange`, labels from `SeasonPlayerDto`).
  - A dedicated **Year range** column that makes the license context explicit (e.g. the selected chip when filtering, or a clear label when **All** is selected—define in implementation; see step 2).
- Rows are **sorted by practitioner name ascending** (case-insensitive compare).
- Each row includes a **link or button** to **`/practicioners`** with the practitioner’s **name** prefilled so the Practitioners search page can run (or show) that query—use query param **`q`** (see step 5).

## Acceptance Criteria
(Mirror `FEATURES.md` [FEAT-023].)

- [x] The Practitioners/Members list is improved.
- [x] Each row shows practitioner **name**, **license ID** (for the active year-range context), and **year range** information consistent with the registry wording.
- [x] The list is sorted by practitioner name ascending.
- [x] Each row exposes navigation to the Practitioners search page **prefiltered** with that practitioner’s name.

---

## Build Plan

1. **Year range column (display-only)**
   - In `src/components/features/clubs/ClubDetailsSection.tsx`, add a column **Year range** left of (or beside) licenses.
   - Recommended display rules:
     - When `selectedYearRange !== 'all'`: show that string (matches the filter and the license slice).
     - When `selectedYearRange === 'all'`: show **`All`** or the club’s “latest” chip for readability—pick one rule and document it in a short code comment (e.g. lexicographic max of `club.yearRanges` if present, else `All`).

2. **License column**
   - Keep FEAT-022 behaviour: `rowsForSelectedYear` + `dedupeLicenseLabels` for the slice.
   - Optionally rename header from **Licenses** → **License ID** to match the registry (labels may still include `licenseId (licenseTag)` when tag differs).

3. **Sort rows**
   - Derive `sortedFilteredMembers` with `useMemo`: copy `filteredMembers`, sort by `practicioner.fullName` with `localeCompare(..., { sensitivity: 'base' })`.
   - Render table body from `sortedFilteredMembers` (not the unsorted filtered list).

4. **Practitioners deep link from each row**
   - Add a **Search** (or **Practicioners**) column with `react-router-dom` **`Link`** to `/practicioners?q=${encodeURIComponent(fullName)}`.
   - Use a focusable control and an **`aria-label`** that includes the practitioner name.

5. **Practitioners search: read `q` and sync UI**
   - `src/components/features/practicioners/PracticionersSearchPage.tsx`: `useSearchParams()`, read **`q`** (trimmed). When `authToken` and `q` are set, call the existing search routine (wrap `runSearch` in `useCallback` to satisfy hook deps).
   - `PracticionerSearchForm.tsx`: accept optional **`syncedInputValue`** (or similar) so the input reflects `q` when arriving from a deep link; `useEffect` to update local state when the URL param changes.

6. **Table layout**
   - Widen `min-w` on the table so new columns fit on small screens (`overflow-x-auto` already present).

7. **Verify**
   - Manual: select club → members sorted; year filter still works; year column and licenses stay consistent; link opens Practitioners page with query run / form filled.
   - Commands: `npm run type-check`, `npm run lint`.

---

# Implementation Guidelines
- Keep all HTTP/GraphQL calls in **`src/services/*`**; components call services only.
- Do not regress **FEAT-022** (year `<select>`, filter membership rule, empty states, per-row license loading).
- Do not modify **`openapi.yaml`**.
- No new dependencies unless approved in `AGENTS.md`.

# Notes
- **Shipped:** Members table columns **Name**, **Year range** (`All` vs selected chip), **License ID** (FEAT-022 slice), **Practicioners** link to `/practicioners?q=…`; sorted by name; `PracticionersSearchPage` reads **`q`** and auto-runs search with form sync.
- **Registry wording** (“Year Range, License ID” twice in `FEATURES.md`): treat as **two columns**—**Year range** (context) and **License ID** (values)—not two license columns.
- **FEAT-022 dependency:** This feature assumes the year-range filter and `SeasonPlayerDto` fetches already exist in `ClubDetailsSection`.
- **Optional later scope:** If product adds **competition category** again, it is not in the current registry line item; a prior approach was GraphQL `findMatchesBySeasonAndCompetitionGraphql` + practitioner name + season string (same as `yearRange`), with a thin helper in `src/services/graphql/`. Reintroduce only when `FEATURES.md` is updated.
- **Typo in registry:** “Practicioners”; route is **`/practicioners`**.
