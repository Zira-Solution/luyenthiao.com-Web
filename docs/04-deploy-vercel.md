# Deploy on Vercel

The project is deployed as `ziratech/luyenthiao-com-web`.

## Settings that live in the dashboard

Vercel has no `vercel.json` property for the Root Directory, so these two must be set in
**Settings → Build and Deployment** and cannot be version-controlled:

| Setting | Value | Why |
|---|---|---|
| Root Directory | `src` | The Next.js project lives in `src/`; the repository root only holds metadata |
| Node.js Version | any | Overridden by `engines.node` in `src/package.json` (see below) |

Everything else is in `src/vercel.json` (framework preset, install and build command).

## Node.js version

`engines.node` in `src/package.json` **overrides** the dashboard setting
([docs](https://vercel.com/docs/functions/runtimes/node-js/node-js-versions#version-overrides-in-package.json)).
Vercel picks the highest available major that satisfies the range, so a range containing
`>=26.0.0` deployed Node 26 while CI and local development used Node 24.

The range is pinned to `^22.22.2 || ^24.15.0`: Node 24 everywhere (dashboard, CI, local), and the
lower bounds are what `jsdom` 30 requires for the test run.

## Environment variables

**No public variable is required for the build to succeed.** `src/lib/env.ts` falls back
(`src/lib/env.test.ts` locks that in). Set them to point the app at the real hosts:

| Variable | Needed for | Fallback when unset |
|---|---|---|
| `NEXT_PUBLIC_APP_URL` | canonical URLs, Open Graph, `sitemap.xml`, `robots.txt` | `https://luyenthiao.com` in production |
| `NEXT_PUBLIC_API_URL` | every browser call to the backend | `http://localhost:3005/api` + a build warning |

Leaving `NEXT_PUBLIC_API_URL` unset deploys an app whose API calls point at the visitor's own
machine. Set it per environment:

```bash
cd src
vercel env add NEXT_PUBLIC_API_URL production --project luyenthiao-com-web
vercel env add NEXT_PUBLIC_APP_URL production --project luyenthiao-com-web
```

The backend must allow the deployed origin: `luyenthiao.com-Backend` only accepts requests from its
`CORS_ORIGIN` (see its `.env.example`).

## Do not set `NODE_ENV`

`next build` manages `NODE_ENV` itself. Setting it on the host makes `npm ci` skip
`devDependencies` (`tailwindcss`, `typescript`), and the build then dies on a missing PostCSS
plugin — a symptom far from its cause.

## Reading a failed build

```bash
cd src
vercel ls --project luyenthiao-com-web
vercel inspect --logs <deployment-url>
```

Check the `Commit:` line first: a stale log explains a failure that is already fixed.

## Deploy failures so far

| Date | Symptom | Cause |
|---|---|---|
| 2026-11-15 | `Module not found: Can't resolve '@/mocks/notifications.json'` (8 errors) | Five mock files were never committed; fixed by rebuilding them |
| 2026-11-15 | `Failed to collect configuration for /_not-found` → `Missing environment variable: NEXT_PUBLIC_APP_URL` | `src/lib/env.ts` threw in production; the project had no env vars. CI hid it by setting placeholder values, so CI was green while the deploy failed. CI now runs the build without those variables |
