import { cleanup, render, screen, within } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'

import { AdminPageHeader } from './admin-page-header'

describe('AdminPageHeader', () => {
  afterEach(() => {
    cleanup()
  })

  it('renders the title as the only h1 and the description', () => {
    render(<AdminPageHeader title="Đề thi" description="Quản lý đề thi" />)
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1)
    expect(screen.getByRole('heading', { level: 1, name: 'Đề thi' })).toBeInTheDocument()
    expect(screen.getByText('Quản lý đề thi')).toBeInTheDocument()
  })

  it('renders no breadcrumb landmark when none are given', () => {
    render(<AdminPageHeader title="Đề thi" />)
    expect(screen.queryByRole('navigation', { name: 'Đường dẫn' })).toBeNull()
  })

  it('links every breadcrumb except the last, which is the current page', () => {
    render(
      <AdminPageHeader
        title="Sửa đề"
        breadcrumbs={[
          { label: 'Trang chủ', href: '/admin' },
          { label: 'Đề thi', href: '/admin/exam' },
          { label: 'Sửa đề' },
        ]}
      />,
    )
    const nav = screen.getByRole('navigation', { name: 'Đường dẫn' })
    expect(
      within(nav)
        .getAllByRole('link')
        .map((a) => a.textContent),
    ).toEqual(['Trang chủ', 'Đề thi'])
    const last = within(nav).getByText('Sửa đề')
    expect(last).toHaveAttribute('aria-current', 'page')
    expect(last.closest('a')).toBeNull()
  })

  it('renders the actions slot', () => {
    render(<AdminPageHeader title="Đề thi" actions={<button type="button">Tạo đề mới</button>} />)
    expect(screen.getByRole('button', { name: 'Tạo đề mới' })).toBeInTheDocument()
  })
})
