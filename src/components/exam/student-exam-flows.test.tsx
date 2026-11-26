import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import type { ReactNode } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { ExamResultView } from './exam-result-view'
import { PartWrite } from './parts'

import { LevelMap } from '@/components/testlevels'
import { useAuthStore } from '@/store/auth-store'

const mocks = vi.hoisted(() => ({
  push: vi.fn(),
  attempt: {
    id: 'att-1',
    examId: 'exam-99',
    levelSlug: 'flyers',
    examTitle: 'Flyers Real Exam 1',
    score: 12,
    total: 25,
    correctCount: 8,
    totalQuestions: 10,
    timeSpentSec: 180,
    createdAt: '2026-11-26T10:00:00Z',
    exam: { id: 'exam-99', name: 'Flyers Real Exam 1', levelSlug: 'flyers' },
    writingSubmissions: [
      {
        id: 'w-sub-1',
        partId: 'p-w',
        answerText: 'Sample essay',
        wordCount: 2,
        score: 4,
        status: 'GRADED' as const,
        feedback: { comment: 'Good vocabulary!', errors: '', tips: '' },
        submittedAt: '2026-11-26T10:00:00Z',
      },
    ],
    speakingSubmissions: [
      {
        id: 's-sub-1',
        partId: 'p-s',
        answers: {},
        status: 'PENDING' as const,
        submittedAt: '2026-11-26T10:00:00Z',
      },
    ],
  },
}))

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mocks.push, back: vi.fn() }),
  useSearchParams: () => new URLSearchParams('attemptId=att-1&examId=exam-99'),
}))

vi.mock('@/hooks/use-student-exams', () => ({
  useExamAttempt: () => ({ data: mocks.attempt, isLoading: false, error: null }),
}))

function wrapper({ children }: { children: ReactNode }) {
  const qc = new QueryClient()
  return <QueryClientProvider client={qc}>{children}</QueryClientProvider>
}

describe('Sub-project A student exam components', () => {
  afterEach(() => {
    cleanup()
    vi.clearAllMocks()
    useAuthStore.setState({ accessToken: null, user: null, status: 'idle' })
  })

  it('LevelMap links unlocked checkpoints to real DB exam UUIDs', () => {
    render(
      <LevelMap
        level={{
          name: 'FLYERS',
          total: 9,
          unlocked: 1,
          mapBackground: '/clone-assets/exam/bg-map.73c46437.jpg',
          mobileBackground: '/clone-assets/exam/bg-back-m.1d28391b.png',
        }}
        exams={[
          {
            id: 'real-uuid-1',
            name: 'Đề Flyers Thật 1',
            levelSlug: 'flyers',
            levelName: 'FLYERS',
            order: 1,
            skills: ['reading', 'writing'],
          },
        ]}
      />,
    )

    const link = screen.getByRole('link', { name: /Đề Flyers Thật 1/ })
    expect(link).toHaveAttribute('href', '/check-point/real-uuid-1')
    expect(screen.getAllByAltText(/\(khoá\)/)).toHaveLength(8)
  })

  it('PartWrite stays read-only preview by default and accepts interactive essay edits', () => {
    const onChange = vi.fn()
    const writePart = {
      id: 'p-w',
      kind: 'write' as const,
      title: 'Part 7 Writing',
      maxScore: 5,
      prompt: {
        title: 'Story',
        instruction: 'Write 20 words',
        images: [],
        sampleAnswer: 'Sample',
      },
      questions: [],
    }

    const { rerender } = render(
      <PartWrite part={writePart} structureName="RW" answers={{}} onChange={onChange} />,
    )
    expect(screen.getByText(/Học viên sẽ nhập bài viết tại đây/)).toBeInTheDocument()

    rerender(
      <PartWrite
        part={writePart}
        structureName="RW"
        answers={{ 'p-w': { essay: 'Two kids' } }}
        onChange={onChange}
        interactive
      />,
    )
    const box = screen.getByLabelText('Bài làm của bạn')
    expect(screen.getByText('2 từ')).toBeInTheDocument()
    fireEvent.change(box, { target: { value: 'Two kids camped' } })
    expect(onChange).toHaveBeenCalledWith('p-w', 'essay', 'Two kids camped')
  })

  it('ExamResultView renders server attempt, writing feedback, and speaking pending card', () => {
    useAuthStore.setState({
      status: 'authenticated',
      accessToken: 'tok',
      user: { id: 9, role: 'USER', username: 'minhan', fullName: 'Minh An' } as never,
    })

    render(<ExamResultView />, { wrapper })
    expect(screen.getByText('Minh An')).toBeInTheDocument()
    expect(screen.getByText('12')).toBeInTheDocument()
    expect(screen.getByText(/Đã chấm: 4 điểm/)).toBeInTheDocument()
    expect(screen.getByText(/Nhận xét: Good vocabulary!/)).toBeInTheDocument()
    expect(screen.getByText('Chờ giáo viên chấm')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /Xem đáp án/ }))
    expect(mocks.push).toHaveBeenCalledWith('/check-point/exam-99?attemptId=att-1&review=true')
  })
})
