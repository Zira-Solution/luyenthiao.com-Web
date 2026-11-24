# Implementation Plan: Add 3D Book Stack to Left of Mascot on Floating Island

## Plan Summary
- **Goal**: Add the 3D stack of books transparent asset to the left of the lion on the floating island in `AuthBrandShowcase`.
- **Files to create**:
  - `src/public/clone-assets/media/login_book_stack.png`
- **Files to modify**:
  - `src/components/auth/auth-brand-showcase.tsx`: Insert the book stack element and its contact shadow inside the animated island scene container.
- **Components/hooks reused**:
  - Next.js `<Image />` component with `priority` and responsive `sizes`.
- **Potential risks & mitigations**:
  - *Risk*: Visual clutter or awkward overlap with the lion's tail.
    *Mitigation*: Position books at `left-[16%]` with `w-[20%]`, layered beneath the lion so the tail gracefully layers over or next to the books.
  - *Risk*: Layout shift during float animation.
    *Mitigation*: Books are placed within the same animated container as the island and lion, ensuring 100% synchronized motion.

## Verification Steps
1. Save `login_book_stack.png` into `src/public/clone-assets/media/`.
2. Update `auth-brand-showcase.tsx`.
3. Format with Prettier: `npx prettier --write src/components/auth/auth-brand-showcase.tsx`.
4. Run `npx tsc --noEmit` and `npm test -- components/auth/login-form.test.tsx`.
5. Capture real browser screenshots on localhost:3000 to verify visual aesthetics.
