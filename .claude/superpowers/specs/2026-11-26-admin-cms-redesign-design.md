# Admin CMS Shell & Visual Redesign — Direction B (Refined Navy Branded)

Date: 2026-11-26. Repo: `luyenthiao.com-Web`. Status: Approved by user ("B đi xây dựng giúp tôi" → "oke triển đi").

## Intent

Redesign and polish the `/admin/*` CMS shell and existing admin screens (`overview`, `exam list`, `exam editor`, `part forms`, `media dialogs`) from the current clunky white/kid-game hybrid into a refined **Navy Branded CMS** (**Direction B**):

- Eliminate kid-game typography (`Baloo 2` + `Nunito` + `tracking-wider`) and chunky `rounded-3xl font-black uppercase` styling inside `/admin/*` without altering any student-facing route.
- Introduce proper visual hierarchy and depth: a deep navy gradient sidebar with desktop collapse toggle, a crisp 56px sticky topbar (`AdminTopbar`), a subtle `slate-50` workspace canvas (`--color-admin-canvas`) separating white elevated cards (`rounded-xl border-slate-200 shadow-xs`), and refined `rounded-lg` SaaS controls.
- Complete the unfinished light-theme migration of `MediaBrowserDialog` and `MediaPickerField` (Task 5 of the 2026-11-24 plan) so `admin-light-theme.test.ts` passes with zero dark-theme leftovers.
- Add a clean `/admin` overview route so visiting `/admin` renders a dedicated CMS home instead of 404.

## Scope & Boundaries

- **In scope (Web only):**
  - Scoped `Inter` typography (`--font-admin-sans`) and `.admin-theme` CSS isolation in `src/lib/fonts.ts`, `src/app/layout.tsx`, and `src/app/globals.css`.
  - Redesigned shell components in `src/components/admin/shell/`: `AdminShell`, `AdminSidebar`, `AdminTopbar`, `AdminPageHeader`, `admin-nav.ts`, `admin-nav-match.ts`.
  - New `/admin` route (`src/app/admin/page.tsx`) + `AdminOverview` (`src/components/admin/overview/admin-overview.tsx`) + `ROUTES.ADMIN_HOME` in `src/constants/index.ts`.
  - Visual refinement (no `useExamStore` / `useExamEditorStore` / `admin-draft` / `validateExam` behaviour changes, except adding client-side search filter on the exam table and fixing the misleading Back button label in `ExamEditor` from `Sửa đề thi` / `Tạo đề mới` to `Quay lại`):
    - `src/components/admin/exam/exam-list-table.tsx`
    - `src/components/admin/exam/editor/`: `exam-editor.tsx`, `part-card.tsx`, `editor-field.tsx`, `tags-input.tsx`, `validation-panel.tsx`, `questions-json-editor.tsx`, `part-preview.tsx`, `box-picker/box-picker.tsx`
    - `src/components/admin/exam/editor/form/`: `part-settings-fields.tsx`, `part-form-dragdrop.tsx`, `part-form-gapfill.tsx`, `part-form-matching.tsx`, `part-form-multichoice.tsx`
  - Light-theme re-skin & polish of `src/components/admin/media/media-browser-dialog.tsx` and `src/components/admin/media/media-picker-field.tsx`.
  - Unit tests covering all modified/new components and passing `admin-light-theme.test.ts`.
- **Out of scope:**
  - Backend changes, wiring exams to `/api/exams` or R2 uploads, building new backend-backed admin modules (questions, grading, planets, users, etc.), modifying student-facing pages, or git commits (require explicit user approval per `.claude/rules/git.md`).

## Architecture & Design

### 1. Typography & CSS Token Isolation

- `src/lib/fonts.ts`: export `inter = Inter({ subsets: ['vietnamese', 'latin'], weight: ['400', '500', '600', '700'], variable: '--font-admin-sans', display: 'swap' })`.
- `src/app/layout.tsx`: attach `${inter.variable}` alongside `${baloo2.variable} ${nunito.variable}` on `<html>` (fonts only load CSS custom properties; student styles remain unchanged).
- `src/app/globals.css`:
  - Inside `@theme inline`:
    - `--font-admin: var(--font-admin-sans), ui-sans-serif, system-ui, sans-serif;`
    - `--color-admin-sidebar: #0b2550;`
    - `--color-admin-sidebar-deep: #071936;`
    - `--color-admin-sidebar-hover: #13356b;`
    - `--color-admin-sidebar-border: #1b427d;`
    - `--color-admin-sidebar-active: #1a478a;`
    - `--color-admin-accent: #60a5fa;`
    - `--color-admin-canvas: #f8fafc;`
    - Keep `--color-admin-primary: #0062d1;` and `--color-admin-primary-hover: #0055b3;` (WCAG AA 5.73:1 / 7.1:1 with white text).
  - Inside `@layer base` (after global `body` / `h1..h6` rules):
    - `.admin-theme`: `font-family: var(--font-admin); letter-spacing: normal; color: #0f172a;`
    - `.admin-theme :is(h1, h2, h3, h4, h5, h6)`: `font-family: var(--font-admin); letter-spacing: -0.02em;`

### 2. Shell Layout (`AdminShell`, `AdminSidebar`, `AdminTopbar`, `AdminPageHeader`)

- **Guard & Mount**: `src/app/admin/layout.tsx` remains `<RequireAuth><RequireAdmin><AdminShell>{children}</AdminShell></RequireAdmin></RequireAuth>`. `AdminShell` renders the `.admin-theme` root container with `bg-admin-canvas`.
- **Navigation Config (`admin-nav.ts` & `admin-nav-match.ts`)**:
  - `AdminNavItem` adds optional `exact?: boolean`.
  - `ADMIN_NAV`:
    - Group `Tổng quan`: `{ label: 'Trang tổng quan', href: '/admin', icon: LayoutDashboard, exact: true }`
    - Group `Nội dung`: `{ label: 'Đề thi', href: '/admin/exam', icon: FileText }`
  - `isAdminNavActive(pathname, href, exact?)`: if `exact` is true, returns `pathname === href`; otherwise `pathname === href || pathname.startsWith(href + '/')`. This ensures `/admin/exam` never activates `/admin`.
- **Sidebar (`AdminSidebar`)**:
  - Supports `collapsed?: boolean` (desktop icon-rail mode `w-17` = 68px vs expanded `w-64` = 256px) and `onNavigate?: () => void`.
  - Visual style: `bg-gradient-to-b from-admin-sidebar to-admin-sidebar-deep border-r border-admin-sidebar-border text-white`.
  - Note on `admin-light-theme.test.ts`: `admin-sidebar.tsx` renders inside `shell/`, and `admin-light-theme.test.ts` scans all `.tsx` files under `components/admin/` for `text-white/\d` and `bg-white/\d`! To avoid false positives in `admin-light-theme.test.ts` (Wait: verify how `admin-sidebar.tsx` interacts with `admin-light-theme.test.ts` — use semantic solid/hex tokens in `@theme` like `text-admin-sidebar-muted` or `bg-admin-sidebar-card` instead of `text-white/70` or `bg-white/10`, so `admin-light-theme.test.ts` passes cleanly across the ENTIRE `components/admin/` tree!).
  - Brand header (`h-14`): blue gradient logo square `L` + `Luyenthiao` + `CMS` pill (collapses cleanly to `L` when `collapsed`).
  - Nav items: active state uses `bg-admin-sidebar-active text-white shadow-[inset_3px_0_0_var(--color-admin-accent)]` (or `border-l-2 border-admin-accent`); collapsed state keeps `aria-label` / `title` and accessible link text via `sr-only` so `getByRole('link', { name: ... })` always works.
  - Footer: compact user box with initials avatar + display name (`fullName || username`) + `Quản trị viên` (`user?.role` badge kept accessible), `Về trang học viên` (`/`), `Đăng xuất`.
- **Topbar (`AdminTopbar`)**:
  - Sticky `h-14 border-b border-slate-200 bg-white` bar at top of the right workspace column.
  - Left: mobile drawer button (`lg:hidden`, `aria-label="Mở menu quản trị"`, `aria-expanded`, `aria-controls`) + desktop sidebar collapse button (`hidden lg:inline-flex`, `aria-label`, `aria-pressed={collapsed}`) + subtle route context breadcrumb (`Luyenthiao CMS / <section>`).
  - Right: subtle status pill (`Lưu cục bộ`) + compact `Về trang học viên` shortcut on desktop if helpful.
- **Page Header (`AdminPageHeader`)**:
  - Clean editorial header: compact `text-xs` breadcrumb `<nav aria-label="Đường dẫn">` (when provided), `<h1>` (`text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl`), optional `description` (`text-sm text-slate-500`), right-aligned `actions` slot. No thick bottom rule needed or subtle `pb-5`.

### 3. Overview Page (`/admin`)

- `src/app/admin/page.tsx`: Server Component orchestrator with full 5-field `metadata` (`robots: { index: false, follow: false }`).
- `src/components/admin/overview/admin-overview.tsx`: Client component hydrating `useExamStore` to display live summary KPI cards (Tổng số đề thi, Tổng số phần thi, Cấp độ hiện có) + quick-action cards ("Quản lý đề thi", "Tạo đề thi mới") + a concise note indicating local browser storage mode.

### 4. Refined Surfaces, Controls & Media Re-skin

- **Unified Surface & Control Language** (applied across `exam-list-table`, `exam-editor`, `part-card`, `editor-field`, `tags-input`, `validation-panel`, `questions-json-editor`, `part-preview`, `box-picker`, `part-settings-fields`, `part-form-*`, `media-*`):
  - **Cards**: `rounded-xl border border-slate-200 bg-white shadow-xs` (nested cards: `rounded-lg border border-slate-200 bg-slate-50/70`).
  - **Buttons**: `rounded-lg px-3.5 py-2 text-sm font-semibold` (primary: `bg-admin-primary hover:bg-admin-primary-hover text-white shadow-xs`; secondary: `border border-slate-300 bg-white text-slate-700 hover:bg-slate-50`; danger: `border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100`).
  - **Inputs / Selects / Textareas**: `rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-normal text-slate-900 placeholder:text-slate-500 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 focus:outline-none`.
  - **Labels**: `text-xs font-medium text-slate-600` (no `text-[11px] font-black uppercase`).
  - **Exam List Table**: adds a search filter bar (by exam name, ID, or level) inside the table card header toolbar; cleaner row spacing, subtle status/level pills, compact 32x32 bordered action icon buttons.
  - **Media Components (`MediaBrowserDialog` & `MediaPickerField`)**: white modal (`bg-white border border-slate-200 text-slate-900 shadow-xl`), light search input, `bg-slate-50` thumbnail cards with `border-admin-primary ring-2 ring-admin-primary/20` selection state, light audio rows, light url-paste controls.
  - **Zero Dark-Theme Markers**: No `bg-white/\d`, `text-white/\d`, `border-white/`, `backdrop-blur`, `bg-slate-900`, `placeholder:text-slate-400`, or `min-h-screen` with dark styles anywhere in `src/components/admin/**/*.tsx`.

## Verification Plan

1. **Automated checks (from `D:\luyenthiao\luyenthiao.com-Web\src`)**:
   - `npx prettier --write` on every changed/created file.
   - `npx tsc --noEmit` → 0 errors.
   - `npx eslint` on changed files → 0 errors (and `npm run lint` adds 0 new errors above baseline).
   - `npm test` → all unit tests pass, including updated `admin-light-theme.test.ts` scanning all admin components.
2. **Runtime verification in Chrome (against running `:3001`)**:
   - Inspect `/admin`, `/admin/exam`, `/admin/exam/new`, part forms, and `MediaBrowserDialog` at desktop (`1280×800`) and drawer breakpoint (`< 1024px`).
   - Verify sidebar collapse/expand, mobile drawer keyboard navigation (Escape + focus restore), search filter in exam table, media selection, and zero console/hydration errors.
