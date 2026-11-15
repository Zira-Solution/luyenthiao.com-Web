# Architecture

## Repository layout

The repository root holds only metadata (AI configuration, CI, docs). The Next.js project lives
entirely in `src/`, the same layout as Zoney.vn-Web.

## `src/` directories

| Directory | Contents |
|---|---|
| `app/` | App Router routes, layouts, route handlers (`app/api/`) |
| `components/ui/` | Base UI primitives (shadcn style) |
| `components/common/` | App-wide components: `Topbar`, `BottomNav`, `ThemeProvider` |
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
