import { act, cleanup, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { RequireAuth } from '@/components/auth'
import { useAuthStore } from '@/store/auth-store'

const replace = vi.fn()
vi.mock('next/navigation', () => ({ useRouter: () => ({ replace }) }))

describe('RequireAuth', () => {
  beforeEach(() => {
    replace.mockReset()
    window.history.replaceState(null, '', '/history?page=2')
  })
  afterEach(() => {
    cleanup()
    useAuthStore.setState({ accessToken: null, user: null, status: 'idle', signedOut: false })
  })

  it('renders nothing while the session is bootstrapping', () => {
    useAuthStore.setState({ status: 'idle' })
    render(<RequireAuth>secret</RequireAuth>)
    expect(screen.queryByText('secret')).toBeNull()
    expect(replace).not.toHaveBeenCalled()
  })

  it('sends an unauthenticated visitor to /login with the current path', () => {
    useAuthStore.setState({ status: 'unauthenticated' })
    render(<RequireAuth>secret</RequireAuth>)
    expect(replace).toHaveBeenCalledWith('/login?redirect=%2Fhistory%3Fpage%3D2')
    expect(screen.queryByText('secret')).toBeNull()
  })

  it('sends a visitor who signs out while mounted to / instead of /login', () => {
    useAuthStore.setState({ status: 'authenticated', accessToken: 't', user: { id: 1 } as never })
    render(<RequireAuth>secret</RequireAuth>)
    act(() => useAuthStore.setState({ status: 'unauthenticated', signedOut: true }))
    expect(replace).toHaveBeenCalledWith('/')
    expect(replace).not.toHaveBeenCalledWith(expect.stringContaining('/login'))
  })

  it('sends a fresh mount to /login even if signedOut is still set', () => {
    useAuthStore.setState({ status: 'unauthenticated', signedOut: true })
    render(<RequireAuth>secret</RequireAuth>)
    expect(replace).toHaveBeenCalledWith('/login?redirect=%2Fhistory%3Fpage%3D2')
  })

  it('renders children once authenticated', () => {
    useAuthStore.setState({
      status: 'authenticated',
      accessToken: 't',
      user: { id: 1, role: 'STUDENT' } as never,
    })
    render(<RequireAuth>secret</RequireAuth>)
    expect(screen.getByText('secret')).toBeInTheDocument()
  })
})
