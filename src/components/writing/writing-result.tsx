'use client'

import { Loader2 } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'

import { WritingFlow } from './writing-flow'
import { WritingResultOverview } from './writing-result-overview'
import { WritingReview } from './writing-review'

import {
  useStudentExam,
  useSubmitExamAttempt,
  useWritingHistory,
  useWritingSubmissionDetail,
} from '@/hooks/use-student-exams'
import {
  countWords,
  toWritingAttemptFromSubmission,
  toWritingTestFromExam,
} from '@/lib/student-exam'
import { writingTestMock } from '@/mocks/writing'
import { useAuthStore } from '@/store/auth-store'
import type { WritingAttempt } from '@/types/writing'

interface WritingResultContentProps {
  attempt: WritingAttempt
  writeSlug: string
}

type View = 'overview' | 'review'

export function WritingResultContent({
  attempt,
  writeSlug,
}: WritingResultContentProps): React.ReactElement {
  const router = useRouter()
  const searchParams = useSearchParams()
  const user = useAuthStore((s) => s.user) as { fullName?: string; username?: string } | null
  const [view, setView] = useState<View>('overview')

  const userAnswer = searchParams.get('answer') ?? attempt.userAnswer
  const hydrated: WritingAttempt = userAnswer ? { ...attempt, userAnswer } : attempt
  const studentName = user?.fullName || user?.username || 'Học viên'

  const retake = () => router.push(`/write/${writeSlug}`)
  const next = () => router.push('/')

  if (view === 'review') {
    return (
      <WritingReview
        attempt={hydrated}
        onBack={() => setView('overview')}
        onRetake={retake}
        onExitReview={next}
      />
    )
  }

  return (
    <WritingResultOverview
      attempt={hydrated}
      studentName={studentName}
      onRetake={retake}
      onReview={() => setView('review')}
      onNext={next}
    />
  )
}

export function WritingResultRoute({ id }: { id: string }): React.ReactElement {
  const router = useRouter()
  const isMock = id === writingTestMock.attempt.id
  const subQuery = useWritingSubmissionDetail(id, !isMock)
  const historyQuery = useWritingHistory(id, !isMock && Boolean(subQuery.error))
  const firstFromHistoryId = historyQuery.data?.[0]?.id ?? ''
  const fallbackSubQuery = useWritingSubmissionDetail(
    firstFromHistoryId,
    Boolean(!isMock && firstFromHistoryId && firstFromHistoryId !== id),
  )

  if (isMock) {
    return <WritingResultContent attempt={writingTestMock.attempt} writeSlug={writingTestMock.id} />
  }

  if (subQuery.isLoading || historyQuery.isLoading || fallbackSubQuery.isLoading) {
    return (
      <main className="bg-page-bg flex h-[100dvh] w-full items-center justify-center text-white">
        <Loader2 className="h-8 w-8 animate-spin" />
      </main>
    )
  }

  const sub = subQuery.data ?? fallbackSubQuery.data
  if (!sub) {
    return (
      <main className="bg-page-bg flex h-[100dvh] w-full flex-col items-center justify-center gap-4 px-4 text-center text-white">
        <p className="text-lg font-bold">Không tìm thấy bài nộp Writing hoặc bạn chưa đăng nhập.</p>
        <button
          type="button"
          onClick={() => router.push('/history')}
          className="cursor-pointer rounded-xl bg-amber-400 px-4 py-2 text-sm font-black text-slate-950"
        >
          Về lịch sử làm bài
        </button>
      </main>
    )
  }

  const attempt = toWritingAttemptFromSubmission(sub)
  const writeSlug = sub.examAttempt?.exam?.id || writingTestMock.id
  return <WritingResultContent attempt={attempt} writeSlug={writeSlug} />
}

export function WritingFlowRoute({ slug }: { slug: string }): React.ReactElement {
  const router = useRouter()
  const isMock = slug === writingTestMock.id
  const examQuery = useStudentExam(slug, !isMock)
  const submitAttempt = useSubmitExamAttempt()

  if (isMock) {
    return <WritingFlow test={writingTestMock} />
  }

  if (examQuery.isLoading) {
    return (
      <main className="bg-page-bg flex h-[100dvh] w-full items-center justify-center text-white">
        <Loader2 className="h-8 w-8 animate-spin" />
      </main>
    )
  }

  const mapped = examQuery.data ? toWritingTestFromExam(examQuery.data) : null
  const exam = examQuery.data
  if (!mapped || !exam) {
    return (
      <main className="bg-page-bg flex h-[100dvh] w-full flex-col items-center justify-center gap-4 px-4 text-center text-white">
        <p className="text-lg font-bold">Không tìm thấy bài thi Viết phù hợp.</p>
        <button
          type="button"
          onClick={() => router.push('/')}
          className="cursor-pointer rounded-xl bg-amber-400 px-4 py-2 text-sm font-black text-slate-950"
        >
          Về trang chủ
        </button>
      </main>
    )
  }

  const writePartId =
    exam.structures.flatMap((s) => s.parts).find((p) => p.kind === 'write')?.id ?? 'write-1'

  return (
    <WritingFlow
      test={mapped}
      onSubmitAnswer={async (answerText) => {
        const saved = await submitAttempt.mutateAsync({
          examId: exam.id,
          levelSlug: exam.levelSlug,
          examTitle: exam.name,
          score: 0,
          total: mapped.attempt.maxScore,
          correctCount: 0,
          totalQuestions: 0,
          data: {
            writes: [
              {
                partId: writePartId,
                answerText,
                wordCount: countWords(answerText),
              },
            ],
          },
        })
        const targetId = saved.writingSubmissions[0]?.id ?? saved.id
        router.push(`/write/result/${encodeURIComponent(targetId)}`)
      }}
    />
  )
}
