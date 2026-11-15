# Rule: Tooling, Skills and Token Economy (luyenthiao.com-Web)

## Scope
Applies to every agent and subagent working in this repository. Enforced in part by the vendored guard
`.claude/hooks/guard.mjs` (see `.claude/hooks/VENDORED.md`), which stays silent when a user-level guard is installed.

## 1. Code exploration order (projects with a `.git` root)
1. **graphify (map):** `graphify query "<question>" --budget 1500`, `graphify explain "<symbol>"`,
   or read `graphify-out/GRAPH_REPORT.md`.
2. **codegraph (precise):** `codegraph_explore` MCP tool (pass `projectPath`) or `codegraph explore "<symbols>"`.
3. **Raw reads** (Read/Grep/Glob/rg/cat of code files) only for what steps 1-2 did not answer, or to prepare an Edit.

Only the steps whose tool is present in the project are required. Subagents follow the same order;
their progress is tracked separately from the main agent. Non-code files (md, json, yaml, ...) can always be read.

## 2. New project / workspace setup
When the guard reports missing tooling, BEFORE exploring:
1. Ask the user with AskUserQuestion (multiSelect) which items to install:
   - `codegraph init -y "<root>"`
   - `graphify extract "<root>" --code-only` (local AST, no LLM cost)
   - `graphify install --platform claude` (global skill, once per machine)
   - `graphify hook install` run inside the project (git hooks keep the graph fresh)
   - add `graphify-out/` and `.codegraph/` to `.gitignore`
2. Install only the approved items, then verify with `node .claude/hooks/guard.mjs status "<root>"`.
3. For declined items: `node .claude/hooks/guard.mjs decline "<root>" codegraph` and/or `graphify`
   (no item = decline both). Declined items are not asked again.

Semantic (LLM) graphify extraction runs only when the user asks for it. After edits, the guard
refreshes graphs in the background at the end of each turn (`graphify update --force`, `codegraph sync`).

## 3. Skill and plugin discovery
- Trigger: a hard task, repeated failed attempts, or a missing capability.
- Research per `.claude/rules/research.md` (official marketplaces and repositories first).
- Report to the user: candidate name, what it does, source URL, expected benefit, install scope.
- Install ONLY after explicit approval.
- Skills are installed in TWO places:
  1. This repo: `.claude/skills/<name>/`.
  2. The user-level copy at `~/.claude/skills/<name>/`.
- Plugins: install at project scope AND user scope.

## 4. Token economy
- Prefer tools that return compact, targeted output: `graphify query --budget`, `codegraph explore`,
  `rg` with `-l`/`-m`/globs, line-limited output.
- Process large data (logs, CSV, JSON dumps, generated files) with scripts or CLIs and bring only
  the summary into context.
- Never read whole large files when a symbol or line range is enough.
- If a recurring task wastes tokens and a tool could do it locally, propose that tool to the user (section 3).

## 5. Gates and escape hatches
- Brainstorm gate: editing project files in the main agent requires `superpowers:brainstorming`
  (or writing-plans / executing-plans / systematic-debugging / subagent-driven-development) in the session,
  invoked as a Skill or typed as a slash command. Exempt: `docs/superpowers/**`, `.claude/superpowers/**` (the `.claude/superpowers/**` exemption exists only in the vendored guard; a user-level guard may still gate it), `.gitignore`, files outside projects.
- `#quick` in a prompt bypasses the brainstorm gate for that turn (trivial edits only).
- The same call denied 3 times by the same gate is let through with a warning: treat that as a
  signal to fix the workflow, not as permission to skip it.
- Emergency off switch: create `~/.claude/state/guard/disabled`; delete it to re-enable.
  `GUARD_PROJECT=0` silences only the vendored guard.
