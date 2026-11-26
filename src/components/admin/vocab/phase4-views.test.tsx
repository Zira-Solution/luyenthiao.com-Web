import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { NotificationsAdminView } from '@/components/admin/notifications'
import { SchoolsAdminView } from '@/components/admin/schools'
import { TasksAdminView } from '@/components/admin/tasks'
import { VocabAdminView } from '@/components/admin/vocab'

const mocks = vi.hoisted(() => ({
  createVocab: vi.fn(),
  updateTask: vi.fn(),
  createNotif: vi.fn(),
  searchUsers: vi.fn(),
}))

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}))

vi.mock('@/components/admin/media', () => ({
  MediaPickerField: ({
    value,
    onChange,
  }: {
    value?: string
    onChange: (v: string | null) => void
  }) => (
    <input
      data-testid="mock-audio-picker"
      value={value ?? ''}
      onChange={(e) => onChange(e.target.value)}
    />
  ),
}))

vi.mock('@/lib/api/admin/notifications', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/api/admin/notifications')>()
  return {
    ...actual,
    searchNotificationUsers: mocks.searchUsers,
  }
})

vi.mock('@/hooks/admin', () => ({
  useAdminPlanets: () => ({
    data: [{ id: 'p1', slug: 'starters', name: 'STARTERS' }],
  }),
  useAdminVocab: () => ({
    data: {
      items: [
        {
          id: 1,
          word: 'adventure',
          ipa: '/ədˈventʃər/',
          type: 'n',
          meaningVi: 'Cuộc phiêu lưu',
          audioUrl: 'https://cdn.example.com/adv.mp3',
          level: 'starters',
          topic: 'Explore',
          active: true,
        },
      ],
      total: 1,
      page: 1,
      limit: 20,
    },
    isLoading: false,
    error: null,
  }),
  useCreateAdminVocab: () => ({ mutateAsync: mocks.createVocab, isPending: false }),
  useUpdateAdminVocab: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useDeleteAdminVocab: () => ({ mutateAsync: vi.fn(), isPending: false }),

  useAdminTasks: () => ({
    data: [
      {
        id: 10,
        title: 'Làm 1 bài thi',
        description: 'Mô tả',
        category: 'DAILY',
        targetCount: 1,
        actionType: 'COMPLETE_EXAM',
        points: 10,
        active: true,
        sortOrder: 1,
      },
    ],
    isLoading: false,
    error: null,
  }),
  useCreateAdminTask: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useUpdateAdminTask: () => ({ mutateAsync: mocks.updateTask, isPending: false }),
  useDeleteAdminTask: () => ({ mutateAsync: vi.fn(), isPending: false }),

  useAdminSchools: () => ({
    data: [
      { id: 1, name: 'Tiểu học Kim Liên', city: 'Hà Nội', active: true, _count: { users: 12 } },
      { id: 2, name: 'Trường Mới', city: 'TP.HCM', active: true, _count: { users: 0 } },
    ],
    isLoading: false,
    error: null,
  }),
  useCreateAdminSchool: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useUpdateAdminSchool: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useDeleteAdminSchool: () => ({ mutateAsync: vi.fn(), isPending: false }),

  useAdminNotifications: () => ({
    data: {
      items: [
        {
          id: 5,
          title: 'Bảo trì',
          message: 'Thông báo bảo trì tối nay',
          type: 'SYSTEM',
          targetUserId: null,
          createdAt: '2026-11-26T10:00:00Z',
          targetUser: null,
          _count: { reads: 15 },
        },
      ],
      total: 1,
      page: 1,
      limit: 20,
    },
    isLoading: false,
    error: null,
  }),
  useCreateAdminNotification: () => ({ mutateAsync: mocks.createNotif, isPending: false }),
  useDeleteAdminNotification: () => ({ mutateAsync: vi.fn(), isPending: false }),
}))

describe('Admin Phase 4 Views', () => {
  beforeEach(() => {
    mocks.createVocab.mockResolvedValue({ id: 2 })
    mocks.updateTask.mockResolvedValue({ id: 10, active: false })
    mocks.createNotif.mockResolvedValue({ id: 6 })
    mocks.searchUsers.mockResolvedValue([{ id: 8, username: 'lan', fullName: 'Ngọc Lan' }])
  })

  afterEach(() => {
    cleanup()
    vi.clearAllMocks()
  })

  it('hiển thị Từ vựng và cho mở modal tạo từ mới', async () => {
    render(<VocabAdminView />)
    expect(screen.getByText('adventure')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Thêm từ vựng' }))
    fireEvent.change(screen.getByLabelText(/Từ vựng \*/i), { target: { value: 'galaxy' } })
    fireEvent.change(screen.getByLabelText(/Nghĩa tiếng Việt \*/i), {
      target: { value: 'Thiên hà' },
    })
    fireEvent.click(screen.getByRole('dialog').querySelector('button[type="submit"]')!)
    await waitFor(() =>
      expect(mocks.createVocab).toHaveBeenCalledWith(
        expect.objectContaining({ word: 'galaxy', meaningVi: 'Thiên hà' }),
      ),
    )
  })

  it('hiển thị Nhiệm vụ và cho bật/tắt trạng thái active', async () => {
    render(<TasksAdminView />)
    expect(screen.getByText('Làm 1 bài thi')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Đang bật' }))
    await waitFor(() =>
      expect(mocks.updateTask).toHaveBeenCalledWith({ id: 10, input: { active: false } }),
    )
  })

  it('khóa nút xóa Trường học khi đang có học viên liên kết', () => {
    render(<SchoolsAdminView />)
    expect(screen.getByRole('button', { name: 'Xóa Tiểu học Kim Liên' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Xóa Trường Mới' })).not.toBeDisabled()
  })

  it('hiển thị Thông báo, tìm kiếm người nhận và gửi thông báo riêng', async () => {
    render(<NotificationsAdminView />)
    expect(screen.getByText('Bảo trì')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Gửi thông báo' }))

    fireEvent.change(screen.getByLabelText(/Đối tượng nhận/i), { target: { value: 'user' } })
    fireEvent.change(screen.getByPlaceholderText(/Tên, username/i), { target: { value: 'lan' } })
    fireEvent.click(screen.getByRole('button', { name: 'Tìm' }))

    const userBtn = await screen.findByText('Ngọc Lan')
    fireEvent.click(userBtn)
    fireEvent.change(screen.getByLabelText(/Tiêu đề \*/i), { target: { value: 'Chúc mừng' } })
    fireEvent.change(screen.getByLabelText(/Nội dung \*/i), { target: { value: 'Bạn đạt top 1' } })
    fireEvent.click(screen.getByRole('dialog').querySelector('button[type="submit"]')!)

    await waitFor(() =>
      expect(mocks.createNotif).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Chúc mừng',
          message: 'Bạn đạt top 1',
          targetUserId: 8,
        }),
      ),
    )
  })
})
