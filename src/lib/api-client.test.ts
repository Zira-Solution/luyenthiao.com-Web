import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { apiFetch, authFetch, ApiError, GENERIC_ERROR_MESSAGE } from '@/lib/api-client'
import { useAuthStore } from '@/store/auth-store'

describe('authFetch', () => {
  beforeEach(() => {
    useAuthStore.setState({
      accessToken: 'old-token',
      user: { id: 1, role: 'STUDENT' },
      status: 'authenticated',
    })
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    useAuthStore.setState({ accessToken: null, user: null, status: 'idle' })
  })

  it('retries once with a new token after a 401', async () => {
    const fetchMock = vi.fn()
    fetchMock.mockResolvedValueOnce(
      new Response(JSON.stringify({ message: 'expired' }), { status: 401 }),
    )
    fetchMock.mockResolvedValueOnce(
      new Response(JSON.stringify({ accessToken: 'new-token', user: { id: 1, role: 'STUDENT' } }), {
        status: 200,
      }),
    )
    fetchMock.mockResolvedValueOnce(new Response(JSON.stringify({ ok: true }), { status: 200 }))
    vi.stubGlobal('fetch', fetchMock)

    const result = await authFetch<{ ok: boolean }>('/auth/change-password', { method: 'POST' })

    expect(result).toEqual({ ok: true })
    expect(fetchMock).toHaveBeenCalledTimes(3)
    expect(useAuthStore.getState().accessToken).toBe('new-token')

    const retryInit = fetchMock.mock.calls[2]![1] as RequestInit
    const retryHeaders = new Headers(retryInit.headers)
    expect(retryHeaders.get('Authorization')).toBe('Bearer new-token')
  })

  it('dedupes concurrent 401s into a single refresh call', async () => {
    const fetchMock = vi.fn()
    fetchMock.mockResolvedValueOnce(
      new Response(JSON.stringify({ message: 'expired' }), { status: 401 }),
    )
    fetchMock.mockResolvedValueOnce(
      new Response(JSON.stringify({ message: 'expired' }), { status: 401 }),
    )
    fetchMock.mockResolvedValueOnce(
      new Response(JSON.stringify({ accessToken: 'new-token', user: { id: 1, role: 'STUDENT' } }), {
        status: 200,
      }),
    )
    fetchMock.mockResolvedValueOnce(new Response(JSON.stringify({ ok: 1 }), { status: 200 }))
    fetchMock.mockResolvedValueOnce(new Response(JSON.stringify({ ok: 2 }), { status: 200 }))
    vi.stubGlobal('fetch', fetchMock)

    await Promise.all([
      authFetch<{ ok: number }>('/auth/change-password', { method: 'POST' }),
      authFetch<{ ok: number }>('/auth/change-password', { method: 'POST' }),
    ])

    // 2 initial 401s + exactly 1 refresh + 2 retries = 5 total fetch calls
    expect(fetchMock).toHaveBeenCalledTimes(5)
    const refreshCalls = fetchMock.mock.calls.filter((call) =>
      String(call[0]).includes('/auth/refresh'),
    )
    expect(refreshCalls).toHaveLength(1)
  })

  it('clears the session and rethrows the original error when refresh itself fails', async () => {
    const fetchMock = vi.fn()
    fetchMock.mockResolvedValueOnce(
      new Response(JSON.stringify({ message: 'expired' }), { status: 401 }),
    )
    fetchMock.mockResolvedValueOnce(
      new Response(JSON.stringify({ message: 'no cookie' }), { status: 401 }),
    )
    vi.stubGlobal('fetch', fetchMock)

    await expect(authFetch('/auth/change-password', { method: 'POST' })).rejects.toThrow(ApiError)
    expect(useAuthStore.getState().status).toBe('unauthenticated')
    expect(useAuthStore.getState().accessToken).toBeNull()
  })
})

describe('apiFetch', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it("uses the backend's message and code for a NestJS error body", async () => {
    const fetchMock = vi.fn().mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          statusCode: 401,
          message: 'Sai tài khoản hoặc mật khẩu',
          error: 'Unauthorized',
        }),
        { status: 401 },
      ),
    )
    vi.stubGlobal('fetch', fetchMock)

    await expect(apiFetch('/auth/login', { method: 'POST' })).rejects.toMatchObject({
      status: 401,
      message: 'Sai tài khoản hoặc mật khẩu',
      code: 'Unauthorized',
      fromApi: true,
    })
  })

  it('prefers a string `code` over `error` and joins validation messages', async () => {
    const fetchMock = vi.fn().mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          statusCode: 400,
          message: ['a sai', 'b sai'],
          error: 'Bad Request',
          code: 'VALIDATION',
        }),
        { status: 400 },
      ),
    )
    vi.stubGlobal('fetch', fetchMock)

    await expect(apiFetch('/x')).rejects.toMatchObject({
      message: 'a sai, b sai',
      code: 'VALIDATION',
      fromApi: true,
    })
  })

  it.each([
    ['an HTML 502 page', new Response('<html><body>Bad Gateway</body></html>', { status: 502 })],
    [
      "Nest's default 500 body",
      new Response(JSON.stringify({ statusCode: 500, message: 'Internal server error' }), {
        status: 500,
      }),
    ],
    [
      'a non-Nest JSON body',
      new Response(JSON.stringify({ message: 'stack trace here' }), { status: 400 }),
    ],
    ['an empty body', new Response(null, { status: 404 })],
  ])('shows the generic message for %s', async (_label, response) => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValueOnce(response))

    const error = await apiFetch('/x').catch((e: unknown) => e)
    expect(error).toBeInstanceOf(ApiError)
    expect(error).toMatchObject({ message: GENERIC_ERROR_MESSAGE, fromApi: false, code: null })
  })

  it('reports a network failure as status 0 with the generic message', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValueOnce(new TypeError('Failed to fetch')))

    await expect(apiFetch('/x')).rejects.toMatchObject({
      status: 0,
      message: GENERIC_ERROR_MESSAGE,
      fromApi: false,
    })
  })

  it('reports a 2xx response with a non-JSON body as a generic ApiError', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValueOnce(new Response('<html>', { status: 200 })))

    const error = await apiFetch('/x').catch((e: unknown) => e)
    expect(error).toBeInstanceOf(ApiError)
    expect(error).toMatchObject({ status: 200, message: GENERIC_ERROR_MESSAGE, fromApi: false })
  })

  it('returns undefined for a 204 No Content response', async () => {
    const fetchMock = vi.fn().mockResolvedValueOnce(new Response(null, { status: 204 }))
    vi.stubGlobal('fetch', fetchMock)

    const result = await apiFetch('/auth/logout', { method: 'POST' })
    expect(result).toBeUndefined()
  })

  it("always sends credentials: 'include' so the refresh cookie is attached", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({ ok: true }), { status: 200 }))
    vi.stubGlobal('fetch', fetchMock)

    await apiFetch('/auth/login', { method: 'POST' })

    const init = fetchMock.mock.calls[0]![1] as RequestInit
    expect(init.credentials).toBe('include')
  })

  it('does not attempt a refresh on a 401 (only authFetch does)', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ message: 'Sai tài khoản hoặc mật khẩu' }), { status: 401 }),
      )
    vi.stubGlobal('fetch', fetchMock)

    await expect(apiFetch('/auth/login', { method: 'POST' })).rejects.toThrow(ApiError)

    expect(fetchMock).toHaveBeenCalledTimes(1)
    const refreshCalls = fetchMock.mock.calls.filter((call) =>
      String(call[0]).includes('/auth/refresh'),
    )
    expect(refreshCalls).toHaveLength(0)
  })

  it('does not attach Content-Type: application/json when body is FormData', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({ url: 'https://cdn.example.com/a.png' }), { status: 200 }))
    vi.stubGlobal('fetch', fetchMock)

    const body = new FormData()
    body.append('file', new Blob(['x'], { type: 'image/png' }), 'a.png')

    await apiFetch('/uploads', { method: 'POST', body })

    const init = fetchMock.mock.calls[0]![1] as RequestInit
    const headers = new Headers(init.headers)
    expect(headers.has('Content-Type')).toBe(false)
  })
})
