# Phase 1 — Zoney-style Repo Structure Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restructure `luyenthiao.com-Web` to the Zoney.vn-Web layout (Next project inside `src/`, metadata-only repo root, flat `lib/`/`hooks/`, `schemas/`, `mocks/`) with zero behavior change.

**Architecture:** Pure file moves (`git mv`) plus the minimum import-path and config edits to keep the project compiling exactly as before. Every task ends with the same equivalence checks: `tsc` stays at exactly the 15 baseline errors, tests stay green, lint gains no new (file, rule, message) entries, and no old path remains.

**Tech Stack:** Next.js 16, React 19, TypeScript 5 strict, Vitest 4, ESLint 9 flat config with `eslint-plugin-import-x`, Playwright 1.62 (verification only), Git Bash on Windows.

**Spec:** `.claude/superpowers/specs/2026-11-15-zoney-structure-refactor-design.md`

---

## Conventions for the executor

- Workspace root: `E:/Ziratech/English-Prep-Web-Game` (`$WS` below). Repo: `$WS/luyenthiao.com-Web` (`$REPO`).
- Scratch area outside any repo: `$WS/.scratch/` (baseline output, scripts, screenshots). Never commit it.
- Shell is Git Bash. Node is a Windows binary: **never pass `/tmp/...` paths to `node`**; use `E:/...` paths.
- Every `git commit` and the branch creation need **explicit approval from the owner at that moment**. Ask, then run.
- Commit messages: English, Conventional Commits, one line. **No `Co-Authored-By` or any AI attribution line.**
- Until Task 4, npm commands run in `$REPO`; from Task 4 on they run in `$REPO/src`.

Set these in every new shell:

```bash
export WS="E:/Ziratech/English-Prep-Web-Game"
export REPO="$WS/luyenthiao.com-Web"
export SCR="$WS/.scratch"
```

## File map (end state)

| Path | Responsibility |
|---|---|
| `README.md` (new) | What the repo is, layout, the six commands |
| `docs/01-architecture.md` (new) | Repo layout + directory conventions |
| `docs/02-setup-and-environment.md` (new) | Node version, env vars, running locally |
| `docs/03-known-issues.md` (new) | Missing mocks, exposed tokens, third-party assets, lint debt |
| `.github/workflows/ci.yml` (new) | tsc / lint / test / build in `src/` |
| `src/package.json`, configs, `public/` | moved from repo root |
| `src/mocks/*.json` | runtime mock data (moved from `_webclone/design-model/mocks/`) |
| `src/schemas/exam.ts` (+ test) | Zod exam schema (moved from `lib/exam/schema.ts`) |
| `src/lib/exam.ts` | former `lib/exam/index.ts` barrel, same export list |
| `src/lib/exam-*.ts`, `src/lib/admin-*.ts` | former `lib/exam/*`, `lib/admin/*` |
| `src/hooks/use-*.ts`, `src/hooks/index.ts` | former `hooks/auth/*` |
| `src/components/common/{topbar,bottom-nav}.tsx` | former `components/layout/*` |
| `src/components/exam/{exam-player,exam-checkpoint,exam-mode-select-modal}.tsx` | former `components/checkpoint/*` |

Scratch files created by this plan (outside the repo):

| Path | Purpose |
|---|---|
| `$SCR/baseline/{tsc.txt,lint.json,test.txt}` | baseline on `main` |
| `$SCR/tools/tsc-check.sh` | asserts the 15-error equivalence |
| `$SCR/tools/lint-compare.mjs` | diffs lint results against baseline |
| `$SCR/tools/route-shots.mjs` | screenshots of the 15 working routes |
| `$SCR/tools/compare-shots.mjs` | hash-compares two screenshot dirs |

---

### Task 0: Pre-flight and branch

**Files:** none modified by this task except git state.

- [ ] **Step 1: Confirm the working tree**

Run:
```bash
cd "$REPO" && git branch --show-current && git status --short
```
Expected:
```
main
 M .gitignore
 M package-lock.json
?? .claude/superpowers/plans/2026-11-15-zoney-structure-refactor.md
?? .claude/superpowers/specs/2026-11-15-zoney-structure-refactor-design.md
?? .gitattributes
```

- [ ] **Step 2: Owner decides on the unrelated `package-lock.json` diff**

The 2-line diff (`"devOptional": true` → `"dev": true` for `fast-deep-equal`, `require-from-string`) was not made by this work. Ask the owner: keep or discard. If discard, run (Tier B, needs that approval):
```bash
cd "$REPO" && git restore package-lock.json
```

- [ ] **Step 3: Create the branch (ask owner first)**

```bash
cd "$REPO" && git switch -c refactor/zoney-structure
```
Expected: `Switched to a new branch 'refactor/zoney-structure'`

- [ ] **Step 4: Commit tooling and docs (ask owner first)**

```bash
cd "$REPO" && git add .gitignore .gitattributes \
  .claude/superpowers/specs/2026-11-15-zoney-structure-refactor-design.md \
  .claude/superpowers/plans/2026-11-15-zoney-structure-refactor.md \
  && git status --short && git commit -m "chore: add phase 1 structure spec, plan and code graph ignores"
```
Expected: commit created; `git status --short` afterwards shows nothing except `package-lock.json` if the owner kept it (leave it unstaged; it is committed in Task 4 together with the lockfile move).

---

### Task 1: Baseline and verification tools

**Files:** only under `$SCR` (outside the repo).

- [ ] **Step 1: Record baseline tsc, lint, test on the branch tip (identical to `main` code)**

```bash
mkdir -p "$SCR/baseline" "$SCR/tools"
cd "$REPO"
npx tsc --noEmit > "$SCR/baseline/tsc.txt" 2>&1; echo "tsc exit $?"
npx eslint . -f json -o "$SCR/baseline/lint.json"; echo "lint exit $?"
npm test > "$SCR/baseline/test.txt" 2>&1; echo "test exit $?"
grep -c "error TS" "$SCR/baseline/tsc.txt"
tail -5 "$SCR/baseline/test.txt"
```
Expected: `tsc exit 2`, `lint exit 1`, `test exit 0`, `15`, and `Test Files  4 passed (4)` / `Tests  23 passed (23)`.

- [ ] **Step 2: Create `$SCR/tools/tsc-check.sh`**

```bash
cat > "$SCR/tools/tsc-check.sh" <<'EOF'
#!/usr/bin/env bash
# Usage: tsc-check.sh <project-dir>
# Passes when tsc reports exactly 15 errors and every error is in a file that
# imports one of the five missing mocks (see spec section 3).
set -u
cd "$1"
out="$(npx tsc --noEmit 2>&1)"
count="$(printf '%s\n' "$out" | grep -c 'error TS')"
bad="$(printf '%s\n' "$out" | grep 'error TS' \
  | grep -vE '(notifications/page\.tsx|tasks/page\.tsx|speaking/\[slug\]/page\.tsx|speaking/result/\[id\]/page\.tsx|speaking/result/\[id\]/preview/page\.tsx|write/\[slug\]/page\.tsx|write/result/\[id\]/page\.tsx|school-ranking-table\.tsx)')"
echo "tsc errors: $count"
if [ "$count" != "15" ] || [ -n "$bad" ]; then
  echo "FAIL"; printf '%s\n' "$bad"; exit 1
fi
echo "PASS"
EOF
chmod +x "$SCR/tools/tsc-check.sh"
"$SCR/tools/tsc-check.sh" "$REPO"
```
Expected: `tsc errors: 15` then `PASS`.

- [ ] **Step 3: Create `$SCR/tools/lint-compare.mjs`**

```bash
cat > "$SCR/tools/lint-compare.mjs" <<'EOF'
// Usage: node lint-compare.mjs <baseline.json> <current.json>
// Compares (file, rule, message) entries. File paths are normalized so that
// "<repo>/src/app/x.tsx" (before the move) equals "<repo>/src/app/x.tsx" (after).
// Old-location lib/hooks/components paths are mapped to their new names.
import { readFileSync } from 'node:fs'

const MAP = [
  [/\/lib\/exam\/schema(\.test)?\.ts$/, (m) => `/schemas/exam${m[1] ?? ''}.ts`],
  [/\/lib\/exam\/index\.ts$/, () => '/lib/exam.ts'],
  [/\/lib\/exam\/([a-z-]+(\.test)?)\.ts$/, (m) => `/lib/exam-${m[1]}.ts`],
  [/\/lib\/admin\/([a-z-]+)\.ts$/, (m) => `/lib/admin-${m[1]}.ts`],
  [/\/hooks\/auth\/(use-[a-z-]+)\.ts$/, (m) => `/hooks/${m[1]}.ts`],
  [/\/components\/layout\/([a-z-]+)\.tsx$/, (m) => `/components/common/${m[1]}.tsx`],
  [/\/components\/checkpoint\/checkpoint-client-wrapper\.tsx$/, () => '/components/exam/exam-checkpoint.tsx'],
  [/\/components\/checkpoint\/mode-select-modal\.tsx$/, () => '/components/exam/exam-mode-select-modal.tsx'],
  [/\/components\/checkpoint\/exam-player\.tsx$/, () => '/components/exam/exam-player.tsx'],
]

function norm(p) {
  let s = p.replaceAll('\\', '/')
  const i = s.indexOf('/luyenthiao.com-Web/')
  s = s.slice(i + '/luyenthiao.com-Web'.length)
  if (!s.startsWith('/src/')) s = '/src' + s
  for (const [re, fn] of MAP) {
    const m = s.match(re)
    if (m) s = s.slice(0, m.index) + fn(m)
  }
  return s
}

function load(file) {
  const out = new Set()
  for (const f of JSON.parse(readFileSync(file, 'utf8'))) {
    for (const m of f.messages) out.add(`${norm(f.filePath)} | ${m.ruleId} | ${m.message}`)
  }
  return out
}

const base = load(process.argv[2])
const cur = load(process.argv[3])
const added = [...cur].filter((x) => !base.has(x))
const removed = [...base].filter((x) => !cur.has(x))
console.log(`baseline ${base.size} entries, current ${cur.size} entries`)
console.log(`removed (${removed.length}):\n  ` + removed.join('\n  '))
console.log(`added (${added.length}):\n  ` + added.join('\n  '))
process.exit(added.length ? 1 : 0)
EOF
node "$SCR/tools/lint-compare.mjs" "$SCR/baseline/lint.json" "$SCR/baseline/lint.json"
```
Expected: `baseline 23 entries, current 23 entries`, `removed (0)`, `added (0)`, exit 0.

- [ ] **Step 4: Create `$SCR/tools/route-shots.mjs`**

```bash
cat > "$SCR/tools/route-shots.mjs" <<'EOF'
// Usage: node route-shots.mjs <baseUrl> <outDir> <projectDirWithNodeModules>
import { mkdirSync, writeFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import path from 'node:path'

const [baseUrl, outDir, projectDir] = process.argv.slice(2)
const require = createRequire(path.join(projectDir, 'package.json'))
const { chromium } = require('playwright')

// The 15 routes that work on main (spec section 7.3). Dynamic values come from tracked mocks.
const ROUTES = [
  '/',
  '/history',
  '/notebook',
  '/placement-test',
  '/ranking',
  '/account/change-password',
  '/admin/exam',
  '/admin/exam/new',
  '/check-point/7778495e-531b-4039-a3ea-321874ba1a7a',
  '/forgot-password',
  '/login',
  '/reset-password',
  '/signup',
  '/testlevels/movers',
  '/testresult?examId=7778495e-531b-4039-a3ea-321874ba1a7a&score=10&listening=5&rw=5&total=60',
]

mkdirSync(outDir, { recursive: true })
const browser = await chromium.launch()
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
  await page.waitForTimeout(2000)
  const name = r.replace(/[^a-z0-9]+/gi, '_').replace(/^_|_$/g, '') || 'root'
  await page.screenshot({ path: path.join(outDir, `${name}.png`), fullPage: true, animations: 'disabled' })
  report.push({ route: r, kind: 'status', text: String(res?.status()), finalUrl: page.url() })
}
await browser.close()
writeFileSync(path.join(outDir, 'report.json'), JSON.stringify(report, null, 2))
console.log(`saved ${ROUTES.length} screenshots to ${outDir}`)
EOF
```

- [ ] **Step 5: Create `$SCR/tools/compare-shots.mjs`**

```bash
cat > "$SCR/tools/compare-shots.mjs" <<'EOF'
// Usage: node compare-shots.mjs <dirA> <dirB>
import { createHash } from 'node:crypto'
import { readdirSync, readFileSync } from 'node:fs'
import path from 'node:path'

const [a, b] = process.argv.slice(2)
const hash = (f) => createHash('sha256').update(readFileSync(f)).digest('hex')
const files = readdirSync(a).filter((f) => f.endsWith('.png')).sort()
let diff = 0
for (const f of files) {
  const same = hash(path.join(a, f)) === hash(path.join(b, f))
  if (!same) diff++
  console.log(`${same ? 'SAME' : 'DIFF'}  ${f}`)
}
console.log(`${files.length - diff}/${files.length} identical`)
EOF
```

- [ ] **Step 6: Capture baseline screenshots twice (to learn which routes are non-deterministic)**

Start the dev server in a separate background shell: `cd "$REPO" && npm run dev` (wait for `Ready`). Then:
```bash
node "$SCR/tools/route-shots.mjs" http://localhost:3000 "$SCR/shots/base-1" "$REPO"
node "$SCR/tools/route-shots.mjs" http://localhost:3000 "$SCR/shots/base-2" "$REPO"
node "$SCR/tools/compare-shots.mjs" "$SCR/shots/base-1" "$SCR/shots/base-2"
```
Expected: `saved 15 screenshots …` twice. Note every `DIFF` line in the comparison: those routes are non-deterministic on their own (timers, random data) and must be compared by eye in Task 7, not by hash. Write the list to `$SCR/shots/nondeterministic.txt`. Stop the dev server (only the one this task started).

No commit in this task.

---

### Task 2: Move tracked mocks into `src/mocks/` and re-point all imports

**Files:**
- Move: `_webclone/design-model/mocks/{checkpoints,exam-7778495e,history,planets,ranking,testlevels}.json` → `src/mocks/`
- Modify (import path only): `src/app/(dashboard)/history/page.tsx`, `src/app/(dashboard)/notifications/page.tsx`, `src/app/(dashboard)/page.tsx`, `src/app/(dashboard)/tasks/page.tsx`, `src/app/check-point/[id]/page.tsx`, `src/app/speaking/[slug]/page.tsx`, `src/app/speaking/result/[id]/page.tsx`, `src/app/speaking/result/[id]/preview/page.tsx`, `src/app/testlevels/[level]/page.tsx`, `src/app/write/[slug]/page.tsx`, `src/app/write/result/[id]/page.tsx`, `src/components/checkpoint/checkpoint-client-wrapper.tsx`, `src/components/ranking/ranking-table.tsx`, `src/components/ranking/school-ranking-table.tsx`, `src/lib/exam/schema.test.ts`

- [ ] **Step 1: Move the six files**

```bash
cd "$REPO" && mkdir -p src/mocks
for f in checkpoints exam-7778495e history planets ranking testlevels; do
  git mv "_webclone/design-model/mocks/$f.json" "src/mocks/$f.json"
done
git status --short | grep mocks
```
Expected: six `R  _webclone/design-model/mocks/<f>.json -> src/mocks/<f>.json` lines.

- [ ] **Step 2: Re-point every mock import to `@/mocks/`**

```bash
cd "$REPO" && grep -rlE "_webclone/design-model/mocks/" src > "$SCR/mock-importers.txt" && cat "$SCR/mock-importers.txt"
xargs -a "$SCR/mock-importers.txt" -d '\n' sed -i -E 's#"(\.\./)+_webclone/design-model/mocks/#"@/mocks/#'
grep -rn "_webclone" src || echo "no _webclone references left"
```
Expected: the 15 files listed under **Files** above, then `no _webclone references left`.

- [ ] **Step 3: Fix import order in the touched files only**

The mock import moved from the relative group into the `@/` group, so `import-x/order` now wants it alphabetized inside that group with no blank line. `import-x/order` is the only auto-fixable rule these 15 files trip at baseline.
```bash
cd "$REPO" && xargs -a "$SCR/mock-importers.txt" -d '\n' npx eslint --fix
git diff --stat
```
Then review the diff of each file: the only changes allowed are the import path text, the position of that one import line, and blank lines in the import block.
```bash
git diff -U0 src | grep -E "^[+-]" | grep -vE "^(\+\+\+|---)" | grep -vE "^[+-]\s*$|^[+-]import .* from \"(@/mocks/|\.\./(\.\./)*_webclone/design-model/mocks/)" | grep -vE "^[+-]import " || echo "only import lines changed"
```
Expected: `only import lines changed`. (If any non-import line appears, revert that file with `git checkout -- <file>`, redo Step 2 for it, and fix its import block by hand.)

- [ ] **Step 4: Verify equivalence**

```bash
"$SCR/tools/tsc-check.sh" "$REPO"
cd "$REPO" && npm test 2>&1 | tail -4
npx eslint . -f json -o "$SCR/lint-task2.json"; node "$SCR/tools/lint-compare.mjs" "$SCR/baseline/lint.json" "$SCR/lint-task2.json"
```
Expected: `PASS`; `Tests  23 passed (23)`; lint `added (0)` (the baseline `testlevels/[level]/page.tsx` import-order entry may appear under `removed`).

- [ ] **Step 5: Commit (ask owner first)**

The six renames are already staged by `git mv`; stage the edited importers (paths contain `[`/`(`, so pass them through `xargs`, never unquoted):
```bash
cd "$REPO" && xargs -a "$SCR/mock-importers.txt" -d '\n' git add -- \
  && git status --short && git commit -m "refactor: move runtime mock data from _webclone to src/mocks"
```

---

### Task 3: Archive unrelated files

**Files:**
- Archive + delete: `_webclone/` (everything left), `scripts/`, `public/clone-assets/_next/`, `public/clone-assets/cm/`, `src/components/common/hello-placeholder.tsx`, `src/components/common/hello-placeholder.test.tsx`
- Modify: `src/components/common/index.ts`, `.gitignore`, `.env.example`, `package.json`

- [ ] **Step 1: Copy to the workspace archive, preserving paths (includes untracked local files)**

```bash
export ARCH="$WS/archive/luyenthiao.com-Web"
mkdir -p "$ARCH/public/clone-assets" "$ARCH/src/components/common"
cd "$REPO"
cp -r _webclone scripts "$ARCH/"
cp -r public/clone-assets/_next public/clone-assets/cm "$ARCH/public/clone-assets/"
cp src/components/common/hello-placeholder.tsx src/components/common/hello-placeholder.test.tsx "$ARCH/src/components/common/"
find "$ARCH" -type f | wc -l
```
Expected: a file count ≥ the tracked count `git ls-files _webclone scripts public/clone-assets/_next public/clone-assets/cm src/components/common/hello-placeholder.tsx src/components/common/hello-placeholder.test.tsx | wc -l`.

- [ ] **Step 2: Remove from the repo**

```bash
cd "$REPO"
git rm -r -q _webclone scripts public/clone-assets/_next public/clone-assets/cm \
  src/components/common/hello-placeholder.tsx src/components/common/hello-placeholder.test.tsx
rm -rf _webclone scripts
ls -d _webclone scripts 2>/dev/null || echo "gone"
```
Expected: `gone`.

- [ ] **Step 3: Drop the placeholder export**

Replace the whole content of `src/components/common/index.ts` with:
```ts
export { ThemeProvider } from './theme-provider'
```

- [ ] **Step 4: Clean `.gitignore`**

In `.gitignore`, delete these four lines (the `# Webclone` header and its three patterns):
```
# Webclone
_webclone/captures/
_webclone/album/
_webclone/
```

- [ ] **Step 5: Clean `.env.example`**

Replace the whole content of `.env.example` with:
```
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

- [ ] **Step 6: Remove the `gates` script**

In `package.json` `scripts`, delete the line:
```json
    "gates": "tsx .claude/skills/web-clone/scripts/gates.ts"
```
and remove the trailing comma from the preceding `"test:watch": "vitest",` line so it reads `"test:watch": "vitest"`. (The target belongs to the web-clone skill tooling; phase 2 decides about `.claude/skills/`.)

- [ ] **Step 7: Verify**

```bash
"$SCR/tools/tsc-check.sh" "$REPO"
cd "$REPO" && npm test 2>&1 | tail -4
npx eslint . -f json -o "$SCR/lint-task3.json"; node "$SCR/tools/lint-compare.mjs" "$SCR/baseline/lint.json" "$SCR/lint-task3.json"
grep -rn "hello-placeholder\|HelloPlaceholder" src || echo "no placeholder references"
node -e "JSON.parse(require('fs').readFileSync('package.json','utf8')); console.log('package.json ok')"
```
Expected: `PASS`; `Test Files  3 passed (3)` and `Tests  22 passed (22)` (the removed file held 1 test); lint `added (0)`, `removed` contains the two `_webclone/capture-flyer.js` entries; `no placeholder references`; `package.json ok`.

- [ ] **Step 8: Commit (ask owner first)**

Deletions are already staged by `git rm`; stage the four edited files:
```bash
cd "$REPO" && git add src/components/common/index.ts .gitignore .env.example package.json \
  && git status --short && git commit -m "chore: archive web-clone tooling, captures and unused placeholder"
```

---

### Task 4: Move the Next project into `src/` and fix configs

**Files:**
- Move to `src/`: `package.json`, `package-lock.json`, `next.config.ts`, `tsconfig.json`, `eslint.config.mjs`, `postcss.config.mjs`, `vitest.config.mts`, `vitest.setup.ts`, `components.json`, `.prettierrc`, `.env.example`, `public/`
- Modify: `src/tsconfig.json`, `src/vitest.config.mts`, `src/components.json`, `src/eslint.config.mjs`, `src/package.json` + `src/package-lock.json` (remove `cheerio`)

- [ ] **Step 1: Move tracked project files**

```bash
cd "$REPO"
git mv package.json package-lock.json next.config.ts tsconfig.json eslint.config.mjs \
  postcss.config.mjs vitest.config.mts vitest.setup.ts components.json .prettierrc .env.example src/
git mv public src/public
git ls-files | grep -v / 
```
Expected root tracked files now: `.gitattributes`, `.gitignore`, `CLAUDE.md` only.

- [ ] **Step 2: Move or drop untracked local artifacts**

```bash
cd "$REPO"
mv node_modules src/node_modules
[ -f .env ] && mv .env src/.env
[ -f .env.local ] && mv .env.local src/.env.local
rm -rf .next next-env.d.ts tsconfig.tsbuildinfo
ls -a
```
Expected root listing: `.claude .codegraph .git .gitattributes .gitignore CLAUDE.md graphify-out src` (plus `.` `..`).

- [ ] **Step 3: Fix `src/tsconfig.json` alias**

Replace:
```json
    "paths": {
      "@/*": [
        "./src/*"
      ]
    }
```
with:
```json
    "paths": {
      "@/*": [
        "./*"
      ]
    }
```

- [ ] **Step 4: Fix `src/vitest.config.mts` alias**

Replace:
```ts
      '@': path.resolve(import.meta.dirname, './src'),
```
with:
```ts
      '@': path.resolve(import.meta.dirname, '.'),
```

- [ ] **Step 5: Fix `src/components.json` CSS path**

Replace `"css": "src/app/globals.css",` with `"css": "app/globals.css",`.

- [ ] **Step 6: Drop the obsolete ESLint ignore**

In `src/eslint.config.mjs`, delete the line:
```js
  { ignores: ['.claude/**'] },
```

- [ ] **Step 7: Remove the unused `cheerio` devDependency**

```bash
cd "$REPO/src" && grep -rl "cheerio" --include=*.ts --include=*.tsx --include=*.mts --include=*.mjs . --exclude-dir=node_modules || echo "cheerio unused"
npm uninstall cheerio
git diff --stat package.json package-lock.json
```
Expected: `cheerio unused`; `npm uninstall` succeeds; `package.json` diff removes one line.

- [ ] **Step 8: Verify from `src/`**

```bash
"$SCR/tools/tsc-check.sh" "$REPO/src"
cd "$REPO/src" && npm test 2>&1 | tail -4
npx eslint . -f json -o "$SCR/lint-task4.json"; node "$SCR/tools/lint-compare.mjs" "$SCR/baseline/lint.json" "$SCR/lint-task4.json"
git -C "$REPO" status --short --ignored | grep -E "node_modules|\.next|next-env|tsbuildinfo|\.env$" 
```
Expected: `PASS`; `Tests  22 passed (22)`; lint `added (0)`; every listed generated path is prefixed `!!` (ignored), none appears as `??`.

- [ ] **Step 9: Start the dev server from `src/` once to confirm it boots**

In a background shell: `cd "$REPO/src" && npm run dev`, wait for `Ready`, then:
```bash
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/login
curl -s "http://localhost:3000/api/admin/media?type=image" | head -c 200; echo
```
Expected: `200`; a JSON body starting with `{"items":[{"name":` (the route handler found `src/public/clone-assets`). Stop that dev server.

- [ ] **Step 10: Commit (ask owner first)**

Renames are already staged by `git mv`; stage the config edits and the lockfile change under `src/`:
```bash
cd "$REPO" && git add -A src && git status --short | grep -v "^R  "
```
Expected: only `M  src/...` lines (staged edits: `tsconfig.json`, `vitest.config.mts`, `components.json`, `eslint.config.mjs`, `package.json`, `package-lock.json`) and no ` M` or `??` entries. Then:
```bash
cd "$REPO" && git commit -m "refactor: move the Next.js project into src like Zoney.vn-Web"
```

---

### Task 5: Directory conventions inside `src/`

All commands in this task run in `$REPO/src`.

**Files:**
- Move: see Step 1
- Modify: `lib/exam.ts`, `lib/exam-storage.ts`, `lib/exam-factories.ts`, `lib/exam-grade.test.ts`, `schemas/exam.test.ts`, `hooks/index.ts`, `components/common/index.ts`, `components/exam/index.ts`, `components/exam/exam-checkpoint.tsx`, `components/exam/exam-mode-select-modal.tsx`, `components/exam/exam-player.tsx`, `app/(dashboard)/layout.tsx`, `app/check-point/[id]/page.tsx`, plus every file matched by the global rewrites in Step 3

- [ ] **Step 1: Moves**

```bash
cd "$REPO/src"
mkdir -p schemas
git mv lib/exam/schema.ts schemas/exam.ts
git mv lib/exam/schema.test.ts schemas/exam.test.ts
for f in blank color factories grade normalize storage; do git mv "lib/exam/$f.ts" "lib/exam-$f.ts"; done
git mv lib/exam/grade.test.ts lib/exam-grade.test.ts
git mv lib/exam/index.ts lib/exam.ts
for f in draft media validate; do git mv "lib/admin/$f.ts" "lib/admin-$f.ts"; done
for f in use-register use-login use-logout use-change-password use-forgot-password use-reset-password; do git mv "hooks/auth/$f.ts" "hooks/$f.ts"; done
git rm -q hooks/auth/index.ts
git mv components/layout/bottom-nav.tsx components/common/bottom-nav.tsx
git mv components/layout/topbar.tsx components/common/topbar.tsx
git rm -q components/layout/index.ts
git mv components/checkpoint/exam-player.tsx components/exam/exam-player.tsx
git mv components/checkpoint/checkpoint-client-wrapper.tsx components/exam/exam-checkpoint.tsx
git mv components/checkpoint/mode-select-modal.tsx components/exam/exam-mode-select-modal.tsx
git rm -q components/checkpoint/index.ts
ls lib/exam lib/admin hooks/auth components/layout components/checkpoint 2>&1 | grep -c "No such file"
```
Expected: `5` (all five old directories are gone).

- [ ] **Step 2: Fix relative imports inside the moved `lib` and `schemas` files**

```bash
cd "$REPO/src"
sed -i -e 's#"./grade"#"./exam-grade"#' -e 's#"./normalize"#"./exam-normalize"#' \
       -e 's#"./schema"#"@/schemas/exam"#' -e 's#"./color"#"./exam-color"#' \
       -e 's#"./storage"#"./exam-storage"#' lib/exam.ts
sed -i 's#"./schema"#"@/schemas/exam"#' lib/exam-storage.ts
sed -i 's#"./grade"#"./exam-grade"#' lib/exam-grade.test.ts
sed -i -e 's#"./normalize"#"@/lib/exam-normalize"#' -e 's#"./schema"#"./exam"#' schemas/exam.test.ts
cat lib/exam.ts
```
Expected `lib/exam.ts`:
```ts
export { gradeExam, type GradeResult, type DetailGrade } from "./exam-grade"
export {
  normalizeExam,
  type RawCheckPoint,
} from "./exam-normalize"
export { examSchema } from "@/schemas/exam"
export { getColorName, isColorCode } from "./exam-color"
export {
  loadExams,
  saveExams,
  upsertExam,
  deleteExam,
  saveAttempt,
  loadAttempt,
  exportExams,
  importExams,
  type ExamAttempt,
} from "./exam-storage"

export type { Exam, ExamDetail, ExamPart, ExamQuestion, ExamStructure, PartKind } from "@/types/exam"
```

- [ ] **Step 3: Global alias rewrites**

```bash
cd "$REPO/src"
grep -rlE '@/lib/exam/|@/lib/admin/|"@/hooks/auth"' --include=*.ts --include=*.tsx . --exclude-dir=node_modules > "$SCR/task5-importers.txt"
cat "$SCR/task5-importers.txt"
xargs -a "$SCR/task5-importers.txt" -d '\n' sed -i -E \
  -e 's#@/lib/exam/(blank|factories)"#@/lib/exam-\1"#g' \
  -e 's#@/lib/admin/(draft|media|validate)"#@/lib/admin-\1"#g' \
  -e 's#"@/hooks/auth"#"@/hooks"#g'
grep -rnE '@/lib/exam/|@/lib/admin/|@/hooks/auth' --include=*.ts --include=*.tsx . --exclude-dir=node_modules || echo "no old lib/hooks paths"
```
Expected file list: `components/admin/exam/editor/exam-editor.tsx`, `components/admin/exam/editor/form/part-form-dragdrop.tsx`, `components/admin/exam/editor/form/part-form-gapfill.tsx`, `components/admin/exam/editor/form/part-form-matching.tsx`, `components/admin/exam/editor/form/part-form-multichoice.tsx`, `components/admin/exam/editor/form/part-settings-fields.tsx`, `components/admin/exam/editor/part-card.tsx`, `components/admin/exam/editor/validation-panel.tsx`, `components/admin/exam/exam-list-table.tsx`, `components/admin/media/index.ts`, `components/admin/media/media-browser-dialog.tsx`, `components/admin/media/media-picker-field.tsx`, `components/auth/change-password-form.tsx`, `components/auth/forgot-password-form.tsx`, `components/auth/login-form.tsx`, `components/auth/reset-password-form.tsx`, `components/auth/signup-form.tsx`, `components/common/topbar.tsx`, `hooks/use-media-library.ts`, `lib/exam-factories.ts` (order may differ). Then `no old lib/hooks paths`.

- [ ] **Step 4: Rewrite barrels**

Replace the whole content of `hooks/index.ts` with:
```ts
export * from "./use-register"
export * from "./use-login"
export * from "./use-logout"
export * from "./use-change-password"
export * from "./use-forgot-password"
export * from "./use-reset-password"
```

Replace the whole content of `components/common/index.ts` with:
```ts
export * from './bottom-nav'
export { ThemeProvider } from './theme-provider'
export * from './topbar'
```

Append to `components/exam/index.ts` (after the existing `} from "./parts"` line, on new lines):
```ts
export { ExamCheckpoint } from "./exam-checkpoint"
export { ExamModeSelectModal } from "./exam-mode-select-modal"
export { ExamPlayer } from "./exam-player"
```

- [ ] **Step 5: Rename the two checkpoint components and break the barrel cycle**

```bash
cd "$REPO/src"
sed -i -e 's/CheckpointClientWrapperProps/ExamCheckpointProps/g' \
       -e 's/\bCheckpointClientWrapper\b/ExamCheckpoint/g' \
       -e 's/\bModeSelectModal\b/ExamModeSelectModal/g' \
       -e 's#"./mode-select-modal"#"./exam-mode-select-modal"#' components/exam/exam-checkpoint.tsx
sed -i 's/export function ModeSelectModal\b/export function ExamModeSelectModal/' components/exam/exam-mode-select-modal.tsx
sed -i 's#from "@/components/exam"#from "./parts"#' components/exam/exam-player.tsx
grep -nE "ExamCheckpoint|ExamModeSelectModal|from \"\./" components/exam/exam-checkpoint.tsx components/exam/exam-mode-select-modal.tsx components/exam/exam-player.tsx
```
Expected lines: `exam-checkpoint.tsx` shows `import { ExamPlayer } from "./exam-player";`, `import { ExamModeSelectModal } from "./exam-mode-select-modal";`, `interface ExamCheckpointProps {`, `export function ExamCheckpoint({ id, initialData }: ExamCheckpointProps) {`, `<ExamModeSelectModal data=…`; `exam-mode-select-modal.tsx` shows `export function ExamModeSelectModal(`; `exam-player.tsx` shows `import { PART_RENDERERS, type ReviewContext } from "./parts"`.

(`exam-player.tsx` imported the `@/components/exam` barrel, which now re-exports `exam-player.tsx` itself; importing `./parts` directly avoids the module cycle.)

- [ ] **Step 6: Update the two route files**

In `app/(dashboard)/layout.tsx` replace:
```tsx
import { BottomNav } from "@/components/layout/bottom-nav";
import { Topbar } from "@/components/layout/topbar";
```
with:
```tsx
import { BottomNav, Topbar } from "@/components/common";
```

In `app/check-point/[id]/page.tsx` replace:
```tsx
import { CheckpointClientWrapper } from "@/components/checkpoint/checkpoint-client-wrapper";
```
with:
```tsx
import { ExamCheckpoint } from "@/components/exam";
```
and replace:
```tsx
  return <CheckpointClientWrapper id={id} initialData={data} />;
```
with:
```tsx
  return <ExamCheckpoint id={id} initialData={data} />;
```

- [ ] **Step 7: Import order in touched files**

```bash
cd "$REPO/src"
git diff --name-only -- . | sed 's#^src/##' > "$SCR/task5-touched.txt"
cat "$SCR/task5-touched.txt"
xargs -a "$SCR/task5-touched.txt" -d '\n' npx eslint --fix
git diff --stat
```
(`git diff` without `--cached` lists files edited after the `git mv`s, i.e. exactly the files this task changed by hand or by `sed`.)

Then review `git diff` file by file. Allowed changes only:
- import/export lines (path text, position, merged specifiers, blank lines in the import block);
- the full-content rewrites of `hooks/index.ts`, `components/common/index.ts`, and the three lines appended to `components/exam/index.ts`;
- the identifier renames `CheckpointClientWrapper` → `ExamCheckpoint`, `CheckpointClientWrapperProps` → `ExamCheckpointProps`, `ModeSelectModal` → `ExamModeSelectModal`.

Anything else (changed JSX, logic, string literals, formatting outside import blocks) is a defect: revert that hunk before continuing.

- [ ] **Step 8: Verify**

```bash
"$SCR/tools/tsc-check.sh" "$REPO/src"
cd "$REPO/src" && npm test 2>&1 | tail -4
npx eslint . -f json -o "$SCR/lint-task5.json"; node "$SCR/tools/lint-compare.mjs" "$SCR/baseline/lint.json" "$SCR/lint-task5.json"
grep -rnE "_webclone|@/lib/exam/|@/lib/admin/|@/hooks/auth|@/components/layout|@/components/checkpoint|hello-placeholder|CheckpointClientWrapper|\bModeSelectModal\b" --include=*.ts --include=*.tsx . --exclude-dir=node_modules || echo "no old paths or names"
```
Expected: `PASS`; `Test Files  3 passed (3)`, `Tests  22 passed (22)`; lint `added (0)`; `no old paths or names`.

- [ ] **Step 9: Commit (ask owner first)**

```bash
cd "$REPO" && git add -A src && git status --short | head -60 \
  && git commit -m "refactor: flatten lib and hooks, add schemas, merge layout and checkpoint dirs"
```

---

### Task 6: README, docs and CI

**Files:**
- Create: `README.md`, `docs/01-architecture.md`, `docs/02-setup-and-environment.md`, `docs/03-known-issues.md`, `.github/workflows/ci.yml`

- [ ] **Step 1: Create `README.md`**

````markdown
# luyenthiao.com-Web

Next.js web client for luyenthiao.com, an online English test-preparation platform.
The API lives in the separate `luyenthiao.com-Backend` repository.

## Layout

```
.claude/   AI agent configuration (specs and plans in .claude/superpowers/)
.github/   CI workflows
docs/      Project documentation
src/       The Next.js project — run every npm command here
```

## Commands (run in `src/`)

```bash
npm ci              # install dependencies
npm run dev         # dev server on http://localhost:3000
npx tsc --noEmit    # type-check
npm run lint        # ESLint
npm test            # Vitest
npm run build       # production build
```

See `docs/02-setup-and-environment.md` for environment variables and
`docs/03-known-issues.md` before relying on `tsc`/`build` results.
````

- [ ] **Step 2: Create `docs/01-architecture.md`**

````markdown
# Architecture

## Repository layout

The repository root holds only metadata (AI configuration, CI, docs). The Next.js project lives
entirely in `src/`, the same layout as Zoney.vn-Web.

## `src/` directories

| Directory | Contents |
|---|---|
| `app/` | App Router routes, layouts, route handlers (`app/api/`) |
| `components/ui/` | Base UI primitives (shadcn style) |
| `components/common/` | App-wide components: `Topbar`, `BottomNav`, `ThemeProvider` |
| `components/<domain>/` | Components for one domain: `admin`, `auth`, `dashboard`, `exam`, `ranking`, `speaking`, `testlevels`, `writing` |
| `hooks/` | Flat `use-*.ts` hooks, re-exported from `hooks/index.ts` |
| `lib/` | Flat modules with a domain prefix (`exam-grade.ts`, `admin-draft.ts`); tests sit next to the module |
| `lib/exam.ts` | Public surface of the exam domain helpers |
| `schemas/` | Zod schemas, one file per domain (`exam.ts`) |
| `store/` | Zustand stores (`use<Name>Store`) |
| `providers/` | React context providers (auth, TanStack Query) |
| `constants/` | App-wide constants, including `ROUTES` |
| `types/` | Shared TypeScript types |
| `mocks/` | JSON mock data used until each domain is wired to the backend |
| `public/` | Static files |

## Conventions

- Import through the `@/` alias (maps to `src/`); every `components/<dir>/` has an `index.ts` barrel.
- File names are kebab-case; components are named exports in PascalCase.
- Exam components share the `exam-` prefix: `exam-checkpoint.tsx` (client view of `/check-point/[id]`),
  `exam-mode-select-modal.tsx`, `exam-player.tsx`, and the part renderers in `components/exam/parts/`.
````

- [ ] **Step 3: Create `docs/02-setup-and-environment.md`**

````markdown
# Setup and environment

## Requirements

- Node.js 20 or newer (`engines` in `src/package.json`)
- npm (the lockfile is `src/package-lock.json`)

## Environment variables

Copy `src/.env.example` to `src/.env.local` and adjust:

| Variable | Meaning | Default |
|---|---|---|
| `NEXT_PUBLIC_APP_URL` | Public URL of this web app | `http://localhost:3000` |
| `NEXT_PUBLIC_API_URL` | Base URL of the backend API | `http://localhost:3000/api` |

## Run locally

```bash
cd src
npm ci
npm run dev
```

Authentication pages call the backend at `NEXT_PUBLIC_API_URL`; start `luyenthiao.com-Backend`
first if you need login. Other pages currently read data from `src/mocks/` or `localStorage`.
````

- [ ] **Step 4: Create `docs/03-known-issues.md`**

````markdown
# Known issues

Recorded during the phase 1 restructure (2026-11-15). Fixes are scheduled for phase 3.

## 1. Five mock files are missing — `tsc` and `build` fail

These files are imported but were never committed and exist on no branch:
`src/mocks/notifications.json`, `src/mocks/school-ranking.json`, `src/mocks/speaking.json`,
`src/mocks/tasks.json`, `src/mocks/writing.json`.

Effects: `npx tsc --noEmit` reports 15 errors and `npm run build` fails. These routes do not work:
`/notifications`, `/tasks`, `/school-ranking`, `/speaking/[slug]`, `/speaking/result/[id]`,
`/speaking/result/[id]/preview`, `/write/[slug]`, `/write/result/[id]`.

CI marks the type-check and build steps `continue-on-error` until this is fixed.

## 2. Exposed third-party session tokens in git history

Earlier commits contain `_webclone/captures_exam/json_payloads/` with a session cookie,
auth/refresh tokens and a Firebase config captured from a third-party account. The files are no
longer in the tree, but they remain in git history. Treat those credentials as exposed.

## 3. Third-party assets

Everything under `src/public/clone-assets/` was downloaded from exam.flyer.us and must be replaced
with the project's own assets before production.

## 4. Pre-existing lint errors

`npm run lint` reports `import-x/order` errors in `app/testlevels/[level]/page.tsx` (if still
present), `components/testlevels/level-header.tsx`, `components/testlevels/level-map.tsx` and
`components/ui/dialog.tsx`, plus `@next/next/no-img-element` warnings. CI marks lint
`continue-on-error` until they are fixed.
````

- [ ] **Step 5: Create `.github/workflows/ci.yml`**

Action versions verified on 2026-11-15 via `gh api repos/actions/checkout/releases/latest` (`v7.0.1`) and `gh api repos/actions/setup-node/releases/latest` (`v7.1.0`). Re-run both commands before writing the file; if a newer major exists, use it.

```yaml
name: CI

on:
  push:
  pull_request:

jobs:
  verify:
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: src
    steps:
      - uses: actions/checkout@v7
      - uses: actions/setup-node@v7
        with:
          node-version: 20
          cache: npm
          cache-dependency-path: src/package-lock.json
      - run: npm ci
      - name: Type-check
        # Known failure until the missing mocks are rebuilt; see docs/03-known-issues.md section 1.
        continue-on-error: true
        run: npx tsc --noEmit
      - name: Lint
        # Pre-existing import-order errors; see docs/03-known-issues.md section 4.
        continue-on-error: true
        run: npm run lint
      - name: Test
        run: npm test
      - name: Build
        # Known failure until the missing mocks are rebuilt; see docs/03-known-issues.md section 1.
        continue-on-error: true
        run: npm run build
```

- [ ] **Step 6: Validate the workflow YAML**

```bash
cd "$REPO/src" && node -e "
const y=require('fs').readFileSync('../.github/workflows/ci.yml','utf8');
if(/\t/.test(y)) throw new Error('tab in yaml');
console.log(y.split('\n').length+' lines, no tabs')"
```
Expected: `… lines, no tabs`. (Full YAML validation happens on the first push in GitHub; pushing is the owner's decision.)

- [ ] **Step 7: Commit (ask owner first)**

```bash
cd "$REPO" && git add README.md docs .github && git status --short \
  && git commit -m "docs: add readme, architecture, setup, known issues and ci workflow"
```

---

### Task 7: Final verification on the real app

**Files:** none modified.

- [ ] **Step 1: Static checks**

```bash
"$SCR/tools/tsc-check.sh" "$REPO/src"
cd "$REPO/src" && npm test 2>&1 | tail -4
npx eslint . -f json -o "$SCR/lint-final.json"; node "$SCR/tools/lint-compare.mjs" "$SCR/baseline/lint.json" "$SCR/lint-final.json"
npm run build 2>&1 | grep -E "Module not found|Can't resolve|Type error" | sort -u
```
Expected: `PASS`; `Tests  22 passed (22)`; lint `added (0)`; the build failure lines mention only the five missing `@/mocks/*.json` files or the eight files listed in `tsc-check.sh`.

- [ ] **Step 2: Screenshots of the 15 working routes on the branch**

Background shell: `cd "$REPO/src" && npm run dev`, wait for `Ready`, then:
```bash
node "$SCR/tools/route-shots.mjs" http://localhost:3000 "$SCR/shots/branch" "$REPO/src"
node "$SCR/tools/compare-shots.mjs" "$SCR/shots/base-1" "$SCR/shots/branch"
node -e "
const r=require('E:/Ziratech/English-Prep-Web-Game/.scratch/shots/branch/report.json');
const b=require('E:/Ziratech/English-Prep-Web-Game/.scratch/shots/base-1/report.json');
const k=x=>x.filter(e=>e.kind!=='status').map(e=>e.route+' '+e.kind+' '+e.text);
const nb=new Set(k(b)); console.log('new errors:', k(r).filter(x=>!nb.has(x)));
console.log('status:', r.filter(e=>e.kind==='status').map(e=>e.route+' '+e.text+' -> '+e.finalUrl).join('\n'))"
```
Expected: every route not listed in `$SCR/shots/nondeterministic.txt` is `SAME`; `new errors: []`; status lines match the base run. For each `DIFF` route that is in `nondeterministic.txt`, open both PNGs (Read tool) and confirm the only differences are the time-dependent/random regions noted in Task 1. Any other difference is a regression: stop and investigate.

- [ ] **Step 3: Manual flows (same dev server)**

1. Open `/check-point/7778495e-531b-4039-a3ea-321874ba1a7a`, choose a mode, answer at least one question in each part, submit. Expected: redirect to `/testresult?...` showing the score.
2. Open `/admin/exam`, create a new exam, open the media picker for an image and for an audio field, pick one of each, save. Expected: both dialogs list files; the exam appears in the list after saving and reloading.
3. Start `luyenthiao.com-Backend` (branch `develop`) locally, set `NEXT_PUBLIC_API_URL` in `src/.env.local` to its URL, restart the dev server, then sign up or log in at `/login`, confirm the topbar shows the session, log out. Expected: same behavior as on `main`.

Record the outcome of each flow. Stop the dev server(s) started by this task.

- [ ] **Step 4: Report**

Report to the owner: commits created (short SHA + subject), verification outputs, any `DIFF` routes and why they are acceptable, and that nothing has been pushed. Do not push.
