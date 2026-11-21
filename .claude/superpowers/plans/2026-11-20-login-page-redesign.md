# Implementation Plan: Rebuild Login Page with 3D Assets

## Plan Summary
- **Goal**: Implement the approved login page design using the 3 image assets (Sky, Floating Island, Seated Lion reading storybook), providing a clean, responsive, and functional login experience.
- **Files to create/export**:
  - `src/public/clone-assets/media/login_sky_bg.webp` (Already exported)
  - `src/public/clone-assets/media/login_floating_island.png` (Already exported)
  - `src/public/clone-assets/mascot/mascot_reading_lion.png` (Already exported)
- **Files to modify**:
  - `src/components/auth/auth-page-shell.tsx`: Update sky background layer to `login_sky_bg.webp`, simplify composition container, remove clutter overlays.
  - `src/components/auth/auth-brand-showcase.tsx`: Implement the island + seated lion diorama with percentage-based coordinate system, gentle float animation, and clean "LUYỆN THI ẢO" branding.
  - `src/components/auth/login-form.tsx`: Replace wooden sign and cloud card with clean glassmorphic panel (`bg-white/85 backdrop-blur-xl border border-white/80 rounded-[26px]`), orange gradient CTA button (`#FFAA45` to `#FF8A32`), clean Google button.
- **Components/hooks reused**:
  - `useLogin()` from `@/hooks`
  - `hardNavigate()` from `@/lib/navigation`
  - `safeRedirectPath()` from `@/lib/safe-redirect`
  - `useAuthStore` from `@/store/auth-store`
- **Potential risks & mitigations**:
  - *Risk*: Mascot detachment during responsive scaling.
    *Mitigation*: The lion and contact shadow are positioned via percentage coordinates inside the island's relative bounding box, sharing the same container. When the container scales or animates, the lion scales and moves synchronously.
  - *Risk*: Overflow or cutoffs on small mobile screens.
    *Mitigation*: Mobile layout stacks vertically with clamp-sized compact island scene (`max-w-[220px]`), ensuring the login form is readily accessible without excessive scrolling.
  - *Risk*: TypeScript or ESLint rule violations.
    *Mitigation*: Strict adherence to coding rules (explicit return types, ordered imports, named exports, no arbitrary inline styles). Run `npx tsc --noEmit`, `npm run lint`, `npm test`, `npm run build`.

## Verification Steps
1. Run automated test suite: `cd src; npm test -- login-form.test.tsx`.
2. Run TypeScript check: `cd src; npx tsc --noEmit`.
3. Run linter: `cd src; npm run lint`.
4. Run Next.js build: `cd src; npm run build`.
5. Run dev server: `cd src; npm run dev` and perform browser verification across multiple viewport widths:
   - 1920x1080 (Desktop Large)
   - 1440x900 (Desktop Standard)
   - 1366x768 (Laptop)
   - 1024x768 (Tablet Landscape)
   - 768x1024 (Tablet Portrait)
   - 390x844 (Mobile iPhone)
   - 320x568 (Mobile Small)
