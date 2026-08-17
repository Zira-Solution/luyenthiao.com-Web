---
inclusion: auto
type: custom
description: "HTML5 semantic markup, ARIA patterns, and on-page SEO standards for Project"
triggers:
  - "semantic html"
  - "aria"
  - "accessibility"
  - "sitemap"
  - "robots"
  - "structured data"
  - "json-ld"
  - "schema"
  - "html5"
  - "heading hierarchy"
related:
  - skills/seo-metadata/skill.md
---

# Skill: HTML5 SEO (Zira Tech)

Semantic HTML5 + on-page SEO standards for Project (Next.js 16 App Router).  
Reference files: `src/app/layout.tsx`, `src/app/robots.ts`, `src/app/sitemap.ts`.

---

## 1. Standard Semantic HTML5 Structure

```tsx
<html lang="vi">                          {/* lang="vi" required — affects Google ranking */}
  <body>
    <header role="banner">               {/* SiteHeader — exactly 1 per page */}
      <nav aria-label="Main navigation">
        {/* ... */}
      </nav>
    </header>

    <main id="main-content">             {/* REQUIRED — skip-nav target */}
      <section aria-labelledby="hero-heading">
        <h1 id="hero-heading">...</h1>
      </section>

      <section aria-labelledby="features-heading">
        <h2 id="features-heading">...</h2>
      </section>
    </main>

    <footer role="contentinfo">          {/* SiteFooter — exactly 1 per page */}
      {/* ... */}
    </footer>
  </body>
</html>
```

### Tag hierarchy — REQUIRED

| Tag | Used for | Rule |
|-----|---------|------|
| `<h1>` | Main page title | **Exactly once** per page |
| `<h2>` | Each section title | Multiple, no level skipping |
| `<h3>` | Card / sub-section | Must be under `<h2>` |
| `<section>` | Content group | Always has a child heading or `aria-label` |
| `<article>` | Self-contained content | When content stands alone |
| `<nav>` | Navigation group | Always add `aria-label` |
| `<main>` | Main content | **Exactly once** per page |

---

## 2. Next.js 16 Metadata API (App Router)

### Root layout — already configured in `src/app/layout.tsx`

```ts
export const metadata: Metadata = {
  metadataBase: new URL(env.SITE_URL),
  title: { default: APP_NAME, template: `%s | ${APP_NAME}` },
  description: APP_DESCRIPTION,
  openGraph: {
    siteName: APP_NAME,
    locale: "vi_VN",
    type: "website",
    images: [{ url: "/banner-share-link.jpg", width: 1200, height: 630 }],
  },
  twitter: { card: "summary_large_image", site: "@iftstack" },
  robots: { index: true, follow: true },
}
```

> Layout sets `twitter` → child pages do NOT need to redeclare it.  
> `openGraph.images` in child pages **OVERRIDES EVERYTHING** — any page with `openGraph` MUST declare `images`.

---

## 3. `robots.ts` — do not change

```ts
// src/app/robots.ts
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/api/"] },
    sitemap: `${env.SITE_URL}/sitemap.xml`,
  }
}
```

---

## 4. `sitemap.ts` — standard pattern

```ts
export default function sitemap(): MetadataRoute.Sitemap {
  const base = env.SITE_URL
  return [
    { url: base,                    changeFrequency: "weekly",  priority: 1 },
    { url: `${base}/services`,      changeFrequency: "weekly",  priority: 0.9 },
    { url: `${base}/products`,      changeFrequency: "weekly",  priority: 0.9 },
    { url: `${base}/contact`,       changeFrequency: "monthly", priority: 0.7 },
  ]
}
```

| Priority | Used for |
|----------|---------|
| `1.0` | Homepage |
| `0.9` | Main categories (services, products) |
| `0.8` | Detail / subpage |
| `0.7` | Contact, about |

---

## 5. Structured Data (JSON-LD)

```tsx
// In a page or layout component
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Product",
  "name": product.title,
  "description": product.desc,
  "url": `${env.SITE_URL}/products/${product.slug}`,
}

return (
  <>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    {/* page content */}
  </>
)
```

### Schema types used in this project

| Schema | Used for |
|--------|---------|
| `Organization` | Root layout |
| `WebSite` | Root layout |
| `Product` | `/products/[slug]` |
| `Service` | `/services` |
| `FAQPage` | FaqSection on homepage |
| `BreadcrumbList` | `/products/[slug]` |

---

## 6. ARIA & Accessibility

```tsx
// Image — descriptive alt text
<Image src="..." alt="WordPress dashboard template for MMO" />   // ✅
<Image src="..." alt="" />                                        // ✅ intentionally decorative
<Image src="..." alt="image1.jpg" />                              // ❌ filename as alt

// Button without visible text
<button aria-label="Close menu"><XIcon className="h-5 w-5" /></button>

// Section with heading
<section aria-labelledby="faq-heading">
  <h2 id="faq-heading">Frequently Asked Questions</h2>
</section>

// Navigation
<nav aria-label="Main navigation">...</nav>
<nav aria-label="Breadcrumb">...</nav>
```

---

## 7. Image SEO

```tsx
// LCP image (above fold) — MUST have priority
<Image src="/hero.webp" alt="IFT Stack Dashboard" fill priority sizes="(max-width: 1024px) 0vw, 55vw" />

// Below fold — lazy + sizes
<Image src={product.image} alt={`${product.title} — website template`} fill loading="lazy"
  sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 25vw" />
```

**Alt text formula:**
- Product: `"${product.title} — website template"`
- Screenshot: `"${product.title} interface on desktop"`
- Icon/decoration: `alt=""` (intentionally empty)

---

## 8. SEO checklist before launching new page

- [ ] `<h1>` exactly once per page?
- [ ] Heading hierarchy not skipped (h1→h2→h3)?
- [ ] `<main>` wraps main content?
- [ ] Every `<section>` has heading or `aria-label`?
- [ ] `metadata.title` format: `"Name | IFT Stack"`?
- [ ] `metadata.description` 150-160 chars with keywords?
- [ ] `metadata.alternates.canonical` correct URL?
- [ ] `openGraph.images` declared (NOT inherited from layout)?
- [ ] LCP image has `priority` prop?
- [ ] All images have descriptive `alt`?
- [ ] New page added to `sitemap.ts`?