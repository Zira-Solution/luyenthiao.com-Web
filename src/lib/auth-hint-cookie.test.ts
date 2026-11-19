import { afterEach, describe, expect, it } from 'vitest'

import {
  AUTH_HINT_COOKIE,
  buildAuthHintCookie,
  buildClearedAuthHintCookie,
  clearAuthHint,
  setAuthHint,
} from '@/lib/auth-hint-cookie'

describe('auth hint cookie strings', () => {
  it('sets lta_authed=1 for 30 days, Lax, site-wide', () => {
    expect(buildAuthHintCookie(false)).toBe('lta_authed=1; Path=/; Max-Age=2592000; SameSite=Lax')
  })

  it('adds Secure only when asked', () => {
    expect(buildAuthHintCookie(true)).toBe(
      'lta_authed=1; Path=/; Max-Age=2592000; SameSite=Lax; Secure',
    )
    expect(buildClearedAuthHintCookie(true)).toBe(
      'lta_authed=; Path=/; Max-Age=0; SameSite=Lax; Secure',
    )
  })

  it('expires the cookie when clearing', () => {
    expect(buildClearedAuthHintCookie(false)).toBe('lta_authed=; Path=/; Max-Age=0; SameSite=Lax')
  })
})

describe('setAuthHint / clearAuthHint (jsdom, http://localhost)', () => {
  afterEach(() => {
    clearAuthHint()
  })

  it('writes and removes the cookie in document.cookie', () => {
    setAuthHint()
    expect(document.cookie).toContain(`${AUTH_HINT_COOKIE}=1`)
    clearAuthHint()
    expect(document.cookie).not.toContain(`${AUTH_HINT_COOKIE}=`)
  })
})
