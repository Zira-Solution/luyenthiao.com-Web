import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { MobileNavDrawer } from '@/components/common/mobile-nav-drawer'
import { Topbar } from '@/components/common/topbar'
import { ROUTES } from '@/constants'
import { useAuthStore } from '@/store/auth-store'

const mocks = vi.hoisted(() => ({
  push: vi.fn(),
  mutate: vi.fn(),
}))

vi.mock('next/navigation', () => ({
  usePathname: () => '/',
  useRouter: () => ({ push: mocks.push }),
}))
vi.mock('@/hooks', () => ({ useLogout: () => ({ mutate: mocks.mutate }) }))
vi.mock('@/components/common/unread-badge', () => ({ UnreadBadge: () => <span /> }))

describe('Admin CMS shortcut in student navigation', () => {
  beforeEach(() => {
    mocks.push.mockReset()
  })

  afterEach(() => {
    cleanup()
    useAuthStore.setState({ accessToken: null, user: null, status: 'idle' })
  })

  it('shows Quản trị CMS in desktop Topbar dropdown only for ADMIN role and navigates to /admin', () => {
    useAuthStore.setState({
      status: 'authenticated',
      accessToken: 't',
      user: { id: 1, role: 'USER', username: 'hocvien' } as never,
    })
    const studentView = render(<Topbar />)
    fireEvent.click(screen.getByRole('button', { name: /hocvien/i }))
    expect(screen.queryByRole('button', { name: /Quản trị CMS/ })).toBeNull()
    studentView.unmount()

    useAuthStore.setState({
      status: 'authenticated',
      accessToken: 't',
      user: { id: 2, role: 'ADMIN', username: 'quanly' } as never,
    })
    render(<Topbar />)
    fireEvent.click(screen.getByRole('button', { name: /quanly/i }))
    fireEvent.click(screen.getByRole('button', { name: /Quản trị CMS/ }))
    expect(mocks.push).toHaveBeenCalledWith(ROUTES.ADMIN_HOME)
  })

  it('shows Quản trị CMS in MobileNavDrawer only for ADMIN role', () => {
    const userView = render(
      <MobileNavDrawer
        isOpen
        onClose={() => {}}
        status="authenticated"
        user={{ id: 1, role: 'USER', username: 'hocvien' }}
        onLogin={() => {}}
        onRegister={() => {}}
        onLogout={() => {}}
      />,
    )
    expect(screen.queryByRole('button', { name: /Quản trị CMS/ })).toBeNull()
    userView.unmount()

    render(
      <MobileNavDrawer
        isOpen
        onClose={() => {}}
        status="authenticated"
        user={{ id: 2, role: 'ADMIN', username: 'quanly' }}
        onLogin={() => {}}
        onRegister={() => {}}
        onLogout={() => {}}
      />,
    )
    fireEvent.click(screen.getByRole('button', { name: /Quản trị CMS/ }))
    expect(mocks.push).toHaveBeenCalledWith(ROUTES.ADMIN_HOME)
  })
})
