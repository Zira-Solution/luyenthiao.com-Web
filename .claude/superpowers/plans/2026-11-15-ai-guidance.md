# Phase 2 — AI Guidance Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the outdated AI guidance in `luyenthiao.com-Web` with AGENTS.md + CLAUDE.md + `.claude/{ARCHITECTURE.md,rules,agents,hooks,skills,settings.json}` built from the host setup and the Zoney layout, including a vendored guard hook that stands down when a user-level guard exists.

**Architecture:** Documentation and configuration only, plus a vendored copy of the host guard (`~/.claude/hooks/guard.mjs` + `guard-lib/`) with a small dedup module and five path adaptations, covered by `node:test`. No change under `src/`.

**Tech Stack:** Markdown, JSON, Node ≥ 20 ESM (`node:test`), Claude Code hooks, Git Bash on Windows.

**Spec:** `.claude/superpowers/specs/2026-11-15-ai-guidance-design.md`

---

## Conventions for the executor

```bash
export WS="E:/Ziratech/English-Prep-Web-Game"
export REPO="$WS/luyenthiao.com-Web"
export HOSTC="C:/Users/lemin/.claude"          # host Claude config (read-only except skill mirrors in Task 5)
export ZONEY="E:/Ziratech/Zoney.vn"            # reference project (read-only)
export ARCH="$WS/archive/luyenthiao.com-Web"
```
- Node is a Windows binary: pass `E:/...` / `C:/...` paths to `node`, never `/tmp/...`.
- All new/rewritten files: English, LF line endings, trailing newline.
- Every commit needs the owner's approval (asked once for the whole list in Task 0). Commit messages are exactly as written, one line, **no `Co-Authored-By` or any AI attribution**.
- The app must not change: after every task, `cd "$REPO/src" && npx tsc --noEmit 2>&1 | grep -c "error TS"` prints `15` and `npm test` passes 3 files / 22 tests.

## File map

| Path (repo-relative) | Action | Task |
|---|---|---|
| `.claude/hooks/guard.mjs` | vendored + dedup call | 1 |
| `.claude/hooks/guard-lib/{cli,commands,env,files,handlers,project,refresh,state}.mjs` | vendored; `handlers.mjs`, `project.mjs` adapted | 1 |
| `.claude/hooks/guard-lib/dedup.mjs` | new | 1 |
| `.claude/hooks/tests/{helpers,guard.test}.mjs` | vendored | 1 |
| `.claude/hooks/tests/project.test.mjs` | new | 1 |
| `.claude/hooks/VENDORED.md` | new | 1 |
| `.claude/settings.json` | rewritten | 2 |
| `.claude/rules/{git,research,tooling}.md` | new (ports of host rules) | 3 |
| `.claude/rules/{verification,agent-roles}.md` | new (ports of Zoney rules) | 3 |
| `.claude/rules/animation-matrix.md` | moved from web-clone skill | 3 |
| `.claude/rules/{coding,workflow,extension-fallback,skill-fallback-table}.md` | updated | 3 |
| `.claude/agents/{implementer,spec-reviewer,code-reviewer,runner}.md` | new (ports of Zoney agents) | 3 |
| `AGENTS.md` | new | 4 |
| `CLAUDE.md` | rewritten | 4 |
| `.claude/ARCHITECTURE.md` | rewritten | 4 |
| `.claude/skills/web-clone/` | archived + removed | 5 |
| `.claude/skills/graphify/` | added (copy of host skill) | 5 |
| `docs/02-setup-and-environment.md`, `docs/03-known-issues.md` | updated | 6 |

---

### Task 0: Branch and approvals

- [ ] **Step 1:** `cd "$REPO" && git status --short && git branch --show-current` → expect branch `refactor/zoney-structure` and only these untracked files: `.claude/superpowers/specs/2026-11-15-ai-guidance-design.md`, `.claude/superpowers/plans/2026-11-15-ai-guidance.md`.
- [ ] **Step 2:** Ask the owner to approve: creating branch `chore/ai-guidance` from `refactor/zoney-structure`; the 7 commits listed in this plan (Task 0 + Tasks 1–6); writing skill mirrors under `$HOSTC/skills/` (Task 5); and fix commits for Critical/Important review findings.
- [ ] **Step 3:**
```bash
cd "$REPO" && git switch -c chore/ai-guidance \
 && git add .claude/superpowers/specs/2026-11-15-ai-guidance-design.md .claude/superpowers/plans/2026-11-15-ai-guidance.md \
 && git commit -m "docs: add phase 2 ai guidance spec and plan"
```

---

### Task 1: Vendor the guard with project-level dedup

**Files:** see file map (Task 1 rows).

- [ ] **Step 1: Copy the host guard verbatim**
```bash
mkdir -p "$REPO/.claude/hooks/guard-lib" "$REPO/.claude/hooks/tests"
cp "$HOSTC/hooks/guard.mjs" "$REPO/.claude/hooks/guard.mjs"
cp "$HOSTC"/hooks/guard-lib/*.mjs "$REPO/.claude/hooks/guard-lib/"
cp "$HOSTC"/hooks/tests/*.mjs "$REPO/.claude/hooks/tests/"
ls "$REPO/.claude/hooks" "$REPO/.claude/hooks/guard-lib" "$REPO/.claude/hooks/tests"
cd "$REPO" && node --test .claude/hooks/tests/guard.test.mjs 2>&1 | tail -8
```
Expected: 8 files in `guard-lib/`, `helpers.mjs` + `guard.test.mjs` in `tests/`; the vendored suite passes unchanged (same counts as running it in `$HOSTC/hooks`; run `cd "$HOSTC/hooks" && node --test tests/guard.test.mjs 2>&1 | tail -8` to compare). If the host suite itself has failures, record them and continue only if the vendored copy has the identical result.

- [ ] **Step 2: Write the failing tests** — create `.claude/hooks/tests/project.test.mjs`:
```js
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { sandbox, makeRepo, run, hook, ctxOf, decisionOf, reasonOf, GUARD } from './helpers.mjs';

const pre = (sb, tool, tool_input, extra = {}) =>
  hook(sb, 'PreToolUse', { tool_name: tool, tool_input, cwd: extra.cwd, ...extra });

function writeUserSettings(sb, file, command) {
  fs.mkdirSync(sb.claude, { recursive: true });
  const hooks = { PreToolUse: [{ matcher: 'Read', hooks: [{ type: 'command', command }] }] };
  fs.writeFileSync(path.join(sb.claude, file), JSON.stringify({ hooks }));
}

function missingRead(sb) {
  const repo = makeRepo(sb);
  return pre(sb, 'Read', { file_path: path.join(repo, 'src', 'app.ts') }, { cwd: repo });
}

test('dedup: no user-level guard -> project guard enforces', () => {
  const sb = sandbox();
  assert.equal(decisionOf(missingRead(sb)), 'deny');
});

test('dedup: user-level guard in settings.json -> project guard is silent', () => {
  const sb = sandbox();
  writeUserSettings(sb, 'settings.json', `node "${path.join(sb.claude, 'hooks', 'guard.mjs')}" PreToolUse`);
  const r = missingRead(sb);
  assert.equal(r.code, 0);
  assert.equal(r.stdout, '');
});

test('dedup: user-level guard in settings.local.json -> project guard is silent', () => {
  const sb = sandbox();
  writeUserSettings(sb, 'settings.local.json', 'node ~/.claude/hooks/guard.mjs PreToolUse');
  assert.equal(missingRead(sb).stdout, '');
});

test('dedup: a user settings entry pointing at this vendored file does not count', () => {
  const sb = sandbox();
  writeUserSettings(sb, 'settings.json', `node "${GUARD}" PreToolUse`);
  assert.equal(decisionOf(missingRead(sb)), 'deny');
});

test('dedup: CLAUDE_PROJECT_DIR commands do not count as user-level', () => {
  const sb = sandbox();
  writeUserSettings(sb, 'settings.json', 'node "${CLAUDE_PROJECT_DIR}/.claude/hooks/guard.mjs" PreToolUse');
  assert.equal(decisionOf(missingRead(sb)), 'deny');
});

test('dedup: malformed user settings -> project guard enforces', () => {
  const sb = sandbox();
  fs.writeFileSync(path.join(sb.claude, 'settings.json'), '{oops');
  assert.equal(decisionOf(missingRead(sb)), 'deny');
});

test('dedup: GUARD_PROJECT=0 silences the project guard', () => {
  const sb = sandbox();
  sb.env.GUARD_PROJECT = '0';
  assert.equal(missingRead(sb).stdout, '');
});

test('dedup: CLI commands still work when a user-level guard exists', () => {
  const sb = sandbox();
  writeUserSettings(sb, 'settings.json', 'node ~/.claude/hooks/guard.mjs PreToolUse');
  const repo = makeRepo(sb);
  const r = run(sb, ['status', repo]);
  assert.equal(r.code, 0);
  assert.match(r.stdout, /"status": "missing"/);
});

test('adapted: decline hint points at the vendored guard file', () => {
  const sb = sandbox();
  const reason = reasonOf(missingRead(sb));
  assert.ok(reason.includes(`node "${GUARD.replace(/\\/g, '/')}" decline`), reason);
  assert.doesNotMatch(reason, /~\/\.claude\/hooks\/guard\.mjs/);
});

test('adapted: SessionStart points at the project tooling rule', () => {
  const sb = sandbox();
  const repo = makeRepo(sb);
  const c = ctxOf(hook(sb, 'SessionStart', { cwd: repo, source: 'startup' }));
  assert.match(c, /\.claude\/rules\/tooling\.md/);
  assert.doesNotMatch(c, /tooling-and-skills/);
});

test('adapted: a project-level graphify skill satisfies the skill check', () => {
  const sb = sandbox();
  const repo = makeRepo(sb);
  fs.mkdirSync(path.join(repo, '.claude', 'skills', 'graphify'), { recursive: true });
  const c = ctxOf(hook(sb, 'SessionStart', { cwd: repo, source: 'startup' }));
  assert.doesNotMatch(c, /global graphify skill/);
});

test('adapted: .claude/superpowers files are exempt from the brainstorm gate', () => {
  const sb = sandbox();
  const repo = makeRepo(sb, { codegraph: true, graphify: true });
  const r = pre(sb, 'Write', { file_path: path.join(repo, '.claude', 'superpowers', 'specs', 'a.md') }, { cwd: repo });
  assert.equal(r.stdout, '');
});

test('adapted: skill mirror reminder points at the project tooling rule', () => {
  const sb = sandbox();
  const repo = makeRepo(sb, { codegraph: true, graphify: true });
  const r = hook(sb, 'PostToolUse', {
    tool_name: 'Write',
    tool_input: { file_path: path.join(repo, '.claude', 'skills', 'demo', 'SKILL.md'), content: 'x' },
    cwd: repo,
  });
  assert.match(ctxOf(r), /\.claude\/rules\/tooling\.md/);
});
```
Run: `cd "$REPO" && node --test .claude/hooks/tests/project.test.mjs 2>&1 | tail -20`
Expected: the "no user-level guard" and "malformed settings" tests pass; dedup-silent tests, `GUARD_PROJECT=0`, and all `adapted:` tests FAIL (not implemented yet). `GUARD` is already exported by `helpers.mjs` (`export const GUARD = path.join(here, '..', 'guard.mjs')`).

- [ ] **Step 3: Create `.claude/hooks/guard-lib/dedup.mjs`**
```js
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { norm, samePath, claudeDir } from './env.mjs';

// The vendored guard entry file (this repo's .claude/hooks/guard.mjs).
export const SELF = norm(path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'guard.mjs'));
const GUARD_TOKEN = /[^\s"'`]*guard\.mjs/g;
const PROJECT_VAR = /\$\{?CLAUDE_PROJECT_DIR\}?/;

function hookCommands(file) {
  let data;
  try {
    data = JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch {
    return [];
  }
  const out = [];
  for (const groups of Object.values((data && data.hooks) || {})) {
    if (!Array.isArray(groups)) continue;
    for (const group of groups) {
      for (const h of (group && group.hooks) || []) {
        if (h && typeof h.command === 'string') out.push(h.command);
      }
    }
  }
  return out;
}

// True when the user-level settings register a guard.mjs other than this vendored file.
export function userGuardRegistered() {
  for (const name of ['settings.json', 'settings.local.json']) {
    for (const command of hookCommands(path.join(claudeDir(), name))) {
      if (PROJECT_VAR.test(command)) continue;
      for (const token of command.match(GUARD_TOKEN) || []) {
        if (!samePath(norm(token), SELF)) return true;
      }
    }
  }
  return false;
}

// The project guard stays silent when disabled explicitly or when a user-level guard is active.
export function shouldStandDown() {
  if (process.env.GUARD_PROJECT === '0') return true;
  try {
    return userGuardRegistered();
  } catch {
    return false;
  }
}
```

- [ ] **Step 4: Call it from `.claude/hooks/guard.mjs`** — inside `main()`, replace
```js
    if (hookMode) {
      const { HANDLERS } = await import('./guard-lib/handlers.mjs');
```
with
```js
    if (hookMode) {
      const { shouldStandDown } = await import('./guard-lib/dedup.mjs');
      if (shouldStandDown()) return;
      const { HANDLERS } = await import('./guard-lib/handlers.mjs');
```

- [ ] **Step 5: Adapt `.claude/hooks/guard-lib/handlers.mjs`**

a) After the existing `import { scheduleRefresh } from './refresh.mjs';` line add:
```js
import { SELF } from './dedup.mjs';

// Repo that vendors this guard: <repo>/.claude/hooks/guard.mjs -> <repo>
const TOOLING_RULE = `${norm(path.join(path.dirname(SELF), '..', '..'))}/.claude/rules/tooling.md`;
```
b) Replace
```js
const DECLINE_CMD = (root) => `node ~/.claude/hooks/guard.mjs decline "${root}"`;
```
with
```js
const DECLINE_CMD = (root) => `node "${SELF}" decline "${root}"`;
```
c) Replace
```js
      `(see ~/.claude/rules/tooling-and-skills.md), install the approved ones, ` +
```
with
```js
      `(see ${TOOLING_RULE}), install the approved ones, ` +
```
d) Replace
```js
  if (/\/docs\/superpowers\//i.test(p) || /(?:^|\/)\.gitignore$/i.test(p)) return null;
```
with
```js
  if (/\/docs\/superpowers\//i.test(p) || /\/\.claude\/superpowers\//i.test(p) || /(?:^|\/)\.gitignore$/i.test(p)) return null;
```
e) Replace
```js
      notes.push(`[guard] Skill "${name}" was added to the project; also install a copy at ~/.claude/skills/${name} (see rules/tooling-and-skills.md).`);
```
with
```js
      notes.push(`[guard] Skill "${name}" was added to the project; also install a copy at ~/.claude/skills/${name} (see ${TOOLING_RULE}).`);
```
Then `grep -n "tooling-and-skills\|~/.claude/hooks" .claude/hooks/guard-lib/*.mjs` → expect no output. (If another message in the file references `tooling-and-skills`, apply the same `${TOOLING_RULE}` substitution and report it.)

- [ ] **Step 6: Adapt `.claude/hooks/guard-lib/project.mjs`** — replace
```js
  if (!declined.includes('graphify') && !fs.existsSync(path.join(claudeDir(), 'skills', 'graphify'))) {
```
with
```js
  const graphifySkill =
    fs.existsSync(path.join(claudeDir(), 'skills', 'graphify')) ||
    fs.existsSync(path.join(root, '.claude', 'skills', 'graphify'));
  if (!declined.includes('graphify') && !graphifySkill) {
```

- [ ] **Step 7: Run all guard tests**
```bash
cd "$REPO" && node --test .claude/hooks/tests/guard.test.mjs .claude/hooks/tests/project.test.mjs 2>&1 | tail -10
```
Expected: all tests pass (vendored suite unchanged count + 13 new). If a vendored test fails because it asserted an old message text (e.g. `~/.claude/hooks/guard.mjs`), update only that assertion to the adapted text and list it in `VENDORED.md`.

- [ ] **Step 8: Smoke tests**
```bash
cd "$REPO"
P='{"session_id":"smoke","hook_event_name":"PreToolUse","tool_name":"Read","tool_input":{"file_path":"E:/Ziratech/English-Prep-Web-Game/luyenthiao.com-Web/src/lib/utils.ts"},"cwd":"E:/Ziratech/English-Prep-Web-Game/luyenthiao.com-Web"}'
echo "$P" | node .claude/hooks/guard.mjs PreToolUse; echo "exit=$? (owner machine: expect no output)"
TMPH="$(mktemp -d)"; mkdir -p "$TMPH/.claude/state/guard"
echo "$P" | GUARD_HOME="$(cygpath -m "$TMPH")" GUARD_STATE_DIR="$(cygpath -m "$TMPH")/.claude/state/guard" node .claude/hooks/guard.mjs PreToolUse; echo; echo "exit=$? (teammate: expect a deny JSON)"
```
Expected: first call prints nothing; second prints a JSON with `"permissionDecision":"deny"` and a graphify hint (the repo is indexed, so it is the graph gate) and no `~/.claude/hooks` path.

- [ ] **Step 9: Write `.claude/hooks/VENDORED.md`**
```markdown
# Vendored guard

`guard.mjs`, `guard-lib/` and `tests/` are a copy of the owner's user-level guard
(`~/.claude/hooks/` on the host machine; design: `~/.claude/docs/superpowers/specs/2026-11-14-agent-guard-hooks-design.md`),
copied on 2026-11-15, so teammates get the same enforcement.

## Behavior

- Registered in `.claude/settings.json` for SessionStart, UserPromptSubmit, PreToolUse, PostToolUse,
  SubagentStart and Stop.
- Stands down (no output, exit 0) when `GUARD_PROJECT=0` or when `~/.claude/settings.json` /
  `settings.local.json` registers another `guard.mjs` (a user-level guard). See `guard-lib/dedup.mjs`.
- State lives in `~/.claude/state/guard/` on each machine; nothing is written into the repo.
  Kill switch: create `~/.claude/state/guard/disabled`.

## Adaptations from the host copy

1. `guard.mjs`: calls `shouldStandDown()` from `guard-lib/dedup.mjs` before running a hook handler.
2. `guard-lib/dedup.mjs`: new.
3. `guard-lib/handlers.mjs`: decline hint uses this file's absolute path; rule references point to
   `.claude/rules/tooling.md` of this repo; `.claude/superpowers/` is exempt from the brainstorm gate.
4. `guard-lib/project.mjs`: a project-level `.claude/skills/graphify` satisfies the graphify skill check.
5. `tests/project.test.mjs`: new tests for 1–4.

## Resync

1. Copy `~/.claude/hooks/guard.mjs`, `guard-lib/*.mjs`, `tests/*.mjs` over these files (keep `dedup.mjs`
   and `tests/project.test.mjs`).
2. Re-apply adaptations 1, 3 and 4.
3. Run `node --test .claude/hooks/tests/guard.test.mjs .claude/hooks/tests/project.test.mjs`.
```

- [ ] **Step 10: Commit**
```bash
cd "$REPO" && git add .claude/hooks && git status --short && git commit -m "chore(ai): vendor the guard hooks with project-level dedup"
```

---

### Task 2: Register the vendored guard

- [ ] **Step 1:** Replace the whole content of `.claude/settings.json` with:
```json
{
  "hooks": {
    "SessionStart": [
      { "hooks": [{ "type": "command", "command": "node \"${CLAUDE_PROJECT_DIR}/.claude/hooks/guard.mjs\" SessionStart", "timeout": 10 }] }
    ],
    "UserPromptSubmit": [
      { "hooks": [{ "type": "command", "command": "node \"${CLAUDE_PROJECT_DIR}/.claude/hooks/guard.mjs\" UserPromptSubmit", "timeout": 10 }] }
    ],
    "PreToolUse": [
      {
        "matcher": "Read|Grep|Glob|Bash|Edit|Write|MultiEdit|NotebookEdit|Agent|Task|mcp__codegraph__.*",
        "hooks": [{ "type": "command", "command": "node \"${CLAUDE_PROJECT_DIR}/.claude/hooks/guard.mjs\" PreToolUse", "timeout": 10 }]
      }
    ],
    "PostToolUse": [
      {
        "matcher": "Read|Bash|Skill|Edit|Write|MultiEdit|NotebookEdit|mcp__codegraph__.*",
        "hooks": [{ "type": "command", "command": "node \"${CLAUDE_PROJECT_DIR}/.claude/hooks/guard.mjs\" PostToolUse", "timeout": 10 }]
      }
    ],
    "SubagentStart": [
      { "hooks": [{ "type": "command", "command": "node \"${CLAUDE_PROJECT_DIR}/.claude/hooks/guard.mjs\" SubagentStart", "timeout": 10 }] }
    ],
    "Stop": [
      { "hooks": [{ "type": "command", "command": "node \"${CLAUDE_PROJECT_DIR}/.claude/hooks/guard.mjs\" Stop", "timeout": 10 }] }
    ]
  }
}
```
- [ ] **Step 2:** Verify the matchers equal the host's: `node -e "const h=require('$HOSTC/settings.json').hooks, p=require('$REPO/.claude/settings.json').hooks; for (const e of Object.keys(p)) console.log(e, JSON.stringify(h[e].map(g=>g.matcher||'')), JSON.stringify(p[e].map(g=>g.matcher||'')))"` → the PreToolUse/PostToolUse matcher strings are identical (host UserPromptSubmit also has the codegraph prompt-hook entry, intentionally not copied).
- [ ] **Step 3:** `node -e "JSON.parse(require('fs').readFileSync('$REPO/.claude/settings.json','utf8'));console.log('ok')"` → `ok`.
- [ ] **Step 4: Commit**
```bash
cd "$REPO" && git add .claude/settings.json && git commit -m "chore(ai): register the vendored guard in project settings"
```

---

### Task 3: Rules and agents

Read each source fully before writing. Port means: translate Vietnamese to English, keep structure and substance, replace project-specific facts as listed, remove anything that does not apply. Do not invent facts about this repo; use only facts from `.claude/ARCHITECTURE.md` (Task 4 content below), `docs/`, `src/package.json`, and this plan.

- [ ] **Step 1: `.claude/rules/git.md`** — copy `$HOSTC/rules/git-workflow.md`; change the title to `# Rule: Git Workflow (luyenthiao.com-Web)`; change "Applies to every git operation in every project." to "Applies to every git operation in this repository."; in section 4 replace "`main` / `master` / `develop`" with "`main` / `dev`" (this repo's remote branches are `main` and `dev`). Everything else verbatim.
- [ ] **Step 2: `.claude/rules/research.md`** — copy `$HOSTC/rules/research-standards.md` verbatim except the title `# Rule: Research Standards (luyenthiao.com-Web)`; in step 2 "Domain" bullet replace "(e.g. AWS skills, `claude-api`)" with "(e.g. `tailwind-4-docs`, `vercel-react-best-practices`)".
- [ ] **Step 3: `.claude/rules/tooling.md`** — copy `$HOSTC/rules/tooling-and-skills.md` and apply:
  - Title `# Rule: Tooling, Skills and Token Economy (luyenthiao.com-Web)`.
  - Scope paragraph: "Applies to every agent and subagent working in this repository. Enforced in part by the vendored guard `.claude/hooks/guard.mjs` (see `.claude/hooks/VENDORED.md`), which stays silent when a user-level guard is installed."
  - Section 2 step 2/3: `node ~/.claude/hooks/guard.mjs status|decline` → `node .claude/hooks/guard.mjs status|decline`.
  - Section 3: install locations "1. This repo: `.claude/skills/<name>/`. 2. The user-level copy at `~/.claude/skills/<name>/`."
  - Section 5: emergency switch stays `~/.claude/state/guard/disabled`; add "`GUARD_PROJECT=0` silences only the vendored guard."
- [ ] **Step 4: `.claude/rules/verification.md`** — port `$ZONEY/.claude/rules/kiem-chung.md` ("three tiers"). Mapping: tier 1 automated tests → `npx tsc --noEmit`, `npm run lint`, `npm test` in `src/` (compare against the known baseline in `docs/03-known-issues.md`); tier 2 "call the real API over HTTP" → "exercise the running app": `npm run dev` in `src/` and drive the affected route in a browser or Playwright; when the change touches `src/lib/api-client.ts`, auth hooks or anything calling the backend, run `luyenthiao.com-Backend` (branch `develop`) and call it through the app; tier 3 nginx/proxy → drop (no proxy layer in this repo); keep the general principles section.
- [ ] **Step 5: `.claude/rules/agent-roles.md`** — port `$ZONEY/.claude/rules/phan-vai-agent.md`. Mapping: role table uses the four agents of Step 8–11 (runner on `sonnet`); the section "when NOT to call Haiku" becomes "Model routing": superpowers chains and automated fixing use Sonnet minimum, Opus for architecture/review; Haiku is not used in this repo's agent chains; Zoney repo names/commands → this repo (`src/`, npm commands); keep the execution loop, hard rules, status handling, hard boundaries, "brief the subagent fully" and technical limits sections; add the graphify → codegraph → raw-read order to the briefing section and "put repo path and `file:line` ranges in the prompt".
- [ ] **Step 6: `.claude/rules/animation-matrix.md`**
```bash
cd "$REPO" && git mv .claude/skills/web-clone/references/animation-matrix.md .claude/rules/animation-matrix.md
```
Then edit it: remove list item 4 of the procedure ("Phase 5 confirms: gates green, …"); change the heading "Three performance rules (machine-checked as gates A6/A7)" to "Three performance rules"; delete "— gate **A6**" and "— gate **A7**"; keep all other text. `grep -n "gate\|Phase" .claude/rules/animation-matrix.md` → only matches that are not about web-clone gates/phases (report any remaining).
- [ ] **Step 7: Update existing rules**
  - `coding.md`: replace the animation bullet's path with `.claude/rules/animation-matrix.md`; replace "(gate A6)", "(gate A7)", "(gate A8)" with nothing; replace "Prettier auto-sorts classes — run `npm run format` before committing." with "Prettier auto-sorts classes — run `npx prettier --write <file>` in `src/` on the files you changed (never repo-wide; see `docs/02-setup-and-environment.md`)."; in "Barrel exports" add "- Exception: components that only need the exam part renderers import `@/components/exam/parts` directly — the `@/components/exam` barrel re-exports page-level components that pull large mock data."; under the page.tsx section add "- Known debt: nine dashboard/result pages still contain client UI (see `docs/03-known-issues.md`); do not copy that pattern." Keep everything else.
  - `workflow.md`: "## Format & Lint Before Finishing" block becomes:
    ```bash
    cd src
    npx prettier --write <changed files>
    npm run lint
    npx tsc --noEmit
    npm test
    npm run build   # fails until the missing mocks are rebuilt; see docs/03-known-issues.md
    ```
    In "Adding a shadcn/ui Component" add `cd src` before the commands. Add a first section "## Where things go" with: specs `.claude/superpowers/specs/YYYY-MM-DD-<topic>-design.md`, plans `.claude/superpowers/plans/YYYY-MM-DD-<topic>.md`.
  - `extension-fallback.md` section 2: replace with "1. Try `graphify query \"<question>\" --budget 1500` (map). 2. Then `mcp__codegraph__codegraph_explore` (precise symbols). 3. Only then `Grep` → `Glob` → `Read`."; keep the rest.
  - `skill-fallback-table.md`: `tailwind-4-docs` row → "Use v4 syntax only; colors through theme tokens (`bg-(--token)`), no arbitrary color values; no `theme()` in classes".
- [ ] **Step 8–11: Agents** — port each `$ZONEY/.claude/agents/<name>.md` to `.claude/agents/<name>.md`, keeping the frontmatter keys. Common mapping for all four: translate to English; "Ngữ cảnh dự án"/project context → this repo (Next.js in `src/`, commands from `src/`, known baseline in `docs/03-known-issues.md`, rules in `.claude/rules/`); code reading section → graphify `query --budget` → `codegraph_explore` (projectPath = repo root) → raw reads; commit rule → "only when the controller says the owner approved; message exactly as given; never `Co-Authored-By` or AI attribution"; remove Laravel/PHP/Pest/Pint/Filament/Expo/nginx/Zoney specifics.
  - `implementer.md`: frontmatter `tools: Read, Write, Edit, Grep, Glob, Bash, Skill, Agent(runner), mcp__codegraph__*`, `model: sonnet`.
  - `spec-reviewer.md`: `tools: Read, Grep, Glob, Bash, mcp__codegraph__*`, `model: sonnet`.
  - `code-reviewer.md`: `tools: Read, Grep, Glob, Bash, WebSearch, WebFetch, mcp__codegraph__*`, `model: opus`. Replace the "places that caused real bugs in this project" list with: client/server boundary and barrel imports pulling client modules or large mocks into bundles; `src/lib/env.ts` throwing in production builds; `authFetch` single-flight refresh and 401 retry; `localStorage` access during SSR; route handlers resolving paths from `process.cwd()` (= `src/`); import-order lint; missing-mock baseline (do not "fix" by inventing data).
  - `runner.md`: `tools: Bash, Read`, `model: sonnet` (was haiku); environment notes: Git Bash on Windows, run npm in `src/`, never kill a dev server it did not start.
- [ ] **Step 12: Verify**
```bash
cd "$REPO" && for f in .claude/agents/*.md; do head -6 "$f" | grep -E "^(name|model):"; done
grep -rnE "Laravel|PHP|Pest|Pint|Filament|Zoney|haiku|tooling-and-skills|~/.claude/hooks|web-clone|gates|/tmp" .claude/rules .claude/agents || echo "clean"
grep -rnP "[\x{00C0}-\x{1EF9}]" .claude/rules .claude/agents | head -5 || true
```
Expected: four `name`/`model` pairs (implementer sonnet, spec-reviewer sonnet, code-reviewer opus, runner sonnet); `clean`; no Vietnamese diacritics (the last grep prints nothing; if `-P` is unsupported, skip and state it).
- [ ] **Step 13: Commit**
```bash
cd "$REPO" && git add .claude/rules .claude/agents && git status --short && git commit -m "docs(ai): rewrite rules and add agent definitions"
```

---

### Task 4: AGENTS.md, CLAUDE.md, ARCHITECTURE.md

- [ ] **Step 1: Create `AGENTS.md`**
````markdown
# AGENTS.md — luyenthiao.com-Web

Guidance for every AI coding agent working in this repository (format: https://agents.md).
Claude Code reads it through `@AGENTS.md` in `CLAUDE.md`.

## Project

Web client of luyenthiao.com, an online English test-preparation platform, built with Next.js
(App Router). The API is the separate repository `luyenthiao.com-Backend` (NestJS, branch `develop`).
Today only authentication talks to the backend; the other domains read `src/mocks/*.json` or
`localStorage`. Architecture: `.claude/ARCHITECTURE.md`. Human docs: `docs/`.

The Next.js project lives in `src/`; the repository root holds only metadata.

## Language

- Everything persisted in the repository is English: code, identifiers, comments, docs, specs,
  plans, commit messages, test names.
- Everything addressed to the user (explanations, questions, reports) is Vietnamese.
- Never translate identifiers, API names, CLI flags, error strings or code when reporting.

## Honesty

- Do not fabricate knowledge. When unsure, search the code, read the docs, or ask.
- Do not turn speculation into a statement. If speculation is unavoidable, start with
  `⚠️ [SPECULATION]: …` and say what it is based on and what is missing.
- Do not claim something is done or passing without running the check. Say which checks were not run.
- Separate what is verified, inferred and unknown.

## Non-negotiable rules

1. **Spec before code.** No implementation until the design is approved by the user.
2. **Brainstorm first**, even for tasks that look simple.
3. **Automated tests are not enough to claim done.** Exercise the real path
   (`.claude/rules/verification.md`).
4. **Git writes only on explicit request.** Read-only commands are free; `add`, `commit`, branch
   operations, `push`, `pull`, `fetch` and any writing `gh` command need approval
   (`.claude/rules/git.md`).
5. **Commit messages:** English, Conventional Commits, one line, never a `Co-Authored-By` trailer or any
   AI attribution.
6. **Research before answering** about libraries, APIs and error messages (`.claude/rules/research.md`).

## Commands (run in `src/`)

```bash
npm ci
npm run dev                     # http://localhost:3000
npx tsc --noEmit                # baseline: 15 known errors, see docs/03-known-issues.md
npm run lint                    # baseline: 8 known import-order errors
npm test                        # must pass
npm run build                   # fails until the missing mocks are rebuilt
npx prettier --write <file>     # format only the files you changed
```

## Never

- Run `npm run format` (repo-wide Prettier) — it rewrites many unrelated files.
- Edit files outside the scope of the task. Note problems elsewhere; do not fix them unasked.
- Change names, fields, thresholds or error codes fixed by an approved spec or plan.
- Create mock data or assets to make an error disappear without a task for it.
- Stop a dev server or process you did not start.
````
- [ ] **Step 2: Replace `CLAUDE.md`**
````markdown
@AGENTS.md

# CLAUDE.md — Claude Code layer

`AGENTS.md` above is shared by every agent. This file adds what only Claude Code has.

## Superpowers — required for every task

Invoke the matching superpowers skill before writing code or files: brainstorming → writing-plans →
subagent-driven-development (or executing-plans); systematic-debugging for bugs;
verification-before-completion before claiming done. "Simple task" is not a reason to skip.

## Hard rules

1. **Explore in order:** `graphify query "<question>" --budget 1500` (map) → `codegraph_explore`
   (symbols, `projectPath` = this repo) → raw reads only for what is still missing. Skip a step whose tool is not installed (`.claude/rules/tooling.md` §1).
2. **Two-stage review** after every task: spec compliance first, then code quality — separate passes.
3. **Role split:** the main (Opus) session analyses, writes specs and plans, and supervises; once a plan
   exists it does not write code — it dispatches agents. See `.claude/rules/agent-roles.md`.
4. **One subagent per task**; never two implementers in parallel on the same tree.

## Read when

| File | When |
|---|---|
| `.claude/ARCHITECTURE.md` | Before any task that touches code |
| `.claude/rules/coding.md` | Writing or reviewing code |
| `.claude/rules/workflow.md` | Planning work, adding pages or shadcn components |
| `.claude/rules/animation-matrix.md` | Adding motion |
| `.claude/rules/verification.md` | Before saying "done" |
| `.claude/rules/agent-roles.md` | Before dispatching agents |
| `.claude/rules/git.md` | Before any git command |
| `.claude/rules/research.md` | Questions about libraries, APIs, errors |
| `.claude/rules/tooling.md` | Missing tooling, new skills/plugins, token economy |
| `.claude/rules/extension-fallback.md` | Running in an IDE extension where skills/hooks/MCP are unavailable |
| `docs/03-known-issues.md` | Before trusting `tsc`, lint or build results |

## Agents

| Agent | Model | Use for |
|---|---|---|
| `implementer` | Sonnet | Writing code from an approved plan |
| `spec-reviewer` | Sonnet | Review stage 1: does the change match the spec/plan |
| `code-reviewer` | Opus | Review stage 2: quality, logic, edge cases |
| `runner` | Sonnet | Running commands with long output and returning a summary |

Definitions: `.claude/agents/*.md`. Edits are hot-reloaded; restart only once, after `.claude/agents/` is created for the first time.

## Guard hook

`.claude/hooks/guard.mjs` (registered in `.claude/settings.json`) enforces the exploration order, the
brainstorm-before-edit rule and tooling setup. Add `#quick` to a prompt to bypass the brainstorm gate for a
trivial edit. It is silent when a user-level guard is installed or `GUARD_PROJECT=0`. Kill switch:
`~/.claude/state/guard/disabled`. Details: `.claude/hooks/VENDORED.md`.

## Skills

Project skills live in `.claude/skills/` (UI foundations, design taste, animation, `graphify`,
`full-output-enforcement`). Invoke every relevant one; there is no limit on combining them.

---

This file must stay under 200 lines. New rules go into `.claude/rules/<name>.md` plus one row in the
"Read when" table.
````
- [ ] **Step 3: Replace `.claude/ARCHITECTURE.md`**
````markdown
# Architecture — luyenthiao.com-Web

## Overview

Next.js App Router client for luyenthiao.com (online English test preparation). The Next.js project is
`src/`; run every npm command there. Backend: `luyenthiao.com-Backend` (NestJS). Only authentication is
wired to the backend; exams, history, notebook, ranking, tasks, speaking and writing use `src/mocks/*.json`
and `localStorage`. Known defects and baselines: `docs/03-known-issues.md`.

## Stack (from `src/package.json`)

| Layer | Choice |
|---|---|
| Runtime | Node ≥ 20, npm |
| Framework | Next.js 16.1.6 (App Router), React 19.2.3, `output: 'standalone'` |
| Language | TypeScript strict |
| Styling | Tailwind CSS v4 (`@theme` tokens in `app/globals.css`), shadcn-style primitives on `@base-ui/react` |
| Server data | TanStack Query 5 |
| Client state | Zustand 5 |
| Validation / forms | Zod 4, react-hook-form |
| Tests | Vitest 4 + Testing Library (jsdom), tests next to the module |
| Lint / format | ESLint 9 flat config (`import-x/order`), Prettier (`src/.prettierrc`, `src/.prettierignore`) |

## Request path

- Browser → `apiFetch` / `authFetch` in `lib/api-client.ts` → backend at `NEXT_PUBLIC_API_URL`.
- `authFetch` retries once after a 401 by calling `/auth/refresh` through `refreshSession()`, which is
  single-flight (concurrent callers share one refresh).
- Session (`accessToken`, `user`, `status`) lives in memory in `store/auth-store.ts` (`useAuthStore`), not
  persisted; `providers/auth-provider.tsx` bootstraps it; `providers/query-provider.tsx` provides TanStack Query.
- Route handler `app/api/admin/media/route.ts` lists files under `public/clone-assets` (resolved from
  `process.cwd()`, i.e. `src/`) for the admin media picker.
- `lib/env.ts`: `NEXT_PUBLIC_API_URL` and `NEXT_PUBLIC_APP_URL` default to localhost in development and are
  required in production (it throws if missing).

## `src/` structure

| Directory | Contents |
|---|---|
| `app/` | Routes, layouts, `robots.ts`, `sitemap.ts`, route handlers in `app/api/` |
| `components/ui/` | Primitives (button, card, dialog, game-button, game-input) |
| `components/common/` | App-wide: `Topbar`, `BottomNav`, `ThemeProvider` |
| `components/<domain>/` | `admin`, `auth`, `dashboard`, `exam` (+ `exam/parts`), `ranking`, `speaking`, `testlevels`, `writing` |
| `hooks/` | Flat `use-*.ts`; auth mutation hooks re-exported from `hooks/index.ts`; `use-media-library.ts` |
| `lib/` | `api-client.ts`, `env.ts`, `utils.ts` (`cn`), `fonts.ts`, `exam.ts` (exam helpers barrel), `exam-*.ts`, `admin-*.ts` |
| `schemas/` | Zod schemas (`exam.ts`) |
| `store/` | `auth-store.ts`, `exam-store.ts`, `exam-editor-store.ts` |
| `providers/` | `auth-provider.tsx`, `query-provider.tsx` |
| `constants/` | `ROUTES`, app constants, demo test paths |
| `types/` | `auth.ts`, `exam.ts`, `speaking.ts`, `writing.ts`, shared types |
| `mocks/` | JSON mock data (five files are missing — see known issues) |
| `public/` | Static files; `public/clone-assets/` are third-party assets to be replaced |

## Routes

| Route | Components |
|---|---|
| `/` (`app/(dashboard)/page.tsx`), `/history`, `/notebook`, `/notifications`, `/placement-test`, `/tasks` | inline in the page (known debt) inside `app/(dashboard)/layout.tsx` (`Topbar`, `BottomNav`) |
| `/ranking`, `/school-ranking` | `components/ranking` |
| `/login`, `/signup`, `/forgot-password`, `/reset-password`, `/account/change-password` | `components/auth` |
| `/admin/exam`, `/admin/exam/[id]` | `components/admin` |
| `/check-point/[id]` | `components/exam` (`ExamCheckpoint`) |
| `/testresult` | inline in the page (known debt), `components/ui` |
| `/testlevels/[level]` | `components/testlevels` |
| `/speaking/[slug]`, `/speaking/result/[id]`, `/speaking/result/[id]/preview` | `components/speaking` |
| `/write/[slug]`, `/write/result/[id]` | `components/writing` |

## Conventions

- `page.tsx` is a server component that only assembles components (5-part pattern in
  `.claude/rules/coding.md`).
- Import through `@/` (maps to `src/`); every `components/<dir>/` has an `index.ts` barrel. Exception:
  import `@/components/exam/parts` directly when only part renderers are needed.
- State: server data in TanStack Query, cross-component client state in Zustand, local state in
  `useState`.

## AI tooling

`AGENTS.md`, `CLAUDE.md`, `.claude/rules/`, `.claude/agents/`, `.claude/skills/`, the vendored guard in
`.claude/hooks/` (`VENDORED.md`), and superpowers specs/plans in `.claude/superpowers/`.
Newer Next.js versions generate `src/AGENTS.md` with framework rules (Zoney.vn-Web on Next 16.4.3 has
one; 16.1.6 used here does not); review it when upgrading.
````
- [ ] **Step 4: Verify links and facts**
```bash
cd "$REPO" && for p in $(grep -ohE '`(\.claude|docs|src)/[^` ]+`' AGENTS.md CLAUDE.md .claude/ARCHITECTURE.md .claude/rules/*.md .claude/agents/*.md | tr -d '`' | sed 's/[),.:]$//' | sort -u); do [ -e "$p" ] || echo "MISSING $p"; done
for p in $(grep -ohE '`(app|components|lib|hooks|schemas|store|providers|constants|types|mocks|public)/[^` ]*`' .claude/ARCHITECTURE.md | tr -d '`' | sort -u); do [ -e "src/$p" ] || echo "MISSING src/$p"; done
wc -l CLAUDE.md AGENTS.md
```
Expected: no `MISSING` lines except paths that intentionally name patterns (`.claude/rules/<name>.md`, `YYYY-MM-DD` templates) — list and justify each one; `CLAUDE.md` < 200 lines.
- [ ] **Step 5: Commit**
```bash
cd "$REPO" && git add AGENTS.md CLAUDE.md .claude/ARCHITECTURE.md && git commit -m "docs(ai): add AGENTS.md and rewrite CLAUDE.md and ARCHITECTURE.md"
```

---

### Task 5: Skills

- [ ] **Step 1: Archive and remove web-clone**
```bash
cd "$REPO" && mkdir -p "$ARCH/.claude/skills"
git archive HEAD .claude/skills/web-clone | tar -x -C "$ARCH"
ls "$ARCH/.claude/skills/web-clone" && git rm -r -q .claude/skills/web-clone && rm -rf .claude/skills/web-clone
```
- [ ] **Step 2: Add graphify**
```bash
cp -r "$HOSTC/skills/graphify" "$REPO/.claude/skills/graphify"
ls "$REPO/.claude/skills" | wc -l; for d in "$REPO"/.claude/skills/*/; do [ -f "$d/SKILL.md" ] || echo "NO SKILL.md $d"; done
```
Expected: `35`, no `NO SKILL.md` lines.
- [ ] **Step 3: Mirror to the host**
```bash
for d in "$REPO"/.claude/skills/*/; do n=$(basename "$d"); t="$HOSTC/skills/$n";
  if [ ! -e "$t" ]; then cp -r "$d" "$t" && echo "COPIED $n";
  elif diff -rq "$d" "$t" >/dev/null; then echo "SAME $n";
  else echo "DIFFERENT $n"; fi; done
```
Expected: `COPIED` or `SAME` for each. Any `DIFFERENT` line: do not overwrite; report it to the owner with `diff -rq` output.
- [ ] **Step 4:** `grep -rln "web-clone" "$REPO/.claude" "$REPO/AGENTS.md" "$REPO/CLAUDE.md" | grep -v superpowers || echo "no web-clone references"`.
- [ ] **Step 5: Commit**
```bash
cd "$REPO" && git add -A .claude/skills && git status --short | head && git commit -m "chore(ai): replace web-clone skill with graphify"
```

---

### Task 6: Docs

- [ ] **Step 1:** In `docs/02-setup-and-environment.md`, append:
````markdown

## AI tooling

The repository ships AI agent guidance (`AGENTS.md`, `CLAUDE.md`, `.claude/`). To use it with Claude Code:

- Start Claude Code inside `luyenthiao.com-Web` (the guard in `.claude/hooks/` is not loaded from a
  parent folder).
- Install the superpowers plugin: `/plugin install superpowers@claude-plugins-official`.
- Install the code-graph tools: `npm i -g @colbymchenry/codegraph` and `uv tool install graphifyy`
  (or `pip install graphifyy`). On first use the guard asks to index the repo, or lets you decline.
- Node ≥ 20 is required for the guard hooks.
````
- [ ] **Step 2:** In `docs/03-known-issues.md`, append:
````markdown

## 7. AI guidance

`AGENTS.md`, `CLAUDE.md` and `.claude/` describe the layout as of the phase 1 restructure
(2026-11-15). Update them when the layout changes.
````
- [ ] **Step 3: Commit**
```bash
cd "$REPO" && git add docs && git commit -m "docs: document AI tooling prerequisites"
```

---

### Task 7: Final verification (no commits)

- [ ] `cd "$REPO" && node --test .claude/hooks/tests/guard.test.mjs .claude/hooks/tests/project.test.mjs 2>&1 | tail -6` → all pass.
- [ ] Repeat Task 1 Step 8 smoke tests → owner machine silent, teammate simulation denies.
- [ ] Repeat Task 4 Step 4 link check and Task 3 Step 12 grep → clean.
- [ ] `cd "$REPO/src" && npx tsc --noEmit 2>&1 | grep -c "error TS"` → `15`; `npm test` → 3 files / 22 tests; `npx eslint . 2>&1 | tail -2` → 8 errors (baseline).
- [ ] `git -C "$REPO" status --short` empty; `git -C "$REPO" log --format=%B refactor/zoney-structure..HEAD | grep -ciE "co-authored|generated with"` → `0`.
- [ ] Ask the owner to start a new Claude Code session inside `luyenthiao.com-Web` and confirm `CLAUDE.md`/`AGENTS.md` load and no hook errors appear.
