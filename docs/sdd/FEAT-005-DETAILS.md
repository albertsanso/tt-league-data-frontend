# Build Plan

**Step 0 — OpenAPI / backend contract (gate)**

- The repo **`openapi.yaml`** now documents **Practicioner API** paths mirroring **Club**: `GET /practicioner/find_by_similar_name`, `POST`/`PUT /practicioner`, `DELETE /practicioner/{id}`. The **backend must implement** these endpoints (or the spec and frontend must be updated together if the server contract differs).
- If the backend used a different shape, refresh **`openapi.yaml`** from the server and adjust **`src/services/practicioners.ts`** accordingly.

**Step 1 — Target API shape (once documented)**  

Assume the backend will mirror the **Club** pattern under a prefix such as **`/practicioner`** (exact paths **must** come from `openapi.yaml`). A typical set would be:

| Intent | Likely pattern (confirm in spec) |
|--------|----------------------------------|
| Search by name | `GET /practicioner/find_by_similar_name?name=` → `PracticionerDto[]` (or equivalent) |
| Create | `POST /practicioner` with **`PracticionerDto`** body |
| Update | `PUT /practicioner` with full **`PracticionerDto`** (if same convention as clubs) **or** `PUT /practicioner/{id}` — **follow the spec** |
| Delete | `DELETE /practicioner/{id}` (or spec-defined path) |

- Map **`PracticionerDto`** fields: `id`, `fullName` (required per schema), optional `firstName`, `secondName`, `birthDate` (`date` string).

**Step 2 — Authentication**

- Every call **except** register/login must send **`Authorization: Bearer <token>`** (`docs/sdd/AGENTS.md`, root **`AGENTS.md`**). Reuse **`bearerAuth`** / **`jsonAuthHeaders`** from **`src/lib/api.ts`** and pass **`token`** as the first argument to service functions (same pattern as **`src/services/clubs.ts`**).

**Step 3 — Service layer**

- Add **`src/services/practicioners.ts`** (filename may match domain spelling **practicioner**): `fetchPracticionersBySimilarName(token, name)`, `createPracticioner(token, dto)`, `updatePracticioner(token, dto)`, `deletePracticioner(token, id)` — **rename to match actual OpenAPI operationIds/paths** when the spec exists.
- Use **`readApiErrorMessage`** on failure; align request bodies and status codes with the spec.

**Step 4 — Pagination**

- If search returns a **plain array** with no server pagination parameters (same gap as clubs), use **client-side** paging over the last result set unless the spec adds `page`/`limit`.

**Step 5 — Routing**

- Protected lazy route under **`ProtectedAppLayout`**, e.g. **`path: 'practicioners'`** → **`/practicioners`** (or **`practicioners-search`** if you want a longer slug—stay consistent with **`/clubs`**).

**Step 6 — Vertical menu**

- **`src/components/layout/protected-nav.ts`**: new item with label exactly **`Practicioners search`** (per **`FEATURES.md`**), **`to`** matching the route, **lucide-react** icon (e.g. **`Users`**).

**Step 7 — UI (mirror FEAT-004 structure)**

- Reuse **`Modal`** from **`src/components/ui/Modal.tsx`** for add / edit / delete confirm.
- **`src/components/features/practicioners/`** (or **`practicioners-search/`**):
  - **`PracticionersSearchPage.tsx`** — state, **`useAuth()`** token, refetch after mutations.
  - **`PracticionerSearchForm.tsx`** — name (or full-name) input + submit.
  - **`PracticionersResultsTable.tsx`** — columns: at least **fullName**, **id**; optional **firstName**, **secondName**, **birthDate**; row **Edit** / **Delete**.
  - **`PracticionersPagination.tsx`** — client-side Prev/Next if applicable.
  - **`PracticionerFormModal.tsx`** — fields aligned to **`PracticionerDto`**; **add** may need **`crypto.randomUUID()`** for `id` if the API expects client-generated UUIDs (confirm with backend).
  - **`DeletePracticionerConfirmModal.tsx`** — destructive confirm + **`deletePracticioner`**.
- **`src/pages/PracticionersSearch.tsx`** — thin **`PageWrapper`** shell (title e.g. **“Practicioners search”**).

**Step 8 — Types**

- Keep **`PracticionerDto`** in **`src/types/index.ts`** in sync with **`openapi.yaml`** when the schema changes.

**Step 9 — Verification**

- **`npm run type-check`** and **`npm run lint`**.
- Manual smoke with **authenticated** session: search, paginate, add, edit, delete per final spec.

---

## Wireframes

Same information architecture as **FEAT-004** (clubs): protected shell + vertical nav, **Add** toolbar, search form, results table, pagination, modals for add/edit/delete. Replace copy and columns with practicioner fields (**fullName**, **id**, optional name parts / **birthDate**).

---

## Component & file list

| Path | Action | Purpose |
|------|--------|---------|
| `src/pages/PracticionersSearch.tsx` | **Add** | Route shell + **`PageWrapper`**. |
| `src/components/features/practicioners/PracticionersSearchPage.tsx` | **Add** | Orchestration + token wiring. |
| `src/components/features/practicioners/PracticionerSearchForm.tsx` | **Add** | Search form. |
| `src/components/features/practicioners/PracticionersResultsTable.tsx` | **Add** | Results + actions. |
| `src/components/features/practicioners/PracticionersPagination.tsx` | **Add** | Client-side paging. |
| `src/components/features/practicioners/PracticionerFormModal.tsx` | **Add** | Add/edit **`PracticionerDto`**. |
| `src/components/features/practicioners/DeletePracticionerConfirmModal.tsx` | **Add** | Delete confirm. |
| `src/services/practicioners.ts` | **Add** | All practicioner HTTP calls + **Bearer**. |
| `src/router.tsx` | **Edit** | Lazy protected route. |
| `src/components/layout/protected-nav.ts` | **Edit** | **`Practicioners search`** nav item. |

Reuse **`Modal`**, **`Button`**, **`Input`**, **`PageWrapper`**; no new UI dependencies.

### Acceptance criteria → artifacts (traceability)

| `FEATURES.md` criterion | Primary deliverable |
|------------------------|---------------------|
| Page in app | `PracticionersSearch.tsx` + router |
| Menu **Practicioners search** | `protected-nav.ts` |
| Search form | `PracticionerSearchForm.tsx` |
| List of matches | `PracticionersResultsTable.tsx` |
| Pagination | `PracticionersPagination.tsx` + slice in page |
| Add / Edit / Delete | Modals + `practicioners.ts` |
| Bearer on all practicioner API calls | `practicioners.ts` + page/modals + **`AGENTS.md`** |

# Implementation Guidelines

- **No `any`**; **`PracticionerDto`** from **`src/types/index.ts`**.
- **All HTTP** in **`src/services/practicioners.ts`**.
- **Tailwind + `cn()`**; named exports and explicit prop interfaces.
- **API spelling:** use backend **`practicioner`** in URLs and filenames where it matches the spec.

# Notes

- **Depends on FEAT-003:** vertical nav / **`ProtectedAppLayout`**.
- If implementation starts before Step 0 is resolved, mark **`FEATURES.md`** status **`blocked`** and record the dependency in **Notes** here.
- **`season_player/search_by_name/{username}`** searches **season players**, not a global practicioner directory—it is **not** a substitute unless product explicitly accepts that scope.
