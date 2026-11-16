# Phase 3b — Thin the Nine Client Pages Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn the nine `"use client"` pages into server components that only declare metadata and render one view component, with no visual or behavioural change.

**Architecture:** Each page's body is moved verbatim (via `git mv`, so the diff shows a rename) into `components/<domain>/<name>-view.tsx`; static data and the one audio helper move to sibling modules; the page is rewritten as metadata + a single component tag. Route paths move into `ROUTES` so `canonical` is not a hand-typed string.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript strict, ESLint `import-x/order`, Vitest, Playwright (verification only), Git Bash on Windows.

**Spec:** `.claude/superpowers/specs/2026-11-16-thin-client-pages-design.md`

---

## Conventions for the executor

```bash
export WS="E:/Ziratech/English-Prep-Web-Game"
export REPO="$WS/luyenthiao.com-Web"
export SCR="$WS/.scratch/task3b"
export PW_CHROME="C:/Users/lemin/AppData/Local/ms-playwright/chromium-1248/chrome-win64/chrome.exe"
```

- Work on `main`. All npm commands run in `$REPO/src`.
- Node is a Windows binary: pass `E:/...` paths, never `/tmp/...`.
- **Never run `npm run build` while a dev server is running** — both use `.next` and the build fails with spurious errors (seen 2026-11-15).
- Subagents **stage only**; the controller commits with the exact message given.
- Commit messages: English, Conventional Commits, one line, **no `Co-Authored-By` and no AI attribution**.
- New/edited files: LF endings. The nine pages use double quotes and semicolons; keep that, and match
  each barrel to its own existing style (`components/{dashboard,ranking}/index.ts` use double quotes
  with semicolons, `components/exam/index.ts` double quotes without).
- **Import order in this repo is not the obvious one.** `eslint.config.mjs` lists the groups
  `builtin, external, internal, parent, sibling, index`, but no resolver or `internal-regex` is
  configured, so `@/...` is *not* recognised as `internal` and sorts into the trailing unknown
  group. The real order is: external (`next`, `react`, `lucide-react`) → a blank line → relative
  (`./...`) → a blank line → `@/...`. See `components/exam/exam-checkpoint.tsx` for a worked
  example. Put every new relative import **above** the `@/` imports.
- **Do not run `npx prettier --write` on these files.** `.prettierrc` sets `singleQuote: true,
  semi: false`, so it would restyle every moved line and bury the rename diff. ESLint here only
  enforces import order, which the given snippets already satisfy.
- Exploration: run `graphify query "<q>" --budget 800 --graph "$REPO/graphify-out/graph.json"` and one `codegraph_explore` (projectPath `$REPO`) before raw reads of code.

## File map

| Path (under `src/`) | Action | Task |
|---|---|---|
| `constants/index.ts` | modify: `APP_NAME`, `APP_DESCRIPTION`, 8 new `ROUTES` | 1 |
| `components/dashboard/dashboard-view.tsx` + `index.ts` | create / update | 2 |
| `components/history/{history-view.tsx,index.ts}` | create | 3 |
| `components/notebook/{notebook-view.tsx,notebook-data.ts,index.ts}` | create | 4 |
| `components/notifications/{notifications-view.tsx,index.ts}` | create | 5 |
| `components/placement-test/{placement-test-view.tsx,placement-test-data.ts,placement-test-sound.ts,index.ts}` | create | 6 |
| `components/ranking/ranking-view.tsx` + `index.ts` | create / update | 7 |
| `components/ranking/school-ranking-view.tsx` + `index.ts` | create / update | 8 |
| `components/tasks/{tasks-view.tsx,index.ts}` | create | 9 |
| `components/exam/{exam-result-view.tsx,exam-result-fallback.tsx}` + `index.ts` | create / update | 10 |
| the nine `app/**/page.tsx` | rewritten, one per task | 2–10 |

## The per-page recipe

Every page task follows these five moves. The task then gives the exact values.

1. `git mv` the page file to its view path. This keeps history and makes the diff a rename.
2. In the view file: replace the `export default function <Old>()` line with
   `export function <New>(): React.ReactElement {`. Keep `"use client"` as line 1. Change nothing else
   except the extractions the task names.
3. Create or update `components/<dir>/index.ts` so it exports the view.
4. Write the new `app/<route>/page.tsx` with the exact content the task gives.
5. Verify, then stage the listed paths. Do not commit.

After every task: `npx tsc --noEmit` prints 0 errors, `npm test` passes 5 files / 38 tests, and
`npx eslint .` reports only the 8 known pre-existing errors (in `components/testlevels/level-header.tsx`,
`components/testlevels/level-map.tsx`, `components/ui/dialog.tsx`). If any of these differ, stop and report.

---

### Task 0: Approvals and "before" screenshots

**Files:** none in the repo; output goes to `$SCR/before/`.

- [ ] **Step 1: Confirm a clean tree**

```bash
cd "$REPO" && git branch --show-current && git status --short
```
Expected: `main`, and only `?? .claude/superpowers/specs/2026-11-16-thin-client-pages-design.md` plus `?? .claude/superpowers/plans/2026-11-16-thin-client-pages.md`.

- [ ] **Step 2: Ask the owner to approve the commit package**

The eleven commits in this plan (Task 0 docs commit, Task 1 constants, Tasks 2–10 one per page) on `main`, plus fix commits for Critical/Important review findings. No push unless asked.

- [ ] **Step 3: Commit the spec and plan**

```bash
cd "$REPO" && git add .claude/superpowers/specs/2026-11-16-thin-client-pages-design.md .claude/superpowers/plans/2026-11-16-thin-client-pages.md && git commit -m "docs: add phase 3b thin-pages spec and plan"
```

- [ ] **Step 4: Write the screenshot script**

Create `$SCR/shots.mjs`:
```js
// Usage: node shots.mjs <baseUrl> <outDir> <projectDirWithNodeModules>
import { mkdirSync, writeFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import path from 'node:path'

const [baseUrl, outDir, projectDir] = process.argv.slice(2)
const require = createRequire(path.join(projectDir, 'package.json'))
const { chromium } = require('playwright')

const ROUTES = [
  '/',
  '/history',
  '/notebook',
  '/notifications',
  '/placement-test',
  '/ranking',
  '/school-ranking',
  '/tasks',
  '/testresult?examId=7778495e-531b-4039-a3ea-321874ba1a7a&score=10&listening=5&rw=5&total=60',
]

mkdirSync(outDir, { recursive: true })
const browser = await chromium.launch({ executablePath: process.env.PW_CHROME || undefined })
const context = await browser.newContext({ viewport: { width: 1440, height: 900 } })
const page = await context.newPage()
const report = []
let current = ''
page.on('pageerror', (e) => report.push({ route: current, kind: 'pageerror', text: e.message }))
page.on('console', (m) => {
  if (m.type() === 'error') report.push({ route: current, kind: 'console', text: m.text() })
})

for (const r of ROUTES) {
  current = r
  const res = await page.goto(baseUrl + r, { waitUntil: 'networkidle', timeout: 120_000 })
  await page.waitForTimeout(2500)
  const name = r.replace(/[^a-z0-9]+/gi, '_').replace(/^_|_$/g, '') || 'root'
  await page.screenshot({ path: path.join(outDir, `${name}.png`), fullPage: true, animations: 'disabled' })
  report.push({ route: r, kind: 'status', text: String(res?.status()), title: await page.title() })
}
await browser.close()
writeFileSync(path.join(outDir, 'report.json'), JSON.stringify(report, null, 2))
console.log(`saved ${ROUTES.length} screenshots to ${outDir}`)
```

- [ ] **Step 5: Capture the baseline twice**

Check the port, then start the dev server in the background:
```bash
netstat -ano | grep ":3000 " | grep LISTENING   # Windows (Git Bash); must print nothing
cd "$REPO/src" && npm run dev
timeout 240 bash -c 'until curl -s -o /dev/null http://localhost:3000/login; do sleep 3; done'
node "$SCR/shots.mjs" http://localhost:3000 "$SCR/before" "$REPO/src"
node "$SCR/shots.mjs" http://localhost:3000 "$SCR/before-2" "$REPO/src"
node "$WS/.scratch/tools/compare-shots.mjs" "$SCR/before" "$SCR/before-2"
```
Expected: `saved 9 screenshots` twice. Write every `DIFF` file name to `$SCR/nondeterministic.txt` (create it empty if there are none) — those routes are compared by eye later, not by hash. Record the `title` of each route from `before/report.json` (today they are all the site default). Leave the dev server running for Tasks 2–10; stop it before Task 11.

---

### Task 1: Constants

**Files:** Modify `src/constants/index.ts`.

- [ ] **Step 1: Replace the first three lines**

Replace:
```ts
export const APP_NAME = 'English Game'
export const APP_DESCRIPTION =
  'English Game — placeholder description, update once the product direction is defined.'
```
with:
```ts
export const APP_NAME = 'luyenthiao.com'
export const APP_DESCRIPTION =
  'Luyện thi tiếng Anh trực tuyến: làm bài thi thử, luyện Nghe, Nói, Đọc, Viết và theo dõi tiến bộ.'
```

- [ ] **Step 2: Add the eight dashboard routes**

In the `ROUTES` object, immediately after the line `  HOME: '/',`, insert:
```ts
  HISTORY: '/history',
  NOTEBOOK: '/notebook',
  NOTIFICATIONS: '/notifications',
  PLACEMENT_TEST: '/placement-test',
  RANKING: '/ranking',
  SCHOOL_RANKING: '/school-ranking',
  TASKS: '/tasks',
  TEST_RESULT: '/testresult',
```

- [ ] **Step 3: Verify**

```bash
cd "$REPO/src" && npx tsc --noEmit 2>&1 | grep -c "error TS"   # 0
npm test 2>&1 | grep -E "Test Files|Tests "                     # 5 files, 38 tests
curl -s http://localhost:3000/login | grep -o "<title>[^<]*</title>"
```
Expected: `0`; tests pass; the title now ends in `luyenthiao.com` (the root template picked up `APP_NAME`). That title change is intended and is the only user-visible effect of this task.

- [ ] **Step 4: Stage**

```bash
cd "$REPO" && git add src/constants/index.ts
```
**Controller commits:** `refactor(constants): use the real app name and add dashboard routes`

---

### Task 2: `/` dashboard home

**Files:** Move `src/app/(dashboard)/page.tsx` → `src/components/dashboard/dashboard-view.tsx`; modify `src/components/dashboard/index.ts`; create `src/app/(dashboard)/page.tsx`.

- [ ] **Step 1: Move**

```bash
cd "$REPO/src" && git mv "app/(dashboard)/page.tsx" components/dashboard/dashboard-view.tsx
```

- [ ] **Step 2: Rename the component**

In `components/dashboard/dashboard-view.tsx`, replace the line
```tsx
export default function DashboardPage() {
```
with
```tsx
export function DashboardView(): React.ReactElement {
```
Change nothing else.

- [ ] **Step 3: Export it**

Append to `components/dashboard/index.ts` (that file uses double quotes and semicolons — match it):
```ts
export { DashboardView } from "./dashboard-view";
```

- [ ] **Step 4: Write the page**

Create `app/(dashboard)/page.tsx`:
```tsx
import type { Metadata } from "next";

import { DashboardView } from "@/components/dashboard";
import { ROUTES } from "@/constants";

export const metadata: Metadata = {
  title: "Trang chủ",
  description: "Chọn hành tinh và bắt đầu luyện thi tiếng Anh theo từng cấp độ.",
  keywords: ["luyện thi tiếng Anh", "học tiếng Anh", "thi thử", "trang chủ"],
  alternates: { canonical: ROUTES.HOME },
  openGraph: {
    title: "Trang chủ | luyenthiao.com",
    description: "Chọn hành tinh và bắt đầu luyện thi tiếng Anh theo từng cấp độ.",
    url: ROUTES.HOME,
    type: "website",
  },
};

export default function DashboardPage(): React.ReactElement {
  return <DashboardView />;
}
```

- [ ] **Step 5: Verify and stage**

```bash
cd "$REPO/src" && npx tsc --noEmit 2>&1 | grep -c "error TS"   # 0
npx eslint "app/(dashboard)/page.tsx" components/dashboard      # no errors
curl -s http://localhost:3000/ | grep -o "<title>[^<]*</title>" # "Trang chủ | luyenthiao.com"
cd "$REPO" && git add "src/app/(dashboard)/page.tsx" src/components/dashboard
```
**Controller commits:** `refactor(home): move the dashboard UI into a view component`

---

### Task 3: `/history`

**Files:** Move `src/app/(dashboard)/history/page.tsx` → `src/components/history/history-view.tsx`; create `src/components/history/index.ts`; create `src/app/(dashboard)/history/page.tsx`.

- [ ] **Step 1: Move**

```bash
cd "$REPO/src" && mkdir -p components/history && git mv "app/(dashboard)/history/page.tsx" components/history/history-view.tsx
```

- [ ] **Step 2: Rename the component**

In `components/history/history-view.tsx`, replace
```tsx
export default function HistoryPage() {
```
with
```tsx
export function HistoryView(): React.ReactElement {
```

- [ ] **Step 3: Create the barrel**

Create `components/history/index.ts`:
```ts
export { HistoryView } from "./history-view";
```

- [ ] **Step 4: Write the page**

Create `app/(dashboard)/history/page.tsx`:
```tsx
import type { Metadata } from "next";

import { HistoryView } from "@/components/history";
import { ROUTES } from "@/constants";

export const metadata: Metadata = {
  title: "Lịch sử làm bài",
  description: "Xem lại các bài thi đã làm, lọc theo cấp độ, kỹ năng và thời gian.",
  keywords: ["lịch sử làm bài", "kết quả thi thử", "luyện thi tiếng Anh"],
  alternates: { canonical: ROUTES.HISTORY },
  openGraph: {
    title: "Lịch sử làm bài | luyenthiao.com",
    description: "Xem lại các bài thi đã làm, lọc theo cấp độ, kỹ năng và thời gian.",
    url: ROUTES.HISTORY,
    type: "website",
  },
};

export default function HistoryPage(): React.ReactElement {
  return <HistoryView />;
}
```

- [ ] **Step 5: Verify and stage**

```bash
cd "$REPO/src" && npx tsc --noEmit 2>&1 | grep -c "error TS"   # 0
npx eslint "app/(dashboard)/history/page.tsx" components/history
curl -s http://localhost:3000/history | grep -o "<title>[^<]*</title>"
cd "$REPO" && git add "src/app/(dashboard)/history/page.tsx" src/components/history
```
**Controller commits:** `refactor(history): move the history UI into a view component`

---

### Task 4: `/notebook`

**Files:** Move `src/app/(dashboard)/notebook/page.tsx` → `src/components/notebook/notebook-view.tsx`; create `src/components/notebook/notebook-data.ts` and `index.ts`; create `src/app/(dashboard)/notebook/page.tsx`.

- [ ] **Step 1: Move**

```bash
cd "$REPO/src" && mkdir -p components/notebook && git mv "app/(dashboard)/notebook/page.tsx" components/notebook/notebook-view.tsx
```

- [ ] **Step 2: Extract the data**

Cut the `VocabWord` interface and the whole `const MOCK_WORDS: VocabWord[] = [...]` array out of `components/notebook/notebook-view.tsx` into a new `components/notebook/notebook-data.ts`, prefixed with:
```ts
/** Sample vocabulary shown in the notebook until the backend provides the user's own words. */
```
and with both declarations exported (`export interface VocabWord {`, `export const MOCK_WORDS: VocabWord[] = [`). Copy the entries verbatim — do not retype or reorder them.

- [ ] **Step 3: Import it back**

In `components/notebook/notebook-view.tsx`, add the relative import as its own group **above** the
`@/lib/utils` import, with a blank line on each side (see the import-order note in the conventions):
```ts
import { MOCK_WORDS, type VocabWord } from "./notebook-data";

import { cn } from "@/lib/utils";
```
Keep `VocabWord` in the import only if the view still names the type; if `npx tsc --noEmit` reports it unused, import just `MOCK_WORDS`.

- [ ] **Step 4: Rename the component**

Replace
```tsx
export default function NotebookPage() {
```
with
```tsx
export function NotebookView(): React.ReactElement {
```

- [ ] **Step 5: Create the barrel**

Create `components/notebook/index.ts`:
```ts
export { NotebookView } from "./notebook-view";
```

- [ ] **Step 6: Write the page**

Create `app/(dashboard)/notebook/page.tsx`:
```tsx
import type { Metadata } from "next";

import { NotebookView } from "@/components/notebook";
import { ROUTES } from "@/constants";

export const metadata: Metadata = {
  title: "Sổ tay từ vựng",
  description: "Tra cứu và ôn lại những từ vựng tiếng Anh bạn đã lưu.",
  keywords: ["sổ tay từ vựng", "từ vựng tiếng Anh", "ôn từ vựng"],
  alternates: { canonical: ROUTES.NOTEBOOK },
  openGraph: {
    title: "Sổ tay từ vựng | luyenthiao.com",
    description: "Tra cứu và ôn lại những từ vựng tiếng Anh bạn đã lưu.",
    url: ROUTES.NOTEBOOK,
    type: "website",
  },
};

export default function NotebookPage(): React.ReactElement {
  return <NotebookView />;
}
```

- [ ] **Step 7: Verify and stage**

```bash
cd "$REPO/src" && npx tsc --noEmit 2>&1 | grep -c "error TS"   # 0
npx eslint "app/(dashboard)/notebook/page.tsx" components/notebook
curl -s http://localhost:3000/notebook | grep -o "<title>[^<]*</title>"
cd "$REPO" && git add "src/app/(dashboard)/notebook/page.tsx" src/components/notebook
```
**Controller commits:** `refactor(notebook): move the notebook UI into a view component`

---

### Task 5: `/notifications`

**Files:** Move `src/app/(dashboard)/notifications/page.tsx` → `src/components/notifications/notifications-view.tsx`; create `src/components/notifications/index.ts`; create `src/app/(dashboard)/notifications/page.tsx`.

`typeMeta` stays in the view: it maps keys to `lucide-react` components, so it is presentation wiring, not data.

- [ ] **Step 1: Move**

```bash
cd "$REPO/src" && mkdir -p components/notifications && git mv "app/(dashboard)/notifications/page.tsx" components/notifications/notifications-view.tsx
```

- [ ] **Step 2: Rename the component**

Replace
```tsx
export default function NotificationsPage() {
```
with
```tsx
export function NotificationsView(): React.ReactElement {
```

- [ ] **Step 3: Create the barrel**

Create `components/notifications/index.ts`:
```ts
export { NotificationsView } from "./notifications-view";
```

- [ ] **Step 4: Write the page**

Create `app/(dashboard)/notifications/page.tsx`:
```tsx
import type { Metadata } from "next";

import { NotificationsView } from "@/components/notifications";
import { ROUTES } from "@/constants";

export const metadata: Metadata = {
  title: "Thông báo",
  description: "Theo dõi kết quả bài thi, lời mời thách đấu và phần thưởng mới.",
  keywords: ["thông báo", "luyện thi tiếng Anh"],
  alternates: { canonical: ROUTES.NOTIFICATIONS },
  openGraph: {
    title: "Thông báo | luyenthiao.com",
    description: "Theo dõi kết quả bài thi, lời mời thách đấu và phần thưởng mới.",
    url: ROUTES.NOTIFICATIONS,
    type: "website",
  },
};

export default function NotificationsPage(): React.ReactElement {
  return <NotificationsView />;
}
```

- [ ] **Step 5: Verify and stage**

```bash
cd "$REPO/src" && npx tsc --noEmit 2>&1 | grep -c "error TS"   # 0
npx eslint "app/(dashboard)/notifications/page.tsx" components/notifications
curl -s http://localhost:3000/notifications | grep -o "<title>[^<]*</title>"
cd "$REPO" && git add "src/app/(dashboard)/notifications/page.tsx" src/components/notifications
```
**Controller commits:** `refactor(notifications): move the notifications UI into a view component`

---

### Task 6: `/placement-test`

**Files:** Move `src/app/(dashboard)/placement-test/page.tsx` → `src/components/placement-test/placement-test-view.tsx`; create `placement-test-data.ts`, `placement-test-sound.ts`, `index.ts`; create `src/app/(dashboard)/placement-test/page.tsx`.

- [ ] **Step 1: Move**

```bash
cd "$REPO/src" && mkdir -p components/placement-test && git mv "app/(dashboard)/placement-test/page.tsx" components/placement-test/placement-test-view.tsx
```

- [ ] **Step 2: Extract the sound helper**

Cut `function playBeep(...)` (its comment line `// Web Audio API helper...` through its closing brace) out of the view into a new `components/placement-test/placement-test-sound.ts`, exported:
```ts
// Web Audio API helper for gamified sound effects without downloading mp3 files
export function playBeep(type: "correct" | "incorrect" | "click" | "victory"): void {
```
Copy the body verbatim.

- [ ] **Step 3: Extract the data**

Cut `const LEVEL_TESTS = [...]`, `const MOCK_QUESTIONS: Record<string, Question[]> = {...}` and the `Question` type declaration out of the view into `components/placement-test/placement-test-data.ts`, each exported, prefixed with:
```ts
/** Placement-test content shown until the backend serves real questions. */
```

- [ ] **Step 4: Import them back**

In `components/placement-test/placement-test-view.tsx`, add the two relative imports as their own
group **above** the `@/lib/utils` import, with a blank line on each side:
```ts
import { LEVEL_TESTS, MOCK_QUESTIONS, type Question } from "./placement-test-data";
import { playBeep } from "./placement-test-sound";

import { cn } from "@/lib/utils";
```
Drop any of the three names from the import if `npx tsc --noEmit` reports it unused.

- [ ] **Step 5: Rename the component**

Replace
```tsx
export default function PlacementTestPage() {
```
with
```tsx
export function PlacementTestView(): React.ReactElement {
```

- [ ] **Step 6: Create the barrel**

Create `components/placement-test/index.ts`:
```ts
export { PlacementTestView } from "./placement-test-view";
```

- [ ] **Step 7: Write the page**

Create `app/(dashboard)/placement-test/page.tsx`:
```tsx
import type { Metadata } from "next";

import { PlacementTestView } from "@/components/placement-test";
import { ROUTES } from "@/constants";

export const metadata: Metadata = {
  title: "Kiểm tra đầu vào",
  description: "Làm bài kiểm tra ngắn để biết trình độ tiếng Anh hiện tại của bạn.",
  keywords: ["kiểm tra đầu vào", "test trình độ tiếng Anh", "thi thử"],
  alternates: { canonical: ROUTES.PLACEMENT_TEST },
  openGraph: {
    title: "Kiểm tra đầu vào | luyenthiao.com",
    description: "Làm bài kiểm tra ngắn để biết trình độ tiếng Anh hiện tại của bạn.",
    url: ROUTES.PLACEMENT_TEST,
    type: "website",
  },
};

export default function PlacementTestPage(): React.ReactElement {
  return <PlacementTestView />;
}
```

- [ ] **Step 8: Verify and stage**

```bash
cd "$REPO/src" && npx tsc --noEmit 2>&1 | grep -c "error TS"   # 0
npx eslint "app/(dashboard)/placement-test/page.tsx" components/placement-test
curl -s http://localhost:3000/placement-test | grep -o "<title>[^<]*</title>"
cd "$REPO" && git add "src/app/(dashboard)/placement-test/page.tsx" src/components/placement-test
```
**Controller commits:** `refactor(placement-test): move the placement test UI into a view component`

---

### Task 7: `/ranking`

**Files:** Move `src/app/(dashboard)/ranking/page.tsx` → `src/components/ranking/ranking-view.tsx`; modify `src/components/ranking/index.ts`; create `src/app/(dashboard)/ranking/page.tsx`.

- [ ] **Step 1: Move**

```bash
cd "$REPO/src" && git mv "app/(dashboard)/ranking/page.tsx" components/ranking/ranking-view.tsx
```

- [ ] **Step 2: Fix the sibling import**

The moved file imports `@/components/ranking/ranking-table`. Now that it sits in that directory, change that line to:
```ts
import { RankingTable } from "./ranking-table";
```
and place it in its own group **above** the `@/lib/utils` import, with a blank line on each side —
relative imports sort before `@/` here (see the conventions).

- [ ] **Step 3: Rename the component**

Replace
```tsx
export default function RankingPage() {
```
with
```tsx
export function RankingView(): React.ReactElement {
```

- [ ] **Step 4: Export it**

Append to `components/ranking/index.ts` (double quotes and semicolons, as in that file):
```ts
export { RankingView } from "./ranking-view";
```

- [ ] **Step 5: Write the page**

Create `app/(dashboard)/ranking/page.tsx`:
```tsx
import type { Metadata } from "next";

import { RankingView } from "@/components/ranking";
import { ROUTES } from "@/constants";

export const metadata: Metadata = {
  title: "Bảng xếp hạng",
  description: "Xem thứ hạng học viên theo ngày, tuần, tháng và năm.",
  keywords: ["bảng xếp hạng", "xếp hạng học viên", "luyện thi tiếng Anh"],
  alternates: { canonical: ROUTES.RANKING },
  openGraph: {
    title: "Bảng xếp hạng | luyenthiao.com",
    description: "Xem thứ hạng học viên theo ngày, tuần, tháng và năm.",
    url: ROUTES.RANKING,
    type: "website",
  },
};

export default function RankingPage(): React.ReactElement {
  return <RankingView />;
}
```

- [ ] **Step 6: Verify and stage**

```bash
cd "$REPO/src" && npx tsc --noEmit 2>&1 | grep -c "error TS"   # 0
npx eslint "app/(dashboard)/ranking/page.tsx" components/ranking
curl -s http://localhost:3000/ranking | grep -o "<title>[^<]*</title>"
cd "$REPO" && git add "src/app/(dashboard)/ranking/page.tsx" src/components/ranking
```
**Controller commits:** `refactor(ranking): move the ranking UI into a view component`

---

### Task 8: `/school-ranking`

**Files:** Move `src/app/(dashboard)/school-ranking/page.tsx` → `src/components/ranking/school-ranking-view.tsx`; modify `src/components/ranking/index.ts`; create `src/app/(dashboard)/school-ranking/page.tsx`.

- [ ] **Step 1: Move**

```bash
cd "$REPO/src" && git mv "app/(dashboard)/school-ranking/page.tsx" components/ranking/school-ranking-view.tsx
```

- [ ] **Step 2: Fix the sibling import**

Change
```ts
import { SchoolRankingTable } from "@/components/ranking/school-ranking-table";
```
to
```ts
import { SchoolRankingTable } from "./school-ranking-table";
```
and place it in its own group **above** any `@/` import, with a blank line on each side — relative
imports sort before `@/` here (see the conventions).

- [ ] **Step 3: Rename the component**

Replace
```tsx
export default function SchoolRankingPage() {
```
with
```tsx
export function SchoolRankingView(): React.ReactElement {
```

- [ ] **Step 4: Export it**

Append to `components/ranking/index.ts` (double quotes and semicolons, as in that file):
```ts
export { SchoolRankingView } from "./school-ranking-view";
```

- [ ] **Step 5: Write the page**

Create `app/(dashboard)/school-ranking/page.tsx`:
```tsx
import type { Metadata } from "next";

import { SchoolRankingView } from "@/components/ranking";
import { ROUTES } from "@/constants";

export const metadata: Metadata = {
  title: "Xếp hạng trường",
  description: "So sánh thành tích luyện thi tiếng Anh giữa các trường.",
  keywords: ["xếp hạng trường", "thi đua", "luyện thi tiếng Anh"],
  alternates: { canonical: ROUTES.SCHOOL_RANKING },
  openGraph: {
    title: "Xếp hạng trường | luyenthiao.com",
    description: "So sánh thành tích luyện thi tiếng Anh giữa các trường.",
    url: ROUTES.SCHOOL_RANKING,
    type: "website",
  },
};

export default function SchoolRankingPage(): React.ReactElement {
  return <SchoolRankingView />;
}
```

- [ ] **Step 6: Verify and stage**

```bash
cd "$REPO/src" && npx tsc --noEmit 2>&1 | grep -c "error TS"   # 0
npx eslint "app/(dashboard)/school-ranking/page.tsx" components/ranking
curl -s http://localhost:3000/school-ranking | grep -o "<title>[^<]*</title>"
cd "$REPO" && git add "src/app/(dashboard)/school-ranking/page.tsx" src/components/ranking
```
**Controller commits:** `refactor(school-ranking): move the school ranking UI into a view component`

---

### Task 9: `/tasks`

**Files:** Move `src/app/(dashboard)/tasks/page.tsx` → `src/components/tasks/tasks-view.tsx`; create `src/components/tasks/index.ts`; create `src/app/(dashboard)/tasks/page.tsx`.

`taskIcons` stays in the view: it maps keys to `lucide-react` components.

- [ ] **Step 1: Move**

```bash
cd "$REPO/src" && mkdir -p components/tasks && git mv "app/(dashboard)/tasks/page.tsx" components/tasks/tasks-view.tsx
```

- [ ] **Step 2: Rename the component**

Replace
```tsx
export default function TasksPage() {
```
with
```tsx
export function TasksView(): React.ReactElement {
```

- [ ] **Step 3: Create the barrel**

Create `components/tasks/index.ts`:
```ts
export { TasksView } from "./tasks-view";
```

- [ ] **Step 4: Write the page**

Create `app/(dashboard)/tasks/page.tsx`:
```tsx
import type { Metadata } from "next";

import { TasksView } from "@/components/tasks";
import { ROUTES } from "@/constants";

export const metadata: Metadata = {
  title: "Nhiệm vụ hằng ngày",
  description: "Hoàn thành nhiệm vụ mỗi ngày để nhận kim cương và xu.",
  keywords: ["nhiệm vụ hằng ngày", "phần thưởng", "luyện thi tiếng Anh"],
  alternates: { canonical: ROUTES.TASKS },
  openGraph: {
    title: "Nhiệm vụ hằng ngày | luyenthiao.com",
    description: "Hoàn thành nhiệm vụ mỗi ngày để nhận kim cương và xu.",
    url: ROUTES.TASKS,
    type: "website",
  },
};

export default function TasksPage(): React.ReactElement {
  return <TasksView />;
}
```

- [ ] **Step 5: Verify and stage**

```bash
cd "$REPO/src" && npx tsc --noEmit 2>&1 | grep -c "error TS"   # 0
npx eslint "app/(dashboard)/tasks/page.tsx" components/tasks
curl -s http://localhost:3000/tasks | grep -o "<title>[^<]*</title>"
cd "$REPO" && git add "src/app/(dashboard)/tasks/page.tsx" src/components/tasks
```
**Controller commits:** `refactor(tasks): move the tasks UI into a view component`

---

### Task 10: `/testresult`

**Files:** Move `src/app/testresult/page.tsx` → `src/components/exam/exam-result-view.tsx`; create `src/components/exam/exam-result-fallback.tsx`; modify `src/components/exam/index.ts`; create `src/app/testresult/page.tsx`.

The page imports the view **directly**, not through `@/components/exam`: that barrel re-exports `ExamCheckpoint`, which statically imports a 249 KB mock. `.claude/rules/coding.md` documents this exception.

- [ ] **Step 1: Move**

```bash
cd "$REPO/src" && git mv app/testresult/page.tsx components/exam/exam-result-view.tsx
```

- [ ] **Step 2: Turn the content function into the exported view**

In `components/exam/exam-result-view.tsx`, replace
```tsx
function TestResultContent() {
```
with
```tsx
export function ExamResultView(): React.ReactElement {
```

- [ ] **Step 3: Move the fallback out**

Delete the whole trailing `export default function TestResultPage() { ... }` block from the view file, and create `components/exam/exam-result-fallback.tsx` with its spinner markup:
```tsx
/** Shown while `ExamResultView` waits for its search params. */
export function ExamResultFallback(): React.ReactElement {
  return (
    <main className="w-full h-[100dvh] bg-dashboard-bg flex items-center justify-center text-white">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-white" />
    </main>
  );
}
```
Then delete the now-unused `Suspense` entry from the view's `react` import (keep the rest of that import line intact).

- [ ] **Step 4: Export both**

Append to `components/exam/index.ts`:
```ts
export { ExamResultFallback } from "./exam-result-fallback"
export { ExamResultView } from "./exam-result-view"
```

- [ ] **Step 5: Write the page**

Create `app/testresult/page.tsx`:
```tsx
import type { Metadata } from "next";
import { Suspense } from "react";

import { ExamResultFallback } from "@/components/exam/exam-result-fallback";
import { ExamResultView } from "@/components/exam/exam-result-view";
import { ROUTES } from "@/constants";

export const metadata: Metadata = {
  title: "Kết quả bài thi",
  description: "Xem điểm số và chi tiết kết quả bài thi vừa hoàn thành.",
  keywords: ["kết quả bài thi", "điểm thi thử", "luyện thi tiếng Anh"],
  alternates: { canonical: ROUTES.TEST_RESULT },
  openGraph: {
    title: "Kết quả bài thi | luyenthiao.com",
    description: "Xem điểm số và chi tiết kết quả bài thi vừa hoàn thành.",
    url: ROUTES.TEST_RESULT,
    type: "website",
  },
};

export default function TestResultPage(): React.ReactElement {
  return (
    <Suspense fallback={<ExamResultFallback />}>
      <ExamResultView />
    </Suspense>
  );
}
```

- [ ] **Step 6: Verify and stage**

```bash
cd "$REPO/src" && npx tsc --noEmit 2>&1 | grep -c "error TS"   # 0
npx eslint app/testresult/page.tsx components/exam
curl -s "http://localhost:3000/testresult?examId=x&score=1&listening=1&rw=0&total=60" | grep -o "<title>[^<]*</title>"
cd "$REPO" && git add src/app/testresult/page.tsx src/components/exam
```
**Controller commits:** `refactor(testresult): move the result UI into a view component`

---

### Task 11: Verification (no commits)

- [ ] **Step 1: No page still ships client code**

```bash
cd "$REPO/src" && grep -rl '"use client"' app --include=page.tsx || echo "no client pages left"
grep -rLE "export const metadata|generateMetadata" $(git -C "$REPO" ls-files 'src/app/**/page.tsx' | sed 's|^src/||') || echo "every page declares metadata"
```
Expected: `no client pages left`; the second command lists nothing.

- [ ] **Step 2: Static checks and a clean build**

Stop the dev server started in Task 0 (find its PID with `netstat -ano | grep ":3000 " | grep LISTENING`, then `taskkill //PID <pid> //T //F`), then:
```bash
cd "$REPO/src" && npx tsc --noEmit 2>&1 | grep -c "error TS"      # 0
npm test 2>&1 | grep -E "Test Files|Tests "                        # 5 files, 38 tests
npx eslint . 2>&1 | tail -2                                        # 8 pre-existing errors only
rm -rf .next && env -u NEXT_PUBLIC_APP_URL -u NEXT_PUBLIC_API_URL npm run build 2>&1 | tail -35
```
Expected: the build succeeds and the route table lists 27 routes.

- [ ] **Step 3: "After" screenshots and comparison**

Restart the dev server, then:
```bash
node "$SCR/shots.mjs" http://localhost:3000 "$SCR/after" "$REPO/src"
node "$WS/.scratch/tools/compare-shots.mjs" "$SCR/before" "$SCR/after"
```
Expected: every route not listed in `$SCR/nondeterministic.txt` is `SAME`. For each route that is listed, open the before/after PNGs with the Read tool and confirm the only differences are the time-dependent regions noted in Task 0. Any other difference is a regression — stop and report.

- [ ] **Step 4: Compare the reports**

```bash
node -e "const b=require('$SCR/before/report.json'),a=require('$SCR/after/report.json');
const k=x=>x.filter(e=>e.kind!=='status').map(e=>e.route+' '+e.kind+' '+e.text);
const nb=new Set(k(b));console.log('new errors:',k(a).filter(x=>!nb.has(x)));
console.log(a.filter(e=>e.kind==='status').map(e=>e.route+' '+e.text+' '+e.title).join('\n'))"
```
Expected: `new errors: []`; every status is `200`; every title is now the page-specific one (before, they were all the site default).

- [ ] **Step 5: Baseline routes unchanged**

```bash
node "$WS/.scratch/tools/route-shots.mjs" http://localhost:3000 "$SCR/baseline-after" "$REPO/src"
node "$WS/.scratch/tools/compare-shots.mjs" "$WS/.scratch/shots/base-1" "$SCR/baseline-after"
```
Expected: routes outside `$WS/.scratch/shots/nondeterministic.txt` are `SAME` (the `/ranking` dev-overlay flake is known).

- [ ] **Step 6: Interaction, because screenshots cannot prove state still works**

With the dev server running, drive each of these by hand or with Playwright and record the outcome:
1. `/notifications` — switch the filter to unread, click one item, then "mark all read"; the unread count drops to zero.
2. `/tasks` — click a finished task's claim button; the confirmation appears.
3. `/placement-test` — start a level, answer one question, see the next question appear.
4. `/history` — type in the search box and change the level filter; the list narrows.
5. `/notebook` — search a word and switch the level tab; the list changes.
6. `/testresult?examId=…&score=10&listening=5&rw=5&total=60` — the score reads 10/60.

- [ ] **Step 7: Stop the dev server you started and report**

Report to the owner: the commits made, the verification output, any route compared by eye and why it is acceptable, and that nothing was pushed.
