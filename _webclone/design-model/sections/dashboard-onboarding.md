# Section Spec — dashboard-onboarding: Bingo Onboarding Modal

- **Route(s):** `/`
- **Screenshots:** `_webclone/captures/dashboard/desktop.png`
- **Chunk owns:** `src/components/dashboard/bingo-onboarding.tsx`, `src/app/page.tsx`

## Layout intent

```
Page (w-full, h-screen, fixed inset-0, overflow-hidden)
├─ Background image + gradient overlays (absolute inset-0)
└─ Content Container (flex col items-center justify-center, z-10)
   ├─ Logout Button (absolute top-right)
   └─ Modal Container (flex row, items-center)
      ├─ Mascot Image (absolute or negative margin left)
      └─ Dialog Bubble (bg-white, rounded, shadow, flex col)
         ├─ Title (BINGO)
         ├─ Message (Text paragraphs)
         └─ Action Button ("Đi thôi!")
```

## Component mapping

| Piece | Uses | Note |
|---|---|---|
| Dialog Bubble | `@/components/ui/card` | Customized with a tail for the speech bubble effect |
| Action Button | `@/components/ui/button` | Custom gradient background variant |
| Logout Button | `@/components/ui/button` | Ghost or custom solid with icon |
| New: `BingoOnboarding` | create `src/components/dashboard/bingo-onboarding.tsx` | Main onboarding screen |

## State, validation, interactions

- **Client UI state (Zustand or local):** `isVisible` (boolean) to show/hide the onboarding. If the user clicks "Đi thôi!", it dismisses the onboarding (for now just hides it locally or via Zustand).
- **Interactions:**
  - "Đi thôi!" button: hover scale-105, active scale-95, transitions smoothly.
  - "Đăng xuất" button: hover opacity change.
- **Server state:** None needed for just visual cloning, but hypothetically mutates user's `hasCompletedOnboarding` flag.

## Animation

| Interaction | Effect type (matrix term) | Tech (from matrix) | Budget request |
|---|---|---|---|
| Background Stars | infinite ambient | CSS keyframes | — |
| Bubble Enter | micro-interaction | CSS transition / keyframes | — |

## Mock data

- N/A for this static onboarding overlay.

## Evidence grading

| Detail | Grade | Basis |
|---|---|---|
| Background layers | SOURCE | desktop.html DOM structure |
| Mascot image | SOURCE | URL extracted from img tag |
| Button gradients | SOURCE | Extracted from inline styles |

## Acceptance criteria

- [ ] renders at 3 viewports per layout intent
- [ ] all declared interactions work
- [ ] animation matches the matrix tech; respects reduced-motion
- [ ] Vietnamese copy matches capture `.txt` verbatim
- [ ] gates green on this chunk's files
