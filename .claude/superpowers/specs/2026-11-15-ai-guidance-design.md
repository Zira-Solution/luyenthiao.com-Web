# Phase 2 — AI guidance for luyenthiao.com-Web

- **Date:** 2026-11-15
- **Repo:** `luyenthiao.com-Web`, work branch `chore/ai-guidance` created from `refactor/zoney-structure`
  (phase 1, not merged yet; this guidance describes the phase 1 layout)
- **Sources combined:** the host machine setup (`~/.claude/CLAUDE.md`, `~/.claude/rules/*.md`,
  `~/.claude/hooks/guard.mjs` + `guard-lib/`, design `~/.claude/docs/superpowers/specs/2026-11-14-agent-guard-hooks-design.md`)
  and the Zoney.vn layout (`Zoney.vn/AGENTS.md`, `Zoney.vn/CLAUDE.md`, `Zoney.vn/.claude/{agents,rules}`,
  `Zoney.vn/Zoney.vn-Web/{CLAUDE.md,.claude/}`)
- **Status:** design approved in conversation, pending written-spec review

## 1. Goal

Replace the outdated AI guidance copied from Zoney.vn-Web (old layout, `web-clone` tooling, a blocking
codegraph hook using `/tmp`) with guidance that:

1. describes this repo as it is after phase 1;
2. follows the host machine's rules (graphify → codegraph → raw reads, brainstorm before edits, git
   permission tiers, research standards, skill dual install, English artifacts / Vietnamese reports);
3. follows the Zoney file structure (AGENTS.md + CLAUDE.md, `.claude/{ARCHITECTURE.md,rules,agents,skills,hooks}`);
4. enforces the host rules for teammates whose machines do not have the host guard, without double
   enforcement on the owner's machine.

## 2. Non-goals

- Workspace root (`English-Prep-Web-Game/`) and the Backend repo get no guidance in this phase.
- No change to application code under `src/`; `tsc`/tests/lint results must stay identical to the end
  of phase 1.
- No change to the host files under `~/.claude/` except adding skill mirrors (section 7).
- No Next.js upgrade. Next 16.1.6 does not generate `AGENTS.md` (verified: no
  `generate-agent-files` in `src/node_modules/next/dist/server/lib/`); Zoney's `src/AGENTS.md` comes from
  Next 16.4.3. Recorded as a note for a future upgrade.

## 3. Target layout

```
luyenthiao.com-Web/
├─ AGENTS.md                  # new — vendor-neutral context for any AI agent
├─ CLAUDE.md                  # rewritten — @AGENTS.md + Claude-only layer, ≤ 200 lines
└─ .claude/
   ├─ ARCHITECTURE.md         # rewritten from the actual code
   ├─ rules/
   │  ├─ coding.md            # updated
   │  ├─ workflow.md          # updated
   │  ├─ animation-matrix.md  # moved from .claude/skills/web-clone/references/animation-matrix.md
   │  ├─ git.md               # port of ~/.claude/rules/git-workflow.md
   │  ├─ research.md          # port of ~/.claude/rules/research-standards.md
   │  ├─ tooling.md           # port of ~/.claude/rules/tooling-and-skills.md
   │  ├─ verification.md      # port of Zoney.vn/.claude/rules/kiem-chung.md
   │  ├─ agent-roles.md       # port of Zoney.vn/.claude/rules/phan-vai-agent.md
   │  ├─ extension-fallback.md   # kept, updated
   │  └─ skill-fallback-table.md # kept, updated
   ├─ agents/
   │  ├─ implementer.md       # port of Zoney.vn/.claude/agents/implementer.md (model: sonnet)
   │  ├─ spec-reviewer.md     # port (model: sonnet)
   │  ├─ code-reviewer.md     # port (model: opus)
   │  └─ runner.md            # port; model changed from haiku to sonnet (host rule: no Haiku in superpowers chains)
   ├─ hooks/
   │  ├─ guard.mjs            # vendored from ~/.claude/hooks/guard.mjs + project-level dedup (section 5)
   │  ├─ guard-lib/*.mjs      # vendored, adapted (section 5.3)
   │  ├─ tests/*.mjs          # vendored + new tests (section 8)
   │  └─ VENDORED.md          # source, date, adaptations, resync procedure
   ├─ settings.json           # rewritten: registers the vendored guard only
   ├─ skills/                 # 34 skills (section 7)
   └─ superpowers/{specs,plans}/   # unchanged location
```

All files are written in English (host rule: artifacts persisted in a repo are English). Rules about
reporting to the user in Vietnamese are stated inside AGENTS.md.

Removed: `.claude/skills/web-clone/` (archived to `English-Prep-Web-Game/archive/luyenthiao.com-Web/.claude/skills/web-clone/`
before `git rm`, same procedure as phase 1), and the current `.claude/settings.json` hook set
(SessionStart `rm -f /tmp/codegraph-used`, PreToolUse codegraph tracker and Read/Glob/Grep blocker).

## 4. File contents

Every statement must be verifiable against the repo, the host files or the Zoney files; no TODO or
placeholder text. Where a fact is uncertain it is omitted rather than guessed.

### 4.1 `AGENTS.md` (~80–110 lines; modelled on `Zoney.vn/AGENTS.md`)

- Project: luyenthiao.com web client (Next.js); backend is the separate `luyenthiao.com-Backend` repo
  (NestJS, branch `develop`); only auth is wired to the backend today, other domains use `src/mocks/`
  and `localStorage`.
- Language: all artifacts (code, comments, commit messages, docs, specs, plans) in English; all
  communication with the user in Vietnamese; technical identifiers never translated.
- Honesty: no fabrication; speculation prefixed `⚠️ [SPECULATION]: …`; never claim done without running
  the checks; separate verified / inferred / unknown.
- Non-negotiable rules: spec before code; brainstorm before anything; automated tests are not enough to
  claim done (run the real path); git write operations only on explicit request (tiers in
  `.claude/rules/git.md`); commit messages English, Conventional Commits, never any `Co-Authored-By` or AI
  attribution.
- Commands (all in `src/`): `npm ci`, `npm run dev`, `npx tsc --noEmit`, `npm run lint`, `npm test`,
  `npm run build`, `npx prettier --write <file>`.
- Never: run `npm run format` repo-wide; edit files outside the task scope; change names, thresholds or
  error codes fixed by an approved spec/plan; touch `src/public/clone-assets/` content without a task;
  kill a dev server you did not start.
- Pointer to `docs/03-known-issues.md` (missing mocks → 15 tsc errors, build failure).

### 4.2 `CLAUDE.md` (≤ 200 lines; modelled on `Zoney.vn/CLAUDE.md`)

- First line `@AGENTS.md`.
- Superpowers mandatory for every task (brainstorming → writing-plans → subagent-driven-development or
  executing-plans; systematic-debugging for bugs; verification-before-completion).
- Hard rules: graphify → codegraph → raw reads (per-repo indexes); two-stage review (spec compliance,
  then code quality); role split (Opus analyses/plans/supervises and does not write code once a plan
  exists; Sonnet implements); one subagent per task.
- Reference table "read when": `.claude/ARCHITECTURE.md` (before any code task), each rule file,
  `docs/03-known-issues.md`.
- Agents table (name, model, when) for the four agents; note that editing an agent file requires a new
  session.
- Guard note: what the vendored guard enforces, `#quick`, kill switch, `GUARD_PROJECT=0`, and that it
  is silent when a user-level guard is installed.
- Footer rule: the file must stay ≤ 200 lines; new rules go to `.claude/rules/<name>.md` plus one table
  row.

### 4.3 `.claude/ARCHITECTURE.md`

- Purpose and audience as far as the repo states them; stack table with installed versions read from
  `src/package.json` (Next 16.1.6, React 19.2.3, Tailwind 4, TanStack Query 5, Zustand 5, Zod 4,
  react-hook-form, Vitest 4).
- Request path: browser → `apiFetch` / `authFetch` (`src/lib/api-client.ts`) → backend
  `NEXT_PUBLIC_API_URL`; `authFetch` retries once on 401 via single-flight `/auth/refresh`; session in
  `useAuthStore` (memory only); `AuthProvider` bootstrap. Route handler `app/api/admin/media/route.ts`
  lists `public/clone-assets` files.
- `src/` structure (same as `docs/01-architecture.md`) and a route → component-directory table built
  from the actual `src/app/**/page.tsx` files.
- Conventions: page pattern, barrels, `@/components/exam/parts` exception, mocks, env rules
  (`src/lib/env.ts` throws in production when `NEXT_PUBLIC_*` are missing).
- Pointers to `docs/` and the rules.

### 4.4 Rules

| File | Content |
|---|---|
| `coding.md` | Keep still-valid rules of the current file (TS strict, named exports, explicit return types, `[Name]Props`, import order, kebab-case, Tailwind tokens and `cn()`, 3 state layers, page.tsx orchestrator rule, barrels). Change: paths to `src/`; animation reference → `.claude/rules/animation-matrix.md`; "run `npm run format` before committing" → "format only files you changed"; add the `@/components/exam/parts` exception; drop references to gates A6/A7/A8 of the web-clone skill but keep their substance (animate only transform/opacity, reduced motion, no arbitrary colors). |
| `workflow.md` | Superpowers flow; spec/plan locations `.claude/superpowers/{specs,plans}/`; commands from `src/`; new page process with `src/` paths; shadcn command run in `src/`. |
| `animation-matrix.md` | Moved verbatim from the web-clone skill, with any reference to the skill's own scripts removed. |
| `git.md` | Port of the host `git-workflow.md` (tiers A/B/C, approval semantics, commit message standard, forbidden trailers, branch safety, pre-commit checklist). |
| `research.md` | Port of the host `research-standards.md`. |
| `tooling.md` | Port of the host `tooling-and-skills.md`, with paths pointing to the vendored guard (`node .claude/hooks/guard.mjs status|decline`), skill install locations (`.claude/skills/<name>` + `~/.claude/skills/<name>`), token economy. |
| `verification.md` | Port of Zoney `kiem-chung.md`, translated to English and adapted to Next (real path = the running app via `npm run dev`, browser or Playwright). |
| `agent-roles.md` | Port of Zoney `phan-vai-agent.md`, translated, models per host routing rules. |
| `extension-fallback.md`, `skill-fallback-table.md` | Kept; references updated (no web-clone, graphify order). |

### 4.5 Agents

Ported from `Zoney.vn/.claude/agents/*.md`, translated to English where needed. Laravel/Zoney specifics
are replaced with this repo's commands and conventions. Each agent prompt includes the
graphify → codegraph → raw-read order and the commit-message rule. `runner` uses `sonnet`.

## 5. Vendored guard

### 5.1 Copy

Copy `~/.claude/hooks/guard.mjs`, `guard-lib/*.mjs`, `tests/*.mjs` into `.claude/hooks/`.
`VENDORED.md` records: source path, copy date, the list of adaptations below, and the resync procedure
(re-copy, re-apply adaptations, run tests).

### 5.2 Dedup with a user-level guard

At the top of `main()` in the vendored `guard.mjs`, before any handler runs (hook mode only; CLI
commands always work):

- If env `GUARD_PROJECT` is `0` → exit 0 without output.
- Read `<home>/.claude/settings.json` and `<home>/.claude/settings.local.json` (`home` = `GUARD_HOME`
  or `os.homedir()`); if any registered hook command references a file named `guard.mjs` whose resolved
  path is not this vendored file → exit 0 without output.
- Any error while checking → continue as the project guard (fail towards enforcement for teammates, but
  handlers themselves still fail open as today).

### 5.3 Adaptations

| Location (host source) | Change |
|---|---|
| `guard-lib/handlers.mjs:19` `DECLINE_CMD` | `node ~/.claude/hooks/guard.mjs decline "<root>"` → `node "<absolute path of the vendored guard.mjs>" decline "<root>"` (works even when `<root>` is another project) |
| `guard-lib/handlers.mjs:81` | reference `~/.claude/rules/tooling-and-skills.md` → `.claude/rules/tooling.md` |
| `guard-lib/handlers.mjs:187` | reference `rules/tooling-and-skills.md` → `.claude/rules/tooling.md` |
| `guard-lib/handlers.mjs:98` brainstorm exemption | also exempt paths matching `/\.claude\/superpowers\//` |
| `guard-lib/project.mjs:39` | graphify skill is satisfied if `<root>/.claude/skills/graphify` exists or `~/.claude/skills/graphify` exists |

State directory, kill switch (`~/.claude/state/guard/disabled`) and all other behavior stay as in the
host version.

### 5.4 Registration

`.claude/settings.json` registers the same six events and matchers as the host `settings.json`, with
commands `node "${CLAUDE_PROJECT_DIR}/.claude/hooks/guard.mjs" <Event>` and `timeout: 10`. The host's
`codegraph.cmd prompt-hook` entry is not included (Windows-only command). No other settings keys.

### 5.5 Teammate prerequisites (documented in `docs/02-setup-and-environment.md` and CLAUDE.md)

Node ≥ 20, the superpowers plugin (`/plugin install superpowers@claude-plugins-official`), codegraph
(`npm i -g @colbymchenry/codegraph`) and graphify (`uv tool install graphifyy` or `pip install graphifyy`);
without them the guard asks to install or to decline.

Known limitation: the vendored guard is active only when Claude Code is started inside
`luyenthiao.com-Web`; a session started at the workspace root does not load this repo's `.claude/`.

## 6. Docs updates

- `docs/02-setup-and-environment.md`: new section "AI tooling" with the prerequisites of 5.5.
- `docs/03-known-issues.md`: drop nothing; add a line that `.claude/` guidance describes the layout as
  of phase 1.
- README: no change.

## 7. Skills

Keep 34 skills: the current 35 minus `web-clone`, plus `graphify` copied from
`~/.claude/skills/graphify`. Before removal, `web-clone` is archived (section 3).

Mirror rule (host `tooling-and-skills.md` §3): every project skill also exists at
`~/.claude/skills/<name>`. For each of the 34: if absent on the host → copy; if present and identical →
nothing; if present and different (expected candidates: `frontend-design`, `graphify`) → do not
overwrite; list the difference and ask the owner.

## 8. Verification

1. `node --test .claude/hooks/tests/` passes, including the existing suite and new tests for: dedup
   (user-level guard registered → silent; not registered → enforces; `GUARD_PROJECT=0` → silent),
   adapted decline command and rule paths, project graphify skill satisfies the check,
   `.claude/superpowers/` exempt from the brainstorm gate.
2. Smoke on the owner's machine: pipe a `PreToolUse` Read payload for a code file into the vendored
   guard → no output, exit 0.
3. Smoke as a teammate: same payload with `GUARD_HOME` pointing to a temporary home without a
   user-level guard and `GUARD_STATE_DIR` to a temp dir → deny output with the adapted messages.
4. Link check: every path mentioned in `AGENTS.md`, `CLAUDE.md`, `.claude/ARCHITECTURE.md`,
   `.claude/rules/*.md`, `.claude/agents/*.md` exists; grep finds no `web-clone`, `gates`,
   `/tmp/codegraph`, `hooks/auth`, `lib/exam/`, `components/checkpoint`, `components/layout` in those
   files.
5. Skills: 34 directories each with a `SKILL.md`; mirrors present on the host or differences reported.
6. App unchanged: `tsc` still exactly the 15 known errors, `npm test` 3 files / 22 tests, lint no new
   entries.
7. Owner opens a new Claude Code session inside the repo and confirms CLAUDE.md/AGENTS.md load and no
   hook errors appear (cannot be done by an agent).

## 9. Commits

Branch `chore/ai-guidance` from `refactor/zoney-structure`. Each commit needs the owner's approval
(the owner may approve the list in one go, as in phase 1). Planned commits:

1. `chore(ai): vendor the guard hooks with project-level dedup`
2. `chore(ai): register the vendored guard in project settings`
3. `docs(ai): rewrite rules and add agent definitions`
4. `docs(ai): add AGENTS.md and rewrite CLAUDE.md and ARCHITECTURE.md`
5. `chore(ai): replace web-clone skill with graphify`
6. `docs: document AI tooling prerequisites`

## 10. Risks

| Risk | Mitigation |
|---|---|
| Dedup check misdetects and both guards run on the owner's machine | test with the owner's real `~/.claude/settings.json` (smoke 2) |
| Dedup check misdetects and no guard runs for a teammate | test with a temp `GUARD_HOME` (smoke 3) |
| Vendored copy drifts from the host version | `VENDORED.md` resync procedure; tests copied with the code |
| Project hooks error on a machine without Node | Node ≥ 20 is already required by the app; hooks fail open |
| Overwriting a different host skill | never overwrite; ask (section 7) |
