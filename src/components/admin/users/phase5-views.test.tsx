import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { AttemptsAdminView, ChallengesAdminView } from '@/components/admin/monitoring'
import { UsersAdminView } from '@/components/admin/users'
import { useAuthStore } from '@/store/auth-store'

const mocks = vi.hoisted(() => ({
  updateUserMutateAsync: vi.fn(),
}))

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}))

vi.mock('@/hooks/admin', () => ({
  useAdminSchools: () => ({
    data: [{ id: 1, name: 'TH Kim Liên', city: 'HN', active: true }],
  }),
  useAdminPlanets: () => ({
    data: [{ id: 'p1', slug: 'movers', name: 'MOVERS' }],
  }),
  useAdminUsers: () => ({
    data: {
      items: [
        {
          id: 1,
          username: 'admin',
          fullName: 'Quản trị viên',
          email: 'admin@test.com',
          role: 'ADMIN',
          isBanned: false,
          schoolId: null,
          createdAt: '2026-11-26T00:00:00Z',
          school: null,
          _count: { examAttempts: 0, pointLogs: 0 },
        },
        {
          id: 15,
          username: 'student15',
          fullName: 'Hoàng Nam',
          email: 'nam@test.com',
          role: 'USER',
          isBanned: false,
          schoolId: 1,
          createdAt: '2026-11-26T00:00:00Z',
          school: { id: 1, name: 'TH Kim Liên', city: 'HN' },
          _count: { examAttempts: 4, pointLogs: 9 },
        },
      ],
      total: 2,
      page: 1,
      limit: 20,
    },
    isLoading: false,
    error: null,
  }),
  useAdminUserDetail: () => ({ data: undefined, isLoading: false, error: null }),
  useUpdateAdminUser: () => ({ mutateAsync: mocks.updateUserMutateAsync, isPending: false }),

  useAdminAttempts: () => ({
    data: {
      items: [
        {
          id: 'att-99',
          examId: 'ex-1',
          userId: 15,
          levelSlug: 'movers',
          examTitle: 'Movers Practice 1',
          score: 18,
          total: 25,
          correctCount: 18,
          totalQuestions: 25,
          timeSpentSec: 125,
          createdAt: '2026-11-26T10:00:00Z',
          user: { id: 15, username: 'student15', fullName: 'Hoàng Nam' },
          _count: { writingSubmissions: 1, speakingSubmissions: 0 },
        },
      ],
      total: 1,
      page: 1,
      limit: 20,
    },
    isLoading: false,
    error: null,
  }),
  useAdminChallengeRooms: () => ({
    data: {
      items: [
        {
          id: 'rm-1',
          code: 'ROOM99',
          levelSlug: 'movers',
          examId: 'ex-1',
          title: 'Đấu trường 1',
          status: 'waiting',
          maxPlayers: 2,
          totalQuestions: 10,
          createdAt: '2026-11-26T10:00:00Z',
          players: [
            { id: 'pl-1', userId: 15, name: 'Hoàng Nam', isBot: false, isHost: true, score: 3 },
          ],
        },
      ],
      total: 1,
      page: 1,
      limit: 20,
    },
    isLoading: false,
    error: null,
  }),
  useAdminChallengeResults: () => ({
    data: {
      items: [
        {
          id: 'cr-1',
          code: 'WIN123',
          levelSlug: 'movers',
          title: 'Trận chung kết',
          totalQuestions: 10,
          players: [{ name: 'Hoàng Nam', score: 9 }],
          playedAt: '2026-11-26T11:00:00Z',
        },
      ],
      total: 1,
      page: 1,
      limit: 20,
    },
    isLoading: false,
    error: null,
  }),
  useAdminPoints: () => ({
    data: {
      items: [
        {
          id: 50,
          userId: 15,
          points: 15,
          source: 'EXAM',
          refId: 'att-99',
          createdAt: '2026-11-26T11:05:00Z',
          user: { id: 15, username: 'student15', fullName: 'Hoàng Nam' },
        },
      ],
      total: 1,
      page: 1,
      limit: 20,
    },
    isLoading: false,
    error: null,
  }),
}))

describe('Admin Phase 5 Views', () => {
  beforeEach(() => {
    useAuthStore.setState({
      status: 'authenticated',
      accessToken: 'tok',
      user: { id: 1, role: 'ADMIN' },
    })
    mocks.updateUserMutateAsync.mockResolvedValue({ id: 15, isBanned: true })
    vi.spyOn(window, 'confirm').mockReturnValue(true)
  })

  afterEach(() => {
    cleanup()
    vi.restoreAllMocks()
    vi.clearAllMocks()
    useAuthStore.setState({ accessToken: null, user: null, status: 'idle' })
  })

  it('chặn tự khóa/tự hạ quyền bản thân và cho phép khóa tài khoản khác qua confirm', async () => {
    render(<UsersAdminView />)
    expect(screen.getByLabelText('Vai trò của admin')).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Khóa admin' })).toBeDisabled()

    fireEvent.click(screen.getByRole('button', { name: 'Khóa student15' }))
    await waitFor(() =>
      expect(mocks.updateUserMutateAsync).toHaveBeenCalledWith({
        id: 15,
        input: { isBanned: true },
      }),
    )
  })

  it('hiển thị bảng Lịch sử làm bài và 3 tab Đấu trường / Kết quả / Điểm', () => {
    render(<AttemptsAdminView />)
    expect(screen.getByText('Movers Practice 1')).toBeInTheDocument()
    expect(screen.getAllByText('18/25')).toHaveLength(2)
    cleanup()

    render(<ChallengesAdminView />)
    expect(screen.getByText('ROOM99')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('tab', { name: /Kết quả trận/i }))
    expect(screen.getByText('WIN123')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('tab', { name: /Nhật ký điểm/i }))
    expect(screen.getByText('+15')).toBeInTheDocument()
  })
})
