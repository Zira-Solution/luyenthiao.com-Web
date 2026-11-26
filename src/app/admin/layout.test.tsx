import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import AdminLayout from './layout'

import { useAuthStore } from '@/store/auth-store'

const mocks = vi.hoisted(() => ({ replace: vi.fn() }))

vi.mock('next/navigation', () => ({
  usePathname: () => '/admin/exam',
  useRouter: () => ({ push: vi.fn(), replace: mocks.replace }),
}))
vi.mock('@/hooks', () => ({ useLogout: () => ({ mutate: vi.fn() }) }))

function signIn(role: string): void {
  useAuthStore.setState({
    status: 'authenticated',
    accessToken: 't',
    user: { id: 1, role, fullName: 'Admin' } as never,
  })
}

describe('AdminLayout', () => {
  afterEach(() => {
    cleanup()
    mocks.replace.mockReset()
    useAuthStore.setState({ accessToken: null, user: null, status: 'idle', signedOut: false })
  })

  it('renders nothing and redirects to /login for an unauthenticated visitor', () => {
    useAuthStore.setState({ status: 'unauthenticated', accessToken: null, user: null })
    render(
      <AdminLayout>
        <p>admin page</p>
      </AdminLayout>,
    )
    expect(screen.queryByText('admin page')).toBeNull()
    expect(screen.queryByRole('navigation')).toBeNull()
    expect(mocks.replace).toHaveBeenCalledTimes(1)
    expect(mocks.replace.mock.calls[0]?.[0]).toMatch(/^\/login/)
  })

  it('renders the shell and the children for an admin', () => {
    signIn('ADMIN')
    render(
      <AdminLayout>
        <p>admin page</p>
      </AdminLayout>,
    )
    expect(screen.getByText('admin page')).toBeInTheDocument()
    expect(screen.getByRole('navigation', { name: 'Menu quản trị' })).toBeInTheDocument()
  })

  it('shows only the not-found view, with no sidebar, for a signed-in non-admin', () => {
    signIn('USER')
    render(
      <AdminLayout>
        <p>admin page</p>
      </AdminLayout>,
    )
    expect(screen.queryByText('admin page')).toBeNull()
    expect(screen.queryByRole('navigation')).toBeNull()
    expect(screen.getByText('404')).toBeInTheDocument()
  })
})
