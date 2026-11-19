# Architecture

## Repository layout

The repository root holds only metadata (AI configuration, CI, docs). The Next.js project lives
entirely in `src/`, the same layout as Zoney.vn-Web.

## Hosting

The app is deployed on **Vercel**, not on AWS Amplify like Zoney.vn-Web. That difference is not
cosmetic: Amplify Hosting lists Next.js streaming among its unsupported features, while on Vercel
`loading.tsx`, `<Suspense>` and React Server Components stream to the browser. Prefer streaming a
server-rendered page over blocking it or falling back to a client-side fetch.

Deployment settings: `docs/04-deploy-vercel.md`. Rendering consequences and the platform comparison
table: `.claude/ARCHITECTURE.md` → "Hosting: Vercel, not Amplify".

## `src/` directories

| Directory | Contents |
|---|---|
| `app/` | App Router routes, layouts, route handlers (`app/api/`) |
| `components/ui/` | Base UI primitives (shadcn style) |
| `components/common/` | App-wide components: `Topbar`, `BottomNav`, `ThemeProvider`, `NotFoundView`, `SafeHtml` |
| `components/<domain>/` | Components for one domain: `admin`, `auth`, `dashboard`, `exam`, `ranking`, `speaking`, `testlevels`, `writing` |
| `hooks/` | Flat `use-*.ts` hooks, re-exported from `hooks/index.ts` |
| `lib/` | Flat modules with a domain prefix (`exam-grade.ts`, `admin-draft.ts`); tests sit next to the module |
| `lib/exam.ts` | Public surface of the exam domain helpers |
| `schemas/` | Zod schemas, one file per domain (`exam.ts`) |
| `store/` | Zustand stores (`use<Name>Store`) |
| `providers/` | React context providers (auth, TanStack Query) |
| `constants/` | App-wide constants, including `ROUTES` |
| `types/` | Shared TypeScript types |
| `mocks/` | Mock data (JSON and typed `.ts` modules) used until each domain is wired to the backend |
| `public/` | Static files |

## Conventions

- Import through the `@/` alias (maps to `src/`); every `components/<dir>/` has an `index.ts` barrel.
- File names are kebab-case; components are named exports in PascalCase.
- Exam components share the `exam-` prefix: `exam-checkpoint.tsx` (client view of `/check-point/[id]`),
  `exam-mode-select-modal.tsx`, `exam-player.tsx`, and the part renderers in `components/exam/parts/`.
- The `@/components/exam` barrel re-exports page-level components that pull large mock data.
  Components that only need the part renderers import `@/components/exam/parts` directly.
- Tailwind CSS v4 scans source files under `src/` only.

## Security layer

The backend (`luyenthiao.com-Backend`) remains the security boundary. The web app adds the following
protections, which improve safety and user experience but must never be relied on to hide data.

- **Response headers.** `lib/security-headers.ts` builds the headers and `next.config.ts` sends them
  (`poweredByHeader: false`). The Content-Security-Policy is production-only. Its `connect-src` allows `'self'`,
  the API origin and the matching `ws:`/`wss:` origin (derived from `NEXT_PUBLIC_API_URL`); the API origin is also
  allowed in `img-src` and `media-src`, so an `http://` API works in the local production simulation. If
  `NEXT_PUBLIC_API_URL` is not an absolute http(s) URL, the policy falls back to `'self'` for API calls and logs a
  `[security-headers]` warning instead of failing the build. There are no nonces, because they would force
  dynamic rendering.
- **Hint cookie.** `store/auth-store.ts` keeps a cookie `lta_authed=1` (`lib/auth-hint-cookie.ts`) in step with the
  session; it is written and removed only by `setSession` and `clearSession`, and removed before the store state
  changes so the proxy and the client guards cannot loop. It only tells the proxy "this browser probably has a
  session". A refresh that fails for network reasons also signs the user out and clears the hint; they stay on `/login`
  until they reload or log in again (the bootstrap refresh runs only on a full page load). The post-login navigation
  is a full page load (`hardNavigate` in `lib/navigation.ts`) on purpose: the client router cache can hold a
  guest-time redirect to `/login`.
- **Proxy.** `src/proxy.ts` (Next 16's name for middleware) applies the pure `lib/route-access.ts` `decideRoute`.
  Guests on non-public pages get a 307 to `/login?redirect=<path+query>`; visitors with the hint cookie on `/login`
  or `/signup` are sent to the safe `redirect` target (or `/`); cross-site (`Sec-Fetch-Site: cross-site`)
  requests other than GET/HEAD/OPTIONS to `/api/*` get 403 with code `CROSS_SITE_REQUEST`. `/api/*` is never
  redirected, and static files are skipped only for an allowlist of file extensions. Public pages: `/`, `/login`,
  `/signup`, `/forgot-password`, `/reset-password`, `/ranking`, `/school-ranking`, `/placement-test`,
  `/testlevels/*`. Routes prefetched into Next's client cache can skip the proxy, so the client guards still matter.
- **Safe redirects.** `lib/safe-redirect.ts` `safeRedirectPath` accepts only same-origin paths (it rejects `//`,
  `/\`, schemes and control characters, re-checks the result after URL normalisation, and never returns
  `/login` or `/signup`). The login form and the proxy both use it. After authentication `LoginForm` navigates to
  the safe target. Known gap: the signup flow does not yet carry `redirect`.
- **Route guards.** `RequireAuth` (`components/auth/require-auth.tsx`) and `RequireAdmin`
  (`components/auth/require-admin.tsx`) are exported from the `@/components/auth` barrel. `RequireAuth` is applied by the `layout.tsx` of `app/admin`, `app/account`, `app/check-point`,
  `app/testresult`, `app/write`, `app/speaking` and `app/(dashboard)/(protected)` (which holds `history`,
  `notebook`, `notifications` and `tasks`; URLs are unchanged). An unauthenticated visitor goes to
  `/login?redirect=<current path>`, except right after a logout seen by the mounted guard, which goes to `/`.
  `RequireAdmin` (role `ADMIN`) in `app/admin/layout.tsx` renders `NotFoundView` for other users. Server-component
  children are still part of the RSC payload, so guards do not hide server-fetched data. New signed-in pages go
  under one of these segments.
- **API errors.** `ApiError(message, status, code, fromApi)` in `lib/api-client.ts`: `fromApi` is true only for a
  NestJS error body with status below 500. In every other case (5xx, network failure with status 0, a 2xx with a
  non-JSON body) the message is the generic Vietnamese text `GENERIC_ERROR_MESSAGE`. Show server messages to users
  only when `fromApi` is true.
- **HTML.** Untrusted HTML renders only through `<SafeHtml>` (`components/common/safe-html.tsx`), which calls
  `sanitizeHtml` (`lib/safe-html.ts`, built on the pinned `sanitize-html` 2.18.2; it is pure JavaScript, so server
  and browser output match). The allow-list covers formatting, lists, tables, `img`, `a`, `audio` and `source`;
  `class`/`id` are dropped, `style` is limited by regex, `data:` URLs are allowed for images only, and links get
  `target="_blank" rel="noopener noreferrer"`. `lib/no-raw-html.test.ts` fails on any other
  `dangerouslySetInnerHTML`.

## Data layer

Screens on the API: dashboard planets, student ranking (with the "Hạng của tôi" card), school ranking,
notifications (with the Topbar unread badge), tasks, history and notebook. Exams, test levels, check-point,
placement test, writing/speaking, challenges and admin still read `src/mocks/`, `localStorage` or page constants.

- **Public data.** `lib/api/public.ts` is `server-only`. It calls `fetch(..., { next: { revalidate: 60 } })` with a
  5 second timeout, never throws, and returns a `PublicResult` (`lib/api/public-result.ts`, importable from client
  code). Failures are logged as `[public-api] <path>`; pages render an error or empty state, so the build also
  succeeds without a backend.
- **Private data.** Each domain has `lib/api/<domain>.ts` (authFetch + `parseOrThrow`), `schemas/<domain>.ts` (a zod
  schema of the backend shape plus a mapper to the view type) and `hooks/use-<domain>.ts` (TanStack Query, enabled
  only when authenticated, with `retryTransient`).
- **Query keys.** All private keys live in `lib/query-keys.ts` and are rooted at `'me'`. `PrivateDataCleanup`
  (`providers/private-data-cleanup.tsx`) removes the `'me'` queries when the session ends and resets them when
  another user signs in.
- **Fixtures.** `schemas/__fixtures__/` holds real payloads captured from the backend on 2026-11-18. Tests use them;
  recapture them when the backend contract changes.
