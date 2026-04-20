# Build Plan

## Goal

Expose league season **2025-2026** everywhere the app offers a season (or year-range) control tied to the canonical match season list, and set **2025-2026** as the default “latest” season for practitioner details.

## Acceptance Criteria

- [x] `LATEST_LEAGUE_SEASON` in `src/lib/season-config.ts` is **`2025-2026`**.
- [x] Practitioners flow: season selector (on the details panel after selecting a practitioner) includes **2025-2026** and defaults to the latest season constant.
- [x] Clubs flow: the members **Year range** selector on club details includes **2025-2026** even if `ClubDto.yearRanges` from the API has not caught up yet.
- [x] Matches search: season selector includes **2025-2026**.

---

## Build Plan

**Step 1 — Canonical season list** (`src/lib/match-search-filters.ts`)

- Append **`'2025-2026'`** to `MATCH_SEASON_OPTIONS` immediately after `'2024-2025'`.
- This list is used by:
  - **Matches:** `MatchesSearchForm` (season dropdown).
  - **Practitioners:** `matchSeasonOptionsDescending()` → `PracticionerDetailsPanel` season `<select>` (not the name search form).

**Step 2 — Latest season default** (`src/lib/season-config.ts`)

- Set `LATEST_LEAGUE_SEASON` to **`'2025-2026'`**.
- Keep the existing comment: stay aligned with the newest string in `MATCH_SEASON_OPTIONS` until the API exposes a current season.

**Step 3 — Clubs members Year range** (`src/components/features/clubs/ClubDetailsSection.tsx`)

- Today the **Year range** `<select>` options are built only from `club.yearRanges`; the block is hidden when that array is empty.
- Build a **merged** option list: union of `club.yearRanges` and `LATEST_LEAGUE_SEASON` (import from `season-config`), deduplicated, with a stable sort (e.g. follow `MATCH_SEASON_OPTIONS` order or chronological).
- Use this merged list for:
  - `<option>` values/labels in the Year range dropdown.
  - `hasYearRangeOptions` (true when the merged list is non-empty).
- Preserve existing filtering: `selectedYearRange` still matches `SeasonPlayerDto.yearRange` / member rows as today; choosing **2025-2026** before backend data exists may yield an empty table—acceptable.

**Step 4 — Optional polish**

- `ClubFormModal` placeholder still shows older examples; optionally extend to mention **2025-2026** for admins entering `yearRanges` (cosmetic only).

**Step 5 — Verify**

- Manual:
  - **Matches:** season dropdown shows **2025-2026**.
  - **Practitioners:** select a result → details **Season** defaults to **2025-2026** and lists the new season.
  - **Clubs:** select a club → **Year range** includes **2025-2026** when merged.
- Commands: `npm run type-check`, `npm run lint` (and tests if the repo runs them in CI).

---

# Implementation Guidelines

- **Single source of truth:** `MATCH_SEASON_OPTIONS` + `LATEST_LEAGUE_SEASON`; avoid hardcoding `'2025-2026'` in multiple UI files—prefer importing constants.
- **Clubs:** merging with `LATEST_LEAGUE_SEASON` avoids relying solely on API `yearRanges` for the newest label.
- **Backend:** GraphQL match queries take `season` as a string; no FE schema change expected. Empty results for the new season until data exists are expected.

# Notes

- **Shipped:** `MATCH_SEASON_OPTIONS` + `LATEST_LEAGUE_SEASON` updated; `ClubDetailsSection` merges `LATEST_LEAGUE_SEASON` into members Year range options.
- **Doc drift:** Older bullets in `FEATURES.md` that enumerate seasons ending at `2024-2025` can be updated in a follow-up for consistency (not blocking implementation).
