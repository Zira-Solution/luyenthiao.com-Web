import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { MyRankCard } from '@/components/ranking/my-rank-card'
import rankingMe from '@/schemas/__fixtures__/ranking-me.json'

const auth = { status: 'unauthenticated' }
const rank: { data: unknown; isPending: boolean; error: unknown } = {
  data: undefined,
  isPending: false,
  error: null,
}
vi.mock('@/store/auth-store', () => ({
  useAuthStore: (select: (s: { status: string }) => unknown) => select(auth),
}))
vi.mock('@/hooks/use-my-rank', () => ({ useMyRank: () => rank }))

describe('MyRankCard', () => {
  afterEach(() => {
    cleanup()
    rank.data = undefined
    rank.isPending = false
    rank.error = null
  })

  it('invites a guest to log in', () => {
    auth.status = 'unauthenticated'
    render(<MyRankCard period="all" />)
    expect(
      screen.getByText('Đăng nhập để xem hạng của bạn').closest('a')?.getAttribute('href'),
    ).toBe('/login?redirect=%2Franking')
  })

  it('shows loading and no guest link while the session is unresolved', () => {
    auth.status = 'idle'
    render(<MyRankCard period="all" />)
    expect(screen.getByText('Đang tải hạng của bạn…')).toBeTruthy()
    expect(screen.queryByText('Đăng nhập để xem hạng của bạn')).toBeNull()
  })

  it('shows the signed-in student their own rank', () => {
    auth.status = 'authenticated'
    rank.data = rankingMe
    render(<MyRankCard period="all" />)
    expect(screen.getByText('Hạng của bạn: #5 · Nguyễn Minh An · 40 điểm')).toBeTruthy()
  })

  it('shows loading for the signed-in query', () => {
    auth.status = 'authenticated'
    rank.isPending = true
    render(<MyRankCard period="all" />)
    expect(screen.getByText('Đang tải hạng của bạn…')).toBeTruthy()
  })

  it('shows the error message', () => {
    auth.status = 'authenticated'
    rank.error = new Error('Boom')
    render(<MyRankCard period="all" />)
    expect(screen.getByText('Boom')).toBeTruthy()
  })
})
