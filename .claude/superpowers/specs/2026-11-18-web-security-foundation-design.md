# Web security foundation (Zoney model) — Design

**Date:** 2026-11-18 · **Repo:** `luyenthiao.com-Web` · **Status:** design approved by owner (chat), spec pending review
**Reference:** `Zoney.vn-Web` — `docs/03-xac-thuc-va-bao-mat.md`, `src/middleware.ts`, `src/next.config.ts`,
`src/lib/sanitize-html.ts`, spec `2026-10-26-web-direct-api-design.md`.
**Backend contract:** unchanged. No change in `luyenthiao.com-Backend` is needed for this sub-project.

## 0. Program: connecting the web to the real API

Today only authentication reaches the backend; every other screen reads `src/mocks/`, `localStorage` or page
constants (backend `docs/07-hien-trang-chuc-nang-va-api.md`). Owner decisions on 2026-11-18:

- **Session model:** the browser calls the API directly (as Zoney does) and the current auth contract stays:
  a 15-minute JWT access token kept only in memory (`store/auth-store.ts`), and an opaque refresh token in an
  `HttpOnly` cookie set by the backend on `path=/api/auth`. No BFF; Next does not hold or proxy the session.
- **Order:** security foundation first, then read-only screens, then the exam flow.

| # | Sub-project | Backend contract change | Notes |
|---|---|---|---|
| 1 | Web security foundation (this spec) | none | headers, CSP, `proxy.ts`, client guards, `ApiError`, HTML sanitising |
| 2 | Read-only screens: dashboard, notifications, tasks, history, ranking | M4 (ranking fields) | introduces `lib/api/<domain>.ts`, `server-only` env and server-rendered public data (ranking, public exams) |
| 3 | Exam flow: check-point, test result, placement test | H1 + M1 | server-side grading, answers removed from the student response; backend sanitises exam HTML on save |
| 4 | Writing / speaking | to be decided in its spec | uploads to R2, submissions |
| 5 | Challenges | none expected | socket.io `/challenge` |
| 6 | Admin exam editor | none expected | replaces `localStorage` drafts with the exams API |

Each sub-project gets its own spec, plan and review. This document designs only #1.

## 1. Why

Measured on 2026-11-18 in `src/`:

- No `proxy.ts` (Next.js 16 renamed Middleware to Proxy — `node_modules/next/dist/docs/01-app/01-getting-started/16-proxy.md`).
  `/admin/exam` and every signed-in page are served to anyone; only `/account/change-password` uses `RequireAuth`.
- `next.config.ts` holds only `output: 'standalone'`: no CSP, no security headers, `x-powered-by` is sent.
- Six `dangerouslySetInnerHTML` sinks render exam HTML unsanitised:
  `components/exam/parts/part-gapfill.tsx` (lines 150, 179, 274, 293, 316) and
  `components/admin/exam/editor/form/part-settings-fields.tsx:80`. Once exams come from the API this is stored XSS:
  an admin-authored (or compromised-admin) exam runs script in every student's browser, and that script can call
  `/auth/refresh` and act as the student.
- `ApiError` shows any response body's `message` to the user and cannot tell a backend-defined error from a proxy
  error page.
- The login form ignores where the user came from and always goes to `/`.

## 2. Security headers and CSP (`src/next.config.ts`)

Model: Zoney `next.config.ts`. Built by a pure function in `src/lib/security-headers.ts` so it can be unit-tested;
`next.config.ts` only calls it.

- `poweredByHeader: false`.
- Headers on `/:path*`:
  - `Strict-Transport-Security: max-age=31536000` (no `includeSubDomains`/`preload`: not every subdomain is known
    to serve HTTPS);
  - `X-Content-Type-Options: nosniff`;
  - `X-Frame-Options: DENY`;
  - `Referrer-Policy: strict-origin-when-cross-origin`;
  - `Permissions-Policy: camera=(), microphone=(self), geolocation=(), payment=()` — the speaking screens record
    audio, so the microphone stays allowed for this origin only.
- `Content-Security-Policy`, **production only** (the dev server needs `eval` and an HMR WebSocket):

  | Directive | Value | Why |
  |---|---|---|
  | `default-src` | `'self'` | |
  | `script-src` | `'self' 'unsafe-inline'` | Next bootstraps with inline scripts. Nonces would force every page to render dynamically and lose static HTML (`node_modules/next/dist/docs/01-app/02-guides/content-security-policy.md` → "How nonces work"); same trade-off as Zoney |
  | `style-src` | `'self' 'unsafe-inline'` | inline styles from React and motion libraries |
  | `img-src` | `'self' data: blob: https:` | exam images from R2, dicebear fallbacks, admin-chosen URLs |
  | `media-src` | `'self' blob: https:` | listening audio from R2; recorded speaking audio as `blob:` |
  | `font-src` | `'self' data:` | `next/font` self-hosts |
  | `connect-src` | `'self' <api origin> <api ws origin>` | API calls and socket.io; both derived from `NEXT_PUBLIC_API_URL` (`https:`→`wss:`, `http:`→`ws:`) |
  | `object-src` | `'none'` | |
  | `base-uri` | `'self'` | |
  | `form-action` | `'self'` | |
  | `frame-ancestors` | `'none'` | |

- The existing static-asset caching is not touched (there is none in `next.config.ts` today; `vercel.json` is out of
  scope).

## 3. Auth hint cookie and `src/proxy.ts`

### 3.1 Hint cookie (`src/lib/auth-hint-cookie.ts`)

- Name `lta_authed`, value `1`. Attributes: `Path=/; SameSite=Lax; Max-Age=2592000` (30 days, the backend's default
  `JWT_REFRESH_EXPIRES_IN`), plus `Secure` when `location.protocol === 'https:'`.
- Set by `useAuthStore.setSession`, deleted by `useAuthStore.clearSession`. Every path that changes the session
  already goes through these two actions (login, register, refresh, logout, failed refresh in `authFetch` and
  `AuthProvider`).
- It holds no token and is **not a security boundary**: it only lets `proxy.ts` redirect before rendering. The
  backend checks the real credential on every call.

### 3.2 Route access

Public (no hint required): `/`, `/login`, `/signup`, `/forgot-password`, `/reset-password`, `/ranking`,
`/school-ranking`, `/placement-test`, `/testlevels/*`.
Everything else needs the hint, including `/admin/*`, `/account/*`, `/check-point/*`, `/testresult`, `/history`,
`/notebook`, `/notifications`, `/tasks`, `/write/*`, `/speaking/*`.
Guest-only: `/login`, `/signup` (a visitor with the hint goes to `/`).

Matching is by path segment: a path matches entry `p` when it equals `p` or starts with `p + '/'`. Prefix matching
without the boundary once matched a static file in Zoney (`/checkin` vs `/checkin-banner.png`).

### 3.3 Proxy decisions

`src/proxy.ts` exports `proxy` and `config.matcher` excluding `_next/static`, `_next/image`, `favicon.ico`,
`robots.txt`, `sitemap.xml` and files with an extension (`clone-assets`, images, audio). The decision logic is a pure
function in `src/lib/route-access.ts` so it is unit-tested without a request.

1. **CSRF on route handlers.** A request to `/api/*` whose method is not `GET`/`HEAD`/`OPTIONS` and whose
   `Sec-Fetch-Site` is `cross-site` gets `403` JSON `{ "message": "Yêu cầu không hợp lệ.", "code": "CROSS_SITE_REQUEST" }`.
   Today there is only a `GET` handler; this guards future ones. Requests without the header pass (older browsers,
   server-to-server).
   Paths under `/api/` stop here: they are never redirected by steps 2–3 (a route handler answers for itself).
2. Protected path without the hint → `307` to `/login?redirect=<pathname + search>`.
3. Guest-only path with the hint → `307` to `/`.
4. Otherwise pass through.

### 3.4 Stale hint

The hint can outlive the session (refresh token expired or revoked). Then the page loads, `AuthProvider`'s
bootstrap refresh fails, `clearSession` deletes the hint, and the client guard (§4) redirects to `/login`. Because the
hint is gone before that navigation, `proxy.ts` lets `/login` render: no redirect loop.

### 3.5 Safe `redirect` parameter

`src/lib/safe-redirect.ts` → `safeRedirectPath(raw: string | null): string`. It returns `raw` only when it starts with
a single `/`, does not start with `//` or `/\`, contains no control characters, and parses with
`new URL(raw, 'http://x')` to origin `http://x`. Anything else returns `/`.
Used by the login form (after success go to `safeRedirectPath(searchParams.get('redirect'))`) and by `RequireAuth`
(when it sends the user to `/login`, it passes the current path).

## 4. Client guards

- `RequireAuth` (existing, `components/auth/require-auth.tsx`) stays the client-side check after bootstrap and now
  redirects to `/login?redirect=<current path>`. It is applied in a `layout.tsx` wherever a whole segment is
  protected, so a new page there cannot forget it: new `app/admin/layout.tsx`, `app/account/layout.tsx`,
  `app/check-point/layout.tsx`, `app/testresult/layout.tsx`, `app/write/layout.tsx`, `app/speaking/layout.tsx`.
  The `(dashboard)` group mixes public pages (`/`, `/ranking`, `/school-ranking`, `/placement-test`) with protected
  ones, so its protected pages (`history`, `notebook`, `notifications`, `tasks`) move into a nested route group
  `app/(dashboard)/(protected)/` whose `layout.tsx` applies `RequireAuth`. URLs do not change (route groups do not
  add a path segment).
- New `RequireAdmin` (`components/auth/require-admin.tsx`): inside `RequireAuth`, renders children only when
  `user.role === 'ADMIN'` (the backend's `AdminGuard` value); otherwise it renders the same UI as
  `app/not-found.tsx` (extracted into a shared component if needed) and never mounts the editor. Used by
  `app/admin/layout.tsx`.
- These guards are UX. The backend (`JwtAuthGuard`, `AdminGuard`) remains the boundary.

## 5. `ApiError`

`src/lib/api-client.ts`:

```ts
export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly code: string | null = null,
    readonly fromApi: boolean = false,
  )
}
```

- `fromApi` is `true` only when the body is JSON with a numeric `statusCode` and a string or string-array `message`
  (the NestJS error shape). Then `message` is the backend text (array joined with `", "`), `code` is the body's
  `code` if it is a string, else `error` if it is a string, else `null`.
- Otherwise (HTML, empty body, non-Nest JSON) `fromApi` is `false` and `message` is the generic
  `"Không thể kết nối máy chủ, vui lòng thử lại sau."`; the raw body is never shown.
- Network failure: `status` `0`, `fromApi` `false`, same generic message.
- The constructor argument order changes from `(status, message)` to `(message, status, …)`; every caller and test
  is updated in the same change.

## 6. HTML sanitising

- `src/lib/safe-html.ts` → `sanitizeHtml(html: string): string`, and `src/components/common/safe-html.tsx` →
  `<SafeHtml as="span" | "div" html={…} className? />`. All six sinks in §1 use `<SafeHtml>`; no other
  `dangerouslySetInnerHTML` remains in `src/` (checked by a test that greps the source tree, allowing only
  `safe-html.tsx`).
- Allow-list, adapted from Zoney `sanitize-html.ts` to what exam content uses: text formatting (`p br hr div span
  strong b em i u s sub sup small mark`), lists (`ul ol li`), `table thead tbody tr th td`, `img` (`src` `alt` `width`
  `height`), `a` (`href`, forced `rel="noopener noreferrer"` and `target="_blank"`), `audio`/`source` (`src`
  `controls`). Allowed URL schemes: `https`, `http`, `mailto`, and `data:` for `img` only. Every `on*` attribute,
  `style` with `url(` or `expression(`, `script`, `iframe`, `object`, `embed`, `form`, `svg` and `math` are removed.
- The rendered markup must be identical during SSR and in the browser (the exam parts are client components that
  also render on the server), otherwise hydration fails. The library is chosen in the plan after verifying this
  property against its docs and source; a library that is a no-op without a DOM is not acceptable.
- Sub-project 3 adds sanitising on save in the backend. The web keeps its own pass anyway (existing data, defence in
  depth).

## 7. Out of scope

- Rate limiting in the web tier: the browser calls the API directly, so the backend's throttler sees real client IPs.
- `server-only` env and server-side data fetching: sub-project 2, with its first consumer.
- Any auth contract change (cookie access token, Origin-decided login mode): rejected on 2026-11-18.
- Removing `output: 'standalone'` (ARCHITECTURE.md says not as a side effect).
- `app/api/admin/media/route.ts`: it lists files that are already public under `public/clone-assets`; unchanged.

## 8. Verification

Unit tests (Vitest, next to each module):

- `security-headers`: the header list; CSP present only for `NODE_ENV=production`; `connect-src` holds the API origin
  and the matching `ws`/`wss` origin for `http`, `https` and a URL with a path and port.
- `route-access`: public / protected / guest-only × hint present / absent; segment boundary (`/rankingx`,
  `/testlevels-old`); CSRF case for each method and `Sec-Fetch-Site` value.
- `safe-redirect`: `//evil.com`, `/\evil.com`, `https://evil.com`, `javascript:alert(1)`, `/%2F%2Fevil.com`,
  control characters, null, and valid paths with query strings.
- `auth-hint-cookie` and `auth-store`: `setSession` writes the cookie, `clearSession` expires it; `Secure` only on
  https.
- `api-client`: Nest JSON → `fromApi` true with `code`; HTML 502 body → generic message; network error.
- `safe-html`: a set of XSS payloads (`<img onerror>`, `<a href="javascript:">`, `<svg onload>`, `<iframe>`,
  `<script>`, `style="background:url(javascript:…)"`) is neutralised; allowed exam markup survives unchanged.

Real path (`.claude/rules/verification.md`), backend running locally on port 3005:

- `npm run build` then `npm start`; `curl -I` `/`, `/login` and `/admin/exam` shows the headers, the CSP and no
  `x-powered-by`; `/admin/exam` without the hint returns `307` to `/login?redirect=%2Fadmin%2Fexam`.
- In a browser: log in from that redirect and land on `/admin/exam`; a USER account sees not-found there; logout
  removes `lta_authed`; a stale hint (cookie set by hand, no refresh cookie) ends on `/login` without a loop; the
  browser console shows no CSP violations on the dashboard, an exam part with images and audio, and the speaking
  screen's microphone prompt.
- Baselines still hold: `npx tsc --noEmit` 0 errors, `npm run lint` no new errors over the 8 known ones,
  `npm test` green.
