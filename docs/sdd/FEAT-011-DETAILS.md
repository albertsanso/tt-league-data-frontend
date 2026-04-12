# FEAT-011 — Update rest adapter and related logic from `openapi.yaml`

**Baseline:** [FEAT-007](./FEATURES.md) re-aligned **`src/types`**, **`src/services/*`**, and UI with a prior **`openapi.yaml`** snapshot (central **`src/lib/rest-adapter.ts`**, practicioner search-only REST, **`club-members.ts`**, full **`season_player`** in **`players.ts`**, etc.).

**This feature:** Run the same **contract-driven** loop again whenever the backend publishes a **new** `openapi.yaml` (full file replacement only — root **`AGENTS.md`**). Adapt the adapter only if the **HTTP contract** changes (auth scheme, content types, error shape, new cross-cutting behaviour). Otherwise focus on **paths, methods, query/path params, request/response schemas**, and callers.

---

# Build Plan

## Step 1 — Ingest the new contract (human / release)

- Replace root **`openapi.yaml`** with the backend export (or human-approved snapshot). Note version or commit in **Notes** below.
- Do **not** hand-edit the YAML to “fix” the app; if the spec is wrong, fix upstream or track a blocker.

## Step 2 — Diff and gap analysis

- **Paths:** Enumerate `paths` under server base `/api/v1` and compare to **`src/services/*.ts`** (REST only; GraphQL lives under **`src/services/graphql/`**).
  - Flag **new** endpoints the UI should call → add service functions + types + UI/hooks.
  - Flag **removed or renamed** endpoints → remove or update services; **descope** UI in a separate feature if product scope changes.
  - Flag **parameter drift** (query vs path, required flags, path template names). Example to watch: path segment name in the YAML vs `parameters[].name` must match what the server actually routes.
- **Schemas:** Compare `components.schemas` used by those operations to **`src/types/index.ts`** (required fields, renames, new DTOs).
- **Adapter:** Only if the OpenAPI **security**, **requestBody** content types (e.g. non-JSON), or **error response** contract changes, extend **`rest-adapter.ts`** (and **`read-api-error.ts`** if needed). Otherwise leave the adapter stable.

## Step 3 — Implement service and type updates

- Update **`src/types/index.ts`** first where DTOs changed; fix compile errors outward.
- Update **`src/services/*`** so every REST call uses **`requestJson`** / **`requestVoid`** with:
  - Correct path + method + `encodeURIComponent` where appropriate.
  - **`token`** omitted only for **`POST /api/v1/auth/register`** and **`POST /api/v1/auth/login`**; set for other protected routes (**`AGENTS.md`**).
  - Sensible **`fallbackErrorMessage`** for user-facing failures.

**Re-verify after YAML change:** `auth.ts`, `clubs.ts`, `club-members.ts`, `practicioners.ts`, `players.ts`, `matches.ts`.

**YAML surface not necessarily wired in the app yet:** e.g. **`/club_member/**`**, full **`/season_player`** CRUD, **`/season_player/search_by_names/{names}`**, **`/season_player/find_by_license`**, **`/player_result/**`**, practicioner CRUD if removed from spec — treat as gap-analysis outcomes, not automatic scope.

## Step 4 — Propagate to hooks and components

- Find usages of changed service functions (`grep` / IDE references).
- Adjust hooks under **`src/hooks/`** and feature components under **`src/components/features/`** for new fields, errors, or flows. Avoid unrelated UI refactors.

## Step 5 — Tests

- Extend **`src/lib/rest-adapter.test.ts`** if adapter behaviour changed.
- Run **`npm run type-check`**, **`npm run lint`**, **`npm run test`**.
- Manual smoke: login (unauthenticated POST), one authenticated GET, one mutation (POST/PUT/DELETE) per touched domain.

## Step 6 — Documentation

- If behaviour or rules changed, update the **REST adapter** subsection in root **`AGENTS.md`** (and **`src/lib/rest-adapter.ts`** header comment if the public API changed).
- In **`FEATURES.md`**, check off acceptance criteria when closing the feature.

---

# Implementation Guidelines

- **No `any`**; use `unknown` + narrowing where needed.
- **Single HTTP layer:** no raw **`fetch`** in **`src/services/`** (or elsewhere except as documented during a deliberate migration).
- **Out of scope:** OpenAPI code generation and new npm dependencies unless approved and listed in **`AGENTS.md`** (see FEAT-006 optional path B).

# Notes

- **Relation to FEAT-007:** Same workflow; FEAT-011 is an iteration triggered by a **new** contract snapshot, not a redesign from scratch.
- **OpenAPI quirks:** If path templates and parameter names disagree in the published YAML, confirm the **live backend** path before changing the frontend.
- **Shipped (2026-04-12):** Registry closed as **done**; codebase aligned with current **`openapi.yaml`**, REST via **`rest-adapter.ts`**, checks green per acceptance criteria.
