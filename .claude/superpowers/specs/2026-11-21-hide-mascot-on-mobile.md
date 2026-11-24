# Specification: Hide Mascot Artwork on Mobile to Focus on Login Form

## 1. Context & Motivation
On mobile devices (smartphones and compact portrait screens), users prioritized immediate access to the login credentials form without having to scroll past the decorative mascot island scene.
The user requested:
- Completely hide the decorative lion diorama cluster on mobile screens.
- Keep only the login form cleanly centered on mobile.
- Preserve the decorative lion diorama scene on desktop/large screens (`lg:` breakpoint, 1024px+).

## 2. Implementation Scope
- `src/components/auth/auth-page-shell.tsx`:
  - Change the Left Zone container class from `flex w-full ...` to `hidden w-full flex-col items-center justify-center lg:flex lg:w-[54%] lg:items-start`.
  - Adjust padding and vertical centering so the login panel sits effortlessly in the center of the viewport on mobile without unnecessary top offset.

## 3. Verification Criteria
- Mobile viewport (390x844, 375x667, 320x568):
  - Decorative mascot scene is completely hidden.
  - Login card is centered vertically and horizontally.
  - Zero overflow or unnecessary scrolling.
- Desktop viewport (1440x900, 1920x1080):
  - Two-zone layout intact with full diorama scene and branding.
- TypeScript, lint, and vitest pass.
