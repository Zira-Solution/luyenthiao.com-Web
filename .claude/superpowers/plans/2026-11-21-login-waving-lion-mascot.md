# Implementation Plan: Replace Login Mascot with Seated Waving Lion

## Plan Summary
- **Goal**: Replace the seated storybook lion on the login page with the newly provided 3D baby waving lion mascot, preserving full responsiveness and flawless alignment with the island and welcoming bubble.
- **Files to create/update**:
  - `src/public/clone-assets/mascot/mascot_waving_lion.png` (verified transparent cutout)
- **Files to modify**:
  - `src/components/auth/auth-brand-showcase.tsx` (switch image source, adjust aspect ratio `[436/498]`, calibrate shadow)
- **Components/hooks reused**:
  - Next.js `<Image />` component with `sizes` and `priority`
  - Existing floating animation and responsive island container
- **Potential risks & mitigations**:
  - *Risk*: Misaligned contact shadow or float discrepancy.
    *Mitigation*: Pre-calculated relative coordinates based on the island container coordinate space.
  - *Risk*: Halo or fringe around the cut mascot edges.
    *Mitigation*: Cutout generated via `rembg` with clean alpha boundaries and verified on dark/colored backgrounds.

## Verification Steps
1. Verify image asset: check dimensions and alpha channel integrity.
2. Run TypeScript checks: `npx tsc --noEmit` in `src/`.
3. Run linting: `npm run lint` in `src/`.
4. Run test suite: `npm test` in `src/`.
5. Capture or verify rendered screenshots across breakpoints.
