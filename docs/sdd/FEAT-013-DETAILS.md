# FEAT-013 — Feature details

Improvements in the Stats subsection of the Practicioner details panel: remove season registrations; add a grouped win/loss bar chart by slot letter (A, B, C, X, Y, Z).

---

# Build Plan

1. **Remove registrations from Stats** (`src/components/features/practicioners/PracticionerDetailsPanel.tsx`)
   - Remove `seasonPlayersState`, `loadSeasonPlayersData`, `registrationsForSeason`, and the `useEffect` that loads season players when the Stats tab is active.
   - Remove unused imports (`fetchSeasonPlayersByPracticionerId`, `SeasonPlayerDto` if nothing else uses them).
   - Delete loading/error/empty/table UI for “Registrations for {season}”.

2. **Aggregate wins and losses by letter** (`src/lib/practicioner-match-analytics.ts`)
   - Add a pure helper, e.g. `summarizeWinsLossesByLetter(matches, practitionerFullName)`, returning counts per `ScatterLetter` aligned with `SCATTER_LETTER_ORDER`.
   - For each match, use the **same eligibility** as the scatter chart: known home/away side, valid scores, letter ∈ A–C / X–Z (same rules as `getScatterPoint`).
   - Use `getOutcomeForPractitioner`: count **win** → wins[letter], **loss** → losses[letter]; **tie** and **unscored** → skip (ties omitted per spec).

3. **Bar chart component** (new `src/components/features/practicioners/PractitionerMatchDistributionBarChart.tsx`)
   - Props: `matches`, `practitionerFullName`, optional `className`.
   - Use Chart.js + `react-chartjs-2` `Bar`; register `BarController`, `BarElement`, `CategoryScale`, `LinearScale`, `Tooltip`, `Legend` as needed.
   - X-axis categories: A, B, C, X, Y, Z. Two grouped datasets: Wins (`#639922`), Losses (`#E24B4A`). Flat styling: solid fills only, no gradients or shadow effects in chart options.
   - Empty state when there is nothing to plot (mirror the scatter chart’s friendly empty message).

4. **Wire into Stats panel** (`PracticionerDetailsPanel.tsx`)
   - When `matchesState.status === 'success'`, render the bar chart (keep existing `PractitionerMatchScatterChart` unless product later removes it).
   - Adjust Stats intro copy to mention the bar chart and the scatter chart.
   - Optionally reuse the existing `matchSummary.unscored` note for matches omitted from charts.

5. **Verify**
   - `npm run type-check` and `npm run lint`.
   - Manually confirm AC: no registrations in Stats; bar chart visible; colors and flat styling; ties not shown as bars.

---

# Implementation Guidelines

- Follow `AGENTS.md` / `CLAUDE.md`: services stay in `src/services/`; chart is presentational; reuse `practicioner-match-analytics` instead of duplicating letter/outcome logic.
- Reuse `cn()` for optional `className` on the chart wrapper; match approximate sizing of `PractitionerMatchScatterChart` (e.g. `h-80`) for layout consistency.
- Do not add new npm dependencies; use existing `chart.js` / `react-chartjs-2`.

---

# Notes

- **FEAT-012** supplies season-filtered GraphQL matches and the scatter chart; FEAT-013 adds the bar chart and removes registrations only from Stats.
- Registry acceptance criteria duplicate the color/flat-design bullet; satisfying the stronger combined bullet covers both.
- After shipping, move FEAT-013 to **Done** in `FEATURES.md` and tick all acceptance checkboxes.
