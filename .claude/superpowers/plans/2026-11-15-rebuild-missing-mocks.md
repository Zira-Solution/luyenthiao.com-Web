# Phase 3a — Rebuild the Missing Mocks Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Recreate the five missing mocks as typed TypeScript modules with original content and self-made SVG placeholders so that `tsc` and `next build` pass and the eight broken routes work.

**Architecture:** Three new domain types in `src/types/`; five `src/mocks/*.ts` modules checked with `satisfies`; twelve SVG placeholders in `src/public/placeholders/`; an invariants test that also proves every referenced image exists; eight import sites switched from missing JSON to the new modules; CI and docs updated to the new baseline.

**Tech Stack:** Next.js 16.1.6 (App Router), React 19, TypeScript strict, Vitest 4 (jsdom), Playwright (verification only), Git Bash on Windows.

**Spec:** `.claude/superpowers/specs/2026-11-15-rebuild-missing-mocks-design.md`

---

## Conventions for the executor

```bash
export WS="E:/Ziratech/English-Prep-Web-Game"
export REPO="$WS/luyenthiao.com-Web"
export SCR="$WS/.scratch"
export PW_CHROME="C:/Users/lemin/AppData/Local/ms-playwright/chromium-1248/chrome-win64/chrome.exe"
```
- Work on `main` (owner decision). npm commands run in `$REPO/src`.
- Node is a Windows binary: pass `E:/...` paths to node, never `/tmp/...`.
- Subagents **stage only**; the controller commits with the exact message given. Messages: English, one line, no `Co-Authored-By`, no AI attribution.
- Code style: double quotes and no semicolons are used inconsistently in the repo; new files use **double quotes, no semicolons**, 2-space indent, named exports (match `src/types/writing.ts`).
- Exploration rule: run `graphify query "<q>" --budget 800 --graph "$REPO/graphify-out/graph.json"` and one `codegraph_explore` (projectPath = `$REPO`) before raw reads of code files.

## File map

| Path (under `src/`) | Action | Task |
|---|---|---|
| `types/notification.ts`, `types/task.ts`, `types/ranking.ts` | create | 1 |
| `types/index.ts` | modify (re-exports) | 1 |
| `mocks/mocks.test.ts` | create (invariants) | 2 |
| `public/placeholders/speaking/*.svg` (9 files) | create | 3 |
| `public/placeholders/writing/story-{1,2,3}.svg` | create | 3 |
| `mocks/notifications.ts`, `mocks/tasks.ts`, `mocks/school-ranking.ts` | create | 4 |
| `mocks/speaking.ts`, `mocks/writing.ts` | create | 5 |
| 8 import sites + `constants/index.ts` | modify | 6 |
| `../.github/workflows/ci.yml`, docs, rules, agents | modify | 7 |

---

### Task 0: Approvals

- [ ] **Step 1:** `cd "$REPO" && git branch --show-current && git status --short` → `main`; only `?? .claude/superpowers/specs/2026-11-15-rebuild-missing-mocks-design.md` and `?? .claude/superpowers/plans/2026-11-15-rebuild-missing-mocks.md`.
- [ ] **Step 2:** Ask the owner to approve, in one package: the commits listed in Tasks 0–7 on `main`, plus fix commits for Critical/Important review findings. No push unless asked.
- [ ] **Step 3:** `git add .claude/superpowers/specs/2026-11-15-rebuild-missing-mocks-design.md .claude/superpowers/plans/2026-11-15-rebuild-missing-mocks.md && git commit -m "docs: add phase 3a missing-mocks spec and plan"`

---

### Task 1: Types

**Files:** create `src/types/notification.ts`, `src/types/task.ts`, `src/types/ranking.ts`; modify `src/types/index.ts`.

- [ ] **Step 1: `src/types/notification.ts`**
```ts
/** In-app notification shown on /notifications (mock data until the backend provides it). */
export type NotificationType = "result" | "challenge" | "reward" | "event" | "system"

export interface Notification {
  id: number
  type: NotificationType
  title: string
  message: string
  /** Relative time label shown as-is, e.g. "5 phút trước". */
  time: string
  read: boolean
}
```
- [ ] **Step 2: `src/types/task.ts`**
```ts
/** Daily task shown on /tasks (mock data until the backend provides it). */
export type TaskIcon =
  | "exam"
  | "trophy"
  | "writing"
  | "speaking"
  | "vocab"
  | "grammar"
  | "challenge"
  | "login"

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
```
- [ ] **Step 3: `src/types/ranking.ts`**
```ts
/** One row of the school leaderboard on /school-ranking. */
export interface SchoolRankingEntry {
  rank: number
  name: string
  location: string
  studentCount: number
  score: number
}
```
- [ ] **Step 4:** In `src/types/index.ts`, append after the existing `export * from './auth'` line:
```ts
export type { Notification, NotificationType } from "./notification"
export type { SchoolRankingEntry } from "./ranking"
export type { Task, TaskIcon, TaskRewardType } from "./task"
```
- [ ] **Step 5:** `cd "$REPO/src" && npx tsc --noEmit 2>&1 | grep -c "error TS"` → still `15` (types alone change nothing). Stage: `git add types`.
- [ ] **Step 6 (controller):** `git commit -m "feat(types): add notification, task and school ranking types"`

---

### Task 2: Invariants test (write first; it must fail)

**Files:** create `src/mocks/mocks.test.ts`.

- [ ] **Step 1:**
```ts
import fs from "node:fs"
import path from "node:path"

import { describe, expect, it } from "vitest"

import { notificationsMock } from "./notifications"
import { schoolRankingMock } from "./school-ranking"
import { speakingTestMock } from "./speaking"
import { tasksMock } from "./tasks"
import { writingTestMock } from "./writing"

import type { SpeakingPart } from "@/types/speaking"

const PUBLIC_DIR = path.resolve(import.meta.dirname, "..", "public")

function publicFileExists(src: string): boolean {
  return fs.existsSync(path.join(PUBLIC_DIR, src.replace(/^\//, "")))
}

describe("notificationsMock", () => {
  it("covers every notification type with unique ids", () => {
    const types = new Set(notificationsMock.map((n) => n.type))
    expect([...types].sort()).toEqual(["challenge", "event", "result", "reward", "system"])
    expect(new Set(notificationsMock.map((n) => n.id)).size).toBe(notificationsMock.length)
  })

  it("has both read and unread items", () => {
    expect(notificationsMock.some((n) => n.read)).toBe(true)
    expect(notificationsMock.some((n) => !n.read)).toBe(true)
  })
})

describe("tasksMock", () => {
  it("covers every icon and both reward types with unique ids", () => {
    expect(new Set(tasksMock.map((t) => t.icon)).size).toBe(8)
    expect(new Set(tasksMock.map((t) => t.rewardType))).toEqual(new Set(["diamond", "coin"]))
    expect(new Set(tasksMock.map((t) => t.id)).size).toBe(tasksMock.length)
  })

  it("marks a task done exactly when progress reaches target", () => {
    for (const t of tasksMock) {
      expect(t.done).toBe(t.progress >= t.target)
      expect(t.progress).toBeLessThanOrEqual(t.target)
    }
    expect(tasksMock.some((t) => t.done)).toBe(true)
  })
})

describe("schoolRankingMock", () => {
  it("ranks 1..n with scores strictly descending", () => {
    schoolRankingMock.forEach((s, i) => expect(s.rank).toBe(i + 1))
    for (let i = 1; i < schoolRankingMock.length; i++) {
      const prev = schoolRankingMock[i - 1]
      const cur = schoolRankingMock[i]
      expect(prev && cur && prev.score > cur.score).toBe(true)
    }
  })
})

describe("speakingTestMock", () => {
  // `satisfies` keeps narrow literal types; widen to the declared type before reading optional fields.
  const parts: SpeakingPart[] = speakingTestMock.attempt.parts
  const questions = parts.flatMap((p) => p.questions)

  it("uses the neutral demo ids", () => {
    expect(speakingTestMock.id).toBe("speaking-demo-1")
    expect(speakingTestMock.attempt.id).toBe("speaking-demo-1-attempt")
  })

  it("covers all six question kinds with unique ids", () => {
    expect(new Set(questions.map((q) => q.kind))).toEqual(
      new Set(["scene-mark", "choose-object", "drag-object", "mic-answer", "mic-zoom", "mic-plain"]),
    )
    expect(new Set(questions.map((q) => q.id)).size).toBe(questions.length)
  })

  it("has consistent answer keys", () => {
    for (const q of questions) {
      if (q.kind === "scene-mark") {
        expect(q.scene?.some((s) => s.id === q.correctSlotId)).toBe(true)
      }
      if (q.kind === "choose-object") {
        expect(q.choices?.filter((c) => c.correct).length).toBe(1)
      }
      if (q.kind === "drag-object") {
        expect(q.palette?.some((p) => p.id === q.correctDraggableId)).toBe(true)
        expect(q.scene?.some((s) => s.id === q.correctTargetId)).toBe(true)
      }
      if (q.kind === "mic-answer") {
        expect(q.pointer).toBeDefined()
      }
      if (q.kind === "mic-zoom") {
        expect(q.cards?.length).toBe(4)
        expect(q.cards?.some((c) => c.src === q.zoomCard)).toBe(true)
      }
    }
  })

  it("keeps every scene slot inside the picture", () => {
    for (const s of questions.flatMap((q) => q.scene ?? [])) {
      expect(s.left + s.width).toBeLessThanOrEqual(100)
      expect(s.top + s.height).toBeLessThanOrEqual(100)
    }
  })

  it("references only images that exist in public/", () => {
    const srcs = questions.flatMap((q) => [
      q.sceneBg,
      q.zoomCard,
      ...(q.scene ?? []).map((s) => s.src),
      ...(q.choices ?? []).map((c) => c.src),
      ...(q.palette ?? []).map((p) => p.src),
      ...(q.cards ?? []).map((c) => c.src),
    ])
    for (const src of srcs.filter((s): s is string => Boolean(s))) {
      expect(publicFileExists(src), src).toBe(true)
    }
  })
})

describe("writingTestMock", () => {
  it("uses the neutral demo ids and three story images that exist", () => {
    expect(writingTestMock.id).toBe("writing-demo-1")
    expect(writingTestMock.attempt.id).toBe("writing-demo-1-attempt")
    const images = writingTestMock.attempt.prompt.images
    expect(images.map((i) => i.slot)).toEqual(["story-img-1", "story-img-2", "story-img-3"])
    for (const img of images) {
      expect(img.src && publicFileExists(img.src), String(img.src)).toBe(true)
    }
  })

  it("keeps the score within the maximum", () => {
    const { score, maxScore } = writingTestMock.attempt
    expect(score).toBeGreaterThanOrEqual(0)
    expect(score).toBeLessThanOrEqual(maxScore)
  })
})
```
- [ ] **Step 2:** `cd "$REPO/src" && npx vitest run mocks/mocks.test.ts 2>&1 | tail -8` → FAIL (cannot resolve `./notifications` etc.). Record the output. Do not stage yet (it is committed with Task 5, when it passes).

---

### Task 3: SVG placeholders

**Files:** create under `src/public/placeholders/`. All files LF, trailing newline, exactly as below. Coordinates in `park-scene.svg` are referenced by Task 5 — do not change them.

- [ ] **Step 1: `speaking/park-scene.svg`**
```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 900" width="1200" height="900">
  <title>Placeholder: park scene</title>
  <rect width="1200" height="540" fill="#bfe6ff"/>
  <rect y="540" width="1200" height="360" fill="#8fd16a"/>
  <circle cx="1050" cy="120" r="60" fill="#ffd34d"/>
  <rect x="120" y="330" width="60" height="260" fill="#8b5a2b"/>
  <circle cx="150" cy="300" r="130" fill="#3f9b3f"/>
  <rect x="480" y="540" width="300" height="25" rx="6" fill="#b5651d"/>
  <rect x="500" y="565" width="14" height="25" fill="#6b3d12"/>
  <rect x="746" y="565" width="14" height="25" fill="#6b3d12"/>
  <rect x="480" y="590" width="300" height="30" rx="6" fill="#b5651d"/>
  <rect x="500" y="620" width="20" height="20" fill="#6b3d12"/>
  <rect x="740" y="620" width="20" height="20" fill="#6b3d12"/>
  <ellipse cx="950" cy="720" rx="170" ry="70" fill="#5bb8e8"/>
  <polygon points="640,115 685,170 640,225 595,170" fill="#ff6b9a"/>
  <path d="M640 225 q -20 20 0 40" stroke="#555555" stroke-width="3" fill="none"/>
  <circle cx="330" cy="760" r="45" fill="#e63946"/>
  <path d="M285 760 h90" stroke="#ffffff" stroke-width="8"/>
  <ellipse cx="650" cy="805" rx="55" ry="30" fill="#f4a259"/>
  <circle cx="705" cy="770" r="28" fill="#f4a259"/>
  <polygon points="685,750 692,728 702,746" fill="#f4a259"/>
  <polygon points="708,746 718,728 726,752" fill="#f4a259"/>
  <path d="M600 800 q -10 -30 10 -45" stroke="#f4a259" stroke-width="10" fill="none" stroke-linecap="round"/>
  <text x="600" y="880" font-family="sans-serif" font-size="28" text-anchor="middle" fill="#2d6a1f">Placeholder park scene</text>
</svg>
```
Object boxes (pixels in the 1200×900 picture → percent used by Task 5): ball x 285–375, y 715–805 → left 23.75, top 79.44, width 7.5, height 10. Cat x 595–733, y 728–835 → left 49.5, top 80.8, width 11.6, height 12. Kite x 595–685, y 115–265 → left 49.5, top 12.7, width 7.6, height 16.7. Bench x 480–780, y 540–640 → left 40, top 60, width 25, height 11.2. Pond x 780–1120, y 650–790 → left 65, top 72.2, width 28.4, height 15.6. Tree x 20–280, y 170–590 → left 1.6, top 18.8, width 21.8, height 46.8.

- [ ] **Step 2: object icons** — each file uses this frame, with the shape lines and label given below:
```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
  <title>Placeholder: LABEL</title>
  <rect width="200" height="200" rx="24" fill="#fff7e6"/>
  SHAPES
  <text x="100" y="188" font-family="sans-serif" font-size="22" text-anchor="middle" fill="#555555">LABEL</text>
</svg>
```
| File | LABEL | SHAPES |
|---|---|---|
| `speaking/ball.svg` | ball | `<circle cx="100" cy="88" r="55" fill="#e63946"/><path d="M45 88 h110" stroke="#ffffff" stroke-width="10"/>` |
| `speaking/cat.svg` | cat | `<ellipse cx="90" cy="110" rx="55" ry="32" fill="#f4a259"/><circle cx="142" cy="75" r="28" fill="#f4a259"/><polygon points="122,56 128,30 138,52" fill="#f4a259"/><polygon points="146,52 156,30 162,58" fill="#f4a259"/>` |
| `speaking/apple.svg` | apple | `<circle cx="100" cy="95" r="55" fill="#d62828"/><rect x="96" y="30" width="8" height="22" fill="#6b3d12"/><ellipse cx="120" cy="40" rx="16" ry="8" fill="#3f9b3f"/>` |
| `speaking/kite.svg` | kite | `<polygon points="100,22 150,88 100,154 50,88" fill="#ff6b9a"/><path d="M100 22 V154 M50 88 H150" stroke="#ffffff" stroke-width="4"/>` |
| `speaking/book.svg` | book | `<rect x="45" y="40" width="110" height="110" rx="8" fill="#3a86ff"/><path d="M60 40 V150" stroke="#ffffff" stroke-width="6"/>` |
| `speaking/hat.svg` | hat | `<ellipse cx="100" cy="135" rx="72" ry="16" fill="#333333"/><rect x="62" y="60" width="76" height="75" rx="6" fill="#333333"/><rect x="62" y="112" width="76" height="12" fill="#e63946"/>` |
| `speaking/dog.svg` | dog | `<ellipse cx="90" cy="115" rx="55" ry="32" fill="#a0522d"/><circle cx="145" cy="80" r="30" fill="#a0522d"/><ellipse cx="132" cy="62" rx="10" ry="22" fill="#6b3d12"/>` |
| `speaking/bike.svg` | bike | `<circle cx="58" cy="118" r="34" fill="none" stroke="#333333" stroke-width="8"/><circle cx="142" cy="118" r="34" fill="none" stroke="#333333" stroke-width="8"/><path d="M58 118 L92 70 L142 118 M92 70 H126 L142 118" stroke="#3a86ff" stroke-width="8" fill="none"/>` |

- [ ] **Step 3: writing story panels** — frame:
```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" width="400" height="300">
  <title>Placeholder: TITLE</title>
  <rect width="400" height="200" fill="#bfe6ff"/>
  <rect y="200" width="400" height="100" fill="#8fd16a"/>
  SHAPES
  <text x="200" y="288" font-family="sans-serif" font-size="16" text-anchor="middle" fill="#2d6a1f">TITLE</text>
</svg>
```
| File | TITLE | SHAPES |
|---|---|---|
| `writing/story-1.svg` | 1. Flying a kite | `<circle cx="120" cy="180" r="16" fill="#f1c27d"/><rect x="108" y="196" width="24" height="44" rx="6" fill="#3a86ff"/><path d="M132 200 L280 70" stroke="#555555" stroke-width="2"/><polygon points="280,40 305,70 280,100 255,70" fill="#ff6b9a"/>` |
| `writing/story-2.svg` | 2. The kite is stuck | `<rect x="270" y="110" width="22" height="120" fill="#8b5a2b"/><circle cx="281" cy="95" r="60" fill="#3f9b3f"/><polygon points="300,60 318,82 300,104 282,82" fill="#ff6b9a"/><circle cx="130" cy="180" r="16" fill="#f1c27d"/><rect x="118" y="196" width="24" height="44" rx="6" fill="#3a86ff"/><path d="M122 186 q 8 -6 16 0" stroke="#333333" stroke-width="2" fill="none"/>` |
| `writing/story-3.svg` | 3. Dad helps | `<rect x="270" y="110" width="22" height="120" fill="#8b5a2b"/><circle cx="281" cy="95" r="60" fill="#3f9b3f"/><circle cx="220" cy="140" r="18" fill="#f1c27d"/><rect x="206" y="158" width="28" height="82" rx="6" fill="#2a9d8f"/><path d="M230 165 L270 100" stroke="#2a9d8f" stroke-width="8"/><polygon points="285,80 303,102 285,124 267,102" fill="#ff6b9a"/><circle cx="130" cy="180" r="16" fill="#f1c27d"/><rect x="118" y="196" width="24" height="44" rx="6" fill="#3a86ff"/><path d="M122 184 q 8 6 16 0" stroke="#333333" stroke-width="2" fill="none"/>` |

- [ ] **Step 4:** Validate every SVG parses: `cd "$REPO/src" && for f in public/placeholders/*/*.svg; do node -e "const s=require('fs').readFileSync('$f','utf8'); if(!/^<svg [^>]*xmlns=/.test(s)||!s.trim().endsWith('</svg>')) {console.log('BAD $f'); process.exit(1)}"; done; ls public/placeholders/speaking | wc -l; ls public/placeholders/writing | wc -l` → no `BAD`, `9`, `3`.
- [ ] **Step 5:** Stage `git add public/placeholders`. **Controller:** `git commit -m "feat(assets): add self-made svg placeholders for speaking and writing mocks"`

---

### Task 4: Notifications, tasks, school ranking mocks

**Files:** create `src/mocks/notifications.ts`, `src/mocks/tasks.ts`, `src/mocks/school-ranking.ts`.

- [ ] **Step 1: `mocks/notifications.ts`**
```ts
import type { Notification } from "@/types"

export const notificationsMock = [
  { id: 1, type: "result", title: "Đã có kết quả bài thi", message: "Bài thi Nói mẫu của bạn đã được chấm. Xem điểm và nhận xét ngay nhé!", time: "5 phút trước", read: false },
  { id: 2, type: "challenge", title: "Lời mời thách đấu", message: "Một bạn cùng lớp vừa mời bạn thi đấu từ vựng chủ đề Động vật.", time: "30 phút trước", read: false },
  { id: 3, type: "reward", title: "Nhận thưởng thành công", message: "Bạn đã nhận 20 kim cương từ nhiệm vụ hằng ngày.", time: "2 giờ trước", read: true },
  { id: 4, type: "event", title: "Sự kiện cuối tuần", message: "Tham gia thử thách luyện Nói cuối tuần để nhận huy hiệu đặc biệt.", time: "Hôm qua", read: false },
  { id: 5, type: "system", title: "Bảo trì hệ thống", message: "Hệ thống sẽ bảo trì từ 23:00 đến 23:30 tối thứ Bảy.", time: "2 ngày trước", read: true },
  { id: 6, type: "result", title: "Bài Viết đã được chấm", message: "Bài Viết mẫu đạt 3/5 điểm. Xem gợi ý để cải thiện nhé!", time: "3 ngày trước", read: true },
] satisfies Notification[]
```
- [ ] **Step 2: `mocks/tasks.ts`**
```ts
import type { Task } from "@/types"

export const tasksMock = [
  { id: 1, icon: "login", title: "Đăng nhập hôm nay", description: "Đăng nhập vào ứng dụng một lần trong ngày.", progress: 1, target: 1, done: true, rewardType: "coin", rewardValue: 10 },
  { id: 2, icon: "exam", title: "Làm một bài thi thử", description: "Hoàn thành một bài thi thử bất kỳ.", progress: 0, target: 1, done: false, rewardType: "diamond", rewardValue: 20 },
  { id: 3, icon: "vocab", title: "Học 10 từ mới", description: "Lưu 10 từ mới vào sổ tay từ vựng.", progress: 10, target: 10, done: true, rewardType: "coin", rewardValue: 15 },
  { id: 4, icon: "grammar", title: "Ôn ngữ pháp", description: "Làm đúng 5 câu ngữ pháp liên tiếp.", progress: 3, target: 5, done: false, rewardType: "coin", rewardValue: 15 },
  { id: 5, icon: "speaking", title: "Luyện Nói", description: "Hoàn thành một bài thi Nói.", progress: 0, target: 1, done: false, rewardType: "diamond", rewardValue: 25 },
  { id: 6, icon: "writing", title: "Luyện Viết", description: "Nộp một bài thi Viết.", progress: 1, target: 1, done: true, rewardType: "diamond", rewardValue: 25 },
  { id: 7, icon: "challenge", title: "Thách đấu bạn bè", description: "Thắng 2 trận thách đấu.", progress: 1, target: 2, done: false, rewardType: "coin", rewardValue: 30 },
  { id: 8, icon: "trophy", title: "Leo bảng xếp hạng", description: "Đạt 100 điểm trong ngày.", progress: 60, target: 100, done: false, rewardType: "diamond", rewardValue: 40 },
] satisfies Task[]
```
- [ ] **Step 3: `mocks/school-ranking.ts`** (fictional schools)
```ts
import type { SchoolRankingEntry } from "@/types"

export const schoolRankingMock = [
  { rank: 1, name: "Trường Tiểu học Ánh Dương", location: "Hà Nội", studentCount: 412, score: 98250 },
  { rank: 2, name: "Trường Tiểu học Bình Minh", location: "TP. Hồ Chí Minh", studentCount: 388, score: 95120 },
  { rank: 3, name: "Trường Tiểu học Hoa Sen", location: "Đà Nẵng", studentCount: 301, score: 90480 },
  { rank: 4, name: "Trường Tiểu học Cánh Diều", location: "Hải Phòng", studentCount: 276, score: 86340 },
  { rank: 5, name: "Trường Tiểu học Sao Mai", location: "Cần Thơ", studentCount: 254, score: 81910 },
  { rank: 6, name: "Trường Tiểu học Thăng Long", location: "Nghệ An", studentCount: 233, score: 77650 },
  { rank: 7, name: "Trường Tiểu học Phương Nam", location: "Đồng Nai", studentCount: 219, score: 73080 },
  { rank: 8, name: "Trường Tiểu học Hướng Dương", location: "Huế", studentCount: 198, score: 68420 },
  { rank: 9, name: "Trường Tiểu học Ngọc Lan", location: "Quảng Ninh", studentCount: 176, score: 64190 },
  { rank: 10, name: "Trường Tiểu học Trúc Xanh", location: "Lâm Đồng", studentCount: 154, score: 59870 },
] satisfies SchoolRankingEntry[]
```
- [ ] **Step 4:** `npx tsc --noEmit 2>&1 | grep "mocks/" | grep -v "mocks.test.ts"` → no errors in the new files (`mocks.test.ts` still imports `./speaking` and `./writing`, which arrive in Task 5). Stage `git add mocks/notifications.ts mocks/tasks.ts mocks/school-ranking.ts`. **Controller:** `git commit -m "feat(mocks): add notifications, tasks and school ranking mocks"`

---

### Task 5: Speaking and writing mocks (test turns green)

**Files:** create `src/mocks/speaking.ts`, `src/mocks/writing.ts`; stage `src/mocks/mocks.test.ts` (Task 2).

- [ ] **Step 1: `mocks/speaking.ts`**
```ts
import type { SpeakingTest } from "@/types/speaking"

const P = "/placeholders/speaking"

const SCENE = `${P}/park-scene.svg`

const MARK_SLOTS = [
  { id: "slot-ball", src: `${P}/ball.svg`, label: "ball", top: 79.44, left: 23.75, width: 7.5, height: 10 },
  { id: "slot-cat", src: `${P}/cat.svg`, label: "cat", top: 80.8, left: 49.5, width: 11.6, height: 12 },
  { id: "slot-kite", src: `${P}/kite.svg`, label: "kite", top: 12.7, left: 49.5, width: 7.6, height: 16.7 },
]

const DROP_TARGETS = [
  { id: "target-bench", src: "", label: "bench", top: 60, left: 40, width: 25, height: 11.2 },
  { id: "target-pond", src: "", label: "pond", top: 72.2, left: 65, width: 28.4, height: 15.6 },
  { id: "target-tree", src: "", label: "tree", top: 18.8, left: 1.6, width: 21.8, height: 46.8 },
]

export const speakingTestMock = {
  id: "speaking-demo-1",
  name: "Bài thi Nói mẫu",
  attempt: {
    id: "speaking-demo-1-attempt",
    userName: "Bạn nhỏ",
    flyerId: "DEMO-0001",
    testTitle: "[STARTERS] Bài thi Nói mẫu",
    testName: "Speaking Demo 1",
    diamond: 10,
    time: "05:00",
    submittedAt: "2026-11-15T09:00:00.000Z",
    parts: [
      {
        id: "part-1a",
        indexLabel: "Part 1a",
        title: "Tìm đồ vật trong tranh",
        instruction: "Nghe câu hỏi và bấm vào đúng đồ vật trong bức tranh.",
        questions: [
          { id: "q-1a-1", kind: "scene-mark", partTitle: "Tìm đồ vật trong tranh", text: "Where is the ball?", vi: "Quả bóng ở đâu?", sceneBg: SCENE, scene: MARK_SLOTS, correctSlotId: "slot-ball" },
          { id: "q-1a-2", kind: "scene-mark", text: "Where is the cat?", vi: "Con mèo ở đâu?", sceneBg: SCENE, scene: MARK_SLOTS, correctSlotId: "slot-cat" },
        ],
      },
      {
        id: "part-1b",
        indexLabel: "Part 1b",
        title: "Chọn đúng hình",
        instruction: "Nghe câu hỏi và chọn đúng hình.",
        questions: [
          {
            id: "q-1b-1",
            kind: "choose-object",
            partTitle: "Chọn đúng hình",
            text: "Which one is an apple?",
            vi: "Hình nào là quả táo?",
            choices: [
              { id: "choice-apple", src: `${P}/apple.svg`, label: "apple", correct: true },
              { id: "choice-ball", src: `${P}/ball.svg`, label: "ball", correct: false },
              { id: "choice-book", src: `${P}/book.svg`, label: "book", correct: false },
              { id: "choice-hat", src: `${P}/hat.svg`, label: "hat", correct: false },
            ],
          },
        ],
      },
      {
        id: "part-1c",
        indexLabel: "Part 1c",
        title: "Đặt đồ vật vào tranh",
        instruction: "Chọn đúng đồ vật rồi bấm vào vị trí đúng trong tranh.",
        questions: [
          {
            id: "q-1c-1",
            kind: "drag-object",
            partTitle: "Đặt đồ vật vào tranh",
            text: "Put the cat on the bench.",
            vi: "Đặt con mèo lên ghế.",
            sceneBg: SCENE,
            scene: DROP_TARGETS,
            palette: [
              { id: "obj-cat", src: `${P}/cat.svg`, label: "cat" },
              { id: "obj-dog", src: `${P}/dog.svg`, label: "dog" },
              { id: "obj-book", src: `${P}/book.svg`, label: "book" },
            ],
            correctDraggableId: "obj-cat",
            correctTargetId: "target-bench",
          },
        ],
      },
      {
        id: "part-2",
        indexLabel: "Part 2",
        title: "Trả lời về bức tranh",
        instruction: "Nhìn mũi tên và trả lời câu hỏi bằng giọng nói.",
        questions: [
          { id: "q-2-1", kind: "mic-answer", partTitle: "Trả lời về bức tranh", text: "What's this?", vi: "Đây là gì?", sceneBg: SCENE, pointer: { top: 84, left: 20 } },
          { id: "q-2-2", kind: "mic-answer", text: "What colour is the kite?", vi: "Con diều màu gì?", sceneBg: SCENE, pointer: { top: 19, left: 54 } },
        ],
      },
      {
        id: "part-3",
        indexLabel: "Part 3",
        title: "Nói về thẻ hình",
        instruction: "Nhìn thẻ hình được phóng to và trả lời câu hỏi.",
        questions: [
          {
            id: "q-3-1",
            kind: "mic-zoom",
            partTitle: "Nói về thẻ hình",
            text: "Tell me about the dog.",
            vi: "Hãy nói về chú chó.",
            cards: [
              { src: `${P}/dog.svg`, label: "dog" },
              { src: `${P}/bike.svg`, label: "bike" },
              { src: `${P}/hat.svg`, label: "hat" },
              { src: `${P}/book.svg`, label: "book" },
            ],
            zoomCard: `${P}/dog.svg`,
          },
        ],
      },
      {
        id: "part-4",
        indexLabel: "Part 4",
        title: "Nói về bản thân",
        instruction: "Trả lời câu hỏi về bản thân bằng giọng nói.",
        questions: [
          { id: "q-4-1", kind: "mic-plain", partTitle: "Nói về bản thân", text: "What's your name?", vi: "Bạn tên là gì?" },
          { id: "q-4-2", kind: "mic-plain", text: "How old are you?", vi: "Bạn bao nhiêu tuổi?" },
        ],
      },
    ],
  },
} satisfies SpeakingTest
```
- [ ] **Step 2: `mocks/writing.ts`**
```ts
import type { WritingTest } from "@/types/writing"

const W = "/placeholders/writing"

export const writingTestMock = {
  id: "writing-demo-1",
  name: "Bài thi Viết mẫu",
  attempt: {
    id: "writing-demo-1-attempt",
    headerBadge: "[FLYERS] Bài thi Viết mẫu",
    headerTitle: "Bài thi Viết mẫu - Writing",
    badge: "Writing",
    maxScore: 5,
    score: 3,
    prompt: {
      title: "Phần 1",
      instruction: "Nhìn ba bức tranh và viết một câu chuyện ngắn (từ 20 từ trở lên).",
      images: [
        { slot: "story-img-1", src: `${W}/story-1.svg`, alt: "A child is flying a kite in the park." },
        { slot: "story-img-2", src: `${W}/story-2.svg`, alt: "The kite is stuck in a tree." },
        { slot: "story-img-3", src: `${W}/story-3.svg`, alt: "Dad helps to get the kite down." },
      ],
      sampleAnswer:
        "Tom is flying his red kite in the park. The wind is very strong and the kite flies into a big tree. Tom is sad. His dad comes and gets the kite down. Tom is happy again.",
    },
    userAnswer: "",
    feedback: {
      comment: "Bài viết kể đủ ba bức tranh và dùng câu đơn giản, dễ hiểu.",
      errors: "Một số động từ chưa chia đúng thì hiện tại tiếp diễn (ví dụ: \"Tom fly\" → \"Tom is flying\").",
      tips: "Thêm từ nối như \"then\", \"after that\" và tính từ miêu tả cảm xúc để câu chuyện sinh động hơn.",
    },
    minutes: 20,
    submittedAt: "2026-11-15T09:00:00.000Z",
  },
} satisfies WritingTest
```
- [ ] **Step 3:** `cd "$REPO/src" && npx vitest run mocks/mocks.test.ts 2>&1 | tail -8` → all tests PASS. If the drag/pointer optional fields fail type-checking (`satisfies` reports a property mismatch), read `src/types/speaking.ts` and fix the mock data, never the types.
- [ ] **Step 4:** `npx tsc --noEmit 2>&1 | grep "error TS" | grep "mocks/"` → none. Stage `git add mocks/speaking.ts mocks/writing.ts mocks/mocks.test.ts`. **Controller:** `git commit -m "feat(mocks): add speaking and writing demo mocks with invariants test"`

---

### Task 6: Switch the import sites

**Files:** the 8 files below and `src/constants/index.ts`. Change only the lines shown.

- [ ] **Step 1:** Replacements (exact):

| File | Old | New |
|---|---|---|
| `app/(dashboard)/notifications/page.tsx` | `import notificationsMocks from "@/mocks/notifications.json";` | `import { notificationsMock as notificationsMocks } from "@/mocks/notifications";` |
| `app/(dashboard)/tasks/page.tsx` | `import tasksMocks from "@/mocks/tasks.json";` | `import { tasksMock as tasksMocks } from "@/mocks/tasks";` |
| `components/ranking/school-ranking-table.tsx` | `import schoolRankingData from "@/mocks/school-ranking.json";` | `import { schoolRankingMock as schoolRankingData } from "@/mocks/school-ranking";` |
| `app/speaking/[slug]/page.tsx`, `app/speaking/result/[id]/page.tsx`, `app/speaking/result/[id]/preview/page.tsx` | `import speakingDataJson from "@/mocks/speaking.json";` and `const speakingData: SpeakingTest = speakingDataJson as SpeakingTest;` | `import { speakingTestMock } from "@/mocks/speaking";` and `const speakingData: SpeakingTest = speakingTestMock;` |
| `app/write/[slug]/page.tsx`, `app/write/result/[id]/page.tsx` | `import writingDataJson from "@/mocks/writing.json";` and `const writingData: WritingTest = writingDataJson as WritingTest` | `import { writingTestMock } from "@/mocks/writing";` and `const writingData: WritingTest = writingTestMock` |
| `constants/index.ts` | `export const DEMO_WRITE_TEST_PATH = '/write/FLYERS-Writing-Test-1'` / `export const DEMO_SPEAKING_TEST_PATH = '/speaking/1392caf3-444d-431a-b0ec-baf39eba25fb'` | `export const DEMO_WRITE_TEST_PATH = '/write/writing-demo-1'` / `export const DEMO_SPEAKING_TEST_PATH = '/speaking/speaking-demo-1'` |

- [ ] **Step 2:** `npx eslint --fix` on the 8 page/component files only (import order), then `git diff` — only those lines may change (plus import-block reordering).
- [ ] **Step 3:** Verify:
```bash
cd "$REPO/src"
npx tsc --noEmit 2>&1 | grep -c "error TS"      # 0
npm test 2>&1 | grep -E "Test Files|Tests "     # 4 files, all pass
npx eslint . 2>&1 | tail -2                      # 8 errors (pre-existing only)
grep -rn "@/mocks/[a-z-]*\.json\"" app components | grep -E "notifications|tasks|school-ranking|speaking|writing" || echo "no missing-json imports"
```
- [ ] **Step 4:** Stage the 9 files. **Controller:** `git commit -m "fix: load rebuilt mocks in the eight broken routes"`

---

### Task 7: CI and docs

- [ ] **Step 1: `.github/workflows/ci.yml`** — in the `Type-check` and `Build` steps, delete the comment line and `continue-on-error: true`. In the `Lint` step change the comment to `# Pre-existing import-order errors; see docs/03-known-issues.md section 3.`
- [ ] **Step 2: `docs/03-known-issues.md`** — delete section 1 entirely (from `## 1. Five mock files are missing` up to, not including, `## 2.`); renumber the remaining headings 2→1 … 7→6; change the intro line to "Recorded during the phase 1 restructure (2026-11-15). The missing-mocks issue was fixed in phase 3a."
- [ ] **Step 3: `AGENTS.md`** — `npx tsc --noEmit                # baseline: 15 known errors, see docs/03-known-issues.md` → `npx tsc --noEmit                # must pass (0 errors)`; `npm run build                   # fails until the missing mocks are rebuilt` → `npm run build                   # must pass`.
- [ ] **Step 4: rules and agents** — replace the baseline wording:
  - `.claude/rules/verification.md` lines 19–20: "(missing mocks make `tsc` and `build` fail, and lint has pre-existing errors)" → "(`tsc` and `build` must pass; lint has pre-existing errors)".
  - `.claude/rules/workflow.md` line 62: `npm run build   # informational until the missing mocks are rebuilt; see docs/03-known-issues.md` → `npm run build   # must pass`.
  - `.claude/agents/implementer.md` line 53: "(missing mocks, pre-existing type, build and lint failures)" → "(pre-existing lint errors; `tsc`, tests and build must pass)".
  - `.claude/agents/spec-reviewer.md` line 49: "(missing mocks, pre-existing" → "(pre-existing lint". Keep the rest of the sentence grammatical.
  - `.claude/agents/runner.md` lines 53–54: "(missing mocks cause `tsc` and `build` to fail; pre-existing lint errors)" → "(pre-existing lint errors; `tsc`, tests and build must pass)".
  - `.claude/agents/code-reviewer.md` item 7: replace with "7. **Mock data.** Mocks in `src/mocks/*.ts` are checked with `satisfies` and `src/mocks/mocks.test.ts`. Reject casts (`as`) that bypass those checks and mocks that reference images missing from `public/`."
- [ ] **Step 5: `.claude/ARCHITECTURE.md`** — line 7: "use `src/mocks/*.json`," → "use `src/mocks/` (JSON and typed `.ts` modules),"; line 53: "| `mocks/` | JSON mock data (five files are missing — see known issues) |" → "| `mocks/` | Mock data: JSON files and typed `.ts` modules (`satisfies` + `mocks.test.ts`) |". `docs/01-architecture.md` line 24 → "| `mocks/` | Mock data (JSON and typed `.ts` modules) used until each domain is wired to the backend |".
- [ ] **Step 6:** `grep -rnE "missing mocks|15 known|five files are missing|Five mock files" AGENTS.md CLAUDE.md docs .claude/ARCHITECTURE.md .claude/rules .claude/agents .github` → nothing. Stage these files. **Controller:** `git commit -m "docs: make tsc and build blocking now that mocks exist"`

---

### Task 8: Verification on the real app (no commits)

- [ ] **Step 1 — static:** from `$REPO/src`: `npx tsc --noEmit` (0 errors), `npm test` (4 files pass), `npx eslint .` (8 pre-existing errors only), `npm run build` (succeeds; route list contains all 23 pages + `/api/admin/media`, `/robots.txt`, `/sitemap.xml`, `/_not-found`).
- [ ] **Step 2 — eight routes (dev):** check port 3000 is free, start `npm run dev` in the background, then open with Playwright (write the script in `$SCR/task3a/`, launch with `executablePath: process.env.PW_CHROME`): `/notifications`, `/tasks`, `/school-ranking`, `/speaking/speaking-demo-1`, `/speaking/result/speaking-demo-1-attempt`, `/speaking/result/speaking-demo-1-attempt/preview`, `/write/writing-demo-1`, `/write/result/writing-demo-1-attempt`. For each: HTTP 200, screenshot, list `pageerror`/console errors (compare with the known ones in `docs/03-known-issues.md`), and every response for `/placeholders/` must be 200.
- [ ] **Step 3 — flows (same server):**
  - Speaking: start, pass the mic check if the UI allows (record "microphone not verified" otherwise), answer: tap the ball (q-1a-1), tap the cat (q-1a-2), pick the apple, pick the cat then tap the bench (expect the placed state), go through parts 2–4, submit, result screen, open the answer preview.
  - Writing: start, type "Tom is flying a kite. It is in the tree. Dad helps him.", submit, result overview shows the score, open review.
  - Notifications: click one unread item, then mark all read. Tasks: claim a done task.
  Screenshots of each end state to `$SCR/task3a/`.
- [ ] **Step 4 — regression:** run `node "$SCR/tools/route-shots.mjs" http://localhost:3000 "$SCR/shots/task3a" "$REPO/src"` and `node "$SCR/tools/compare-shots.mjs" "$SCR/shots/base-1" "$SCR/shots/task3a"`; routes outside `nondeterministic.txt` must be SAME (the `/ranking` dev-overlay flake is known). Stop the dev server you started.
- [ ] **Step 5 — production:** `npm run build && npm start` (background, port 3000), load `/speaking/speaking-demo-1` and `/write/writing-demo-1` → placeholder SVG requests return 200. Stop the server.
- [ ] **Step 6:** report; ask the owner whether to push (CI then must be green with blocking Type-check/Build; Vercel deploy must succeed).
