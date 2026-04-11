# FEATURES.md — Feature Registry & Build Plans

This file is the single source of truth for planned, in-progress, and completed features.

**For humans:** Add new features under `## Backlog` using the template below.
**For agents:** Only work on features marked `status: ready`. Update status as you progress. Never modify features marked `status: done` or `status: in-progress` unless explicitly asked.

---

## Status Legend

| Status | Meaning |
|-|-|
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

#### Feature Details
→ See [FEAT-000-DETAILS.md](./FEAT-000-DETAILS.md) for a detailed breakdown of the feature, build plan, and implementation steps.

```

### Feature Details file format
```
# Build Plan
> Fill this in when status moves to `planned`.

1. Step 1
2. Step 2
...

# Implementation Guidelines

# Notes
Any open questions, design decisions, or links.
```

## In Progress



## Backlog

---

## Done

---

### [FEAT-001] Access control and Navigation
- **Status:** done
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
- [x] User can register with email + password
- [x] User can log in and receive a JWT/Bearer token
- [x] Protected routes redirect unauthenticated users to `/login`
- [x] Session persists on page refresh

#### Feature Details
→ See [FEAT-001-DETAILS.md](./FEAT-001-DETAILS.md) for a detailed breakdown of the feature, build plan, and implementation steps.

---

### [FEAT-002] Update openapi spec and related logic
- **Status:** done
- **Priority:** high
- **Effort:** medium
- **Depends on:** -

#### Goal
The openapi.yaml spec has been updated and the related logic needs to be adapted

#### Acceptance Criteria
- [x] `openapi.yaml` matches the backend contract (version/source noted if helpful)
- [x] `src/types` DTOs align with `components.schemas` for every endpoint the frontend calls
- [x] `src/services/*` paths, methods, and payloads match the spec; match/club/player types match responses
- [x] `npm run type-check` and `npm run lint` pass after changes

#### Feature Details
→ See [FEAT-002-DETAILS.md](./FEAT-002-DETAILS.md) for a detailed breakdown of the feature, build plan, and implementation steps.

---

