# SDD agent guide - architecture

This document provides the architecture of the project to the SDD agents.

---

## API authentication (planning & acceptance)

When drafting **goals**, **acceptance criteria**, or **build plans** for features that call the HTTP API, assume the backend enforces the following (unless `openapi.yaml` or product docs explicitly say otherwise):

- **Unauthenticated** requests — no `Authorization` header: only the routes used **before** a session exists, i.e. **`POST …/auth/register`** and **`POST …/auth/login`** under the app’s API prefix.
- **All other** **`/api/...`** routes require **`Authorization: Bearer <token>`** using the access token from the authenticated session (after login).

In **this** repository the API prefix is **`/api/v1`** (e.g. `POST /api/v1/auth/login`, `GET /api/v1/club/...`). The rule above means: **every** `/api/v1/**` call **except** **`POST /api/v1/auth/register`** and **`POST /api/v1/auth/login`** must be planned and implemented with a bearer token (including e.g. **`POST /api/v1/auth/logout`** and all domain routes).

- **`OpenAPI` `security` blocks** may not list every path; treat the **product/backend contract** as authoritative when writing SDD acceptance criteria.
- Do **not** instruct agents to edit repository-root **`openapi.yaml`** in SDD or feature plans—it is **read-only** in this repo (see root [`AGENTS.md`](../../AGENTS.md) — *What Agents Should NOT Do*). Plans must assume the spec is replaced only from the backend, not extended in the frontend tree.
- For **how** to attach headers in `src/services/` and related helpers, see the repository root [`AGENTS.md`](../../AGENTS.md) section **Backend API authentication**.

---

## GraphQL HTTP path (not REST prefix)

When writing **goals**, **acceptance criteria**, or **build plans** that mention GraphQL:

- The GraphQL HTTP endpoint is **`/graphql`** by default in **both development and production**. It is **not** mounted under the REST API context path **`/api/v1`** (REST stays under `/api/v1/...`; GraphQL is a separate path on the same host unless `VITE_GRAPHQL_URL` overrides it).
- Implementation: `graphqlHttpUrl()` in [`src/lib/api.ts`](../../src/lib/api.ts) with `VITE_GRAPHQL_URL` optional override (path or absolute URL), per root [`AGENTS.md`](../../AGENTS.md) — *GraphQL adapter*.
- **Do not** assume or document **`/api/v1/graphql`** as the standard app default when planning features; that path is out of scope for this project’s default wiring.

---

## Quick checklist
- [ ] Features that call **`/api/v1/...`** (other than register/login) mention **Bearer** auth in criteria or build steps where relevant ([API authentication](#api-authentication-planning--acceptance)).
