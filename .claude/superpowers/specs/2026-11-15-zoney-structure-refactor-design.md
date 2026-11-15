# Phase 1 — Zoney-style repo structure — luyenthiao.com-Web

- **Date:** 2026-11-15
- **Repo:** `luyenthiao.com-Web` (base branch `main`, work branch `refactor/zoney-structure`)
- **Reference layout:** `Zoney.vn/Zoney.vn-Web`
- **Status:** design approved in conversation, pending written-spec review

## 0. Program context

The owner split the cleanup into three phases, executed in order:

1. **Phase 1 — repo structure (this spec).** Files and directories only: archive, repo layout,
   directory conventions, docs, CI. Import paths are updated so nothing new breaks; no logic,
   markup or data changes.
2. **Phase 2 — AI guidance.** The owner rebuilds `CLAUDE.md`, `.claude/rules/`, `.claude/skills/`,
   `.claude/ARCHITECTURE.md`, `.claude/settings.json` from scratch. Superpowers specs and plans stay
   in `.claude/superpowers/{specs,plans}/`.
3. **Phase 3 — coding.** See section 10 for the items already decided for that phase.

## 1. Goal

Make the repo follow the Zoney.vn-Web layout and directory conventions. **No behavior change, no
visual change, no URL change, no data change.**

## 2. Non-goals

- Everything listed in section 10 (phase 3).
- AI guidance files (phase 2). They are left untouched in this phase, even where they now describe
  outdated paths.
- Fixing pre-existing errors in `tsc`, `lint` or tests.
- Any change to the backend repo.

## 3. Baseline facts (measured 2026-11-15 on `main` @ `567e4e4`)

- `npx tsc --noEmit` fails with **15 errors**, all caused by five mock files that are imported but
  were never committed (`_webclone/` is in `.gitignore`): `notifications.json`,
  `school-ranking.json`, `speaking.json`, `tasks.json`, `writing.json`. They exist on no branch;
  `origin/dev` is 19 commits behind `main` and lacks them too. Their author has left the project.
- Consequently `next build` cannot succeed on `main`, and eight routes fail on a clean clone:
  `/notifications`, `/tasks`, `/school-ranking`, `/speaking/[slug]`, `/speaking/result/[id]`,
  `/speaking/result/[id]/preview`, `/write/[slug]`, `/write/result/[id]`.
- Phase 1 does **not** fix this (rebuilding mocks is phase 3). The five imports are re-pointed to
  their new location and stay unresolved.
- `lint` and `test` baselines are recorded as the first plan step.

## 4. Target repo layout

```
luyenthiao.com-Web/
├─ .claude/                      # untouched in phase 1
├─ .github/workflows/ci.yml      # new
├─ docs/                         # new
│  ├─ 01-architecture.md
│  ├─ 02-setup-and-environment.md
│  └─ 03-known-issues.md
├─ .gitignore  .gitattributes  CLAUDE.md (untouched)  README.md (new, short)
└─ src/                          # the Next.js project; every npm command runs here
   ├─ package.json  package-lock.json  next.config.ts  tsconfig.json  eslint.config.mjs
   ├─ postcss.config.mjs  vitest.config.mts  vitest.setup.ts  components.json  .prettierrc
   ├─ .env.example
   ├─ public/
   ├─ mocks/                     # new, see 5.2
   ├─ app/  components/  hooks/  lib/  schemas/  store/  providers/  constants/  types/
```

The repo root holds only metadata. There is no `src/src/`: today's `src/app` becomes `src/app`,
today's root `package.json` becomes `src/package.json`.

### 4.1 Config changes required by the move

| File | Change |
|---|---|
| `tsconfig.json` | `paths: { "@/*": ["./*"] }`; `include`/`exclude` checked so `node_modules` and `.next` are excluded |
| `vitest.config.mts` | alias `@` → `path.resolve(import.meta.dirname, '.')` |
| `components.json` | `tailwind.css` → `app/globals.css` |
| `eslint.config.mjs` | remove the `.claude/**` ignore (outside `src/` now); rules unchanged |
| `package.json` | remove the `gates` script (its target is archived); remove devDependency `cheerio` if, after the move, no file under `src/` imports it |
| `.gitignore` (root) | patterns re-checked so `src/node_modules`, `src/.next`, `src/.env*`, `src/next-env.d.ts`, `src/tsconfig.tsbuildinfo` stay ignored; drop the three `_webclone` lines |

`playwright` stays a devDependency: phase 1 verification uses it.

## 5. Moves

### 5.1 Archive

Destination: workspace root `English-Prep-Web-Game/archive/luyenthiao.com-Web/` (outside any git
repo, mirrors `Zoney.vn/archive/`). Files are copied there preserving relative paths, then removed
from the repo with `git rm`; git history keeps the originals.

- `_webclone/` — all tracked files **except** `_webclone/design-model/mocks/*.json` (5.2)
- `scripts/` — `analyze.ts`, `capture.ts`, `capture-exam.ts`, `download-assets.ts`, `gates.ts`,
  `recapture.ts`
- `src/components/common/hello-placeholder.tsx`, `hello-placeholder.test.tsx`, and its export line
  in `components/common/index.ts` (no other file imports it)
- `public/clone-assets/_next/`, `public/clone-assets/cm/` (stylesheets and tracker pixels of the
  third-party site; no source file references them)

Security note: `_webclone/captures_exam/json_payloads/` contains a session cookie, auth/refresh
tokens and a Firebase config captured from a third-party account. Archiving removes them from the
tree but not from git history; treat those tokens as exposed. Recorded in `docs/03-known-issues.md`.

### 5.2 Mock data

`git mv _webclone/design-model/mocks/<name>.json src/mocks/<name>.json` for the six tracked files:
`checkpoints`, `exam-7778495e`, `history`, `planets`, `ranking`, `testlevels`.

Every import of `…/_webclone/design-model/mocks/<name>.json` (15 sites in 15 files, including
`lib/exam/schema.test.ts`) becomes `@/mocks/<name>.json`. This includes the five missing files;
those imports stay unresolved until phase 3.

### 5.3 Directory conventions inside `src/`

| Current (under today's `src/`) | Target (under new `src/`) | Notes |
|---|---|---|
| `lib/exam/schema.ts` | `schemas/exam.ts` | new `schemas/` dir (Zoney convention) |
| `lib/exam/schema.test.ts` | `schemas/exam.test.ts` | |
| `lib/exam/{blank,color,factories,grade,normalize,storage}.ts` | `lib/exam-{blank,color,factories,grade,normalize,storage}.ts` | flat `lib/` with domain prefix |
| `lib/exam/grade.test.ts` | `lib/exam-grade.test.ts` | tests stay next to their file |
| `lib/exam/index.ts` | `lib/exam.ts` | same export list; import paths inside it updated. Every `@/lib/exam` import keeps working unchanged |
| `lib/admin/{draft,media,validate}.ts` | `lib/admin-{draft,media,validate}.ts` | |
| `hooks/auth/use-*.ts` (6 files) | `hooks/use-*.ts` | flat |
| `hooks/auth/index.ts` | removed | its six `export *` lines move into `hooks/index.ts` |
| `components/layout/{bottom-nav,topbar}.tsx` | `components/common/` | `common/index.ts` gains both exports; `components/layout/` removed |
| `components/checkpoint/exam-player.tsx` | `components/exam/exam-player.tsx` | |
| `components/checkpoint/checkpoint-client-wrapper.tsx` | `components/exam/exam-checkpoint.tsx` | component renamed `ExamCheckpoint` |
| `components/checkpoint/mode-select-modal.tsx` | `components/exam/exam-mode-select-modal.tsx` | component renamed `ExamModeSelectModal` |
| `components/checkpoint/index.ts` | removed | `components/exam/index.ts` exports `ExamCheckpoint`, `ExamModeSelectModal`, `ExamPlayer` |

Import updates that follow from the table:

- `@/lib/exam/blank` → `@/lib/exam-blank`; `@/lib/exam/factories` → `@/lib/exam-factories`;
  `@/lib/admin/<x>` → `@/lib/admin-<x>`.
- Relative imports inside the moved `lib/exam/*` files (`./schema`, `./grade`, …) become
  `@/schemas/exam`, `./exam-grade`, …
- `@/hooks/auth` → `@/hooks`.
- `@/components/layout/bottom-nav`, `@/components/layout/topbar` → `@/components/common`.
- `@/components/checkpoint/checkpoint-client-wrapper` → `@/components/exam`.

Unchanged in phase 1: `store/`, `providers/`, `constants/`, `types/`, and every other
`components/<domain>/` directory.

## 6. Docs, README, CI

- `README.md` (root): one paragraph on the project, the repo layout, and "all commands run in
  `src/`" with the six commands (`npm ci`, `npm run dev`, `npx tsc --noEmit`, `npm run lint`,
  `npm test`, `npm run build`).
- `docs/01-architecture.md`: the target layout of section 4 and the conventions of 5.3.
- `docs/02-setup-and-environment.md`: Node `>=20`, `src/.env.example` variables, backend URL,
  how to run.
- `docs/03-known-issues.md`: the five missing mocks and eight broken routes (section 3), the exposed
  tokens (5.1), and that `public/clone-assets/` holds third-party assets to be replaced.
- `.github/workflows/ci.yml`, on push and pull request, `working-directory: src`:
  `npm ci` → `npx tsc --noEmit` → `npm run lint` → `npm test` → `npm run build`, Node 20.
  `tsc` and `build` carry `continue-on-error: true` with a comment pointing to
  `docs/03-known-issues.md` until phase 3 rebuilds the mocks. `lint`/`test` get the same flag only
  if the baseline shows them failing on `main`.

## 7. Verification

### 7.1 Baseline (on `main`, before any change)

Record `npx tsc --noEmit`, `npm run lint`, `npm test`, `npm run build` output to files outside the
repo.

### 7.2 Per step

- `npx tsc --noEmit` from the project root of that step: exactly the 15 baseline errors, all
  "Cannot find module …/<one of the five missing mocks>.json" or the implicit-`any` errors that
  follow from them. Error count must not change; only the import path text may.
- `npm test`: no new failures compared with baseline.
- After the `src/` move and at the end: `npm run lint` — no new errors compared with baseline.
- Grep over `src/` returns nothing for: `_webclone`, `@/lib/exam/`, `@/lib/admin/`,
  `@/hooks/auth`, `@/components/layout`, `@/components/checkpoint`, `hello-placeholder`.

### 7.3 Real-path check (required before claiming done)

- Run `npm run dev` on `main` (repo root) and on the branch (from `src/`). A Playwright script opens
  the 15 routes that work on `main` (all 23 minus the eight in section 3) on both, saves
  screenshots and diffs them pairwise. Expected: identical. Dynamic routes use one fixed sample
  value each, taken from the tracked mocks; the plan lists the exact URLs. The script and its output
  live outside the repo.
- Manual flows on the branch: take an exam at `/check-point/[id]` → submit → `/testresult`;
  create/edit an exam at `/admin/exam` including picking an image and an audio file from the media
  dialog (exercises `app/api/admin/media/route.ts`, which reads `public/` and is sensitive to the
  new cwd); login and logout against the backend.

## 8. Execution order and commits

Branch `refactor/zoney-structure` from `main`. Branch creation and each commit need explicit
approval from the owner during execution. File moves use `git mv`. Each commit is independently
revertible:

0. `chore`: pending graphify changes (`.gitignore`, `.gitattributes`) and this spec.
1. `refactor`: move tracked mocks to `src/mocks/` and re-point all 15 imports (5.2).
2. `chore`: archive unrelated files (5.1).
3. `refactor`: move the Next project into `src/` and fix configs (4, 4.1).
4. `refactor`: directory conventions (5.3).
5. `docs`/`ci`: README, `docs/`, CI workflow (6).

Note on step order: mocks move first while the old layout still compiles the same way, so the
archive step cannot accidentally take runtime data with it.

## 9. Risks

| Risk | Mitigation |
|---|---|
| Alias/config change breaks imports silently | `tsc` error count must stay at 15 after every step; grep for old paths |
| Media route handler resolves `public/` from the wrong cwd after the move | exercised in the manual flow |
| An archived file was still needed | archive keeps relative paths; restore by copying back |
| Teammates' open branches conflict with the move | owner informs the team; branch merged in one go |
| `package-lock.json` already has an unrelated local diff (`devOptional` → `dev`, 2 lines) | not made by this work; owner decides to keep or discard before step 0 |

## 10. Decided for phase 3 (recorded, not part of phase 1)

- **Thin pages.** Every `page.tsx` becomes a server component following the Zoney 5-part pattern
  with `metadata` carrying all five fields (`title`, `description`, `keywords`, `alternates`, `openGraph`) per `.claude/rules/coding.md` (owner decision 2026-11-15). The nine client pages (`placement-test`, `notebook`,
  `history`, `testresult`, `tasks`, dashboard home, `notifications`, `ranking`, `school-ranking`)
  move verbatim into `components/<domain>/<domain>-view.tsx`; bounded split only of already
  independent blocks; `useSearchParams` wrapped in `<Suspense>` if the build requires it.
- **Asset centralization.** All `/clone-assets/...` paths move to `constants/assets.ts`; assets with
  zero references are archived after a scan.
- **Rebuild the five missing mocks** in `src/mocks/` with original project content and self-made
  SVG placeholders in `public/placeholders/`, not the exam images harvested from exam.flyer.us.
  Typed with `satisfies`; the speaking mock covers all six `SpeakingQuestionKind` values; neutral
  ids `speaking-demo-1` / `writing-demo-1` with `DEMO_*_PATH` constants updated.
- Wiring non-auth domains to the backend, splitting `exam-player.tsx`, fixing lint/type debt.
