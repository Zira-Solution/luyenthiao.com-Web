# Specification: Redesign Login Page for Full Consistency with Homepage

- **Date:** 2026-11-21
- **Status:** Proposed (Pending User Approval)
- **Target:** `src/components/auth/auth-page-shell.tsx`, `src/components/auth/auth-brand-showcase.tsx`, `src/components/auth/login-form.tsx`
- **Source of Truth:** Homepage (`src/app/(dashboard)/page.tsx`, `src/components/dashboard/*`, `src/components/ui/game-button.tsx`)

---

## 1. Context & Motivation

The existing `/login` page was styled with a saturated sunset background, harsh yellow/orange rays, and generic button styling that clashed with the core design language of the Flyer platform.

The Flyer homepage (`/`) embodies a **cute 3D fantasy diorama** aesthetic:
- **Atmosphere:** Soft morning azure (`#bae6fd`), warm apricot cream (`#fef3c7`), fresh pastel mint (`#dcfce7`).
- **Celestial & Environmental Glow:** Diffuse radial sunburst, soft horizon clouds, and upward-drifting golden fairy pollen motes rendered via a 60fps canvas.
- **Dioramas:** Floating miniature worlds with ambient glowing auras, detached animated 3D butterflies (`wing-flap`), and golden sparkles.
- **Controls & Affordance:** Tactile 3D claymorphic game buttons (`GameButton`), rounded pill capsules, and frosted glass panels with subtle blue outlines.

The goal is to align the `/login` page with this exact visual system so that navigating between the homepage and the login page feels like moving between two scenes in the same magical game universe.

---

## 2. Design Specifications

### A. Environment & Background (`AuthPageShell`)
1. **Background Atmosphere:**
   - Remove the sunset background image (`login_sky_hd_crisp.webp`).
   - Mount `<DreamySkyBackground />` directly from `@/components/dashboard`.
   - Provides identical sky gradient (`#bae6fd` -> `#fef3c7` -> `#dcfce7`), center celestial glow, soft horizon clouds, and interactive floating fairy pollen particles.
2. **Back Navigation Pill:**
   - Keep the "Về trang chủ" pill at top-left.
   - Refine styling to match homepage pill capsules: `border-2 border-amber-200/80 bg-white/90 text-amber-950 shadow-[0_4px_14px_rgba(245,158,11,0.15)] backdrop-blur-md hover:bg-amber-50`.
3. **Responsive Two-Zone Layout:**
   - Desktop (>= 1024px): Left 54% diorama showcase, Right 46% login panel.
   - Mobile (< 1024px): Hide diorama showcase (`hidden lg:flex`), center the login card with generous top/bottom padding.

### B. Floating Island Diorama (`AuthBrandShowcase`)
1. **Thematic Aura & Glow:**
   - Add a radiant ambient aura centered behind the island: `radial-gradient(circle, rgba(254, 240, 138, 0.55) 0%, rgba(56, 189, 248, 0.3) 45%, transparent 70%)` with `blur-[75px]`, identical to the planet halos on the homepage.
2. **Detached Floating Fairy Elements:**
   - Incorporate the animated 3D wing-flapping butterfly from `PlanetDiorama` floating playfully near the top of the island tree.
   - Add floating golden sparkles (`Sparkles` icon with gentle pulsing glow).
3. **Island, Mascot, and Books Contact Occlusion:**
   - Island core: `login_floating_island.png` with gentle floating animation (`floating_6s_ease-in-out_infinite`).
   - Seated Lion Mascot: `mascot_waving_lion.png` seated back on the grass near the tree trunk (`top-[13.8%] left-[28%] w-[34%]`).
   - Books: `login_book_stack.png` positioned flush against the grass (`top-[47.2%] left-[22.5%] w-[14%]`), overlapping the lion's satchel/tail to eliminate any hovering effect.
   - Tight contact ambient occlusion: subtle dark-green/earthy grass contact shading directly beneath the bottom edges so the objects feel physically seated into the lush grass.
4. **Brand Typography & Tagline:**
   - "LUYỆN THI ẢO" 3D wordmark styled with homepage diorama purple extruded text-shadow tokens (`#7c3aed`, `#6d28d9`, `#5b21b6`, `#4c1d95`, `#3b0764`).
   - Adventure badge "Vương Quốc Luyện Thi Tiếng Anh Diệu Kỳ" with gold stars and frosted amber glass styling.
   - Feature chips: "Chuẩn Cambridge & Bộ Giáo Dục" and "Bảng vàng & Huy hiệu vinh danh".

### C. Login Form Panel (`LoginForm`)
1. **Container Glass Card:**
   - Soft pearl frosted glass: `rounded-[28px] border-2 border-white/90 bg-white/90 p-6 sm:p-8 shadow-[0_20px_50px_rgba(30,58,138,0.12)] backdrop-blur-xl`.
2. **Heading & Typography:**
   - Heading "Đăng nhập" in `text-sky-950 font-black font-heading`.
   - Subtitle "Chào mừng bạn đến với thế giới diệu kỳ!" in `text-slate-500 font-semibold`.
3. **Input Fields:**
   - Rounded pill inputs: `rounded-2xl border-2 border-sky-100 bg-sky-50/60 px-4 focus-within:border-amber-400 focus-within:bg-white focus-within:ring-4 focus-within:ring-amber-300/20`.
   - Clear icon indicators with sky-blue tint (`text-sky-600`).
4. **Primary CTA Button:**
   - Upgrade from flat pill button to `<GameButton variant="primary">` with:
     - 3D brick-red base shadow (`bg-game-primary-shadow`),
     - Coral/orange gradient face (`from-game-primary-from to-game-primary-to`),
     - Thick game border (`border-game-primary-border`),
     - Tactile press animation (`active:translate-y-[3px]`),
     - Text "ĐĂNG NHẬP" in uppercase `font-black tracking-widest`.
5. **Secondary Actions & Links:**
   - Google Sign-in button with clean rounded pill styling and subtle hover elevation.
   - "Quên mật khẩu?" and "Đăng ký ngay" links in bold sky-blue (`text-sky-700 hover:text-sky-900`).
6. **Authentication Logic (Preserved 100%):**
   - React Hook Form + Zod (`loginSchema`).
   - TanStack Query mutation via `useLogin()`.
   - Error messages (`ApiError`) and success notifications.
   - Redirect handling with `safeRedirectPath()`.

---

## 3. Verification Plan
1. **Type Checking:** `npx tsc --noEmit` must pass with 0 errors.
2. **Unit Tests:** `npm test -- components/auth/login-form.test.tsx` must pass.
3. **Visual Verification:** Headless browser screenshot comparing `/` and `/login` at 1440x900 and mobile viewport (375x667).
4. **Code Quality:** Format edited files with `npx prettier --write <file>`. Do not touch untouched files.
