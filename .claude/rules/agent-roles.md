# Agent Roles and Coordination

Each model does the part it is best at, and the agents chain into a loop with quality checkpoints, rather
than each agent running in isolation.

The agent definitions live in `.claude/agents/`.

## Role table

| Role | Model | Who | Strength used |
|---|---|---|---|
| **Coordinator and brain** | Opus | **The main session** (not a subagent) | Deep reasoning, research, design, decisions |
| **Code writer** | Sonnet | `implementer` | Fast coding that follows instructions closely |
| **Spec check** | Sonnet | `spec-reviewer` | Mechanical, meticulous comparison; no deep reasoning needed |
| **Quality check** | Opus | `code-reviewer` | Finding logic bugs and boundary mistakes; needs deep reasoning |
| **Command runner** | Sonnet | `runner` | Runs long commands and filters the output |

Why `spec-reviewer` uses Sonnet while `code-reviewer` uses Opus: matching "the spec says X, does the
code have X" is mechanical work, and Sonnet does it well at a much lower cost. Finding bugs *nobody
thought of* needs Opus-level reasoning.

## Model routing

- Superpowers command chains and automated fixing agents use Sonnet at minimum.
- Opus is for architecture, review, and multi-layered debugging.
- Haiku is not used in this repository's agent chains.

## Execution loop: one loop per task

```
                    ┌──────────────────────────────────┐
                    │  Opus: read the plan, split into │
                    │  tasks                           │
                    └────────────────┬─────────────────┘
                                     ▼
                    ┌──────────────────────────────────┐
              ┌────▶│  implementer (Sonnet) does task N│──┐
              │     └────────────────┬─────────────────┘  │ long output
              │                      ▼                    ▼
              │              returned status          runner (Sonnet)
              │       DONE / DONE_WITH_CONCERNS
              │       NEEDS_CONTEXT / BLOCKED
              │                      │
              │                      ▼
              │     ┌──────────────────────────────────┐
              │     │  spec-reviewer (Sonnet)          │
              │     │  "matches the spec? missing or   │
              │     │   extra?"                        │
              │     └────────────────┬─────────────────┘
              │            FAIL      │  PASS
              └──────────────────────┤
                                     ▼
              ┌──────────────────────────────────────────┐
        ┌────▶│  code-reviewer (Opus)                    │
        │     │  "logic bugs? broken backend contract?"  │
        │     └────────────────┬─────────────────────────┘
        │            FAIL      │  PASS
        └──────────────────────┤
                               ▼
                    task N done → task N+1
```

When all tasks are done, Opus calls `code-reviewer` **once more for the whole change**, because
integration bugs between tasks only show up when looking at the whole.

## Hard rules of the loop

**The order of the two reviews is mandatory.** `spec-reviewer` first, `code-reviewer` second. Do not
swap, merge, or skip. Reason: a quality review of code that does the wrong thing is wasted effort,
because that code is about to be rewritten.

**A reviewer reports a problem -> the same `implementer` fixes it -> review AGAIN.** Never skip the
re-review; the fix can be wrong too.

**Opus does not fix code itself when a reviewer reports a problem.** Resume the same `implementer`
via SendMessage with its agent ID, or dispatch a fresh `implementer` with the review report verbatim. If Opus jumps in to fix, the trail is lost and the role boundary breaks.

**Do not dispatch several `implementer` agents in parallel** on this repository. They will step on
each other.

## Handling the status `implementer` returns

| Status | What Opus does |
|---|---|
| `DONE` | Go to `spec-reviewer` |
| `DONE_WITH_CONCERNS` | **Read the concerns first.** If they affect correctness or scope, handle them now. If they are only observations, note them and go to review |
| `NEEDS_CONTEXT` | Provide exactly the missing information and call again |
| `BLOCKED` | **Do not call again unchanged.** Diagnose: missing context -> add it; task too large -> split it; plan wrong -> stop and tell the owner |

Principle: when an agent says it is stuck, **something must change** before calling it again.
Repeating the same call wastes effort and ends in the same block.

## Hard boundaries

**Opus does not write code once a plan exists.** Hand it to `implementer`. Exception: a trivial
one-line fix where describing it to an agent costs more than making it.

**Opus still does these itself and never hands off:** reading code to analyze it, debugging,
internet research, writing specs and plans, and **every decision**.

**Sonnet agents do not make decisions.** If something is ambiguous, stop and return `NEEDS_CONTEXT`
or `BLOCKED`. This is the most important boundary: an implementing agent that guesses the intent
creates bugs that cost more time to fix than the agent saved.

**`runner` decides nothing.** It runs commands, reads output, and summarizes. If a command fails it
reports the failure; it does not rewrite the command and rerun it.

**Reviewers do not edit files.** `Write`/`Edit` are blocked at tool level; shell writes are forbidden by instruction.

**Commits:** the main session, or the `implementer` only with relayed owner approval (see `.claude/rules/git.md`).

## When NOT to call `runner`

Spawning an agent has a fixed startup cost: system prompt + `CLAUDE.md` + git status + the returned
result. For a short command that cost is **larger** than running it yourself.

| Call `runner` | Run it yourself |
|---|---|
| Full test suite, build, lint of the whole project | `ls`, `cat`, `grep` on one file |
| A chain of several commands | A single command with short output |
| Hundreds of lines of output where only the conclusion matters | A command whose output you must read verbatim |

Use `runner` to **filter output**, not to avoid typing a command.

## Briefing a subagent: say everything up front

A subagent **does not see the main conversation history**. Every hand-off must include:

- The plan/spec path **and the specific task number**
- Which files are relevant
- The expected result and how to verify it (commands run from `src/`; the baseline is in
  `docs/03-known-issues.md`)
- For reviewers: the list of changed files
- **Locations already found** (`file:line`, or a short excerpt) and the repository path. Most of a
  subagent's tokens are spent re-exploring what the main session already knows. Put the repo path
  and `file:line` ranges in the prompt. The agent then starts with one `graphify explain
  "<symbol>"` (or `graphify query --budget 800`) and one `codegraph_explore` naming the given
  files/symbols, which satisfies the guard and returns the source; after that it does not
  re-discover.

Code exploration order for every agent: `graphify query "<question>" --budget 1500` (map), then
`codegraph_explore` (precise symbols, `projectPath` = repo root), then raw reads (Read/Grep/Glob)
only for what those did not answer (skip a step whose tool is not installed; see
`.claude/rules/tooling.md` §1).

`implementer`, `spec-reviewer`, and `code-reviewer` have `mcp__codegraph__*` access. The vendored
guard (`.claude/hooks/guard.mjs`, see `.claude/rules/tooling.md`) injects a code-navigation note at
`SubagentStart`, so the prompt only needs locations, not tool instructions.

Never say "continue what we were doing" or "fix it as discussed". The agent does not know what you
mean.

A subagent **does** read `CLAUDE.md`, `AGENTS.md`, and the git status.

## Technical limits

- **Default spawn depth is 3.** Main session -> `implementer` -> `runner` is 2 levels, within the
  limit. Change it with `CLAUDE_CODE_MAX_SUBAGENT_SPAWN_DEPTH` (set `1` to disable nesting).
- **At most 20 concurrent subagents.** Beyond that: `Concurrent subagent limit reached`.
- **Do not pass `model` when dispatching these agents**: the per-invocation `model` parameter
  overrides the frontmatter. Do not set `CLAUDE_CODE_SUBAGENT_MODEL_FORCE=1`: with it, Claude Code
  ignores every frontmatter `model`. (`CLAUDE_CODE_SUBAGENT_MODEL` alone only applies to agents
  without a `model` field.)
- Claude Code hot-reloads `.claude/agents/`; restart only after `.claude/agents/` is created for the
  first time (the watcher covers directories that existed at session start).
- The `Agent(type)` allowlist is ignored inside subagent definitions (docs), so the "only `runner`"
  rule for `implementer` is enforced by instruction.
