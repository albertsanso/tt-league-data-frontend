# Build Plan

**Terminology:** In this repo, the **“rest adapter”** means the **central HTTP layer** used by all API modules: base URL (`apiBase`), optional **`Authorization: Bearer`**, JSON bodies, and consistent **`ErrorResponse`** handling. Today that logic is **spread** across **`src/lib/api.ts`**, **`src/lib/read-api-error.ts`**, and repeated patterns in **`src/services/*.ts`**. FEAT-006 consolidates and documents it, then aligns **`src/types`** and **services** with the **published** **`openapi.yaml`**.

**Constraint — `openapi.yaml` is read-only in this repo** (root **`AGENTS.md`**, *What Agents Should NOT Do*). Agents do **not** hand-edit the YAML to invent paths. **Update the contract** by replacing the file with the backend export (or another human-approved snapshot), then adapt TypeScript and the adapter to **that** file.

---

**Step 1 — Refresh the contract (human / release process)**

- Drop in the latest **`openapi.yaml`** from the API team (version or commit id noted in **Notes** below or in release notes—not inside the YAML unless the backend owns that).
- Optional: validate the file with your standard OpenAPI linter (team choice).

**Step 2 — Gap analysis**

- List every **`paths`** entry the frontend should call (now or next sprint).
- Map each to **`src/services/*`**; flag **missing**, **deprecated**, or **signature-drift** (method, path template, query names, request/response schemas).
- List **`components.schemas`** used by the UI and compare to **`src/types/index.ts`**.

**Step 3 — Design the adapter API**

- Introduce a small module (e.g. **`src/lib/rest-adapter.ts`** or extend **`src/lib/api.ts`** if you prefer a single entry) that exposes functions such as:
  - **`requestJson<T>(token: string | undefined, path: string, init?: RequestInit & { jsonBody?: unknown })`** — prepends **`apiBase`**, sets **`Content-Type: application/json`** when `jsonBody` is set, merges **`bearerAuth(token)`** when `token` is defined (register/login pass **`undefined`**), parses JSON on success, uses **`readApiErrorMessage`** (or equivalent) on failure and throws **`Error`** with a useful message.
  - Convenience **`get` / `postJson` / `putJson` / `delete`** wrappers if they reduce duplication.
- **Rules:** keep **`fetch`** inside this layer only (or only here + **`auth.ts`** during migration); **`src/services/`** stay thin and call the adapter. Align with **Backend API authentication** in **`AGENTS.md`**.

**Step 4 — Implement the adapter**

- Move or re-export **`bearerAuth`** / **`jsonAuthHeaders`** so the adapter is the primary consumer; avoid duplicating header merge logic in each service.
- Ensure **`DELETE`** and **`GET`** without body still attach Bearer when `token` is provided.

**Step 5 — Migrate services**

- Refactor **`src/services/auth.ts`**, **`clubs.ts`**, **`practicioners.ts`**, **`players.ts`**, **`matches.ts`** to use the adapter end-to-end (same public function signatures where possible to limit churn in components).
- Remove ad-hoc **`fetch`** + duplicate error parsing from services after migration.

**Step 6 — Types**

- Update **`src/types/index.ts`** so DTOs match **`components.schemas`** in the new YAML (required fields, renames, new schemas).
- Fix any broken callers and hooks.

**Step 7 — Documentation**

- Add a **REST adapter** subsection to root **`AGENTS.md`** (under **Services** or **Code Conventions**): purpose, when to pass **`token`**, where **`fetch`** is allowed, link to **`read-api-error`** behaviour.
- Optionally add **`docs/api/rest-adapter.md`** only if the team wants a longer narrative—default is **AGENTS.md** only per project habit.

**Step 8 — Verification and tests**

- Run **`npm run type-check`** and **`npm run lint`**.
- **Tests:** add **Vitest** unit tests for the adapter using **`globalThis.fetch` mock** (happy path JSON, **`ErrorResponse`** body, **`401`/`404`** without JSON). This satisfies “rest adapter is tested” without requiring a live backend in CI.
- Manual smoke against **`localhost:8080`** (or staging): login, one protected **GET**, one **POST**/**PUT**/**DELETE** as applicable.

---

## Optional path B — OpenAPI code generation

If the product wants **generated** clients/types from **`openapi.yaml`**:

- **Requires** listing new **devDependencies** in **`AGENTS.md`** first and ideally a short **ADR**.
- Regenerate on each contract drop; commit generated output or generate in CI—team decision.
- **This plan (path A)** assumes **hand-maintained** types and a thin custom adapter unless path B is approved.

# Implementation Guidelines

- **Do not** modify **`openapi.yaml`** in the frontend repo except by **full replacement** from the backend (human operation), per **`AGENTS.md`**.
- **No `any`**; preserve **`readApiErrorMessage`** behaviour for unknown payloads.
- **Do not** refactor unrelated UI while migrating services.

# Notes

- **Depends on FEAT-005:** practicioners and other recent services should be included in the migration so the adapter covers the whole **`src/services`** surface.
- If the backend and YAML **remove** practicioner routes the frontend still calls, **descope** or **block** those UI features in a separate registry entry—do not “fix” by editing YAML locally.
