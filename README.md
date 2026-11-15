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

## Migrating from the old layout

Until 2026-11-15 the Next.js project lived at the repository root. After pulling this layout:

1. Move a local `.env.local` (or `.env`) from the repository root to `src/`.
2. Delete the leftover root `node_modules/`, `.next/`, `next-env.d.ts` and `tsconfig.tsbuildinfo`,
   then run `npm ci` in `src/`. A stale root `node_modules/` can hide a missing install in `src/`.
3. Point your editor's ESLint/TypeScript tooling at `src/` (for example, open `src/` as the
   workspace folder).
4. Rebase open branches: `lib/exam/*` became `lib/exam-*.ts` and `schemas/exam.ts`,
   `lib/admin/*` became `lib/admin-*.ts`, `hooks/auth/*` moved to `hooks/`,
   `components/layout/*` moved to `components/common/`, and `components/checkpoint/*` moved to
   `components/exam/` (`CheckpointClientWrapper` is now `ExamCheckpoint`, `ModeSelectModal` is now
   `ExamModeSelectModal`).
5. Any deployment must use `src/` as the project root.

See `docs/02-setup-and-environment.md` for environment variables and
`docs/03-known-issues.md` before relying on `tsc`/`lint`/`build` results (only tests gate CI for now).
