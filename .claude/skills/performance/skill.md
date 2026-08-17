---
inclusion: manual
type: default
description: 'Core Web Vitals targets, bundle size rules, pre-deploy checklist, and performance measurement'
triggers:
  - 'performance'
  - 'pre-deploy'
  - 'bundle size'
  - 'LCP'
  - 'CLS'
  - 'INP'
  - 'Core Web Vitals'
  - 'Lighthouse'
  - 'heavy refactor'
  - 'optimize'
---

# Skill: Performance (Production)

> Read this before: creating a new page, adding a heavy component, refactoring UI, reviewing before deploy.

---

## 1. Core Web Vitals — Targets

| Metric   | Target  | How to measure                     |
| -------- | ------- | ---------------------------------- |
| **LCP**  | < 2.5s  | Hero image/text must load fastest  |
| **CLS**  | < 0.1   | No layout jumping when JS hydrates |
| **INP**  | < 200ms | Lightweight event handlers         |
| **FCP**  | < 1.8s  | Minimize render-blocking resources |
| **TTFB** | < 600ms | Next.js static/SSG + cache headers |

---

## 2. Server vs Client — Hard rules

```
Server Component (default):             Client Component ("use client"):
├── page.tsx                            ├── Interactive UI (click, hover)
├── layout.tsx                          ├── useState / useEffect
├── Static data import                  ├── Canvas / WebGL / browser API
└── SEO metadata                        └── TanStack Query (useQuery)
```

- ✅ Keep `page.tsx` as Server Component — never add `"use client"` to page
- ✅ Extract interactive parts to a separate child component
- ❌ Never put filter/state logic directly in `page.tsx`

---

## 3. Imports — Lazy load rules

Every component **below the fold** must use `next/dynamic`:

```tsx
// ✅ Correct
const ShowcaseSection = dynamic(
  () =>
    import('@/components/landing/showcase-section').then((m) => ({ default: m.ShowcaseSection })),
  { loading: () => <SectionSkeleton className="h-96" /> },
)

// ❌ Wrong — static import of heavy below-fold component
import { ShowcaseSection } from '@/components/landing/showcase-section'
```

See `skills/lazy-loading/skill.md` for current state of `page.tsx`.

---

## 4. Image checklist

| Image position            | Attributes                               |
| ------------------------- | ---------------------------------------- |
| Above fold (Hero, header) | `priority` — do NOT use `loading="lazy"` |
| Below fold                | `loading="lazy"` + `sizes`               |
| Fixed icon                | `sizes="96px"`                           |

```tsx
// ✅ Above fold
<Image src={banner} alt="..." fill priority sizes="(max-width: 1024px) 0vw, 55vw" />

// ✅ 3-column grid
<Image src={img} alt="..." fill loading="lazy"
  sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 33vw" />

// ❌ Missing sizes
<Image src={img} alt="..." fill loading="lazy" />
```

`next.config.ts` has `formats: ["image/avif", "image/webp"]` → auto-reduces 30-50% size.

---

## 5. Bundle size — Import rules

### Lucide Icons — specific imports only

```tsx
// ✅ Correct
import { ArrowRight, MessageCircle } from 'lucide-react'

// ❌ Wrong — imports entire bundle
import * as Icons from 'lucide-react'
```

### Avoid heavy libraries in Client Components

```tsx
// ❌ Don't import all of date-fns for 1 function
// ✅ Use native Intl.DateTimeFormat (0 bundle cost)
const formatted = new Intl.DateTimeFormat('vi-VN').format(date)
```

### TanStack Query — only where needed

- ✅ `ProductGrid` — dynamic filter/sort/pagination
- ❌ `page.tsx` (Server Component) — import directly from `src/data/index.ts`
- ❌ Component rendering only once — import directly

---

## 6. Render — Avoid layout shift (CLS)

### Skeleton for large dynamic components

```tsx
// ✅ Has skeleton → no CLS
const ProductDetail = dynamic(() => import('@/components/products/product-detail'), {
  loading: () => <SectionSkeleton className="h-200" />,
})
```

### `placeholderData` for TanStack Query filtering

```tsx
// ✅ Keep old data when filter changes → no blink
const { data } = useQuery({
  ...,
  placeholderData: (prev) => prev,
})
```

### Don't use CSS `hidden` to hide components with images

```tsx
// ❌ Wrong — images still load
;<div className={hidden ? 'hidden' : ''}>
  <Image src={img} />
</div>

// ✅ Correct — no DOM render = no image load
{
  !hidden && <Image src={img} />
}
```

---

## 7. Caching — Current project state

| Resource           | Cache                         | Notes                           |
| ------------------ | ----------------------------- | ------------------------------- |
| `/_next/static/*`  | `max-age=31536000, immutable` | Fingerprinted — safe forever    |
| Images, SVG, fonts | `max-age=172800, swr=3600`    | 2 days + stale-while-revalidate |

`staleTimes`: `{ static: 300, dynamic: 30 }` (seconds in `next.config.ts`)

TanStack Query defaults: `staleTime: 5 min`, `gcTime: 10 min`. Static JSON data: `staleTime: Infinity`.

---

## 8. Pre-deploy checklist

```
[ ] All below-fold components use next/dynamic
[ ] All <Image> have sizes (lazy or priority)
[ ] No "use client" directly in page.tsx
[ ] No import * from "lucide-react"
[ ] Third-party scripts use strategy="lazyOnload"
[ ] next build runs with no errors/warnings
[ ] TanStack Query only in Client Components, staleTime: Infinity for static data
[ ] No CSS hidden to hide components with images — use conditional render
```

---

## 9. Measurement

| Tool                         | Used for               |
| ---------------------------- | ---------------------- |
| Lighthouse (Chrome DevTools) | LCP, CLS, INP overall  |
| PageSpeed Insights           | Real score from Google |
| `next build` output          | Bundle size per page   |

### Reading `next build` output

```
Route (app)              Size    First Load JS
┌ ○ /                   5.2 kB        142 kB   ← target < 200 kB
├ ○ /products           8.4 kB        185 kB
First Load JS shared     98.5 kB       ← target < 100 kB
```

> **Red flag:** Any page with `First Load JS > 250 kB` → review dynamic imports.

---

## 10. Common errors

| Error                     | Cause                                         | Fix                                      |
| ------------------------- | --------------------------------------------- | ---------------------------------------- |
| Slow LCP                  | Hero image missing `priority`                 | Add `priority` to above-fold Image       |
| High CLS                  | Dynamic component missing loading skeleton    | Add `loading: () => <SectionSkeleton />` |
| Large bundle              | Static import of below-fold component         | Switch to `next/dynamic`                 |
| Canvas SSR error          | Browser API component missing `ssr: false`    | `dynamic(..., { ssr: false })`           |
| TanStack constant refetch | Missing `staleTime: Infinity` for static data | Add to `useQuery`                        |
| Filter blink              | Missing `placeholderData`                     | Add `placeholderData: (prev) => prev`    |
