# AGENTS.md — luyenthiao.com-Web

Guidance for every AI coding agent working in this repository (format: https://agents.md).
Claude Code reads it through `@AGENTS.md` in `CLAUDE.md`.

## Project

Web client of luyenthiao.com, an online English test-preparation platform, built with Next.js
(App Router). The API is the separate repository `luyenthiao.com-Backend` (NestJS, branch `develop`).
Today only authentication talks to the backend; the other domains read `src/mocks/*.json`,
`localStorage` or constants inside the page. Architecture: `.claude/ARCHITECTURE.md`. Human docs: `docs/`.

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

1. **Spec before code.** No implementation until the design is approved by the user. Specs and plans live in `.claude/superpowers/specs|plans/`.
2. **Brainstorm first**, even for tasks that look simple (without superpowers, follow `.claude/docs/extension-fallback.md` §1).
3. **Automated tests are not enough to claim done.** Exercise the real path
   (`.claude/rules/verification.md`).
4. **Git writes only on explicit request:** any command that changes the repo or a remote (e.g. `add`, `commit`, `reset`, `restore`, `stash`, `merge`, `rebase`, `clean`, branch operations, `push`, `pull`, `fetch`, writing `gh` commands) needs approval (`.claude/rules/git.md`).
5. **Commit messages:** English, Conventional Commits, short subject (≤ 72 chars), body only when the why is not obvious; never a `Co-Authored-By` trailer or any AI attribution.
6. **Research before answering** about libraries, APIs and error messages (`.claude/rules/research.md`).

## Commands (run in `src/`)

```bash
npm ci
cp -n .env.example .env.local  # then set NEXT_PUBLIC_API_URL=http://localhost:3005/api to reach luyenthiao.com-Backend
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
- Change files under `src/public/clone-assets/` without a task (the admin media picker lists them).
- Stop a dev server or process you did not start.
