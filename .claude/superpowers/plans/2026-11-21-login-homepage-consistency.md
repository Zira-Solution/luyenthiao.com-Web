# Implementation Plan: Redesign Login Page for Homepage Consistency

- **Date:** 2026-11-21
- **Status:** Proposed (Pending User Approval)
- **Spec Reference:** `.claude/superpowers/specs/2026-11-21-login-homepage-consistency.md`

---

## 1. Goal
Redesign the `/login` page components to share the exact same magical game aesthetic, color palette, background atmosphere, diorama accents, and 3D claymorphic button styling as the Flyer homepage.

---

## 2. Files to Modify
1. `src/components/auth/auth-page-shell.tsx`
   - Replace the static sunset WebP background with `<DreamySkyBackground />` imported from `@/components/dashboard`.
   - Update the top-left "Về trang chủ" navigation button with frosted pearl capsule styling.
2. `src/components/auth/auth-brand-showcase.tsx`
   - Add ambient aura halo behind the island matching `PlanetDiorama`.
   - Add animated fluttering butterfly (`float-butterfly` / `wing-flap`) and glowing star sparkles.
   - Ground the waving lion mascot and books with soft grass contact occlusion.
   - Refine the "LUYỆN THI ẢO" wordmark and badges with diorama typography tokens.
3. `src/components/auth/login-form.tsx`
   - Restyle login card with soft pearl translucent glassmorphism (`bg-white/90 backdrop-blur-xl border-2 border-white/90`).
   - Refine input fields with gentle pastel borders and warm amber focus rings.
   - Upgrade primary submit button to use `<GameButton variant="primary">` with 3D tactile press and loader state.

## 3. Files to Create
- None (all changes cleanly fit into the existing auth component structure).

## 4. Components / Hooks Reused
- `DreamySkyBackground` from `src/components/dashboard/dreamy-sky-background.tsx`
- `GameButton` from `src/components/ui/game-button.tsx`
- Existing mascot cutout: `src/public/clone-assets/mascot/mascot_waving_lion.png`
- Existing books cutout: `src/public/clone-assets/media/login_book_stack.png`
- Existing island: `src/public/clone-assets/media/login_floating_island.png`
- Existing auth hooks: `useLogin` from `src/hooks`

## 5. Potential Risks & Mitigations
- *Risk:* `DreamySkyBackground` uses a canvas with `window.innerWidth`/`innerHeight`.
  - *Mitigation:* `DreamySkyBackground` is already marked `'use client'` with SSR guards (`typeof window !== 'undefined'`) and handles resize gracefully.
- *Risk:* `GameButton` submit trigger.
  - *Mitigation:* Ensure `type="submit"` and `disabled={login.isPending}` are passed to `GameButton`. Unit tests in `login-form.test.tsx` will verify form submission and loading spinner.
- *Risk:* Responsive layout regression.
  - *Mitigation:* Ensure `hidden lg:flex` is maintained so mobile users see only the centered login card without diorama clutter.

---

## 6. Execution Steps (Post-Approval)
1. **Shell Update:** Update `src/components/auth/auth-page-shell.tsx` to mount `DreamySkyBackground`.
2. **Showcase Update:** Update `src/components/auth/auth-brand-showcase.tsx` with atmospheric glow, fairy butterfly, sparkles, and grounded lion/books.
3. **Form Update:** Update `src/components/auth/login-form.tsx` with `GameButton` and refined inputs.
4. **Validation:**
   - Run `npx prettier --write` on the 3 modified files.
   - Run `npx tsc --noEmit` (ensure 0 errors).
   - Run `npm test -- components/auth/login-form.test.tsx`.
   - Take screenshots in desktop (1440x900) and mobile (375x667) using Playwright Edge and visually verify.
