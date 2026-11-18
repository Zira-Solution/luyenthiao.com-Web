import { afterEach, describe, expect, it } from 'vitest'

import { useAuthStore } from '@/store/auth-store'

describe('useAuthStore and the auth hint cookie', () => {
  afterEach(() => {
    useAuthStore.getState().clearSession()
    useAuthStore.setState({ status: 'idle', signedOut: false })
  })

  it('setSession writes lta_authed=1', () => {
    useAuthStore.getState().setSession('token', { id: 1, role: 'STUDENT' })
    expect(document.cookie).toContain('lta_authed=1')
    expect(useAuthStore.getState().status).toBe('authenticated')
  })

  it('clearSession removes lta_authed', () => {
    useAuthStore.getState().setSession('token', { id: 1, role: 'STUDENT' })
    useAuthStore.getState().clearSession()
    expect(document.cookie).not.toContain('lta_authed=')
    expect(useAuthStore.getState().status).toBe('unauthenticated')
  })

  it('clearSession drops the cookie before subscribers run', () => {
    useAuthStore.getState().setSession('token', { id: 1, role: 'STUDENT' })
    let seen: string | null = null
    const unsubscribe = useAuthStore.subscribe(() => {
      seen = document.cookie
    })
    useAuthStore.getState().clearSession()
    unsubscribe()
    expect(seen).not.toBeNull()
    expect(seen).not.toContain('lta_authed=')
  })

  it('setSession writes the cookie before subscribers run', () => {
    let seen: string | null = null
    const unsubscribe = useAuthStore.subscribe(() => {
      seen = document.cookie
    })
    useAuthStore.getState().setSession('token', { id: 1, role: 'STUDENT' })
    unsubscribe()
    expect(seen).toContain('lta_authed=1')
  })

  it("clearSession('logout') marks the session as deliberately signed out", () => {
    useAuthStore.getState().clearSession('logout')
    expect(useAuthStore.getState().signedOut).toBe(true)
  })

  it('clearSession without a reason leaves signedOut false', () => {
    useAuthStore.getState().clearSession()
    expect(useAuthStore.getState().signedOut).toBe(false)
  })

  it('setSession resets signedOut', () => {
    useAuthStore.getState().clearSession('logout')
    useAuthStore.getState().setSession('token', { id: 1, role: 'STUDENT' })
    expect(useAuthStore.getState().signedOut).toBe(false)
  })
})
