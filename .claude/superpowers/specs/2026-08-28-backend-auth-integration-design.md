# Backend Auth Integration — Design

Date: 2026-08-28
Status: Approved (user authorized autonomous execution — busy, reviewing after completion; judgment calls below are flagged for that review)

## Goal

Wire this Next.js app to the real NestJS backend's auth API (`D:\flyer-clone-backend\backend`, already implemented and pushed: register/login/refresh/logout/change-password/forgot-password/reset-password), using TanStack Query (already installed and provider-mounted) as the server-state layer, and Zustand for the client-side session slice — per this project's own documented state-layering rule (`.claude/rules/coding.md`).

## Context — what already exists (investigated before designing)

- `QueryProvider` is already mounted in `src/app/layout.tsx`. No changes needed there beyond adding a new `AuthProvider`.
- `src/app/login` and `src/app/signup` exist with fully **dummy** forms (`LoginForm`/`SignupForm` in `src/components/auth/`): no API calls, no validation library despite the stack being available, `preventDefault()` + `router.push()`/`alert()` only. "Quên mật khẩu?" links to `href="#"` — dead.
- No auth store, no API client, no auth types exist anywhere.
- `src/lib/env.ts` exposes only `APP_URL`/`NODE_ENV` — no API base URL yet.
- `src/components/layout/topbar.tsx` has hardcoded, always-visible "Đăng Nhập"/"Đăng Ký" buttons with no session-awareness at all — this is the natural integration point to prove the whole loop works end-to-end in the actual running app, not just in isolated pages.
- This project's `.claude/rules/coding.md` (page.tsx-as-orchestrator, barrel exports, named exports, explicit return types) is **not consistently followed** in the real codebase (e.g. `notifications/page.tsx` has inline state/logic) — I'm following it for the auth pages specifically since the existing auth pages already do, but not treating deviation elsewhere as license to be sloppy here.

## Non-goals

- Social login (Google/Facebook buttons already in the dummy UI stay as inert decoration — backend has no OAuth support).
- "Remember me" / persisted sessions beyond what the httpOnly refresh cookie already provides.
- Building a full account/profile page beyond a minimal change-password screen.
- Any backend change. Confirmed unnecessary: backend's `CORS_ORIGIN` is unset in `.env`, which makes it reflect the request's actual origin (`origin: true`) — this already works for any local dev port the frontend ends up on, no backend config edit required.
- Rate-limiting/CAPTCHA on the frontend forms — matches backend's own explicit non-goal on this (documented in its own spec).

## Port coordination (dev environment note, not a design decision)

Backend's `.env` has `PORT=3000`. Next.js's `next dev` also defaults to port 3000. When both run simultaneously, Next.js's own dev server automatically detects the conflict and falls back to the next free port (3001), printing which port it picked — no code change needed for this, just something to notice when starting both servers during verification (check the actual printed port, don't assume 3000).

## Architecture

### 1. Environment & types

- `src/lib/env.ts`: add `API_URL` (from `NEXT_PUBLIC_API_URL`, required — no silent fallback, since every auth call depends on it being correct).
- `.env.example`: add `NEXT_PUBLIC_API_URL=http://localhost:3000/api`.
- `src/types/auth.ts` (new): `User { id: number; role: string }`, and one type per backend DTO (`RegisterInput`, `LoginInput`, `ChangePasswordInput`, `ForgotPasswordInput`, `ResetPasswordInput`) plus `AuthResponse { accessToken: string; user: User }` — mirroring the backend's actual response shape exactly (confirmed: refresh token is cookie-only, never in the JSON body).

### 2. API client (`src/lib/api-client.ts`, new)

A thin fetch wrapper, not a full library (axios isn't installed and isn't needed for this surface):

- `apiFetch<T>(path, init?)`: prefixes `env.API_URL`, sets `credentials: 'include'` (required for the httpOnly refresh cookie to be sent/received — this is the single most important line in the whole integration), sets `Content-Type: application/json` when a body is present, attaches `Authorization: Bearer <token>` from the auth store's in-memory access token when one exists, parses JSON, and throws a typed `ApiError { status: number; message: string }` on a non-2xx response (reading the backend's `{message, error, statusCode}` error body shape).
- `authFetch<T>(path, init?)`: wraps `apiFetch`. On a `401`, attempts exactly one silent `POST /auth/refresh` (via `apiFetch` itself, not `authFetch`, to avoid recursion), and on success retries the original request once with the new access token; on refresh failure, clears the auth store's session and rethrows the original 401. Concurrent 401s (e.g. two protected queries firing at once after the access token expires) must share a single in-flight refresh call rather than each independently hitting `/auth/refresh` — implemented as a module-level `let refreshPromise: Promise<...> | null` that's created on first use and cleared once it settles.
- Only `change-password` (the one auth endpoint that requires an existing access token) goes through `authFetch`. `register`/`login`/`refresh`/`logout`/`forgot-password`/`reset-password` use plain `apiFetch` (they either don't need a token, or a 401 from them is a real, final answer — e.g. wrong current password on login — not a "go refresh and retry" situation).

### 3. Auth store (`src/store/auth-store.ts`, new)

Zustand, **no `persist` middleware** — deliberate, matches the backend's own security design of keeping the access token out of any persistent storage (only the httpOnly refresh cookie survives a reload, and that's the browser's job, not this app's).

```
{
  accessToken: string | null
  user: User | null
  status: 'idle' | 'authenticated' | 'unauthenticated'
  setSession(accessToken: string, user: User): void   // sets both + status: 'authenticated'
  clearSession(): void                                 // nulls both + status: 'unauthenticated'
}
```

`status: 'idle'` is the initial value before the bootstrap refresh (section 5) resolves — used to avoid a flash of "logged out" UI in the Topbar while that first silent refresh is still in flight.

### 4. Auth mutations (`src/hooks/auth/`, new directory)

One file per concern, each a thin TanStack Query `useMutation` wrapping `apiFetch`/`authFetch` and updating the auth store on success:

- `use-register.ts`, `use-login.ts` — both call `apiFetch('/auth/register'|'/auth/login', {...})`, `onSuccess` calls `authStore.setSession(data.accessToken, data.user)`.
- `use-logout.ts` — calls `apiFetch('/auth/logout', {method:'POST'})`, `onSuccess` (and also `onSettled`, so a logout that 500s server-side still clears local state — matches the backend's own best-effort logout design) calls `authStore.clearSession()` and `queryClient.clear()` (drop all cached server data on logout — it belonged to the previous session).
- `use-change-password.ts` — calls `authFetch('/auth/change-password', {...})` (the one mutation needing the auto-refresh wrapper).
- `use-forgot-password.ts`, `use-reset-password.ts` — call `apiFetch`, no store changes (these don't establish a session).

### 5. Session bootstrap (`src/providers/auth-provider.tsx`, new)

Since the access token lives only in memory, a full page reload always starts with `accessToken: null` even if the user has a live, unexpired refresh cookie. `AuthProvider` (client component, mounted in `layout.tsx` inside `QueryProvider`) runs one effect on mount: call `apiFetch('/auth/refresh', {method:'POST'})`. On success, `setSession(...)`; on failure (no cookie, or an expired/invalid one — a normal, expected case for a logged-out visitor, not an error to surface), `clearSession()`. Either way, this is the only place `status` moves out of `'idle'`.

### 6. Wiring the existing UI

- **`login-form.tsx`** (rewrite): `react-hook-form` + `zod` (matches the stack this project already declares but doesn't yet use anywhere — this becomes the first real example of it). Schema: `username: z.string().min(1)`, `password: z.string().min(1)`. Field relabeled from "Tên tài khoản" / "Số điện thoại hoặc tên đăng nhập" to "Tên đăng nhập" — **judgment call**: the backend has no phone-based login, only `username`, so the existing placeholder text promising phone-login is being corrected to match what the API actually accepts, not preserved. On submit, call `useLogin`; on success `router.push('/')`; on error, surface the `ApiError.message` (already in Vietnamese from the backend) inline instead of the current form's no-op.
- **`signup-form.tsx`** (rewrite): fields become `username` (new — required, backend needs it, current form has no equivalent), `fullName` (renamed from `name`), `email` (new — **judgment call**: backend allows registering without email, but doing so permanently locks that account out of forgot-password, so the frontend requires it even though the API doesn't, to avoid users creating unrecoverable accounts), `password`, `confirmPassword` (client-side-only match check via zod `.refine`, matching backend's own bounds `min(8).max(72)`). `phone` field dropped — backend accepts it but nothing currently depends on it and the current dummy validation on it (`length < 10`) doesn't correspond to any real backend rule; not worth carrying forward speculatively (YAGNI). On submit, call `useRegister`; on success, redirect straight to `/` (already logged in — registering returns a session, matching how `login` does) instead of the current "alert + redirect to /login" flow, which was only ever there because there was no real registration.
- **`forgot-password-form.tsx`** (new) + `src/app/forgot-password/page.tsx` (new): single `email` field, calls `useForgotPassword`, always shows the backend's generic success message on success (never a different message for "found" vs "not found" — the frontend must not defeat the backend's anti-enumeration design by, say, showing a different UI state).
- **`reset-password-form.tsx`** (new) + `src/app/reset-password/page.tsx` (new): reads an optional `?token=` search param to prefill (the backend's reset email currently sends the raw token as plain text, not a clickable link, so this field is user-editable regardless — the query-param prefill is forward-compatible with a future emailed link, not load-bearing today), plus `newPassword`/`confirmNewPassword`. Calls `useResetPassword`; on success, redirect to `/login` with a success message (e.g. via a query param the login page reads and shows as a banner — simplest option that doesn't need a toast library).
- **`change-password-form.tsx`** (new) + `src/app/account/change-password/page.tsx` (new, minimal — this is the only genuinely new page beyond wiring existing ones): `currentPassword`/`newPassword`/`confirmNewPassword`, calls `useChangePassword`. This page redirects to `/login` if `authStore.status !== 'authenticated'` (client-side guard is sufficient here — there's no sensitive data rendered before the check, just a form).
- **`topbar.tsx`** (modify): read `authStore`. When `status === 'authenticated'`, replace the "Đăng Nhập"/"Đăng Ký" button pair with the user's info + a small dropdown/menu offering "Đổi mật khẩu" (→ `/account/change-password`) and "Đăng xuất" (calls `useLogout`, then `router.push('/')`). When `status === 'unauthenticated'` or `'idle'`, keep the existing buttons as-is (no flash-of-wrong-state concern for the *logged-out* case, since that's the safe default to render immediately).
- **`src/constants/index.ts`** (modify): add `LOGIN: '/login'`, `SIGNUP: '/signup'`, `FORGOT_PASSWORD: '/forgot-password'`, `RESET_PASSWORD: '/reset-password'`, `ACCOUNT_CHANGE_PASSWORD: '/account/change-password'` to `ROUTES` — these routes exist/will exist but weren't in the object before (pre-existing gap, not something this feature introduced).

## Error handling

- Every mutation's error path renders `ApiError.message` (backend already produces user-facing Vietnamese strings for every documented failure — wrong password, username taken, invalid/expired/reused token, etc.) — no frontend-authored duplicate error copy.
- A network failure (backend unreachable) is a distinct `ApiError` with no `status` (or a synthetic one, e.g. `0`) and a generic "Không thể kết nối máy chủ, vui lòng thử lại." message, since there's no backend message to surface in that case.
- The bootstrap refresh's failure (logged-out visitor) is silent — no toast, no console error for the expected case. Log at `console.debug` only if useful for local dev, nothing user-facing.

## Testing

This project has Vitest + React Testing Library already configured (`npm run test`), unlike the backend (which has none). Given the time budget and that this is fundamentally an integration/wiring task against a real, already-verified backend, automated tests are scoped narrowly rather than skipped entirely:

- Unit-test `api-client.ts`'s `authFetch` 401-retry-once behavior and its single-in-flight-refresh dedup logic with mocked `fetch` — this is the one piece of genuinely non-trivial logic in the whole integration, and the one most likely to silently regress later.
- No component/form tests — the existing `LoginForm`/`SignupForm` have none today, and hand-rolling RTL tests for straightforward form-to-mutation wiring is lower value than a real end-to-end smoke pass.
- Manual, real end-to-end verification (both servers actually running, real browser or curl-equivalent against the actual Next.js dev server) covering the full loop: register → session appears in Topbar → refresh the page (session survives via bootstrap) → change-password → logout → login again → forgot-password → reset-password → login with new password. This mirrors how the backend itself was verified (no mocking, real Redis/MySQL/SMTP) and is the actual proof this integration works, not just that the pieces type-check.
