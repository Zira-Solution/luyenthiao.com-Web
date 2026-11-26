# Admin CMS Shell Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give every `/admin` page one shared CMS frame (deep-blue sidebar on the left, white content area on the right) and re-skin the existing admin pages to the light content area.

**Architecture:** A client `AdminShell` mounted once in `app/admin/layout.tsx` (inside `RequireAuth` + `RequireAdmin`) renders a data-driven `AdminSidebar` and the content slot; pages use a shared `AdminPageHeader`. Tasks 2–5 replace the dark game-theme classes in the existing admin components with light classes, with no behaviour change; Task 6 is a Chrome verification by the controller.

**Tech Stack:** Next.js 16 (App Router), React, Tailwind 4 (`@theme` tokens), zustand, TanStack Query, lucide-react, Vitest + Testing Library.

**Spec:** `.claude/superpowers/specs/2026-11-24-admin-cms-shell-design.md` (this repo). Read it first.

Repo: `D:\luyenthiao\luyenthiao.com-Web`; run every npm command from `src/`.

## Global Constraints

- Spec: sidebar fixed 264 px from `lg` (1024 px) up; below `lg` a top bar with a menu button opens the sidebar as a drawer. Sidebar colour is the new token `--color-admin-sidebar: #0b2a5b` (deep navy), active item `brand-primary` (`#0075fb`), content area white.
- Web rules (`.claude/rules/coding.md`): named exports, explicit `React.ReactElement`/`ReactElement` return types, props interface named `[Component]Props` above the component, kebab-case files, every directory under `components/` has an `index.ts` barrel and imports go through the barrel, import order node → external → `@/` → relative with one blank line between groups, Tailwind only (no inline `style`, no CSS modules), colours only through `@theme` tokens or the default Tailwind palette (no arbitrary hex like `bg-[#fff]`), `cn()` from `@/lib/utils` for conditional classes. Code identifiers, comments and test names in English; user-visible strings in Vietnamese (existing strings keep their exact text).
- **Dark → light mapping** every re-skin task follows, so the pages end up consistent. Surfaces: `bg-white/5` → `bg-white border border-slate-200`; `bg-white/10` → `bg-slate-100`; `hover:bg-white/10` and `hover:bg-white/20` → `hover:bg-slate-100` and `hover:bg-slate-200`. Text: `text-white` → `text-slate-900`; `text-white/80` → `text-slate-700`; `text-white/60`, `/50`, `/40` → `text-slate-500`. Borders: `border-white/10` and `/20` → `border-slate-200` and `border-slate-300`. Inputs: `bg-white/10 text-white placeholder:text-white/40` → `bg-white text-slate-900 placeholder:text-slate-500 border border-slate-300 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 focus:outline-none`. Accent text `text-game-accent` → `text-brand-primary`. Primary buttons (`bg-game-cta-to hover:bg-game-cta-from`) → `bg-admin-primary hover:bg-admin-primary-hover text-white` (new tokens `--color-admin-primary: #0062d1` and `--color-admin-primary-hover: #0055b3`, added to `globals.css` with the other `admin-*` tokens; amended after the Task 1 and Task 2 reviews found white on `brand-primary` `#0075fb` is only 4.25:1, below AA for small text; white on the new tokens is about 5.7:1 and 7.1:1). Never use `bg-brand-primary` behind white small text in admin. Secondary buttons → `border border-slate-300 bg-white text-slate-700 hover:bg-slate-50`. Danger → `text-semantic-danger` or `bg-rose-50 text-rose-700 hover:bg-rose-100`. Remove `backdrop-blur`, `bg-dashboard-bg` and `bg-topbar-login-bg*`. `text-white` stays only on solid coloured buttons. Keep shapes (`rounded-*`), spacing and layout.
- **Testing rule for Tasks 2–4:** the media components (`@/components/admin/media`: `MediaPickerField`, `MediaBrowserDialog`) are re-skinned only in Task 5. If a component under test renders them, `vi.mock('@/components/admin/media', …)` with simple stubs so the "no dark-theme markers" assertion covers only the files of that task and does not fail for a later task's files.
- **No behaviour change** in Tasks 2–5: same props, exports, store calls, validation and text, including `window.confirm` / `window.alert`. Do not touch any file outside a task's list. No new npm dependency.
- No git writes (no `add`, `commit`, `push`, branch). Do not touch `src/package-lock.json` (already modified, not ours). Format only changed files with `npx prettier --write <file>`; never `npm run format`.
- Do not run `npm run build` in Tasks 1–5 (a dev server on :3001 uses `.next`); do not start, stop or restart any server.
- Baselines (measured 2026-11-24): `npx tsc --noEmit` 0 errors; `npm run lint` has 10 pre-existing errors elsewhere (none may be added: run `npx eslint` on your files); `npm test` 45 files / 315 tests passing (a load-related timeout in `dashboard-view.test.tsx` can occur once and pass on rerun).

## Review Focus

1. The active sidebar item must match nested routes (`/admin/exam/abc` activates "Đề thi") and must not match a sibling that merely shares a prefix (`/admin/examination`). Pinned in Task 1.
2. The drawer must close on Escape and on route change, return focus to the menu button, and expose `aria-expanded`/`aria-controls`. Pinned in Task 1.
3. The shell must render only for an admin: a signed-in non-admin must still see `NotFoundView` with no sidebar, and an unauthenticated visitor must still be redirected by `RequireAuth`. Pinned in Task 1 (layout composition test).
4. Long exam names and many table rows must not break the layout (the table scrolls horizontally inside the content area; page header text wraps). Checked in Task 6.
5. No dark-theme leftovers anywhere under `components/admin`, and nothing becomes invisible white-on-white. Pinned by the guard test in Task 5 and checked in Task 6.

---

### Task 1: Shared shell

**Files:**
- Modify: `src/app/globals.css` (add three tokens inside `@theme inline`, next to the other colour tokens)
- Create: `src/components/admin/shell/admin-nav.ts`, `admin-nav-match.ts`, `admin-sidebar.tsx`, `admin-shell.tsx`, `admin-page-header.tsx`, `index.ts` (barrel)
- Modify: `src/components/admin/index.ts` (re-export the shell barrel); `src/app/admin/layout.tsx`
- Test: `src/components/admin/shell/admin-nav-match.test.ts`, `admin-sidebar.test.tsx`, `admin-shell.test.tsx`, `admin-page-header.test.tsx`, `src/app/admin/layout.test.tsx`

**Interfaces:**
- Consumes: `RequireAuth`, `RequireAdmin` from `@/components/auth`; `NotFoundView` from `@/components/common`; `useAuthStore` (`state.user?.fullName`, `state.user?.username`, `state.user?.role`) from `@/store/auth-store`; `useLogout` from `@/hooks` (usage already in `components/common/topbar.tsx:392,580`: `logout.mutate(undefined, { onSettled: () => router.push('/') })`); `usePathname`, `useRouter` from `next/navigation`; `cn` from `@/lib/utils`; icons from `lucide-react`.
- Produces (later tasks and later admin pages rely on these exact names):
  - `admin-nav.ts`: `interface AdminNavItem { label: string; href: string; icon: LucideIcon }`, `interface AdminNavGroup { label: string; items: readonly AdminNavItem[] }`, `const ADMIN_NAV: readonly AdminNavGroup[]` with one group `Nội dung` containing one item `Đề thi` → `/admin/exam`.
  - `admin-nav-match.ts`: `function isAdminNavActive(pathname: string, href: string): boolean` — true when `pathname === href` or `pathname.startsWith(href + '/')`.
  - `AdminSidebar({ onNavigate?: () => void })` (nav landmark `aria-label="Menu quản trị"`, active link has `aria-current="page"`, brand block `Luyenthiao CMS`, footer with the user's display name (`fullName` or else `username`) and role, a link `Về trang học viên` → `/`, a button `Đăng xuất`).
  - `AdminShell({ children })` — desktop: fixed 264 px sidebar + scrolling white `main`; below `lg`: top bar with a menu button (`aria-label="Mở menu quản trị"`, `aria-expanded`, `aria-controls`) opening the sidebar as a drawer with an overlay.
  - `AdminPageHeader({ title, description?, breadcrumbs?, actions? })` with `breadcrumbs?: readonly { label: string; href?: string }[]`, `actions?: ReactNode`; renders the title as the page's `<h1>`, breadcrumbs inside `<nav aria-label="Đường dẫn">` (last item without a link, `aria-current="page"`), actions on the right (wrapping below the title on small screens).

- [ ] **Step 1: Write the failing tests** (English names; mock `next/navigation` and `@/hooks` the way `components/common/bottom-nav.test.tsx` and `dashboard-view.test.tsx` do; set the auth store with `useAuthStore.setState` and reset in `afterEach`):
  - `isAdminNavActive`: `('/admin/exam', '/admin/exam')` true; `('/admin/exam/abc', '/admin/exam')` true; `('/admin/examination', '/admin/exam')` false; `('/admin', '/admin/exam')` false. (Review Focus 1)
  - `AdminSidebar`: renders every item of `ADMIN_NAV`; with pathname `/admin/exam/x` the `Đề thi` link has `aria-current="page"`; shows the user's `fullName`, falling back to `username`; clicking `Đăng xuất` calls the mocked logout `mutate`; calling `onNavigate` when a link is clicked.
  - `AdminShell`: clicking the menu button sets `aria-expanded="true"` and shows the drawer; pressing Escape closes it and focus returns to the button; a pathname change closes it (re-render with a new mocked pathname). (Review Focus 2)
  - `AdminPageHeader`: the title is the only `h1`; breadcrumbs render links for all but the last item, the last has `aria-current="page"`; `actions` content is rendered.
  - `src/app/admin/layout.test.tsx`: with the store role `ADMIN` and status `authenticated`, children and the nav landmark render; with role `USER` and status `authenticated`, no `navigation` landmark is rendered (the not-found view appears). (Review Focus 3)
- [ ] **Step 2: Run them and confirm they fail** (modules do not exist yet).
  Run: `npx vitest run components/admin/shell app/admin/layout.test.tsx`
  Expected: FAIL (cannot resolve the new modules).
- [ ] **Step 3: Implement** the files and interfaces above. In `globals.css` add `--color-admin-sidebar: #0b2a5b`, `--color-admin-sidebar-hover: #12376f`, `--color-admin-sidebar-border: #1d4688`. Sidebar: `bg-admin-sidebar text-white`, items `text-white/80 hover:bg-admin-sidebar-hover`, active item `bg-brand-primary text-white`, visible `focus-visible` ring, `lg:fixed` layout with `lg:pl-[264px]` offset on the content wrapper (use the `w-66` / `pl-66` style utilities or the nearest Tailwind scale values rather than arbitrary pixel values if available; otherwise one arbitrary size is acceptable, no arbitrary colours). Content: `min-h-screen bg-white`, inner container `mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8`. `layout.tsx` becomes `<RequireAuth><RequireAdmin><AdminShell>{children}</AdminShell></RequireAdmin></RequireAuth>`. Pages keep their `metadata`.
- [ ] **Step 4: Run the tests again.** Expected: all PASS.
- [ ] **Step 5: Web checks** (in `src/`): `npx prettier --write` on every new/changed file; `npx tsc --noEmit` → 0 errors; `npx eslint` on the changed files → no errors; `npm test` → all passing.

### Task 2: Exam list page re-skin

**Files:**
- Modify: `src/components/admin/exam/exam-list-table.tsx`
- Test: `src/components/admin/exam/exam-list-table.test.tsx` (create)

**Interfaces:**
- Consumes: Task 1's `AdminPageHeader`, imported through `@/components/admin/shell` (barrel); `useExamStore` (`exams`, `hydrate`, `add`, `remove`, `exportAll`, `importFromFile`); the file's existing handlers stay as they are.
- Produces: no new exports; `ExamListTable` keeps its name and signature.

- [ ] **Step 1: Write the failing tests** (mock `next/navigation` `useRouter`; seed `useExamStore` with `setState`, stub `hydrate` if it touches `localStorage`):
  - `'renders the page header with the title and the three action buttons'`: one `h1` with text `Quản lý đề thi`; buttons `Tạo đề mới`, `Nhập`, `Xuất` exist; clicking `Tạo đề mới` pushes `/admin/exam/new`.
  - `'shows the empty state when there are no exams'` (text `Chưa có đề thi nào`).
  - `'renders one row per exam with its name'` and `'navigates to the editor when a name is clicked'`.
  - `'renders no dark-theme classes'`: the rendered container's `innerHTML` contains none of `bg-white/5`, `text-white/`, `border-white/`, `backdrop-blur`, `bg-dashboard-bg`.
- [ ] **Step 2: Run and confirm the first and last tests fail.**
  Run: `npx vitest run components/admin/exam/exam-list-table.test.tsx`
  Expected: header and no-dark-classes tests FAIL; behaviour tests may already pass.
- [ ] **Step 3: Implement**: replace the hand-built `<header>` with `AdminPageHeader` (title `Quản lý đề thi`, description `Tạo, sửa, xóa các đề thi được lưu cục bộ trên trình duyệt.`, breadcrumbs `Trang chủ` → `/` and `Đề thi`, the three buttons in `actions`), drop the outer `min-h-screen bg-dashboard-bg` wrapper and the `<main>` container (the shell provides them), and apply the dark → light mapping to the empty state and the table (wrap the table in `overflow-x-auto`). Do not change handlers, store calls, `window.confirm` / `window.alert`.
- [ ] **Step 4: Run the tests again.** Expected: all PASS.
- [ ] **Step 5: Web checks** as in Task 1 Step 5 (prettier, tsc, eslint on changed files, `npm test`).

### Task 3: Exam editor core re-skin

**Files:**
- Modify: `src/components/admin/exam/editor/exam-editor.tsx`, `part-card.tsx`, `editor-field.tsx`, `tags-input.tsx`, `validation-panel.tsx`, `questions-json-editor.tsx`, `part-preview.tsx`, `box-picker/box-picker.tsx`
- Modify: `src/app/admin/exam/[id]/page.tsx` only if it paints its own chrome (inspect first; if it does not, leave it untouched and say so)
- Test: `src/components/admin/exam/editor/editor-light-theme.test.tsx` (create)

**Interfaces:**
- Consumes: `AdminPageHeader` via `@/components/admin/shell`; the editor's existing props and store usage.
- Produces: no new exports; all existing exports keep names and props.

- [ ] **Step 1: Write the failing test**: render `ExamEditor` (look at the component's props and how `page.tsx` calls it; seed `useExamStore` with one exam containing one structure and one part, mock `next/navigation`) and assert (a) there is one `h1` (the editor header is now an `AdminPageHeader`), (b) the container's `innerHTML` contains none of the dark-theme markers from Task 2's last test. If rendering the full editor needs more mocking than is reasonable, render `PartCard`, `EditorField`, `TagsInput`, `ValidationPanel` individually with minimal props and assert the same markers, and say so in the report.
- [ ] **Step 2: Run and confirm it fails.** Run: `npx vitest run components/admin/exam/editor/editor-light-theme.test.tsx`. Expected: FAIL on the dark markers.
- [ ] **Step 3: Implement** the dark → light mapping across the eight files, turn the editor's own header into `AdminPageHeader` (title is the exam name or `Đề thi mới`; breadcrumbs `Trang chủ` → `/`, `Đề thi` → `/admin/exam`, current exam; the existing save / preview / back buttons go in `actions`), and remove any full-screen `min-h-screen` dark wrapper. No logic changes.
- [ ] **Step 4: Run the test again.** Expected: PASS.
- [ ] **Step 5: Web checks** as in Task 1 Step 5.

### Task 4: Part forms re-skin

**Files:**
- Modify: `src/components/admin/exam/editor/form/part-form-dragdrop.tsx`, `part-form-gapfill.tsx`, `part-form-matching.tsx`, `part-form-multichoice.tsx`, `part-settings-fields.tsx`
- Test: `src/components/admin/exam/editor/form/part-forms-light-theme.test.tsx` (create)

**Interfaces:**
- Consumes: each form's existing props (read the component signatures; build minimal valid props in the test).
- Produces: no new exports.

- [ ] **Step 1: Write the failing test**: for each of the five components, render it with minimal valid props and assert the container's `innerHTML` has none of the dark markers from Task 2 (`bg-white/5`, `text-white/`, `border-white/`, `backdrop-blur`, `bg-dashboard-bg`).
- [ ] **Step 2: Run and confirm it fails.** Run: `npx vitest run components/admin/exam/editor/form`. Expected: FAIL for each component that still has dark classes.
- [ ] **Step 3: Implement** the dark → light mapping across the five files. Inputs, selects, textareas and checkboxes must be readable (dark text on white, visible focus ring); drag handles and drop zones keep their affordance with light borders (`border-dashed border-slate-300`).
- [ ] **Step 4: Run the test again.** Expected: PASS.
- [ ] **Step 5: Web checks** as in Task 1 Step 5.

### Task 5: Media dialog and picker re-skin, plus the whole-tree guard

**Files:**
- Modify: `src/components/admin/media/media-browser-dialog.tsx`, `media-picker-field.tsx`
- Create (test): `src/components/admin/admin-light-theme.test.ts`

**Interfaces:**
- Consumes: the existing props of both components; Node `fs`/`path` for the guard test.
- Produces: no new exports.

- [ ] **Step 1: Write the failing guard test** `admin-light-theme.test.ts`: read every `.tsx` file under `src/components/admin` (recursive, via `fs`; locate the folder relative to the test file with `path`/`import.meta.url`; skip test files) and assert that none of them matches `/bg-white\/\d|text-white\/\d|border-white\/|backdrop-blur|bg-dashboard-bg|bg-topbar-login-bg|text-game-|bg-game-|bg-slate-900|placeholder:text-slate-400|placeholder:text-white\//` (the stronger marker set after the Task 3 review; a bare `text-white` cannot be judged statically and is covered by the per-component rendered tests and by Task 6); list the offending file names in the failure message. (Review Focus 5)
- [ ] **Step 2: Run and confirm it fails only on the two media files.**
  Run: `npx vitest run components/admin/admin-light-theme.test.ts`
  Expected: FAIL listing `media-browser-dialog.tsx` and `media-picker-field.tsx` (if Tasks 2–4 are complete). If it lists any other file, stop and report which one.
- [ ] **Step 3: Implement** the dark → light mapping in the two media files (the dialog becomes a white modal with a `bg-black/40` overlay — `bg-black/40` is allowed for overlays; the grid of images keeps selectable states with a visible selected ring in `ring-brand-primary`).
- [ ] **Step 4: Run the guard test again.** Expected: PASS.
- [ ] **Step 5: Web checks** as in Task 1 Step 5.

### Task 6: Verify in Chrome (controller, not a subagent)

**Files:** none changed. Uses the running dev server (`next dev -p 3001`, background task `b82a7u9c2`), Backend on :3005 and the local admin account seeded earlier (credentials in Backend `src/.env.example`; the browser may auto-fill the owner's saved login: overwrite the fields).

**Interfaces:** Consumes Tasks 1–5. Produces the final report in Vietnamese; no files.

- [ ] **Step 1: Desktop width (≥ 1024 px, `resize_window` to 1280×800).** Signed in as admin: `/admin/exam` shows the navy sidebar and the white content area, the `Đề thi` item active, the page header with breadcrumbs and the three buttons; screenshot.
- [ ] **Step 2: Exam flow.** `Tạo đề mới` → editor opens inside the shell with the light theme; open every part-form type the UI offers (drag-drop, gap-fill, matching, multiple-choice) and the settings fields; open the media browser dialog and pick an image; confirm every text is readable and nothing is white-on-white; screenshots of each.
- [ ] **Step 3: Drawer.** At the current (narrower) window width the drawer layout shows: the menu button opens the sidebar, Escape closes it, tab order and focus ring are sensible; clicking a nav item closes it.
- [ ] **Step 4: Edge cases** (Review Focus 4): an exam with a very long name, and the list with several rows; the table scrolls inside the content area, the header wraps.
- [ ] **Step 5: Access.** Signed out: `/admin/exam` redirects to `/login?redirect=…`; sign out from the sidebar returns to `/`; (a non-admin user case is covered by the Task 1 layout test; do not create extra users unless needed, and delete any `zz_%` user afterwards).
- [ ] **Step 6: Console and build.** Read console errors (pattern `error|hydrat`) on the visited admin pages; then stop the dev server this session started, run `npm run build` in `src/`, and start the dev server again. Report in Vietnamese what passed, what could not be verified (real 340 px width: Chrome desktop cannot shrink that far), and any ruling made. Nothing is committed.
