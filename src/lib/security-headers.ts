// Security headers for every response (spec 2026-11-18-web-security-foundation §2), modelled on
// Zoney.vn-Web next.config.ts. Pure so it can be unit-tested; next.config.ts only calls it.

export interface SecurityHeader {
  key: string
  value: string
}

export interface SecurityHeaderOptions {
  /** NEXT_PUBLIC_API_URL; only its origin is used. */
  apiUrl: string
  isProduction: boolean
}

function webSocketOrigin(api: URL): string {
  return `${api.protocol === 'https:' ? 'wss:' : 'ws:'}//${api.host}`
}

// script-src keeps 'unsafe-inline': Next bootstraps with inline scripts, and nonces would force every page to
// render dynamically (node_modules/next/dist/docs/01-app/02-guides/content-security-policy.md, "How nonces work").
// The API origin is repeated in img-src/media-src so an http:// API (local production simulation) still works.
export function buildContentSecurityPolicy(apiUrl: string): string {
  let api: URL | null = null
  try {
    api = new URL(apiUrl)
    // "localhost:3005/api" parses with protocol "localhost:" and origin "null"; treat it as invalid.
    if (api.protocol !== 'http:' && api.protocol !== 'https:') throw new TypeError('Not http(s)')
  } catch {
    api = null
    // Degrade, do not block the build: without an absolute API URL only 'self' is allowed for API calls.
    console.warn(
      `[security-headers] NEXT_PUBLIC_API_URL is not an absolute URL ("${apiUrl}"); the CSP allows only 'self' for API calls.`,
    )
  }
  const apiOrigin = api ? ` ${api.origin}` : ''
  return [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline'",
    "style-src 'self' 'unsafe-inline'",
    `img-src 'self' data: blob: https:${apiOrigin}`,
    `media-src 'self' blob: https:${apiOrigin}`,
    "font-src 'self' data:",
    `connect-src 'self'${api ? ` ${api.origin} ${webSocketOrigin(api)}` : ''}`,
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
  ].join('; ')
}

export function buildSecurityHeaders({
  apiUrl,
  isProduction,
}: SecurityHeaderOptions): SecurityHeader[] {
  // The CSP is production-only: the dev server needs eval() and a WebSocket for HMR.
  const csp: SecurityHeader[] = isProduction
    ? [{ key: 'Content-Security-Policy', value: buildContentSecurityPolicy(apiUrl) }]
    : []
  return [
    ...csp,
    // No includeSubDomains/preload: not every luyenthiao.com subdomain is known to serve HTTPS.
    { key: 'Strict-Transport-Security', value: 'max-age=31536000' },
    { key: 'X-Content-Type-Options', value: 'nosniff' },
    { key: 'X-Frame-Options', value: 'DENY' },
    { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
    // The speaking screens record audio, so the microphone stays allowed for this origin only.
    {
      key: 'Permissions-Policy',
      value: 'camera=(), microphone=(self), geolocation=(), payment=()',
    },
  ]
}
