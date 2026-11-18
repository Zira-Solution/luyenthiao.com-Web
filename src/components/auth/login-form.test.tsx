import { act, cleanup, render } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { LoginForm } from '@/components/auth/login-form'
import { hardNavigate } from '@/lib/navigation'
import { useAuthStore } from '@/store/auth-store'

const replace = vi.fn()
const push = vi.fn()
let search = 'redirect=/history'

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace, push }),
  useSearchParams: () => new URLSearchParams(search),
}))
vi.mock('@/lib/navigation', () => ({ hardNavigate: vi.fn() }))
vi.mock('@/hooks', () => ({
  useLogin: () => ({ mutate: vi.fn(), error: null, isPending: false }),
}))

describe('LoginForm redirect after authentication', () => {
  beforeEach(() => {
    vi.mocked(hardNavigate).mockReset()
    push.mockReset()
    search = 'redirect=/history'
  })
  afterEach(() => {
    cleanup()
    useAuthStore.setState({ accessToken: null, user: null, status: 'idle', signedOut: false })
  })

  it('replaces to the safe redirect target once authenticated', () => {
    useAuthStore.setState({ status: 'authenticated' })
    render(<LoginForm />)
    expect(hardNavigate).toHaveBeenCalledWith('/history')
  })

  it('falls back to / for an unsafe redirect target', () => {
    search = 'redirect=//evil.com'
    useAuthStore.setState({ status: 'authenticated' })
    render(<LoginForm />)
    expect(hardNavigate).toHaveBeenCalledWith('/')
  })

  it('does not navigate while the session is idle', () => {
    useAuthStore.setState({ status: 'idle' })
    render(<LoginForm />)
    expect(hardNavigate).not.toHaveBeenCalled()
  })

  it('navigates exactly once when the session becomes authenticated', () => {
    useAuthStore.setState({ status: 'idle' })
    render(<LoginForm />)
    act(() => useAuthStore.setState({ status: 'authenticated' }))
    expect(hardNavigate).toHaveBeenCalledTimes(1)
    expect(hardNavigate).toHaveBeenCalledWith('/history')
  })
})
