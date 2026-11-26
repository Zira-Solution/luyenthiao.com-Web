import { cleanup, render, screen, within } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { AdminOverview } from './admin-overview'

import type { Exam } from '@/types/exam'

function makeExam(id: string, name: string, levelSlug: string, partCount: number): Exam {
  return {
    id,
    name,
    levelSlug,
    levelName: levelSlug.toUpperCase(),
    structures: [
      {
        id: `${id}-s1`,
        name: 'Listening',
        minutes: 25,
        parts: Array.from({ length: partCount }, (_, i) => ({
          id: `${id}-p${i}`,
          kind: 'gapfill' as const,
          title: `Part ${i + 1}`,
          questions: [],
        })),
      },
    ],
  }
}

const mocks = vi.hoisted(() => ({
  exams: [makeExam('e1', 'Starters 1', 'starters', 3), makeExam('e2', 'Starters 2', 'starters', 4)],
  questionTotal: 42,
}))

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}))

vi.mock('@/hooks/admin', () => ({
  useAdminExams: () => ({ data: mocks.exams, isLoading: false, error: null }),
  useAdminQuestions: () => ({
    data: { items: [], total: mocks.questionTotal, page: 1, limit: 1 },
    isLoading: false,
    error: null,
  }),
  useAdminStats: () => ({
    data: {
      usersTotal: 120,
      usersBanned: 2,
      examsTotal: 2,
      examsDemo: 1,
      questionsTotal: 42,
      planetsTotal: 5,
      attemptsTotal: 340,
      writingPending: 3,
      speakingPending: 4,
      challengesTotal: 15,
      vocabTotal: 80,
      tasksTotal: 8,
      schoolsTotal: 6,
      recentAttempts: [],
    },
    isLoading: false,
    error: null,
  }),
}))

describe('AdminOverview', () => {
  afterEach(() => {
    cleanup()
  })

  it('renders the page header and real stats from admin API queries', () => {
    render(<AdminOverview />)
    const headings = screen.getAllByRole('heading', { level: 1 })
    expect(headings).toHaveLength(1)
    expect(headings[0]).toHaveTextContent('Tổng quan quản trị')

    expect(within(screen.getByTestId('kpi-exams')).getByText('2')).toBeInTheDocument()
    expect(within(screen.getByTestId('kpi-parts')).getByText('7')).toBeInTheDocument()
    expect(within(screen.getByTestId('kpi-levels')).getByText('1')).toBeInTheDocument()
    expect(within(screen.getByTestId('kpi-questions')).getByText('42')).toBeInTheDocument()
    expect(within(screen.getByTestId('kpi-users')).getByText('120')).toBeInTheDocument()
    expect(within(screen.getByTestId('kpi-grading')).getByText('7')).toBeInTheDocument()
    expect(within(screen.getByTestId('kpi-attempts')).getByText('340')).toBeInTheDocument()
    expect(within(screen.getByTestId('kpi-challenges')).getByText('15')).toBeInTheDocument()
  })

  it('renders recent exams and the updated CMS module readiness map', () => {
    render(<AdminOverview />)
    expect(screen.getByText('Đề thi gần đây')).toBeInTheDocument()
    expect(screen.getByText('Starters 1')).toBeInTheDocument()
    expect(screen.getByText('Starters 2')).toBeInTheDocument()
    expect(screen.getByText('Lộ trình phân hệ Admin CMS')).toBeInTheDocument()
    expect(screen.getByText('Chấm bài Speaking & Writing')).toBeInTheDocument()
    expect(screen.getAllByText('Đã kết nối API')).toHaveLength(6)
  })

  it('links to the exam list, question bank, grading queue and new exam editor', () => {
    render(<AdminOverview />)
    const examLinks = screen.getAllByRole('link', { name: /Quản lý đề thi/ })
    expect(examLinks.length).toBeGreaterThanOrEqual(1)
    for (const link of examLinks) {
      expect(link).toHaveAttribute('href', '/admin/exam')
    }

    const questionLinks = screen.getAllByRole('link', { name: /Kho câu hỏi/ })
    expect(questionLinks.length).toBeGreaterThanOrEqual(1)
    for (const link of questionLinks) {
      expect(link).toHaveAttribute('href', '/admin/questions')
    }

    expect(screen.getByRole('link', { name: /Chấm bài tự luận/ })).toHaveAttribute(
      'href',
      '/admin/grading',
    )
    expect(screen.getByRole('link', { name: /Tạo đề mới/ })).toHaveAttribute(
      'href',
      '/admin/exam/new',
    )
  })
})
