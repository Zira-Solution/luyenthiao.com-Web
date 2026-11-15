# Setup and environment

## Requirements

- Node.js 20 or newer (`engines` in `src/package.json`)
- npm (the lockfile is `src/package-lock.json`)

## Environment variables

Copy `src/.env.example` to `src/.env.local` and adjust. Next.js loads `.env*` files from `src/`
(the project root); env files at the repository root are ignored.

| Variable | Meaning | Default (development) |
|---|---|---|
| `NEXT_PUBLIC_APP_URL` | Public URL of this web app | `http://localhost:3000` |
| `NEXT_PUBLIC_API_URL` | Base URL of the backend API | `http://localhost:3000/api` |

Both variables are required when `NODE_ENV=production` (`npm run build`, `npm start`): `src/lib/env.ts`
throws if either is missing. CI sets placeholder values in `.github/workflows/ci.yml`.

The `.env.example` default `NEXT_PUBLIC_API_URL=http://localhost:3000/api` points at this app itself. To use `luyenthiao.com-Backend` locally, run it (it listens on port 3005) and set `NEXT_PUBLIC_API_URL=http://localhost:3005/api` in `src/.env.local`. The backend accepts requests only from its `CORS_ORIGIN` (default `http://localhost:3000`), so keep the app on port 3000 or add your origin to the backend `.env`.

## Run locally

```bash
cd src
npm ci
npm run dev
```

Authentication pages call the backend at `NEXT_PUBLIC_API_URL`; start `luyenthiao.com-Backend`
first if you need login. Other pages currently read data from `src/mocks/` or `localStorage`.

## Formatting

Prettier reads `src/.prettierrc` and `src/.prettierignore`. Format only the files you change
(`npx prettier --write <file>`); the codebase still has formatting debt, so a repo-wide
`npm run format` produces a large unrelated diff.

## AI tooling

The repository ships AI agent guidance (`AGENTS.md`, `CLAUDE.md`, `.claude/`). To use it with Claude Code:

- Start Claude Code inside `luyenthiao.com-Web` (the guard in `.claude/hooks/` is not loaded from a
  parent folder).
- Install the superpowers plugin: `/plugin install superpowers@claude-plugins-official`.
- Install the code-graph tools: `npm i -g @colbymchenry/codegraph` and `uv tool install graphifyy`
  (or `pip install graphifyy`). On first use the guard asks to index the repo, or lets you decline.
- Node ≥ 20 is required for the guard hooks.
