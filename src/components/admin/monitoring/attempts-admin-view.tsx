'use client'

import { ChevronLeft, ChevronRight, Loader2, Search } from 'lucide-react'
import { useState, type ReactElement } from 'react'

import { AdminPageHeader } from '@/components/admin/shell'
import { ROUTES } from '@/constants'
import { useAdminAttempts, useAdminPlanets } from '@/hooks/admin'

const PAGE_LIMIT = 20

function formatDuration(sec: number): string {
  const m = Math.floor(sec / 60)
  const s = sec % 60
  return `${m}p ${s}s`
}

export function AttemptsAdminView(): ReactElement {
  const [search, setSearch] = useState('')
  const [level, setLevel] = useState('all')
  const [page, setPage] = useState(1)

  const { data, isLoading, error } = useAdminAttempts({
    q: search.trim() || undefined,
    level: level === 'all' ? undefined : level,
    page,
    limit: PAGE_LIMIT,
  })
  const { data: planets = [] } = useAdminPlanets()

  const items = data?.items ?? []
  const total = data?.total ?? 0
  const totalPages = Math.max(1, Math.ceil(total / PAGE_LIMIT))

  return (
    <>
      <AdminPageHeader
        title="Lịch sử làm bài (Exam Attempts)"
        description="Theo dõi toàn bộ lượt nộp bài thi của học viên, điểm số trắc nghiệm và phần tự luận đính kèm."
        breadcrumbs={[{ label: 'Trang chủ', href: ROUTES.HOME }, { label: 'Lịch sử làm bài' }]}
      />

      {error && (
        <div
          role="alert"
          className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700"
        >
          {error instanceof Error ? error.message : 'Không tải được lịch sử làm bài.'}
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs">
        <div className="flex flex-wrap items-center gap-2.5 border-b border-slate-200 bg-slate-50 px-4 py-3">
          <div className="relative min-w-[200px] flex-1">
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
              placeholder="Tìm học viên hoặc tên đề..."
              className="w-full rounded-lg border border-slate-200 bg-white py-1.5 pr-3 pl-9 text-sm text-slate-900 placeholder:text-slate-500"
            />
          </div>

          <select
            aria-label="Lọc cấp độ"
            value={level}
            onChange={(e) => {
              setLevel(e.target.value)
              setPage(1)
            }}
            className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-800"
          >
            <option value="all">Mọi hành tinh</option>
            {planets.map((p) => (
              <option key={p.id} value={p.slug}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center gap-2 py-14 text-sm text-slate-500">
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            Đang tải lượt làm bài...
          </div>
        ) : items.length === 0 ? (
          <div className="py-14 text-center text-sm text-slate-500">Chưa có bài làm nào.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[780px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold tracking-wider text-slate-600 uppercase">
                  <th className="px-4 py-3">Học viên</th>
                  <th className="px-4 py-3">Đề thi</th>
                  <th className="px-4 py-3">Điểm / Tổng</th>
                  <th className="px-4 py-3">Đúng / Câu</th>
                  <th className="px-4 py-3">Tự luận kèm</th>
                  <th className="px-4 py-3">Thời lượng</th>
                  <th className="px-4 py-3">Thời gian nộp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.map((a) => (
                  <tr key={a.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <p className="font-semibold text-slate-900">
                        {a.user?.fullName || a.user?.username || `User #${a.userId}`}
                      </p>
                      <p className="text-xs text-slate-500">@{a.user?.username ?? a.userId}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-slate-800">{a.examTitle}</p>
                      {a.levelSlug && (
                        <p className="text-xs text-slate-500 uppercase">{a.levelSlug}</p>
                      )}
                    </td>
                    <td className="px-4 py-3 font-semibold text-blue-700">
                      {a.score}/{a.total}
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-700">
                      {a.correctCount}/{a.totalQuestions}
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-600">
                      {a._count?.writingSubmissions ?? 0} Writing ·{' '}
                      {a._count?.speakingSubmissions ?? 0} Speaking
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-600">
                      {formatDuration(a.timeSpentSec)}
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500">
                      {new Date(a.createdAt).toLocaleString('vi-VN', {
                        dateStyle: 'short',
                        timeStyle: 'short',
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-600">
          <span>
            Tổng {total} lượt làm bài · Trang {page}/{totalPages}
          </span>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="inline-flex cursor-pointer items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-slate-700 hover:bg-slate-100 disabled:opacity-50"
            >
              <ChevronLeft className="size-3.5" aria-hidden="true" />
              Trước
            </button>
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="inline-flex cursor-pointer items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-slate-700 hover:bg-slate-100 disabled:opacity-50"
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
