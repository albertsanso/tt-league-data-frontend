# Build Plan

## Goal
- Visiting `/` should send users to `/dashboard` (replace history entry).
- Unauthenticated users should still end up on `/login` via existing `ProtectedRoute` when they follow `/dashboard`.

## Acceptance Criteria
- [x] Visiting `/` redirects to `/dashboard` (navigation replace, no flash of a separate “home” page unless unavoidable during load).
- [x] Authenticated users land on the real Dashboard content at `/dashboard`.
- [x] Unauthenticated users hitting `/` → `/dashboard` are redirected to `/login` by `ProtectedRoute` (current behaviour preserved).

---

## Build Plan

**Step 1 — Replace the index route with a redirect** (`src/router.tsx`)
- Remove the lazy `index: true` route that loads `Home`.
- Add an index route whose element is `<Navigate to="/dashboard" replace />` from `react-router-dom`.
- Keep `path: '/'` and `element: <App />` unchanged so the shell (`Header` + `Outlet`) still wraps child routes as today.

**Step 2 — Remove dead code** (`src/pages/Home.tsx`)
- Delete `Home.tsx` if nothing else imports it (after Step 1 it should only be referenced from the router).
- Confirm no tests or docs reference `/` as a “landing” page with unique content (this feature explicitly removes that).

**Step 3 — Optional sanity checks**
- **Header / nav:** If any link points to `/` expecting the old home page, update it to `/dashboard` for consistency (only if such a link exists).
- **Post-login redirect:** If login flow navigates to a hardcoded path after success, ensure it still matches product intent (`/dashboard` is already the common default—verify in `Login` / auth flow).

**Step 4 — Verify**
- Manual:
  - Logged out: open `/` → URL becomes `/dashboard` then `/login` (or equivalent single-hop UX depending on router ordering).
  - Logged in: open `/` → `/dashboard` with dashboard UI.
- Commands:
  - `npm run type-check`
  - `npm run lint`

---

# Implementation Guidelines
- Prefer **`Navigate`** from **`react-router-dom`** over `useEffect` + `useNavigate` in a page component for a static root redirect (fewer moving parts, declarative in the route tree).
- Do not weaken **`ProtectedRoute`**: `/dashboard` stays protected; only the **entry URL** `/` changes.
- **No new dependencies.**

# Notes
- **Shipped:** Index route uses `<Navigate to="/dashboard" replace />`; `src/pages/Home.tsx` removed; `Header` app title links to `/dashboard`.
- If a future marketing landing page is needed, add it under a dedicated path (e.g. `/welcome`) rather than reclaiming `/` without revisiting this feature.
