import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { ADMIN_NAV } from './admin-nav'
import { AdminSidebar } from './admin-sidebar'

import { useAuthStore } from '@/store/auth-store'

const mocks = vi.hoisted(() => ({
  pathname: '/admin/exam/x',
  push: vi.fn(),
  mutate: vi.fn(),
}))

vi.mock('next/navigation', () => ({
  usePathname: () => mocks.pathname,
  useRouter: () => ({ push: mocks.push }),
}))
vi.mock('@/hooks', () => ({ useLogout: () => ({ mutate: mocks.mutate }) }))

function setUser(user: Record<string, unknown>): void {
  useAuthStore.setState({
    status: 'authenticated',
    accessToken: 't',
    user: { id: 1, role: 'ADMIN', ...user } as never,
  })
}

describe('AdminSidebar', () => {
  beforeEach(() => {
    mocks.pathname = '/admin/exam/x'
    setUser({ fullName: 'Nguyen Van A', username: 'admin' })
  })

  afterEach(() => {
    cleanup()
    mocks.push.mockReset()
    mocks.mutate.mockReset()
    useAuthStore.setState({ accessToken: null, user: null, status: 'idle' })
  })

  it('renders the brand, the nav landmark and every configured item', () => {
    render(<AdminSidebar />)
    expect(screen.getByText('Luyenthiao')).toBeInTheDocument()
    expect(screen.getByText('CMS')).toBeInTheDocument()
    expect(screen.getByRole('navigation', { name: 'Menu quản trị' })).toBeInTheDocument()
    for (const group of ADMIN_NAV) {
      expect(screen.getByText(group.label)).toBeInTheDocument()
      for (const item of group.items) {
        expect(screen.getByRole('link', { name: item.label })).toHaveAttribute('href', item.href)
      }
    }
  })

  it('marks the item of a nested route as the current page without matching the root', () => {
    render(<AdminSidebar />)
    expect(screen.getByRole('link', { name: 'Đề thi' })).toHaveAttribute('aria-current', 'page')
    expect(screen.getByRole('link', { name: 'Trang tổng quan' })).not.toHaveAttribute(
      'aria-current',
    )
  })

  it('marks the overview item active only on /admin', () => {
    mocks.pathname = '/admin'
    render(<AdminSidebar />)
    expect(screen.getByRole('link', { name: 'Trang tổng quan' })).toHaveAttribute(
      'aria-current',
      'page',
    )
    expect(screen.getByRole('link', { name: 'Đề thi' })).not.toHaveAttribute('aria-current')
  })

  it('keeps accessible navigation labels when collapsed', () => {
    render(<AdminSidebar collapsed />)
    expect(screen.getByRole('link', { name: 'Trang tổng quan' })).toHaveAttribute('href', '/admin')
    expect(screen.getByRole('link', { name: 'Đề thi' })).toHaveAttribute('href', '/admin/exam')
  })

  it('does not mark an item for an unrelated route', () => {
    mocks.pathname = '/admin/examination'
    render(<AdminSidebar />)
    expect(screen.getByRole('link', { name: 'Đề thi' })).not.toHaveAttribute('aria-current')
  })

  it('shows the full name and the role of the signed-in user', () => {
    render(<AdminSidebar />)
    expect(screen.getByText('Nguyen Van A')).toBeInTheDocument()
    expect(screen.getByText('ADMIN')).toBeInTheDocument()
  })

  it('falls back to the username when there is no full name', () => {
    setUser({ fullName: undefined, username: 'admin' })
    render(<AdminSidebar />)
    expect(screen.getByText('admin')).toBeInTheDocument()
  })

  it('links back to the learner site', () => {
    render(<AdminSidebar />)
    expect(screen.getByRole('link', { name: 'Về trang học viên' })).toHaveAttribute('href', '/')
  })

  it('signs out through the logout mutation and then goes home', () => {
    render(<AdminSidebar />)
    fireEvent.click(screen.getByRole('button', { name: 'Đăng xuất' }))
    expect(mocks.mutate).toHaveBeenCalledTimes(1)
    const options = mocks.mutate.mock.calls[0]?.[1] as { onSettled: () => void }
    options.onSettled()
    expect(mocks.push).toHaveBeenCalledWith('/')
  })

  it('calls onNavigate when a link is clicked', () => {
    const onNavigate = vi.fn()
    render(<AdminSidebar onNavigate={onNavigate} />)
    fireEvent.click(screen.getByRole('link', { name: 'Đề thi' }))
    expect(onNavigate).toHaveBeenCalledTimes(1)
  })
})
