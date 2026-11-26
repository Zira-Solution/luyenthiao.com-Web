# Admin Integration Phases 2–5 Web Implementation Plan

> **For agentic workers:** Implementing Phases 2–5 Web routes, schemas, API clients, hooks, light-theme CMS views, unit tests, production build, and live Chromium Playwright E2E verification.

**Goal:** Connect every remaining Backend capability into the Next.js Admin CMS (`/admin/grading`, `/admin/planets`, `/admin/site-config`, `/admin/vocab`, `/admin/tasks`, `/admin/schools`, `/admin/notifications`, `/admin/users`, `/admin` real stats, `/admin/attempts`, `/admin/challenges`) while honoring Light Theme, safe JSX escaping (no raw HTML), and Zod validation.

**Architecture:** Follow strict 3-layer separation (`src/schemas/admin-*.ts` → `src/lib/api/admin/*.ts` → `src/hooks/admin/use-admin-*.ts` keyed under `queryKeys.admin*`), keeping `src/app/admin/**/page.tsx` thin orchestrators with full 5-field `metadata`. Keep admin components compliant with `admin-light-theme.test.ts` and `no-raw-html.test.ts`.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript strict, Tailwind CSS v4, TanStack Query v5, Zod v4, Lucide icons, Vitest + RTL, Playwright.

---

### Task 1: Shared Admin Routing, Query Keys & Navigation Shell
- Update `src/constants/index.ts` (`ROUTES` for grading, planets, site-config, vocab, tasks, schools, notifications, users, attempts, challenges).
- Update `src/lib/query-keys.ts` (all Phase 2–5 `admin*` query keys under `['admin', ...]`).
- Update `src/components/admin/shell/admin-nav.ts` & `admin-sidebar.tsx` (13 routes in 5 logical groups, safe `QueryClientContext`-guarded `pendingGrading` badge preserving accessible `<Link>` names).

### Task 2: Phase 2 Web — Grading Queue & Workspaces (`/admin/grading`, `writing/[id]`, `speaking/[id]`)
- Create `src/schemas/admin-grading.ts`, `src/lib/admin-grading.ts`, `src/lib/api/admin/grading.ts`, `src/hooks/admin/use-admin-grading.ts`.
- Create `src/components/admin/grading/{grading-queue-view.tsx,writing-grading-view.tsx,speaking-grading-view.tsx,grading-ai-panel.tsx,index.ts}` + routes `src/app/admin/grading/{page.tsx,writing/[id]/page.tsx,speaking/[id]/page.tsx}`.
- Implement 2-column grading layout, Writing structured `{ comment, errors, tips }` rubric, Speaking R2 `<audio controls>` playback + `blob-only` warning, integer `0..maxScore` validation, re-grading, AI suggestion read-only card, and **"Lưu & Chấm tiếp"**.
- Add unit tests (`admin-grading.test.ts`, `grading-views.test.tsx`).

### Task 3: Phase 3 Web — Planets (`/admin/planets`), `PLANET_OVERRIDES` Priority Fix & SiteConfig (`/admin/site-config`)
- Fix `src/schemas/planet.ts` so DB `name`, `image`, `subtitle` override hardcoded `PLANET_OVERRIDES` when non-empty (keeping `planet.test.ts` green) and ensure `planet-diorama.tsx` works with remote URLs cleanly.
- Extend `src/schemas/admin-planet.ts`, `src/lib/api/admin/planets.ts`, `src/hooks/admin/use-admin-planets.ts` with `createAdminPlanet`, `updateAdminPlanet`, `reorderAdminPlanets`, `deleteAdminPlanet`.
- Create `src/components/admin/planets/{planets-admin-view.tsx,planet-form-dialog.tsx,index.ts}` + `src/app/admin/planets/page.tsx` (reorder arrows, slug locked on edit, hex colors, `MediaPickerField` for image & mapBackground, clear 409 error feedback).
- Create `src/schemas/admin-site-config.ts`, `src/lib/api/admin/site-config.ts`, `src/hooks/admin/use-admin-site-config.ts`, `src/components/admin/site-config/{site-config-view.tsx,site-config-defaults.ts,index.ts}` + `src/app/admin/site-config/page.tsx` covering all 11 sections with `MediaPickerField`, section reset, and save.

### Task 4: Phase 4 Web — Vocab, Tasks, Schools & Notifications (`/admin/vocab`, `/tasks`, `/schools`, `/notifications`)
- Create schemas, API clients, and hooks for `vocab`, `tasks`, `schools`, and `notifications` (including user search `searchNotificationUsers`).
- Build Light Theme CRUD views + form dialogs:
  - `src/components/admin/vocab/{vocab-admin-view.tsx,vocab-form-dialog.tsx,index.ts}` + `src/app/admin/vocab/page.tsx` (level/topic/active filters, audio preview, `MediaPickerField` audio).
  - `src/components/admin/tasks/{tasks-admin-view.tsx,task-form-dialog.tsx,index.ts}` + `src/app/admin/tasks/page.tsx`.
  - `src/components/admin/schools/{schools-admin-view.tsx,school-form-dialog.tsx,index.ts}` + `src/app/admin/schools/page.tsx` (shows `_count.users`, disables/handles 409 on non-empty delete).
  - `src/components/admin/notifications/{notifications-admin-view.tsx,notification-form-dialog.tsx,index.ts}` + `src/app/admin/notifications/page.tsx` (global or user-targeted compose + search).

### Task 5: Phase 5 Web — Users, Real Dashboard Stats & Monitoring + Full Verification
- Create schemas, API clients, and hooks for `users` & `admin` (`stats`, `attempts`, `challenges/rooms`, `challenges/results`, `points`).
- Build `src/components/admin/users/{users-admin-view.tsx,user-detail-dialog.tsx,index.ts}` + `src/app/admin/users/page.tsx` (search, role/school/banned filters, safe confirm dialog before role change or ban/unban, profile modal).
- Upgrade `src/components/admin/overview/admin-overview.tsx` + `admin-overview.test.tsx` to display real `GET /admin/stats` KPIs, recent attempts, recent exams, and mark all CMS modules `'api-connected'`.
- Build `src/components/admin/monitoring/{attempts-admin-view.tsx,challenges-admin-view.tsx,index.ts}` + `src/app/admin/{attempts/page.tsx,challenges/page.tsx}`.
- Update barrel exports (`src/components/admin/index.ts`, `src/lib/api/admin/index.ts`, `src/hooks/admin/index.ts`), run Prettier on changed files, run `tsc`, `eslint`, `vitest run`, `next build`, and execute full Playwright Chromium E2E verification across Phases 2–5 against live `:3005` + `:3001`.
