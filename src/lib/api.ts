// In dev: leave VITE_API_BASE_URL unset so relative /api/v1/* paths go through the Vite proxy.
// In production: set VITE_API_BASE_URL to the API host (e.g. https://api.example.com) — no trailing slash.
export const apiBase = import.meta.env.VITE_API_BASE_URL ?? ''

const DEFAULT_GRAPHQL_PATH = '/graphql'

/**
 * Full URL for GraphQL POST. Unset `VITE_GRAPHQL_URL` uses `/api/v1/graphql` (same dev proxy as REST).
 * Set to an absolute URL in production, or a path such as `/graphql` if the server mounts it at root.
 */
export function graphqlHttpUrl(): string {
  const raw = (import.meta.env.VITE_GRAPHQL_URL as string | undefined)?.trim()
  if (raw && /^https?:\/\//i.test(raw)) {
    return raw
  }
  const path = raw && raw.startsWith('/') ? raw : DEFAULT_GRAPHQL_PATH
  return `${apiBase}${path}`
}

/** Use on all `/api/v1/**` requests except `POST /auth/register` and `POST /auth/login` (see AGENTS.md). */
export function bearerAuth(token: string): { Authorization: string } {
  return { Authorization: `Bearer ${token}` }
}

export function jsonAuthHeaders(token: string): Record<string, string> {
  return {
    'Content-Type': 'application/json',
    ...bearerAuth(token),
  }
}
