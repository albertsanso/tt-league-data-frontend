# Build Plan

**Step 0 — Source of truth**

- Obtain the updated API contract from the backend (exported `openapi.yaml` or equivalent). Replace repo root `openapi.yaml` with that version, or merge intentional edits and record the backend commit or version in **Notes**.
- Optionally validate the file (OpenAPI 3 syntax) with any project-standard tool; fix YAML issues before touching code.

**Step 1 — Inventory**

- List every `paths` entry in `openapi.yaml` that the frontend should call now or soon.
- Map each to callers: `src/services/auth.ts`, `clubs.ts`, `players.ts`, `matches.ts`, and any direct `fetch` elsewhere.
- Note **breaking deltas**: renamed paths, new required query/body fields, removed operations, and schema renames.

**Step 2 — Align types** (`src/types/index.ts`)

- For each DTO the UI or services consume, mirror `components.schemas` from `openapi.yaml` (property names and optionality). Prefer names that match the spec (e.g. `ClubDto`, `SeasonPlayerDto`, `MatchDto`) or a single clear alias if the codebase already uses a shorter name—**fields must match JSON**, not legacy guesses.
- Known mismatches today (fix as part of this feature):
  - **`Club` vs `ClubDto`:** Spec includes optional `yearRanges: string[]`; ensure the type allows it.
  - **`SeasonPlayer` vs `SeasonPlayerDto`:** Spec uses `clubMemberId`, `licenseId`, `licenseTag`, `yearRange` (required set differs from current `playerId` / `season` / `license`).
  - **`PlayersSingleMatch` vs `MatchDto`:** `GET /match/{id}` returns **`MatchDto`** (`homeTeam`, `awayTeam`, `matchDate`, scores, etc.), not home/away season player IDs plus `results[]`. Replace or supplement the frontend type with `MatchDto` (and related DTOs) and update any hook/UI that assumed the old shape.
- Add types for new operations you introduce (e.g. `FindMatchesRequestBodyDto`, `EnrichedMatchDto`) only when a service or page needs them—avoid unused types.
- Keep `AuthCredentials` aligned with `Users` (username + password). Ensure `LoginResponse` matches `components.schemas.LoginResponse`.

**Step 3 — Auth service** (`src/services/auth.ts`)

- Re-check paths: `/auth/register`, `/auth/login`, `/auth/logout` (method, headers, bearer on logout).
- If the spec changes request/response bodies (e.g. register returns a richer `Users` object), narrow types and handle new status codes (`400`, `401`, `500`) consistently.
- Optionally map `ErrorResponse` JSON to thrown errors with `message` for clearer UX (still no `any`; parse with type guards or a small helper).

**Step 4 — Clubs service** (`src/services/clubs.ts`)

- Confirm query parameter names and encoding for list/search endpoints (e.g. `/club/find_by_similar_name?name=`).
- Replace empty placeholder search with a deliberate contract: either require a `name` argument in `fetchClubs(name: string)` or use another documented endpoint if the spec no longer allows “empty name” behaviour.

**Step 5 — Season players service** (`src/services/players.ts`)

- Verify path templates: `/season_player/search_by_name/{username}`, `/season_player/find_by_practicioner/{practicionerId}` (spelling matches backend).
- Update return types to `SeasonPlayerDto[]` (or the aligned interface from Step 2).

**Step 6 — Matches service** (`src/services/matches.ts`)

- Align `fetchMatchById` with `GET /match/{id}` → **`MatchDto`**.
- If the product needs enriched rows (`POST /match/enriched/find_matches`), add a function that sends `FindMatchesRequestBodyDto` and returns `EnrichedMatchDto[]` (new types from Step 2).

**Step 7 — Hooks and consumers**

- Update `src/hooks/useMatches.ts` (e.g. `useMatch`) to use the new match type returned by the service.
- Search the repo for imports of renamed or removed types and fix compile errors.
- Adjust any placeholder pages that will display API data so fields match the DTOs (even if still minimal).

**Step 8 — Proxy and env** (`vite.config.ts`, `src/lib/api.ts`, `.env.example`)

- If the spec’s `servers` URL or global `basePath` semantics change, ensure `apiBase` + Vite proxy still send traffic to the correct origin (see FEAT-001 rule: base URL must not include `/api/v1`).

**Step 9 — Verification**

- Run `npm run type-check` and `npm run lint`.
- Smoke-test against a running backend: register/login/logout; one club call; one season-player call; `GET /match/{id}` with a real UUID.

# Implementation Guidelines

- Do **not** add OpenAPI code generation unless the team decides otherwise (repo currently uses hand-written services; stay consistent unless an ADR changes that).
- No `any`; use `unknown` and narrowing for error payloads.
- Keep all HTTP calls in `src/services/` per root `AGENTS.md`.
- When the spec uses `ErrorResponse`, prefer surfacing `message` (and optional `code`) over generic `"Login failed"` strings where it improves debugging.

# Notes

- Root `openapi.yaml` describes `MatchDto` vs legacy frontend `PlayersSingleMatch`; treating this feature as “spec updated” usually means **dropping or renaming** the legacy match shape in favour of DTOs from the spec.
- Backend spelling `practicioner` is intentional in paths and schemas; keep it in URLs even if domain language elsewhere says “practitioner”.
- If the backend ships a different file than this repo’s YAML, diff the two before editing types so you do not chase the wrong schema.
