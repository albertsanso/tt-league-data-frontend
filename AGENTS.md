# CLAUDE.md — Agentic Development Guide

This file provides Claude (and other AI agents) with the conventions, constraints,
and workflows for this project. Read this before making any changes.

---

## Vision

This document outlines the comprehensive requirements for a Table Tennis Leagues data Web Application that enables users to browse matches from single-match pairings, and manage information related to Clubs, Club members, Players, Matches and Results.

## Project Overview

### Overview
- Managing clubs across seasons
- Managing practitioners (players) and their association to clubs across seasons.
- Tracking season-specific player entries (`SeasonPlayer`) including licenses and season ranges.
- Recording match-level results (`SeasonPlayerResult`) and composing single-match pairings (`PlayersSingleMatch`).
- Searching and retrieving player-season records by identifiers| names| licenses| and flexible name-matching tokens.

### Tech Stack
- **Framework:** React 18 (Vite)
- **Styling:** Tailwind CSS
- **Routing:** react-router-dom v6
- **Icons:** lucide-react

**Stage:** Early development

---

## Repository Structure

```
src/
├── components/
│   ├── ui/          # Primitives: Button, Input, Modal, Badge, etc.
│   ├── layout/      # App shell: Header, Sidebar, Footer, PageWrapper
│   └── features/    # Domain-specific components grouped by feature
├── hooks/           # Custom React hooks
├── lib/             # Pure utilities, REST + GraphQL adapters, `api.ts`, `read-api-error.ts`
├── services/        # API calls and external integrations
├── store/           # Global state (Zustand / Context)
├── types/           # Shared TypeScript interfaces and enums
└── styles/          # Global CSS, Tailwind base overrides
```

---

## Code Conventions

### TypeScript
- All files use `.tsx` for components, `.ts` for logic.
- Prefer `interface` over `type` for component props.
- No `any`. Use `unknown` + type narrowing where needed.
- Export types from `src/types/index.ts`.

### Components
- One component per file, named in PascalCase.
- Always type props explicitly.
- Use named exports only (no default exports).

### Tailwind CSS
- Use `cn()` from `src/lib/utils.ts` for conditional class merging.
- Never use inline `style={}` unless the value is dynamic.
- Design tokens live in `tailwind.config.ts` — extend there, not ad-hoc.

### Hooks
- Custom hooks live in `src/hooks/`, named `useSomething.ts`.
- One hook per file.

### Services
- All fetch/API calls live in `src/services/`.
- Never call APIs directly inside components.

### REST adapter (`src/lib/rest-adapter.ts`)
- **Single HTTP layer:** `requestJson` and `requestVoid` wrap `fetch`, use `apiBase` from `src/lib/api.ts`, merge headers, and surface errors via `readApiErrorMessage` (with optional `fallbackErrorMessage`).
- **Token:** Pass `token` for every **protected** `/api/v1/**` call. Omit `token` only for **`POST /api/v1/auth/register`** and **`POST /api/v1/auth/login`** (same rule as *Backend API authentication* below).
- **Services stay thin:** `src/services/*.ts` should call the adapter only—no raw `fetch`, no duplicated error parsing.

### GraphQL adapter (`src/lib/graphql-adapter.ts`)
- **`requestGraphql<T>`** POSTs to the URL from `graphqlHttpUrl()` in `src/lib/api.ts` (default **`/graphql`**; override with **`VITE_GRAPHQL_URL`** — path or absolute URL, see `.env.example`).
- **Token:** Pass `token` for protected operations the same way as REST; omit only if the backend allows the operation anonymously.
- **Services:** Put GraphQL calls in **`src/services/graphql/`** (or other `src/services/*` modules), not in components.

### Backend API authentication
- The app calls the API under **`/api/v1/...`** (relative URLs in dev so Vite’s proxy forwards to the backend). Do not embed `/api/v1` in `VITE_API_BASE_URL` (see `src/lib/api.ts`).
- **Unauthenticated** requests (no `Authorization` header): only **`POST /api/v1/auth/register`** and **`POST /api/v1/auth/login`**—everything else on `/api/v1/**` is treated as **protected** by the backend and expects a bearer token.
- **Register** uses **`RegisterCredentials`** (`username`, `email`, `password`) as in **`openapi.yaml`** / **`src/services/auth.ts`**. **Login** uses **`AuthCredentials`** (`username`, `password`) only.
- **Protected** requests must send **`Authorization: Bearer <token>`** using the token from the signed-in session (`AuthSession.token`, exposed via `useAuth()` in the UI).
- When you add or change service functions, attach that header for every protected endpoint; the UI living behind `ProtectedRoute` does **not** replace API-side auth.

---

## Agentic Task Workflows

### Adding a New Feature
1. Define types in `src/types/`.
2. Create service in `src/services/` if API calls are needed.
3. Create components in `src/components/features/<featureName>/`.
4. Add route in `src/router.tsx` if needed.

### Adding a UI Primitive
1. Create file in `src/components/ui/<ComponentName>.tsx`.
2. Accept `className` as an optional prop.
3. Use `cn()` to merge classes.
4. Export the component AND its props interface.

---

## What Agents Should NOT Do

- Do not modify **`openapi.yaml`** (repository root). It is a **read-only** contract snapshot: paths, schemas, and examples must match what the backend team publishes. To align the app with API changes, replace the file with an export from the backend (or merge only via human-approved upstream updates)—never hand-edit or extend this file to invent endpoints. Update **`src/types/`** and **`src/services/`** to match the YAML you are given.
- Do not install new dependencies without listing them here first.
- Do not modify `tailwind.config.ts` tokens without a comment explaining why.
- Do not introduce a new state management library.
- Do not refactor unrelated code while completing a task.
- Do not write tests unless the task explicitly says so.

---

## Environment Variables

Variables must be prefixed with `VITE_` to be accessible in the browser.
Never commit `.env`. Use `.env.example` as the template.

---

## Commands

```bash
npm install        # Install dependencies
npm run dev        # Start dev server at http://localhost:5173
npm run build      # Production build
npm run type-check # TypeScript validation
npm run lint       # ESLint
npm run test       # Vitest
```

## Architecture Decisions

See `/docs/adr`.

Agents MUST:
- Follow accepted ADRs
- Not override decisions without creating a new ADR


### Decisions Log

| Date | Decision | Reason |
|------|----------|--------|
| ADR-001 | Use Vite | See /docs/adr/001-use-vite.md |