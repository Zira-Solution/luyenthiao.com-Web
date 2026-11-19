import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'

import { RequireAdmin } from '@/components/auth'
import { useAuthStore } from '@/store/auth-store'

describe('RequireAdmin', () => {
  afterEach(() => {
    cleanup()
    useAuthStore.setState({ accessToken: null, user: null, status: 'idle' })
  })

  it('renders children for an ADMIN', () => {
    useAuthStore.setState({
      status: 'authenticated',
      accessToken: 't',
      user: { id: 1, role: 'ADMIN' } as never,
    })
    render(<RequireAdmin>editor</RequireAdmin>)
    expect(screen.getByText('editor')).toBeInTheDocument()
  })

  it.each(['STUDENT', 'USER', 'admin'])('shows the not-found view for role %s', (role) => {
    useAuthStore.setState({
      status: 'authenticated',
      accessToken: 't',
      user: { id: 1, role } as never,
    })
    render(<RequireAdmin>editor</RequireAdmin>)
    expect(screen.queryByText('editor')).toBeNull()
    expect(screen.getByText('404')).toBeInTheDocument()
  })

  it('shows the not-found view when authenticated without a user', () => {
    useAuthStore.setState({ status: 'authenticated', accessToken: 't', user: null })
    render(<RequireAdmin>editor</RequireAdmin>)
    expect(screen.queryByText('editor')).toBeNull()
    expect(screen.getByText('404')).toBeInTheDocument()
  })
})
