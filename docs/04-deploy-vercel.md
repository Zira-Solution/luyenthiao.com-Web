# Deploy on Vercel

The project is deployed as `ziratech/luyenthiao-com-web`.

## Why the host matters

Zoney.vn-Web, the project this repo borrowed its structure and tooling from, runs on AWS Amplify.
This one runs on Vercel, and the feature sets differ — Amplify Hosting compute supports Next.js only
up through 15 and lists **Next.js streaming**, on-demand ISR and Edge middleware under
[unsupported features](https://docs.aws.amazon.com/amplify/latest/userguide/ssr-amplify-support.html),
while Vercel streams [Route Handlers, Vercel Functions and React Server
Components](https://vercel.com/docs/frameworks/full-stack/nextjs#streaming).

So a page here may render on the server and stream — `loading.tsx` for a whole route segment,
`<Suspense>` for one slow section — instead of blocking on data or pushing the fetch to the client.
`.claude/ARCHITECTURE.md` → "Hosting: Vercel, not Amplify" has the comparison table and the rules that
follow from it.

### `output: 'standalone'`

`src/next.config.ts` sets `output: 'standalone'`, which came in with the Zoney scaffold (`8513d4a`).
It is the self-hosting / Docker output mode; Vercel's Next.js adapter produces its own build output
and ignores it. It is harmless on Next.js 16.4.6 and is still in the config, but it is dead weight
here, and it did break Vercel builds on Next.js 16.3.x before the fix landed
([vercel/next.js#96646](https://github.com/vercel/next.js/issues/96646) — `ENOENT …
.next/next-server.js.nft.json` during `onBuildComplete`; fixed in 16.4.0 and backported). Worth
revisiting at the next Next.js upgrade.

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
vercel ls luyenthiao-com-web
vercel inspect --logs <deployment-url>
```

The project name is a positional argument. Vercel CLI 65 removed the `--project` flag, and there is
no `src/.vercel` link directory here, so the name has to be given explicitly.

Check the `Commit:` line first: a stale log explains a failure that is already fixed.

## Deploy failures so far

| Date | Symptom | Cause |
|---|---|---|
| 2026-11-15 | `Module not found: Can't resolve '@/mocks/notifications.json'` (8 errors) | Five mock files were never committed; fixed by rebuilding them |
| 2026-11-15 | `Failed to collect configuration for /_not-found` → `Missing environment variable: NEXT_PUBLIC_APP_URL` | `src/lib/env.ts` threw in production; the project had no env vars. CI hid it by setting placeholder values, so CI was green while the deploy failed. CI now runs the build without those variables |
| 2026-11-16 | `Turbopack build failed with 35 errors` → `Can't resolve '@vercel/turbopack-next/internal/font/google/font'`, `next/font/google queries have exactly one entry` | Upstream Next.js bug, not our code: the same commit built locally. Google Fonts intermittently answers with extensionless `fonts.gstatic.com/l/font?kit=…&skey=…` URLs, and Turbopack fed the JSON options through `QString::from`, so the `&` split the query into several entries ([#99114](https://github.com/vercel/next.js/issues/99114)). Fixed by upgrading Next 16.1.6 → 16.4.6; the fix shipped in [16.4.3](https://github.com/vercel/next.js/releases/tag/v16.4.3) |

A build that fails inside `next/font/google` is almost never a code change — the same commit usually
builds elsewhere. Reproduce it deterministically instead of redeploying until it passes: point
`NEXT_FONT_GOOGLE_MOCKED_RESPONSES` at a module mapping each `https://fonts.googleapis.com/css2?…`
URL to CSS whose `src: url(…)` entries use the `/l/font?kit=…&skey=…&v=…` shape. With the mock set,
`fetchFontFile` returns `Buffer.from(url)`, so no network call is made.
