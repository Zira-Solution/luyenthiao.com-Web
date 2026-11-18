import { safeRedirectPath } from './safe-redirect'

// Pure decision behind proxy.ts (spec 2026-11-18-web-security-foundation §3.2–§3.3). The auth hint is a UX hint,
// not a security boundary: the backend authorises every API call itself.

/** Pages a guest may open. '/' matches only itself; the others also match their sub-paths. */
export const PUBLIC_PATHS = [
  '/',
  '/login',
  '/signup',
  '/forgot-password',
  '/reset-password',
  '/ranking',
  '/school-ranking',
  '/placement-test',
  '/testlevels',
] as const

/** Pages a visitor with the hint is sent away from. */
export const GUEST_ONLY_PATHS = ['/login', '/signup'] as const

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS'])
/**
 * Known static-asset extensions (public/, clone-assets): never redirect these. An allowlist, not "any dot",
 * so a dynamic route like /check-point/1.5 is still protected.
 */
const STATIC_FILE =
  /\.(?:jpe?g|png|gif|webp|avif|svg|ico|mp3|wav|ogg|m4a|mp4|webm|woff2?|ttf|otf|css|js|json|txt|xml|webmanifest|map)$/i

export interface RouteRequest {
  pathname: string
  /** request.nextUrl.search: '' or '?…' */
  search: string
  method: string
  secFetchSite: string | null
  hasAuthHint: boolean
}

export type RouteDecision =
  { kind: 'next' } | { kind: 'redirect'; location: string } | { kind: 'forbidden' }

/** Segment-boundary match: '/ranking' matches '/ranking' and '/ranking/…', never '/rankingx'. */
function matchesPath(pathname: string, path: string): boolean {
  if (path === '/') return pathname === '/'
  return pathname === path || pathname.startsWith(`${path}/`)
}

function isIn(pathname: string, paths: readonly string[]): boolean {
  return paths.some((p) => matchesPath(pathname, p))
}

export function decideRoute(request: RouteRequest): RouteDecision {
  const { pathname, search, method, secFetchSite, hasAuthHint } = request

  if (matchesPath(pathname, '/api')) {
    // CSRF: a state-changing call to our own route handlers must not come from another site.
    if (!SAFE_METHODS.has(method.toUpperCase()) && secFetchSite === 'cross-site') {
      return { kind: 'forbidden' }
    }
    return { kind: 'next' }
  }

  if (STATIC_FILE.test(pathname)) return { kind: 'next' }

  if (hasAuthHint && isIn(pathname, GUEST_ONLY_PATHS)) {
    return {
      kind: 'redirect',
      location: safeRedirectPath(new URLSearchParams(search).get('redirect')),
    }
  }

  if (!hasAuthHint && !isIn(pathname, PUBLIC_PATHS)) {
    const params = new URLSearchParams({ redirect: `${pathname}${search}` })
    return { kind: 'redirect', location: `/login?${params.toString()}` }
  }

  return { kind: 'next' }
}
