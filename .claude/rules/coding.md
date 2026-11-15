---
paths:
  - "src/**"
---
# Coding Rules

## Language

- All code uses TypeScript (`.ts`, `.tsx`). No `.js` or `.jsx`.
- Strict mode enabled — no `any`, no unused variables.

## Components

- Every component is a named export; no default exports (except files inside `app/`).
- Always explicit return type: `React.ReactElement` for components.
- Props interface named `[ComponentName]Props`, declared directly above the component.

## Imports

Required import order (ESLint will error if violated):

1. Built-in Node modules
2. External packages (`next`, `react`, …)
3. Internal aliases (`@/components`, `@/lib`, …)
4. Relative imports (`./`, `../`)

Each group separated by one blank line.

## Naming

- File: `kebab-case.tsx` (e.g. `site-header.tsx`, `lp-hero.tsx`)
- Component: `PascalCase` (e.g. `SiteHeader`, `LpHero`)
- Hook: `camelCase` starting with `use` (e.g. `useMounted`)
- Constant: `SCREAMING_SNAKE_CASE` (e.g. `APP_NAME`, `ROUTES`)
- Function/variable: `camelCase`

## Tailwind

- Use `cn()` from `@/lib/utils` for conditional classes.
- No inline styles, no CSS modules — Tailwind only.
- Colors only via `@theme` CSS-variable tokens in `globals.css` — no arbitrary values like `bg-[#fff]`. Variable references `bg-(--brand)` are the correct form.
- Prettier auto-sorts classes — run `npx prettier --write <file>` in `src/` on the files you changed (never repo-wide; see `docs/02-setup-and-environment.md`).

## State (3 layers)

Every piece of state belongs to exactly one layer — pick by kind, not convenience:

| Kind | Tool |
|---|---|
| Server data (anything the backend owns) | **TanStack Query** (`@tanstack/react-query`) — never mirrored into Zustand |
| Client UI state, cross-component (theme, modals, session progress) | **Zustand** — install when first needed, never preinstall |
| Local widget state (single component) | `useState` |

Server payloads validate with `zod`. Forms: `react-hook-form` + `zod`.

## Animation

- Tech per effect type — CSS/SVG first, libraries only when CSS can't do it: see `.claude/rules/animation-matrix.md`.
- Animate only `transform` and `opacity` — never `width`/`height`/`top`/`left`.
- `prefers-reduced-motion` support is mandatory.
- `will-change`: apply selectively, remove when the animation ends — never leave it on.

## page.tsx

- Contains only: static imports, dynamic imports, static data, metadata, layout TSX.
- No UI logic, state, or inline interface TSX.
- Metadata MUST have all 5 fields: title, description, keywords, alternates, openGraph.
- Known debt: nine dashboard/result pages still contain client UI (planned for phase 3; see `.claude/superpowers/specs/2026-11-15-zoney-structure-refactor-design.md` section 10); do not copy that pattern.

### What "layout TSX" means

`page.tsx` is an **orchestrator only** — it assembles pre-built components, nothing more.

**Allowed in page.tsx** — component tags only, no markup:
```tsx
export default function RoutePage(): React.ReactElement {
  return (
    <>
      <SiteHeader />
      <main>
        <HeroSection />
        <BelowFoldSection />
      </main>
      <SiteFooter />
    </>
  )
}
```

**NOT allowed in page.tsx** — move every one of these to a dedicated component file:
- Any `<div>`, `<p>`, `<h1>`, `<span>`, `<button>` written inline
- Any Tailwind class written inline (e.g. `className="flex items-center"`)
- Any `style={{ ... }}` prop
- Any conditional rendering or logic
- Any `useState`, `useEffect`, event handlers
- Wrapping `<main>` inside a component (page.tsx owns the `<main>` tag)

If you find yourself writing JSX markup inside `page.tsx` beyond component tags, stop and create a new component file first.

## Barrel exports

- Every directory inside `components/` has an `index.ts` that exports all components.
- Import from barrel: `import { Button } from '@/components/ui'`.
- Never import directly from the file: avoid `import { Button } from '@/components/ui/button'`.
- Exception: components that only need the exam part renderers import `@/components/exam/parts` directly — the `@/components/exam` barrel re-exports page-level components that pull large mock data.
