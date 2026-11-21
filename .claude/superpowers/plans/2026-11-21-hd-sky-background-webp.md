# Implementation Plan: Replace Low-Res Login Sky with High-Definition WebP

## Plan Summary
- **Goal**: Export the recreated crystal-clear 1080p sky background as an optimized WebP (~80 KB) and update `AuthPageShell` to consume it.
- **Files to create/export**:
  - `src/public/clone-assets/media/login_sky_sunrise.webp`
- **Files to modify**:
  - `src/components/auth/auth-page-shell.tsx` (update `src` to `.webp`)
- **Components reused**:
  - Next.js `<Image />` with `priority`
- **Potential risks & mitigations**:
  - *Risk*: Heavy payload slowing down initial page render.
    *Mitigation*: Optimized WebP compression produces a file size of only ~80 KB (even lighter than the blurry original 92.8 KB JPEG).

## Verification Steps
1. Export WebP asset to `src/public/clone-assets/media/login_sky_sunrise.webp`.
2. Edit `src/components/auth/auth-page-shell.tsx`.
3. Format with Prettier: `npx prettier --write src/components/auth/auth-page-shell.tsx`.
4. Run `npx tsc --noEmit` and `npm test`.
5. Capture browser verification screenshot on `localhost:3000/login`.
