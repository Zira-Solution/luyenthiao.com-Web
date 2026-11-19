import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { SchoolRankingView } from '@/components/ranking/school-ranking-view'
import schoolRanking from '@/schemas/__fixtures__/ranking-schools.json'

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
  usePathname: () => '/school-ranking',
}))

describe('SchoolRankingView', () => {
  afterEach(() => cleanup())

  it('renders school rows with city and student count', () => {
    render(
      <SchoolRankingView
        query={{ period: 'all', page: 1 }}
        ranking={{ ok: true, data: schoolRanking }}
      />,
    )
    expect(screen.getByText('Trường Tiểu học Trần Phú')).toBeTruthy()
    expect(screen.getByText('Đà Nẵng')).toBeTruthy()
  })

  it('shows the empty state', () => {
    render(
      <SchoolRankingView
        query={{ period: 'all', page: 1 }}
        ranking={{ ok: true, data: { items: [], total: 0 } }}
      />,
    )
    expect(screen.getByText('Chưa có dữ liệu xếp hạng.')).toBeTruthy()
  })
})
