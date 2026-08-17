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
- Prettier auto-sorts classes — run `npm run format` before committing.

## page.tsx

- Contains only: static imports, dynamic imports, static data, metadata, layout TSX.
- No UI logic, state, or inline interface TSX.
- Metadata MUST have all 5 fields: title, description, keywords, alternates, openGraph.

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
