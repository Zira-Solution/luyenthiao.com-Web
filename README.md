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
`docs/03-known-issues.md` before relying on `tsc`/`lint`/`build` results (only tests gate CI for now).
