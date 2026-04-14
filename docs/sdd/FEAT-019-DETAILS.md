# Build Plan

## Goal
- Improve the Clubs search page UX.
- Add a **club details section** and display it when a club is selected from the Clubs search results.
- Disable (or remove) **Add / Edit / Delete** controls for clubs.

## Acceptance Criteria
- [ ] The Clubs search page is improved.
- [ ] The clubs details section is added.
- [ ] The Add, Edit, Delete buttons for clubs are disabled.
- [ ] The clubs details section is displayed when a club is selected from the clubs search page.

---

## Build Plan

**Step 1 — Rework Clubs search to read-only** (`src/components/features/clubs/ClubsSearchPage.tsx`)
- Remove or disable:
  - “Add new club” button
  - Edit/Delete actions from the results table
  - The edit/delete modals and related state (`ClubFormModal`, `DeleteClubConfirmModal`) if they become unreachable
- Keep search/pagination/loading/error/empty UX, but add a small informational banner similar to practicioners search explaining that clubs are read-only for now.

**Step 2 — Make results “selectable”** (`src/components/features/clubs/ClubsResultsTable.tsx`)
- Replace the “Actions” column (Edit/Delete) with a **Select / View** control, or make the club name selectable.
- Expose a single handler (e.g. `onSelect(club)`) to notify the parent which club is selected.

**Step 3 — Add club details section component** (`src/components/features/clubs/ClubDetailsSection.tsx`)
- Render a read-only panel/card that shows:
  - Club name
  - Club id (full id, monospaced)
  - Season chips from `ClubDto.yearRanges`
- Include a close/clear action (e.g. “Clear selection”) that unselects the club in the parent.

**Step 4 — Wire selection → details section** (`src/components/features/clubs/ClubsSearchPage.tsx`)
- Add state: `selectedClubId` (or `selectedClub: ClubDto | null`).
- When a club is selected in the table, show `ClubDetailsSection` below (or beside) the results.
- Clear selection on new search (and if the selected club disappears from results).

**Step 5 — Load richer club details (optional but recommended)** (`src/services/clubs.ts`, `src/services/club-members.ts`)
- On selection, fetch:
  - `fetchClubById(token, clubId)` (ensures the latest club data)
  - `fetchEnrichedClubMembersByClubId(token, clubId)` to show current members (read-only) in the details section
- Show loading/error states inside the details section without blocking search.

**Step 6 — Cleanup dead code**
- If no longer used, remove:
  - `src/components/features/clubs/ClubFormModal.tsx`
  - `src/components/features/clubs/DeleteClubConfirmModal.tsx`
  - Any club-form-only helpers (e.g. year-range parsing) that are unused after Step 1

**Step 7 — Verify**
- Manual:
  - Search → results show → selecting a club shows details section
  - Selecting a different club updates details section
  - New search clears selection
  - No Add/Edit/Delete controls exist on clubs UI
- Commands:
  - `npm run type-check`
  - `npm run lint`

---

# Implementation Guidelines
- **No direct fetch in components**: keep network calls in `src/services/*` and use the existing REST adapter.
- **Auth**: all `/api/v1/**` calls are protected except login/register; keep passing the bearer token from `useAuth()`.
- **A11y**: the selection control should be keyboard accessible (prefer a `Button` or `Link` rather than only row click).

# Notes
- `docs/sdd/FEATURES.md` describes this as a **details section** (not a new route). If a dedicated details page is desired later, treat it as a follow-up feature that adds `/clubs/:clubId` and reuses the section UI.

