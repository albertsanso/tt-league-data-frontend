# Build Plan

**Step 1 — Types** (`src/types/index.ts`)
Add auth-specific interfaces:
```ts
interface AuthCredentials { username: string; password: string }
interface LoginResponse  { token: string; type: string; username: string }
interface AuthSession    { username: string; token: string }
```

**Step 2 — API base helper** (`src/lib/api.ts`)
Exports `apiBase` — empty string when `VITE_API_BASE_URL` is unset (dev), otherwise the production host.
All services use `${apiBase}/api/v1/...` so paths are always relative in dev and the Vite proxy can intercept them.
Setting `VITE_API_BASE_URL` to an absolute host (e.g. `https://api.example.com`) enables direct calls in production.
> **Key rule:** never set `VITE_API_BASE_URL` to include `/api/v1` — that belongs in the path, not the base.

**Step 3 — Vite dev proxy** (`vite.config.ts`)
Proxy `/api/v1/*` → `http://localhost:8080` with `changeOrigin: true`. Only applies to relative paths, which is why Step 2 is required.

**Step 4 — Auth service** (`src/services/auth.ts`)
Three functions mapping to the OpenAPI spec, all using `apiBase`:
- `register(credentials)` → `POST /api/v1/auth/register`
- `login(credentials)` → `POST /api/v1/auth/login` → returns `LoginResponse`
- `logout(token)` → `POST /api/v1/auth/logout` with `Authorization: Bearer <token>`

**Step 5 — Auth context** (`src/store/AuthContext.tsx`)
`AuthProvider` component that:
- Holds `session: AuthSession | null` in state
- Rehydrates from `localStorage` on mount (key: `tt_auth_session`)
- Exposes `{ session, isAuthenticated, login, logout }` via a `useAuth()` hook
- On `login()`: calls the auth service, persists to `localStorage`, updates state
- On `logout()`: calls the auth service, clears `localStorage`, resets state

**Step 6 — `ProtectedRoute` component** (`src/components/features/auth/ProtectedRoute.tsx`)
Renders `<Outlet />` when `isAuthenticated`, otherwise `<Navigate to="/login" replace />`.

**Step 7 — Pages**
- `src/pages/Login.tsx` — email/password form; on submit calls `login()` from `useAuth()`, redirects to `/dashboard` on success
- `src/pages/Register.tsx` — same form shape; on submit calls `register()`, then auto-logs in
- `src/pages/Dashboard.tsx` — protected; placeholder content for now
- `src/pages/Settings.tsx` — protected; placeholder content for now

**Step 8 — Router** (`src/router.tsx`)
Restructure into two groups:
```
/ (App shell)
├── index → Landing (Home, public)
├── login → Login (public)
├── register → Register (public)
└── ProtectedRoute (guard)
    ├── dashboard → Dashboard
    └── settings → Settings
```
Remove the old `/clubs`, `/players`, `/matches` top-level routes for now (they will be revisited under a future feature).

**Step 9 — Wire up provider** (`src/main.tsx`)
Wrap `<RouterProvider>` inside `<AuthProvider>`.

**Step 10 — Header** (`src/components/layout/Header.tsx`)
Read `isAuthenticated` from `useAuth()`. Show a "Logout" button when authenticated; show "Login" link when not.

# Notes
- API spec defined in `openapi.yaml` (root folder), backend base URL: `http://localhost:8080/api/v1`
- **CORS / proxy:** The Vite proxy only intercepts *relative* paths. All services must use `${apiBase}/api/v1/...` from `src/lib/api.ts`. Setting `VITE_API_BASE_URL` to an absolute URL with `/api/v1` in it will break the proxy in dev — the env var must be the host only (e.g. `https://api.example.com`).
- **Dev setup:** leave `VITE_API_BASE_URL` unset (see `.env.example`).
- Refresh token strategy to be decided before building a subsequent auth feature.

