# FEAT-012 — Practicioner details section improvements

**Source of truth:** [FEATURES.md](./FEATURES.md) (**Done** → FEAT-012).

**Depends on:** FEAT-010 (details panel shell: tabs, GraphQL matches + memberships, REST club fallback).

---

## Registry constraints (must follow)

| Topic | Rule |
|--------|------|
| Data access | Matches, clubs, stats **via GraphQL adapter** where the registry applies; REST fallback for club list only if GraphQL fails (unchanged contract rule). |
| Stats chart | **`react-chartjs-2`** + **`chart.js`**; listed in root **`AGENTS.md`**. |
| Terminology | **local = home**, **visitor = away**. |
| Win | Practitioner **wins** iff their score is **strictly greater** than the opponent’s (integer-parsed scores). |

---

## Current product scope (from FEATURES.md)

1. **Season selector** — Options aligned with the matches search seasons list, **sorted descending by year** (newest first). The selection drives **matches**, **clubs**, and **stats** (scatter uses the same match set as the Matches tab).
2. **Matches** — Summary (total / wins / losses / ties), match-day sort, green / red / yellow cards; all scoped to **selected season**.
3. **Clubs** — Name sort; season ranges column; rows scoped to **selected season** via client filter on **`yearRangesLabel`** (REST **—** rows still listed).
4. **Stats** — Point-cloud scatter (X = 0–3 points, Y = letters A, B, C, X, Y, Z) for **selected season**.

---

## Already implemented (full feature)

| Area | Implementation |
|------|----------------|
| Analytics | **`src/lib/practicioner-match-analytics.ts`** — name normalize, home/away side, `parseMatchScore`, `getOutcomeForPractitioner`, `summarizeMatchOutcomes`, `getScatterPoint` / `getOwnScoreClamped`, `SCATTER_LETTER_ORDER`. |
| Match cards | **`MatchResultCard`** — optional **`outcomeTone`** (`win` \| `loss` \| `tie`); neutral default for **`MatchesSearchPage`**. |
| Panel UI | **`PracticionerDetailsPanel`** — **season** `<select>` (**`matchSeasonOptionsDescending`**), default **`LATEST_LEAGUE_SEASON`**; match summary, sort, tones; clubs filtered by season on **`yearRangesLabel`**; stats scatter + registrations for **`selectedSeason`**. |
| Scatter chart | **`PractitionerMatchScatterChart`** — **Y axis:** **`CategoryScale`** with `labels: [...SCATTER_LETTER_ORDER]`, dataset **`y` = letter index 0–5**, **`ticks.autoSkip: false`**, **`reverse: true`** (A at top). **Do not** use a linear Y scale with `ticks.callback` + `Number.isInteger` only — Chart.js often emits non-integer ticks and labels disappear. **X:** linear 0–3, jitter on x from analytics. |
| Deps | **`chart.js`**, **`react-chartjs-2`** in **`package.json`**; documented in **`AGENTS.md`**. |
| Seasons helper | **`matchSeasonOptionsDescending()`** in **`match-search-filters.ts`**. |

---

## Traceability (acceptance criteria → work)

| Acceptance criterion | Work |
|---------------------|------|
| Matches for **selected season** | `selectedSeason` → `findMatchesVariablesForPractitionerInSeason`; refetch on change. |
| Clubs for **selected season** | `clubMembershipTouchesSeason` + sorted table; empty state when none. |
| Stats scatter for **selected season** | Same match dataset as matches tab; labels reference `selectedSeason`. |

---

## Files touched (iteration 2)

| File | Change |
|------|--------|
| **`PracticionerDetailsPanel.tsx`** | Season state, select, refetch, club + registration filters, copy. |
| **`match-search-filters.ts`** | **`matchSeasonOptionsDescending()`**. |
| **`FEATURES.md`** | FEAT-012 **done**, acceptance checked. |

---

## Implementation guidelines

- **TypeScript:** no `any`; **`GraphqlMatchSearchRow`** from **`src/services/graphql/matches.ts`**.
- **Services:** no raw `fetch` in components; new GraphQL only under **`src/services/graphql/`** if the schema gains a season-filtered membership query.
- **Styling:** **`cn()`**; avoid inline **`style={}`** except chart container sizing if needed.

---

## Risks / open decisions

- **Name vs home/away row:** If practitioner name does not exactly match `localPlayerName` / `visitorPlayerName` after normalize, outcomes and scatter points are **`unscored`** / omitted — footnotes already explain this.
- **Clubs vs season:** Membership **`yearRanges`** format must match whatever filter logic you implement (string contains is brittle; prefer a shared parser if the app already has one).
- **Chart.js:** Keep **CategoryScale** on Y for letter labels; align **`chart.js`** / **`react-chartjs-2`** majors when upgrading.

---

# Notes

- **Iteration 1:** matches summary, sort, tones, clubs sort, scatter chart (fixed **CategoryScale** Y), analytics lib.
- **Iteration 2:** season selector (**`matchSeasonOptionsDescending`**), scoped matches/stats refetch, club + registration filters for **`selectedSeason`**; registry **done**.
