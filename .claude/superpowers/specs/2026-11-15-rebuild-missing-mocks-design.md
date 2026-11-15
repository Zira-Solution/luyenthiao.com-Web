# Phase 3a — Rebuild the five missing mocks

- **Date:** 2026-11-15
- **Repo:** `luyenthiao.com-Web`, working directly on `main` (owner decision; no feature branch)
- **Status:** design approved in conversation, pending written-spec review
- **Context:** phase 3 (coding) of the cleanup program; earlier decision recorded in
  `.claude/superpowers/specs/2026-11-15-zoney-structure-refactor-design.md` §10, refined here.

## 1. Problem

Five mock files are imported but have never been committed (`notifications`, `school-ranking`,
`speaking`, `tasks`, `writing`). As a result `npx tsc --noEmit` reports 15 errors, `npm run build`
fails (Vercel deploy of `main` fails), and eight routes cannot render: `/notifications`, `/tasks`,
`/school-ranking`, `/speaking/[slug]`, `/speaking/result/[id]`, `/speaking/result/[id]/preview`,
`/write/[slug]`, `/write/result/[id]`. Their author has left the project; no copy exists.

## 2. Goal and acceptance

Rebuild the five mocks with original project content so that:

- `npx tsc --noEmit` reports **0 errors**;
- `npm run build` **succeeds** and lists all 23 routes;
- `npm test` passes; `npm run lint` shows only the 8 pre-existing `import-x/order` errors;
- the eight routes render and their interactions work in the running app (section 6);
- the 15 routes that already worked render exactly as before (screenshot comparison);
- CI passes with `continue-on-error` removed from Type-check and Build.

## 3. Non-goals

- Thinning the nine client pages, centralizing asset paths, removing now-unused
  `public/clone-assets/speaking/<hash>.*` and `public/clone-assets/writing/write1_*.webp`.
- Fixing the 8 pre-existing lint errors.
- Any change to page logic beyond import lines, the removed `as` casts and variable names.

## 4. Data format and types

Verified: importing JSON widens string literals to `string`, so a JSON mock cannot be checked with
`satisfies SpeakingTest` (e.g. `kind: "scene-mark"` becomes `string`). Decision (owner): the five
mocks are **TypeScript modules** checked with `satisfies`.

### 4.1 New types (`src/types/`, re-exported from `src/types/index.ts`)

```ts
// types/notification.ts
export type NotificationType = "result" | "challenge" | "reward" | "event" | "system"
export interface Notification {
  id: number
  type: NotificationType
  title: string
  message: string
  time: string
  read: boolean
}

// types/task.ts
export type TaskIcon =
  | "exam" | "trophy" | "writing" | "speaking" | "vocab" | "grammar" | "challenge" | "login"
export type TaskRewardType = "diamond" | "coin"
export interface Task {
  id: number
  icon: TaskIcon
  title: string
  description: string
  progress: number
  target: number
  done: boolean
  rewardType: TaskRewardType
  rewardValue: number
}

// types/ranking.ts
export interface SchoolRankingEntry {
  rank: number
  name: string
  location: string
  studentCount: number
  score: number
}
```

The unions match the keys the pages already use (`typeMeta` in
`app/(dashboard)/notifications/page.tsx`, `taskIcons` in `app/(dashboard)/tasks/page.tsx`).
`SpeakingTest` and `WritingTest` already exist and are not changed.

### 4.2 New mock modules (`src/mocks/`, named exports)

| File | Export |
|---|---|
| `notifications.ts` | `export const notificationsMock = [...] satisfies Notification[]` |
| `tasks.ts` | `export const tasksMock = [...] satisfies Task[]` |
| `school-ranking.ts` | `export const schoolRankingMock = [...] satisfies SchoolRankingEntry[]` |
| `speaking.ts` | `export const speakingTestMock = {...} satisfies SpeakingTest` |
| `writing.ts` | `export const writingTestMock = {...} satisfies WritingTest` |

The six existing JSON mocks are unchanged.

### 4.3 Import sites (8 files)

`app/(dashboard)/notifications/page.tsx`, `app/(dashboard)/tasks/page.tsx`,
`components/ranking/school-ranking-table.tsx`, `app/speaking/[slug]/page.tsx`,
`app/speaking/result/[id]/page.tsx`, `app/speaking/result/[id]/preview/page.tsx`,
`app/write/[slug]/page.tsx`, `app/write/result/[id]/page.tsx`:
replace `import x from "@/mocks/<name>.json"` with the named import from `@/mocks/<name>`, and
remove the `as SpeakingTest` / `as WritingTest` casts. No other change in these files.

### 4.4 Ids

- Speaking: test id `speaking-demo-1`, attempt id `speaking-demo-1-attempt`.
- Writing: test id `writing-demo-1`, attempt id `writing-demo-1-attempt`.
- `constants/index.ts`: `DEMO_SPEAKING_TEST_PATH = '/speaking/speaking-demo-1'`,
  `DEMO_WRITE_TEST_PATH = '/write/writing-demo-1'`.

## 5. Content and placeholders

### 5.1 Rules

- Original content written for this project; nothing copied from exam.flyer.us.
- Level: children's English, Starters/Flyers level (matches the existing UI labels).
- English for the English-learning items (questions, sample answers); Vietnamese for UI copy
  (titles, instructions, notifications, feedback), consistent with the existing UI.
- School names are fictional; locations are Vietnamese provinces/cities.

### 5.2 Placeholder images (self-made SVG, label text inside each image)

Verified: Next 16.1.6 `next/image` serves `.svg` as-is with the default loader
(`node_modules/next/dist/shared/lib/get-img-props.js:263`), so SVGs work without
`dangerouslyAllowSVG`.

- `public/placeholders/speaking/park-scene.svg` — 1200×900 park: sky, grass, tree, bench, pond.
  Used by `scene-mark`, `drag-object` and `mic-answer` questions.
- `public/placeholders/speaking/{ball,cat,apple,kite,book,hat,dog,bike}.svg` — simple object icons.
- `public/placeholders/writing/story-{1,2,3}.svg` — three story panels: a child flies a kite; the
  kite is stuck in a tree; a parent helps get it down.

Scene slot coordinates (`top`, `left`, `width`, `height`, percent of 1200×900) must match where the
objects are drawn in `park-scene.svg`.

### 5.3 Speaking test (`speakingTestMock`)

Four parts, nine questions, all six `SpeakingQuestionKind` values:

| Part | Kind | Questions | Content |
|---|---|---|---|
| Part 1a | `scene-mark` | 2 | "Where is the ball?", "Where is the cat?" — `scene` slots + `correctSlotId` |
| Part 1b | `choose-object` | 1 | four `choices`, exactly one `correct: true` |
| Part 1c | `drag-object` | 1 | `palette` of three objects; place the cat on the bench (`correctDraggableId`, `correctTargetId`) |
| Part 2 | `mic-answer` | 2 | `pointer` on an object: "What's this?" |
| Part 3 | `mic-zoom` | 1 | four `cards` + `zoomCard` |
| Part 4 | `mic-plain` | 2 | "What's your name?", "How old are you?" |

`attempt` fields (`userName`, `flyerId`, `testTitle`, `testName`, `diamond`, `time`, `submittedAt`)
hold neutral demo values.

### 5.4 Writing test (`writingTestMock`)

`minutes: 20`, `maxScore: 5`, `score: 3`, `userAnswer: ""` (the result page reads the real answer
from the query string), three `prompt.images` pointing at the story SVGs, a short English
`sampleAnswer`, Vietnamese `feedback` (`comment`, `errors`, `tips`).

### 5.5 Other mocks

- `notificationsMock`: 6 items covering all five types, some read and some unread.
- `tasksMock`: 8 items covering all eight icons and both reward types, including completed tasks.
- `schoolRankingMock`: 10 schools, `rank` 1–10, `score` descending.

## 6. Verification

1. Static: `tsc` 0 errors; `npm test` passes; lint only the 8 known errors; `npm run build`
   succeeds and lists the 23 routes plus `/api/admin/media`, `/robots.txt`, `/sitemap.xml`,
   `/_not-found`.
2. Running app (`npm run dev` from `src/`), Playwright: the eight formerly broken routes render with
   no new console errors and no 404 image requests. Repeat for `/speaking/speaking-demo-1` and
   `/write/writing-demo-1` against the production server (`npm run build` then `npm start`) to
   confirm the SVG placeholders load there too.
3. Interactive flows:
   - Speaking: go through all nine questions (mark in scene, choose image, place the cat, pointer
     and zoom prompts), submit, result screen, answer preview. Microphone recording is verified only
     if the browser grants a microphone; otherwise it is reported as not verified.
   - Writing: type an answer, submit, result overview, review.
   - Notifications: mark one and all as read. Tasks: claim a completed task.
4. The 15 previously working routes: screenshots identical to the baseline in
   `E:/Ziratech/English-Prep-Web-Game/.scratch/shots/` (known nondeterministic routes compared by
   eye).
5. After the owner pushes: CI green with Type-check and Build blocking; Vercel deploy succeeds.

## 7. Follow-up changes in the same branch

- `.github/workflows/ci.yml`: remove `continue-on-error` (and its comment) from Type-check and
  Build; keep it on Lint.
- `docs/03-known-issues.md`: remove section 1 (missing mocks) and renumber; keep the lint section.
- `AGENTS.md` commands: `npx tsc --noEmit  # must pass (0 errors)`, `npm run build  # must pass`.
- `.claude/rules/verification.md`, `.claude/rules/workflow.md`, `.claude/agents/{implementer,
  spec-reviewer,code-reviewer,runner}.md`: replace "missing mocks make tsc/build fail" wording with
  "`tsc` and `build` must pass; lint has pre-existing errors (`docs/03-known-issues.md`)".
- `.claude/ARCHITECTURE.md` and `docs/01`: remove any "five mock files are missing" note.

## 8. Risks

| Risk | Mitigation |
|---|---|
| Scene coordinates do not match the SVG drawing | coordinates and SVG authored together; checked visually in the running app |
| A component reads a field the types mark optional but the UI expects | all six kinds exercised in the browser flow |
| SVG not rendered by `next/image` in production | verified in Next source; checked in `next build` + `next start` |
| Doc wording drifts from the new baseline | grep for `missing mocks`, `15 known`, `continue-on-error` after the change |
