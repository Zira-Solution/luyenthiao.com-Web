// UX hint, NOT a security boundary (spec 2026-11-18-web-security-foundation §3.1): it tells proxy.ts that this
// browser probably has a session, so signed-in pages can redirect before rendering. It holds no token; the backend
// checks the real credential (Bearer access token + HttpOnly refresh cookie) on every call.

export const AUTH_HINT_COOKIE = 'lta_authed'

/** 30 days: the backend's default JWT_REFRESH_EXPIRES_IN. */
const MAX_AGE_SECONDS = 60 * 60 * 24 * 30

export function buildAuthHintCookie(secure: boolean): string {
  return `${AUTH_HINT_COOKIE}=1; Path=/; Max-Age=${MAX_AGE_SECONDS}; SameSite=Lax${secure ? '; Secure' : ''}`
}

export function buildClearedAuthHintCookie(secure: boolean): string {
  return `${AUTH_HINT_COOKIE}=; Path=/; Max-Age=0; SameSite=Lax${secure ? '; Secure' : ''}`
}

function isHttps(): boolean {
  return window.location.protocol === 'https:'
}

export function setAuthHint(): void {
  if (typeof document === 'undefined') return
  document.cookie = buildAuthHintCookie(isHttps())
}

export function clearAuthHint(): void {
  if (typeof document === 'undefined') return
  document.cookie = buildClearedAuthHintCookie(isHttps())
}
