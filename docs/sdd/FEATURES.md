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

### [FEAT-003] Add vertical menu in Dashboard page
- **Status:** done
- **Priority:** high
- **Effort:** medium
- **Depends on:** FEAT-002

#### Goal
Add a vertical menu in the Dashboard page to navigate to the different sections of the app.

#### Acceptance Criteria
- [x] The vertical menu is added to the Dashboard page
- [x] The vertical menu is responsive and works on all screen sizes
- [x] The vertical menu is styled using the Tailwind CSS classes

#### Feature Details
→ See [FEAT-003-DETAILS.md](./FEAT-003-DETAILS.md) for a detailed breakdown of the feature, build plan, and implementation steps.

---

### [FEAT-004] Add club search page
- **Status:** done
- **Priority:** high
- **Effort:** medium
- **Depends on:** FEAT-003

#### Goal
Add a page to search for clubs by name. The page is accessible from the vertical menu with a new menu item `Clubs search`.
The page should display a list of clubs that match the search. The list should be paginated and should have a form to search for clubs by name.
The page should have a button to add a new club.
The page should have a button to edit a club.
The page should have a button to delete a club.

The backend secures **all** `/api/v1/...` routes except **`POST /auth/register`** and **`POST /auth/login`**: club search/create/update/delete send **`Authorization: Bearer <token>`** from the signed-in session (see root **`AGENTS.md`** — *Backend API authentication*).

#### Acceptance Criteria
- [x] The club search page is added to the app
- [x] The club search page is accessible from the vertical menu with a new menu item `Clubs search`
- [x] The club search page has a form to search for clubs by name
- [x] The club search page has a list of clubs that match the search
- [x] The club search page has a pagination to navigate through the list of clubs
- [x] The club search page has a button to add a new club
- [x] The club search page has a button to edit a club
- [x] The club search page has a button to delete a club
- [x] Every club API call from this feature (`find_by_similar_name`, create, update, delete) sends **`Authorization: Bearer <token>`** using the session token; behaviour matches **`AGENTS.md`**

#### Feature Details
→ See [FEAT-004-DETAILS.md](./FEAT-004-DETAILS.md) for a detailed breakdown of the feature, build plan, and implementation steps.

---

