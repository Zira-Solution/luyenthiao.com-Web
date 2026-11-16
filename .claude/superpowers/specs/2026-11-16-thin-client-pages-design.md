# Phase 3b — Thin the nine client pages

- **Date:** 2026-11-16
- **Repo:** `luyenthiao.com-Web`, branch `main` (owner works directly on `main`)
- **Status:** design approved in conversation, pending written-spec review
- **Follows:** phase 3a (`2026-11-15-rebuild-missing-mocks-design.md`). Scope was set in
  `2026-11-15-zoney-structure-refactor-design.md` §10.

## 1. Problem

Nine routes keep their whole UI inside `page.tsx` as a client component. That breaks the project's
own rule (`.claude/rules/coding.md` → "page.tsx"), which says a page contains only imports, static
data, metadata and layout TSX, and never `"use client"`, state or inline markup. None of the nine
declares `metadata`, so they ship no title, canonical URL or Open Graph data.

| Route | File | Lines |
|---|---|---|
| `/` | `app/(dashboard)/page.tsx` | 191 |
| `/history` | `app/(dashboard)/history/page.tsx` | 340 |
| `/notebook` | `app/(dashboard)/notebook/page.tsx` | 371 |
| `/notifications` | `app/(dashboard)/notifications/page.tsx` | 168 |
| `/placement-test` | `app/(dashboard)/placement-test/page.tsx` | 451 |
| `/ranking` | `app/(dashboard)/ranking/page.tsx` | 154 |
| `/school-ranking` | `app/(dashboard)/school-ranking/page.tsx` | 111 |
| `/tasks` | `app/(dashboard)/tasks/page.tsx` | 210 |
| `/testresult` | `app/testresult/page.tsx` | 216 |

## 2. Goal and acceptance

- Every one of the nine `page.tsx` is a server component holding only imports, `metadata` and
  component tags — no `"use client"`, no hooks, no inline markup.
- Each declares `metadata` with all five fields required by `coding.md`.
- **No visual change and no behaviour change**: screenshots of the nine routes taken before the work
  are pixel-identical to the ones taken after. The new `metadata` only adds `<head>` tags, which a
  screenshot cannot show, so it is checked separately by reading the served HTML.
- `tsc` 0 errors, tests pass, lint gains no new errors, `npm run build` succeeds with 27 routes.

## 3. Non-goals

- Centralizing `/clone-assets` paths and archiving unused assets (the remaining phase 3 item).
- Adding these routes to `app/sitemap.ts` (they sit behind the dashboard, not public landing pages).
- Rewriting the metadata of the twelve pages that already have it.
- Splitting a view into smaller components, deduplicating logic, or fixing the 8 pre-existing lint
  errors.
- Changing any component outside the nine pages.

## 4. File map

Each page's client code moves verbatim into a `*-view.tsx` (`"use client"`), renamed to the
component named below. The only edits are the component name, the explicit
`React.ReactElement` return type that `coding.md` requires, and import paths.

| Page | View | Extracted data/helpers |
|---|---|---|
| `(dashboard)/page.tsx` | `components/dashboard/dashboard-view.tsx` → `DashboardView` | — |
| `(dashboard)/history/page.tsx` | `components/history/history-view.tsx` → `HistoryView` | — |
| `(dashboard)/notebook/page.tsx` | `components/notebook/notebook-view.tsx` → `NotebookView` | `components/notebook/notebook-data.ts` (`MOCK_WORDS`, its `VocabWord` type) |
| `(dashboard)/notifications/page.tsx` | `components/notifications/notifications-view.tsx` → `NotificationsView` | — |
| `(dashboard)/placement-test/page.tsx` | `components/placement-test/placement-test-view.tsx` → `PlacementTestView` | `placement-test-data.ts` (`LEVEL_TESTS`, `MOCK_QUESTIONS`, `Question`), `placement-test-sound.ts` (`playBeep`) |
| `(dashboard)/ranking/page.tsx` | `components/ranking/ranking-view.tsx` → `RankingView` | — |
| `(dashboard)/school-ranking/page.tsx` | `components/ranking/school-ranking-view.tsx` → `SchoolRankingView` | — |
| `(dashboard)/tasks/page.tsx` | `components/tasks/tasks-view.tsx` → `TasksView` | — |
| `app/testresult/page.tsx` | `components/exam/exam-result-view.tsx` → `ExamResultView` | — |

New component directories, each with an `index.ts` barrel exporting its view: `history`,
`notebook`, `notifications`, `placement-test`, `tasks`. Existing directories reused: `dashboard`,
`ranking`, `exam` (their `index.ts` gains the new export).

Pages import their view through the directory barrel, as `coding.md` requires — except
`/testresult`, which imports `@/components/exam/exam-result-view` directly: the `@/components/exam`
barrel re-exports `ExamCheckpoint`, which statically imports a 249 KB mock. `coding.md` already
documents that exception.

Decisions that follow from reading the current code:

- `typeMeta` (notifications) and `taskIcons` (tasks) stay inside their view: they map keys to
  `lucide-react` **components**, so they are presentation wiring, not data.
- `playBeep` (placement-test, 59 lines, no JSX) moves to its own module so the view stays readable.
- `testresult`: `TestResultContent` uses `useSearchParams`, so `page.tsx` keeps a `<Suspense>`
  wrapper around `<ExamResultView />`. Its current `fallback` is inline JSX, which the page rule
  forbids, so that spinner moves to `components/exam/exam-result-fallback.tsx` as
  `ExamResultFallback` and the page passes `fallback={<ExamResultFallback />}`.

## 5. Metadata and constants

Every page gets, per `coding.md`:

`app/layout.tsx` already sets `title.template` to `%s | ${APP_NAME}`, so a page sets only its own
name and Next appends the brand. Writing the brand into `title` as well would render it twice.
`openGraph.title` has no template, so it spells the brand out.

```ts
export const metadata: Metadata = {
  title: "<page name>",                 // rendered as "<page name> | luyenthiao.com"
  description: "<one Vietnamese sentence>",
  keywords: [...],            // Vietnamese terms only
  alternates: { canonical: ROUTES.<KEY> },
  openGraph: { title: "<page name> | luyenthiao.com", description, url: ROUTES.<KEY>, type: "website" },
}
```

- Titles and descriptions are Vietnamese (product copy), consistent with the existing UI. The exact
  string for every page is written out in the implementation plan, not invented while coding.
- Keywords must **not** contain `flyer` or any third-party brand; the twelve older pages still do,
  and that is recorded as follow-up, not fixed here.
- `constants/index.ts`:
  - `APP_NAME` `'English Game'` → `'luyenthiao.com'`;
  - `APP_DESCRIPTION` (currently an explicit placeholder) → a real one-sentence description;
  - add the eight missing routes so `canonical` comes from constants rather than inline strings:
    `HISTORY`, `NOTEBOOK`, `NOTIFICATIONS`, `PLACEMENT_TEST`, `RANKING`, `SCHOOL_RANKING`, `TASKS`,
    `TEST_RESULT`.

`app/layout.tsx` already sets `metadataBase` from `env.APP_URL`, so a relative `canonical` resolves
against the deployed domain.

## 6. Verification

1. **Before any edit**, capture screenshots of the nine routes (dev server, Playwright) into
   `.scratch/task3b/before/`. Without this the "no visual change" claim cannot be checked.
2. After each page: `npx tsc --noEmit` 0 errors; `npm test` passes; `npx eslint .` shows only the 8
   known errors.
3. After all pages: stop any dev server, then `rm -rf .next && npm run build` — must succeed and
   list 27 routes. (Running a build while a dev server is up produced spurious errors on
   2026-11-15; both use `.next`.)
4. Capture `.scratch/task3b/after/` and compare pairwise: identical, since metadata is not visible.
   Routes known to be non-deterministic are compared by eye.
   Separately, `curl` each route and assert the served HTML now has `<title>`, the canonical link
   and the `og:` tags.
5. Re-run the 15-route baseline comparison (`.scratch/tools/route-shots.mjs` +
   `compare-shots.mjs`) to prove nothing else moved.
6. Manual interaction, because a screenshot cannot prove state still works: filter and "mark all
   read" on `/notifications`; claim a finished task on `/tasks`; one full round on
   `/placement-test`; `/testresult` with its query string; search/filter on `/history`; add and
   remove a word on `/notebook`.

## 7. Commits

One commit per page (nine), plus one for `constants/index.ts`, each independently revertible.
Commit messages follow `refactor(<route>): move <name> UI into a view component`.

## 8. Risks

| Risk | Mitigation |
|---|---|
| A page's client state silently breaks when moved | manual interaction per §6.6, not just screenshots |
| Server/client boundary changes rendering (hydration) | screenshot diff + console-error check per route |
| `useSearchParams` in `/testresult` needs a Suspense boundary | the existing `<Suspense>` wrapper is kept in the page |
| The `@/components/exam` barrel pulls `ExamCheckpoint` and its 249 KB mock into `/testresult` | that page imports `@/components/exam/exam-result-view` directly, the exception already documented in `coding.md` (as done for `part-preview` in `ab41c7a`) |
| Metadata changes visible output | only `<title>` and `<head>`; asserted explicitly in the comparison |
