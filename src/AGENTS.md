<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## This file is not the project's guidance

`next dev` generates the block above and re-adds it on every start, so it is committed to keep the
tree clean. It is not where this project's rules live. The guidance an agent must follow is one
level up, in the repository root:

- `../AGENTS.md` — rules for every agent (language, honesty, git, the "never" list)
- `../CLAUDE.md` and `../.claude/` — the Claude Code layer: rules, agents, skills, architecture

Read those before writing code here. Anything you add to this file outside the markers above
survives regeneration (`upsertFile` in `node_modules/next/dist/server/lib/generate-agent-files.js`
replaces only the marked block).
