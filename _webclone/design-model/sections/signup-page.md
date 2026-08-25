# Section Spec — signup-page: Signup/Registration Page

- **Route(s):** `/signup`
- **Screenshots:** N/A (Based on visual style of `/login`)
- **Chunk owns:** `src/app/signup/page.tsx`, `src/components/auth/signup-form.tsx`

## Layout intent

```
Page Container (flex col, min-h-screen relative, items-center, justify-center, bg-[#16143c])
├─ Background Layer (Space image + blur glow)
└─ Content Wrapper (w-full max-w-[1200px] flex items-center justify-center gap-10 lg:gap-20)
   ├─ Mascot (Bingo mascot on left - hidden on mobile)
   └─ Signup Form Wrapper
      └─ Signup Form Card (bg-[#0a1a3a]/80 backdrop-blur rounded-[2rem] p-8 md:p-10 border-3 border-[#1e3a8a] shadow-[0_15px_30px_rgba(0,0,0,0.5)])
```

## Component mapping

| Piece | Uses | Note |
|---|---|---|
| Signup Form Card | Custom 3D Container | Dark blue box with yellow/gold headings |
| Form Fields | `GameInput` | Name, Phone Number, Password, Confirm Password |
| CTA Button | `GameButton` (CTA/Green variant) | "ĐĂNG KÝ NGAY" |
| Social Logins | 3D Social Buttons | Google, Facebook |
| Login Link | standard Link | Redirect to `/login` |

## State, validation, interactions

- **Client UI state:** Form data (Name, phone, password, confirmPassword), validation errors.
- **Interactions:** Direct navigation back to login, form submission with validation, social OAuth mock.
- **Validations:**
  - Password and Confirm Password must match.
  - Phone number must be in valid format.
  - Fields are required.

## Acceptance criteria

- [ ] Page renders correctly matching the login layout style.
- [ ] Displays validation error if passwords do not match.
- [ ] Connects with `/login` and `/` (on successful submit).
