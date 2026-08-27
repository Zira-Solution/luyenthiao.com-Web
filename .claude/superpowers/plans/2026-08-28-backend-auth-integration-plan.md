# Backend Auth Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Wire the existing dummy login/signup UI to the real NestJS backend's auth API, add the missing forgot/reset/change-password screens, and make the Topbar session-aware — using TanStack Query (already installed) + a Zustand session store (no persistence, matching the backend's in-memory-access-token design).

**Architecture:** A thin `fetch`-based API client (`apiFetch`/`authFetch`, the latter auto-refreshing on 401 with single-flight dedup) sits under a Zustand auth store and TanStack Query mutation hooks. An `AuthProvider` bootstraps the session on every page load via a silent `/auth/refresh` call (the access token lives only in memory, so a reload always starts blank even with a live refresh cookie). Existing dummy forms are rewired to real mutations with `react-hook-form` + `zod`; new pages are added for forgot/reset/change password; the Topbar becomes session-aware.

**Tech Stack:** Next.js 16 App Router, React 19, TanStack Query, Zustand, react-hook-form + zod, Vitest.

**Reference spec:** `.claude/superpowers/specs/2026-08-28-backend-auth-integration-design.md`

**Backend contract (already implemented, verified working, at `D:\flyer-clone-backend\backend`):**
- `POST /auth/register` — body `{username, password, fullName, email?, phone?, role?}` → `201 {accessToken, user:{id,role}}` + `Set-Cookie: refreshToken` (httpOnly, path `/api/auth`)
- `POST /auth/login` — body `{username, password}` → `200 {accessToken, user:{id,role}}` + refresh cookie
- `POST /auth/refresh` — no body, cookie required → `200 {accessToken, user:{id,role}}` + rotated refresh cookie, or `401`
- `POST /auth/logout` — no body, cookie optional → `204`, clears cookie
- `POST /auth/change-password` — `Authorization: Bearer <token>` required, body `{currentPassword, newPassword}` → `204`
- `POST /auth/forgot-password` — body `{email}` → always `200 {message: string}`
- `POST /auth/reset-password` — body `{token, newPassword}` → `204`, or `401` if token invalid/expired/used
- Error body shape on non-2xx: `{message: string | string[], error: string, statusCode: number}`
- Backend runs on port `3000` (its `.env` has `PORT=3000`); this frontend's `next dev` also defaults to 3000 and will auto-fallback to the next free port (3001) when both run together — check the actual printed port during verification, don't assume.

**Testing convention:** This project has Vitest + React Testing Library already configured (`npm run test`). Per the spec, automated coverage is scoped to `api-client.ts`'s non-trivial 401-retry/dedup logic; the rest is verified via one real end-to-end pass (Task 13) with both servers actually running.

---

### Task 1: Dependencies, env var, and auth types

**Files:**
- Modify: `package.json` (via npm install)
- Modify: `.env.example`
- Modify: `src/lib/env.ts`
- Create: `src/types/auth.ts`
- Modify: `src/types/index.ts`

- [ ] **Step 1: Install the zod↔react-hook-form bridge package**

`react-hook-form` and `zod` are already installed, but `@hookform/resolvers` (the package providing `zodResolver`) is not.

Run:
```bash
npm install @hookform/resolvers
```
Expected: `package.json`/`package-lock.json` gain `@hookform/resolvers` under `dependencies`.

- [ ] **Step 2: Add the API base URL to `.env.example`**

Append after the existing `NEXT_PUBLIC_APP_URL=http://localhost:3000` line:
```
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

- [ ] **Step 3: Add `API_URL` to `src/lib/env.ts`**

Read the current file first — it exports `getEnvVar` and an `env` object with `APP_URL`/`NODE_ENV`. Replace the `env` object (keep `getEnvVar` as-is) with:

```typescript
export const env = {
  APP_URL:
    process.env.NODE_ENV === 'production'
      ? getEnvVar('NEXT_PUBLIC_APP_URL')
      : (process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'),
  API_URL:
    process.env.NODE_ENV === 'production'
      ? getEnvVar('NEXT_PUBLIC_API_URL')
      : (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000/api'),
  NODE_ENV: process.env.NODE_ENV ?? 'development',
} as const
```

- [ ] **Step 4: Write `src/types/auth.ts`**

```typescript
export interface User {
  id: number
  role: string
}

export interface AuthResponse {
  accessToken: string
  user: User
}

export interface RegisterInput {
  username: string
  password: string
  fullName: string
  email: string
}

export interface LoginInput {
  username: string
  password: string
}

export interface ChangePasswordInput {
  currentPassword: string
  newPassword: string
}

export interface ForgotPasswordInput {
  email: string
}

export interface ForgotPasswordResponse {
  message: string
}

export interface ResetPasswordInput {
  token: string
  newPassword: string
}
```

- [ ] **Step 5: Re-export from the types barrel**

Read `src/types/index.ts` first to see its current re-export style (it re-exports from `writing.ts`/`speaking.ts` alongside the local `BaseEntity`/`Result` definitions). Add one line following that same pattern:

```typescript
export * from './auth'
```

- [ ] **Step 6: Verify it compiles**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 7: Commit**

```bash
git add package.json package-lock.json .env.example src/lib/env.ts src/types/auth.ts src/types/index.ts
git commit -m "chore: add API base URL env var and auth types"
```

---

### Task 2: Auth store

**Files:**
- Create: `src/store/auth-store.ts`

- [ ] **Step 1: Write the store**

Match the existing `src/store/exam-store.ts` convention (`"use client"` at top, `create<State>((set) => ({...}))`, hook named `use<Name>Store`).

```typescript
"use client"

import { create } from "zustand"

import type { User } from "@/types/auth"

export type AuthStatus = "idle" | "authenticated" | "unauthenticated"

interface AuthStoreState {
  accessToken: string | null
  user: User | null
  status: AuthStatus
  setSession: (accessToken: string, user: User) => void
  clearSession: () => void
}

export const useAuthStore = create<AuthStoreState>((set) => ({
  accessToken: null,
  user: null,
  status: "idle",

  setSession: (accessToken, user) => {
    set({ accessToken, user, status: "authenticated" })
  },

  clearSession: () => {
    set({ accessToken: null, user: null, status: "unauthenticated" })
  },
}))
```

`status: "idle"` is the pre-bootstrap value (Task 5 resolves it to `"authenticated"` or `"unauthenticated"`) — used later so the Topbar doesn't flash a "logged out" state while the first silent refresh is still in flight.

- [ ] **Step 2: Verify it compiles**

Run: `npx tsc --noEmit`
Expected: no errors. Nothing imports this yet.

- [ ] **Step 3: Commit**

```bash
git add src/store/auth-store.ts
git commit -m "feat: add auth session store"
```

---

### Task 3: API client

**Files:**
- Create: `src/lib/api-client.ts`

This is the one piece of genuinely non-trivial logic in the whole integration — get the 401-retry/dedup behavior right, it's covered by Task 12's tests.

- [ ] **Step 1: Write the client**

```typescript
import { env } from "@/lib/env"
import { useAuthStore } from "@/store/auth-store"
import type { AuthResponse } from "@/types/auth"

export class ApiError extends Error {
  status: number

  constructor(status: number, message: string) {
    super(message)
    this.name = "ApiError"
    this.status = status
  }
}

interface ApiErrorBody {
  message?: string | string[]
  error?: string
  statusCode?: number
}

async function parseErrorMessage(response: Response): Promise<string> {
  try {
    const body = (await response.json()) as ApiErrorBody
    if (Array.isArray(body.message)) return body.message.join(", ")
    if (typeof body.message === "string") return body.message
  } catch {
    // response body wasn't JSON — fall through to the generic message
  }
  return "Đã có lỗi xảy ra, vui lòng thử lại."
}

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response
  try {
    response = await fetch(`${env.API_URL}${path}`, {
      ...init,
      credentials: "include",
      headers: {
        ...(init?.body ? { "Content-Type": "application/json" } : {}),
        ...init?.headers,
      },
    })
  } catch {
    throw new ApiError(0, "Không thể kết nối máy chủ, vui lòng thử lại.")
  }

  if (!response.ok) {
    throw new ApiError(response.status, await parseErrorMessage(response))
  }

  if (response.status === 204) {
    return undefined as T
  }

  return (await response.json()) as T
}

let refreshPromise: Promise<void> | null = null

function refreshSession(): Promise<void> {
  if (!refreshPromise) {
    refreshPromise = apiFetch<AuthResponse>("/auth/refresh", { method: "POST" })
      .then((data) => {
        useAuthStore.getState().setSession(data.accessToken, data.user)
      })
      .finally(() => {
        refreshPromise = null
      })
  }
  return refreshPromise
}

export async function authFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const withAuthHeader = (token: string | null): RequestInit => ({
    ...init,
    headers: {
      ...init?.headers,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  })

  try {
    return await apiFetch<T>(path, withAuthHeader(useAuthStore.getState().accessToken))
  } catch (err) {
    if (err instanceof ApiError && err.status === 401) {
      try {
        await refreshSession()
      } catch {
        useAuthStore.getState().clearSession()
        throw err
      }
      return apiFetch<T>(path, withAuthHeader(useAuthStore.getState().accessToken))
    }
    throw err
  }
}
```

Key properties, since they're not obvious from reading the code once:
- `refreshPromise` is a **module-level** variable, so it's shared across every `authFetch` call in the whole app — two protected requests that both hit a 401 at the same moment will both `await` the *same* `refreshSession()` call rather than each independently calling `/auth/refresh`.
- On a refresh failure, the *original* 401 (`err`, from the very first `catch`) is rethrown, not whatever error `refreshSession()` itself produced — the caller sees "your request was unauthorized," not "the refresh attempt also failed," which is the more useful message.
- `apiFetch` itself never triggers a refresh — only `authFetch` does. Calling `apiFetch("/auth/refresh", ...)` from inside `refreshSession` would recurse forever if it went through `authFetch` instead.

- [ ] **Step 2: Verify it compiles**

Run: `npx tsc --noEmit`
Expected: no errors. Nothing calls `apiFetch`/`authFetch` yet outside this file.

- [ ] **Step 3: Commit**

```bash
git add src/lib/api-client.ts
git commit -m "feat: add fetch-based API client with 401 auto-refresh"
```

---

### Task 4: Auth mutation hooks

**Files:**
- Create: `src/hooks/auth/use-register.ts`
- Create: `src/hooks/auth/use-login.ts`
- Create: `src/hooks/auth/use-logout.ts`
- Create: `src/hooks/auth/use-change-password.ts`
- Create: `src/hooks/auth/use-forgot-password.ts`
- Create: `src/hooks/auth/use-reset-password.ts`
- Create: `src/hooks/auth/index.ts`
- Modify: `src/hooks/index.ts`

- [ ] **Step 1: `use-register.ts`**

```typescript
"use client"

import { useMutation } from "@tanstack/react-query"

import { apiFetch } from "@/lib/api-client"
import { useAuthStore } from "@/store/auth-store"
import type { AuthResponse, RegisterInput } from "@/types/auth"

export function useRegister() {
  const setSession = useAuthStore((state) => state.setSession)

  return useMutation({
    mutationFn: (input: RegisterInput) =>
      apiFetch<AuthResponse>("/auth/register", {
        method: "POST",
        body: JSON.stringify(input),
      }),
    onSuccess: (data) => {
      setSession(data.accessToken, data.user)
    },
  })
}
```

- [ ] **Step 2: `use-login.ts`**

```typescript
"use client"

import { useMutation } from "@tanstack/react-query"

import { apiFetch } from "@/lib/api-client"
import { useAuthStore } from "@/store/auth-store"
import type { AuthResponse, LoginInput } from "@/types/auth"

export function useLogin() {
  const setSession = useAuthStore((state) => state.setSession)

  return useMutation({
    mutationFn: (input: LoginInput) =>
      apiFetch<AuthResponse>("/auth/login", {
        method: "POST",
        body: JSON.stringify(input),
      }),
    onSuccess: (data) => {
      setSession(data.accessToken, data.user)
    },
  })
}
```

- [ ] **Step 3: `use-logout.ts`**

```typescript
"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"

import { apiFetch } from "@/lib/api-client"
import { useAuthStore } from "@/store/auth-store"

export function useLogout() {
  const clearSession = useAuthStore((state) => state.clearSession)
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => apiFetch<void>("/auth/logout", { method: "POST" }),
    onSettled: () => {
      // Best-effort, matching the backend's own logout design: clear local
      // session state even if the server call itself failed.
      clearSession()
      queryClient.clear()
    },
  })
}
```

- [ ] **Step 4: `use-change-password.ts`**

```typescript
"use client"

import { useMutation } from "@tanstack/react-query"

import { authFetch } from "@/lib/api-client"
import type { ChangePasswordInput } from "@/types/auth"

export function useChangePassword() {
  return useMutation({
    mutationFn: (input: ChangePasswordInput) =>
      authFetch<void>("/auth/change-password", {
        method: "POST",
        body: JSON.stringify(input),
      }),
  })
}
```

- [ ] **Step 5: `use-forgot-password.ts`**

```typescript
"use client"

import { useMutation } from "@tanstack/react-query"

import { apiFetch } from "@/lib/api-client"
import type { ForgotPasswordInput, ForgotPasswordResponse } from "@/types/auth"

export function useForgotPassword() {
  return useMutation({
    mutationFn: (input: ForgotPasswordInput) =>
      apiFetch<ForgotPasswordResponse>("/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify(input),
      }),
  })
}
```

- [ ] **Step 6: `use-reset-password.ts`**

```typescript
"use client"

import { useMutation } from "@tanstack/react-query"

import { apiFetch } from "@/lib/api-client"
import type { ResetPasswordInput } from "@/types/auth"

export function useResetPassword() {
  return useMutation({
    mutationFn: (input: ResetPasswordInput) =>
      apiFetch<void>("/auth/reset-password", {
        method: "POST",
        body: JSON.stringify(input),
      }),
  })
}
```

- [ ] **Step 7: Barrel export**

`src/hooks/auth/index.ts`:
```typescript
export * from "./use-register"
export * from "./use-login"
export * from "./use-logout"
export * from "./use-change-password"
export * from "./use-forgot-password"
export * from "./use-reset-password"
```

Read `src/hooks/index.ts` first to see its current exports (it currently re-exports `use-media-library` and similar). Add:
```typescript
export * from "./auth"
```

- [ ] **Step 8: Verify it compiles**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 9: Commit**

```bash
git add src/hooks/auth src/hooks/index.ts
git commit -m "feat: add TanStack Query mutation hooks for auth endpoints"
```

---

### Task 5: Session bootstrap (AuthProvider)

**Files:**
- Create: `src/providers/auth-provider.tsx`
- Modify: `src/app/layout.tsx`

- [ ] **Step 1: Write `AuthProvider`**

```tsx
"use client"

import { useEffect } from "react"

import { apiFetch } from "@/lib/api-client"
import { useAuthStore } from "@/store/auth-store"
import type { AuthResponse } from "@/types/auth"

interface AuthProviderProps {
  children: React.ReactNode
}

export function AuthProvider({ children }: AuthProviderProps): React.ReactElement {
  const setSession = useAuthStore((state) => state.setSession)
  const clearSession = useAuthStore((state) => state.clearSession)

  useEffect(() => {
    let cancelled = false

    apiFetch<AuthResponse>("/auth/refresh", { method: "POST" })
      .then((data) => {
        if (!cancelled) setSession(data.accessToken, data.user)
      })
      .catch(() => {
        // Expected for a logged-out visitor (no cookie, or an expired one) —
        // not an error to surface, just means "not logged in."
        if (!cancelled) clearSession()
      })

    return () => {
      cancelled = true
    }
  }, [setSession, clearSession])

  return <>{children}</>
}
```

`setSession`/`clearSession` are stable Zustand action references (their identity never changes across renders), so including them in the dependency array is correct and doesn't cause the effect to re-run — no `eslint-disable` needed.

- [ ] **Step 2: Mount it in the root layout**

Read `src/app/layout.tsx` first. It currently wraps `{children}` in `ThemeProvider` → `QueryProvider`. Add `AuthProvider` as the innermost wrapper (it needs `QueryProvider`'s context if any auth hook ever uses `useQueryClient`, which `use-logout.ts` already does elsewhere in the tree — keeping `AuthProvider` inside `QueryProvider` is the safe order).

Change:
```tsx
import { QueryProvider } from '@/providers/query-provider'
```
to:
```tsx
import { AuthProvider } from '@/providers/auth-provider'
import { QueryProvider } from '@/providers/query-provider'
```

And change:
```tsx
          <QueryProvider>{children}</QueryProvider>
```
to:
```tsx
          <QueryProvider>
            <AuthProvider>{children}</AuthProvider>
          </QueryProvider>
```

- [ ] **Step 3: Verify it compiles**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add src/providers/auth-provider.tsx src/app/layout.tsx
git commit -m "feat: bootstrap session on load via silent refresh"
```

---

### Task 6: Rewrite the login form

**Files:**
- Modify: `src/components/auth/login-form.tsx` (full rewrite)

- [ ] **Step 1: Replace the entire file**

The backend has no phone-based login — only `username`. The existing field's placeholder text ("Số điện thoại hoặc tên đăng nhập") is being corrected to match what the API actually accepts, and the dead `href="#"` forgot-password link now points to the real page (Task 8).

```tsx
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { GameButton } from "@/components/ui/game-button";
import { GameInput } from "@/components/ui/game-input";
import { useLogin } from "@/hooks/auth";
import { ApiError } from "@/lib/api-client";

const loginSchema = z.object({
  username: z.string().min(1, "Vui lòng nhập tên đăng nhập"),
  password: z.string().min(1, "Vui lòng nhập mật khẩu"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginForm(): React.ReactElement {
  const router = useRouter();
  const login = useLogin();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({ resolver: zodResolver(loginSchema) });

  const onSubmit = (values: LoginFormValues): void => {
    login.mutate(values, {
      onSuccess: () => router.push("/"),
    });
  };

  const errorMessage =
    login.error instanceof ApiError
      ? login.error.message
      : login.error
        ? "Đã có lỗi xảy ra, vui lòng thử lại."
        : null;

  return (
    <div className="w-full max-w-[500px] flex flex-col items-center text-shadow-game-title">
      <div className="w-full bg-ranking-table-bg backdrop-blur-md border-3 border-ranking-table-border rounded-[2rem] p-8 md:p-10 shadow-[0_15px_30px_rgba(0,0,0,0.5)] text-shadow-game-title">
        <h1 className="text-4xl md:text-5xl font-black uppercase text-center text-white tracking-wider mb-8 font-heading text-shadow-game-title">
          ĐĂNG NHẬP
        </h1>

        {errorMessage && (
          <div className="mb-6 p-3 rounded-xl border border-red-500/30 bg-red-500/10 text-red-400 text-xs font-bold text-center text-shadow-game-title">
            {errorMessage}
          </div>
        )}

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="w-full flex flex-col gap-6 text-shadow-game-title"
        >
          <div className="w-full text-shadow-game-title">
            <label className="block text-white/80 font-bold text-xs md:text-sm mb-2 ml-1 tracking-wide uppercase text-shadow-game-title">
              Tên đăng nhập
            </label>
            <GameInput type="text" placeholder="Tên đăng nhập" {...register("username")} />
            {errors.username && (
              <p className="mt-1.5 ml-1 text-red-400 text-xs font-bold">{errors.username.message}</p>
            )}
          </div>

          <div className="w-full text-shadow-game-title">
            <label className="block text-white/80 font-bold text-xs md:text-sm mb-2 ml-1 tracking-wide uppercase text-shadow-game-title">
              Mật khẩu
            </label>
            <GameInput type="password" placeholder="Mật khẩu" {...register("password")} />
            {errors.password && (
              <p className="mt-1.5 ml-1 text-red-400 text-xs font-bold">{errors.password.message}</p>
            )}
          </div>

          <div className="w-full flex justify-end text-shadow-game-title">
            <Link
              href="/forgot-password"
              className="text-blue-300 hover:text-white text-xs md:text-sm font-bold transition-colors hover:underline tracking-wide text-shadow-game-title"
            >
              Quên mật khẩu?
            </Link>
          </div>

          <div className="mt-4 flex justify-center text-shadow-game-title">
            <GameButton
              className="w-full max-w-[260px] text-shadow-game-title"
              type="submit"
              variant="primary"
              disabled={login.isPending}
            >
              {login.isPending ? "ĐANG ĐĂNG NHẬP..." : "ĐĂNG NHẬP"}
            </GameButton>
          </div>
        </form>

        <div className="relative my-8 flex items-center justify-center text-shadow-game-title">
          <div className="absolute inset-0 flex items-center text-shadow-game-title">
            <div className="w-full border-t border-white/10 text-shadow-game-title"></div>
          </div>
          <span className="relative bg-ranking-table-bg px-4 text-xs font-bold text-white/40 uppercase tracking-widest text-shadow-game-title">
            Hoặc đăng nhập với
          </span>
        </div>

        <div className="flex gap-4 items-center justify-center text-shadow-game-title">
          <button
            type="button"
            className="flex-1 max-w-[140px] relative group active:translate-y-[2px] transition-all duration-100 cursor-pointer text-shadow-game-title"
          >
            <div className="absolute inset-x-0 -bottom-1 h-full rounded-xl bg-gray-300 -z-10 group-active:bottom-0 shadow-md text-shadow-game-title" />
            <div className="bg-white border-2 border-gray-200 rounded-xl px-4 py-2.5 flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors text-shadow-game-title">
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              <span className="text-gray-700 font-black text-xs uppercase tracking-wide text-shadow-game-title">
                Google
              </span>
            </div>
          </button>

          <button
            type="button"
            className="flex-1 max-w-[140px] relative group active:translate-y-[2px] transition-all duration-100 cursor-pointer text-shadow-game-title"
          >
            <div className="absolute inset-x-0 -bottom-1 h-full rounded-xl bg-facebook-shadow -z-10 group-active:bottom-0 shadow-md text-shadow-game-title" />
            <div className="bg-facebook-bg border-2 border-facebook-shadow rounded-xl px-4 py-2.5 flex items-center justify-center gap-2 hover:bg-facebook-hover transition-colors text-shadow-game-title">
              <svg width="18" height="18" fill="#ffffff" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
              <span className="text-white font-black text-xs uppercase tracking-wide text-shadow-game-title">
                Facebook
              </span>
            </div>
          </button>
        </div>
      </div>

      <div className="mt-8 text-white font-medium bg-ranking-table-bg/40 backdrop-blur-sm px-6 py-2.5 rounded-full border border-white/5 shadow-md text-shadow-game-title">
        Chưa có tài khoản?{" "}
        <Link
          href="/signup"
          className="text-orange-400 font-bold hover:underline hover:text-orange-300 ml-1 text-shadow-game-title"
        >
          Đăng ký ngay!
        </Link>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify it compiles**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/auth/login-form.tsx
git commit -m "feat: wire login form to real auth API"
```

---

### Task 7: Rewrite the signup form

**Files:**
- Modify: `src/components/auth/signup-form.tsx` (full rewrite)

The backend's `RegisterDto` requires `username` (no equivalent field exists in the current dummy form) and has no phone-based anything. `email` is technically optional on the backend, but an account with no email can never use forgot-password — the frontend requires it to avoid users creating unrecoverable accounts. The `phone` field is dropped (backend accepts it but nothing depends on it, and the current dummy validation on it doesn't correspond to any real backend rule).

- [ ] **Step 1: Replace the entire file**

```tsx
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { GameButton } from "@/components/ui/game-button";
import { GameInput } from "@/components/ui/game-input";
import { useRegister } from "@/hooks/auth";
import { ApiError } from "@/lib/api-client";

const signupSchema = z
  .object({
    username: z
      .string()
      .min(3, "Tên đăng nhập tối thiểu 3 ký tự")
      .max(50, "Tên đăng nhập tối đa 50 ký tự"),
    fullName: z.string().min(1, "Vui lòng nhập họ tên"),
    email: z.string().email("Email không hợp lệ"),
    password: z.string().min(8, "Mật khẩu tối thiểu 8 ký tự").max(72, "Mật khẩu tối đa 72 ký tự"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Mật khẩu nhập lại không khớp",
    path: ["confirmPassword"],
  });

type SignupFormValues = z.infer<typeof signupSchema>;

export function SignupForm(): React.ReactElement {
  const router = useRouter();
  const registerUser = useRegister();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormValues>({ resolver: zodResolver(signupSchema) });

  const onSubmit = (values: SignupFormValues): void => {
    registerUser.mutate(
      {
        username: values.username,
        password: values.password,
        fullName: values.fullName,
        email: values.email,
      },
      { onSuccess: () => router.push("/") },
    );
  };

  const errorMessage =
    registerUser.error instanceof ApiError
      ? registerUser.error.message
      : registerUser.error
        ? "Đã có lỗi xảy ra, vui lòng thử lại."
        : null;

  return (
    <div className="w-full max-w-[500px] flex flex-col items-center text-shadow-game-title">
      <div className="w-full bg-ranking-table-bg backdrop-blur-md border-3 border-ranking-table-border rounded-[2rem] p-8 md:p-10 shadow-[0_15px_30px_rgba(0,0,0,0.5)] text-shadow-game-title">
        <h1 className="text-4xl md:text-5xl font-black uppercase text-center text-white tracking-wider mb-8 font-heading text-shadow-game-title">
          ĐĂNG KÝ
        </h1>

        {errorMessage && (
          <div className="mb-6 p-3 rounded-xl border border-red-500/30 bg-red-500/10 text-red-400 text-xs font-bold text-center text-shadow-game-title">
            {errorMessage}
          </div>
        )}

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="w-full flex flex-col gap-5 text-shadow-game-title"
        >
          <div className="w-full text-shadow-game-title">
            <label className="block text-white/80 font-bold text-xs md:text-sm mb-2 ml-1 tracking-wide uppercase text-shadow-game-title">
              Tên đăng nhập
            </label>
            <GameInput type="text" placeholder="Tên đăng nhập" {...register("username")} />
            {errors.username && (
              <p className="mt-1.5 ml-1 text-red-400 text-xs font-bold">{errors.username.message}</p>
            )}
          </div>

          <div className="w-full text-shadow-game-title">
            <label className="block text-white/80 font-bold text-xs md:text-sm mb-2 ml-1 tracking-wide uppercase text-shadow-game-title">
              Họ và tên
            </label>
            <GameInput type="text" placeholder="Nhập họ và tên" {...register("fullName")} />
            {errors.fullName && (
              <p className="mt-1.5 ml-1 text-red-400 text-xs font-bold">{errors.fullName.message}</p>
            )}
          </div>

          <div className="w-full text-shadow-game-title">
            <label className="block text-white/80 font-bold text-xs md:text-sm mb-2 ml-1 tracking-wide uppercase text-shadow-game-title">
              Email
            </label>
            <GameInput type="email" placeholder="Nhập email" {...register("email")} />
            {errors.email && (
              <p className="mt-1.5 ml-1 text-red-400 text-xs font-bold">{errors.email.message}</p>
            )}
          </div>

          <div className="w-full text-shadow-game-title">
            <label className="block text-white/80 font-bold text-xs md:text-sm mb-2 ml-1 tracking-wide uppercase text-shadow-game-title">
              Mật khẩu
            </label>
            <GameInput type="password" placeholder="Mật khẩu (tối thiểu 8 ký tự)" {...register("password")} />
            {errors.password && (
              <p className="mt-1.5 ml-1 text-red-400 text-xs font-bold">{errors.password.message}</p>
            )}
          </div>

          <div className="w-full text-shadow-game-title">
            <label className="block text-white/80 font-bold text-xs md:text-sm mb-2 ml-1 tracking-wide uppercase text-shadow-game-title">
              Nhập lại mật khẩu
            </label>
            <GameInput
              type="password"
              placeholder="Xác nhận mật khẩu"
              {...register("confirmPassword")}
            />
            {errors.confirmPassword && (
              <p className="mt-1.5 ml-1 text-red-400 text-xs font-bold">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          <div className="mt-4 flex justify-center text-shadow-game-title">
            <GameButton
              className="w-full max-w-[260px] text-shadow-game-title"
              type="submit"
              variant="cta"
              disabled={registerUser.isPending}
            >
              {registerUser.isPending ? "ĐANG ĐĂNG KÝ..." : "ĐĂNG KÝ NGAY"}
            </GameButton>
          </div>
        </form>

        <div className="relative my-8 flex items-center justify-center text-shadow-game-title">
          <div className="absolute inset-0 flex items-center text-shadow-game-title">
            <div className="w-full border-t border-white/10 text-shadow-game-title"></div>
          </div>
          <span className="relative bg-ranking-table-bg px-4 text-xs font-bold text-white/40 uppercase tracking-widest text-shadow-game-title">
            Hoặc đăng ký với
          </span>
        </div>

        <div className="flex gap-4 items-center justify-center text-shadow-game-title">
          <button
            type="button"
            className="flex-1 max-w-[140px] relative group active:translate-y-[2px] transition-all duration-100 cursor-pointer text-shadow-game-title"
          >
            <div className="absolute inset-x-0 -bottom-1 h-full rounded-xl bg-gray-300 -z-10 group-active:bottom-0 shadow-md text-shadow-game-title" />
            <div className="bg-white border-2 border-gray-200 rounded-xl px-4 py-2.5 flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors text-shadow-game-title">
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              <span className="text-gray-700 font-black text-xs uppercase tracking-wide text-shadow-game-title">
                Google
              </span>
            </div>
          </button>

          <button
            type="button"
            className="flex-1 max-w-[140px] relative group active:translate-y-[2px] transition-all duration-100 cursor-pointer text-shadow-game-title"
          >
            <div className="absolute inset-x-0 -bottom-1 h-full rounded-xl bg-facebook-shadow -z-10 group-active:bottom-0 shadow-md text-shadow-game-title" />
            <div className="bg-facebook-bg border-2 border-facebook-shadow rounded-xl px-4 py-2.5 flex items-center justify-center gap-2 hover:bg-facebook-hover transition-colors text-shadow-game-title">
              <svg width="18" height="18" fill="#ffffff" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
              <span className="text-white font-black text-xs uppercase tracking-wide text-shadow-game-title">
                Facebook
              </span>
            </div>
          </button>
        </div>
      </div>

      <div className="mt-8 text-white font-medium bg-ranking-table-bg/40 backdrop-blur-sm px-6 py-2.5 rounded-full border border-white/5 shadow-md text-shadow-game-title">
        Đã có tài khoản?{" "}
        <Link
          href="/login"
          className="text-blue-300 font-bold hover:underline hover:text-blue-200 ml-1 text-shadow-game-title"
        >
          Đăng nhập ngay!
        </Link>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify it compiles**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/auth/signup-form.tsx
git commit -m "feat: wire signup form to real auth API"
```

---

### Task 8: Forgot-password page

**Files:**
- Create: `src/components/auth/forgot-password-form.tsx`
- Create: `src/app/forgot-password/page.tsx`
- Modify: `src/components/auth/index.ts`

- [ ] **Step 1: Write the form**

```tsx
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { GameButton } from "@/components/ui/game-button";
import { GameInput } from "@/components/ui/game-input";
import { useForgotPassword } from "@/hooks/auth";
import { ApiError } from "@/lib/api-client";

const forgotPasswordSchema = z.object({
  email: z.string().email("Email không hợp lệ"),
});

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

export function ForgotPasswordForm(): React.ReactElement {
  const forgotPassword = useForgotPassword();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormValues>({ resolver: zodResolver(forgotPasswordSchema) });

  const onSubmit = (values: ForgotPasswordFormValues): void => {
    forgotPassword.mutate(values);
  };

  const errorMessage =
    forgotPassword.error instanceof ApiError
      ? forgotPassword.error.message
      : forgotPassword.error
        ? "Đã có lỗi xảy ra, vui lòng thử lại."
        : null;

  return (
    <div className="w-full max-w-[500px] flex flex-col items-center text-shadow-game-title">
      <div className="w-full bg-ranking-table-bg backdrop-blur-md border-3 border-ranking-table-border rounded-[2rem] p-8 md:p-10 shadow-[0_15px_30px_rgba(0,0,0,0.5)] text-shadow-game-title">
        <h1 className="text-3xl md:text-4xl font-black uppercase text-center text-white tracking-wider mb-4 font-heading text-shadow-game-title">
          QUÊN MẬT KHẨU
        </h1>
        <p className="text-center text-white/70 text-xs md:text-sm mb-8">
          Nhập email đã đăng ký, chúng tôi sẽ gửi hướng dẫn đặt lại mật khẩu.
        </p>

        {errorMessage && (
          <div className="mb-6 p-3 rounded-xl border border-red-500/30 bg-red-500/10 text-red-400 text-xs font-bold text-center">
            {errorMessage}
          </div>
        )}

        {forgotPassword.isSuccess && (
          <div className="mb-6 p-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-xs font-bold text-center">
            {forgotPassword.data.message}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="w-full flex flex-col gap-6">
          <div className="w-full">
            <label className="block text-white/80 font-bold text-xs md:text-sm mb-2 ml-1 tracking-wide uppercase">
              Email
            </label>
            <GameInput type="email" placeholder="Email đã đăng ký" {...register("email")} />
            {errors.email && (
              <p className="mt-1.5 ml-1 text-red-400 text-xs font-bold">{errors.email.message}</p>
            )}
          </div>

          <div className="mt-4 flex justify-center">
            <GameButton
              className="w-full max-w-[260px]"
              type="submit"
              variant="primary"
              disabled={forgotPassword.isPending}
            >
              {forgotPassword.isPending ? "ĐANG GỬI..." : "GỬI YÊU CẦU"}
            </GameButton>
          </div>
        </form>
      </div>

      <div className="mt-8 text-white font-medium bg-ranking-table-bg/40 backdrop-blur-sm px-6 py-2.5 rounded-full border border-white/5 shadow-md">
        Nhớ mật khẩu rồi?{" "}
        <Link href="/login" className="text-blue-300 font-bold hover:underline hover:text-blue-200 ml-1">
          Đăng nhập ngay!
        </Link>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Write the page**

```tsx
import type { Metadata } from "next";
import Image from "next/image";

import { ForgotPasswordForm } from "@/components/auth";
import { APP_NAME } from "@/constants";

export const metadata: Metadata = {
  title: "Quên mật khẩu",
  description: `Đặt lại mật khẩu tài khoản ${APP_NAME} qua email.`,
  keywords: ["quên mật khẩu", "đặt lại mật khẩu", APP_NAME],
  alternates: { canonical: "/forgot-password" },
  openGraph: {
    title: "Quên mật khẩu",
    description: `Đặt lại mật khẩu tài khoản ${APP_NAME} qua email.`,
  },
};

export default function ForgotPasswordPage(): React.ReactElement {
  return (
    <main className="min-h-screen relative flex items-center justify-center overflow-hidden bg-page-bg px-4 py-12">
      <div className="absolute inset-0 z-0">
        <Image
          src="/clone-assets/bg.1e17df80.png"
          alt="Space Background"
          fill
          className="object-cover"
          priority
        />
      </div>
      <div className="relative z-10">
        <ForgotPasswordForm />
      </div>
    </main>
  );
}
```

- [ ] **Step 3: Add the barrel export**

`src/components/auth/index.ts` — replace the file with:
```typescript
export * from "./login-form";
export * from "./signup-form";
export * from "./forgot-password-form";
```

- [ ] **Step 4: Verify it compiles**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add src/components/auth/forgot-password-form.tsx src/app/forgot-password/page.tsx src/components/auth/index.ts
git commit -m "feat: add forgot-password page"
```

---

### Task 9: Reset-password page

**Files:**
- Create: `src/components/auth/reset-password-form.tsx`
- Create: `src/app/reset-password/page.tsx`
- Modify: `src/components/auth/index.ts`

The backend's reset email currently sends the raw token as plain text, not a clickable link, so the token field is always user-editable. An optional `?token=` search param pre-fills it — forward-compatible with a future emailed link, not load-bearing today.

- [ ] **Step 1: Write the form**

```tsx
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { GameButton } from "@/components/ui/game-button";
import { GameInput } from "@/components/ui/game-input";
import { useResetPassword } from "@/hooks/auth";
import { ApiError } from "@/lib/api-client";

const resetPasswordSchema = z
  .object({
    token: z.string().min(1, "Vui lòng nhập mã đặt lại mật khẩu"),
    newPassword: z.string().min(8, "Mật khẩu tối thiểu 8 ký tự").max(72, "Mật khẩu tối đa 72 ký tự"),
    confirmNewPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "Mật khẩu nhập lại không khớp",
    path: ["confirmNewPassword"],
  });

type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

export interface ResetPasswordFormProps {
  initialToken: string;
}

export function ResetPasswordForm({ initialToken }: ResetPasswordFormProps): React.ReactElement {
  const router = useRouter();
  const resetPassword = useResetPassword();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { token: initialToken, newPassword: "", confirmNewPassword: "" },
  });

  const onSubmit = (values: ResetPasswordFormValues): void => {
    resetPassword.mutate(
      { token: values.token, newPassword: values.newPassword },
      { onSuccess: () => router.push("/login?resetSuccess=1") },
    );
  };

  const errorMessage =
    resetPassword.error instanceof ApiError
      ? resetPassword.error.message
      : resetPassword.error
        ? "Đã có lỗi xảy ra, vui lòng thử lại."
        : null;

  return (
    <div className="w-full max-w-[500px] flex flex-col items-center text-shadow-game-title">
      <div className="w-full bg-ranking-table-bg backdrop-blur-md border-3 border-ranking-table-border rounded-[2rem] p-8 md:p-10 shadow-[0_15px_30px_rgba(0,0,0,0.5)]">
        <h1 className="text-3xl md:text-4xl font-black uppercase text-center text-white tracking-wider mb-8 font-heading">
          ĐẶT LẠI MẬT KHẨU
        </h1>

        {errorMessage && (
          <div className="mb-6 p-3 rounded-xl border border-red-500/30 bg-red-500/10 text-red-400 text-xs font-bold text-center">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="w-full flex flex-col gap-5">
          <div className="w-full">
            <label className="block text-white/80 font-bold text-xs md:text-sm mb-2 ml-1 tracking-wide uppercase">
              Mã đặt lại mật khẩu
            </label>
            <GameInput type="text" placeholder="Dán mã từ email vào đây" {...register("token")} />
            {errors.token && (
              <p className="mt-1.5 ml-1 text-red-400 text-xs font-bold">{errors.token.message}</p>
            )}
          </div>

          <div className="w-full">
            <label className="block text-white/80 font-bold text-xs md:text-sm mb-2 ml-1 tracking-wide uppercase">
              Mật khẩu mới
            </label>
            <GameInput type="password" placeholder="Mật khẩu mới" {...register("newPassword")} />
            {errors.newPassword && (
              <p className="mt-1.5 ml-1 text-red-400 text-xs font-bold">{errors.newPassword.message}</p>
            )}
          </div>

          <div className="w-full">
            <label className="block text-white/80 font-bold text-xs md:text-sm mb-2 ml-1 tracking-wide uppercase">
              Nhập lại mật khẩu mới
            </label>
            <GameInput
              type="password"
              placeholder="Nhập lại mật khẩu mới"
              {...register("confirmNewPassword")}
            />
            {errors.confirmNewPassword && (
              <p className="mt-1.5 ml-1 text-red-400 text-xs font-bold">
                {errors.confirmNewPassword.message}
              </p>
            )}
          </div>

          <div className="mt-4 flex justify-center">
            <GameButton
              className="w-full max-w-[260px]"
              type="submit"
              variant="primary"
              disabled={resetPassword.isPending}
            >
              {resetPassword.isPending ? "ĐANG XỬ LÝ..." : "ĐẶT LẠI MẬT KHẨU"}
            </GameButton>
          </div>
        </form>
      </div>

      <div className="mt-8 text-white font-medium bg-ranking-table-bg/40 backdrop-blur-sm px-6 py-2.5 rounded-full border border-white/5 shadow-md">
        <Link href="/login" className="text-blue-300 font-bold hover:underline hover:text-blue-200">
          Quay lại đăng nhập
        </Link>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Write the page**

Next.js 16's App Router passes `searchParams` as a `Promise` to page components.

```tsx
import type { Metadata } from "next";
import Image from "next/image";

import { ResetPasswordForm } from "@/components/auth";

export const metadata: Metadata = {
  title: "Đặt lại mật khẩu",
  description: "Đặt lại mật khẩu tài khoản bằng mã đã nhận qua email.",
  keywords: ["đặt lại mật khẩu", "reset password"],
  alternates: { canonical: "/reset-password" },
  openGraph: {
    title: "Đặt lại mật khẩu",
    description: "Đặt lại mật khẩu tài khoản bằng mã đã nhận qua email.",
  },
};

interface ResetPasswordPageProps {
  searchParams: Promise<{ token?: string }>;
}

export default async function ResetPasswordPage({
  searchParams,
}: ResetPasswordPageProps): Promise<React.ReactElement> {
  const { token } = await searchParams;

  return (
    <main className="min-h-screen relative flex items-center justify-center overflow-hidden bg-page-bg px-4 py-12">
      <div className="absolute inset-0 z-0">
        <Image
          src="/clone-assets/bg.1e17df80.png"
          alt="Space Background"
          fill
          className="object-cover"
          priority
        />
      </div>
      <div className="relative z-10">
        <ResetPasswordForm initialToken={token ?? ""} />
      </div>
    </main>
  );
}
```

- [ ] **Step 3: Add the barrel export**

`src/components/auth/index.ts` — replace with:
```typescript
export * from "./login-form";
export * from "./signup-form";
export * from "./forgot-password-form";
export * from "./reset-password-form";
```

- [ ] **Step 4: Verify it compiles**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add src/components/auth/reset-password-form.tsx src/app/reset-password/page.tsx src/components/auth/index.ts
git commit -m "feat: add reset-password page"
```

---

### Task 10: Change-password (account) page

**Files:**
- Create: `src/components/auth/require-auth.tsx`
- Create: `src/components/auth/change-password-form.tsx`
- Create: `src/app/account/change-password/page.tsx`
- Modify: `src/components/auth/index.ts`

`RequireAuth` is a small reusable guard — any future protected page needs the same check, so it's a genuine shared primitive, not speculative abstraction for a single call site.

- [ ] **Step 1: Write `RequireAuth`**

```tsx
"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { useAuthStore } from "@/store/auth-store";

export interface RequireAuthProps {
  children: React.ReactNode;
}

export function RequireAuth({ children }: RequireAuthProps): React.ReactElement | null {
  const router = useRouter();
  const status = useAuthStore((state) => state.status);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login");
    }
  }, [status, router]);

  if (status !== "authenticated") {
    return null;
  }

  return <>{children}</>;
}
```

- [ ] **Step 2: Write the change-password form**

```tsx
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { GameButton } from "@/components/ui/game-button";
import { GameInput } from "@/components/ui/game-input";
import { useChangePassword } from "@/hooks/auth";
import { ApiError } from "@/lib/api-client";

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Vui lòng nhập mật khẩu hiện tại"),
    newPassword: z.string().min(8, "Mật khẩu tối thiểu 8 ký tự").max(72, "Mật khẩu tối đa 72 ký tự"),
    confirmNewPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "Mật khẩu nhập lại không khớp",
    path: ["confirmNewPassword"],
  });

type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>;

export function ChangePasswordForm(): React.ReactElement {
  const changePassword = useChangePassword();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ChangePasswordFormValues>({ resolver: zodResolver(changePasswordSchema) });

  const onSubmit = (values: ChangePasswordFormValues): void => {
    changePassword.mutate(
      { currentPassword: values.currentPassword, newPassword: values.newPassword },
      { onSuccess: () => reset() },
    );
  };

  const errorMessage =
    changePassword.error instanceof ApiError
      ? changePassword.error.message
      : changePassword.error
        ? "Đã có lỗi xảy ra, vui lòng thử lại."
        : null;

  return (
    <div className="w-full max-w-[500px] flex flex-col items-center">
      <div className="w-full bg-ranking-table-bg backdrop-blur-md border-3 border-ranking-table-border rounded-[2rem] p-8 md:p-10 shadow-[0_15px_30px_rgba(0,0,0,0.5)]">
        <h1 className="text-3xl md:text-4xl font-black uppercase text-center text-white tracking-wider mb-8 font-heading">
          ĐỔI MẬT KHẨU
        </h1>

        {errorMessage && (
          <div className="mb-6 p-3 rounded-xl border border-red-500/30 bg-red-500/10 text-red-400 text-xs font-bold text-center">
            {errorMessage}
          </div>
        )}

        {changePassword.isSuccess && (
          <div className="mb-6 p-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-xs font-bold text-center">
            Đổi mật khẩu thành công. Các thiết bị khác đã bị đăng xuất.
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="w-full flex flex-col gap-5">
          <div className="w-full">
            <label className="block text-white/80 font-bold text-xs md:text-sm mb-2 ml-1 tracking-wide uppercase">
              Mật khẩu hiện tại
            </label>
            <GameInput type="password" placeholder="Mật khẩu hiện tại" {...register("currentPassword")} />
            {errors.currentPassword && (
              <p className="mt-1.5 ml-1 text-red-400 text-xs font-bold">
                {errors.currentPassword.message}
              </p>
            )}
          </div>

          <div className="w-full">
            <label className="block text-white/80 font-bold text-xs md:text-sm mb-2 ml-1 tracking-wide uppercase">
              Mật khẩu mới
            </label>
            <GameInput type="password" placeholder="Mật khẩu mới" {...register("newPassword")} />
            {errors.newPassword && (
              <p className="mt-1.5 ml-1 text-red-400 text-xs font-bold">{errors.newPassword.message}</p>
            )}
          </div>

          <div className="w-full">
            <label className="block text-white/80 font-bold text-xs md:text-sm mb-2 ml-1 tracking-wide uppercase">
              Nhập lại mật khẩu mới
            </label>
            <GameInput
              type="password"
              placeholder="Nhập lại mật khẩu mới"
              {...register("confirmNewPassword")}
            />
            {errors.confirmNewPassword && (
              <p className="mt-1.5 ml-1 text-red-400 text-xs font-bold">
                {errors.confirmNewPassword.message}
              </p>
            )}
          </div>

          <div className="mt-4 flex justify-center">
            <GameButton
              className="w-full max-w-[260px]"
              type="submit"
              variant="primary"
              disabled={changePassword.isPending}
            >
              {changePassword.isPending ? "ĐANG XỬ LÝ..." : "ĐỔI MẬT KHẨU"}
            </GameButton>
          </div>
        </form>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Write the page**

```tsx
import type { Metadata } from "next";

import { ChangePasswordForm, RequireAuth } from "@/components/auth";

export const metadata: Metadata = {
  title: "Đổi mật khẩu",
  description: "Đổi mật khẩu tài khoản của bạn.",
  keywords: ["đổi mật khẩu", "tài khoản"],
  alternates: { canonical: "/account/change-password" },
  openGraph: {
    title: "Đổi mật khẩu",
    description: "Đổi mật khẩu tài khoản của bạn.",
  },
};

export default function ChangePasswordPage(): React.ReactElement {
  return (
    <main className="min-h-screen flex items-center justify-center bg-page-bg px-4 py-12">
      <RequireAuth>
        <ChangePasswordForm />
      </RequireAuth>
    </main>
  );
}
```

- [ ] **Step 4: Add the barrel export**

`src/components/auth/index.ts` — replace with:
```typescript
export * from "./login-form";
export * from "./signup-form";
export * from "./forgot-password-form";
export * from "./reset-password-form";
export * from "./change-password-form";
export * from "./require-auth";
```

- [ ] **Step 5: Verify it compiles**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 6: Commit**

```bash
git add src/components/auth/require-auth.tsx src/components/auth/change-password-form.tsx src/app/account/change-password/page.tsx src/components/auth/index.ts
git commit -m "feat: add change-password account page"
```

---

### Task 11: Session-aware Topbar and ROUTES

**Files:**
- Modify: `src/components/layout/topbar.tsx`
- Modify: `src/constants/index.ts`

- [ ] **Step 1: Add the new routes**

Read `src/constants/index.ts` first (small file, full replacement is simplest). Replace its contents with:

```typescript
export const APP_NAME = 'English Game'
export const APP_DESCRIPTION =
  'English Game — placeholder description, update once the product direction is defined.'

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  SIGNUP: '/signup',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  ACCOUNT_CHANGE_PASSWORD: '/account/change-password',
  ADMIN_EXAM: '/admin/exam',
  ADMIN_EXAM_DETAIL: '/admin/exam/[id]',
  WRITE_TEST: '/write/[slug]',
  WRITE_RESULT: '/write/result/[id]',
  SPEAKING_TEST: '/speaking/[slug]',
  SPEAKING_RESULT: '/speaking/result/[id]',
  SPEAKING_PREVIEW: '/speaking/result/[id]/preview',
} as const

/** Đề mock duy nhất hiện có — liên kết tạm cho nút Writing/Speaking trên topbar, thay bằng danh sách đề từ API khi có. */
export const DEMO_WRITE_TEST_PATH = '/write/FLYERS-Writing-Test-1'
export const DEMO_SPEAKING_TEST_PATH = '/speaking/1392caf3-444d-431a-b0ec-baf39eba25fb'
```

- [ ] **Step 2: Make the Topbar session-aware**

Read `src/components/layout/topbar.tsx` first — this is a targeted edit to one existing file, not a full rewrite (it's 330+ lines; only the imports and the CENTER SECTION change).

Find this import block near the top:
```tsx
import { ChevronDown, Plus, Trophy, BookOpen, School, ClipboardList } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";

import { DEMO_SPEAKING_TEST_PATH, DEMO_WRITE_TEST_PATH } from "@/constants";
import { cn } from "@/lib/utils";
```

Replace it with:
```tsx
import { ChevronDown, Plus, Trophy, BookOpen, School, ClipboardList } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { useState } from "react";

import { DEMO_SPEAKING_TEST_PATH, DEMO_WRITE_TEST_PATH } from "@/constants";
import { useLogout } from "@/hooks/auth";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/auth-store";
```

Find this (inside `export function Topbar()`, right after the `pathname` line):
```tsx
export function Topbar() {
  const router = useRouter();
  const pathname = usePathname();

  const handleLogin = () => {
    router.push("/login");
  };

  const handleRanking = () => {
    router.push("/ranking");
  };
```

Replace it with:
```tsx
export function Topbar() {
  const router = useRouter();
  const pathname = usePathname();
  const status = useAuthStore((state) => state.status);
  const user = useAuthStore((state) => state.user);
  const logout = useLogout();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogin = () => {
    router.push("/login");
  };

  const handleSignup = () => {
    router.push("/signup");
  };

  const handleRanking = () => {
    router.push("/ranking");
  };
```

Find the entire CENTER SECTION block:
```tsx
        {/* ================= CENTER SECTION ================= */}
        {/* Beautiful 3D Auth Control Box */}
        <div className="flex justify-center shrink-0 mx-auto lg:mx-0">
          <div className="bg-topbar-auth-bg/90 backdrop-blur-md border-3 border-ranking-table-border rounded-2xl p-2 w-[160px] md:w-[180px] flex flex-col gap-1.5 shadow-[0_8px_16px_rgba(0,0,0,0.5)] transform -translate-y-1">
            {/* Đăng Nhập Button */}
            <button 
              onClick={handleLogin}
              className="relative group active:translate-y-[2px] transition-all cursor-pointer w-full text-center"
            >
              <div className="absolute inset-x-0 -bottom-0.5 h-full rounded-lg bg-topbar-login-shadow -z-10 group-active:bottom-0" />
              <div className="bg-topbar-login-bg border border-topbar-login-border text-white font-black text-[10px] md:text-xs py-1 px-3 rounded-lg uppercase tracking-wider hover:bg-blue-500">
                Đăng Nhập
              </div>
            </button>

            {/* Đăng Ký Button */}
            <button 
              className="relative group active:translate-y-[2px] transition-all cursor-pointer w-full text-center"
            >
              <div className="absolute inset-x-0 -bottom-0.5 h-full rounded-lg bg-topbar-signup-shadow -z-10 group-active:bottom-0" />
              <div className="bg-topbar-signup-bg border border-topbar-signup-border text-white font-black text-[10px] md:text-xs py-1 px-3 rounded-lg uppercase tracking-wider hover:bg-red-500">
                Đăng Ký
              </div>
            </button>
          </div>
        </div>
```

Replace it with (note the "Đăng Ký" button now has an `onClick` — it had none before, a pre-existing dead button being fixed while this exact area is already being touched):
```tsx
        {/* ================= CENTER SECTION ================= */}
        {/* Beautiful 3D Auth Control Box */}
        <div className="flex justify-center shrink-0 mx-auto lg:mx-0">
          {status === "authenticated" && user ? (
            <div className="relative">
              <button
                onClick={() => setMenuOpen((open) => !open)}
                className="bg-topbar-auth-bg/90 backdrop-blur-md border-3 border-ranking-table-border rounded-2xl px-4 py-2 flex items-center gap-2 shadow-[0_8px_16px_rgba(0,0,0,0.5)] transform -translate-y-1 cursor-pointer"
              >
                <span className="text-white font-black text-xs md:text-sm uppercase tracking-wide">
                  {user.role}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-blue-300" />
              </button>

              {menuOpen && (
                <div className="absolute top-full mt-2 right-0 bg-topbar-auth-bg border-2 border-ranking-table-border rounded-xl overflow-hidden shadow-lg z-50 min-w-[160px]">
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      router.push("/account/change-password");
                    }}
                    className="w-full text-left px-4 py-2.5 text-white text-xs font-bold hover:bg-white/10 transition-colors cursor-pointer"
                  >
                    Đổi mật khẩu
                  </button>
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      logout.mutate(undefined, { onSuccess: () => router.push("/") });
                    }}
                    className="w-full text-left px-4 py-2.5 text-white text-xs font-bold hover:bg-white/10 transition-colors cursor-pointer"
                  >
                    Đăng xuất
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-topbar-auth-bg/90 backdrop-blur-md border-3 border-ranking-table-border rounded-2xl p-2 w-[160px] md:w-[180px] flex flex-col gap-1.5 shadow-[0_8px_16px_rgba(0,0,0,0.5)] transform -translate-y-1">
              {/* Đăng Nhập Button */}
              <button 
                onClick={handleLogin}
                className="relative group active:translate-y-[2px] transition-all cursor-pointer w-full text-center"
              >
                <div className="absolute inset-x-0 -bottom-0.5 h-full rounded-lg bg-topbar-login-shadow -z-10 group-active:bottom-0" />
                <div className="bg-topbar-login-bg border border-topbar-login-border text-white font-black text-[10px] md:text-xs py-1 px-3 rounded-lg uppercase tracking-wider hover:bg-blue-500">
                  Đăng Nhập
                </div>
              </button>

              {/* Đăng Ký Button */}
              <button 
                onClick={handleSignup}
                className="relative group active:translate-y-[2px] transition-all cursor-pointer w-full text-center"
              >
                <div className="absolute inset-x-0 -bottom-0.5 h-full rounded-lg bg-topbar-signup-shadow -z-10 group-active:bottom-0" />
                <div className="bg-topbar-signup-bg border border-topbar-signup-border text-white font-black text-[10px] md:text-xs py-1 px-3 rounded-lg uppercase tracking-wider hover:bg-red-500">
                  Đăng Ký
                </div>
              </button>
            </div>
          )}
        </div>
```

- [ ] **Step 3: Verify it compiles**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add src/components/layout/topbar.tsx src/constants/index.ts
git commit -m "feat: make Topbar session-aware, add auth routes"
```

---

### Task 12: Unit tests for the API client

**Files:**
- Create: `src/lib/api-client.test.ts`

- [ ] **Step 1: Write the tests**

```typescript
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { apiFetch, authFetch, ApiError } from "@/lib/api-client";
import { useAuthStore } from "@/store/auth-store";

describe("authFetch", () => {
  beforeEach(() => {
    useAuthStore.setState({
      accessToken: "old-token",
      user: { id: 1, role: "STUDENT" },
      status: "authenticated",
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    useAuthStore.setState({ accessToken: null, user: null, status: "idle" });
  });

  it("retries once with a new token after a 401", async () => {
    const fetchMock = vi.fn();
    fetchMock.mockResolvedValueOnce(
      new Response(JSON.stringify({ message: "expired" }), { status: 401 }),
    );
    fetchMock.mockResolvedValueOnce(
      new Response(
        JSON.stringify({ accessToken: "new-token", user: { id: 1, role: "STUDENT" } }),
        { status: 200 },
      ),
    );
    fetchMock.mockResolvedValueOnce(new Response(JSON.stringify({ ok: true }), { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    const result = await authFetch<{ ok: boolean }>("/auth/change-password", { method: "POST" });

    expect(result).toEqual({ ok: true });
    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(useAuthStore.getState().accessToken).toBe("new-token");

    const retryInit = fetchMock.mock.calls[2][1] as RequestInit;
    const retryHeaders = new Headers(retryInit.headers);
    expect(retryHeaders.get("Authorization")).toBe("Bearer new-token");
  });

  it("dedupes concurrent 401s into a single refresh call", async () => {
    const fetchMock = vi.fn();
    fetchMock.mockResolvedValueOnce(
      new Response(JSON.stringify({ message: "expired" }), { status: 401 }),
    );
    fetchMock.mockResolvedValueOnce(
      new Response(JSON.stringify({ message: "expired" }), { status: 401 }),
    );
    fetchMock.mockResolvedValueOnce(
      new Response(
        JSON.stringify({ accessToken: "new-token", user: { id: 1, role: "STUDENT" } }),
        { status: 200 },
      ),
    );
    fetchMock.mockResolvedValueOnce(new Response(JSON.stringify({ ok: 1 }), { status: 200 }));
    fetchMock.mockResolvedValueOnce(new Response(JSON.stringify({ ok: 2 }), { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    await Promise.all([
      authFetch<{ ok: number }>("/auth/change-password", { method: "POST" }),
      authFetch<{ ok: number }>("/auth/change-password", { method: "POST" }),
    ]);

    // 2 initial 401s + exactly 1 refresh + 2 retries = 5 total fetch calls
    expect(fetchMock).toHaveBeenCalledTimes(5);
    const refreshCalls = fetchMock.mock.calls.filter((call) =>
      String(call[0]).includes("/auth/refresh"),
    );
    expect(refreshCalls).toHaveLength(1);
  });

  it("clears the session and rethrows the original error when refresh itself fails", async () => {
    const fetchMock = vi.fn();
    fetchMock.mockResolvedValueOnce(
      new Response(JSON.stringify({ message: "expired" }), { status: 401 }),
    );
    fetchMock.mockResolvedValueOnce(
      new Response(JSON.stringify({ message: "no cookie" }), { status: 401 }),
    );
    vi.stubGlobal("fetch", fetchMock);

    await expect(authFetch("/auth/change-password", { method: "POST" })).rejects.toThrow(ApiError);
    expect(useAuthStore.getState().status).toBe("unauthenticated");
    expect(useAuthStore.getState().accessToken).toBeNull();
  });
});

describe("apiFetch", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("throws ApiError with the backend's message on a non-2xx response", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ message: "Sai tài khoản hoặc mật khẩu" }), { status: 401 }),
      );
    vi.stubGlobal("fetch", fetchMock);

    await expect(apiFetch("/auth/login", { method: "POST" })).rejects.toMatchObject({
      status: 401,
      message: "Sai tài khoản hoặc mật khẩu",
    });
  });

  it("returns undefined for a 204 No Content response", async () => {
    const fetchMock = vi.fn().mockResolvedValueOnce(new Response(null, { status: 204 }));
    vi.stubGlobal("fetch", fetchMock);

    const result = await apiFetch("/auth/logout", { method: "POST" });
    expect(result).toBeUndefined();
  });
});
```

- [ ] **Step 2: Run the tests**

Run: `npm run test -- api-client`
Expected: all tests in `src/lib/api-client.test.ts` pass (5 tests total).

- [ ] **Step 3: Commit**

```bash
git add src/lib/api-client.test.ts
git commit -m "test: cover api-client 401 retry and refresh-dedup behavior"
```

---

### Task 13: End-to-end verification (both servers running)

**Files:** none (verification only)

- [ ] **Step 1: Start the backend**

From `D:\flyer-clone-backend\backend`: confirm MySQL (Laragon, `127.0.0.1:3306`, `root`/`root`, db `flyer_clone`) and Redis (`127.0.0.1:6379`) are reachable, restart MySQL via its usual `mysqld.exe` invocation if it's down (it has needed restarting several times this session — check `netstat -ano | grep :3306` first). Run `npm run start:dev` in the background, wait for `Nest application successfully started`. `.env` there already has real Gmail SMTP credentials configured from earlier work — do not touch them.

- [ ] **Step 2: Start the frontend**

From `D:\luyenthiao.com-Web`: run `npm run dev` in the background. Read the startup log for the actual port it bound to (it'll be `3001` if the backend already holds `3000`, but confirm from the log rather than assuming). Wait for `Ready` in the log.

- [ ] **Step 3: Drive the full loop with Playwright**

Playwright is already a devDependency. Write a throwaway script (not committed — delete it in Step 5) at the repo root, `verify-auth-e2e.ts`:

```typescript
import { chromium } from "playwright";

const FRONTEND_URL = "http://localhost:3001"; // adjust if Step 2 showed a different port
const TEST_USERNAME = `e2etest${Date.now()}`;
const TEST_EMAIL = "lamhoangan612@gmail.com"; // same inbox used for the backend's own SMTP verification
const TEST_PASSWORD = "OldPass123!";
const NEW_PASSWORD = "NewPass456!";

async function main() {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  console.log("1. Register...");
  await page.goto(`${FRONTEND_URL}/signup`);
  await page.fill('input[name="username"]', TEST_USERNAME);
  await page.fill('input[name="fullName"]', "E2E Test");
  await page.fill('input[name="email"]', TEST_EMAIL);
  await page.fill('input[name="password"]', TEST_PASSWORD);
  await page.fill('input[name="confirmPassword"]', TEST_PASSWORD);
  await page.click('button[type="submit"]');
  await page.waitForURL(FRONTEND_URL + "/", { timeout: 10000 });
  console.log("   Registered, redirected to home.");

  console.log("2. Topbar shows authenticated state...");
  await page.waitForSelector("text=STUDENT", { timeout: 5000 });
  console.log("   PASS — role badge visible.");

  console.log("3. Reload page, session should survive via bootstrap refresh...");
  await page.reload();
  await page.waitForSelector("text=STUDENT", { timeout: 5000 });
  console.log("   PASS — still authenticated after reload.");

  console.log("4. Logout...");
  await page.click("text=STUDENT");
  await page.click("text=Đăng xuất");
  await page.waitForSelector("text=Đăng Nhập", { timeout: 5000 });
  console.log("   PASS — back to logged-out Topbar.");

  console.log("5. Login again...");
  await page.goto(`${FRONTEND_URL}/login`);
  await page.fill('input[name="username"]', TEST_USERNAME);
  await page.fill('input[name="password"]', TEST_PASSWORD);
  await page.click('button[type="submit"]');
  await page.waitForURL(FRONTEND_URL + "/", { timeout: 10000 });
  await page.waitForSelector("text=STUDENT", { timeout: 5000 });
  console.log("   PASS — logged in again.");

  console.log("6. Forgot password (real email)...");
  await page.click("text=STUDENT");
  await page.click("text=Đăng xuất");
  await page.waitForSelector("text=Đăng Nhập");
  await page.goto(`${FRONTEND_URL}/forgot-password`);
  await page.fill('input[name="email"]', TEST_EMAIL);
  await page.click('button[type="submit"]');
  await page.waitForSelector("text=Nếu email tồn tại", { timeout: 5000 });
  console.log("   PASS — generic success message shown. Check the inbox manually for the token.");

  await browser.close();
  console.log("\nDone through step 6. Steps 7+ (reset-password with the real emailed token,");
  console.log("change-password session-exemption check) require the token from the inbox —");
  console.log("continue those manually or hand the token to the controller as Task 7 of the");
  console.log("backend plan did.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
```

Run: `npx tsx verify-auth-e2e.ts`

Expected: all six numbered steps print `PASS` (or reach step 6's completion message) with no thrown errors.

- [ ] **Step 4: Finish the loop with the real reset token**

Steps 1-6 prove register/login/logout/bootstrap-refresh/forgot-password all work against the real backend, driven through the actual frontend forms. This step needs the reset token from the real email triggered in step 6 — you cannot read that inbox yourself. **Stop here and report status NEEDS_CONTEXT**, telling the controller: "Please check `lamhoangan612@gmail.com`'s inbox for the password reset email and give me the token." Leave both dev servers running while you wait.

Once given the token, extend `verify-auth-e2e.ts` with a second `main`-style block (or a second script, `verify-auth-e2e-part2.ts`) that:
1. Navigates to `${FRONTEND_URL}/reset-password`, fills the `token` field with the given token and a new password (e.g. `NewPass456!`) into both password fields, submits, and waits for the redirect to `/login?resetSuccess=1`.
2. Logs in with the new password, waits for the `STUDENT` role badge (confirms the new password actually works).
3. Navigates to `${FRONTEND_URL}/account/change-password`, fills current password (`NewPass456!`) and a further-new password (e.g. `FinalPass000!`), submits, waits for the success message text ("Đổi mật khẩu thành công").
4. Logs out, then confirms logging in with `NewPass456!` now fails (the old password, from before the change) while `FinalPass000!` succeeds — proving `change-password` actually took effect end-to-end through the real frontend form.

Run it the same way (`npx tsx verify-auth-e2e-part2.ts`), confirm every step prints PASS with no thrown errors.

If a genuine bug is found in any step (this one or steps 1-6), debug it (read the relevant source file, form a hypothesis, fix it, re-verify from the start of the affected step), then commit the fix with a clear message.

- [ ] **Step 5: Clean up**

```bash
rm -f verify-auth-e2e.ts verify-auth-e2e-part2.ts
```

Stop both dev servers.

- [ ] **Step 6: If any step's actual output didn't match expected**, debug and fix per the note in Step 4. Otherwise, no commit is needed for this task beyond any fixes already committed in Step 4 — it's verification against already-committed code.

---

## Spec coverage check (self-review)

- Env var + API client + credentials:'include' → Task 1, Task 3
- Auth store, no persistence → Task 2
- 401 auto-refresh with single-flight dedup → Task 3, verified in Task 12
- Mutation hooks for all 6 endpoints → Task 4
- Session bootstrap on load → Task 5
- Login/signup forms rewired with react-hook-form+zod → Task 6, Task 7
- Forgot/reset password pages (previously missing, dead link fixed) → Task 8, Task 9
- Change-password page + route guard → Task 10
- Topbar session-awareness → Task 11
- Unit test scope (api-client only, per spec's Testing section) → Task 12
- Full end-to-end real-server verification → Task 13
- `phone` field dropped from signup, `username` added, `email` made required (judgment calls) → Task 7, documented inline
