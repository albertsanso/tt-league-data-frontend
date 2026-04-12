# Build Plan

## Outcomes

- **REST:** One clear HTTP layer (today: `requestJson` / `requestVoid` in `src/lib/rest-adapter.ts`) remains the single place for OpenAPI-shaped calls; optional light wrappers for “read vs write” if the team wants naming symmetry—no duplicate fetch logic.
- **GraphQL:** A second layer (new file, e.g. `src/lib/graphql-adapter.ts`) that POSTs `{ query, variables }`, supports optional Bearer `token`, and maps GraphQL `errors` to thrown `Error`s with readable messages.
- **Auth:** Adapters accept `token?: string` only; **`useAuth()` from `src/store/AuthContext.tsx`** runs in hooks/pages, which pass `session?.token` into `src/services/*` (same pattern as `src/hooks/useMatches.ts` today). Adapters must not import React.

## Preconditions

- Confirm with backend: **GraphQL HTTP path** (e.g. `/graphql`, `/api/v1/graphql`) and whether introspection/query requires the same Bearer rules as REST (default: yes for protected APIs per root `AGENTS.md`).
- **`schema.graphqls`:** Currently defines **`Query` only** (no `Mutation` / `Subscription`). Plan implements **query** support first; extend the adapter for mutations when the schema grows.

## Step 1 — Inventory

- List imports of `../lib/rest-adapter` under `src/services/` and confirm each protected call passes `token` from callers.
- Skim `openapi.yaml` only as the REST contract reference (read-only; do not edit in-repo per `AGENTS.md`).

## Step 2 — REST refactor (structure)

Pick one:

- **Minimal:** Leave `rest-adapter.ts` as-is; add `graphql-adapter.ts` next to it.
- **Explicit:** Add `src/lib/adapters/rest.ts` (move implementations) and `src/lib/adapters/graphql.ts`; keep `rest-adapter.ts` as a thin re-export to avoid a large import churn, **or** update all service imports once.

Optional: export `restQuery` / `restMutate` names that delegate to `requestJson`/`requestVoid`—skip if it adds noise without callers.

## Step 3 — GraphQL adapter (no new dependency)

- Add **`requestGraphql<T>(options)`** with:
  - `query: string`, `variables?: Record<string, unknown>`, `token?: string`, optional `fallbackErrorMessage`.
  - `POST` to **`graphqlEndpoint`** resolved from `import.meta.env.VITE_GRAPHQL_URL` with a documented default relative path once backend confirms it.
  - Headers: `Content-Type: application/json`; if `token`, merge **`jsonAuthHeaders(token)`** from `src/lib/api.ts`.
  - Parse body: if top-level `errors` exists and is non-empty, throw using first `message` (or join); else return `data` as `T` (narrow with generic).
- Reuse or mirror **`readApiErrorMessage`** only if GraphQL errors are returned as HTTP errors with the same JSON shape; otherwise handle GraphQL `errors` in the adapter only.

## Step 4 — Dev proxy and env

- In `vite.config.ts`, add a `server.proxy` entry for the GraphQL path targeting the same backend host as `/api/v1` (e.g. `http://localhost:8080`) once the path is fixed.
- Document **`VITE_GRAPHQL_URL`** in `.env.example` (full URL in prod; in dev often empty + relative path).

## Step 5 — Services

- Add **`src/services/graphql/`** (or a single module) for operations derived from `schema.graphqls`; first consumer may be the matches-search feature (FEAT-00X)—**no `fetch` in components**.
- Map results to **`src/types/index.ts`** where shapes align with REST DTOs; add small GraphQL-specific types only when fields differ.

## Step 6 — Tests

- **`src/lib/graphql-adapter.test.ts`:** mock `global.fetch` — success with `{ data }`, failure with `{ errors: [{ message }] }`, optional HTTP non-OK if you standardize that behavior.

## Step 7 — Documentation

- File-level comment on each adapter: role, auth rules, pointer to root `AGENTS.md` (REST + Bearer policy).
- When implementation is done, tick acceptance criteria in `FEATURES.md`.

## Step 8 — Verify

- `npm run type-check`, `npm run lint`, `npm run test`.
- Smoke: sign in, one REST call, one GraphQL query against a running backend.

# Implementation Guidelines

- Do **not** add npm packages for GraphQL unless the team explicitly approves (per root `AGENTS.md`).
- No `any`; use generics and `unknown` where needed.
- Hooks **`useClubs` / `usePracticioners` / `useAuth` under `src/hooks/`** do not exist today—either add them when a page needs them or keep loading data inside feature components; FEAT-008 does not require new hooks unless they simplify token wiring.

# Notes

- Registry text that listed `src/hooks/useAuth.ts` and `useClubs` / `usePracticioners` was outdated; **`useAuth` lives on `AuthContext`**; clubs/practitioners pages may use services directly until dedicated hooks exist.
- **REST “subscriptions”** are out of scope unless the backend defines a concrete mechanism (SSE, etc.).

**Shipped (implementation):** `graphql-adapter.ts`, `graphqlHttpUrl()` + `VITE_GRAPHQL_URL`, Vite proxy for `/graphql`, `src/services/graphql/matches.ts`, Vitest `graphql-adapter.test.ts`, types `GraphqlMatch` / `GraphqlCompetitionInput`, root `AGENTS.md` GraphQL section.
