'use client'

import { CheckCircle2, Clock, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

import { SpeakingFlow } from './speaking-flow'
import { SpeakingPreview } from './speaking-preview'
import { SpeakingResult } from './speaking-result'

import {
  useSpeakingHistory,
  useSpeakingSubmissionDetail,
  useStudentExam,
  useSubmitExamAttempt,
} from '@/hooks/use-student-exams'
import { uploadRecordingAudio } from '@/lib/api/student-exams'
import { toSpeakingAttemptFromSubmission, toSpeakingTestFromExam } from '@/lib/student-exam'
import { speakingTestMock } from '@/mocks/speaking'
import type { SpeakingAnswer, SpeakingTest } from '@/types/speaking'

interface SpeakingResultRouteProps {
  test?: SpeakingTest
  submissionId?: string
}

export function SpeakingResultRoute({
  test,
  submissionId,
}: SpeakingResultRouteProps): React.ReactElement {
  const router = useRouter()
  const resolvedId = submissionId ?? test?.attempt.id ?? ''
  const isMock = Boolean(test) || resolvedId === speakingTestMock.attempt.id

  const subQuery = useSpeakingSubmissionDetail(resolvedId, !isMock)
  const historyQuery = useSpeakingHistory(resolvedId, !isMock && Boolean(subQuery.error))
  const firstHistoryId = historyQuery.data?.[0]?.id ?? ''
  const fallbackSubQuery = useSpeakingSubmissionDetail(
    firstHistoryId,
    Boolean(!isMock && firstHistoryId && firstHistoryId !== resolvedId),
  )

  if (isMock) {
    const mockTest = test ?? speakingTestMock
    const id = mockTest.attempt.id
    return (
      <SpeakingResult
        attempt={mockTest.attempt}
        onBack={() => router.push(`/speaking/${mockTest.id}`)}
        onReview={() => router.push(`/speaking/result/${id}/preview`)}
      />
    )
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
        <p className="text-lg font-bold">
          Không tìm thấy bài nộp Speaking hoặc bạn chưa đăng nhập.
        </p>
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

  const mapped = toSpeakingAttemptFromSubmission(sub)
  const examSlug = sub.examAttempt?.exam?.id || speakingTestMock.id

  return (
    <div className="relative">
      <div className="fixed right-4 bottom-4 left-4 z-40 mx-auto max-w-md rounded-2xl border border-white/25 bg-slate-900/90 p-4 text-white shadow-2xl backdrop-blur">
        <div className="flex items-center justify-between gap-2 text-xs font-bold">
          {mapped.status === 'GRADED' ? (
            <span className="inline-flex items-center gap-1.5 text-emerald-300">
              <CheckCircle2 className="h-4 w-4" />
              Giáo viên đã chấm: {mapped.teacherScore ?? 0}/{mapped.maxScore} điểm
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 text-amber-300">
              <Clock className="h-4 w-4" />
              Bài nói đang chờ giáo viên chấm điểm
            </span>
          )}
        </div>
        {mapped.teacherFeedback && (
          <p className="mt-1.5 text-xs text-slate-200">Nhận xét: {mapped.teacherFeedback}</p>
        )}
      </div>

      <SpeakingResult
        attempt={mapped.attempt}
        onBack={() => router.push(`/speaking/${examSlug}`)}
        onReview={() => router.push(`/speaking/result/${encodeURIComponent(sub.id)}/preview`)}
      />
    </div>
  )
}

export function SpeakingPreviewRoute({
  submissionId,
}: {
  submissionId: string
}): React.ReactElement {
  const router = useRouter()
  const isMock = submissionId === speakingTestMock.attempt.id
  const subQuery = useSpeakingSubmissionDetail(submissionId, !isMock)

  if (isMock) {
    return (
      <SpeakingPreview
        attempt={speakingTestMock.attempt}
        onBack={() => router.push(`/speaking/result/${submissionId}`)}
      />
    )
  }

  if (subQuery.isLoading) {
    return (
      <main className="flex h-[100dvh] w-full items-center justify-center bg-slate-100 text-slate-700">
        <Loader2 className="h-8 w-8 animate-spin" />
      </main>
    )
  }

  if (!subQuery.data) {
    return (
      <main className="flex h-[100dvh] w-full flex-col items-center justify-center gap-4 bg-slate-100 p-4 text-center text-slate-700">
        <p className="font-bold">Không tìm thấy chi tiết bài nói.</p>
        <button
          type="button"
          onClick={() => router.push('/history')}
          className="cursor-pointer rounded-xl bg-slate-900 px-4 py-2 text-sm font-bold text-white"
        >
          Về lịch sử làm bài
        </button>
      </main>
    )
  }

  const mapped = toSpeakingAttemptFromSubmission(subQuery.data)
  return (
    <SpeakingPreview
      attempt={mapped.attempt}
      answers={mapped.answers}
      onBack={() => router.push(`/speaking/result/${encodeURIComponent(submissionId)}`)}
    />
  )
}

export function SpeakingFlowRoute({ slug }: { slug: string }): React.ReactElement {
  const router = useRouter()
  const [submitError, setSubmitError] = useState<string | null>(null)
  const isMock = slug === speakingTestMock.id
  const examQuery = useStudentExam(slug, !isMock)
  const submitAttempt = useSubmitExamAttempt()

  if (isMock) {
    return <SpeakingFlow test={speakingTestMock} />
  }

  if (examQuery.isLoading) {
    return (
      <main className="bg-page-bg flex h-[100dvh] w-full items-center justify-center text-white">
        <Loader2 className="h-8 w-8 animate-spin" />
      </main>
    )
  }

  const mapped = examQuery.data ? toSpeakingTestFromExam(examQuery.data) : null
  const exam = examQuery.data
  if (!mapped || !exam) {
    return (
      <main className="bg-page-bg flex h-[100dvh] w-full flex-col items-center justify-center gap-4 px-4 text-center text-white">
        <p className="text-lg font-bold">Không tìm thấy bài thi Nói phù hợp.</p>
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

  const speakPart = exam.structures.flatMap((s) => s.parts).find((p) => p.kind === 'speak')
  const partId = speakPart?.id ?? 'speak-1'
  const maxScore = speakPart?.maxScore && speakPart.maxScore > 0 ? speakPart.maxScore : 10

  const handlePersistSpeaking = async (rawAnswers: Record<string, SpeakingAnswer>) => {
    setSubmitError(null)
    const serialized: Record<string, Record<string, unknown>> = {}
    for (const [qId, entry] of Object.entries(rawAnswers)) {
      let audioUrl: string | undefined
      if (entry.blobUrl && entry.blobUrl.startsWith('blob:')) {
        const res = await fetch(entry.blobUrl)
        const blob = await res.blob()
        const uploaded = await uploadRecordingAudio(blob, `speaking-${qId}.webm`)
        audioUrl = uploaded.url
      }
      serialized[qId] = {
        questionId: qId,
        answered: entry.answered,
        ...(entry.detail ? { detail: entry.detail } : {}),
        ...(typeof entry.duration === 'number' ? { duration: entry.duration } : {}),
        ...(audioUrl ? { recorded: true, audioUrl } : {}),
      }
    }

    const saved = await submitAttempt.mutateAsync({
      examId: exam.id,
      levelSlug: exam.levelSlug,
      examTitle: exam.name,
      score: 0,
      total: maxScore,
      correctCount: 0,
      totalQuestions: 0,
      data: { speaks: [{ partId, answers: serialized }] },
    })

    const subId = saved.speakingSubmissions[0]?.id ?? saved.id
    router.push(`/speaking/result/${encodeURIComponent(subId)}`)
  }

  return (
    <>
      {submitError && (
        <div
          role="alert"
          className="fixed top-4 right-4 z-50 rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white shadow-lg"
        >
          {submitError}
        </div>
      )}
      <SpeakingFlow
        test={mapped}
        onSubmitSpeaking={async (ans) => {
          try {
            await handlePersistSpeaking(ans)
          } catch (err) {
            setSubmitError(err instanceof Error ? err.message : 'Không lưu được bài Nói.')
            throw err
          }
        }}
      />
    </>
  )
}
