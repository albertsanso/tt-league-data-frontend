# Build Plan

## Goal
- Add a **club details section** to the clubs search page (`ClubsSearchPage`).
- The details section appears **only when a club is selected** from the search results.
- The details section must show:
  - **Club name**
  - **Club id** (full id, monospaced)
  - **Season chips** from `ClubDto.yearRanges`
  - **Members list**: practitioner **names** and **license IDs**

## Acceptance Criteria
- [x] The club details section is added to the clubs search page.
- [x] The club details section is displayed when a club is selected from the clubs search page.
- [x] The club name is displayed.
- [x] The club id is displayed (full id, monospaced).
- [x] The season chips are displayed from `ClubDto.yearRanges`.
- [x] The members list is displayed — practitioner names and license IDs.

---

## Build Plan

This is the implementation plan as a concrete checklist (with exact files and calls).

1. **Selection support in results table** (`src/components/features/clubs/ClubsResultsTable.tsx`)
   - Add props:
     - `selectedClubId?: string | null`
     - `onSelect: (club: ClubDto) => void`
   - Add a **keyboard-accessible** “Select” button per row using `Button` (`variant="secondary"`).
   - Highlight the selected row when `selectedClubId === club.id`.

2. **Selection state + wiring** (`src/components/features/clubs/ClubsSearchPage.tsx`)
   - Add state: `selectedClub: ClubDto | null`.
   - Pass `selectedClubId` and `onSelect` to `ClubsResultsTable`.
   - Selection lifecycle:
     - **New search** (`runSearch`): clear selection (`setSelectedClub(null)`).
     - **Refetch** (`refetch`): keep selection only if the club id still exists in the refreshed results; rebind to the refreshed `ClubDto` object.
     - **Pagination**: keep selection even when changing pages (details panel remains visible).

3. **Create details panel** (`src/components/features/clubs/ClubDetailsSection.tsx`)
   - Props:
     - `club: ClubDto`
     - `authToken: string`
     - `onClear: () => void`
   - Header includes “Clear selection”.
   - Static fields:
     - Name
     - Full id (monospace, full string, with `title`)
     - `yearRanges` chips with empty state `—`

4. **Fetch members (names)** (`src/components/features/clubs/ClubDetailsSection.tsx`)
   - Call `fetchEnrichedClubMembersByClubId(authToken, club.id)` from `src/services/club-members.ts`.
   - Render `practicioner.fullName` from `EnrichedClubMemberDto`.
   - UX states inside panel:
     - Loading: “Loading members…”
     - Error: inline error banner
     - Empty: “No members for this club.”

5. **Fetch licenses per member** (`src/components/features/clubs/ClubDetailsSection.tsx`)
   - For each member’s `practicioner.id`, call `fetchSeasonPlayersByPracticionerId(authToken, practicionerId)` from `src/services/players.ts`.
   - Derive display values:
     - Always display `SeasonPlayerDto.licenseId` when present
     - If `SeasonPlayerDto.licenseTag` is present and differs from the id, display it as `licenseId (licenseTag)`
     - De-duplicate labels
   - Error handling:
     - If a single practitioner license fetch fails: show `—` for that member.
     - Do not fail the whole panel.

6. **Performance** (`src/components/features/clubs/ClubDetailsSection.tsx`)
   - Cache `practicionerId -> SeasonPlayerDto[]` in a `Map` (e.g. `useRef(new Map())`).
   - Start with `Promise.all` for parallel license fetches.

7. **Render details panel** (`src/components/features/clubs/ClubsSearchPage.tsx`)
   - Show `<ClubDetailsSection />` below results when `selectedClub` is not null (and token exists).

8. **Verify**
   - Manual:
     - Search → select club → details show name/id/seasons
     - Members load and render names
     - Licenses load per member (or `—`)
     - Clear selection hides panel
     - New search clears selection
   - Commands:
     - `npm run type-check`
     - `npm run lint`

---

# Implementation Guidelines
- **Services only for HTTP**: components may call functions in `src/services/*`, but must not call `requestJson` / `requestGraphql` directly (keep the single adapter rule intact).
- **Auth**: pass `session.token` from `useAuth()` into service calls for protected endpoints.
- **No `any`**: type the selection handlers as `(club: ClubDto) => void`.
- **Accessibility**: selection must be operable via keyboard (use `Button` for the select action).
- **Scope control**: this feature is the details section + selection wiring; avoid unrelated refactors (club CRUD modals are out of scope unless they block compilation).

# Notes
- `FEATURES.md` is the source of truth for **status/priority**; this file is the source of truth for **implementation steps** while the feature is not `done`.
- Relationship to **FEAT-019**: FEAT-019 was “clubs search + details + disable CRUD”. FEAT-021 is explicitly about **members + licenses** in the details section; expect to extend whatever details UI exists (or add it if absent).
- **Shipped:** `ClubDetailsSection` loads enriched members and per-practitioner season players (license tags); `ClubsResultsTable` exposes a keyboard **Select** action; `ClubsSearchPage` clears selection on a **new** search and re-syncs selection after **refetch** when the club id is still in results.
- **Pagination:** Selection is **kept** when changing pages; the **Selected** row highlight appears only on the page that contains that club (details panel remains visible).
- **License IDs:** Licenses are rendered from `SeasonPlayerDto` and now always include `licenseId` (optionally with `licenseTag` in parentheses).
