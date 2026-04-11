import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { requestJson, requestVoid } from './rest-adapter'

describe('rest-adapter', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('requestJson parses JSON on success and sends Bearer when token is set', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(JSON.stringify({ id: '1' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    )

    const data = await requestJson<{ id: string }>('/api/v1/club/x', { token: 'abc' })

    expect(data).toEqual({ id: '1' })
    expect(fetch).toHaveBeenCalledTimes(1)
    const [, init] = vi.mocked(fetch).mock.calls[0] as [string, RequestInit]
    expect(init.headers).toMatchObject({ Authorization: 'Bearer abc' })
  })

  it('requestJson omits Authorization for unauthenticated JSON POST (register/login pattern)', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(JSON.stringify({ id: 'u' }), { status: 200 }),
    )

    await requestJson('/api/v1/auth/login', {
      method: 'POST',
      jsonBody: { email: 'a@b.c', password: 'x' },
    })

    const [, init] = vi.mocked(fetch).mock.calls[0] as [string, RequestInit]
    expect(init.headers).toEqual({ 'Content-Type': 'application/json' })
    expect(init.headers).not.toHaveProperty('Authorization')
  })

  it('requestJson throws with API message when body has message', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(JSON.stringify({ message: 'Not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      }),
    )

    await expect(requestJson('/api/v1/m', { token: 't' })).rejects.toThrow('Not found')
  })

  it('requestJson uses fallback when error has no message', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(new Response('', { status: 500 }))

    await expect(
      requestJson('/api/v1/m', { token: 't', fallbackErrorMessage: 'Boom' }),
    ).rejects.toThrow('Boom')
  })

  it('requestJson throws on empty success body', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(new Response('', { status: 200 }))

    await expect(requestJson('/api/v1/m', { token: 't' })).rejects.toThrow('Empty response body')
  })

  it('requestVoid resolves on ok without reading body', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(new Response(null, { status: 204 }))

    await expect(
      requestVoid('/api/v1/auth/logout', { method: 'POST', token: 't' }),
    ).resolves.toBeUndefined()
  })

  it('requestVoid throws with parsed message on error', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(JSON.stringify({ message: 'Forbidden' }), { status: 403 }),
    )

    await expect(
      requestVoid('/api/v1/x', { method: 'DELETE', token: 't' }),
    ).rejects.toThrow('Forbidden')
  })
})
