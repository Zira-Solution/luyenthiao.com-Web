import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'

import { Pagination } from '@/components/ranking/ranking-controls'

describe('Pagination', () => {
  afterEach(() => cleanup())

  it('hides "Trang trước" on the first page and keeps the school filter', () => {
    render(
      <Pagination base="/ranking" query={{ period: 'all', page: 1, schoolId: 4 }} total={120} />,
    )
    expect(screen.queryByText('Trang trước')).toBeNull()
    expect(screen.getByText('Trang sau').closest('a')?.getAttribute('href')).toBe(
      '/ranking?school=4&page=2',
    )
    expect(screen.getByText('Trang 1/3')).toBeTruthy()
  })

  it('hides "Trang sau" on the last page', () => {
    render(<Pagination base="/ranking" query={{ period: 'all', page: 3 }} total={120} />)
    expect(screen.queryByText('Trang sau')).toBeNull()
    expect(screen.getByText('Trang trước')).toBeTruthy()
  })

  it('still offers a way back when the page is past the end', () => {
    render(<Pagination base="/ranking" query={{ period: 'all', page: 9 }} total={10} />)
    expect(screen.getByText('Trang trước').closest('a')?.getAttribute('href')).toBe('/ranking')
  })

  it('renders nothing when everything fits on the first page', () => {
    const { container } = render(
      <Pagination base="/ranking" query={{ period: 'all', page: 1 }} total={10} />,
    )
    expect(container.firstChild).toBeNull()
  })
})
