import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import {
  GradingQueueView,
  SpeakingGradingView,
  WritingGradingView,
} from '@/components/admin/grading'

const mocks = vi.hoisted(() => ({
  push: vi.fn(),
  replace: vi.fn(),
  tab: 'writing',
  done: '',
  gradeWritingMutateAsync: vi.fn(),
  gradeSpeakingMutateAsync: vi.fn(),
  listWritingQueueApi: vi.fn(),
  listSpeakingQueueApi: vi.fn(),
}))

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mocks.push, replace: mocks.replace }),
  useSearchParams: () =>
    new URLSearchParams(`tab=${mocks.tab}${mocks.done ? `&done=${mocks.done}` : ''}`),
}))

vi.mock('@/lib/api/admin/grading', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/api/admin/grading')>()
  return {
    ...actual,
    listAdminWritingQueue: mocks.listWritingQueueApi,
    listAdminSpeakingQueue: mocks.listSpeakingQueueApi,
  }
})

const writingSubmissionFixture = {
  id: 'w-1',
  examAttemptId: 'att-w-1',
  partId: 'part-w1',
  userId: 5,
  answerText: 'Two friends explored the mountain together.',
  wordCount: 6,
  score: null,
  status: 'PENDING' as const,
  feedback: null,
  aiScore: 4,
  aiFeedback: { comment: 'Ý tưởng mạch lạc', errors: 'Chưa phát hiện', tips: 'Thêm tính từ' },
  gradedById: null,
  gradedAt: null,
  submittedAt: '2026-11-26T10:00:00.000Z',
  user: { id: 5, username: 'hoa', fullName: 'Lê Hoa', email: 'hoa@test.com' },
  grader: null,
  examAttempt: {
    id: 'att-w-1',
    examTitle: 'Flyers Writing 1',
    createdAt: '2026-11-26T10:00:00.000Z',
    exam: {
      id: 'ex-w-1',
      name: 'Flyers Writing 1',
      levelSlug: 'flyers',
      data: {
        structures: [
          {
            parts: [
              {
                id: 'part-w1',
                kind: 'write',
                title: 'Viết truyện ngắn',
                maxScore: 5,
                prompt: {
                  title: 'Story Writing',
                  instruction: 'Look at the three pictures and write a story.',
                  images: [{ slot: 'story-img-1', src: '/clone-assets/a.png', alt: 'Pic 1' }],
                  sampleAnswer: 'Sample story answer.',
                },
              },
            ],
          },
        ],
      },
    },
  },
}

const speakingSubmissionFixture = {
  id: 's-1',
  examAttemptId: 'att-s-1',
  partId: 'part-s1',
  userId: 6,
  answers: {
    q1: {
      questionId: 'q1',
      answered: true,
      duration: 5,
      audioUrl: 'https://cdn.example.com/rec/q1.webm',
    },
    q2: {
      questionId: 'q2',
      answered: true,
      blobUrl: 'blob:http://localhost/abc',
    },
  },
  autoScore: 2,
  manualScore: null,
  totalScore: 2,
  status: 'PENDING' as const,
  feedback: null,
  aiScore: 8,
  aiFeedback: 'Phát âm rõ ràng',
  gradedById: null,
  gradedAt: null,
  submittedAt: '2026-11-26T10:05:00.000Z',
  user: { id: 6, username: 'minh', fullName: 'Trần Minh', email: 'minh@test.com' },
  grader: null,
  examAttempt: {
    id: 'att-s-1',
    examTitle: 'Starters Speaking 1',
    createdAt: '2026-11-26T10:05:00.000Z',
    exam: {
      id: 'ex-s-1',
      name: 'Starters Speaking 1',
      levelSlug: 'starters',
      data: {
        structures: [
          {
            parts: [
              {
                id: 'part-s1',
                kind: 'speak',
                title: 'Speaking Part 1',
                speakKind: 'mic-plain',
                maxScore: 10,
                speakQuestions: [
                  { id: 'q1', kind: 'mic-plain', text: 'What is your name?' },
                  { id: 'q2', kind: 'mic-plain', text: 'How old are you?' },
                ],
              },
            ],
          },
        ],
      },
    },
  },
}

vi.mock('@/hooks/admin', () => ({
  useAdminWritingQueue: () => ({
    data: {
      items: [writingSubmissionFixture],
      total: 1,
      page: 1,
      limit: 20,
      counts: { pending: 3, graded: 1 },
    },
    isLoading: false,
    error: null,
    refetch: vi.fn(),
  }),
  useAdminSpeakingQueue: () => ({
    data: {
      items: [speakingSubmissionFixture],
      total: 1,
      page: 1,
      limit: 20,
      counts: { pending: 2, graded: 0 },
    },
    isLoading: false,
    error: null,
    refetch: vi.fn(),
  }),
  useAdminWritingSubmission: () => ({
    data: writingSubmissionFixture,
    isLoading: false,
    error: null,
  }),
  useAdminSpeakingSubmission: () => ({
    data: speakingSubmissionFixture,
    isLoading: false,
    error: null,
  }),
  useGradeWritingSubmission: () => ({
    mutateAsync: mocks.gradeWritingMutateAsync,
    isPending: false,
  }),
  useGradeSpeakingSubmission: () => ({
    mutateAsync: mocks.gradeSpeakingMutateAsync,
    isPending: false,
  }),
}))

describe('Admin Grading Views', () => {
  beforeEach(() => {
    mocks.tab = 'writing'
    mocks.done = ''
    mocks.gradeWritingMutateAsync.mockResolvedValue({
      ...writingSubmissionFixture,
      status: 'GRADED',
      score: 4,
    })
    mocks.gradeSpeakingMutateAsync.mockResolvedValue({
      ...speakingSubmissionFixture,
      status: 'GRADED',
      manualScore: 8,
    })
    mocks.listWritingQueueApi.mockResolvedValue({
      items: [],
      total: 0,
      page: 1,
      limit: 5,
      counts: { pending: 0, graded: 1 },
    })
    mocks.listSpeakingQueueApi.mockResolvedValue({
      items: [{ ...speakingSubmissionFixture, id: 's-2' }],
      total: 1,
      page: 1,
      limit: 5,
      counts: { pending: 1, graded: 1 },
    })
  })

  afterEach(() => {
    cleanup()
    vi.clearAllMocks()
  })

  it('render hàng đợi chấm bài Writing và cho chuyển tab sang Speaking', () => {
    render(<GradingQueueView />)
    expect(screen.getByText('Hàng đợi Chấm bài')).toBeInTheDocument()
    expect(screen.getByText('3 chờ')).toBeInTheDocument()
    expect(screen.getByText('2 chờ')).toBeInTheDocument()
    expect(screen.getByText('Lê Hoa')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Chấm bài' })).toHaveAttribute(
      'href',
      '/admin/grading/writing/w-1',
    )

    fireEvent.click(screen.getByRole('tab', { name: /Speaking/i }))
    expect(mocks.replace).toHaveBeenCalledWith('/admin/grading?tab=speaking')
  })

  it('validate điểm Writing vượt maxScore và lưu rubric + Lưu & Chấm tiếp', async () => {
    render(<WritingGradingView submissionId="w-1" />)
    expect(screen.getByText('Look at the three pictures and write a story.')).toBeInTheDocument()
    expect(screen.getByText('Gợi ý AI (chỉ đọc)')).toBeInTheDocument()

    const scoreInput = screen.getByLabelText(/Điểm số nguyên/i)
    fireEvent.change(scoreInput, { target: { value: '9' } })
    fireEvent.click(screen.getByRole('button', { name: 'Lưu điểm' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('0 đến 5')
    expect(mocks.gradeWritingMutateAsync).not.toHaveBeenCalled()

    fireEvent.change(scoreInput, { target: { value: '4' } })
    fireEvent.change(screen.getByLabelText(/Nhận xét chung/i), { target: { value: 'Viết tốt' } })
    fireEvent.click(screen.getByRole('button', { name: /Lưu & Chấm tiếp/i }))

    await waitFor(() =>
      expect(mocks.gradeWritingMutateAsync).toHaveBeenCalledWith({
        id: 'w-1',
        input: {
          score: 4,
          feedback: { comment: 'Viết tốt', errors: '', tips: '' },
        },
      }),
    )
    await waitFor(() =>
      expect(mocks.push).toHaveBeenCalledWith('/admin/grading?tab=writing&done=1'),
    )
  })

  it('hiển thị trình phát audio R2, cảnh báo blob-only và chuyển sang bài Speaking kế tiếp', async () => {
    render(<SpeakingGradingView submissionId="s-1" />)
    expect(screen.getByText('What is your name?')).toBeInTheDocument()
    const audioEl = document.querySelector('audio')
    expect(audioEl).toHaveAttribute('src', 'https://cdn.example.com/rec/q1.webm')
    expect(screen.getByText(/URL blob tạm/i)).toBeInTheDocument()

    fireEvent.change(screen.getByLabelText(/Điểm giáo viên/i), { target: { value: '8' } })
    fireEvent.change(screen.getByLabelText(/Nhận xét bài nói/i), { target: { value: 'Trôi chảy' } })
    fireEvent.click(screen.getByRole('button', { name: /Lưu & Chấm tiếp/i }))

    await waitFor(() =>
      expect(mocks.gradeSpeakingMutateAsync).toHaveBeenCalledWith({
        id: 's-1',
        input: { manualScore: 8, feedback: 'Trôi chảy' },
      }),
    )
    await waitFor(() => expect(mocks.push).toHaveBeenCalledWith('/admin/grading/speaking/s-2'))
  })
})
