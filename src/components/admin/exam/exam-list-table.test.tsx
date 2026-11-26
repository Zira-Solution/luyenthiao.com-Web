import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { ExamListTable } from './exam-list-table'

import type { Exam } from '@/types/exam'

const mocks = vi.hoisted(() => ({
  push: vi.fn(),
  exams: [] as Exam[],
  isLoading: false,
  error: null as Error | null,
  createMutateAsync: vi.fn(),
  deleteMutateAsync: vi.fn(),
  toggleDemoMutateAsync: vi.fn(),
}))

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mocks.push }),
}))

vi.mock('@/hooks/admin', () => ({
  useAdminExams: () => ({
    data: mocks.exams,
    isLoading: mocks.isLoading,
    error: mocks.error,
  }),
  useAdminPlanets: () => ({
    data: [
      { id: 'pl-1', slug: 'a1', name: 'A1', subtitle: 'A1 World', sortOrder: 1, visible: true },
      {
        id: 'pl-2',
        slug: 'flyers',
        name: 'FLYERS',
        subtitle: 'Khu Vườn Thần Tiên',
        sortOrder: 2,
        visible: true,
      },
    ],
  }),
  useCreateAdminExam: () => ({ mutateAsync: mocks.createMutateAsync, isPending: false }),
  useDeleteAdminExam: () => ({ mutateAsync: mocks.deleteMutateAsync, isPending: false }),
  useToggleExamDemo: () => ({ mutateAsync: mocks.toggleDemoMutateAsync, isPending: false }),
}))

const DARK_MARKERS = [
  'bg-white/',
  'text-white/',
  'border-white/',
  'backdrop-blur',
  'bg-dashboard-bg',
  'bg-topbar-login-bg',
  'text-game-',
  'bg-game-',
  'bg-slate-900',
  'placeholder:text-slate-400',
  'placeholder:text-white/',
]

function makeExam(id: string, name: string, extra: Partial<Exam> = {}): Exam {
  return {
    id,
    name,
    levelSlug: 'a1',
    levelName: 'A1',
    isDemo: false,
    structures: [{ id: `${id}-s1`, name: 'Reading', minutes: 30, parts: [] }],
    ...extra,
  }
}

describe('ExamListTable', () => {
  beforeEach(() => {
    mocks.push.mockReset()
    mocks.createMutateAsync.mockReset()
    mocks.deleteMutateAsync.mockReset()
    mocks.toggleDemoMutateAsync.mockReset()
    mocks.exams = []
    mocks.isLoading = false
    mocks.error = null
    localStorage.clear()
  })

  afterEach(() => {
    cleanup()
    localStorage.clear()
  })

  it('renders the page header with the title and the three action buttons', () => {
    render(<ExamListTable />)
    const headings = screen.getAllByRole('heading', { level: 1 })
    expect(headings).toHaveLength(1)
    expect(headings[0]).toHaveTextContent('Quản lý đề thi')
    expect(screen.getByRole('button', { name: 'Tạo đề mới' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Nhập' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Xuất' })).toBeInTheDocument()

    expect(screen.getByRole('button', { name: 'Tạo đề mới' })).toHaveClass('bg-admin-primary')

    fireEvent.click(screen.getByRole('button', { name: 'Tạo đề mới' }))
    expect(mocks.push).toHaveBeenCalledWith('/admin/exam/new')
  })

  it('renders the breadcrumbs with a link home and the current page', () => {
    render(<ExamListTable />)
    const nav = screen.getByRole('navigation', { name: 'Đường dẫn' })
    expect(nav).toHaveTextContent('Trang chủ')
    expect(screen.getByRole('link', { name: 'Trang chủ' })).toHaveAttribute('href', '/')
    expect(screen.getByText('Đề thi')).toHaveAttribute('aria-current', 'page')
  })

  it('shows the empty state when there are no exams', () => {
    render(<ExamListTable />)
    expect(screen.getByText('Chưa có đề thi nào')).toBeInTheDocument()
  })

  it('renders rows with order and demo badge and toggles demo via API mutation', async () => {
    mocks.exams = [
      makeExam('e1', 'Đề số 1', { isDemo: true, order: 1 }),
      makeExam('e2', 'Đề số 2', { isDemo: false, order: 2 }),
    ]
    mocks.toggleDemoMutateAsync.mockResolvedValueOnce(makeExam('e2', 'Đề số 2', { isDemo: true }))
    render(<ExamListTable />)

    expect(screen.getByRole('button', { name: 'Đề số 1' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Đề số 2' })).toBeInTheDocument()
    expect(screen.getAllByRole('row')).toHaveLength(3)
    expect(screen.getByText('Demo')).toBeInTheDocument()

    const demoButtons = screen.getAllByRole('button', { name: /Demo/i })
    fireEvent.click(demoButtons[1] as HTMLElement)
    await waitFor(() => {
      expect(mocks.toggleDemoMutateAsync).toHaveBeenCalledWith({ id: 'e2', isDemo: true })
    })
  })

  it('navigates to the editor when a name is clicked', () => {
    mocks.exams = [makeExam('e1', 'Đề số 1')]
    render(<ExamListTable />)
    fireEvent.click(screen.getByRole('button', { name: 'Đề số 1' }))
    expect(mocks.push).toHaveBeenCalledWith('/admin/exam/e1')
  })

  it('filters exams by search text and planet dropdown', () => {
    mocks.exams = [
      makeExam('e1', 'Movers Test 1', { levelSlug: 'a1', levelName: 'A1' }),
      makeExam('e2', 'Flyers Demo', { levelSlug: 'flyers', levelName: 'FLYERS' }),
    ]
    render(<ExamListTable />)

    fireEvent.change(screen.getByPlaceholderText('Tìm theo tên đề, ID hoặc cấp độ…'), {
      target: { value: 'Flyers' },
    })
    expect(screen.queryByRole('button', { name: 'Movers Test 1' })).toBeNull()
    expect(screen.getByRole('button', { name: 'Flyers Demo' })).toBeInTheDocument()

    fireEvent.change(screen.getByPlaceholderText('Tìm theo tên đề, ID hoặc cấp độ…'), {
      target: { value: '' },
    })
    fireEvent.change(screen.getByLabelText('Lọc theo hành tinh'), { target: { value: 'a1' } })
    expect(screen.getByRole('button', { name: 'Movers Test 1' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Flyers Demo' })).toBeNull()
  })

  it('offers one-click sync when legacy localStorage exams exist', async () => {
    const legacy = makeExam('exam_legacy-1', 'Đề cũ trình duyệt')
    localStorage.setItem('ela.exams.v1', JSON.stringify([legacy]))
    mocks.createMutateAsync.mockResolvedValueOnce({ ...legacy, id: 'server-uuid' })

    render(<ExamListTable />)
    expect(screen.getByText(/Phát hiện 1 đề thi cũ/)).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /Đồng bộ lên máy chủ/ }))

    await waitFor(() => {
      expect(mocks.createMutateAsync).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'Đề cũ trình duyệt' }),
      )
    })
  })

  it('renders no dark-theme classes', () => {
    mocks.exams = [makeExam('e1', 'Đề số 1')]
    const { container, unmount } = render(<ExamListTable />)
    for (const marker of DARK_MARKERS) {
      expect(container.innerHTML).not.toContain(marker)
    }
    unmount()

    mocks.exams = []
    const empty = render(<ExamListTable />)
    for (const marker of DARK_MARKERS) {
      expect(empty.container.innerHTML).not.toContain(marker)
    }
  })
})
