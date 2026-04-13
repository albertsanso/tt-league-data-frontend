# FEAT-018 — Feature details

Restructure **match cards** in the **Practicioner details → Matches** tab to a **labeled, row-based layout** per [FEATURES.md](./FEATURES.md).

**Depends on:** — (uses `GraphqlMatchSearchRow`, including club and competition fields from FEAT-017.)

---

# Target layout (registry **Goal** — implement this)

| Row | Content |
|-----|--------|
| **1** | **Season**, then literal label **“Match day number”** (or concise UI equivalent, e.g. `Match day number:`) and **`matchDayNumber`**, then **“Home”** and **home club name**, then **“Away”** and **away club name**. Use `localClubName` / `visitorClubName`; `—` when empty. Prefer `flex-wrap` / short gaps so the row does not overflow awkwardly on small screens. |
| **2** | **“Competition”** label, then **`competitionType`** and **`competitionCategory`** only (omit **`competitionScope`** on this row). |
| **3** | **“Home”** label, then **home player name** and **home player score** on one logical row (e.g. `grid` columns: label \| name \| score). Keep **`localPlayerLetter`** in monospace before the name if it helps scanning (optional, not in AC). |
| **4** | **“Away”** label, then **away player name** and **away player score** (same pattern as Home). |

**Acceptance criteria** in FEATURES repeat a shorter **row 1** wording (season, matchDayNumber, clubs without repeating every label). Satisfying the **Goal** bullet list satisfies the AC.

---

# Build Plan

## 1. Scope

- **In scope:** **`PracticionerDetailsPanel`** Matches list only.
- **`MatchesSearchPage`** also uses **`MatchResultCard`**. Add **`layout?: 'default' | 'practitioner'`** (default **`default`**) and pass **`layout="practitioner"`** only from the panel so the search page stays unchanged unless product unifies layouts later.

## 2. Implementation (`src/components/features/matches/MatchResultCard.tsx`)

1. Split rendering into **`MatchResultCardDefault`** (current markup) and **`MatchResultCardPractitioner`** (rows above), or equivalent `if (layout === 'practitioner')` branches inside the **`article`**.
2. **Practitioner row 1 example structure** (wording can be tuned for density):
   - `Season {season} · Match day number {matchDayNumber} · Home {localClubName} · Away {visitorClubName}` with visible **labels** where the Goal calls for them (if one line is too long, use a second line or stacked key/value pairs while preserving all pieces).
3. Preserve **`outcomeTone`** on the outer **`article`** for win/loss/tie tinting.
4. **`PracticionerDetailsPanel`:** `<MatchResultCard layout="practitioner" match={m} outcomeTone={tone} />`.

## 3. Verify

- `npm run type-check`, `npm run lint`, `npm run build`.
- Manual: practitioner with matches — row 1 shows season, match day **number** (labeled), **Home**/**Away** club names; row 2 is Competition + type + category only; rows 3–4 are Home/Away player + score; tints still apply.
- **Matches search:** card still **default** layout.

---

# Implementation guidelines

- Tailwind + **`cn()`** only; no inline `style`.
- No GraphQL or type changes unless a field is missing.

---

# Notes

- If the product prefers **one** card design app-wide, drop the **`layout`** prop and migrate **Matches search** in a follow-up.
- **Shipped:** `MatchResultCard` has `layout="practitioner"` with labeled row 1 (Season, Match day number, Home/Away clubs), Competition (type · category), then Home/Away player rows; panel passes `layout="practitioner"`. Registry: FEAT-018 **Done** in [FEATURES.md](./FEATURES.md).
