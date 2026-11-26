'use client'

import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Loader2,
  Mic,
  PenLine,
  RefreshCw,
  Search,
} from 'lucide-react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense, useState, type ReactElement } from 'react'

import { AdminPageHeader } from '@/components/admin/shell'
import { ROUTES } from '@/constants'
import { useAdminSpeakingQueue, useAdminWritingQueue } from '@/hooks/admin'
import { countSpeakingRecordedAnswers, extractSubmissionPartContext } from '@/lib/admin-grading'
import { cn } from '@/lib/utils'

const PAGE_LIMIT = 20

type TabKind = 'writing' | 'speaking'
type StatusFilter = 'ALL' | 'PENDING' | 'GRADED'

function formatDateTime(iso?: string | null): string {
  if (!iso) return '—'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleString('vi-VN', { dateStyle: 'short', timeStyle: 'short' })
}

function StatusBadge({ status }: { status: 'PENDING' | 'GRADED' }): ReactElement {
  return status === 'GRADED' ? (
    <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
      <CheckCircle2 className="size-3.5" aria-hidden="true" />
      Đã chấm
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-800">
      <Clock className="size-3.5" aria-hidden="true" />
      Chờ chấm
    </span>
  )
}

function GradingQueueInner(): ReactElement {
  const router = useRouter()
  const searchParams = useSearchParams()
  const activeTab: TabKind = searchParams.get('tab') === 'speaking' ? 'speaking' : 'writing'
  const showDoneBanner = searchParams.get('done') === '1'

  const [statusFilter, setStatusFilter] = useState<StatusFilter>('PENDING')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)

  const apiStatus = statusFilter === 'ALL' ? undefined : statusFilter
  const writingQuery = useAdminWritingQueue({
    status: apiStatus,
    q: search.trim() || undefined,
    page: activeTab === 'writing' ? page : 1,
    limit: activeTab === 'writing' ? PAGE_LIMIT : 1,
  })
  const speakingQuery = useAdminSpeakingQueue({
    status: apiStatus,
    q: search.trim() || undefined,
    page: activeTab === 'speaking' ? page : 1,
    limit: activeTab === 'speaking' ? PAGE_LIMIT : 1,
  })

  const writingPending = writingQuery.data?.counts.pending ?? 0
  const speakingPending = speakingQuery.data?.counts.pending ?? 0

  const currentQuery = activeTab === 'writing' ? writingQuery : speakingQuery
  const total = currentQuery.data?.total ?? 0
  const totalPages = Math.max(1, Math.ceil(total / PAGE_LIMIT))

  const switchTab = (next: TabKind) => {
    setPage(1)
    const sp = new URLSearchParams()
    sp.set('tab', next)
    router.replace(`${ROUTES.ADMIN_GRADING}?${sp.toString()}`)
  }

  return (
    <>
      <AdminPageHeader
        title="Hàng đợi Chấm bài"
        description="Xem bài làm Speaking & Writing của học viên, nghe audio ghi âm từ R2 và chấm điểm cập nhật tổng bài thi."
        breadcrumbs={[{ label: 'Trang chủ', href: ROUTES.HOME }, { label: 'Chấm bài' }]}
        actions={
          <button
            type="button"
            onClick={() => {
              void writingQuery.refetch()
              void speakingQuery.refetch()
            }}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            <RefreshCw className="size-4" aria-hidden="true" />
            Làm mới
          </button>
        }
      />

      {showDoneBanner && (
        <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">
          Đã hoàn thành bài vừa chấm — không còn bài nào khác đang chờ ở hàng đợi hiện tại.
        </div>
      )}

      {currentQuery.error && (
        <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
          {currentQuery.error instanceof Error
            ? currentQuery.error.message
            : 'Không tải được danh sách bài nộp.'}
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-4 py-3">
          <div role="tablist" aria-label="Kỹ năng chấm bài" className="flex items-center gap-2">
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'writing'}
              onClick={() => switchTab('writing')}
              className={cn(
                'inline-flex cursor-pointer items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-semibold transition-colors',
                activeTab === 'writing'
                  ? 'bg-admin-primary text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200',
              )}
            >
              <PenLine className="size-4" aria-hidden="true" />
              Writing
              <span
                className={cn(
                  'rounded-full px-2 py-0.5 text-xs',
                  activeTab === 'writing'
                    ? 'bg-white text-blue-700'
                    : 'bg-amber-100 text-amber-800',
                )}
              >
                {writingPending} chờ
              </span>
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'speaking'}
              onClick={() => switchTab('speaking')}
              className={cn(
                'inline-flex cursor-pointer items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-semibold transition-colors',
                activeTab === 'speaking'
                  ? 'bg-admin-primary text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200',
              )}
            >
              <Mic className="size-4" aria-hidden="true" />
              Speaking
              <span
                className={cn(
                  'rounded-full px-2 py-0.5 text-xs',
                  activeTab === 'speaking'
                    ? 'bg-white text-blue-700'
                    : 'bg-amber-100 text-amber-800',
                )}
              >
                {speakingPending} chờ
              </span>
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex rounded-lg border border-slate-200 bg-slate-50 p-0.5">
              {(
                [
                  { id: 'PENDING', label: 'Chờ chấm' },
                  { id: 'GRADED', label: 'Đã chấm' },
                  { id: 'ALL', label: 'Tất cả' },
                ] as const
              ).map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => {
                    setStatusFilter(opt.id)
                    setPage(1)
                  }}
                  className={cn(
                    'cursor-pointer rounded-md px-3 py-1.5 text-xs font-semibold transition-colors',
                    statusFilter === opt.id
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900',
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            <div className="relative">
              <Search
                className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400"
                aria-hidden="true"
              />
              <input
                type="search"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value)
                  setPage(1)
                }}
                placeholder="Tìm học viên hoặc đề thi..."
                className="w-56 rounded-lg border border-slate-200 bg-white py-1.5 pr-3 pl-9 text-sm text-slate-900 placeholder:text-slate-500 focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {currentQuery.isLoading ? (
          <div className="flex items-center justify-center gap-2 py-14 text-sm text-slate-500">
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            Đang tải danh sách bài nộp...
          </div>
        ) : activeTab === 'writing' ? (
          <WritingQueueTable items={writingQuery.data?.items ?? []} />
        ) : (
          <SpeakingQueueTable items={speakingQuery.data?.items ?? []} />
        )}

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-600">
          <span>
            Tổng {total} bài · Trang {page}/{totalPages}
          </span>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              aria-label="Trang trước"
              className="inline-flex cursor-pointer items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <ChevronLeft className="size-3.5" aria-hidden="true" />
              Trước
            </button>
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              aria-label="Trang sau"
              className="inline-flex cursor-pointer items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Sau
              <ChevronRight className="size-3.5" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

function WritingQueueTable({
  items,
}: {
  items: NonNullable<ReturnType<typeof useAdminWritingQueue>['data']>['items']
}): ReactElement {
  if (items.length === 0) {
    return (
      <div className="py-14 text-center text-sm text-slate-500">
        Không có bài viết nào phù hợp bộ lọc hiện tại.
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[720px] border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold tracking-wider text-slate-600 uppercase">
            <th className="px-4 py-3">Học viên</th>
            <th className="px-4 py-3">Đề thi</th>
            <th className="px-4 py-3">Bài làm</th>
            <th className="px-4 py-3">Điểm</th>
            <th className="px-4 py-3">Trạng thái</th>
            <th className="px-4 py-3">Thời gian nộp</th>
            <th className="px-4 py-3 text-right">Thao tác</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {items.map((item) => {
            const ctx = extractSubmissionPartContext(item, 'write')
            const studentName =
              item.user?.fullName?.trim() || item.user?.username || `User #${item.userId}`
            const examTitle =
              item.examAttempt?.examTitle || item.examAttempt?.exam?.name || 'Đề Writing'
            return (
              <tr key={item.id} className="hover:bg-slate-50">
                <td className="px-4 py-3">
                  <p className="font-semibold text-slate-900">{studentName}</p>
                  <p className="text-xs text-slate-500">@{item.user?.username ?? item.userId}</p>
                </td>
                <td className="px-4 py-3">
                  <p className="font-medium text-slate-800">{examTitle}</p>
                  {item.examAttempt?.exam?.levelSlug && (
                    <p className="text-xs text-slate-500 uppercase">
                      {item.examAttempt.exam.levelSlug}
                    </p>
                  )}
                </td>
                <td className="px-4 py-3 text-xs text-slate-600">
                  <span className="font-semibold text-slate-800">{item.wordCount}</span> từ
                </td>
                <td className="px-4 py-3 font-semibold text-slate-900">
                  {item.score != null ? `${item.score}/${ctx.maxScore}` : `—/${ctx.maxScore}`}
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={item.status} />
                </td>
                <td className="px-4 py-3 text-xs text-slate-500">
                  {formatDateTime(item.submittedAt)}
                </td>
                <td className="px-4 py-3 text-right">
                  <Link
                    href={`/admin/grading/writing/${encodeURIComponent(item.id)}`}
                    className="bg-admin-primary hover:bg-admin-primary-hover inline-flex items-center rounded-lg px-3 py-1.5 text-xs font-semibold text-white transition-colors"
                  >
                    {item.status === 'GRADED' ? 'Xem & chấm lại' : 'Chấm bài'}
                  </Link>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

function SpeakingQueueTable({
  items,
}: {
  items: NonNullable<ReturnType<typeof useAdminSpeakingQueue>['data']>['items']
}): ReactElement {
  if (items.length === 0) {
    return (
      <div className="py-14 text-center text-sm text-slate-500">
        Không có bài nói nào phù hợp bộ lọc hiện tại.
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[720px] border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold tracking-wider text-slate-600 uppercase">
            <th className="px-4 py-3">Học viên</th>
            <th className="px-4 py-3">Đề thi</th>
            <th className="px-4 py-3">Trả lời / Audio</th>
            <th className="px-4 py-3">Điểm</th>
            <th className="px-4 py-3">Trạng thái</th>
            <th className="px-4 py-3">Thời gian nộp</th>
            <th className="px-4 py-3 text-right">Thao tác</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {items.map((item) => {
            const ctx = extractSubmissionPartContext(item, 'speak')
            const counts = countSpeakingRecordedAnswers(item.answers)
            const studentName =
              item.user?.fullName?.trim() || item.user?.username || `User #${item.userId}`
            const examTitle =
              item.examAttempt?.examTitle || item.examAttempt?.exam?.name || 'Đề Speaking'
            return (
              <tr key={item.id} className="hover:bg-slate-50">
                <td className="px-4 py-3">
                  <p className="font-semibold text-slate-900">{studentName}</p>
                  <p className="text-xs text-slate-500">@{item.user?.username ?? item.userId}</p>
                </td>
                <td className="px-4 py-3">
                  <p className="font-medium text-slate-800">{examTitle}</p>
                  {item.examAttempt?.exam?.levelSlug && (
                    <p className="text-xs text-slate-500 uppercase">
                      {item.examAttempt.exam.levelSlug}
                    </p>
                  )}
                </td>
                <td className="px-4 py-3 text-xs text-slate-600">
                  <span>{counts.totalAnswered} câu trả lời</span>
                  {' · '}
                  <span className="font-semibold text-blue-700">
                    {counts.cloudAudioCount} audio R2
                  </span>
                  {item.autoScore != null && (
                    <p className="mt-0.5 text-[11px] text-slate-500">
                      Auto slide: {item.autoScore}
                    </p>
                  )}
                </td>
                <td className="px-4 py-3 font-semibold text-slate-900">
                  {item.manualScore != null
                    ? `${item.manualScore}/${ctx.maxScore}`
                    : `—/${ctx.maxScore}`}
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={item.status} />
                </td>
                <td className="px-4 py-3 text-xs text-slate-500">
                  {formatDateTime(item.submittedAt)}
                </td>
                <td className="px-4 py-3 text-right">
                  <Link
                    href={`/admin/grading/speaking/${encodeURIComponent(item.id)}`}
                    className="bg-admin-primary hover:bg-admin-primary-hover inline-flex items-center rounded-lg px-3 py-1.5 text-xs font-semibold text-white transition-colors"
                  >
                    {item.status === 'GRADED' ? 'Xem & chấm lại' : 'Chấm bài'}
                  </Link>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

export function GradingQueueView(): ReactElement {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center gap-2 py-14 text-sm text-slate-500">
          <Loader2 className="size-4 animate-spin" aria-hidden="true" />
          Đang tải hàng đợi chấm bài...
        </div>
      }
    >
      <GradingQueueInner />
    </Suspense>
  )
}
