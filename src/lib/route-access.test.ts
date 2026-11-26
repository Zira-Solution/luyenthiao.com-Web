import { describe, expect, it } from 'vitest'

import { decideRoute, type RouteRequest } from '@/lib/route-access'

function req(overrides: Partial<RouteRequest>): RouteRequest {
  return {
    pathname: '/',
    search: '',
    method: 'GET',
    secFetchSite: null,
    hasAuthHint: false,
    ...overrides,
  }
}

const PUBLIC = [
  '/',
  '/login',
  '/signup',
  '/forgot-password',
  '/reset-password',
  '/ranking',
  '/school-ranking',
  '/placement-test',
  '/testlevels/a1',
  '/vocab',
  '/check-point/demo',
  '/challenges',
  '/challenges/ioe',
  '/challenges/result/res-123',
]
const PROTECTED = [
  '/admin/exam',
  '/admin/exam/123',
  '/account/change-password',
  '/check-point/7',
  '/challenges/room/AB12CD',
  '/testresult',
  '/history',
  '/notebook',
  '/notifications',
  '/tasks',
  '/write/writing-demo-1',
  '/speaking/result/9/preview',
  // a dot in the last segment of a dynamic route is not a static file
  '/check-point/1.5',
  '/write/foo.bar',
  '/admin/exam/x.y',
  // segment boundary: these only look like public paths
  '/rankingx',
  '/testlevels-old',
  '/loginx',
]

describe('decideRoute — pages', () => {
  it.each(PUBLIC)('lets a guest open the public page %s', (pathname) => {
    expect(decideRoute(req({ pathname }))).toEqual({ kind: 'next' })
  })

  it.each(PROTECTED)('sends a guest from %s to /login with the path', (pathname) => {
    expect(decideRoute(req({ pathname }))).toEqual({
      kind: 'redirect',
      location: `/login?redirect=${encodeURIComponent(pathname)}`,
    })
  })

  it('keeps the query string in the redirect parameter', () => {
    expect(decideRoute(req({ pathname: '/history', search: '?page=2' }))).toEqual({
      kind: 'redirect',
      location: '/login?redirect=%2Fhistory%3Fpage%3D2',
    })
  })

  it('allows guests on /testresult only when demo=1', () => {
    expect(decideRoute(req({ pathname: '/testresult', search: '?demo=1&score=5' }))).toEqual({
      kind: 'next',
    })
  })

  it.each(PROTECTED)('lets a hinted visitor open %s', (pathname) => {
    expect(decideRoute(req({ pathname, hasAuthHint: true }))).toEqual({ kind: 'next' })
  })

  it.each(['/login', '/signup'])('sends a hinted visitor from %s to /', (pathname) => {
    expect(decideRoute(req({ pathname, hasAuthHint: true }))).toEqual({
      kind: 'redirect',
      location: '/',
    })
  })

  it('sends a hinted visitor on /login to the safe redirect target', () => {
    expect(
      decideRoute(req({ pathname: '/login', search: '?redirect=%2Fhistory', hasAuthHint: true })),
    ).toEqual({ kind: 'redirect', location: '/history' })
  })

  it.each(['?redirect=%2F%2Fevil.com', '?redirect=%2Flogin'])(
    'falls back to / for the unsafe redirect %s',
    (search) => {
      expect(decideRoute(req({ pathname: '/login', search, hasAuthHint: true }))).toEqual({
        kind: 'redirect',
        location: '/',
      })
    },
  )

  it.each(['/forgot-password', '/reset-password', '/ranking', '/'])(
    'lets a hinted visitor open %s',
    (pathname) => {
      expect(decideRoute(req({ pathname, hasAuthHint: true }))).toEqual({ kind: 'next' })
    },
  )

  it.each([
    '/clone-assets/media/bg-home.72e8fdd5.jpg',
    '/image/logo.png',
    '/audio/a.mp3',
    '/clone-assets/a/B.PNG',
  ])('never redirects a static file (%s)', (pathname) => {
    expect(decideRoute(req({ pathname }))).toEqual({ kind: 'next' })
  })
})

describe('decideRoute — /api route handlers', () => {
  it.each(['POST', 'PUT', 'PATCH', 'DELETE'])('rejects a cross-site %s', (method) => {
    expect(
      decideRoute(req({ pathname: '/api/admin/media', method, secFetchSite: 'cross-site' })),
    ).toEqual({ kind: 'forbidden' })
  })

  it.each(['GET', 'HEAD', 'OPTIONS'])('allows a cross-site %s', (method) => {
    expect(
      decideRoute(req({ pathname: '/api/admin/media', method, secFetchSite: 'cross-site' })),
    ).toEqual({ kind: 'next' })
  })

  it.each(['same-origin', 'same-site', 'none', null])(
    'allows a POST with Sec-Fetch-Site %j',
    (secFetchSite) => {
      expect(decideRoute(req({ pathname: '/api/x', method: 'POST', secFetchSite }))).toEqual({
        kind: 'next',
      })
    },
  )

  it('never redirects /api paths, even for a guest', () => {
    expect(decideRoute(req({ pathname: '/api/admin/media' }))).toEqual({ kind: 'next' })
  })
})
