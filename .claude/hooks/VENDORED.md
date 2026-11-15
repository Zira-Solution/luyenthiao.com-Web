# Vendored guard

`guard.mjs`, `guard-lib/` and `tests/` are a copy of the owner's user-level guard
(`~/.claude/hooks/` on the host machine; design: `~/.claude/docs/superpowers/specs/2026-11-14-agent-guard-hooks-design.md`),
copied on 2026-11-15, so teammates get the same enforcement.

## Behavior

- Registered in `.claude/settings.json` (from commit `chore(ai): register the vendored guard in project settings`)
  for SessionStart, UserPromptSubmit, PreToolUse, PostToolUse, SubagentStart and Stop.
- Stands down (reads stdin, prints nothing, exit 0) when `GUARD_PROJECT=0`, or when `~/.claude/settings.json` /
  `~/.claude/settings.local.json` registers a hook command containing a path whose file name is exactly
  `guard.mjs` and that is not this vendored file (`${CLAUDE_PROJECT_DIR}`-relative paths are ignored).
  See `guard-lib/dedup.mjs`.
- Limits: settings moved with `CLAUDE_CONFIG_DIR`, managed settings and plugin hooks are not inspected; if a
  user-level guard lives there, set `GUARD_PROJECT=0` to avoid a double run.
- Guard state lives in `~/.claude/state/guard/` on each machine. The Stop hook runs `graphify update` /
  `codegraph sync`, which update the git-ignored `graphify-out/` and `.codegraph/` in the repo.
  Kill switch: create `~/.claude/state/guard/disabled`.

## Adaptations from the host copy

1. `guard.mjs`: reads stdin, then calls `shouldStandDown()` from `guard-lib/dedup.mjs` before running a hook handler.
2. `guard-lib/dedup.mjs`: new.
3. `guard-lib/handlers.mjs`: decline hint uses this file's absolute path; rule references point to
   `.claude/rules/tooling.md` of this repo; `.claude/superpowers/` is exempt from the brainstorm gate.
4. `guard-lib/project.mjs`: a project-level `.claude/skills/graphify` satisfies the graphify skill check.
5. `tests/project.test.mjs`: new tests for 1-4.
6. `tests/guard.test.mjs`: the "Read in a missing project" assertion matches `guard.mjs" decline`
   (the decline hint now quotes the vendored path) instead of `guard.mjs decline`.

## Resync

1. Copy `~/.claude/hooks/guard.mjs`, `guard-lib/*.mjs`, `tests/*.mjs` over these files (keep `dedup.mjs`
   and `tests/project.test.mjs`).
2. Re-apply adaptations 1, 3, 4 and 6.
3. Run `node --test .claude/hooks/tests/guard.test.mjs .claude/hooks/tests/project.test.mjs`.
