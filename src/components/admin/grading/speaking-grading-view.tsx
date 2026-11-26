'use client'

import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Loader2,
  Mic,
  Save,
  Volume2,
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState, type ReactElement } from 'react'

import { GradingAiPanel } from './grading-ai-panel'

import { AdminPageHeader } from '@/components/admin/shell'
import { ROUTES } from '@/constants'
import { useAdminSpeakingSubmission, useGradeSpeakingSubmission } from '@/hooks/admin'
import {
  extractSubmissionPartContext,
  normalizeSpeakingAnswer,
  resolveSpeakingAnswerAudio,
  type SpeakingAnswerEntry,
} from '@/lib/admin-grading'
import { listAdminSpeakingQueue } from '@/lib/api/admin/grading'
import type { AdminSpeakingSubmission } from '@/schemas/admin-grading'
import type { SpeakingQuestion } from '@/types/speaking'

export interface SpeakingGradingViewProps {
  submissionId: string
}

interface QuestionAnswerPair {
  id: string
  question?: SpeakingQuestion
  answer: SpeakingAnswerEntry
}

function buildQuestionPairs(
  speakQuestions: SpeakingQuestion[] | undefined,
  rawAnswers: Record<string, unknown>,
): QuestionAnswerPair[] {
  const usedKeys = new Set<string>()
  const pairs: QuestionAnswerPair[] = []

  if (Array.isArray(speakQuestions)) {
    for (const q of speakQuestions) {
      usedKeys.add(q.id)
      pairs.push({
        id: q.id,
        question: q,
        answer: normalizeSpeakingAnswer(q.id, rawAnswers[q.id]),
      })
    }
  }

  for (const [key, raw] of Object.entries(rawAnswers)) {
    if (usedKeys.has(key)) continue
    pairs.push({
      id: key,
      answer: normalizeSpeakingAnswer(key, raw),
    })
  }

  return pairs
}

export function SpeakingGradingView({ submissionId }: SpeakingGradingViewProps): ReactElement {
  const { data: sub, isLoading, error } = useAdminSpeakingSubmission(submissionId)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center gap-2 py-16 text-sm text-slate-500">
        <Loader2 className="size-4 animate-spin" aria-hidden="true" />
        Đang tải bài nói Speaking...
      </div>
    )
  }

  if (error || !sub) {
    return (
      <div className="space-y-4">
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
          {error instanceof Error ? error.message : 'Không tìm thấy bài nộp Speaking.'}
        </div>
        <Link
          href={`${ROUTES.ADMIN_GRADING}?tab=speaking`}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Quay lại hàng đợi Speaking
        </Link>
      </div>
    )
  }

  return <SpeakingGradingWorkspace key={sub.id} sub={sub} />
}

function SpeakingGradingWorkspace({ sub }: { sub: AdminSpeakingSubmission }): ReactElement {
  const router = useRouter()
  const gradeMutation = useGradeSpeakingSubmission()

  const partCtx = extractSubmissionPartContext(sub, 'speak')
  const maxScore = partCtx.maxScore

  const [scoreInput, setScoreInput] = useState(() =>
    sub.manualScore != null ? String(sub.manualScore) : '',
  )
  const [feedback, setFeedback] = useState(() => sub.feedback ?? '')
  const [formError, setFormError] = useState<string | null>(null)
  const [savedNotice, setSavedNotice] = useState<string | null>(null)
  const [advancing, setAdvancing] = useState(false)

  const submitGrade = async (andNext: boolean) => {
    setFormError(null)
    setSavedNotice(null)

    const trimmed = scoreInput.trim()
    const parsed = Number(trimmed)
    if (!trimmed || !Number.isInteger(parsed) || parsed < 0 || parsed > maxScore) {
      setFormError(`Điểm Speaking phải là số nguyên từ 0 đến ${maxScore}.`)
      return
    }

    try {
      await gradeMutation.mutateAsync({
        id: sub.id,
        input: {
          manualScore: parsed,
          feedback: feedback.trim(),
        },
      })

      if (!andNext) {
        setSavedNotice(`Đã lưu điểm ${parsed}/${maxScore} và cập nhật tổng điểm bài thi.`)
        return
      }

      setAdvancing(true)
      const nextQueue = await listAdminSpeakingQueue({ status: 'PENDING', page: 1, limit: 5 })
      const nextItem = nextQueue.items.find((item) => item.id !== sub.id)
      if (nextItem) {
        router.push(`/admin/grading/speaking/${encodeURIComponent(nextItem.id)}`)
      } else {
        router.push(`${ROUTES.ADMIN_GRADING}?tab=speaking&done=1`)
      }
    } catch (err) {
      setAdvancing(false)
      setFormError(err instanceof Error ? err.message : 'Không lưu được kết quả chấm bài nói.')
    }
  }

  const studentName = sub.user?.fullName?.trim() || sub.user?.username || `User #${sub.userId}`
  const examTitle = sub.examAttempt?.examTitle || sub.examAttempt?.exam?.name || 'Đề thi Speaking'
  const pairs = buildQuestionPairs(partCtx.speakQuestions, sub.answers)

  return (
    <>
      <AdminPageHeader
        title={`Chấm Speaking · ${examTitle}`}
        description={`Thí sinh: ${studentName} (@${sub.user?.username ?? sub.userId}) · Auto slide: ${sub.autoScore ?? 0}`}
        breadcrumbs={[
          { label: 'Trang chủ', href: ROUTES.HOME },
          { label: 'Chấm bài', href: `${ROUTES.ADMIN_GRADING}?tab=speaking` },
          { label: 'Chi tiết Speaking' },
        ]}
        actions={
          <Link
            href={`${ROUTES.ADMIN_GRADING}?tab=speaking`}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            <ArrowLeft className="size-4" aria-hidden="true" />
            Quay lại hàng đợi
          </Link>
        }
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.45fr_1fr]">
        {/* Left column: Speaking questions + audio recordings + optional AI */}
        <div className="space-y-4">
          <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-base font-semibold text-slate-900">
                  {partCtx.title || 'Phần thi Speaking'}
                </h2>
                {partCtx.speakKind && (
                  <p className="text-xs text-slate-500">Dạng phần thi: {partCtx.speakKind}</p>
                )}
              </div>
              <div className="flex items-center gap-2">
                {sub.autoScore != null && (
                  <span className="rounded-md bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-700">
                    Điểm tương tác tự động: {sub.autoScore}
                  </span>
                )}
                <span className="rounded-md bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700">
                  Thang điểm tối đa: {maxScore}
                </span>
              </div>
            </div>

            {partCtx.examDeleted && (
              <p className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
                Đề thi gốc đã bị xóa — hiển thị trực tiếp các câu trả lời đã lưu trong bài nộp.
              </p>
            )}

            <div className="mt-4 space-y-3">
              {pairs.length === 0 ? (
                <p className="py-6 text-center text-sm text-slate-500">
                  Chưa có câu trả lời nào được ghi nhận trong bài nộp này.
                </p>
              ) : (
                pairs.map(({ id, question, answer }, idx) => {
                  const audio = resolveSpeakingAnswerAudio(answer)
                  return (
                    <article
                      key={id}
                      className="rounded-lg border border-slate-200 bg-slate-50 p-4"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 uppercase">
                          <Mic className="size-3.5 text-blue-600" aria-hidden="true" />
                          Câu {idx + 1} · {question?.kind ?? 'speaking'} ({id})
                        </span>
                        {answer.duration != null && (
                          <span className="rounded bg-white px-2 py-0.5 text-xs font-medium text-slate-600 ring-1 ring-slate-200">
                            Thời lượng: {answer.duration}s
                          </span>
                        )}
                      </div>

                      {question?.text && (
                        <div className="mt-2 flex items-start gap-2 text-sm text-slate-900">
                          <Volume2
                            className="mt-0.5 size-4 shrink-0 text-blue-600"
                            aria-hidden="true"
                          />
                          <div>
                            <p className="font-medium">{question.text}</p>
                            {question.vi && <p className="text-xs text-slate-500">{question.vi}</p>}
                          </div>
                        </div>
                      )}

                      {(question?.sceneBg || question?.zoomCard) && (
                        <div className="mt-2.5 flex flex-wrap gap-2">
                          {question.sceneBg && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={question.sceneBg}
                              alt="Ảnh nền câu hỏi Speaking"
                              className="h-24 rounded-md border border-slate-200 bg-white object-contain"
                            />
                          )}
                          {question.zoomCard && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={question.zoomCard}
                              alt="Thẻ câu hỏi Speaking"
                              className="h-24 rounded-md border border-slate-200 bg-white object-contain"
                            />
                          )}
                        </div>
                      )}

                      <div className="mt-3 space-y-2">
                        {answer.selected && (
                          <p className="text-xs text-slate-700">
                            Đáp án chọn trên slide:{' '}
                            <span className="font-semibold text-slate-900">{answer.selected}</span>
                          </p>
                        )}
                        {answer.detail && <p className="text-xs text-slate-600">{answer.detail}</p>}

                        {audio.kind === 'audio' ? (
                          <div className="rounded-lg border border-blue-200 bg-white p-2.5">
                            <audio
                              controls
                              preload="metadata"
                              src={audio.url}
                              className="h-10 w-full"
                            />
                            {audio.relativeWarning && (
                              <p className="mt-1 text-[11px] text-amber-700">
                                Đường dẫn audio đang là đường dẫn tương đối ({audio.url}). Khi bật
                                R2_PUBLIC_BASE_URL / NEXT_PUBLIC_R2_PUBLIC_BASE_URL file sẽ phát từ
                                CDN.
                              </p>
                            )}
                          </div>
                        ) : audio.kind === 'blob-only' ? (
                          <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
                            <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                            <span>
                              Bản ghi chỉ có URL blob tạm từ trình duyệt học viên (chưa tải lên R2
                              Cloud) nên không phát trực tiếp được trên máy chấm.
                            </span>
                          </div>
                        ) : (
                          <p className="text-xs text-slate-500">
                            {answer.answered
                              ? 'Câu tương tác (không có file ghi âm).'
                              : 'Thí sinh chưa trả lời câu hỏi này.'}
                          </p>
                        )}
                      </div>
                    </article>
                  )
                })
              )}
            </div>
          </section>

          <GradingAiPanel aiScore={sub.aiScore} aiFeedback={sub.aiFeedback} maxScore={maxScore} />
        </div>

        {/* Right column: Sticky Speaking Grading Form */}
        <div>
          <section className="sticky top-20 rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <h2 className="text-base font-semibold text-slate-900">Phiếu chấm Speaking</h2>
              {sub.status === 'GRADED' ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
                  <CheckCircle2 className="size-3.5" aria-hidden="true" />
                  Đã chấm ({sub.manualScore ?? 0}/{maxScore})
                </span>
              ) : (
                <span className="rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-800">
                  Chờ chấm
                </span>
              )}
            </div>

            {sub.grader && sub.gradedAt && (
              <p className="mt-3 text-xs text-slate-500">
                Lần chấm gần nhất bởi{' '}
                <span className="font-semibold text-slate-700">
                  {sub.grader.fullName || sub.grader.username}
                </span>{' '}
                lúc {new Date(sub.gradedAt).toLocaleString('vi-VN')}
              </p>
            )}

            {formError && (
              <div
                role="alert"
                className="mt-3 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-medium text-rose-700"
              >
                {formError}
              </div>
            )}

            {savedNotice && (
              <div className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-800">
                {savedNotice}
              </div>
            )}

            <form
              noValidate
              onSubmit={(e) => {
                e.preventDefault()
                void submitGrade(false)
              }}
              className="mt-4 space-y-4"
            >
              <div>
                <label
                  htmlFor="speaking-grade-score"
                  className="mb-1.5 block text-xs font-semibold text-slate-700"
                >
                  Điểm giáo viên (0 – {maxScore})
                </label>
                <input
                  id="speaking-grade-score"
                  type="number"
                  min={0}
                  max={maxScore}
                  step={1}
                  value={scoreInput}
                  onChange={(e) => setScoreInput(e.target.value)}
                  placeholder={`Nhập điểm 0..${maxScore}`}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-900 placeholder:text-slate-500 focus:border-blue-500 focus:outline-none"
                />
                <p className="mt-1 text-[11px] text-slate-500">
                  Sau khi lưu, điểm tổng bài thi (`ExamAttempt`) sẽ tự động tính lại ngay.
                </p>
              </div>

              <div>
                <label
                  htmlFor="speaking-grade-feedback"
                  className="mb-1.5 block text-xs font-semibold text-slate-700"
                >
                  Nhận xét bài nói
                </label>
                <textarea
                  id="speaking-grade-feedback"
                  rows={5}
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Nhận xét về phát âm, độ trôi chảy, từ vựng và phản xạ câu hỏi..."
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-500 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="flex flex-col gap-2 pt-1 sm:flex-row">
                <button
                  type="submit"
                  disabled={gradeMutation.isPending || advancing}
                  className="inline-flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm font-semibold text-slate-800 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {gradeMutation.isPending && !advancing ? (
                    <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                  ) : (
                    <Save className="size-4" aria-hidden="true" />
                  )}
                  Lưu điểm
                </button>
                <button
                  type="button"
                  disabled={gradeMutation.isPending || advancing}
                  onClick={() => void submitGrade(true)}
                  className="bg-admin-primary hover:bg-admin-primary-hover inline-flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-lg px-3.5 py-2.5 text-sm font-semibold text-white shadow-xs disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {advancing ? (
                    <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                  ) : (
                    <ArrowRight className="size-4" aria-hidden="true" />
                  )}
                  Lưu & Chấm tiếp
                </button>
              </div>
            </form>
          </section>
        </div>
      </div>
    </>
  )
}
