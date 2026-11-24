# Implementation Plan: Hide Mascot Artwork on Mobile

## Plan Summary
- **Goal**: Make `AuthBrandShowcase` hidden on mobile viewports (< 1024px) using Tailwind `hidden lg:flex`, keeping only the login form card centered.
- **Files to modify**:
  - `src/components/auth/auth-page-shell.tsx`
- **Potential risks & mitigations**:
  - *Risk*: Misaligned vertical centering on small phones.
    *Mitigation*: Use `my-auto` and balanced vertical padding so the login card centers comfortably in the mobile viewport.

## Verification Steps
1. Edit `src/components/auth/auth-page-shell.tsx`.
2. Format with Prettier: `npx prettier --write src/components/auth/auth-page-shell.tsx`.
3. Run `npx tsc --noEmit` and `npm test`.
4. Capture live screenshots on desktop (1440x900) and mobile (390x844).
