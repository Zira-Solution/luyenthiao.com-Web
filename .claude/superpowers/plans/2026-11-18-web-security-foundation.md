# Web Security Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give the Next.js client the Zoney-style security layer — security headers and CSP, an auth hint cookie read
by `proxy.ts`, client guards for signed-in and admin routes, a safe `redirect` parameter, an `ApiError` that never
shows raw server bodies, and server/browser-identical HTML sanitising — without changing the backend contract.

**Spec:** `.claude/superpowers/specs/2026-11-18-web-security-foundation-design.md` (commit `d1b4a4c`). Section
numbers below (§n) refer to it.

**Architecture:** Every decision is a pure function in `src/lib/` with its own Vitest file (`security-headers`,
`auth-hint-cookie`, `safe-redirect`, `route-access`, `api-client`, `safe-html`). Thin adapters wire them in:
`next.config.ts` → headers, `store/auth-store.ts` → hint cookie, `proxy.ts` → route decisions, layouts →
`RequireAuth`/`RequireAdmin`, `<SafeHtml>` → every former `dangerouslySetInnerHTML`.

**Tech Stack:** Next.js 16.4.6 (App Router, `proxy.ts`), React 19.2, Zustand 5, Vitest 4.1 + Testing Library (jsdom),
`sanitize-html` 2.18.2 (new).

---

## Read this first (every task)

- **Repository:** `E:\Ziratech\English-Prep-Web-Game\luyenthiao.com-Web`. The Next.js project is `src/`.
- **Run every command from `/E/Ziratech/English-Prep-Web-Game/luyenthiao.com-Web/src` with an UPPER-CASE drive
  letter.** Measured 2026-11-18: with the shell in `e:\…` (lower case) Vitest loads its runner twice and every file
  fails with `TypeError: Cannot read properties of undefined (reading 'config')` / `Vitest failed to find the current
  suite`; from `E:\…` the same suite passes. Start each shell with:
  ```bash
  cd /E/Ziratech/English-Prep-Web-Game/luyenthiao.com-Web/src
  ```
- **Baselines before this plan:** `npm test` → 5 files, 38 tests pass. `npx tsc --noEmit` → 0 errors. `npm run lint`
  → 8 `import-x/order` errors in `components/testlevels/level-header.tsx`, `components/testlevels/level-map.tsx`,
  `components/ui/dialog.tsx` plus `@next/next/no-img-element` warnings (`docs/03-known-issues.md` §3). A task may not
  add to these.
- **Style:** Prettier (`singleQuote`, no semicolons, width 100). Run `npx prettier --write <files you changed>` —
  never `npm run format`. Import order: Node built-ins, external, `@/…`, relative, one blank line between groups.
  Named exports only (default exports only inside `app/`). Components return `React.ReactElement`.
- **Git:** do not run `git add`/`commit`/`stash`/`checkout`/`restore`/`reset`. Each task ends with a commit step that
  the **main session** performs after the owner approved commits for this plan. Implementers stop after Step "verify"
  and report the changed files.
- `src/AGENTS.md` may be rewritten by `next dev`; leave it alone.
- Do not stop a process you did not start. Port 3000 may be in use.

## File map

| File | Status | Responsibility |
|---|---|---|
| `src/lib/security-headers.ts` | create | Builds the security header list and the CSP string (§2) |
| `src/lib/security-headers.test.ts` | create | |
| `src/next.config.ts` | modify | `poweredByHeader: false`, `headers()` from `security-headers` |
| `src/lib/auth-hint-cookie.ts` | create | `lta_authed` cookie name, builders, `setAuthHint`/`clearAuthHint` (§3.1) |
| `src/lib/auth-hint-cookie.test.ts` | create | |
| `src/store/auth-store.ts` | modify | `setSession`/`clearSession` write/delete the hint |
| `src/store/auth-store.test.ts` | create | |
| `src/lib/safe-redirect.ts` | create | `safeRedirectPath` (§3.5) |
| `src/lib/safe-redirect.test.ts` | create | |
| `src/lib/route-access.ts` | create | `decideRoute` — the pure proxy decision (§3.2, §3.3) |
| `src/lib/route-access.test.ts` | create | |
| `src/proxy.ts` | create | Adapter from `NextRequest` to `decideRoute` |
| `src/proxy.test.ts` | create | |
| `src/components/common/not-found-view.tsx` | create | Body of `app/not-found.tsx`, reused by `RequireAdmin` |
| `src/app/not-found.tsx` | modify | Renders `NotFoundView` |
| `src/components/auth/require-auth.tsx` | modify | Redirect carries `?redirect=` |
| `src/components/auth/require-admin.tsx` | create | Admin-only children (§4) |
| `src/components/auth/require-auth.test.tsx`, `require-admin.test.tsx` | create | |
| `src/app/{admin,account,check-point,testresult,write,speaking}/layout.tsx` | create | Apply the guards |
| `src/app/(dashboard)/(protected)/layout.tsx` | create | Applies `RequireAuth` to the moved pages |
| `src/app/(dashboard)/{history,notebook,notifications,tasks}/` | move | into `(dashboard)/(protected)/` |
| `src/app/account/change-password/page.tsx` | modify | Drop the inline `RequireAuth` (layout does it) |
| `src/components/auth/login-form.tsx` | modify | Navigate to the safe `redirect` once authenticated |
| `src/lib/api-client.ts` | modify | New `ApiError` shape and `toApiError` (§5) |
| `src/lib/api-client.test.ts` | modify | |
| `src/lib/safe-html.ts` | create | `sanitizeHtml` allow-list (§6) |
| `src/lib/safe-html.test.ts` | create | |
| `src/components/common/safe-html.tsx` | create | `<SafeHtml>` |
| `src/components/common/safe-html.test.tsx` | create | |
| `src/lib/no-raw-html.test.ts` | create | Fails if `dangerouslySetInnerHTML` appears outside `safe-html.tsx` |
| `src/components/exam/parts/part-gapfill.tsx` | modify | 5 sinks → `<SafeHtml>` |
| `src/components/admin/exam/editor/form/part-settings-fields.tsx` | modify | 1 sink → `<SafeHtml>` |
| `src/components/common/index.ts` | modify | Export `NotFoundView`, `SafeHtml` |
| `src/components/auth/index.ts` | modify | Export `RequireAdmin` |
| `.claude/ARCHITECTURE.md`, `docs/01-architecture.md`, `docs/03-known-issues.md` | modify | Document the layer and the drive-letter trap |

Two refinements of the spec, decided while planning (record them in the docs task):

1. **§5 — 5xx bodies are never `fromApi`.** The backend has no exception filter (checked: no `@Catch` in
   `luyenthiao.com-Backend/src/app`), so an unhandled error returns Nest's default
   `{"statusCode":500,"message":"Internal server error"}` — the Nest shape, but English and meaningless to a student.
   `fromApi` is therefore `true` only for status `< 500`.
2. **§2 — the API origin is also listed in `img-src` and `media-src`.** With an `https:` API this changes nothing
   (`https:` already covers it); it keeps images and audio working when a production build talks to an `http://` API
   (the nginx production simulation in `luyenthiao.com-infra/dev`).

---

### Task 1: Security headers and CSP

**Files:**
- Create: `src/lib/security-headers.ts`, `src/lib/security-headers.test.ts`
- Modify: `src/next.config.ts` (whole file, currently 7 lines)

- [ ] **Step 1: Write the failing test** — `src/lib/security-headers.test.ts`

```ts
import { describe, expect, it } from 'vitest'

import { buildContentSecurityPolicy, buildSecurityHeaders } from '@/lib/security-headers'

function headerValue(headers: { key: string; value: string }[], key: string): string | undefined {
  return headers.find((h) => h.key === key)?.value
}

describe('buildSecurityHeaders', () => {
  it('always sends the non-CSP security headers', () => {
    const headers = buildSecurityHeaders({ apiUrl: 'https://api.luyenthiao.com/api', isProduction: false })
    expect(headerValue(headers, 'Strict-Transport-Security')).toBe('max-age=31536000')
    expect(headerValue(headers, 'X-Content-Type-Options')).toBe('nosniff')
    expect(headerValue(headers, 'X-Frame-Options')).toBe('DENY')
    expect(headerValue(headers, 'Referrer-Policy')).toBe('strict-origin-when-cross-origin')
    expect(headerValue(headers, 'Permissions-Policy')).toBe(
      'camera=(), microphone=(self), geolocation=(), payment=()',
    )
  })

  it('omits the CSP outside production (the dev server needs eval and the HMR socket)', () => {
    const headers = buildSecurityHeaders({ apiUrl: 'http://localhost:3005/api', isProduction: false })
    expect(headerValue(headers, 'Content-Security-Policy')).toBeUndefined()
  })

  it('adds the CSP in production', () => {
    const headers = buildSecurityHeaders({ apiUrl: 'https://api.luyenthiao.com/api', isProduction: true })
    expect(headerValue(headers, 'Content-Security-Policy')).toBe(
      buildContentSecurityPolicy('https://api.luyenthiao.com/api'),
    )
  })
})

describe('buildContentSecurityPolicy', () => {
  it('lists every directive of the spec, in order', () => {
    expect(buildContentSecurityPolicy('https://api.luyenthiao.com/api')).toBe(
      [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline'",
        "style-src 'self' 'unsafe-inline'",
        "img-src 'self' data: blob: https: https://api.luyenthiao.com",
        "media-src 'self' blob: https: https://api.luyenthiao.com",
        "font-src 'self' data:",
        "connect-src 'self' https://api.luyenthiao.com wss://api.luyenthiao.com",
        "object-src 'none'",
        "base-uri 'self'",
        "form-action 'self'",
        "frame-ancestors 'none'",
      ].join('; '),
    )
  })

  it('derives ws: from an http API and keeps the port', () => {
    const csp = buildContentSecurityPolicy('http://localhost:3005/api')
    expect(csp).toContain("connect-src 'self' http://localhost:3005 ws://localhost:3005")
    expect(csp).toContain("img-src 'self' data: blob: https: http://localhost:3005")
  })

  it('drops the path of the API URL', () => {
    expect(buildContentSecurityPolicy('https://example.com:8443/v1/api')).toContain(
      "connect-src 'self' https://example.com:8443 wss://example.com:8443",
    )
  })
})
```

- [ ] **Step 2: Run it — expect FAIL** (`Cannot find module '@/lib/security-headers'`)

Run: `npx vitest run lib/security-headers.test.ts`

- [ ] **Step 3: Implement** — `src/lib/security-headers.ts`

```ts
// Security headers for every response (spec 2026-11-18-web-security-foundation §2), modelled on
// Zoney.vn-Web next.config.ts. Pure so it can be unit-tested; next.config.ts only calls it.

export interface SecurityHeader {
  key: string
  value: string
}

export interface SecurityHeaderOptions {
  /** NEXT_PUBLIC_API_URL; only its origin is used. */
  apiUrl: string
  isProduction: boolean
}

function webSocketOrigin(api: URL): string {
  return `${api.protocol === 'https:' ? 'wss:' : 'ws:'}//${api.host}`
}

// script-src keeps 'unsafe-inline': Next bootstraps with inline scripts, and nonces would force every page to
// render dynamically (node_modules/next/dist/docs/01-app/02-guides/content-security-policy.md, "How nonces work").
// The API origin is repeated in img-src/media-src so an http:// API (local production simulation) still works.
export function buildContentSecurityPolicy(apiUrl: string): string {
  const api = new URL(apiUrl)
  return [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline'",
    "style-src 'self' 'unsafe-inline'",
    `img-src 'self' data: blob: https: ${api.origin}`,
    `media-src 'self' blob: https: ${api.origin}`,
    "font-src 'self' data:",
    `connect-src 'self' ${api.origin} ${webSocketOrigin(api)}`,
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
  ].join('; ')
}

export function buildSecurityHeaders({ apiUrl, isProduction }: SecurityHeaderOptions): SecurityHeader[] {
  // The CSP is production-only: the dev server needs eval() and a WebSocket for HMR.
  const csp: SecurityHeader[] = isProduction
    ? [{ key: 'Content-Security-Policy', value: buildContentSecurityPolicy(apiUrl) }]
    : []
  return [
    ...csp,
    // No includeSubDomains/preload: not every luyenthiao.com subdomain is known to serve HTTPS.
    { key: 'Strict-Transport-Security', value: 'max-age=31536000' },
    { key: 'X-Content-Type-Options', value: 'nosniff' },
    { key: 'X-Frame-Options', value: 'DENY' },
    { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
    // The speaking screens record audio, so the microphone stays allowed for this origin only.
    { key: 'Permissions-Policy', value: 'camera=(), microphone=(self), geolocation=(), payment=()' },
  ]
}
```

- [ ] **Step 4: Wire it** — replace `src/next.config.ts` with

```ts
import type { NextConfig } from 'next'

import { env } from './lib/env'
import { buildSecurityHeaders } from './lib/security-headers'

const nextConfig: NextConfig = {
  output: 'standalone',
  // Do not advertise the framework and version in an x-powered-by header.
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: '/:path*',
        headers: buildSecurityHeaders({
          apiUrl: env.API_URL,
          isProduction: process.env.NODE_ENV === 'production',
        }),
      },
    ]
  },
}

export default nextConfig
```

`lib/env.ts` has no `@/` imports and never throws, so it is safe to load from the config.

- [ ] **Step 5: Verify**

Run: `npx vitest run lib/security-headers.test.ts` → PASS (6 tests).
Run: `npx tsc --noEmit` → 0 errors.
Run: `npm run build` → succeeds (proves the config loads).

- [ ] **Step 6: Commit (main session)**

```bash
git add src/lib/security-headers.ts src/lib/security-headers.test.ts src/next.config.ts
git commit -m "feat(security): send security headers and a production csp"
```

---

### Task 2: Auth hint cookie

**Files:**
- Create: `src/lib/auth-hint-cookie.ts`, `src/lib/auth-hint-cookie.test.ts`, `src/store/auth-store.test.ts`
- Modify: `src/store/auth-store.ts` (the `setSession` and `clearSession` actions, lines 20–30)

- [ ] **Step 1: Write the failing tests**

`src/lib/auth-hint-cookie.test.ts`:

```ts
import { afterEach, describe, expect, it } from 'vitest'

import {
  AUTH_HINT_COOKIE,
  buildAuthHintCookie,
  buildClearedAuthHintCookie,
  clearAuthHint,
  setAuthHint,
} from '@/lib/auth-hint-cookie'

describe('auth hint cookie strings', () => {
  it('sets lta_authed=1 for 30 days, Lax, site-wide', () => {
    expect(buildAuthHintCookie(false)).toBe('lta_authed=1; Path=/; Max-Age=2592000; SameSite=Lax')
  })

  it('adds Secure only when asked', () => {
    expect(buildAuthHintCookie(true)).toBe('lta_authed=1; Path=/; Max-Age=2592000; SameSite=Lax; Secure')
    expect(buildClearedAuthHintCookie(true)).toBe('lta_authed=; Path=/; Max-Age=0; SameSite=Lax; Secure')
  })

  it('expires the cookie when clearing', () => {
    expect(buildClearedAuthHintCookie(false)).toBe('lta_authed=; Path=/; Max-Age=0; SameSite=Lax')
  })
})

describe('setAuthHint / clearAuthHint (jsdom, http://localhost)', () => {
  afterEach(() => {
    clearAuthHint()
  })

  it('writes and removes the cookie in document.cookie', () => {
    setAuthHint()
    expect(document.cookie).toContain(`${AUTH_HINT_COOKIE}=1`)
    clearAuthHint()
    expect(document.cookie).not.toContain(`${AUTH_HINT_COOKIE}=`)
  })
})
```

`src/store/auth-store.test.ts`:

```ts
import { afterEach, describe, expect, it } from 'vitest'

import { useAuthStore } from '@/store/auth-store'

describe('useAuthStore and the auth hint cookie', () => {
  afterEach(() => {
    useAuthStore.getState().clearSession()
    useAuthStore.setState({ status: 'idle' })
  })

  it('setSession writes lta_authed=1', () => {
    useAuthStore.getState().setSession('token', { id: 1, role: 'STUDENT' } as never)
    expect(document.cookie).toContain('lta_authed=1')
    expect(useAuthStore.getState().status).toBe('authenticated')
  })

  it('clearSession removes lta_authed', () => {
    useAuthStore.getState().setSession('token', { id: 1, role: 'STUDENT' } as never)
    useAuthStore.getState().clearSession()
    expect(document.cookie).not.toContain('lta_authed=')
    expect(useAuthStore.getState().status).toBe('unauthenticated')
  })
})
```

The `as never` casts mirror `lib/api-client.test.ts`, which also builds a partial `User`. If `types/auth.ts`'s `User`
has only `id` and `role` as required fields, drop the cast.

- [ ] **Step 2: Run — expect FAIL** (missing module; then cookie assertions fail)

Run: `npx vitest run lib/auth-hint-cookie.test.ts store/auth-store.test.ts`

- [ ] **Step 3: Implement** — `src/lib/auth-hint-cookie.ts`

```ts
// UX hint, NOT a security boundary (spec 2026-11-18-web-security-foundation §3.1): it tells proxy.ts that this
// browser probably has a session, so signed-in pages can redirect before rendering. It holds no token; the backend
// checks the real credential (Bearer access token + HttpOnly refresh cookie) on every call.

export const AUTH_HINT_COOKIE = 'lta_authed'

/** 30 days: the backend's default JWT_REFRESH_EXPIRES_IN. */
const MAX_AGE_SECONDS = 60 * 60 * 24 * 30

export function buildAuthHintCookie(secure: boolean): string {
  return `${AUTH_HINT_COOKIE}=1; Path=/; Max-Age=${MAX_AGE_SECONDS}; SameSite=Lax${secure ? '; Secure' : ''}`
}

export function buildClearedAuthHintCookie(secure: boolean): string {
  return `${AUTH_HINT_COOKIE}=; Path=/; Max-Age=0; SameSite=Lax${secure ? '; Secure' : ''}`
}

function isHttps(): boolean {
  return window.location.protocol === 'https:'
}

export function setAuthHint(): void {
  if (typeof document === 'undefined') return
  document.cookie = buildAuthHintCookie(isHttps())
}

export function clearAuthHint(): void {
  if (typeof document === 'undefined') return
  document.cookie = buildClearedAuthHintCookie(isHttps())
}
```

- [ ] **Step 4: Wire into the store** — in `src/store/auth-store.ts` add the import (internal group, after
  `@/types/auth`) and call the helpers:

```ts
import { clearAuthHint, setAuthHint } from '@/lib/auth-hint-cookie'
import type { User } from '@/types/auth'
```

```ts
  setSession: (accessToken, user) => {
    setAuthHint()
    set({ accessToken, user, status: 'authenticated' })
  },

  clearSession: () => {
    clearAuthHint()
    set({ accessToken: null, user: null, status: 'unauthenticated' })
  },
```

(Keep the file's existing quote style; Prettier normalises it.) Every session change already goes through these two
actions: `use-login`, `use-register`, `refreshSession`, `use-logout`, `authFetch`'s failed refresh, `AuthProvider`.

- [ ] **Step 5: Verify**

Run: `npx vitest run lib/auth-hint-cookie.test.ts store/auth-store.test.ts lib/api-client.test.ts` → PASS.
Run: `npx tsc --noEmit` → 0 errors.

- [ ] **Step 6: Commit (main session)**

```bash
git add src/lib/auth-hint-cookie.ts src/lib/auth-hint-cookie.test.ts src/store/auth-store.ts src/store/auth-store.test.ts
git commit -m "feat(auth): keep an auth hint cookie in step with the session"
```

---

### Task 3: Safe redirect path

**Files:**
- Create: `src/lib/safe-redirect.ts`, `src/lib/safe-redirect.test.ts`

- [ ] **Step 1: Write the failing test** — `src/lib/safe-redirect.test.ts`

```ts
import { describe, expect, it } from 'vitest'

import { safeRedirectPath } from '@/lib/safe-redirect'

describe('safeRedirectPath', () => {
  it.each([
    ['/admin/exam', '/admin/exam'],
    ['/history?page=2', '/history?page=2'],
    ['/write/writing-demo-1#top', '/write/writing-demo-1#top'],
    // Encoded slashes stay a same-origin path: it renders a 404 here, never another site.
    ['/%2F%2Fevil.com', '/%2F%2Fevil.com'],
  ])('keeps the internal path %s', (raw, expected) => {
    expect(safeRedirectPath(raw)).toBe(expected)
  })

  it.each([
    [null],
    [undefined],
    [''],
    ['//evil.com'],
    ['/\\evil.com'],
    ['https://evil.com'],
    ['javascript:alert(1)'],
    ['evil.com/path'],
    ['/\t/evil.com'],
    ['/\n/evil.com'],
    ['/login'],
    ['/login?redirect=%2Fadmin'],
    ['/signup'],
  ])('falls back to / for %j', (raw) => {
    expect(safeRedirectPath(raw)).toBe('/')
  })
})
```

- [ ] **Step 2: Run — expect FAIL**

Run: `npx vitest run lib/safe-redirect.test.ts`

- [ ] **Step 3: Implement** — `src/lib/safe-redirect.ts`

```ts
// Open-redirect guard for the ?redirect= parameter (spec 2026-11-18-web-security-foundation §3.5).

const FALLBACK = '/'
const BASE = 'http://same-origin.invalid'
/** Never bounce back into the auth pages, or a stale link could loop. */
const AUTH_PAGES = ['/login', '/signup']

export function safeRedirectPath(raw: string | null | undefined): string {
  if (!raw) return FALLBACK
  if (!raw.startsWith('/') || raw.startsWith('//') || raw.startsWith('/\\')) return FALLBACK
  // eslint-disable-next-line no-control-regex -- rejecting control characters is the point
  if (/[\u0000-\u001f\u007f]/.test(raw)) return FALLBACK

  let url: URL
  try {
    url = new URL(raw, BASE)
  } catch {
    return FALLBACK
  }
  if (url.origin !== BASE) return FALLBACK
  if (AUTH_PAGES.some((p) => url.pathname === p || url.pathname.startsWith(`${p}/`))) return FALLBACK

  return `${url.pathname}${url.search}${url.hash}`
}
```

- [ ] **Step 4: Verify**

Run: `npx vitest run lib/safe-redirect.test.ts` → PASS (17 cases). `npx tsc --noEmit` → 0 errors.
Run: `npx eslint lib/safe-redirect.ts` → no errors (the disable comment must be accepted; if ESLint reports an unused
directive, remove the comment and report it).

- [ ] **Step 5: Commit (main session)**

```bash
git add src/lib/safe-redirect.ts src/lib/safe-redirect.test.ts
git commit -m "feat(auth): validate the redirect parameter"
```

---

### Task 4: Route access decision and `proxy.ts`

**Files:**
- Create: `src/lib/route-access.ts`, `src/lib/route-access.test.ts`, `src/proxy.ts`, `src/proxy.test.ts`

`proxy.ts` sits next to `app/` (here: `src/`), per `node_modules/next/dist/docs/01-app/01-getting-started/16-proxy.md`
→ Convention. Next.js 16 calls the exported `proxy` function; `middleware.ts` is the deprecated name.

- [ ] **Step 1: Write the failing test** — `src/lib/route-access.test.ts`

```ts
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
]
const PROTECTED = [
  '/admin/exam',
  '/admin/exam/123',
  '/account/change-password',
  '/check-point/7',
  '/testresult',
  '/history',
  '/notebook',
  '/notifications',
  '/tasks',
  '/write/writing-demo-1',
  '/speaking/result/9/preview',
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

  it.each(PROTECTED)('lets a hinted visitor open %s', (pathname) => {
    expect(decideRoute(req({ pathname, hasAuthHint: true }))).toEqual({ kind: 'next' })
  })

  it.each(['/login', '/signup'])('sends a hinted visitor from %s to /', (pathname) => {
    expect(decideRoute(req({ pathname, hasAuthHint: true }))).toEqual({ kind: 'redirect', location: '/' })
  })

  it.each(['/forgot-password', '/reset-password', '/ranking', '/'])(
    'lets a hinted visitor open %s',
    (pathname) => {
      expect(decideRoute(req({ pathname, hasAuthHint: true }))).toEqual({ kind: 'next' })
    },
  )

  it.each(['/clone-assets/media/bg-home.72e8fdd5.jpg', '/image/logo.png', '/audio/a.mp3'])(
    'never redirects a static file (%s)',
    (pathname) => {
      expect(decideRoute(req({ pathname }))).toEqual({ kind: 'next' })
    },
  )
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
```

- [ ] **Step 2: Run — expect FAIL**

Run: `npx vitest run lib/route-access.test.ts`

- [ ] **Step 3: Implement** — `src/lib/route-access.ts`

```ts
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
/** A last segment with an extension is a static file (public/, clone-assets): never redirect it. */
const STATIC_FILE = /\/[^/]+\.[a-zA-Z0-9]+$/

export interface RouteRequest {
  pathname: string
  /** request.nextUrl.search: '' or '?…' */
  search: string
  method: string
  secFetchSite: string | null
  hasAuthHint: boolean
}

export type RouteDecision =
  | { kind: 'next' }
  | { kind: 'redirect'; location: string }
  | { kind: 'forbidden' }

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
    return { kind: 'redirect', location: '/' }
  }

  if (!hasAuthHint && !isIn(pathname, PUBLIC_PATHS)) {
    const params = new URLSearchParams({ redirect: `${pathname}${search}` })
    return { kind: 'redirect', location: `/login?${params.toString()}` }
  }

  return { kind: 'next' }
}
```

Note: `URLSearchParams` encodes `/` as `%2F` and `?`/`=` as `%3F`/`%3D`, which is what the test expects.

- [ ] **Step 4: Run — expect PASS**

Run: `npx vitest run lib/route-access.test.ts`

- [ ] **Step 5: Write the proxy test** — `src/proxy.test.ts`

```ts
// @vitest-environment node
import { NextRequest } from 'next/server'
import { describe, expect, it } from 'vitest'

import { proxy } from './proxy'

function request(path: string, init?: { method?: string; headers?: Record<string, string> }): NextRequest {
  return new NextRequest(new URL(path, 'http://localhost:3000'), init)
}

describe('proxy', () => {
  it('redirects a guest from a protected page with 307', () => {
    const res = proxy(request('/admin/exam'))
    expect(res.status).toBe(307)
    expect(res.headers.get('location')).toBe('http://localhost:3000/login?redirect=%2Fadmin%2Fexam')
  })

  it('reads the lta_authed hint cookie', () => {
    const res = proxy(request('/admin/exam', { headers: { cookie: 'lta_authed=1' } }))
    expect(res.headers.get('location')).toBeNull()
    expect(res.headers.get('x-middleware-next')).toBe('1')
  })

  it('ignores a hint with another value', () => {
    const res = proxy(request('/history', { headers: { cookie: 'lta_authed=0' } }))
    expect(res.status).toBe(307)
  })

  it('answers a cross-site POST to /api with 403 JSON', async () => {
    const res = proxy(
      request('/api/admin/media', { method: 'POST', headers: { 'sec-fetch-site': 'cross-site' } }),
    )
    expect(res.status).toBe(403)
    expect(await res.json()).toEqual({ message: 'Yêu cầu không hợp lệ.', code: 'CROSS_SITE_REQUEST' })
  })
})
```

`x-middleware-next: 1` is the header `NextResponse.next()` sets in Next 16.4.6 (verified 2026-11-18:
`node_modules/next/dist/server/web/spec-extension/response.js:119`).

- [ ] **Step 6: Implement** — `src/proxy.ts`

```ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

import { AUTH_HINT_COOKIE } from './lib/auth-hint-cookie'
import { decideRoute } from './lib/route-access'

// Optimistic checks only (node_modules/next/dist/docs/01-app/01-getting-started/16-proxy.md → Limitations). The
// hint cookie is not a security boundary; the backend checks the real session on every API call.
export function proxy(request: NextRequest): NextResponse {
  const decision = decideRoute({
    pathname: request.nextUrl.pathname,
    search: request.nextUrl.search,
    method: request.method,
    secFetchSite: request.headers.get('sec-fetch-site'),
    hasAuthHint: request.cookies.get(AUTH_HINT_COOKIE)?.value === '1',
  })

  switch (decision.kind) {
    case 'forbidden':
      return NextResponse.json(
        { message: 'Yêu cầu không hợp lệ.', code: 'CROSS_SITE_REQUEST' },
        { status: 403 },
      )
    case 'redirect':
      return NextResponse.redirect(new URL(decision.location, request.url))
    case 'next':
      return NextResponse.next()
  }
}

export const config = {
  // Everything except Next internals and the root metadata files; other static files are let through by
  // decideRoute (STATIC_FILE).
  matcher: ['/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)'],
}
```

- [ ] **Step 7: Verify**

Run: `npx vitest run lib/route-access.test.ts proxy.test.ts` → PASS.
Run: `npx tsc --noEmit` → 0 errors (the `switch` must be exhaustive; no implicit `undefined` return).
Run: `npm run build` → succeeds and the output lists `Proxy` (or `ƒ Proxy (Middleware)`); report the exact line.

- [ ] **Step 8: Commit (main session)**

```bash
git add src/lib/route-access.ts src/lib/route-access.test.ts src/proxy.ts src/proxy.test.ts
git commit -m "feat(security): redirect by auth hint and block cross-site api writes"
```

---

### Task 5: Client guards, protected layouts and the login redirect

**Files:**
- Create: `src/components/common/not-found-view.tsx`, `src/components/auth/require-admin.tsx`,
  `src/components/auth/require-auth.test.tsx`, `src/components/auth/require-admin.test.tsx`,
  `src/app/admin/layout.tsx`, `src/app/account/layout.tsx`, `src/app/check-point/layout.tsx`,
  `src/app/testresult/layout.tsx`, `src/app/write/layout.tsx`, `src/app/speaking/layout.tsx`,
  `src/app/(dashboard)/(protected)/layout.tsx`
- Move: `src/app/(dashboard)/{history,notebook,notifications,tasks}/` → `src/app/(dashboard)/(protected)/`
- Modify: `src/app/not-found.tsx`, `src/components/auth/require-auth.tsx`, `src/components/auth/index.ts`,
  `src/components/common/index.ts`, `src/app/account/change-password/page.tsx`, `src/components/auth/login-form.tsx`

- [ ] **Step 1: Write the failing tests**

`src/components/auth/require-auth.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { RequireAuth } from '@/components/auth'
import { useAuthStore } from '@/store/auth-store'

const replace = vi.fn()
vi.mock('next/navigation', () => ({ useRouter: () => ({ replace }) }))

describe('RequireAuth', () => {
  beforeEach(() => {
    replace.mockReset()
    window.history.replaceState(null, '', '/history?page=2')
  })
  afterEach(() => {
    useAuthStore.setState({ accessToken: null, user: null, status: 'idle' })
  })

  it('renders nothing while the session is bootstrapping', () => {
    useAuthStore.setState({ status: 'idle' })
    render(<RequireAuth>secret</RequireAuth>)
    expect(screen.queryByText('secret')).toBeNull()
    expect(replace).not.toHaveBeenCalled()
  })

  it('sends an unauthenticated visitor to /login with the current path', () => {
    useAuthStore.setState({ status: 'unauthenticated' })
    render(<RequireAuth>secret</RequireAuth>)
    expect(replace).toHaveBeenCalledWith('/login?redirect=%2Fhistory%3Fpage%3D2')
  })

  it('renders children once authenticated', () => {
    useAuthStore.setState({ status: 'authenticated', accessToken: 't', user: { id: 1, role: 'STUDENT' } as never })
    render(<RequireAuth>secret</RequireAuth>)
    expect(screen.getByText('secret')).toBeInTheDocument()
  })
})
```

`src/components/auth/require-admin.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'

import { RequireAdmin } from '@/components/auth'
import { useAuthStore } from '@/store/auth-store'

describe('RequireAdmin', () => {
  afterEach(() => {
    useAuthStore.setState({ accessToken: null, user: null, status: 'idle' })
  })

  it('renders children for an ADMIN', () => {
    useAuthStore.setState({ status: 'authenticated', accessToken: 't', user: { id: 1, role: 'ADMIN' } as never })
    render(<RequireAdmin>editor</RequireAdmin>)
    expect(screen.getByText('editor')).toBeInTheDocument()
  })

  it.each(['STUDENT', 'USER', 'admin'])('shows the not-found view for role %s', (role) => {
    useAuthStore.setState({ status: 'authenticated', accessToken: 't', user: { id: 1, role } as never })
    render(<RequireAdmin>editor</RequireAdmin>)
    expect(screen.queryByText('editor')).toBeNull()
    expect(screen.getByText('404')).toBeInTheDocument()
  })
})
```

If `next/link` inside `NotFoundView` fails to render in jsdom, mock it the same way as `next/navigation` and report.

- [ ] **Step 2: Run — expect FAIL** (`RequireAdmin` not exported; redirect has no parameter)

Run: `npx vitest run components/auth`

- [ ] **Step 3: Extract the not-found view**

`src/components/common/not-found-view.tsx` — move the JSX of `src/app/not-found.tsx` here unchanged:

```tsx
import Link from 'next/link'

import { ROUTES } from '@/constants'

export function NotFoundView(): React.ReactElement {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="max-w-md text-center">
        <h2 className="mb-4 text-6xl font-bold">404</h2>
        <p className="text-muted-foreground mb-8 text-xl">Page not found</p>
        <Link
          href={ROUTES.HOME}
          className="bg-primary text-primary-foreground hover:bg-primary/80 inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium"
        >
          Back to home
        </Link>
      </div>
    </div>
  )
}
```

`src/app/not-found.tsx`:

```tsx
import { NotFoundView } from '@/components/common'

export default function NotFound(): React.ReactElement {
  return <NotFoundView />
}
```

`src/components/common/index.ts` — add `export * from './not-found-view'`.

- [ ] **Step 4: Update `RequireAuth`** — `src/components/auth/require-auth.tsx`, replace the effect:

```tsx
  useEffect(() => {
    if (status === "unauthenticated") {
      // window.location, not useSearchParams: that hook would force a Suspense boundary on every guarded layout.
      const current = `${window.location.pathname}${window.location.search}`
      router.replace(`/login?${new URLSearchParams({ redirect: current }).toString()}`)
    }
  }, [status, router]);
```

- [ ] **Step 5: Create `RequireAdmin`** — `src/components/auth/require-admin.tsx`

```tsx
'use client'

import { NotFoundView } from '@/components/common'
import { useAuthStore } from '@/store/auth-store'

export interface RequireAdminProps {
  children: React.ReactNode
}

/**
 * UX guard for /admin/* (spec §4). Use inside RequireAuth. The backend's AdminGuard ('ADMIN', upper case) is the real
 * boundary; this only keeps the editor from mounting for other roles.
 */
export function RequireAdmin({ children }: RequireAdminProps): React.ReactElement {
  const role = useAuthStore((state) => state.user?.role)
  if (role !== 'ADMIN') return <NotFoundView />
  return <>{children}</>
}
```

`src/components/auth/index.ts` — add `export * from "./require-admin";`.

- [ ] **Step 6: Run — expect PASS**

Run: `npx vitest run components/auth`

- [ ] **Step 7: Create the guarded layouts**

`src/app/admin/layout.tsx`:

```tsx
import { RequireAdmin, RequireAuth } from '@/components/auth'

export default function AdminLayout({ children }: { children: React.ReactNode }): React.ReactElement {
  return (
    <RequireAuth>
      <RequireAdmin>{children}</RequireAdmin>
    </RequireAuth>
  )
}
```

Each of these six files has the same body with its own function name — write all of them in full:

`src/app/account/layout.tsx` (`AccountLayout`), `src/app/check-point/layout.tsx` (`CheckPointLayout`),
`src/app/testresult/layout.tsx` (`TestResultLayout`), `src/app/write/layout.tsx` (`WriteLayout`),
`src/app/speaking/layout.tsx` (`SpeakingLayout`), `src/app/(dashboard)/(protected)/layout.tsx` (`ProtectedLayout`):

```tsx
import { RequireAuth } from '@/components/auth'

export default function AccountLayout({ children }: { children: React.ReactNode }): React.ReactElement {
  return <RequireAuth>{children}</RequireAuth>
}
```

- [ ] **Step 8: Move the protected dashboard pages** (plain filesystem moves, no git commands)

```bash
mkdir -p "app/(dashboard)/(protected)"
mv "app/(dashboard)/history" "app/(dashboard)/notebook" "app/(dashboard)/notifications" "app/(dashboard)/tasks" "app/(dashboard)/(protected)/"
ls "app/(dashboard)" "app/(dashboard)/(protected)"
```

Expected: `(dashboard)` keeps `layout.tsx`, `page.tsx`, `placement-test/`, `ranking/`, `school-ranking/`, `(protected)/`;
`(protected)` holds `layout.tsx`, `history/`, `notebook/`, `notifications/`, `tasks/`. The four pages import only
through `@/` (checked: no relative imports), so nothing else changes. URLs stay the same.

- [ ] **Step 9: Drop the now-redundant inline guard** — `src/app/account/change-password/page.tsx`:

```tsx
import { ChangePasswordForm } from "@/components/auth";
```

```tsx
    <main className="min-h-screen flex items-center justify-center bg-page-bg px-4 py-12">
      <ChangePasswordForm />
    </main>
```

- [ ] **Step 10: Login goes back where the user came from** — `src/components/auth/login-form.tsx`

Add imports (`useEffect` from `react` in the external group; `safeRedirectPath` and `useAuthStore` in the internal
group):

```tsx
import { useEffect } from "react";
```

```tsx
import { safeRedirectPath } from "@/lib/safe-redirect";
import { useAuthStore } from "@/store/auth-store";
```

Inside `LoginForm`, after `const resetSuccess = …`:

```tsx
  const redirectTo = safeRedirectPath(searchParams.get("redirect"));
  const status = useAuthStore((state) => state.status);

  // One navigation path for both cases: a fresh login, and a visitor whose refresh cookie is still valid but who
  // reached /login without the hint cookie (e.g. first visit after this change shipped).
  useEffect(() => {
    if (status === "authenticated") router.replace(redirectTo);
  }, [status, redirectTo, router]);
```

and change the submit handler to rely on it:

```tsx
  const onSubmit = (values: LoginFormValues): void => {
    login.mutate(values);
  };
```

`app/login/page.tsx` already renders `LoginForm` inside `<Suspense>` (required by `useSearchParams`); do not change it.

- [ ] **Step 11: Verify**

Run: `npm test` → all files pass (38 baseline + new).
Run: `npx tsc --noEmit` → 0 errors. Run: `npm run lint` → no new errors.
Run: `npm run build` → succeeds; the route list still contains `/history`, `/notebook`, `/notifications`, `/tasks`
(no `(protected)` in any URL).

- [ ] **Step 12: Commit (main session)** — stage the moves as renames:

```bash
git add -A "src/app/(dashboard)" src/app/admin/layout.tsx src/app/account src/app/check-point/layout.tsx \
  src/app/testresult/layout.tsx src/app/write/layout.tsx src/app/speaking/layout.tsx src/app/not-found.tsx \
  src/components/common/not-found-view.tsx src/components/common/index.ts src/components/auth
git status --short   # confirm only these paths are staged
git commit -m "feat(auth): guard signed-in and admin routes and honour redirect"
```

---

### Task 6: `ApiError` that never shows raw server bodies

**Files:**
- Modify: `src/lib/api-client.ts` (lines 1–55: `ApiError`, `ApiErrorBody`, `parseErrorMessage`, `apiFetch`)
- Modify: `src/lib/api-client.test.ts` (the `apiFetch` describe block)

- [ ] **Step 1: Update and add tests** — in `src/lib/api-client.test.ts`:

Change the import to `import { apiFetch, authFetch, ApiError, GENERIC_ERROR_MESSAGE } from "@/lib/api-client";`.

Replace the test `"throws ApiError with the backend's message on a non-2xx response"` with:

```ts
  it("uses the backend's message and code for a NestJS error body", async () => {
    const fetchMock = vi.fn().mockResolvedValueOnce(
      new Response(
        JSON.stringify({ statusCode: 401, message: "Sai tài khoản hoặc mật khẩu", error: "Unauthorized" }),
        { status: 401 },
      ),
    );
    vi.stubGlobal("fetch", fetchMock);

    await expect(apiFetch("/auth/login", { method: "POST" })).rejects.toMatchObject({
      status: 401,
      message: "Sai tài khoản hoặc mật khẩu",
      code: "Unauthorized",
      fromApi: true,
    });
  });

  it("prefers a string `code` over `error` and joins validation messages", async () => {
    const fetchMock = vi.fn().mockResolvedValueOnce(
      new Response(
        JSON.stringify({ statusCode: 400, message: ["a sai", "b sai"], error: "Bad Request", code: "VALIDATION" }),
        { status: 400 },
      ),
    );
    vi.stubGlobal("fetch", fetchMock);

    await expect(apiFetch("/x")).rejects.toMatchObject({
      message: "a sai, b sai",
      code: "VALIDATION",
      fromApi: true,
    });
  });

  it.each([
    ["an HTML 502 page", new Response("<html><body>Bad Gateway</body></html>", { status: 502 })],
    ["Nest's default 500 body", new Response(JSON.stringify({ statusCode: 500, message: "Internal server error" }), { status: 500 })],
    ["a non-Nest JSON body", new Response(JSON.stringify({ message: "stack trace here" }), { status: 400 })],
    ["an empty body", new Response(null, { status: 404 })],
  ])("shows the generic message for %s", async (_label, response) => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValueOnce(response));

    const error = await apiFetch("/x").catch((e: unknown) => e);
    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({ message: GENERIC_ERROR_MESSAGE, fromApi: false, code: null });
  });

  it("reports a network failure as status 0 with the generic message", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValueOnce(new TypeError("Failed to fetch")));

    await expect(apiFetch("/x")).rejects.toMatchObject({
      status: 0,
      message: GENERIC_ERROR_MESSAGE,
      fromApi: false,
    });
  });
```

Leave the other tests as they are (the `authFetch` tests depend only on `status`).

- [ ] **Step 2: Run — expect FAIL**

Run: `npx vitest run lib/api-client.test.ts`

- [ ] **Step 3: Implement** — in `src/lib/api-client.ts`, replace `ApiError`, `ApiErrorBody` and
  `parseErrorMessage` with:

```ts
export const GENERIC_ERROR_MESSAGE = "Không thể kết nối máy chủ, vui lòng thử lại sau."

/**
 * `fromApi` is true only when the backend itself produced the error (NestJS shape, status < 500): then `message` is
 * safe to show. Anything else — HTML from a proxy, Nest's default 500 body, an empty body, a network failure — gets
 * the generic message and never the raw body (spec 2026-11-18-web-security-foundation §5).
 */
export class ApiError extends Error {
  readonly status: number
  readonly code: string | null
  readonly fromApi: boolean

  constructor(message: string, status: number, code: string | null = null, fromApi = false) {
    super(message)
    this.name = "ApiError"
    this.status = status
    this.code = code
    this.fromApi = fromApi
  }
}

interface NestErrorBody {
  statusCode: number
  message: string | string[]
  error?: unknown
  code?: unknown
}

function isNestErrorBody(body: unknown): body is NestErrorBody {
  if (typeof body !== "object" || body === null) return false
  const candidate = body as Record<string, unknown>
  const message = candidate.message
  return (
    typeof candidate.statusCode === "number" &&
    (typeof message === "string" ||
      (Array.isArray(message) && message.every((m) => typeof m === "string")))
  )
}

async function toApiError(response: Response): Promise<ApiError> {
  let body: unknown
  try {
    body = await response.json()
  } catch {
    return new ApiError(GENERIC_ERROR_MESSAGE, response.status)
  }
  if (response.status >= 500 || !isNestErrorBody(body)) {
    return new ApiError(GENERIC_ERROR_MESSAGE, response.status)
  }
  const message = Array.isArray(body.message) ? body.message.join(", ") : body.message
  const code =
    typeof body.code === "string" ? body.code : typeof body.error === "string" ? body.error : null
  return new ApiError(message, response.status, code, true)
}
```

and in `apiFetch`:

```ts
  } catch {
    throw new ApiError(GENERIC_ERROR_MESSAGE, 0)
  }

  if (!response.ok) {
    throw await toApiError(response)
  }
```

No other file constructs `ApiError` (checked: only `lib/api-client.ts:44,48`). The five auth forms read only
`error.message` / `instanceof ApiError` and keep working.

- [ ] **Step 4: Verify**

Run: `npx vitest run lib/api-client.test.ts` → PASS. `npm test` → all pass. `npx tsc --noEmit` → 0 errors.

- [ ] **Step 5: Commit (main session)**

```bash
git add src/lib/api-client.ts src/lib/api-client.test.ts
git commit -m "fix(api): show only backend-defined error messages"
```

---

### Task 7: HTML sanitising and `<SafeHtml>`

**Files:**
- Modify: `src/package.json`, `src/package-lock.json` (via npm)
- Create: `src/lib/safe-html.ts`, `src/lib/safe-html.test.ts`, `src/components/common/safe-html.tsx`,
  `src/components/common/safe-html.test.tsx`, `src/lib/no-raw-html.test.ts`
- Modify: `src/components/common/index.ts`, `src/components/exam/parts/part-gapfill.tsx` (lines 150, 179–181, 274,
  293, 316), `src/components/admin/exam/editor/form/part-settings-fields.tsx` (lines 77–81)

**Why `sanitize-html`** (researched 2026-11-18): the exam parts are client components that also render during SSR, so
the sanitizer must produce the same markup on the server and in the browser, or hydration fails.
- DOMPurify 3.4.18 returns its input **unchanged** when there is no DOM (`dist/purify.cjs.js:2332`,
  `if (!DOMPurify.isSupported) return dirty;`), so it would not sanitise during SSR.
- `isomorphic-dompurify` 4.7.0 parses with jsdom 31 on the server and the browser's DOM on the client — two parsers.
- `sanitize-html` 2.18.2 is pure JavaScript (htmlparser2 + postcss), so the same code runs on both sides. Its README
  ("How to use → Browser") supports bundling it for the browser. Zoney.vn-Web uses 2.18.1.
- Cost: postcss is bundled into the chunks that render exam HTML. It is needed: real exam content uses `style`
  (`mocks/exam-7778495e.json`: 194 `span` with `color`/`background-color`, table and image `width`/`height`,
  `margin-left`).

Outputs below were produced by running `sanitize-html@2.18.2` on these inputs on 2026-11-18.

- [ ] **Step 1: Install** (exact versions, like Zoney)

```bash
npm install --save-exact sanitize-html@2.18.2
npm install --save-exact --save-dev @types/sanitize-html@2.16.2
```

- [ ] **Step 2: Write the failing tests**

`src/lib/safe-html.test.ts`:

```ts
import { describe, expect, it } from 'vitest'

import { sanitizeHtml } from '@/lib/safe-html'

describe('sanitizeHtml — exam markup survives', () => {
  it.each([
    ['<p><strong>A</strong><br></p>', '<p><strong>A</strong><br /></p>'],
    [
      '<span style="background-color:transparent;color:#000000;">x</span>',
      '<span style="background-color:transparent;color:#000000">x</span>',
    ],
    [
      '<img src="/image/abc" style="width: 463px; height: 305px;" width="463" height="305">',
      '<img src="/image/abc" style="width:463px;height:305px" width="463" height="305" />',
    ],
    [
      '<table style="width: 100.741%; margin-left: -0.740741%;"><tbody><tr><td>1</td></tr></tbody></table>',
      '<table style="width:100.741%;margin-left:-0.740741%"><tbody><tr><td>1</td></tr></tbody></table>',
    ],
    ['<img src="data:image/png;base64,AA">', '<img src="data:image/png;base64,AA" />'],
    ['<ul><li><em>i</em> <u>u</u> <sub>2</sub></li></ul>', '<ul><li><em>i</em> <u>u</u> <sub>2</sub></li></ul>'],
    [
      '<a href="https://luyenthiao.com/x">link</a>',
      '<a href="https://luyenthiao.com/x" target="_blank" rel="noopener noreferrer">link</a>',
    ],
    ['<p>unclosed <strong>b', '<p>unclosed <strong>b</strong></p>'],
  ])('%s', (input, expected) => {
    expect(sanitizeHtml(input)).toBe(expected)
  })
})

describe('sanitizeHtml — XSS payloads are neutralised', () => {
  it.each([
    ['<img src=x onerror=alert(1)>', '<img src="x" />'],
    ['<a href="javascript:alert(1)">x</a>', '<a target="_blank" rel="noopener noreferrer">x</a>'],
    ['<a href="//evil.com">x</a>', '<a target="_blank" rel="noopener noreferrer">x</a>'],
    ['<a href="data:text/html,x">d</a>', '<a target="_blank" rel="noopener noreferrer">d</a>'],
    ['<svg onload=alert(1)>', ''],
    ['<iframe src="https://e.com"></iframe>', ''],
    ['<script>alert(1)</script>t', 't'],
    ['<span style="background:url(javascript:alert(1))">s</span>', '<span>s</span>'],
    ['<p class="fixed inset-0 z-50">overlay</p>', '<p>overlay</p>'],
    ['<p id="__next">clobber</p>', '<p>clobber</p>'],
    ['<form action="https://e.com"><input name="p"></form>', ''],
  ])('%s', (input, expected) => {
    expect(sanitizeHtml(input)).toBe(expected)
  })
})
```

The `form`/`input` line is the only expectation not taken from the 2026-11-18 probe. `form` and `input` are not in the
allow-list; with the default `nonTextTags` their content is discarded only for `script`/`style`/`textarea`/`option`,
so if the result is not `''`, report the actual output verbatim (NEEDS_CONTEXT) instead of changing the
expectation.

`src/components/common/safe-html.test.tsx`:

```tsx
import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { SafeHtml } from '@/components/common'

describe('SafeHtml', () => {
  it('renders sanitised markup in a span by default', () => {
    const { container } = render(<SafeHtml html='<strong>ok</strong><img src=x onerror="alert(1)">' />)
    const span = container.firstElementChild as HTMLElement
    expect(span.tagName).toBe('SPAN')
    expect(span.innerHTML).toBe('<strong>ok</strong><img src="x">')
  })

  it('renders a div with a class when asked', () => {
    const { container } = render(<SafeHtml as="div" className="text-xs" html="<p>a</p>" />)
    const div = container.firstElementChild as HTMLElement
    expect(div.tagName).toBe('DIV')
    expect(div.className).toBe('text-xs')
    expect(div.innerHTML).toBe('<p>a</p>')
  })
})
```

(`innerHTML` re-serialises `<img … />` as `<img …>`; that is the browser's serialisation, not a sanitiser
difference.)

`src/lib/no-raw-html.test.ts`:

```ts
import { readdirSync, readFileSync } from 'node:fs'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

// Every HTML string must go through <SafeHtml> (spec 2026-11-18-web-security-foundation §6).
const ROOT = path.resolve(import.meta.dirname, '..')
const SCANNED_DIRS = ['app', 'components', 'hooks', 'lib', 'providers', 'store']
const ALLOWED = new Set([path.join('components', 'common', 'safe-html.tsx')])
const SINK = ['dangerously', 'SetInnerHTML'].join('')

function sourceFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) return sourceFiles(full)
    return /\.(ts|tsx)$/.test(entry.name) ? [full] : []
  })
}

describe('raw HTML sinks', () => {
  it(`only components/common/safe-html.tsx uses ${SINK}`, () => {
    const offenders = SCANNED_DIRS.flatMap((d) => sourceFiles(path.join(ROOT, d)))
      .map((file) => path.relative(ROOT, file))
      .filter((rel) => !ALLOWED.has(rel))
      .filter((rel) => readFileSync(path.join(ROOT, rel), 'utf8').includes(SINK))
    expect(offenders).toEqual([])
  })
})
```

- [ ] **Step 3: Run — expect FAIL** (missing modules; the guard test lists the 2 offending files)

Run: `npx vitest run lib/safe-html.test.ts components/common/safe-html.test.tsx lib/no-raw-html.test.ts`

- [ ] **Step 4: Implement the sanitizer** — `src/lib/safe-html.ts`

```ts
import sanitize from 'sanitize-html'

// Exam HTML (prompts, word boxes, tables) is authored by admins and rendered with innerHTML. It is sanitised at
// render time with the same pure-JS code on the server and in the browser, so SSR and hydration agree
// (spec 2026-11-18-web-security-foundation §6). Allow-list adapted from Zoney.vn-Web src/lib/sanitize-html.ts.
// No `class` (author classes could restyle the app, e.g. a full-screen overlay) and no `id` (DOM clobbering).

const COLOR = [/^#[0-9a-f]{3,8}$/i, /^rgba?\([\d\s,.%]+\)$/i, /^[a-z]+$/i]
const LENGTH = [/^-?\d+(\.\d+)?(px|em|rem|%)$/]

const OPTIONS: sanitize.IOptions = {
  allowedTags: [
    'p', 'br', 'hr', 'div', 'span', 'strong', 'b', 'em', 'i', 'u', 's', 'sub', 'sup', 'small', 'mark',
    'ul', 'ol', 'li',
    'table', 'thead', 'tbody', 'tr', 'th', 'td',
    'img', 'a', 'audio', 'source',
  ],
  allowedAttributes: {
    img: ['src', 'alt', 'width', 'height'],
    a: ['href', 'target', 'rel'],
    audio: ['src', 'controls'],
    source: ['src', 'type'],
    th: ['colspan', 'rowspan'],
    td: ['colspan', 'rowspan'],
    '*': ['style'],
  },
  allowedStyles: {
    '*': {
      color: COLOR,
      'background-color': COLOR,
      'text-align': [/^(left|right|center|justify)$/],
      'font-weight': [/^(normal|bold|[1-9]00)$/],
      'font-style': [/^(normal|italic)$/],
      'text-decoration': [/^(none|underline|line-through)$/],
      'font-size': LENGTH,
      width: LENGTH,
      height: LENGTH,
      'margin-left': LENGTH,
    },
  },
  allowedSchemes: ['http', 'https', 'mailto'],
  allowedSchemesByTag: { img: ['http', 'https', 'data'] },
  allowProtocolRelative: false,
  transformTags: {
    a: (tagName, attribs) => ({
      tagName,
      attribs: { ...attribs, target: '_blank', rel: 'noopener noreferrer' },
    }),
  },
}

export function sanitizeHtml(html: string): string {
  return sanitize(html, OPTIONS)
}
```

Prettier will reflow `allowedTags` one per line; that is fine.

- [ ] **Step 5: Implement the component** — `src/components/common/safe-html.tsx`

```tsx
'use client'

import { useMemo } from 'react'

import { sanitizeHtml } from '@/lib/safe-html'

export interface SafeHtmlProps {
  html: string
  as?: 'span' | 'div'
  className?: string
}

/** The only place allowed to set innerHTML (enforced by lib/no-raw-html.test.ts). */
export function SafeHtml({ html, as: Tag = 'span', className }: SafeHtmlProps): React.ReactElement {
  // Memoised: gap-fill parts re-render on every keystroke.
  const clean = useMemo(() => sanitizeHtml(html), [html])
  return <Tag className={className} dangerouslySetInnerHTML={{ __html: clean }} />
}
```

`src/components/common/index.ts` — add `export * from './safe-html'`.

- [ ] **Step 6: Replace the six sinks**

`src/components/exam/parts/part-gapfill.tsx` — add `import { SafeHtml } from "@/components/common"` in the internal
group (alphabetical: before `@/components/exam/answer-feedback`), then:

| Line | Before | After |
|---|---|---|
| 150 | `<span dangerouslySetInnerHTML={{ __html: q.promptHtml ?? "" }} />` | `<SafeHtml html={q.promptHtml ?? ""} />` |
| 178–183 | `<div dangerouslySetInnerHTML={{ __html: textPrompt.replace(`{{${d.label}}}`, "______"), }} className="text-xs font-bold text-slate-700" />` | `<SafeHtml as="div" html={textPrompt.replace(`{{${d.label}}}`, "______")} className="text-xs font-bold text-slate-700" />` |
| 274 | `<div className="text-xs" dangerouslySetInnerHTML={{ __html: part.extraHtml }} />` | `<SafeHtml as="div" className="text-xs" html={part.extraHtml} />` |
| 293 | `<span dangerouslySetInnerHTML={{ __html: q.promptHtml ?? "" }} />` | `<SafeHtml html={q.promptHtml ?? ""} />` |
| 316 | `return <span key={i} dangerouslySetInnerHTML={{ __html: seg.text }} />` | `return <SafeHtml key={i} html={seg.text} />` |

`src/components/admin/exam/editor/form/part-settings-fields.tsx` — add the same import, then replace lines 77–80:

```tsx
          {part.extraHtml && (
            <SafeHtml
              as="div"
              className="rounded-xl bg-white/90 text-slate-900 p-3 overflow-auto max-h-40 text-sm"
              html={part.extraHtml}
            />
          )}
```

If importing `@/components/common` from these files creates an import cycle or pulls `Topbar` into a chunk where it
causes a build error, stop and report (BLOCKED) — do not switch to a deep import on your own.

- [ ] **Step 7: Verify**

Run: `npx vitest run lib/safe-html.test.ts components/common/safe-html.test.tsx lib/no-raw-html.test.ts` → PASS.
Run: `npm test` → all pass. `npx tsc --noEmit` → 0 errors. `npm run lint` → no new errors.
Run: `npm run build` → succeeds (proves `sanitize-html`/postcss bundle for the browser).

- [ ] **Step 8: Commit (main session)**

```bash
git add src/package.json src/package-lock.json src/lib/safe-html.ts src/lib/safe-html.test.ts \
  src/lib/no-raw-html.test.ts src/components/common/safe-html.tsx src/components/common/safe-html.test.tsx \
  src/components/common/index.ts src/components/exam/parts/part-gapfill.tsx \
  src/components/admin/exam/editor/form/part-settings-fields.tsx
git commit -m "fix(security): sanitise exam html before rendering it"
```

---

### Task 8: Documentation

**Files:**
- Modify: `.claude/ARCHITECTURE.md` (section "Request path"; the `src/` structure table rows `lib/`, `components/common/`)
- Modify: `docs/01-architecture.md`, `docs/03-known-issues.md`

**Precondition:** `git diff --stat` must show no uncommitted change in these three files that this plan did not make.
On 2026-11-18 `.claude/ARCHITECTURE.md`, `docs/02-setup-and-environment.md` and `src/.env.example` carried an
earlier uncommitted edit (API port 3000 → 3005). The main session settles those with the owner before this task;
if any remain in a file this task edits, stop and report (NEEDS_CONTEXT).

- [ ] **Step 1: `.claude/ARCHITECTURE.md` → "Request path"** — append these bullets (English):

```markdown
- **Security layer** (spec `.claude/superpowers/specs/2026-11-18-web-security-foundation-design.md`):
  - `next.config.ts` sends the headers built by `lib/security-headers.ts`; the CSP is production-only and its
    `connect-src` is derived from `NEXT_PUBLIC_API_URL` (`https:`→`wss:` for socket.io). No nonces: they would force
    dynamic rendering.
  - `store/auth-store.ts` keeps the hint cookie `lta_authed=1` (`lib/auth-hint-cookie.ts`) in step with the session.
    It is a UX hint, not a security boundary.
  - `proxy.ts` (Next 16's name for middleware) calls the pure `lib/route-access.ts`: guests are sent from non-public
    pages to `/login?redirect=…`, hinted visitors from `/login`/`/signup` to `/`, cross-site writes to `/api/*` get
    403 `CROSS_SITE_REQUEST`. Public pages: `/`, auth pages, `/ranking`, `/school-ranking`, `/placement-test`,
    `/testlevels/*`.
  - `RequireAuth` is applied by the layouts of `admin`, `account`, `check-point`, `testresult`, `write`, `speaking`
    and `(dashboard)/(protected)`; `RequireAdmin` (role `ADMIN`) by `admin/layout.tsx`. New signed-in pages go under
    one of these segments.
  - `ApiError.fromApi` is true only for a NestJS error body with status < 500; show `message` to users only then
    (it is already replaced by a generic message otherwise).
  - HTML strings render only through `<SafeHtml>` (`components/common/safe-html.tsx`, `lib/safe-html.ts`,
    `sanitize-html`); `lib/no-raw-html.test.ts` fails on any other `dangerouslySetInnerHTML`.
```

Also add `security-headers.ts`, `auth-hint-cookie.ts`, `safe-redirect.ts`, `route-access.ts`, `safe-html.ts` to the
`lib/` row and `NotFoundView`, `SafeHtml` to the `components/common/` row of the structure table, and `/history`,
`/notebook`, `/notifications`, `/tasks` now live in `app/(dashboard)/(protected)/` in the Routes table.

- [ ] **Step 2: `docs/01-architecture.md`** — add a short section "Security layer" (English, same facts as Step 1,
  written for a human reader: what each piece does and that the backend remains the security boundary).

- [ ] **Step 3: `docs/03-known-issues.md`** — add a numbered section:

```markdown
## N. Vitest fails when the shell's drive letter is lower case (Windows)

Measured 2026-11-18. With the working directory written as `e:\…` (Git Bash `cd /e/…`, or VS Code opening the folder
as `e:`), `npm test` fails every file at load with `TypeError: Cannot read properties of undefined (reading 'config')`
or `Vitest failed to find the current suite`: the runner is loaded twice under two path spellings. From `E:\…`
(`cd /E/…`) the same suite passes. Always run tests from an upper-case drive path.
```

and update its test baseline (if it states one) to the number `npm test` reports after Task 7.

- [ ] **Step 4: Commit (main session)**

```bash
git add .claude/ARCHITECTURE.md docs/01-architecture.md docs/03-known-issues.md
git commit -m "docs: document the web security layer and the vitest drive-letter trap"
```

---

### Task 9: Real-path verification (main session)

Tier 2 of `.claude/rules/verification.md`. Not delegated except for running long commands through `runner`.

- [ ] **Step 1: Final whole-change review** — dispatch `code-reviewer` on `git diff d1b4a4c..HEAD -- src` with the
  spec; fix findings through `implementer`, re-review.

- [ ] **Step 2: Production build with headers**

Backend: `luyenthiao.com-Backend` running on port 3005 (`npm run start:dev` or `node dist/main.js`; check the port
first and reuse a running one). Web: check port 3000 is free (`netstat -ano | grep ":3000 " | grep LISTENING`).

```bash
cd /E/Ziratech/English-Prep-Web-Game/luyenthiao.com-Web/src
npm run build && npx next start -p 3000      # background
curl -sI http://localhost:3000/ | grep -iE "content-security|strict-transport|x-frame|x-content-type|referrer|permissions|x-powered-by"
curl -sI http://localhost:3000/admin/exam | grep -iE "^HTTP|location"
curl -sI http://localhost:3000/clone-assets/media/bg-home.72e8fdd5.jpg | grep -iE "^HTTP|location"
curl -s -o /dev/null -w "%{http_code}\n" -X POST -H "Sec-Fetch-Site: cross-site" http://localhost:3000/api/admin/media
```

Expected: all six headers present, no `x-powered-by`; `/admin/exam` → `307` with
`location: /login?redirect=%2Fadmin%2Fexam`; the image → `200` without `location`; the POST → `403`.

- [ ] **Step 3: Browser checks** (main session or owner; record which were done)

1. Open `/admin/exam` logged out → lands on `/login?redirect=%2Fadmin%2Fexam`; log in as admin → lands on
   `/admin/exam`.
2. Log in as a student, open `/admin/exam` → 404 view, no editor.
3. Log out → `lta_authed` gone (DevTools → Application → Cookies); `/history` redirects to `/login`.
4. Stale hint: logged out, set `lta_authed=1` by hand, open `/history` → ends on `/login?redirect=%2Fhistory`, no
   loop.
5. Console has no CSP violations on `/`, on `/check-point/<id>` with a gap-fill part (images, audio), and on a
   `/speaking/...` page when the microphone prompt appears.
6. Gap-fill prompts and the admin word-box preview look as before (colours, tables, bold).

- [ ] **Step 4: Stop the servers you started; report** verified / not verified items to the owner.
