# Skill Fallback Reference Table

Consult this only when the relevant skill is unavailable (extension environment) and the task touches one of these areas.

| Skill | Inline behavior when unavailable |
| ----- | -------------------------------- |
| `tailwind-4-docs` | Use v4 syntax only; colors through theme tokens (`bg-(--token)`), no arbitrary color values; no `theme()` in classes |
| `seo-metadata` | Metadata must have: `title`, `description`, `keywords`, `alternates`, `openGraph` |
| `html5-seo` | Use semantic tags: `<article>`, `<section>`, `<nav>`, correct heading hierarchy |
| `performance` | Dynamic import below-fold components, use `SectionSkeleton` as fallback |
| `animate` / `framer-motion-*` | Wrap motion components in `AnimatePresence`, SSR-safe with `useEffect` guard |
| `gsap-react` | Always use `useGSAP()` hook, clean up in return callback |
| `full-output-enforcement` | Never truncate code with `// ... rest of code`. Output the complete file. |
