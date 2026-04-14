# Build Plan

## Goal
- Add a **yearRange filter** to the Practicioners/Members list inside the **Club details section** on the clubs search page.
- The filter must be a **dropdown** with options sourced from `ClubDto.yearRanges`.
- The filter must be used to **filter the displayed members list**.

## Acceptance Criteria
- [x] The yearRange filter is added to the Practicioners/Members list in Club details section of the clubs search page.
- [x] The yearRange filter is a dropdown menu with the options from the `ClubDto.yearRanges`.
- [x] The yearRange filter is used to filter the Practicioners/Members list in Club details section of the clubs search page.

---

## Build Plan

1. **Add dropdown UI to the Members section** (`src/components/features/clubs/ClubDetailsSection.tsx`)
   - Add local state: `selectedYearRange: string | 'all'` (default `'all'`).
   - Render a `<select>` dropdown labeled **Year range**.
   - Options:
     - `All` (value `'all'`)
     - One option per `club.yearRanges` value (from the selected club).
   - If `club.yearRanges` is missing/empty:
     - Hide the dropdown (or render it disabled with only `All`).

2. **Define the filtering rule using existing data**
   - Members currently come from `fetchEnrichedClubMembersByClubId` (names only).
   - YearRange exists on `SeasonPlayerDto.yearRange`, which is fetched per practitioner using `fetchSeasonPlayersByPracticionerId`.
   - Filtering rule (recommended):
     - When `selectedYearRange !== 'all'`, include a member only if their fetched `SeasonPlayerDto[]` contains at least one row where `row.yearRange === selectedYearRange`.

3. **Filter the members list**
   - Compute `filteredMembers`:
     - If `selectedYearRange === 'all'`: show all members.
     - Else: show only members matching the rule above.
   - Empty state:
     - If `filteredMembers.length === 0`: show `No members for selected year range.`

4. **Filter the license display to match the selected yearRange**
   - When `selectedYearRange !== 'all'`, only derive displayed license labels from the subset of season-player rows where `row.yearRange === selectedYearRange`.
   - License label rules (as in FEAT-021):
     - Always display `licenseId` when present.
     - If `licenseTag` is present and differs: display `licenseId (licenseTag)`.

5. **Loading / error handling**
   - Member fetch failure remains an inline error in the details panel.
   - Per-practitioner season-player fetch failure:
     - Under `All`: show the member with licenses `—`.
     - Under a specific yearRange: the member will not match any yearRange and should be filtered out (unless you choose to treat failures as “unknown”; document the choice in Notes).

6. **Verify**
   - Manual:
     - Select a club → members load
     - Dropdown shows `All` + the values from `club.yearRanges`
     - Selecting a yearRange filters the visible members
     - Switching back to `All` restores all members
   - Commands:
     - `npm run type-check`
     - `npm run lint`

---

# Implementation Guidelines
- Keep all HTTP calls inside existing services; do not call adapters directly from components.
- Do not add new dependencies.
- Keep the filter keyboard accessible (native `<select>` is fine).
- Avoid refactors unrelated to the club details panel.

# Notes
- This feature depends on the existing behavior where the details panel loads `SeasonPlayerDto[]` per practitioner (used to derive yearRange membership).
- **Shipped:** Year range `<select>` (All + `club.yearRanges`) in `ClubDetailsSection`; members filtered by `SeasonPlayerDto.yearRange`; licenses column shows labels only for rows matching the selected year range (when not `All`).
- **Loading vs filter:** While a practitioner’s season-player rows are still loading, they remain visible under a specific year range until the fetch completes; then they are included or excluded based on matching rows.
- **Fetch failure:** If season-player fetch fails for a practitioner, they still appear under **All** (licenses `—`), but are **excluded** when a specific year range is selected.

