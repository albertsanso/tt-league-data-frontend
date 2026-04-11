# Build Plan

**Step 1 — Routing and layout strategy**

- Decide where the vertical nav lives relative to protected pages:
  - **Recommended:** A **`ProtectedAppLayout`** (or `DashboardShell`) wraps **all** authenticated routes (`/dashboard`, `/settings`, and future `/…` sections) so the menu stays visible while users move between sections. This matches “navigate to the different sections of the app” better than a menu that disappears on `/settings`.
  - **Alternative (narrow interpretation):** Render the sidebar only on `/dashboard`; then document that Settings is reached via the global header or a single link in the sidebar that leaves the dashboard layout (worse UX; use only if product requires it).
- In `src/router.tsx`, insert a layout route **inside** the `ProtectedRoute` branch: `element: <ProtectedAppLayout />`, `children: [ … existing dashboard + settings … ]`. Keep lazy loading where it already exists.

**Step 2 — Navigation model**

- Define a small **nav config** (array of `{ to, label, icon }`) in one place, e.g. `src/components/layout/dashboard-nav.ts` or next to the layout component. Use **lucide-react** icons (per root `AGENTS.md`).
- Initial items (adjust labels to taste):
  - `/dashboard` — Overview / home
  - `/settings` — Settings
  - Optional placeholders for future domain sections (Clubs, Players, Matches): either omit until routes exist or add routes + “coming soon” pages so the menu is honest (no dead `href="#"` links).

**Step 3 — `ProtectedAppLayout` UI**

- New file, e.g. `src/components/layout/ProtectedAppLayout.tsx`:
  - Outer: `min-h-[calc(100vh-theme)]` or `min-h-screen` minus header; use flex row on large screens.
  - **Aside:** vertical list of `NavLink` entries; active state via `NavLink` `className` callback + `cn()` (`src/lib/utils.ts`).
  - **Main:** `<Outlet />` for page content.
- Integrate with existing **`PageWrapper`**: either render `PageWrapper` inside each page as today, or pass title via outlet context later — **default for this feature:** keep `PageWrapper` per page; layout only provides sidebar + outlet.

**Step 4 — Responsive behaviour**

- **Desktop (`md` and up):** fixed or sticky aside (e.g. `w-56 shrink-0 border-r border-gray-200 bg-white`), nav stacked vertically with comfortable tap targets.
- **Mobile:** collapse the aside by default; provide a **toggle** (button with `Menu` icon) that opens a **drawer** or **slide-over panel** (fixed inset-y-0 left-0, `z-40`, backdrop). Closing on navigate (`useNavigate` + `useEffect`) improves UX.
- Ensure no horizontal overflow; use `overflow-x-hidden` on the shell if needed.

**Step 5 — Header alignment**

- Avoid duplicate primary nav: when authenticated, consider removing the inline “Dashboard” / “Settings” links from `Header.tsx` and relying on the vertical menu, **or** keep a minimal header (brand + logout only). Pick one pattern and apply consistently.

**Step 6 — Polish and verification**

- Focus styles and `aria-*` on the mobile menu button and panel (basic a11y).
- Run `npm run type-check` and `npm run lint`.
- Manually resize the viewport (or devtools) to confirm mobile and desktop layouts.

# Implementation Guidelines

- Use **Tailwind only** for styling (no inline `style={}` unless dynamic).
- Use **`cn()`** for conditional classes on `NavLink` active states and mobile open/closed.
- **No new dependencies** unless agreed (drawer can be pure CSS + React state).
- Follow **named exports** and explicit prop interfaces for new components.

# Notes

- **Depends on FEAT-002:** no API contract change required for this UI feature; dependency is satisfied once the repo is stable after FEAT-002.
- If nested URLs under `/dashboard/*` are introduced later, the same shell can wrap a `path: 'dashboard'` segment with nested `children` without redoing the sidebar pattern.
- AGENTS.md lists `Sidebar` under planned layout primitives; this feature can either add a thin `Sidebar`-specific primitive under `components/ui/` or keep everything in the layout file — prefer the smallest change that stays readable.
