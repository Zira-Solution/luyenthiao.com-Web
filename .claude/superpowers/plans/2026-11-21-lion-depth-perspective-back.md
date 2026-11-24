# Implementation Plan: Mascot Depth Perspective Farther Back

## Plan Summary
- **Goal**: Apply the recalculated perspective coordinates for the lion mascot, book stack, and contact shadow in `AuthBrandShowcase`.
- **Files to modify**:
  - `src/components/auth/auth-brand-showcase.tsx`
- **Potential risks & mitigations**:
  - *Risk*: Shadow detachment or misaligned contact line.
    *Mitigation*: Pre-calculated exact mathematical alignment at 60.1% baseline across lion, books, and shadow.

## Verification Steps
1. Edit `src/components/auth/auth-brand-showcase.tsx`.
2. Format: `npx prettier --write src/components/auth/auth-brand-showcase.tsx`.
3. Check TypeScript: `npx tsc --noEmit`.
4. Run tests: `npm test -- components/auth/login-form.test.tsx`.
5. Capture real browser screenshots and compare against baseline.
