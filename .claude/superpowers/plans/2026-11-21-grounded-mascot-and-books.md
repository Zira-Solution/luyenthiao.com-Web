# Implementation Plan: Ground Mascot and Books with Precise Contact Occlusion and Foreground Grass

## Plan Summary
- **Goal**: Replace detached blurred HTML divs with a unified SVG coordinate layer (`viewBox="0 0 875 734"`) containing precise footprint contact shadows and subtle foreground grass tufts.
- **Files to modify**:
  - `src/components/auth/auth-brand-showcase.tsx`
- **Potential risks & mitigations**:
  - *Risk*: Misaligned SVG coordinates when scaled on different viewports.
    *Mitigation*: The SVG uses `viewBox="0 0 875 734"` matching the parent container's `aspect-[875/734]`, guaranteeing pixel-for-pixel responsive scaling.

## Verification Steps
1. Update `src/components/auth/auth-brand-showcase.tsx`.
2. Format: `npx prettier --write src/components/auth/auth-brand-showcase.tsx`.
3. Check TypeScript: `npx tsc --noEmit`.
4. Run tests: `npm test -- components/auth/login-form.test.tsx`.
5. Capture browser screenshots on desktop (1440x900) and inspect contact seams.
