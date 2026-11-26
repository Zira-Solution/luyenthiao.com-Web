import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { LoginForm } from '@/components/auth/login-form'
import { hardNavigate } from '@/lib/navigation'
import { useAuthStore } from '@/store/auth-store'

const replace = vi.fn()
const push = vi.fn()
const mutate = vi.fn()
let search = 'redirect=/history'

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace, push }),
  useSearchParams: () => new URLSearchParams(search),
}))
vi.mock('@/lib/navigation', () => ({ hardNavigate: vi.fn() }))
vi.mock('@/hooks', () => ({
  useLogin: () => ({ mutate, error: null, isPending: false }),
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

describe('LoginForm social button', () => {
  beforeEach(() => {
    vi.mocked(hardNavigate).mockReset()
    push.mockReset()
    replace.mockReset()
    mutate.mockReset()
    search = ''
    useAuthStore.setState({ status: 'idle' })
  })
  afterEach(() => {
    cleanup()
    useAuthStore.setState({ accessToken: null, user: null, status: 'idle', signedOut: false })
  })

  it('renders the Google button disabled with a visible coming-soon label', () => {
    render(<LoginForm />)
    const button = screen.getByRole('button', { name: /Google/ }) as HTMLButtonElement
    expect(button.disabled).toBe(true)
    expect(button.getAttribute('aria-disabled')).toBe('true')
    expect(button.textContent).toContain('Sắp có')
  })

  it('does not log in or navigate when the disabled Google button is clicked', () => {
    render(<LoginForm />)
    fireEvent.click(screen.getByRole('button', { name: /Google/ }))
    expect(mutate).not.toHaveBeenCalled()
    expect(hardNavigate).not.toHaveBeenCalled()
    expect(push).not.toHaveBeenCalled()
    expect(replace).not.toHaveBeenCalled()
  })
})
