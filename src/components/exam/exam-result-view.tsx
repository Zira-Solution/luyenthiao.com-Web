'use client'

import { CheckCircle2, Clock, FileText, Home, Loader2, Shield, Trophy } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'

import { GameButton } from '@/components/ui/game-button'
import { useExamAttempt } from '@/hooks/use-student-exams'
import { normalizeWritingFeedback } from '@/lib/admin-grading'
import { useAuthStore } from '@/store/auth-store'

interface SessionUser {
  id: number
  role: string
  username?: string
  fullName?: string
}

export function ExamResultView(): React.ReactElement {
  const router = useRouter()
  const searchParams = useSearchParams()
  const user = useAuthStore((s) => s.user) as SessionUser | null

  const attemptId = searchParams.get('attemptId') || ''
  const queryExamId = searchParams.get('examId') || '7778495e-531b-4039-a3ea-321874ba1a7a'
  const queryLevel = searchParams.get('level') || 'movers'
  const queryTitle = searchParams.get('title') || ''

  const { data: attempt, isLoading, error } = useExamAttempt(attemptId, Boolean(attemptId))

  const studentName = (user?.fullName || user?.username || 'Học viên').trim()
  const score = attempt ? attempt.score : parseInt(searchParams.get('score') || '0', 10)
  const total = attempt ? attempt.total : parseInt(searchParams.get('total') || '60', 10)
  const listening = parseInt(searchParams.get('listening') || '0', 10)
  const rw = parseInt(searchParams.get('rw') || '0', 10)
  const examId = attempt?.examId || queryExamId
  const levelSlug = attempt?.levelSlug || attempt?.exam?.levelSlug || queryLevel
  const examTitle =
    attempt?.examTitle ||
    attempt?.exam?.name ||
    queryTitle ||
    `${levelSlug.toUpperCase()} - Kết quả bài thi`

  const ratio = total > 0 ? score / total : 0
  const overallShields = Math.max(1, Math.min(5, Math.ceil(ratio * 5)))
  const listeningShields = attempt
    ? overallShields
    : Math.max(1, Math.min(5, Math.ceil(listening / 5)))
  const rwShields = attempt ? overallShields : Math.max(1, Math.min(5, Math.ceil(rw / 7)))
  const percentage = Math.min(99, Math.max(10, Math.round(ratio * 100)))

  const writingSubs = attempt?.writingSubmissions ?? []
  const speakingSubs = attempt?.speakingSubmissions ?? []
  const hasPendingManual =
    writingSubs.some((w) => w.status === 'PENDING') ||
    speakingSubs.some((s) => s.status === 'PENDING')

  const reviewHref = attemptId
    ? `/check-point/${examId}?attemptId=${encodeURIComponent(attemptId)}&review=true`
    : `/check-point/${examId}?review=true`

  if (attemptId && isLoading) {
    return (
      <main className="bg-dashboard-bg flex min-h-[100dvh] w-full items-center justify-center text-white">
        <div className="flex items-center gap-3 text-sm font-bold">
          <Loader2 className="h-5 w-5 animate-spin" />
          Đang tải kết quả bài thi từ máy chủ...
        </div>
      </main>
    )
  }

  return (
    <main className="bg-dashboard-bg relative flex min-h-[100dvh] w-full flex-col items-center overflow-y-auto px-4 py-10">
      <Image
        src="/clone-assets/exam/bg-checkpoint-page.d7e3979b.jpg"
        alt=""
        fill
        className="pointer-events-none -z-10 object-cover opacity-40"
      />

      <div className="relative z-10 w-full max-w-[650px]">
        {attemptId && error && (
          <div className="mb-4 rounded-2xl border border-rose-300/40 bg-rose-950/75 px-4 py-3 text-xs font-semibold text-rose-200">
            {error instanceof Error ? error.message : 'Không tải được chi tiết bài thi.'}
          </div>
        )}

        <div
          className="border-cp-card-border relative overflow-hidden rounded-[40px] border-4 p-6 shadow-2xl sm:p-10"
          style={{
            background:
              'radial-gradient(50% 50%, var(--color-cp-modal-bg-top) 0%, var(--color-cp-modal-bg-bottom) 100%)',
          }}
        >
          <Image
            src="/clone-assets/exam/border.c71a6ea1.png"
            alt=""
            fill
            className="pointer-events-none rounded-[40px] object-fill"
          />

          <button
            type="button"
            onClick={() => router.push(`/testlevels/${levelSlug || 'movers'}`)}
            aria-label="Đóng"
            className="absolute top-4 right-4 z-20 h-10 w-10 cursor-pointer transition-transform hover:scale-105 active:scale-95"
          >
            <Image
              src="/clone-assets/exam/close.6f7d2509.png"
              alt="Close"
              fill
              className="object-contain"
            />
          </button>

          <div className="relative z-10 flex flex-col items-center text-center">
            <h1 className="font-heading m-0 text-3xl tracking-wide text-white uppercase drop-shadow-md">
              {studentName}
            </h1>

            <div className="bg-cp-accent-yellow/20 border-cp-accent-yellow/40 mt-2 flex items-center gap-2 rounded-full border px-4 py-1.5">
              {hasPendingManual ? (
                <>
                  <Clock className="text-cp-accent-yellow h-5 w-5" />
                  <span className="text-cp-accent-yellow text-sm font-black tracking-wider uppercase">
                    Đã nộp · Chờ giáo viên chấm tự luận
                  </span>
                </>
              ) : (
                <>
                  <Trophy className="text-cp-accent-yellow h-5 w-5 animate-bounce" />
                  <span className="text-cp-accent-yellow text-sm font-black tracking-wider uppercase">
                    Hoàn thành bài thi
                  </span>
                </>
              )}
            </div>

            <div className="mt-6 flex h-36 w-36 flex-col items-center justify-center rounded-full border-4 border-white/20 bg-white/10 shadow-inner">
              <span className="text-cp-accent-yellow font-heading text-5xl leading-none font-black drop-shadow">
                {score}
              </span>
              <span className="mt-1 border-t border-white/25 px-4 pt-1 text-sm font-bold text-white/60">
                /{total} Điểm
              </span>
            </div>

            <p className="mt-4 max-w-[320px] text-sm leading-relaxed font-semibold text-white">
              Tỷ lệ hoàn thành hiện tại:{' '}
              <strong className="text-cp-accent-yellow text-base font-black">{percentage}%</strong>
              {attempt
                ? ` (${attempt.correctCount}/${attempt.totalQuestions} câu trắc nghiệm đúng)`
                : ''}
            </p>

            <div className="font-heading mt-2 text-xs tracking-wide text-white/80">{examTitle}</div>

            {/* Objective skill breakdown */}
            <div className="bg-cp-tab-track/70 border-cp-tab-track mt-6 flex w-full flex-col gap-4 rounded-3xl border p-6 text-left">
              <div className="flex flex-col justify-between gap-2 border-b border-white/10 pb-3 sm:flex-row sm:items-center">
                <span className="font-heading text-sm tracking-wider text-white uppercase">
                  Đọc & Viết
                </span>
                <div className="flex gap-1.5">
                  {Array.from({ length: 5 }).map((_, idx) => (
                    <Shield
                      key={idx}
                      className={`h-6 w-6 transition-all ${
                        idx < rwShields
                          ? 'text-cp-accent-yellow fill-cp-accent-yellow scale-110 drop-shadow'
                          : 'fill-white/10 text-white/20'
                      }`}
                    />
                  ))}
                </div>
              </div>

              <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
                <span className="font-heading text-sm tracking-wider text-white uppercase">
                  Nghe
                </span>
                <div className="flex gap-1.5">
                  {Array.from({ length: 5 }).map((_, idx) => (
                    <Shield
                      key={idx}
                      className={`h-6 w-6 transition-all ${
                        idx < listeningShields
                          ? 'text-cp-accent-yellow fill-cp-accent-yellow scale-110 drop-shadow'
                          : 'fill-white/10 text-white/20'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Subjective Writing & Speaking status cards from DB */}
            {(writingSubs.length > 0 || speakingSubs.length > 0) && (
              <div className="mt-4 w-full space-y-2.5 text-left">
                {writingSubs.map((w, idx) => {
                  const fb = normalizeWritingFeedback(w.feedback)
                  return (
                    <div
                      key={w.id}
                      className="rounded-2xl border border-white/15 bg-slate-950/55 px-4 py-3 text-xs text-white"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="font-black uppercase">
                          Phần Viết {idx + 1} · {w.wordCount} từ
                        </span>
                        <div className="flex items-center gap-2">
                          {w.status === 'GRADED' ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 px-2.5 py-0.5 font-bold text-emerald-300">
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              Đã chấm: {w.score ?? 0} điểm
                            </span>
                          ) : (
                            <span className="rounded-full bg-amber-500/20 px-2.5 py-0.5 font-bold text-amber-300">
                              Chờ giáo viên chấm
                            </span>
                          )}
                          <Link
                            href={`/write/result/${encodeURIComponent(w.id)}`}
                            className="rounded-lg bg-white/15 px-2.5 py-1 font-bold text-white hover:bg-white/25"
                          >
                            Chi tiết
                          </Link>
                        </div>
                      </div>
                      {w.status === 'GRADED' && fb.comment && (
                        <p className="mt-1.5 text-white/80">Nhận xét: {fb.comment}</p>
                      )}
                    </div>
                  )
                })}

                {speakingSubs.map((s, idx) => (
                  <div
                    key={s.id}
                    className="rounded-2xl border border-white/15 bg-slate-950/55 px-4 py-3 text-xs text-white"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="font-black uppercase">Phần Nói {idx + 1}</span>
                      <div className="flex items-center gap-2">
                        {s.status === 'GRADED' ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 px-2.5 py-0.5 font-bold text-emerald-300">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            Đã chấm: {s.manualScore ?? s.totalScore ?? 0} điểm
                          </span>
                        ) : (
                          <span className="rounded-full bg-amber-500/20 px-2.5 py-0.5 font-bold text-amber-300">
                            Chờ giáo viên chấm
                          </span>
                        )}
                        <Link
                          href={`/speaking/result/${encodeURIComponent(s.id)}`}
                          className="rounded-lg bg-white/15 px-2.5 py-1 font-bold text-white hover:bg-white/25"
                        >
                          Chi tiết
                        </Link>
                      </div>
                    </div>
                    {s.status === 'GRADED' && s.feedback && (
                      <p className="mt-1.5 text-white/80">Nhận xét: {s.feedback}</p>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Details & Comments Card */}
            <div className="bg-cp-card-bg/50 border-cp-card-border mt-4 w-full rounded-3xl border p-5 text-left">
              <span className="text-cp-accent-yellow font-heading mb-1 block text-xs uppercase">
                Chi tiết & nhận xét
              </span>
              <p className="m-0 text-sm leading-relaxed font-medium text-white/90">
                {hasPendingManual
                  ? 'Phần tự luận Writing/Speaking của bạn đang nằm trong hàng đợi chấm bài của giáo viên. Khi có điểm, điểm tổng sẽ tự động cập nhật.'
                  : ratio >= 0.8
                    ? 'Tuyệt vời! Bạn hoàn thành xuất sắc bài thi thử. Hãy tiếp tục duy trì phong độ này để đạt điểm tối đa nhé!'
                    : ratio >= 0.5
                      ? 'Khá tốt! Bạn đã nắm chắc các kiến thức cơ bản. Rèn luyện thêm một chút ở phần từ vựng và ngữ pháp để cải thiện điểm số nhé.'
                      : 'Cố lên! Hãy xem lại đáp án từng câu để rút kinh nghiệm và thử lại lần nữa nhé.'}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="mt-8 grid w-full grid-cols-1 gap-4 sm:grid-cols-2">
              <GameButton
                variant="secondary"
                onClick={() => router.push(`/testlevels/${levelSlug || 'movers'}`)}
              >
                <div className="flex items-center gap-2">
                  <Home className="h-5 w-5 text-white" />
                  <span>Về bản đồ</span>
                </div>
              </GameButton>

              <GameButton
                variant="cta"
                disabled={Boolean(attemptId && !attempt?.examId)}
                onClick={() => router.push(reviewHref)}
              >
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-white" />
                  <span>Xem đáp án</span>
                </div>
              </GameButton>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
