# Setup and environment

## Requirements

- Node.js 20 or newer (`engines` in `src/package.json`)
- npm (the lockfile is `src/package-lock.json`)

## Environment variables

Copy `src/.env.example` to `src/.env.local` and adjust. Next.js loads `.env*` files from `src/`
(the project root); env files at the repository root are ignored.

| Variable | Meaning | Default |
|---|---|---|
| `NEXT_PUBLIC_APP_URL` | Public URL of this web app | `http://localhost:3000` |
| `NEXT_PUBLIC_API_URL` | Base URL of the backend API | `http://localhost:3000/api` |

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
