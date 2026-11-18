import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { RankingView } from '@/components/ranking/ranking-view'
import ranking from '@/schemas/__fixtures__/ranking.json'
import schools from '@/schemas/__fixtures__/schools.json'

const push = vi.fn()
vi.mock('next/navigation', () => ({ useRouter: () => ({ push }), usePathname: () => '/ranking' }))
vi.mock('@/components/ranking/my-rank-card', () => ({ MyRankCard: () => null }))

const query = { period: 'all' as const, page: 1 }

describe('RankingView', () => {
  afterEach(() => {
    cleanup()
    push.mockReset()
  })

  it('renders the public rows without identity fields', () => {
    render(<RankingView query={query} ranking={{ ok: true, data: ranking }} schools={schools} />)
    expect(screen.getByText('Chi L.')).toBeTruthy()
    expect(screen.getAllByText('Trường Tiểu học Trần Phú').length).toBeGreaterThan(0)
    expect(screen.queryByText('hs_chi')).toBeNull()
  })

  it('links the period tabs and keeps the school filter', () => {
    render(
      <RankingView
        query={{ ...query, schoolId: 4 }}
        ranking={{ ok: true, data: ranking }}
        schools={schools}
      />,
    )
    expect(screen.getByText('Tuần').closest('a')?.getAttribute('href')).toBe(
      '/ranking?period=week&school=4',
    )
    expect(screen.queryByText('Ngày')).toBeNull()
  })

  it('links the entity tabs to the two ranking pages', () => {
    render(<RankingView query={query} ranking={{ ok: true, data: ranking }} schools={schools} />)
    expect(screen.getByText('Trường học tích cực').closest('a')?.getAttribute('href')).toBe(
      '/school-ranking',
    )
    expect(screen.getByText('Học sinh xuất sắc').closest('a')?.getAttribute('href')).toBe(
      '/ranking',
    )
  })

  it('pushes the school filter', () => {
    render(<RankingView query={query} ranking={{ ok: true, data: ranking }} schools={schools} />)
    fireEvent.change(screen.getByRole('combobox'), { target: { value: '3' } })
    expect(push).toHaveBeenCalledWith('/ranking?school=3')
  })

  it('shows the error state', () => {
    render(<RankingView query={query} ranking={{ ok: false }} schools={[]} />)
    expect(screen.getByText('Tạm thời không tải được dữ liệu, vui lòng thử lại sau.')).toBeTruthy()
  })

  it('offers a way back when the page is past the end', () => {
    render(
      <RankingView
        query={{ period: 'all', page: 9 }}
        ranking={{ ok: true, data: { items: [], total: 10 } }}
        schools={[]}
      />,
    )
    expect(screen.getByText('Chưa có dữ liệu xếp hạng.')).toBeTruthy()
    expect(screen.getByText('Trang trước').closest('a')).toBeTruthy()
  })
})
