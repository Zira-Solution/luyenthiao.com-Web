# Specification: Rebuild Login Page with Approved 3D Image Assets

## 1. Context & Motivation

The LUYỆN THI ẢO login page needs a complete visual and composition overhaul to match the magical, child-friendly English exam preparation theme: a bright sunrise sky above the clouds with a floating grassy island and a seated mascot reading a book.

Previous implementations suffered from:
- Cluttered decorations (wooden signs, puffy cloud card outlines, floating paper planes, badges).
- Detached mascot placement (standing on an artificial pedestal or floating without a clear physical anchor).
- Lack of cohesive composition between the environment, the island, and the login form.

The goal is to assemble the **THREE approved image assets** into a calm, charming, and polished login interface:
1. **Asset A — Sky Background**: Bright ocean-blue sunrise sky with clouds and distant floating castles.
2. **Asset B — Floating Island**: Stylized 3D grassy island with tree on the left, lush grass, flowers, rocky underside, and hanging vines.
3. **Asset C — Lion Mascot**: Seated golden-yellow lion reading a storybook, placed directly on the island's grassy meadow.

---

## 2. Architecture & Layout

### 2.1 Viewport Composition (Desktop 1024px+)
- **Layout Model**: CSS Flexbox / Grid two-zone layout.
- **Left Zone (~55% width)**:
  - Island & Mascot Scene container (`relative`, maximum width 540–580px).
  - Floating Island image rendered responsively (`w-full h-auto`).
  - Contact Shadow beneath the lion: subtle elliptical blur (`bg-amber-950/25 blur-md`) anchored to the grassy plane.
  - Lion Mascot image: positioned absolutely within the island container (`left: 54%`, `top: 15.5%`, `width: 36%`), ensuring the lion's paws rest naturally on the grass in front of the tree.
  - Floating Animation: Applied to the *entire scene container* (`transform: translateY(0 to -7px)`, `6s ease-in-out infinite alternate`). Both island and mascot move together in unison, preventing detachment.
  - Brand Heading: "LUYỆN THI ẢO" in rounded, bold, soft-cream/white typography with subtle blue-lavender outline/shadow, placed beneath the island.
  - Compact tagline: "Vương Quốc Luyện Thi Tiếng Anh Diệu Kỳ".
- **Right Zone (~45% width)**:
  - One elegant login panel (max width 400–420px), vertically centered with ample breathing room.
  - No wooden plank sign, no cloud borders.
  - Soft translucent glass surface: `bg-white/85 backdrop-blur-xl border border-white/80 rounded-[26px] shadow-[0_16px_40px_rgba(20,50,110,0.12)]`.

### 2.2 Responsive Breakpoints
- **Desktop (1440px – 1920px)**: Two-zone horizontal split, full scenic balance, generous negative space.
- **Small Desktop / Laptop (1024px – 1366px)**: Proportional scaling with `max-w-[480px]` on the island, form remains comfortable (380–400px).
- **Tablet (768px – 1023px)**: Compact vertical or relaxed split layout, reduced island scale, zero collision with form controls.
- **Mobile (320px – 767px)**:
  - Vertical stack: Back button -> Compact Island & Reading Lion scene (max-w 240px) -> Brand title -> Clean Login Panel.
  - Input fields and buttons maintain touch-target standard (≥ 48px).
  - No horizontal overflow, no hidden form inputs.

---

## 3. UI & Visual Design System

### 3.1 Colors & Typography
- **Sky Background**: Natural sunrise gradient and ocean-blue sky (`/clone-assets/media/login_sky_bg.webp`).
- **Heading**: Deep ocean blue (`text-sky-950`), bold rounded font.
- **Inputs**: Light blue-white background (`bg-[#f0f5fc]/90`), subtle border (`border-[#d6e0f5]`), focused orange/violet highlight.
- **Primary Button**: Warm sunrise orange gradient (`from-[#FFAA45] to-[#FF8A32]`), height ~50px, rounded-full, soft warm shadow.
- **Google Sign-In**: Clean secondary button, white background, subtle neutral border, standard Google G icon.
- **Back to Home Button**: Small translucent pill in top-left corner (`bg-white/80 backdrop-blur-md`).

### 3.2 Motion & Accessibility
- Gentle vertical float: 6s alternate keyframe animation.
- Respects `prefers-reduced-motion: reduce`: animation disabled when preferred.
- Keyboard accessible: Tab order through username, password, visibility toggle, forgot password, login button, Google button, signup link.
- ARIA labels on password toggle and icon buttons.

---

## 4. Preservation of Existing Logic

The redesign touches only layout, visual presentation, and assets:
- `react-hook-form` and `zod` validation unchanged.
- `useLogin()` TanStack Query mutation unchanged.
- Session redirects and safe path resolution (`safeRedirectPath`) unchanged.
- Password show/hide toggle behavior preserved.
- Existing tests in `login-form.test.tsx` continue to pass.
