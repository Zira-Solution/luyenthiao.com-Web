# Admin CMS shell — design

Date: 2026-11-24. Repo: `luyenthiao.com-Web` only. Status: approved by the owner on 2026-11-24 ("triển đi"). Not yet implemented.

## Intent

The admin area looks like a leftover of the kids' game theme: there is no shared frame, every page
paints its own dark glass header (`bg-dashboard-bg`, `bg-white/5`, `text-white/…`). The owner wants a
standard CMS layout: a **deep-blue sidebar on the left** and a **white content area on the right** for
editing. The owner stressed that the frame is **shared by the whole admin area**, not tied to one
feature, so later admin pages (for example the home-page islands manager) plug into it.

## Findings (measured 2026-11-24)

- `src/app/admin/layout.tsx` only wraps `RequireAuth` + `RequireAdmin`; no chrome.
- Admin pages today: `/admin/exam` (list) and `/admin/exam/[id]` (editor). Exams live in
  `localStorage` (`useExamStore`), not in the Backend. Out of scope here.
- 16 files under `src/components/admin/**` carry the dark theme (counts of dark-theme classes:
  exam-list-table 47, part-form-dragdrop 46, exam-editor 36, part-form-gapfill 34,
  media-browser-dialog 27, part-form-multichoice 25, part-settings-fields 24, part-form-matching 22,
  media-picker-field 21, part-card 18, questions-json-editor 15, box-picker 14, editor-field 9,
  tags-input 6, validation-panel 1, part-preview 1). A white wrapper alone would make the white-on-dark
  text invisible, so every one of them must be re-skinned.
- Design tokens live in `src/app/globals.css` (`@theme inline`); `--color-brand-primary: #0075fb`
  exists; `coding.md` forbids arbitrary colour values like `bg-[#fff]`.

## Goals

1. One shared shell for every route under `/admin`, mounted in `app/admin/layout.tsx` (inside the
   existing `RequireAuth`/`RequireAdmin`): left sidebar + right content area.
2. The sidebar menu is **data-driven** from one config file; adding an admin page = adding one entry.
3. Re-skin the two existing pages and everything they use (all 16 files above) to the light content
   area, with **no behaviour change** (same props, store calls, validation).
4. Responsive: sidebar fixed on `lg` and up; below `lg` a top bar with a menu button opens it as a
   drawer (works at 340 px width).
5. Accessible: `<nav aria-label>` landmark, `aria-current="page"` on the active item, visible focus
   ring, keyboard-operable drawer (Escape closes, focus returns to the button), text contrast ≥ 4.5:1.

## Non-goals

New admin features (islands manager, users, media library), Backend changes, moving exams out of
`localStorage`, a dark mode for admin, changing any non-admin page, new npm dependencies.

## Design

- **Layout:** `AdminShell` (client component) renders a two-column grid: sidebar 264 px | `main`
  (white, scrolls on its own, content `max-w-6xl` with generous padding).
- **Files** (all under `src/components/admin/shell/`, named exports, kebab-case):
  `admin-shell.tsx`, `admin-sidebar.tsx`, `admin-nav.ts` (the config: `{ label, href, icon, group }`;
  today one group "Nội dung" with one item "Đề thi" → `/admin/exam`), `admin-page-header.tsx`
  (props: `title`, `description?`, `breadcrumbs?`, `actions?` — every admin page uses it instead of
  painting its own header), `admin-nav-match.ts` (pure function: active when the pathname equals the
  href or starts with `href + '/'`).
- **Sidebar content:** brand block ("Luyenthiao CMS"), grouped nav items with icons from
  `lucide-react`, a footer with the signed-in user's name and role, a "Về trang học viên" link and a
  sign-out button reusing the existing sign-out hook/flow (the implementer must find it; if none is
  reusable, stop and report).
- **Colours (owner call to confirm in review):** new tokens in `globals.css` `@theme`:
  `--color-admin-sidebar: #0b2a5b` (deep navy), `--color-admin-sidebar-hover`, active item
  `--color-brand-primary`, content surface white, borders `slate-200`. Pages inside use Tailwind
  neutral palette classes already used elsewhere (`slate-*`), no arbitrary hex.
- **Page header:** title, optional description and breadcrumb ("Trang chủ › Đề thi"), actions slot on
  the right (the existing "Tạo đề mới / Nhập / Xuất" buttons move there).
- **Metadata:** unchanged (`robots: noindex`).

## Approaches considered

- A. Shell + exam list only: fastest, leaves the editor dark inside a white frame (two styles).
- **B (chosen). Shell + list + editor + media dialogs, with only the shared pieces that repeat
  (page header, nav config, nav match):** consistent look, no speculative library.
- C. B plus a full admin component library (data table, form fields, dialogs): useful later, but
  builds things nobody needs yet.

## Task split (for the plan)

1. Shell: tokens, `admin-nav.ts`, `admin-nav-match.ts`, `AdminSidebar`, `AdminShell`, `AdminPageHeader`,
   mount in `layout.tsx`, unit tests.
2. Exam list page re-skin (`exam-list-table.tsx`, page header, actions).
3. Exam editor core re-skin (`exam-editor`, `part-card`, `editor-field`, `tags-input`,
   `validation-panel`, `questions-json-editor`, `part-preview`, `box-picker`).
4. Part forms re-skin (four `part-form-*` files + `part-settings-fields`).
5. Media dialog and picker re-skin (`media-browser-dialog`, `media-picker-field`).
6. Verification by the controller in Chrome (signed in as the local admin): every admin screen at
   desktop width and at the drawer breakpoint, keyboard navigation, no console errors.

## Verification

Per task: `npx tsc --noEmit`, `npx eslint` on changed files (no new errors; the repo has 10
pre-existing lint errors elsewhere), `npm test`. Visual and interaction checks in Chrome on the
running dev server with the seeded admin. `npm run build` once at the end.
