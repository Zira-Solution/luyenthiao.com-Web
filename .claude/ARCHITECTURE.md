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

## Request path

- Browser → `apiFetch` / `authFetch` in `lib/api-client.ts` → backend at `NEXT_PUBLIC_API_URL`.
- `authFetch` retries once after a 401 by calling `/auth/refresh` through `refreshSession()`, which is
  single-flight (concurrent callers share one refresh).
- Session (`accessToken`, `user`, `status`) lives in memory in `store/auth-store.ts` (`useAuthStore`), not
  persisted; `providers/auth-provider.tsx` bootstraps it; `providers/query-provider.tsx` provides TanStack Query.
- Route handler `app/api/admin/media/route.ts` lists files under `public/clone-assets` (resolved from
  `process.cwd()`, i.e. `src/`) for the admin media picker.
- `lib/env.ts`: `NEXT_PUBLIC_API_URL` and `NEXT_PUBLIC_APP_URL` default to localhost in development and are
  required in production (it throws if missing).
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
