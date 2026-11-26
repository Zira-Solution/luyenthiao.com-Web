import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { QuestionBankView } from './question-bank-view'

import type { AdminQuestionQueryParams } from '@/lib/query-keys'
import type { AdminQuestion } from '@/schemas/admin-question'

const mocks = vi.hoisted(() => ({
  lastQuery: undefined as AdminQuestionQueryParams | undefined,
  questions: [] as AdminQuestion[],
  total: 0,
  isLoading: false,
  error: null as Error | null,
  createMutateAsync: vi.fn(),
  updateMutateAsync: vi.fn(),
  deleteMutateAsync: vi.fn(),
}))

vi.mock('@/hooks/admin', () => ({
  useAdminQuestions: (params?: AdminQuestionQueryParams) => {
    mocks.lastQuery = params
    return {
      data: {
        items: mocks.questions,
        total: mocks.total,
        page: params?.page ?? 1,
        limit: params?.limit ?? 20,
      },
      isLoading: mocks.isLoading,
      error: mocks.error,
    }
  },
  useAdminPlanets: () => ({
    data: [
      { id: 'pl1', slug: 'movers', name: 'MOVERS', subtitle: 'World', sortOrder: 1, visible: true },
      {
        id: 'pl2',
        slug: 'flyers',
        name: 'FLYERS',
        subtitle: 'World 2',
        sortOrder: 2,
        visible: true,
      },
    ],
  }),
  useCreateAdminQuestion: () => ({ mutateAsync: mocks.createMutateAsync, isPending: false }),
  useUpdateAdminQuestion: () => ({ mutateAsync: mocks.updateMutateAsync, isPending: false }),
  useDeleteAdminQuestion: () => ({ mutateAsync: mocks.deleteMutateAsync, isPending: false }),
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

describe('QuestionBankView', () => {
  beforeEach(() => {
    mocks.lastQuery = undefined
    mocks.questions = [
      {
        id: 'q1',
        levelSlug: 'movers',
        kind: 'multichoice',
        skillTags: ['reading'],
        question: { id: 'q1', title: 'Where is the cat?', isExample: false, details: [] },
      },
    ]
    mocks.total = 1
    mocks.isLoading = false
    mocks.error = null
    mocks.createMutateAsync.mockReset()
    mocks.updateMutateAsync.mockReset()
    mocks.deleteMutateAsync.mockReset()
  })

  afterEach(() => {
    cleanup()
  })

  it('renders header, rows and light-theme markup', () => {
    const { container } = render(<QuestionBankView />)
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Kho câu hỏi')
    expect(screen.getByText('Where is the cat?')).toBeInTheDocument()
    for (const marker of DARK_MARKERS) {
      expect(container.innerHTML).not.toContain(marker)
    }
  })

  it('forwards filters and search queries to useAdminQuestions', () => {
    render(<QuestionBankView />)
    fireEvent.change(screen.getByLabelText('Lọc hành tinh'), { target: { value: 'flyers' } })
    fireEvent.change(screen.getByLabelText('Lọc kỹ năng'), { target: { value: 'speaking' } })
    fireEvent.change(screen.getByPlaceholderText('Tìm nội dung câu hỏi…'), {
      target: { value: 'cat' },
    })

    expect(mocks.lastQuery).toMatchObject({
      level: 'flyers',
      skill: 'speaking',
      q: 'cat',
      page: 1,
    })
  })

  it('creates, updates and deletes a question via mutations', async () => {
    mocks.createMutateAsync.mockResolvedValueOnce(mocks.questions[0])
    mocks.updateMutateAsync.mockResolvedValueOnce(mocks.questions[0])
    mocks.deleteMutateAsync.mockResolvedValueOnce({ message: 'Đã xóa.' })
    vi.spyOn(window, 'confirm').mockReturnValue(true)

    render(<QuestionBankView />)

    fireEvent.click(screen.getByRole('button', { name: /Tạo câu hỏi/ }))
    fireEvent.change(screen.getByLabelText('Hành tinh (câu hỏi)'), { target: { value: 'movers' } })
    fireEvent.click(screen.getByRole('button', { name: 'Lưu câu hỏi' }))
    await waitFor(() => {
      expect(mocks.createMutateAsync).toHaveBeenCalledTimes(1)
    })

    fireEvent.click(screen.getByRole('button', { name: /Sửa q1/ }))
    fireEvent.click(screen.getByRole('button', { name: 'Lưu câu hỏi' }))
    await waitFor(() => {
      expect(mocks.updateMutateAsync).toHaveBeenCalledWith(expect.objectContaining({ id: 'q1' }))
    })

    fireEvent.click(screen.getByRole('button', { name: /Xóa q1/ }))
    await waitFor(() => {
      expect(mocks.deleteMutateAsync).toHaveBeenCalledWith('q1')
    })

    vi.restoreAllMocks()
  })
})
