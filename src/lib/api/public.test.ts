import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import planets from '@/schemas/__fixtures__/planets.json'
import ranking from '@/schemas/__fixtures__/ranking.json'

vi.mock('server-only', () => ({}))

const { getPlanets, getStudentRanking } = await import('@/lib/api/public')

function respond(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

describe('public API', () => {
  const fetchMock = vi.fn()
  beforeEach(() => {
    vi.stubGlobal('fetch', fetchMock)
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })
  afterEach(() => {
    fetchMock.mockReset()
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  it('returns mapped data and asks Next to cache for 60 s', async () => {
    fetchMock.mockResolvedValue(respond(200, planets))
    const result = await getPlanets()
    expect(result.ok).toBe(true)
    const [url, init] = fetchMock.mock.calls[0] ?? []
    expect(url).toMatch(/\/planets\/public$/)
    expect(init?.next).toEqual({ revalidate: 60 })
    expect(init?.signal).toBeInstanceOf(AbortSignal)
  })

  it('builds the ranking query from validated values', async () => {
    fetchMock.mockResolvedValue(respond(200, ranking))
    await getStudentRanking({ period: 'week', page: 2, schoolId: 4 })
    expect(fetchMock.mock.calls[0]?.[0]).toMatch(
      /\/ranking\?page=2&limit=50&period=WEEK&schoolId=4$/,
    )
  })

  it.each([
    ['a 500', () => fetchMock.mockResolvedValue(respond(500, { message: 'x' }))],
    ['a wrong shape', () => fetchMock.mockResolvedValue(respond(200, { nope: true }))],
    ['a network error', () => fetchMock.mockRejectedValue(new TypeError('fetch failed'))],
    ['a timeout', () => fetchMock.mockRejectedValue(new DOMException('timeout', 'TimeoutError'))],
  ])('returns { ok: false } and logs on %s', async (_label, arrange) => {
    arrange()
    await expect(getPlanets()).resolves.toEqual({ ok: false })
    expect(console.error).toHaveBeenCalledWith(
      expect.stringContaining('[public-api] /planets/public'),
    )
  })
})
