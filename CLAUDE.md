@AGENTS.md

# CLAUDE.md — Claude Code layer

`AGENTS.md` above is shared by every agent. This file adds what only Claude Code has.

## Superpowers — required for every task

Invoke the matching superpowers skill before writing code or files: brainstorming → writing-plans →
subagent-driven-development (or executing-plans); systematic-debugging for bugs;
verification-before-completion before claiming done. "Simple task" is not a reason to skip.

Specs and plans go to `.claude/superpowers/specs/` and `.claude/superpowers/plans/` (this overrides the skill default `docs/superpowers/`). A skill step that says "commit" still needs the owner's explicit approval (`.claude/rules/git.md`).

## Setup

Prerequisites: superpowers plugin (`/plugin install superpowers@claude-plugins-official`), `npm i -g @colbymchenry/codegraph`, then `codegraph install` (choose Claude Code) to register the `codegraph` MCP server, `uv tool install graphifyy` (or `pip install graphifyy`), Node 24 (or `^22.22.2`; see `engines` in `src/package.json`).
Start Claude Code inside `luyenthiao.com-Web`: this repo's hooks, settings and agents do not load when the session starts at the workspace root, and its CLAUDE.md and rules then load only on demand.

## Hard rules

1. **Explore in order:** `graphify query "<question>" --budget 1500` (map) → `codegraph_explore`
   (symbols, `projectPath` = this repo) → raw reads only for what is still missing. Skip a step whose tool is not installed (`.claude/rules/tooling.md` §1). Run graphify from the repo root (or pass `--graph <repo>/graphify-out/graph.json`).
2. **Two-stage review** after every task: spec compliance first, then code quality — separate passes.
3. **Role split:** the main (Opus) session analyses, writes specs and plans, and supervises; once a plan
   exists it does not write code — it dispatches agents. See `.claude/rules/agent-roles.md`.
4. **One subagent per task**; never two implementers in parallel on the same tree.

## Rules and docs

Files in `.claude/rules/` load automatically: `coding.md` and `animation-matrix.md` only when working under `src/` (`paths` frontmatter), the others at every session start. Files in `.claude/docs/` and `docs/` are read on demand. A path-scoped rule loads only when a matching file is read or edited — reviewers read `.claude/rules/coding.md` explicitly.

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
| `.claude/docs/extension-fallback.md` | Running in an IDE extension where skills/hooks/MCP are unavailable |
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

Project skills live in `.claude/skills/`: UI and Next (`frontend-design`, `ui-ux-pro-max`, `tailwind-4-docs`, `vercel-react-best-practices`, `performance`, `html5-seo`, `seo-metadata`), design taste (`design-taste-frontend`, `high-end-visual-design`, `minimalist-ui`, …), animation (`animate`, `framer-motion-*`, `gsap-*`), `graphify`, `full-output-enforcement`. Invoke every relevant one; there is no limit on combining them.

---

This file must stay under 200 lines. New rules go into `.claude/rules/<name>.md` — add `paths` frontmatter unless the rule applies to every task — plus one row in the table.
