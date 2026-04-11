/**
 * Central HTTP layer for `/api/v1/...`: `apiBase`, JSON bodies, optional Bearer auth,
 * and `ErrorResponse`-aware failures. Domain modules in `src/services/` call these helpers;
 * do not use raw `fetch` in services (see `AGENTS.md` — REST adapter).
 */
import { apiBase, bearerAuth, jsonAuthHeaders } from './api'
import { readApiErrorMessage } from './read-api-error'

export interface RestRequestInit {
  method?: string
  /** Omit for `POST /auth/register` and `POST /auth/login`; set for all other `/api/v1/**` calls that require auth. */
  token?: string
  jsonBody?: unknown
  /** Used when the API returns no parseable `message` in the error body. */
  fallbackErrorMessage?: string
}

function mergeHeaders(token: string | undefined, withJsonBody: boolean): HeadersInit {
  if (withJsonBody) {
    if (token) return jsonAuthHeaders(token)
    return { 'Content-Type': 'application/json' }
  }
  if (token) return bearerAuth(token)
  return {}
}

/** `path` must start with `/` (e.g. `/api/v1/club/...`). */
export async function requestJson<T>(path: string, init: RestRequestInit = {}): Promise<T> {
  const { method = 'GET', token, jsonBody, fallbackErrorMessage } = init
  const hasBody = jsonBody !== undefined

  const res = await fetch(`${apiBase}${path}`, {
    method,
    headers: mergeHeaders(token, hasBody),
    body: hasBody ? JSON.stringify(jsonBody) : undefined,
  })

  if (!res.ok) {
    const detail = await readApiErrorMessage(res)
    throw new Error(detail ?? fallbackErrorMessage ?? `Request failed (${res.status})`)
  }

  const text = await res.text()
  if (!text.trim()) {
    throw new Error(fallbackErrorMessage ?? 'Empty response body')
  }
  return JSON.parse(text) as T
}

/** For responses with no JSON body (e.g. some `DELETE` / `POST` success). */
export async function requestVoid(path: string, init: RestRequestInit & { method: string }): Promise<void> {
  const { method, token, fallbackErrorMessage } = init

  const res = await fetch(`${apiBase}${path}`, {
    method,
    headers: mergeHeaders(token, false),
  })

  if (!res.ok) {
    const detail = await readApiErrorMessage(res)
    throw new Error(detail ?? fallbackErrorMessage ?? `Request failed (${res.status})`)
  }
}
