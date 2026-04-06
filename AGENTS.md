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
├── lib/             # Pure utilities: cn(), formatDate(), validators
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