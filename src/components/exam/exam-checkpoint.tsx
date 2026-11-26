'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense, useMemo, useState } from 'react'

import { ExamModeSelectModal } from './exam-mode-select-modal'
import { ExamPlayer } from './exam-player'

import { DEFAULT_SITE_CONFIG_CLIENT } from '@/components/admin/site-config/site-config-defaults'
import { useDemoExam, useExamAttempt, useStudentExam } from '@/hooks/use-student-exams'
import {
  loadAttempt,
  loadExams,
  normalizeExam,
  type ExamAttempt,
  type RawCheckPoint,
} from '@/lib/exam'
import { hydrateAnswersFromAttemptData, toCheckpointSummary } from '@/lib/student-exam'
import examMock from '@/mocks/exam-7778495e.json'
import { useSiteConfig } from '@/providers/site-config-provider'
import { examSchema } from '@/schemas/exam'
import { useAuthStore } from '@/store/auth-store'
import type { Exam } from '@/types/exam'

const LEGACY_MOCK_ID = '7778495e-531b-4039-a3ea-321874ba1a7a'

interface ExamCheckpointProps {
  id: string
  initialData: {
    level: string
    levelName: string
    challengeNumber: number
    totalMinutes: number
    parts: { name: string; maxScore: number; minutes: number }[]
  }
}

function buildFallbackExam(
  id: string,
  initialData: ExamCheckpointProps['initialData'],
): Exam | null {
  const stored = loadExams().find((e) => e.id === id)
  if (stored) return stored
  if (id !== LEGACY_MOCK_ID) return null
  try {
    const raw = (examMock as unknown as { data: { checkPoint: RawCheckPoint } })?.data?.checkPoint
    if (!raw) return null
    const normalized = normalizeExam(raw)
    if (normalized) {
      normalized.id = id
      if (!normalized.name) {
        normalized.name = `${initialData.levelName ?? 'MOVERS'} - Thử thách ${initialData.challengeNumber ?? 1}`
      }
    }
    return normalized
  } catch {
    return null
  }
}

function ExamCheckpointInner({ id, initialData }: ExamCheckpointProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { config, resolveAsset } = useSiteConfig()
  const pageBgSrc = resolveAsset(
    config.checkpointAssets.pageBackground,
    DEFAULT_SITE_CONFIG_CLIENT.checkpointAssets.pageBackground ?? '',
  )
  const reviewRequested = searchParams.get('review') === 'true'
  const attemptId = searchParams.get('attemptId') || ''

  const authStatus = useAuthStore((s) => s.status)
  const isDemoRoute = id === 'demo'
  const isLegacyMock = id === LEGACY_MOCK_ID

  const [started, setStarted] = useState(false)
  const [practiceMode, setPracticeMode] = useState(false)

  const demoQuery = useDemoExam(isDemoRoute)
  const examQuery = useStudentExam(id, !isDemoRoute)
  const attemptQuery = useExamAttempt(attemptId, Boolean(reviewRequested && attemptId))

  const fallbackExam = useMemo(() => buildFallbackExam(id, initialData), [id, initialData])

  // Prefer live DB exam; fallback to attempt.exam.data during review or legacy mock if offline
  const resolvedExam = useMemo<Exam | null>(() => {
    if (isDemoRoute) return demoQuery.data ?? null
    if (examQuery.data) return examQuery.data
    const embeddedData = attemptQuery.data?.exam?.data
    if (reviewRequested && embeddedData) {
      const parsed = examSchema.safeParse({
        ...(typeof embeddedData === 'object' && embeddedData !== null ? embeddedData : {}),
        id: attemptQuery.data?.exam?.id || id,
      })
      if (parsed.success) return parsed.data as Exam
    }
    return fallbackExam
  }, [
    isDemoRoute,
    demoQuery.data,
    examQuery.data,
    reviewRequested,
    attemptQuery.data,
    id,
    fallbackExam,
  ])

  const modalSummary = useMemo(
    () =>
      resolvedExam ? toCheckpointSummary(resolvedExam, initialData.challengeNumber) : initialData,
    [resolvedExam, initialData],
  )

  const resolvedReviewAttempt = useMemo<ExamAttempt | null>(() => {
    if (!reviewRequested) return null
    const serverAttempt = attemptQuery.data
    if (serverAttempt) {
      return {
        examId: serverAttempt.examId || id,
        answers: hydrateAnswersFromAttemptData(serverAttempt.data),
        grade: {
          correct: serverAttempt.correctCount,
          total: serverAttempt.totalQuestions,
        },
        submittedAt: serverAttempt.createdAt,
      }
    }
    return loadAttempt(id)
  }, [reviewRequested, attemptQuery.data, id])

  if (isDemoRoute) {
    if (demoQuery.isLoading) return <LoadingScreen />
    if (demoQuery.error || !resolvedExam) {
      return (
        <NoticeScreen
          title="Chưa có Đề thi Demo"
          message="Quản trị viên chưa gắn Đề thi Demo công khai. Hãy đăng nhập để chọn đề trên bản đồ."
          primaryHref="/"
          primaryLabel="Về trang chủ"
        />
      )
    }
  } else if (!isLegacyMock) {
    if (authStatus === 'idle') return <LoadingScreen />
    if (authStatus === 'unauthenticated') {
      return (
        <NoticeScreen
          title="Đăng nhập để làm đề thi chính thức"
          message="Tài khoản học viên giúp lưu bài thi, chấm Writing/Speaking và cộng điểm bảng xếp hạng."
          primaryHref={`/login?redirect=${encodeURIComponent(`/check-point/${id}`)}`}
          primaryLabel="Đăng nhập ngay"
          secondaryHref="/check-point/demo"
          secondaryLabel="Thử Đề Demo miễn phí"
        />
      )
    }
    if (examQuery.isLoading || (reviewRequested && attemptId && attemptQuery.isLoading)) {
      return <LoadingScreen />
    }
    if ((examQuery.error && !resolvedExam) || !resolvedExam) {
      return (
        <NoticeScreen
          title="Không tải được đề thi"
          message={
            examQuery.error instanceof Error
              ? examQuery.error.message
              : 'Đề thi không tồn tại hoặc đã bị gỡ.'
          }
          primaryHref="/"
          primaryLabel="Về bản đồ học tập"
        />
      )
    }
  }

  if (reviewRequested) {
    if (!resolvedExam) return <LoadingScreen />
    return (
      <ExamPlayer
        exam={resolvedExam}
        attempt={resolvedReviewAttempt}
        mode="review"
        isDemo={isDemoRoute}
        onExit={() => router.back()}
      />
    )
  }

  if (started && resolvedExam) {
    return (
      <ExamPlayer
        exam={resolvedExam}
        mode="exam"
        practiceMode={practiceMode}
        isDemo={isDemoRoute || (isLegacyMock && !examQuery.data)}
        onExit={() => setStarted(false)}
      />
    )
  }

  return (
    <main className="bg-dashboard-bg relative h-[100dvh] w-full overflow-hidden">
      <Image src={pageBgSrc} alt="" fill priority unoptimized className="object-cover" />

      <div className="absolute inset-0 overflow-y-auto font-sans">
        <div className="flex h-full w-full flex-col items-center pt-[30px] max-md:-mt-[90px]">
          <div className="origin-top scale-[0.9] max-md:scale-[0.75]">
            <ExamModeSelectModal
              data={modalSummary}
              onStart={(selectedMode) => {
                setPracticeMode(selectedMode === 'practice')
                setStarted(true)
              }}
            />
          </div>
        </div>
      </div>
    </main>
  )
}

export function ExamCheckpoint(props: ExamCheckpointProps) {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <ExamCheckpointInner {...props} />
    </Suspense>
  )
}

function NoticeScreen({
  title,
  message,
  primaryHref,
  primaryLabel,
  secondaryHref,
  secondaryLabel,
}: {
  title: string
  message: string
  primaryHref: string
  primaryLabel: string
  secondaryHref?: string
  secondaryLabel?: string
}) {
  const { config, resolveAsset } = useSiteConfig()
  const pageBgSrc = resolveAsset(
    config.checkpointAssets.pageBackground,
    DEFAULT_SITE_CONFIG_CLIENT.checkpointAssets.pageBackground ?? '',
  )
  return (
    <main className="bg-dashboard-bg relative flex h-[100dvh] w-full items-center justify-center overflow-hidden p-4">
      <Image
        src={pageBgSrc}
        alt=""
        fill
        priority
        unoptimized
        className="object-cover opacity-50"
      />
      <div className="relative z-10 w-full max-w-md rounded-3xl border-2 border-white/25 bg-slate-900/90 p-7 text-center text-white shadow-2xl backdrop-blur">
        <h1 className="font-heading text-xl font-black uppercase">{title}</h1>
        <p className="mt-2.5 text-sm leading-relaxed text-slate-200">{message}</p>
        <div className="mt-6 flex flex-col gap-2.5">
          <Link
            href={primaryHref}
            className="rounded-2xl bg-gradient-to-b from-amber-400 to-orange-500 px-5 py-3 text-sm font-black tracking-wide text-white uppercase shadow transition hover:brightness-105"
          >
            {primaryLabel}
          </Link>
          {secondaryHref && secondaryLabel && (
            <Link
              href={secondaryHref}
              className="rounded-2xl border border-white/25 bg-white/10 px-5 py-2.5 text-xs font-bold tracking-wide text-white uppercase transition hover:bg-white/20"
            >
              {secondaryLabel}
            </Link>
          )}
        </div>
      </div>
    </main>
  )
}

function LoadingScreen() {
  return (
    <main className="flex h-[100dvh] w-full items-center justify-center bg-[#16143c] text-white">
      <div className="h-12 w-12 animate-spin rounded-full border-t-2 border-white" />
    </main>
  )
}
