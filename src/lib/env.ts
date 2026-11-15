// Public env vars (NEXT_PUBLIC_ prefix) — safe to inline into the client bundle.
//
// Read `process.env.X` as a literal: Turbopack only inlines NEXT_PUBLIC_* when it sees that exact
// string in the code (a dynamic lookup is not replaced).
//
// Fall back instead of throwing. This module is imported by `api-client.ts`, which every auth hook
// uses, so a throw here crashes the client app. It also breaks the build: `next build` evaluates
// this module while collecting page data, which is how the 2026-11-15 production deploy failed
// ("Failed to collect configuration for /_not-found — Missing environment variable:
// NEXT_PUBLIC_APP_URL") on a host that had no env vars set.
// A missing value must degrade, not block: APP_URL only affects metadata (canonical/OG/sitemap),
// and a missing API_URL is caught by the CI guard in `.github/workflows/ci.yml`.

const PROD_APP_URL = 'https://luyenthiao.com'
const DEV_APP_URL = 'http://localhost:3000'
/** Dev default. The backend (`luyenthiao.com-Backend`) listens on port 3005. */
const DEV_API_URL = 'http://localhost:3005/api'

function stripTrailingSlash(url: string): string {
  return url.replace(/\/+$/, '')
}

function resolveAppUrl(): string {
  const configured = process.env.NEXT_PUBLIC_APP_URL
  if (configured) return stripTrailingSlash(configured)
  return process.env.NODE_ENV === 'production' ? PROD_APP_URL : DEV_APP_URL
}

function resolveApiUrl(): string {
  const configured = process.env.NEXT_PUBLIC_API_URL
  if (configured) return stripTrailingSlash(configured)
  console.warn(
    `[env] NEXT_PUBLIC_API_URL is not set — falling back to ${DEV_API_URL}. Set it in src/.env.local (or on the deploy host) so API calls reach the backend.`,
  )
  return DEV_API_URL
}

export const env = {
  APP_URL: resolveAppUrl(),
  API_URL: resolveApiUrl(),
  NODE_ENV: process.env.NODE_ENV ?? 'development',
} as const
