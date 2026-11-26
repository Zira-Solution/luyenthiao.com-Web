# Admin CMS Shell & Visual Redesign (Direction B) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans (or subagent-driven-development) to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign `/admin/*` into Direction B ("Navy Branded Tinh Chỉnh") with scoped `Inter` typography, collapsible navy sidebar, sticky white `AdminTopbar`, `slate-50` workspace canvas, `/admin` overview route, polished exam/part controls, and light-themed media dialogs.

**Architecture:** Load `Inter` (`--font-admin-sans`) in `RootLayout` and isolate admin typography under `.admin-theme` in `globals.css` so student pages are untouched. Refactor `AdminShell` to manage mobile drawer + desktop sidebar collapse alongside a new `AdminTopbar` and `AdminPageHeader`; add `AdminOverview` at `/admin`; refine `ExamListTable`, `ExamEditor`, part forms, and complete the light re-skin of `MediaBrowserDialog` + `MediaPickerField`.

**Tech Stack:** Next.js 16.4.6 (App Router), React 19, Tailwind CSS v4 (`@theme inline`), `@base-ui/react`, Zustand 5, lucide-react, Vitest 4 + Testing Library.

**Spec:** `.claude/superpowers/specs/2026-11-26-admin-cms-redesign-design.md`

---

## Global Rules & Constraints
- All commands run from `D:\luyenthiao\luyenthiao.com-Web\src` (uppercase drive letter `D:` required by Vitest on Windows).
- Coding rules (`.claude/rules/coding.md`): named exports, explicit `ReactElement`/`React.ReactElement` return type, `[ComponentName]Props` interface directly above each component, import order (Node → External → `@/` → relative), `cn()` for conditional classes, no arbitrary hex colours in `.tsx`, barrel exports in `index.ts`.
- Do NOT run `git commit`/`git add` without explicit owner approval (`.claude/rules/git.md`).
- Format modified `.ts`/`.tsx` files with `npx prettier --write <files>` (never `npm run format`).
- Do not kill the running dev servers on `:3001` / `:3005`.

---

### Task 1: Scoped Typography (`Inter`) & Refined Navy `@theme` Tokens

**Files:**
- Modify: `src/lib/fonts.ts`
- Modify: `src/app/layout.tsx`
- Modify: `src/app/globals.css`
- Test: `src/app/admin/layout.test.tsx` (verified via shell render in Task 2)

- [ ] **Step 1: Add `inter` Google Font export to `src/lib/fonts.ts`**

```ts
import { Baloo_2, Inter, Nunito } from 'next/font/google'

export const baloo2 = Baloo_2({
  subsets: ['vietnamese', 'latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-baloo',
  display: 'swap',
})

export const nunito = Nunito({
  subsets: ['vietnamese', 'latin'],
  weight: ['300', '400', '500', '600', '700', '800', '900'],
  variable: '--font-nunito',
  display: 'swap',
})

export const inter = Inter({
  subsets: ['vietnamese', 'latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-admin-sans',
  display: 'swap',
})
```

- [ ] **Step 2: Register `${inter.variable}` on `<html>` in `src/app/layout.tsx`**
  - Import `inter` from `@/lib/fonts` and update `className={`${baloo2.variable} ${nunito.variable} ${inter.variable}`}`.

- [ ] **Step 3: Update admin tokens and `.admin-theme` scope in `src/app/globals.css`**
  - In `@theme inline`:
    ```css
    --font-admin: var(--font-admin-sans), ui-sans-serif, system-ui, sans-serif;
    /* Admin CMS shell — Direction B (Refined Navy Branded) */
    --color-admin-sidebar: #0b2550;
    --color-admin-sidebar-deep: #071936;
    --color-admin-sidebar-hover: #13356b;
    --color-admin-sidebar-border: #1b427d;
    --color-admin-sidebar-active: #1a478a;
    --color-admin-sidebar-fg: #dbe6f6;
    --color-admin-sidebar-muted: #9eb4d6;
    --color-admin-sidebar-card: #103063;
    --color-admin-accent: #60a5fa;
    --color-admin-canvas: #f8fafc;
    --color-admin-primary: #0062d1;
    --color-admin-primary-hover: #0055b3;
    ```
  - Inside `@layer base` (after `h1..h6` & `html` rules):
    ```css
    .admin-theme {
      font-family: var(--font-admin);
      letter-spacing: normal;
      color: #0f172a;
    }
    .admin-theme :is(h1, h2, h3, h4, h5, h6) {
      font-family: var(--font-admin);
      letter-spacing: -0.02em;
    }
    ```

- [ ] **Step 4: Format & type-check**
  Run: `npx prettier --write lib/fonts.ts app/layout.tsx app/globals.css && npx tsc --noEmit`
  Expected: 0 TypeScript errors.

---

### Task 2: Navigation Config, Collapsible Navy Sidebar, Sticky `AdminTopbar` & `AdminPageHeader`

**Files:**
- Modify: `src/constants/index.ts` (add `ADMIN_HOME: '/admin'`)
- Modify: `src/components/admin/shell/admin-nav.ts`
- Modify: `src/components/admin/shell/admin-nav-match.ts`
- Create: `src/components/admin/shell/admin-topbar.tsx`
- Modify: `src/components/admin/shell/admin-sidebar.tsx`
- Modify: `src/components/admin/shell/admin-shell.tsx`
- Modify: `src/components/admin/shell/admin-page-header.tsx`
- Modify: `src/components/admin/shell/index.ts`
- Update Tests: `admin-nav-match.test.ts`, `admin-sidebar.test.tsx`, `admin-shell.test.tsx`, `admin-page-header.test.tsx`

- [ ] **Step 1: Update tests first (TDD)**
  - `admin-nav-match.test.ts`: test `isAdminNavActive('/admin', '/admin', true)` → `true`; `isAdminNavActive('/admin/exam', '/admin', true)` → `false`; existing `/admin/exam` tests still pass.
  - `admin-sidebar.test.tsx`: assert `Trang tổng quan` (`/admin`) and `Đề thi` (`/admin/exam`) render; `/admin/exam/x` marks ONLY `Đề thi` as `aria-current="page"` (not `Trang tổng quan`); `/admin` marks `Trang tổng quan`; `collapsed` prop keeps accessible links and hides group headings cleanly.
  - `admin-shell.test.tsx`: test desktop collapse button (`aria-label="Thu gọn menu quản trị"` toggles `aria-pressed="true"` and switches to `"Mở rộng menu quản trị"`), `.admin-theme` class on shell root, and existing mobile drawer Escape/overlay/route-change tests.

- [ ] **Step 2: Run shell tests to verify RED**
  Run: `npx vitest run components/admin/shell`
  Expected: FAIL on new `/admin` nav item, `exact` matching, and collapse toggle.

- [ ] **Step 3: Implement `admin-nav.ts`, `admin-nav-match.ts`, `admin-topbar.tsx`, `admin-sidebar.tsx`, `admin-shell.tsx`, `admin-page-header.tsx`, `index.ts`**
  - `admin-nav.ts`:
    - `AdminNavItem`: `{ label: string; href: string; icon: LucideIcon; exact?: boolean }`
    - `ADMIN_NAV`: Group `Tổng quan` (`Trang tổng quan` → `/admin`, `LayoutDashboard`, `exact: true`), Group `Nội dung` (`Đề thi` → `/admin/exam`, `FileText`).
  - `admin-nav-match.ts`:
    - `isAdminNavActive(pathname: string, href: string, exact = false): boolean`
  - `admin-sidebar.tsx`:
    - `AdminSidebarProps`: `{ collapsed?: boolean; onNavigate?: () => void }`
    - Uses `bg-gradient-to-b from-admin-sidebar to-admin-sidebar-deep border-r border-admin-sidebar-border text-white`.
    - Zero `text-white/\d` or `bg-white/\d` classes (uses `text-admin-sidebar-fg`, `text-admin-sidebar-muted`, `bg-admin-sidebar-card`, `bg-admin-sidebar-active`, `hover:bg-admin-sidebar-hover`, `border-admin-sidebar-border`, `border-admin-accent`).
    - Brand block: `L` logo badge + `Luyenthiao` + `CMS` pill (or centered `L` when `collapsed`). Keep `Luyenthiao CMS` text in DOM (`sr-only` when collapsed or split with accessible `Luyenthiao` + `CMS`? Wait: `admin-sidebar.test.tsx` line 44 expects `screen.getByText('Luyenthiao CMS')` or update test cleanly to match `Luyenthiao` + `CMS` — let's keep `<span className={cn(...)}>Luyenthiao CMS</span>` or update the test intentionally!). Keeping `Luyenthiao` + `<span className="...">CMS</span>` and updating `admin-sidebar.test.tsx` to check `Luyenthiao` and `CMS` is super clean and clear.
    - Footer: initials avatar circle + `fullName || username` + `user?.role` pill + `Về trang học viên` + `Đăng xuất`.
  - `admin-topbar.tsx`:
    - `AdminTopbarProps`: `{ drawerId: string; drawerOpen: boolean; onOpenDrawer: () => void; collapsed: boolean; onToggleCollapse: () => void; sectionLabel: string }`
    - Renders sticky `h-14 border-b border-slate-200 bg-white` bar with mobile drawer trigger (`< lg`), desktop collapse button (`>= lg`), `Luyenthiao CMS / {sectionLabel}`, and right-side subtle storage pill (`Lưu cục bộ`).
  - `admin-shell.tsx`:
    - Root `<div className="admin-theme bg-admin-canvas min-h-screen text-slate-900">`
    - `collapsed` state (`useState(false)`), `<aside>` switches between `lg:w-64` and `lg:w-17`, right wrapper switches between `lg:pl-64` and `lg:pl-17`.
    - Renders `<AdminTopbar ... />` above `<main><div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">{children}</div></main>`.
  - `admin-page-header.tsx`:
    - Clean `<h1>` (`text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl`), compact breadcrumb (`text-xs text-slate-500`), description (`text-sm text-slate-500`), right `actions`.

- [ ] **Step 4: Run shell & layout tests to verify GREEN**
  Run: `npx vitest run components/admin/shell app/admin/layout.test.tsx`
  Expected: all PASS.

---

### Task 3: Add `/admin` Overview Page

**Files:**
- Create: `src/components/admin/overview/admin-overview.tsx`
- Create: `src/components/admin/overview/admin-overview.test.tsx`
- Create: `src/components/admin/overview/index.ts`
- Modify: `src/components/admin/index.ts`
- Create: `src/app/admin/page.tsx`

- [ ] **Step 1: Write failing test `src/components/admin/overview/admin-overview.test.tsx`**
  - Seeds `useExamStore` with 2 sample exams and asserts: single `h1` (`Tổng quan quản trị`), exam/part counts displayed, link `Quản lý đề thi` → `/admin/exam`, button/link `Tạo đề mới` → `/admin/exam/new`, and no dark-theme markers.

- [ ] **Step 2: Run test to verify RED**
  Run: `npx vitest run components/admin/overview/admin-overview.test.tsx`

- [ ] **Step 3: Implement `AdminOverview` and `src/app/admin/page.tsx`**
  - `src/app/admin/page.tsx`: 5-field `metadata` (`robots: { index: false, follow: false }`), renders `<AdminOverview />` only.
  - `AdminOverview`: `AdminPageHeader` + 3 KPI cards (`Tổng đề thi`, `Tổng phần thi`, `Cấp độ hiện có`) + 2 quick-action cards (`Quản lý đề thi`, `Tạo đề thi mới`).

- [ ] **Step 4: Run test to verify GREEN**
  Run: `npx vitest run components/admin/overview/admin-overview.test.tsx`

---

### Task 4: Re-skin & Polish `MediaBrowserDialog` and `MediaPickerField` (Completes Light-Theme Guard)

**Files:**
- Modify: `src/components/admin/media/media-browser-dialog.tsx`
- Modify: `src/components/admin/media/media-picker-field.tsx`
- Create: `src/components/admin/media/media-components.test.tsx`

- [ ] **Step 1: Write failing test `media-components.test.tsx`**
  - Renders `MediaPickerField` (empty, with value, and in `urlMode`) and `MediaBrowserDialog` (open with mocked `useMediaLibrary`), asserting zero dark-theme markers and clean light surfaces + selection state.

- [ ] **Step 2: Run `admin-light-theme.test.ts` and `media-components.test.tsx` to verify RED**
  Run: `npx vitest run components/admin/admin-light-theme.test.ts components/admin/media/media-components.test.tsx`

- [ ] **Step 3: Implement light-theme CMS styling in `MediaBrowserDialog` & `MediaPickerField`**
  - `MediaBrowserDialog`: `DialogContent` gets `admin-theme max-w-2xl border border-slate-200 bg-white text-slate-900 shadow-xl`, `DialogTitle` gets `font-sans text-base font-semibold text-slate-900`, search input `border-slate-300 bg-white text-slate-900 placeholder:text-slate-500`, `ImageCard` `border-slate-200 bg-slate-50` / active `border-admin-primary ring-2 ring-admin-primary/20`, `AudioRow` light card style, error box `border-rose-200 bg-rose-50 text-rose-700`.
  - `MediaPickerField`: thumbnail box `border-slate-200 bg-slate-50`, dashed placeholder `border-slate-300 bg-slate-50 text-slate-400`, buttons `rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50`, delete button `border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100`, URL input light style, warning `text-amber-700`.

- [ ] **Step 4: Run `admin-light-theme.test.ts` and `media-components.test.tsx` to verify GREEN**
  Run: `npx vitest run components/admin/admin-light-theme.test.ts components/admin/media/media-components.test.tsx`
  Expected: PASS (`offenders` = `[]`).

---

### Task 5: Polish `ExamListTable` (Search Toolbar, Clean Table & SaaS Controls)

**Files:**
- Modify: `src/components/admin/exam/exam-list-table.tsx`
- Update Test: `src/components/admin/exam/exam-list-table.test.tsx`

- [ ] **Step 1: Add search filter test case to `exam-list-table.test.tsx`**
  - Test filtering rows by typing into the search input (`Tìm theo tên đề, ID hoặc cấp độ…`).

- [ ] **Step 2: Run `exam-list-table.test.tsx` to verify RED**
  Run: `npx vitest run components/admin/exam/exam-list-table.test.tsx`

- [ ] **Step 3: Polish `exam-list-table.tsx`**
  - Keep `AdminPageHeader` props/breadcrumbs/action button labels (`Tạo đề mới`, `Nhập`, `Xuất`) and `bg-admin-primary` token.
  - Replace `rounded-xl font-black uppercase` buttons with `rounded-lg font-semibold` / `font-medium`.
  - Wrap table in `rounded-xl border border-slate-200 bg-white shadow-xs` with a top toolbar containing the search input + exam count.
  - Clean table header (`bg-slate-50/80 text-xs font-semibold text-slate-500`), refined level pill (`bg-blue-50 text-blue-700`), structure badges, and bordered 32x32 action icon buttons.

- [ ] **Step 4: Run `exam-list-table.test.tsx` to verify GREEN**

---

### Task 6: Polish Exam Editor Core & Part Forms (Refined Cards, Labels, Inputs, Back Button)

**Files:**
- Modify: `src/components/admin/exam/editor/exam-editor.tsx`
- Modify: `src/components/admin/exam/editor/editor-field.tsx`
- Modify: `src/components/admin/exam/editor/part-card.tsx`
- Modify: `src/components/admin/exam/editor/validation-panel.tsx`
- Modify: `src/components/admin/exam/editor/questions-json-editor.tsx`
- Modify: `src/components/admin/exam/editor/part-preview.tsx`
- Modify: `src/components/admin/exam/editor/tags-input.tsx`
- Modify: `src/components/admin/exam/editor/box-picker/box-picker.tsx`
- Modify: `src/components/admin/exam/editor/form/part-settings-fields.tsx`
- Modify: `src/components/admin/exam/editor/form/part-form-dragdrop.tsx`
- Modify: `src/components/admin/exam/editor/form/part-form-gapfill.tsx`
- Modify: `src/components/admin/exam/editor/form/part-form-matching.tsx`
- Modify: `src/components/admin/exam/editor/form/part-form-multichoice.tsx`
- Update Test: `src/components/admin/exam/editor/editor-light-theme.test.tsx`

- [ ] **Step 1: Update `editor-light-theme.test.tsx` expectation for the Back button label (`Quay lại`)**
  - Line 144: verify `screen.getByRole('button', { name: /Quay lại/ })` navigates to `/admin/exam`.

- [ ] **Step 2: Run `editor-light-theme.test.tsx` to verify RED**

- [ ] **Step 3: Polish all 13 editor & form files**
  - Cards: `rounded-3xl`/`rounded-2xl` → `rounded-xl border border-slate-200 bg-white shadow-xs` (sub-cards `rounded-lg border border-slate-200 bg-slate-50/70`).
  - Inputs/selects/textareas: `rounded-lg border-slate-300 text-sm font-normal`.
  - Labels & headings: replace `font-black uppercase` with `text-xs font-medium text-slate-600` (labels) and `text-sm font-semibold text-slate-900` (section headings).
  - Buttons: `rounded-lg font-medium` / `font-semibold`; `ExamEditor` back button text → `Quay lại`.
  - Keep `PartFormDragdrop` active row classes (`border-brand-primary ring-1 bg-slate-50` + `text-slate-700` on `Đang chọn để vẽ`) so `part-forms-light-theme.test.tsx` contrast assertions stay green.

- [ ] **Step 4: Run editor & part form tests**
  Run: `npx vitest run components/admin`
  Expected: all admin test files PASS.

---

### Task 7: Full Automated Verification & Live Chrome Verification (`:3001`)

- [ ] **Step 1: Prettier on all changed/created files**
  Run: `npx prettier --write <changed files>`

- [ ] **Step 2: TypeScript, ESLint, Full Vitest Suite**
  Run:
  - `npx tsc --noEmit` → 0 errors
  - `npx eslint components/admin app/admin lib/fonts.ts app/layout.tsx constants/index.ts` → 0 errors
  - `npm test` → all test files pass

- [ ] **Step 3: Live browser verification on `http://localhost:3001`**
  - Open `/admin`, `/admin/exam`, `/admin/exam/new` via browser subagent (using seeded local admin if needed), inspect desktop (`1280×800`) and drawer breakpoint, test sidebar collapse/expand, drawer Escape/focus, search filter, `MediaBrowserDialog`, and verify clean console output.
