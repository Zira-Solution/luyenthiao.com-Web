'use client'

import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Loader2,
  Save,
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState, type ReactElement } from 'react'

import { GradingAiPanel } from './grading-ai-panel'

import { AdminPageHeader } from '@/components/admin/shell'
import { ROUTES } from '@/constants'
import { useAdminWritingSubmission, useGradeWritingSubmission } from '@/hooks/admin'
import { extractSubmissionPartContext, normalizeWritingFeedback } from '@/lib/admin-grading'
import { listAdminWritingQueue } from '@/lib/api/admin/grading'
import type { AdminWritingSubmission } from '@/schemas/admin-grading'

export interface WritingGradingViewProps {
  submissionId: string
}

export function WritingGradingView({ submissionId }: WritingGradingViewProps): ReactElement {
  const { data: sub, isLoading, error } = useAdminWritingSubmission(submissionId)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center gap-2 py-16 text-sm text-slate-500">
        <Loader2 className="size-4 animate-spin" aria-hidden="true" />
        Đang tải bài làm Writing...
      </div>
    )
  }

  if (error || !sub) {
    return (
      <div className="space-y-4">
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
          {error instanceof Error ? error.message : 'Không tìm thấy bài nộp Writing.'}
        </div>
        <Link
          href={`${ROUTES.ADMIN_GRADING}?tab=writing`}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Quay lại hàng đợi Writing
        </Link>
      </div>
    )
  }

  return <WritingGradingWorkspace key={sub.id} sub={sub} />
}

function WritingGradingWorkspace({ sub }: { sub: AdminWritingSubmission }): ReactElement {
  const router = useRouter()
  const gradeMutation = useGradeWritingSubmission()

  const partCtx = extractSubmissionPartContext(sub, 'write')
  const maxScore = partCtx.maxScore
  const initialFb = normalizeWritingFeedback(sub.feedback)

  const [scoreInput, setScoreInput] = useState(() => (sub.score != null ? String(sub.score) : ''))
  const [comment, setComment] = useState(() => initialFb.comment)
  const [errorsText, setErrorsText] = useState(() => initialFb.errors)
  const [tips, setTips] = useState(() => initialFb.tips)
  const [showSample, setShowSample] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [savedNotice, setSavedNotice] = useState<string | null>(null)
  const [advancing, setAdvancing] = useState(false)

  const submitGrade = async (andNext: boolean) => {
    setFormError(null)
    setSavedNotice(null)

    const trimmed = scoreInput.trim()
    const parsed = Number(trimmed)
    if (!trimmed || !Number.isInteger(parsed) || parsed < 0 || parsed > maxScore) {
      setFormError(`Điểm phải là số nguyên từ 0 đến ${maxScore}.`)
      return
    }

    try {
      await gradeMutation.mutateAsync({
        id: sub.id,
        input: {
          score: parsed,
          feedback: {
            comment: comment.trim(),
            errors: errorsText.trim(),
            tips: tips.trim(),
          },
        },
      })

      if (!andNext) {
        setSavedNotice(`Đã lưu điểm ${parsed}/${maxScore} và cập nhật tổng điểm bài thi.`)
        return
      }

      setAdvancing(true)
      const nextQueue = await listAdminWritingQueue({ status: 'PENDING', page: 1, limit: 5 })
      const nextItem = nextQueue.items.find((item) => item.id !== sub.id)
      if (nextItem) {
        router.push(`/admin/grading/writing/${encodeURIComponent(nextItem.id)}`)
      } else {
        router.push(`${ROUTES.ADMIN_GRADING}?tab=writing&done=1`)
      }
    } catch (err) {
      setAdvancing(false)
      setFormError(err instanceof Error ? err.message : 'Không lưu được kết quả chấm bài.')
    }
  }

  const studentName = sub.user?.fullName?.trim() || sub.user?.username || `User #${sub.userId}`
  const examTitle = sub.examAttempt?.examTitle || sub.examAttempt?.exam?.name || 'Đề thi Writing'

  return (
    <>
      <AdminPageHeader
        title={`Chấm Writing · ${examTitle}`}
        description={`Thí sinh: ${studentName} (@${sub.user?.username ?? sub.userId}) · ${sub.wordCount} từ`}
        breadcrumbs={[
          { label: 'Trang chủ', href: ROUTES.HOME },
          { label: 'Chấm bài', href: `${ROUTES.ADMIN_GRADING}?tab=writing` },
          { label: 'Chi tiết Writing' },
        ]}
        actions={
          <Link
            href={`${ROUTES.ADMIN_GRADING}?tab=writing`}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            <ArrowLeft className="size-4" aria-hidden="true" />
            Quay lại hàng đợi
          </Link>
        }
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.45fr_1fr]">
        {/* Left column: Prompt + Student Writing + Optional AI Read-only */}
        <div className="space-y-5">
          <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <h2 className="text-base font-semibold text-slate-900">
                {partCtx.prompt?.title || partCtx.title || 'Đề bài Writing'}
              </h2>
              <span className="rounded-md bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700">
                Thang điểm tối đa: {maxScore}
              </span>
            </div>

            {partCtx.examDeleted && (
              <p className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
                Đề thi gốc đã bị xóa — đang dùng thang điểm mặc định {maxScore}.
              </p>
            )}

            {partCtx.prompt?.instruction && (
              <p className="mt-3 text-sm leading-relaxed whitespace-pre-wrap text-slate-700">
                {partCtx.prompt.instruction}
              </p>
            )}

            {Array.isArray(partCtx.prompt?.images) && partCtx.prompt.images.length > 0 && (
              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
                {partCtx.prompt.images.map((img, i) => (
                  <div
                    key={`${img.slot}-${i}`}
                    className="overflow-hidden rounded-lg border border-slate-200 bg-slate-50"
                  >
                    {img.src ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={img.src}
                        alt={img.alt || `Ảnh gợi ý ${i + 1}`}
                        className="h-36 w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-36 items-center justify-center text-xs text-slate-400">
                        Chưa có ảnh
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {partCtx.prompt?.sampleAnswer && (
              <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50">
                <button
                  type="button"
                  onClick={() => setShowSample((v) => !v)}
                  className="flex w-full cursor-pointer items-center justify-between px-3.5 py-2.5 text-xs font-semibold text-emerald-800"
                >
                  <span>Bài mẫu tham khảo</span>
                  {showSample ? (
                    <ChevronUp className="size-4" aria-hidden="true" />
                  ) : (
                    <ChevronDown className="size-4" aria-hidden="true" />
                  )}
                </button>
                {showSample && (
                  <p className="border-t border-emerald-200 px-3.5 py-3 text-sm leading-relaxed whitespace-pre-wrap text-emerald-950">
                    {partCtx.prompt.sampleAnswer}
                  </p>
                )}
              </div>
            )}
          </section>

          <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <h2 className="text-base font-semibold text-slate-900">Bài làm của thí sinh</h2>
              <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-700">
                {sub.wordCount} từ
              </span>
            </div>
            <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm leading-relaxed whitespace-pre-wrap text-slate-800">
              {sub.answerText.trim() ? sub.answerText : '(Thí sinh nộp bài trống)'}
            </div>
          </section>

          <GradingAiPanel aiScore={sub.aiScore} aiFeedback={sub.aiFeedback} maxScore={maxScore} />
        </div>

        {/* Right column: Sticky Grading Form */}
        <div>
          <section className="sticky top-20 rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <h2 className="text-base font-semibold text-slate-900">Phiếu chấm điểm</h2>
              {sub.status === 'GRADED' ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
                  <CheckCircle2 className="size-3.5" aria-hidden="true" />
                  Đã chấm ({sub.score}/{maxScore})
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
                  htmlFor="writing-grade-score"
                  className="mb-1.5 block text-xs font-semibold text-slate-700"
                >
                  Điểm số nguyên (0 – {maxScore})
                </label>
                <input
                  id="writing-grade-score"
                  type="number"
                  min={0}
                  max={maxScore}
                  step={1}
                  value={scoreInput}
                  onChange={(e) => setScoreInput(e.target.value)}
                  placeholder={`Nhập điểm 0..${maxScore}`}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-900 placeholder:text-slate-500 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label
                  htmlFor="writing-grade-comment"
                  className="mb-1.5 block text-xs font-semibold text-slate-700"
                >
                  Nhận xét chung (comment)
                </label>
                <textarea
                  id="writing-grade-comment"
                  rows={3}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Nhận xét bố cục, ý tưởng và mức độ hoàn thành yêu cầu..."
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-500 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label
                  htmlFor="writing-grade-errors"
                  className="mb-1.5 block text-xs font-semibold text-slate-700"
                >
                  Lỗi cần lưu ý (errors)
                </label>
                <textarea
                  id="writing-grade-errors"
                  rows={3}
                  value={errorsText}
                  onChange={(e) => setErrorsText(e.target.value)}
                  placeholder="Lỗi chính tả, ngữ pháp hoặc dùng từ chưa chính xác..."
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-500 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label
                  htmlFor="writing-grade-tips"
                  className="mb-1.5 block text-xs font-semibold text-slate-700"
                >
                  Gợi ý cải thiện (tips)
                </label>
                <textarea
                  id="writing-grade-tips"
                  rows={2}
                  value={tips}
                  onChange={(e) => setTips(e.target.value)}
                  placeholder="Lời khuyên giúp học viên cải thiện điểm ở bài sau..."
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
