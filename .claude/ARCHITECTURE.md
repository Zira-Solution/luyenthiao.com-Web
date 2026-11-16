# Architecture — luyenthiao.com-Web

## Overview

Next.js App Router client for luyenthiao.com (online English test preparation). The Next.js project is
`src/`; run every npm command there. Backend: `luyenthiao.com-Backend` (NestJS). Only authentication is
wired to the backend; exams, history, notebook, ranking, tasks, speaking and writing use `src/mocks/` (JSON and typed `.ts` modules),
`localStorage` or constants inside the page. Known defects and baselines: `docs/03-known-issues.md`.

## Stack (from `src/package.json`)

| Layer | Choice |
|---|---|
| Runtime | Node 22.22.2+ or 24.15.0+ (`engines` in `package.json`, required by `jsdom` 30), npm; CI on Node 24 |
| Framework | Next.js 16.1.6 (App Router), React 19.2.3, `output: 'standalone'` |
| Language | TypeScript strict |
| Styling | Tailwind CSS v4 (`@theme` tokens in `app/globals.css`), shadcn-style primitives on `@base-ui/react` |
| Server data | TanStack Query 5 |
| Client state | Zustand 5 |
| Validation / forms | Zod 4, react-hook-form |
| Tests | Vitest 4 + Testing Library (jsdom), tests next to the module |
| Lint / format | ESLint 9 flat config (`import-x/order`), Prettier (`src/.prettierrc`, `src/.prettierignore`) |

## Hosting: Vercel, not Amplify

This app runs on **Vercel** (project `ziratech/luyenthiao-com-web`, Root Directory `src`; details in
`docs/04-deploy-vercel.md`). Zoney.vn-Web — the sibling project this repo was scaffolded from in
`8513d4a` and whose conventions several rules still mirror — runs on **AWS Amplify**. The two hosts do
not support the same Next.js features, so never carry a rendering decision over from Zoney without
checking the table below.

| Capability | Vercel | Amplify Hosting compute |
|---|---|---|
| Next.js version supported | current (this repo: 16.1.6) | up through 15 |
| Streaming SSR — `loading.tsx`, `<Suspense>`, React Server Components | yes | **no** (listed under "Unsupported features") |
| On-demand ISR | yes | no |
| Edge middleware | yes | no (Edge API routes only) |
| `after()` / `unstable_after` | yes | no |

Sources: [Next.js on Vercel → Streaming](https://vercel.com/docs/frameworks/full-stack/nextjs#streaming)
and [Amplify support for Next.js](https://docs.aws.amazon.com/amplify/latest/userguide/ssr-amplify-support.html)
(both read 2026-11-16).

### What that means when writing code here

- **Stream instead of blocking.** A server `page.tsx` that awaits slow data should put the slow part
  behind `<Suspense fallback={…}>`: Vercel sends the static shell immediately and streams the rest into
  it on the same response. Blocking the whole page on one `await` wastes the platform.
- `app/loading.tsx` already provides a route-level streaming fallback; `<Suspense>` is the finer-grained
  tool when only one section is slow. Existing examples: `app/testresult/page.tsx`,
  `app/write/result/[id]/page.tsx`, `app/login/page.tsx`.
- **Do not reach for a client-side fetch just to avoid a slow server render.** On Amplify that was a
  real workaround; here it only costs a round trip and a bigger bundle. Choose per feature: server
  component + streaming for read-only data that can render on the server, TanStack Query for data the
  client drives or mutates (see `.claude/rules/coding.md` → State).
- **Partial Prerendering** is no longer experimental in Next.js 16; it is opt-in through
  `cacheComponents: true` plus the `use cache` directive. It is **not** enabled in this repo — turning it
  on is a separate decision that needs the owner's approval, not something to add while doing other work.
- `src/next.config.ts` sets `output: 'standalone'`, inherited from the Zoney scaffold. Vercel's Next.js
  adapter builds its own output and does not use it, so on this host it is dead config. It is still
  present (harmless on 16.1.6) and has not been removed — do not remove it as a side effect of another
  task.

## Request path

- Browser → `apiFetch` / `authFetch` in `lib/api-client.ts` → backend at `NEXT_PUBLIC_API_URL`.
- `authFetch` retries once after a 401 by calling `/auth/refresh` through `refreshSession()`, which is
  single-flight (concurrent callers share one refresh).
- Session (`accessToken`, `user`, `status`) lives in memory in `store/auth-store.ts` (`useAuthStore`), not
  persisted; `providers/auth-provider.tsx` bootstraps it; `providers/query-provider.tsx` provides TanStack Query.
- Route handler `app/api/admin/media/route.ts` lists files under `public/clone-assets` (resolved from
  `process.cwd()`, i.e. `src/`) for the admin media picker.
- `lib/env.ts`: `NEXT_PUBLIC_API_URL` and `NEXT_PUBLIC_APP_URL` always fall back and never throw — a
  throw here would crash the client (it reaches `api-client.ts`) and break `next build`. See
  `src/lib/env.test.ts` and `docs/04-deploy-vercel.md`.
- `src/.env.example` sets `NEXT_PUBLIC_API_URL=http://localhost:3000/api`, which points at this app itself. The backend dev server listens on port 3005 (`luyenthiao.com-Backend` README), so set `NEXT_PUBLIC_API_URL=http://localhost:3005/api` in `src/.env.local` to reach it.
- The backend allows only `CORS_ORIGIN` (default `http://localhost:3000`, see the backend `.env.example`); if the app runs on another port, credentialed auth calls fail CORS — add that origin to the backend `.env` or free port 3000.

## `src/` structure

| Directory | Contents |
|---|---|
| `app/` | Routes, layouts, `robots.ts`, `sitemap.ts`, route handlers in `app/api/` |
| `components/ui/` | Primitives (button, card, dialog, game-button, game-input) |
| `components/common/` | App-wide: `Topbar`, `BottomNav`, `ThemeProvider` |
| `components/<domain>/` | `admin`, `auth`, `dashboard` (currently unused), `exam` (+ `exam/parts`), `ranking`, `speaking`, `testlevels`, `writing` |
| `hooks/` | Flat `use-*.ts`; auth mutation hooks re-exported from `hooks/index.ts`; `use-media-library.ts` |
| `lib/` | `index.ts` (barrel exporting `cn`), `api-client.ts`, `env.ts`, `utils.ts` (`cn`), `fonts.ts`, `exam.ts` (exam helpers barrel), `exam-*.ts`, `admin-*.ts` |
| `schemas/` | Zod schemas (`exam.ts`) |
| `store/` | `auth-store.ts`, `exam-store.ts`, `exam-editor-store.ts` |
| `providers/` | `auth-provider.tsx`, `query-provider.tsx` |
| `constants/` | `ROUTES`, app constants, demo test paths |
| `types/` | `auth.ts`, `exam.ts`, `speaking.ts`, `writing.ts`, shared types |
| `mocks/` | Mock data: JSON files and typed `.ts` modules (`satisfies` + `mocks.test.ts`) |
| `public/` | Static files; `public/clone-assets/` are third-party assets to be replaced |

## Routes

| Route | Components |
|---|---|
| `/` (`app/(dashboard)/page.tsx`), `/history`, `/notebook`, `/notifications`, `/placement-test`, `/tasks` | inline in the page (known debt) inside `app/(dashboard)/layout.tsx` (`Topbar`, `BottomNav`) |
| `/ranking`, `/school-ranking` | inline page UI + `components/ranking` (known debt), inside `app/(dashboard)/layout.tsx` |
| `/login`, `/signup`, `/forgot-password`, `/reset-password`, `/account/change-password` | `components/auth` |
| `/admin/exam`, `/admin/exam/[id]` | `components/admin` |
| `/check-point/[id]` | `components/exam` (`ExamCheckpoint`) |
| `/testresult` | inline in the page (known debt), `components/ui` |
| `/testlevels/[level]` | `components/testlevels` |
| `/speaking/[slug]`, `/speaking/result/[id]`, `/speaking/result/[id]/preview` | `components/speaking` |
| `/write/[slug]`, `/write/result/[id]` | `components/writing` |

## Conventions

- `page.tsx` is a server component that only assembles components (target pattern; 9 pages are still `"use client"` with inline UI — known debt, see `.claude/rules/coding.md`).
- Import through `@/` (maps to `src/`); every `components/<dir>/` has an `index.ts` barrel; some pages still import deep paths (debt). Exception:
  import `@/components/exam/parts` directly when only part renderers are needed.
- State: server data in TanStack Query, cross-component client state in Zustand, local state in
  `useState`.

## AI tooling

`AGENTS.md`, `CLAUDE.md`, `.claude/rules/`, `.claude/agents/`, `.claude/skills/`, the vendored guard in
`.claude/hooks/` (`VENDORED.md`), and superpowers specs/plans in `.claude/superpowers/`.
From a Next.js version after 16.1.6, `next dev` writes `src/AGENTS.md` (generator: `node_modules/next/dist/server/lib/generate-agent-files.js`); expect a new untracked file after upgrading and review it.
