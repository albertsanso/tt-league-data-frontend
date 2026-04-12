import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { requestGraphql } from './graphql-adapter'

describe('graphql-adapter', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('requestGraphql returns data on success and sends Bearer when token is set', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(JSON.stringify({ data: { hello: 'world' } }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    )

    const data = await requestGraphql<{ hello: string }>({
      query: '{ hello }',
      token: 'abc',
    })

    expect(data).toEqual({ hello: 'world' })
    expect(fetch).toHaveBeenCalledTimes(1)
    const [url, init] = vi.mocked(fetch).mock.calls[0] as [string, RequestInit]
    expect(url).toBe('/graphql')
    expect(init.method).toBe('POST')
    expect(init.headers).toMatchObject({ Authorization: 'Bearer abc' })
    expect(JSON.parse(init.body as string)).toEqual({ query: '{ hello }', variables: undefined })
  })

  it('requestGraphql omits Authorization when token is omitted', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(JSON.stringify({ data: { x: 1 } }), { status: 200 }),
    )

    await requestGraphql<{ x: number }>({ query: 'query { x }' })

    const [, init] = vi.mocked(fetch).mock.calls[0] as [string, RequestInit]
    expect(init.headers).toEqual({ 'Content-Type': 'application/json' })
    expect(init.headers).not.toHaveProperty('Authorization')
  })

  it('requestGraphql compacts multi-line queries so the JSON body has no newlines in query', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(JSON.stringify({ data: { ok: true } }), { status: 200 }),
    )

    await requestGraphql<{ ok: boolean }>({
      query: `query {
        ok
      }`,
      token: 't',
    })

    const [, init] = vi.mocked(fetch).mock.calls[0] as [string, RequestInit]
    const raw = init.body as string
    expect(raw).not.toMatch(/\\n/)
    expect(raw).not.toMatch(/\n/)
    const parsed = JSON.parse(raw) as { query: string }
    expect(parsed.query).toBe('query { ok }')
  })

  it('requestGraphql sends variables in the body', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(JSON.stringify({ data: { n: 2 } }), { status: 200 }),
    )

    await requestGraphql<{ n: number }>({
      query: 'query($id: ID!) { n }',
      variables: { id: 'u1' },
      token: 't',
    })

    const [, init] = vi.mocked(fetch).mock.calls[0] as [string, RequestInit]
    expect(JSON.parse(init.body as string)).toEqual({
      query: 'query($id: ID!) { n }',
      variables: { id: 'u1' },
    })
  })

  it('requestGraphql throws from GraphQL errors array', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          data: null,
          errors: [{ message: 'Not found' }, { message: 'Also bad' }],
        }),
        { status: 200 },
      ),
    )

    await expect(
      requestGraphql<unknown>({ query: 'q', token: 't' }),
    ).rejects.toThrow('Not found; Also bad')
  })

  it('requestGraphql throws on HTTP error using API message when present', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(JSON.stringify({ message: 'Forbidden' }), { status: 403 }),
    )

    await expect(requestGraphql<unknown>({ query: 'q', token: 't' })).rejects.toThrow('Forbidden')
  })

  it('requestGraphql throws on empty body', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(new Response('', { status: 200 }))

    await expect(requestGraphql<unknown>({ query: 'q', token: 't' })).rejects.toThrow(
      'Empty GraphQL response body',
    )
  })

  it('requestGraphql uses fallback when HTTP error has no message', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(new Response('{}', { status: 502 }))

    await expect(
      requestGraphql<unknown>({
        query: 'q',
        token: 't',
        fallbackErrorMessage: 'Boom',
      }),
    ).rejects.toThrow('Boom')
  })
})
