# FEAT-017 — Feature details

Bring the **GraphQL client layer** in line with the repository **`schema.graphqls`** contract: TypeScript types, query/mutation field selections in `src/services/graphql/`, and any **adapter** behavior that must match how the backend speaks GraphQL over HTTP.

This is a **reconciliation** task, not a greenfield API design. Replace `schema.graphqls` only when the backend publishes an updated schema (same discipline as `openapi.yaml` for REST).

---

# Build Plan

## 1. Establish the contract snapshot

- Use root **`schema.graphqls`** as the authoritative shape for **queries, types, and inputs** the frontend must support.
- If the deployed backend differs, obtain an updated `schema.graphqls` from the backend team and replace the file in-repo before coding (do not invent fields).

## 2. Audit TypeScript models (`src/types/index.ts`)

- For each GraphQL type the app uses (today: **`Match`**, **`CompetitionInput`**, and types implied by **`findPracticionerById`** / memberships), compare fields to `schema.graphqls`.
- **`GraphqlMatch`:** today the schema includes **`localClubId`**, **`localClubName`**, **`visitorClubId`**, **`visitorClubName`** (and `uniqueRowMatchId`, `competitionGroup`, `competitionGender`, etc.) — ensure the interface includes **every field** the UI or services will read from responses (nullable vs non-null in schema: map `String!` to `string`; if the backend can return null in practice, use optional + narrowing only with evidence).
- Confirm **`GraphqlCompetitionInput`** still matches **`input CompetitionInput`** (all optional keys present).

## 3. Align operations in `src/services/graphql/`

- **`matches.ts`**
  - **`FIND_MATCH_BY_ID`:** add any missing **`Match`** selections needed by callers (e.g. club fields, `competitionGroup` / `competitionGender` if used).
  - **`FIND_MATCHES_BY_SEARCH`:** same — extend the selection set and **`GraphqlMatchSearchRow`** (`Pick<GraphqlMatch, …>`) so returned rows match what components expect; avoid requesting fields the resolver does not expose (verify against schema + backend).
- **`practicioners.ts`**
  - Confirm **`findPracticionerById`** selection matches **`Practicioner`** usage (`id`, `fullName`, `memberships` with `ClubMember` / `Club` sub-selections per schema).

## 4. Propagate type changes to consumers

- **`MatchResultCard`**, practitioner panel, matches search page: update only where new fields are **displayed or used**; otherwise widening `GraphqlMatch` / `GraphqlMatchSearchRow` may be enough for type-checking.
- **`practitioner-stats-match-filter.ts`:** unchanged unless new filter dimensions are added to the schema and product asks for them.

## 5. GraphQL adapter (`src/lib/graphql-adapter.ts`)

- Review **`requestGraphql`** against current backend behavior: JSON POST, `errors` array, `data` presence, auth headers (see **`AGENTS.md`** / **`docs/sdd/AGENTS.md`**).
- Update **only** if the schema rollout includes transport or error-shape changes (e.g. extensions, partial data with errors). The existing compact-query and error-message extraction may already be sufficient.

## 6. Documentation touchpoints

- If **`docs/sdd/AGENTS.md`** (or similar) describes GraphQL paths or contracts, adjust **only** to match reality after alignment.
- Do **not** hand-edit **`openapi.yaml`** as part of this feature (REST contract is separate).

## 7. Verify

- `npm run type-check`, `npm run lint`, `npm run build`.
- Smoke-test flows that hit GraphQL: practitioner details (matches + memberships), match-by-id if used, matches search.
- If new fields are added to queries, confirm the backend returns them (no runtime `undefined` surprises where `String!` is assumed).

---

# Implementation guidelines

- **Single HTTP layer:** keep using **`requestGraphql`** from services; no raw `fetch` in components.
- **Queries as strings:** stay consistent with existing multiline template literals; adapter already compacts whitespace for transport.
- Prefer **minimal UI churn**: align types and queries first; add UX for new fields only when in scope.

---

# Notes

- **Known gap (at time of writing):** `schema.graphqls` **`Match`** includes **home/visitor club id and name** fields not present on **`GraphqlMatch`** or on **`FIND_MATCHES_BY_SEARCH`** / **`FIND_MATCH_BY_ID`** selections — a likely FEAT-017 outcome is adding them to types + queries when the product needs them.
- **Shipped:** `GraphqlMatch` includes club fields; `findMatchById` and practitioner match search use a shared `MATCH_FIELD_SELECTION` listing all `Match` scalars from `schema.graphqls`; `GraphqlMatchSearchRow` is `GraphqlMatch`; `MatchResultCard` shows home/away club names. Registry: FEAT-017 is **Done** in [FEATURES.md](./FEATURES.md).
