import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { AdminShell } from './admin-shell'

const mocks = vi.hoisted(() => ({ pathname: '/admin/exam' }))

vi.mock('next/navigation', () => ({
  usePathname: () => mocks.pathname,
  useRouter: () => ({ push: vi.fn() }),
}))
vi.mock('@/hooks', () => ({ useLogout: () => ({ mutate: vi.fn() }) }))

function renderShell(): ReturnType<typeof render> {
  return render(
    <AdminShell>
      <p>page body</p>
    </AdminShell>,
  )
}

describe('AdminShell', () => {
  beforeEach(() => {
    mocks.pathname = '/admin/exam'
  })

  afterEach(() => {
    cleanup()
  })

  it('renders the children in the main landmark, applies admin-theme and shows topbar context', () => {
    const { container } = renderShell()
    expect(container.firstElementChild).toHaveClass('admin-theme')
    expect(screen.getByRole('main')).toHaveTextContent('page body')
    expect(screen.getByRole('navigation', { name: 'Menu quản trị' })).toBeInTheDocument()
    expect(screen.getByText('Đề thi', { selector: 'header span' })).toBeInTheDocument()
  })

  it('toggles desktop sidebar collapse state via the topbar button', () => {
    renderShell()
    const collapseBtn = screen.getByRole('button', { name: 'Thu gọn menu quản trị' })
    expect(collapseBtn).toHaveAttribute('aria-pressed', 'false')
    fireEvent.click(collapseBtn)
    const expandBtn = screen.getByRole('button', { name: 'Mở rộng menu quản trị' })
    expect(expandBtn).toHaveAttribute('aria-pressed', 'true')
  })

  it('starts with the drawer closed and a labelled menu button', () => {
    renderShell()
    const button = screen.getByRole('button', { name: 'Mở menu quản trị' })
    expect(button).toHaveAttribute('aria-expanded', 'false')
    const drawerId = button.getAttribute('aria-controls')
    expect(drawerId).toBeTruthy()
    expect(document.getElementById(drawerId as string)).toHaveAttribute('data-open', 'false')
  })

  it('opens the drawer when the menu button is clicked', () => {
    renderShell()
    const button = screen.getByRole('button', { name: 'Mở menu quản trị' })
    fireEvent.click(button)
    expect(button).toHaveAttribute('aria-expanded', 'true')
    expect(document.getElementById(button.getAttribute('aria-controls') as string)).toHaveAttribute(
      'data-open',
      'true',
    )
  })

  it('closes on Escape and returns focus to the menu button', () => {
    renderShell()
    const button = screen.getByRole('button', { name: 'Mở menu quản trị' })
    fireEvent.click(button)
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(button).toHaveAttribute('aria-expanded', 'false')
    expect(button).toHaveFocus()
  })

  it('closes when the overlay is clicked', () => {
    renderShell()
    const button = screen.getByRole('button', { name: 'Mở menu quản trị' })
    fireEvent.click(button)
    fireEvent.click(screen.getByTestId('admin-drawer-overlay'))
    expect(button).toHaveAttribute('aria-expanded', 'false')
  })

  it('closes when the pathname changes', () => {
    const { rerender } = renderShell()
    const button = screen.getByRole('button', { name: 'Mở menu quản trị' })
    fireEvent.click(button)
    expect(button).toHaveAttribute('aria-expanded', 'true')

    mocks.pathname = '/admin/exam/abc'
    rerender(
      <AdminShell>
        <p>page body</p>
      </AdminShell>,
    )
    expect(button).toHaveAttribute('aria-expanded', 'false')
  })
})
