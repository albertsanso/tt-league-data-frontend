# FEATURES.md — Feature Registry & Build Plans

This file is the single source of truth for planned, in-progress, and completed features.

**For humans:** Add new features under `## Backlog` using the template below.
**For agents:** Only work on features marked `status: ready`. Update status as you progress. Never modify features marked `status: done` or `status: in-progress` unless explicitly asked.

---

## Status Legend

| Status | Meaning |
|--------|---------|
| `idea` | Captured but not planned yet — no build plan written |
| `planned` | Build plan written, not yet ready to implement |
| `ready` | Build plan approved, agent can start |
| `in-progress` | Currently being implemented |
| `done` | Shipped |
| `blocked` | Waiting on a dependency or decision |

---

## Template

Copy this block to add a new feature:

```
---

### [FEAT-000] Feature Name
- **Status:** idea
- **Priority:** low | medium | high
- **Effort:** small (< 2h) | medium (2–8h) | large (> 8h)
- **Depends on:** —

#### Goal
One sentence: what problem does this solve for the user?

#### Acceptance Criteria
- [ ] Criterion 1
- [ ] Criterion 2

#### Build Plan
> Fill this in when status moves to `planned`.

1. Step 1
2. Step 2

#### Notes
Any open questions, design decisions, or links.

---

```

## In Progress


## Backlog

---

### [FEAT-001] Access control and Navigation
- **Status:** idea
- **Priority:** high
- **Effort:** medium
- **Depends on:** —

#### Goal
Allow users to sign up, log in, and maintain a session so the app can show personalised content.

#### User Personas
- **Guest:** Unauthenticated user who can only see public content.
- **Member:** Authenticated user with access to the dashboard and settings.

#### Navigation & Access Control
- **Public Routes:** - Landing Page (`/`): Public features.
  - Login Page (`/login`): Simple email/password entry.
  - Sign up alternative link (`/register`):  Simple email/password entry.
- **Protected Routes:**
  - Dashboard (`/dashboard`): Primary data visualization.
  - Settings (`/settings`): User profile and app preferences.
- **Security Rule:** Any attempt to access `/dashboard` or `/settings` without a valid session must redirect the user to `/login`.

#### Acceptance Criteria
- [ ] User can register with email + password
- [ ] User can log in and receive a JWT/Bearer token
- [ ] Protected routes redirect unauthenticated users to `/login`
- [ ] Session persists on page refresh

#### Build Plan
TODO

#### Notes
- API spec defined in `openapi.yaml` (root folder), backend base URL: `http://localhost:8080/api/v1`
- **CORS:** Vite proxy rewrites `/api/v1/*` requests as same-origin in dev — no CORS headers needed. Set `VITE_API_BASE_URL` in production to point at the real API host
- Refresh token strategy to be decided before marking `done`

---

## Done

<!-- Completed features move here with a short summary of what was built -->

