---
inclusion: auto
type: custom
description: "Standard metadata and Open Graph declaration for each page in Project"
triggers:
  - "metadata"
  - "open graph"
  - "og image"
  - "twitter card"
  - "seo"
  - "new page"
  - "generateMetadata"
  - "canonical"
  - "title"
  - "description"
related:
  - skills/html5-seo/skill.md
---

# Skill: SEO Metadata (Zira Tech)

## Most important rule

> **`openGraph` in a child page OVERRIDES EVERYTHING from the layout's `openGraph`** — including `images`.
> → Every page declaring `openGraph` MUST also declare `images`.

---

## Standard template — Static Page

```ts
// src/app/<page-name>/page.tsx
import type { Metadata } from "next"

export const metadata: Metadata = {
  // Title: long, fully descriptive — use "—" instead of "|" when a subtitle is needed
  title: "Full Page Title — Short Benefit Summary | IFT Stack",
  // Description: 150–160 chars, must include main keyword + specific USP
  description:
    "Service ... from IFT Stack. [Benefit 1], [benefit 2]. [Delivery time commitment], [warranty commitment].",
  // Keywords: 5–8 long-tail keywords, Vietnamese, directly related to the page
  keywords: [
    "main keyword",
    "long-tail keyword 1",
    "long-tail keyword 2",
    "IFT Stack <service name>",
    "dịch vụ <name> Việt Nam",
  ],
  alternates: {
    canonical: "/<slug>",   // relative — metadataBase auto-prepends https://iftstack.vn
  },
  openGraph: {
    title: "Shorter Title | IFT Stack",  // ≤ 60 chars — displayed on social card
    description:
      "Concise, punchy description for social share.",   // ≤ 100 chars
    url: "/<slug>",          // relative — metadataBase auto-prepends
    type: "website",         // REQUIRED — must declare explicitly
    images: [
      {
        url: "/og/banner-share-link.jpg",  // actual path inside /public/og/
        width: 1200,
        height: 630,
        alt: "IFT Stack",
      },
    ],
  },
}
```

### Coming Soon / unreleased page — add robots

```ts
export const metadata: Metadata = {
  title: "...",
  description: "...",
  keywords: [...],
  alternates: { canonical: "/<slug>" },
  robots: { index: false, follow: false },  // ← REQUIRED for coming soon pages
  openGraph: { ... },
};
```

---

## Standard template — Dynamic Page (`[slug]`)

```ts
// src/app/products/[slug]/page.tsx
import type { Metadata } from "next"
import { getProductBySlug } from "@/data"

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params          // Next.js 16: params is async Promise
  const product = getProductBySlug(slug)

  if (!product) {
    return { title: "Not Found | IFT Stack" }
  }

  return {
    title: `${product.title} | IFT Stack`,
    description: product.desc,
    alternates: { canonical: `/products/${slug}` },
    openGraph: {
      title: product.title,
      description: product.desc,
      url: `https://iftstack.vn/products/${slug}`,
      images: [
        {
          url: "/banner-share-link.jpg",
          width: 1200,
          height: 630,
          alt: product.title,
        },
      ],
    },
  }
}
```

---

## Checklist before creating a new page

- [ ] `title`: long, fully descriptive, includes main keyword, uses `—` when adding a subtitle?
- [ ] `description`: 150–160 chars, specific USP (delivery time, warranty)?
- [ ] `keywords`: 5–8 long-tail Vietnamese keywords?
- [ ] `alternates.canonical`: correct relative path?
- [ ] `openGraph.url`: relative path (no full URL — metadataBase handles it)?
- [ ] `openGraph.type: "website"` declared?
- [ ] `openGraph.images[].url`: correct path `/og/banner-share-link.jpg`?
- [ ] `openGraph.images`: `width: 1200`, `height: 630`, `alt` present?
- [ ] Coming soon page: has `robots: { index: false, follow: false }`?
- [ ] Dynamic page: `await params` before using?
- [ ] Dynamic page: uses `generateMetadata` (not `export const metadata`)?

---

## Current OG image

| File | Size | Path | Used for |
|------|------|------|---------|
| `banner-share-link.jpg` | 1200×630px | `/og/banner-share-link.jpg` | All pages (shared fallback) |

> Keep under **1MB**. Zalo/Messenger need a lightweight image to render quickly.  
> ⚠️ Correct path is `/og/banner-share-link.jpg` — **not** `/banner-share-link.jpg`.

---

## Base layout reference (`src/app/layout.tsx`)

Layout already sets:
```ts
metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL)
twitter: { card: "summary_large_image", site: "@iftstack", creator: "@iftstack" }
```

→ Pages **do not need to redeclare `twitter`** (inherited).  
→ Pages **MUST declare `openGraph.images`** if they have `openGraph`.