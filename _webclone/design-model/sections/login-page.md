# Section Spec — login-page: Login Page

- **Route(s):** `/login`
- **Screenshots:** `_webclone/captures/login/desktop.png`
- **Chunk owns:** `src/app/login/page.tsx`, `src/components/auth/login-form.tsx`, `src/components/ui/game-input.tsx`

## Layout intent

```
Page (w-full, h-screen, fixed inset-0, overflow-hidden)
├─ Background image (absolute inset-0)
└─ Content Container (flex col lg:row items-center justify-center)
   ├─ Left: Mascot Image (Bingo pointing)
   └─ Right: Login Form Container (flex col text-center gap-8)
      ├─ Title ("ĐĂNG NHẬP")
      ├─ Form
      │  ├─ Input "Số điện thoại..."
      │  ├─ Input "Mật khẩu"
      │  ├─ "Quên mật khẩu?" Link
      │  ├─ Submit Button (Gradient Red, custom shape)
      │  └─ Register / Social Logins (Google, Facebook)
```

## Component mapping

| Piece | Uses | Note |
|---|---|---|
| Input Fields | `GameInput` | Custom component for the game-style inputs (uses 3 images for border) |
| Submit Button | `GameButton` | Custom component for the game-style red gradient button with SVGs |
| Form state | `react-hook-form` + `zod` | Shadcn form isn't strictly needed if we do custom inputs, but we can use Zod. |
| New: `LoginForm` | `src/components/auth/login-form.tsx` | Main login logic |

## State, validation, interactions

- **Client UI state:** Local state for password visibility toggle (eye icon).
- **Form Validation:**
  - `identifier`: string, min 1 (required).
  - `password`: string, min 1 (required).
- **Interactions:**
  - Button hover effects (brightness/scale).
  - Submit: logs in, redirects to `/`.

## Animation

| Interaction | Effect type (matrix term) | Tech (from matrix) | Budget request |
|---|---|---|---|
| Button Hover | micro-interaction | CSS transition | — |

## Evidence grading

| Detail | Grade | Basis |
|---|---|---|
| Input styling | SOURCE | HTML extraction (uses absolute positioning of 3 border images) |
| Submit Button | SOURCE | SVG corners and gradient background |

## Acceptance criteria

- [ ] renders at 3 viewports
- [ ] form validation works
- [ ] password toggle works
- [ ] game inputs scale correctly
