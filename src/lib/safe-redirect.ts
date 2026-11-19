// Open-redirect guard for the ?redirect= parameter (spec 2026-11-18-web-security-foundation §3.5).

const FALLBACK = '/'
const BASE = 'http://same-origin.invalid'
/** Never bounce back into the auth pages, or a stale link could loop. */
const AUTH_PAGES = ['/login', '/signup']

export function safeRedirectPath(raw: string | null | undefined): string {
  if (!raw) return FALLBACK
  if (!raw.startsWith('/') || raw.startsWith('//') || raw.startsWith('/\\')) return FALLBACK
  if (/[\u0000-\u001f\u007f]/.test(raw)) return FALLBACK

  let url: URL
  try {
    url = new URL(raw, BASE)
  } catch {
    return FALLBACK
  }
  if (url.origin !== BASE) return FALLBACK

  let decoded: string
  try {
    decoded = decodeURIComponent(url.pathname).toLowerCase()
  } catch {
    return FALLBACK
  }
  if (AUTH_PAGES.some((p) => decoded === p || decoded.startsWith(`${p}/`))) return FALLBACK

  // The URL parser removes dot segments, so "/.//evil.com" becomes "//evil.com": re-check the result.
  const path = `${url.pathname}${url.search}${url.hash}`
  if (path.startsWith('//') || path.startsWith('/\\')) return FALLBACK

  return path
}
