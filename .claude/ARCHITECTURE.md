# Architecture

## Overview

Next.js App Router project for **english-learning-app** — a web app to help users learn English (exact game/quiz mechanics not yet decided). Scaffolded from the Zoney.vn-Web project's tooling and folder conventions so AI-assisted development stays consistent across both repos. No backend/API is wired up yet — the data layer (API client, schemas, hooks) will be added once the backend is decided.

- **Language:** TypeScript (strict mode) — no `.js` or `.jsx` anywhere
- **Framework:** Next.js App Router
- **Styling:** Tailwind CSS v4 + shadcn/ui
- **Project name:** english-learning-app
- **Primary domain:** English learning / game — TODO, product scope not yet defined
- **Target audience:** TODO
- **Key technical constraints:** No backend/API decided yet

## Tech Stack — single source of truth

Every skill, rule, and script in this repo reads its stack from THIS block. Do not restate the stack anywhere else — point here. (Source: Công nghệ đề xuất 15/08/2026.)

| Layer | Choice |
| --- | --- |
| Runtime / runner | **Node** (`next dev`, `next build`, `next start`) — NOT Bun |
| Framework | Next.js 16 App Router + React 19 |
| Language | TypeScript strict |
| Styling | Tailwind CSS v4 via `@theme` CSS variables (theme switching) + shadcn/ui |
| Server data | TanStack Query (`@tanstack/react-query`) |
| Client state | Zustand — install when first needed, never preinstall |
| Validation | Zod (+ react-hook-form) |
| Animation | Per effect type — see `.claude/skills/web-clone/references/animation-matrix.md`; CSS/SVG first |
| Perf budget | < 300 KB gzip JS per route (beats visual fidelity) · LCP < 2.5s on 4G · ≥ 30 fps on mid-range Android 4 GB |

## src/ Structure

### `src/app/`

Routing files only. Every `page.tsx` follows the 5-part pattern:

1. Static imports (above-fold components)
2. Dynamic imports with `next/dynamic` (below-fold + SectionSkeleton fallback)
3. Inline static data (if any)
4. `export const metadata: Metadata` — REQUIRED: title, description, keywords, alternates, openGraph
5. `export default function` — layout TSX only, no UI logic

Currently only `/` (home placeholder, `HelloPlaceholder`) exists. Update this section as real routes are added.

### `src/components/`

- `ui/` — shadcn/ui primitives, reused across the whole project. Import: `@/components/ui`. Currently empty — run `npx shadcn@latest add <component>` as needed.
- `common/` — shared layout components (`ThemeProvider`, `HelloPlaceholder`). Import: `@/components/common`
- `[route-name]/` — page-specific components, named with a route prefix. None yet.

### Component Naming by Route

| Route | Directory | Prefix example |
| ----- | --------- | -------------- |
| — | — | No routes beyond `/` exist yet. Fill in this table as routes are built. |

### `src/actions/`

Server Actions. Each file groups by domain. Return type: `Result<T>` from `@/types`. None exist yet — the directory is not pre-created (git does not track empty directories); create `src/actions/` when the first Server Action is added.

### `src/constants/`

Project-wide constants. `ROUTES` object defines all paths — currently only `HOME: '/'`. Add routes here as they're built.

### `src/hooks/`

Custom React hooks, exported via `index.ts`. Empty for now.

### `src/lib/`

- `utils.ts` — `cn()` for merging Tailwind classes
- `env.ts` — type-safe environment variables (`APP_URL`, `NODE_ENV` only — no `API_URL` until a backend exists)
- `fonts.ts` — placeholder, no fonts chosen yet

### `src/types/`

- `BaseEntity` — id, createdAt, updatedAt
- `Result<T, E>` — union type for success/error

Add project-specific domain types here once the data model is defined.

## SEO

- `src/app/robots.ts` → served at `/robots.txt`
- `src/app/sitemap.ts` → served at `/sitemap.xml` — currently only lists `/`

## Tooling

- **Package manager** — npm on Node (see Tech Stack above; `bun.lock` was removed when the project moved off Bun)
- **Prettier** — `npm run format`. Config: `.prettierrc`
- **ESLint** — `npm run lint`. Enforces import order and TypeScript strict rules
- **TypeScript** — strict mode on, `npx tsc --noEmit` to type-check
- **Vitest + React Testing Library** — `npm run test` (single run) / `npm run test:watch`. Config: `vitest.config.mts`, setup: `vitest.setup.ts`. Tests are co-located next to the file they cover (`*.test.tsx`)
- **web-clone gates** — `npm run gates` (runs `.claude/skills/web-clone/scripts/gates.ts` via tsx)
- **shadcn/ui** — add component: `npx shadcn@latest add <component-name>`

## .claude/

- `skills/` — specialized tools that complement superpowers, copied verbatim from Zoney.vn-Web (generic coding/design skills, not project-specific). Plus one project-specific skill: `web-clone/` — the 80/100 factory that clones a live site's frontend into this repo (recon → design model → parallel build → gates). Design decisions live in `_bmad-output/brainstorming/brain-flyer-clone-skill-2026-08-17/brainstorm-intent.md` (repo root's parent); run artifacts land in `_webclone/`.
- `rules/` — coding and workflow rules, copied verbatim from Zoney.vn-Web.
- `superpowers/` — superpowers working directory (specs, plans) — starts empty for this project.

## First-Time Setup (new team member)

Skills are already in the repo — no installation needed. The superpowers plugin is global per-machine — install once per machine:

```
/plugin install superpowers@claude-plugins-official
```

Codegraph must be initialized once for this repo before Claude Code can use it here: run `codegraph init` inside `english-learning-app/` and wait for indexing to finish before starting work.

## Supplementary Skills

See Zoney.vn-Web's `.claude/ARCHITECTURE.md` for the full skill reference table — this repo has the identical skill set, copied verbatim into `.claude/skills/`.
