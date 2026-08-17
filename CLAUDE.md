# CLAUDE.md — AI Agent Guide

## Language

Always respond in **Vietnamese** for all communication: explanations, responses, reports.

## Honesty

- Never fabricate knowledge. If uncertain → search, read files, or ask the user.
- Never present speculation as fact. If unavoidable, prefix with:
  > ⚠️ **[SPECULATION]:** ... _(state the basis, not yet verified)_

## Environment

- Running via **CLI** → skills, hooks, and MCP tools all work normally.
- Running via **IDE extension** → see `.claude/rules/extension-fallback.md`.
- This is set explicitly per session, not inferred. If unset, ask the user once at session start rather than guessing.

## References (read before starting work)

- `.claude/ARCHITECTURE.md` — project structure, before any code task
- `.claude/rules/coding.md` — coding rules
- `.claude/rules/workflow.md` — workflow process
- `.claude/skills/` — supplementary skills, invoke as relevant, no limit on combinations

## Process

1. Analyze project context
2. Plan before acting (Plan Mode for large changes) — wait for approval before writing code
3. Verify results after execution; confirm existing logic is not broken

---

## Hard Rules (non-negotiable, apply to every task regardless of size)

1. **Codegraph before code.** Any read of project data — a file path, a component, an import, a single line — goes through Codegraph first. Never substitute `Read` / `Grep` / `Glob` for a Codegraph query. If Codegraph is unresponsive: `codegraph init`. If not installed: `npm i -g @colbymchenry/codegraph && codegraph install`, then re-run `codegraph init` and wait for indexing before continuing.
2. **Spec before code.** No implementation until the design is reviewed and approved by the user.
3. **Brainstorm before anything, even simple tasks.** Simple tasks are where unexamined assumptions cause the most mistakes. Never skip this because a task "looks trivial."
4. **One subagent per task** when running parallel execution — no cross-task context pollution.
5. **Two-stage review on completion:** first spec compliance (does output match the agreed design?), then code quality (is the implementation correct and clean?).