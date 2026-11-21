# MASTER PROJECT HANDOFF — LEARNING GARDEN LOGIN REDESIGN

- **Document Version:** 1.0.0
- **Creation Date:** 2026-11-21T11:02:00+07:00
- **Location:** `docs/learning-garden-handoff/HANDOFF.md`
- **Target Audience:** Next Antigravity AI Agent & Creative Frontend Engineering Team
- **Current Branch:** `preview/image-assets`

---

## A. Project Overview

- **Project Purpose:** The web client for `luyenthiao.com`, an online English test-preparation platform for children (Cambridge Young Learners: Starters, Movers, Flyers, TOEFL Primary, IOE).
- **Repository Root:** `D:\Zira\luyenthiao\web`
- **Next.js Project Directory:** `src/` (Next.js 16.4.6, React 19.2.3, App Router, Tailwind CSS v4, TypeScript).
- **Public Asset Root:** `src/public/` (URLs mapped from root `/`, e.g. `src/public/assets/...` -> `/assets/...`).
- **Current Login Architecture:**
  - Route: `src/app/login/page.tsx`
  - Shell: `src/components/auth/auth-page-shell.tsx`
  - Form: `src/components/auth/login-form.tsx`
  - State & Hooks: `useLogin()` (`src/hooks/use-login.ts`), `useAuthStore` (`src/store/auth-store.ts`), `safeRedirectPath` (`src/lib/safe-redirect.ts`), `hardNavigate` (`src/lib/navigation.ts`).
  - Validation: React Hook Form + Zod (`loginSchema`).

---

## B. Current Progress Summary

| Phase | Description | Status | Reference Deliverable |
| :--- | :--- | :--- | :--- |
| **Phase 0** | Project Setup & Visual Reference Lock | **COMPLETED** | Safe backup created at `scratch/checkpoint-phase0/` |
| **Phase 1** | Composition & Art Direction Lock | **APPROVED (Revision 2)** | Blueprint: `docs/learning-garden-handoff/specs/phase-1-composition-blueprint.md`<br>Preview: `docs/learning-garden-handoff/previews/composition_preview_phase1.png` |
| **Phase 2** | Background Artwork (Sky) Only | **IN PROGRESS (Not Approved)** | Review tool: `docs/learning-garden-handoff/backgrounds/preview_background.html`<br>Candidates: `learning_garden_sky_hd_2560x1440.webp` & `login_sky_ai_hd_1920x1080.webp` |
| **Phase 3** | Island Base & Diorama Artwork | **NOT STARTED** | Locked: No work until Phase 2 is approved |
| **Phase 4** | Mascot & Foreground Assets | **NOT STARTED** | Locked |
| **Phase 5** | Contact Occlusion & Depth | **NOT STARTED** | Locked |
| **Phase 6** | Component Integration | **NOT STARTED** | Locked |
| **Phase 7** | Quality Assurance & Responsive Verification | **NOT STARTED** | Locked |

---

## C. Approved Design Decisions & Constraints

### 1. Locked Composition & Viewport Split (56% / 44%)
- **Left Stage (~56% / 0 - 1075px on 1920px screen):**
  - Integrated Learning Garden diorama floating world.
  - Centered at `cx = 530px, cy = 475px`, responsive container `clamp(280px, 48vw, 760px)`.
  - Magical stylized tree on left-rear (`x: 230..450px`, `y: 170..490px`).
  - Seated Mascot Lion on center-right (`x: 520..730px`, `y: 350..585px`), hero scale increased by +18% (`190×230px`).
  - 3D Pastel book stack at the tree trunk base (`x: 450..515px`, `y: 470..535px`).
  - Speech bubble: compact, anchored right above lion's head (`x: 650..920px`, `y: 215..291px`), tail pointing directly down-left to lion's head, zero foliage overlap.
  - 3D Extruded Title "LUYỆN THI ẢO" + Adventure subtitle badge + Feature chips: placed snugly under the island rock strata with minimal vertical dead space.
- **Right Stage (~44% / 1075 - 1920px):**
  - Original React `LoginForm` card container, centered horizontally (`x: 1287..1707px`, width `420px`).

### 2. Critical Login Panel Constraints
- **100% UNCHANGED:** Layout, dimensions (420px), border-radius (28px), frosted glass styling, input fields, password toggle, `<GameButton variant="primary">` 3D coral/orange button, Google button, forgot password and register links.
- **ONLY APPROVED MODIFICATION:** Heading text color "Đăng nhập" set to `#6534B5` (Harmonious Royal Purple).
- **STRICT PROHIBITION:** Do NOT add wooden houses, wooden frames, hanging lanterns, roof tiles, or stone stairs around the Login form.

### 3. Lighting & Perspective
- **Key Light Source:** Upper-Right / Rear (~225° incident angle).
- **Lighting Coherence:** Directional sunlight illuminates cloud tops, right edge of tree foliage, lion mane, and satchel; casts soft contact occlusion shadows forward-left.
- **Camera Perspective:** High-angle axonometric/isometric pitch (~25°), matching Flyer homepage `PlanetDiorama`.

### 4. Prohibited Elements (Never Add)
- **NO** waterfalls, rivers, streams, ponds, or water features.
- **NO** yellow circular/oval aura halos or large radial-gradient glow blobs behind the island.
- **NO** giant puffy foam cloud walls along the left edge.
- **NO** cloud ceilings or cave-like enclosing formations.
- **NO** puffy claymorphism, vinyl balloons, or flat vector clipart.

---

## D. Consolidated File Inventory

All files are preserved and accessible via project-relative paths:

### 1. Handoff Package (`docs/learning-garden-handoff/`)
- `docs/learning-garden-handoff/HANDOFF.md` — This master handoff document.
- `docs/learning-garden-handoff/specs/phase-1-composition-blueprint.md` — Approved Phase 1 Revision 2 blueprint.
- `docs/learning-garden-handoff/specs/art-style-lock-flyer-learning-garden-design.md` — Art Style Lock specifications.
- `docs/learning-garden-handoff/previews/composition_preview_phase1.png` — Revised high-res blueprint preview (1920×1080).
- `docs/learning-garden-handoff/references/concept_reference.jpg` — Latest approved concept reference board (composition reference only).
- `docs/learning-garden-handoff/references/homepage/home_desktop_1440x900.png` — Real Flyer homepage screenshot.
- `docs/learning-garden-handoff/references/homepage/current_home_1440.png` — Flyer homepage viewport capture.
- `docs/learning-garden-handoff/references/homepage/planet_ioe.png` — Starters / Knowledge Arena 3D diorama reference.
- `docs/learning-garden-handoff/references/homepage/planet_movers.png` — Movers 3D diorama reference.
- `docs/learning-garden-handoff/references/homepage/planet_flyers.png` — Flyers 3D diorama reference.
- `docs/learning-garden-handoff/references/mascot/mascot_waving_lion.png` — Official waving lion mascot.
- `docs/learning-garden-handoff/references/mascot/mascot_reading_lion.png` — Official reading lion mascot.
- `docs/learning-garden-handoff/references/mascot/mascot_standing_front.png` — Official standing front mascot.
- `docs/learning-garden-handoff/references/mascot/mascot_sitting_wink.png` — Official sitting wink mascot.
- `docs/learning-garden-handoff/references/mascot/mascot_hero_standing.png` — High-res hero mascot.
- `docs/learning-garden-handoff/backgrounds/learning_garden_sky_hd_2560x1440.webp` — Candidate 1 (Daytime Sky).
- `docs/learning-garden-handoff/backgrounds/login_sky_ai_hd_1920x1080.webp` — Candidate 2 (Sunrise Sky).
- `docs/learning-garden-handoff/backgrounds/review_candidate1_1920x1080.png` — Candidate 1 standalone review (1920×1080).
- `docs/learning-garden-handoff/backgrounds/review_candidate1_1366x768.png` — Candidate 1 standalone review (1366×768).
- `docs/learning-garden-handoff/backgrounds/review_candidate2_1920x1080.png` — Candidate 2 standalone review (1920×1080).
- `docs/learning-garden-handoff/backgrounds/preview_background.html` — Interactive visual review viewer.

### 2. Source Code & Components
- `src/app/login/page.tsx` — Login page entry point.
- `src/components/auth/auth-page-shell.tsx` — Current layout shell.
- `src/components/auth/login-form.tsx` — Original Login form component.
- `src/components/auth/login-form.test.tsx` — Unit test suite for login form.
- `src/constants/mascot.ts` — Official mascot asset catalog.
- `src/public/assets/learning-garden/background/sky_daytime_illustrated.webp` — Staged background asset.
- `scratch/checkpoint-phase0/` — Full recoverable safety backup of pre-redesign auth components.

---

## E. Current Implementation Status

### Implemented & Verified
- Phase 0 safe checkpoint created in `scratch/checkpoint-phase0/`.
- Production asset folders created: `src/public/assets/learning-garden/{background,island,mascot,foreground,ui}`.
- Dedicated redesign workspace created: `src/components/auth/learning-garden-v2/`.
- Phase 1 blueprint updated to Revision 2 with all 8 user corrections incorporated and verified.
- Visual review testing tool created: `scratch/preview_background.html` (and copied to handoff).

### Planned (Awaiting Explicit Approval)
- Phase 2: User approval of background artwork asset.
- Phase 3: Original 3D island terrain artwork generation (craggy rock underside, tiered grass, tree, stepping stones).
- Phase 4: Hero mascot seating with contact occlusion pass.
- Phase 5: 3D book stack and interactive butterfly integration.
- Phase 6: Code integration into `learning-garden-v2` and switching `AuthPageShell`.
- Phase 7: Multi-viewport audit (1920x1080 down to 320x568).

---

## F. Technical Verification Record

Both checks were executed on `2026-11-21T10:32:00+07:00`:

1. **Unit Test Suite:**
   - Command: `cd src; npm test -- login-form.test.tsx`
   - Result: **PASS** (1 test file passed, 4/4 tests passed in 1.24s).
2. **TypeScript Compilation:**
   - Command: `cd src; npx tsc --noEmit`
   - Result: **PASS** (0 errors).
3. **Runtime Asset Check:**
   - Verified that no code in `src/` imports `concept_reference.jpg` or any temporary uploaded files.

---

## G. Image Generation Subagent Status

- **Model Used:** `gemini-3.1-flash-image` (invoked via `image-generator` subagent).
- **Error Encountered:** `429 Too Many Requests (RESOURCE_EXHAUSTED)`.
- **API Error Details:**
  - Code: `429`
  - Message: `You have exhausted your capacity on this model.`
  - Quota Reset Timestamp: `2026-11-21T06:58:22Z` (UTC) = **`13:58:22` GMT+7 (approximately 3 hours from handoff)**.
- **Handling Strategy:**
  - As instructed, the subagent did not loop or spam retry.
  - Existing high-resolution candidate assets were staged and made available for review in `docs/learning-garden-handoff/backgrounds/`.

---

## H. Exact Next Action for the Incoming Agent

1. **DO NOT** begin Phase 3 automatically.
2. **Continue Phase 2 — Background Artwork Review ONLY.**
3. Ask the user whether they approve:
   - **Candidate 1:** `docs/learning-garden-handoff/backgrounds/learning_garden_sky_hd_2560x1440.webp` (Daytime sky matching Flyer morning blue and upper-right daylight).
   - **Candidate 2:** `docs/learning-garden-handoff/backgrounds/login_sky_ai_hd_1920x1080.webp` (Sunrise sky).
   - Or wait until `13:58:22` GMT+7 to generate a fresh background via `image-generator`.
4. Only upon **explicit user approval of the background** may the agent proceed to Phase 3 (Island Base Artwork).
