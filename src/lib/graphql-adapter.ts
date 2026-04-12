/**
 * HTTP layer for GraphQL over POST: JSON `{ query, variables }`, optional Bearer auth.
 * Domain code lives in `src/services/` (including `src/services/graphql/`). Do not call
 * `fetch` from components. Auth: pass `token` for protected operations (see root `AGENTS.md`).
 */
import { graphqlHttpUrl, jsonAuthHeaders } from './api'
import { readApiErrorMessage } from './read-api-error'

export interface GraphqlRequestInit {
  query: string
  variables?: Record<string, unknown>
  /** Omit only for operations the backend allows without a session; most app queries need a token. */
  token?: string
  fallbackErrorMessage?: string
}

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null
}

function graphqlErrorMessagesFromBody(body: unknown): string | undefined {
  if (!isRecord(body) || !Array.isArray(body.errors) || body.errors.length === 0) {
    return undefined
  }
  const parts: string[] = []
  for (const e of body.errors) {
    if (isRecord(e) && typeof e.message === 'string' && e.message.trim()) {
      parts.push(e.message.trim())
    }
  }
  return parts.length > 0 ? parts.join('; ') : undefined
}

function restStyleMessageFromBody(body: unknown): string | undefined {
  if (!isRecord(body) || typeof body.message !== 'string') return undefined
  return body.message
}

/**
 * Executes a GraphQL operation (query or mutation). Returns the `data` object from the response.
 * Throws if the response contains a non-empty `errors` array or HTTP status is not OK.
 */
export async function requestGraphql<T>(init: GraphqlRequestInit): Promise<T> {
  const { query, variables, token, fallbackErrorMessage } = init

  const headers: Record<string, string> = token
    ? jsonAuthHeaders(token)
    : { 'Content-Type': 'application/json' }

  const url = graphqlHttpUrl()
  const res = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify({ query, variables }),
  })

  const text = await res.text()
  if (!text.trim()) {
    throw new Error(fallbackErrorMessage ?? 'Empty GraphQL response body')
  }

  let body: unknown
  try {
    body = JSON.parse(text) as unknown
  } catch {
    throw new Error(fallbackErrorMessage ?? 'Invalid JSON in GraphQL response')
  }

  const gqlMsg = graphqlErrorMessagesFromBody(body)
  if (gqlMsg) {
    throw new Error(gqlMsg)
  }

  if (!res.ok) {
    const synthetic = new Response(text, { status: res.status, headers: res.headers })
    const detail = await readApiErrorMessage(synthetic)
    throw new Error(
      detail ??
        restStyleMessageFromBody(body) ??
        fallbackErrorMessage ??
        `GraphQL request failed (${res.status})`,
    )
  }

  if (!isRecord(body) || !('data' in body)) {
    throw new Error(fallbackErrorMessage ?? 'No data in GraphQL response')
  }

  return body.data as T
}
