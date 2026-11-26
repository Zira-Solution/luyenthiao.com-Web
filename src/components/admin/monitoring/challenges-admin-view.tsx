'use client'

import { ChevronLeft, ChevronRight, Coins, Loader2, Search, Swords, Trophy } from 'lucide-react'
import { useState, type ReactElement } from 'react'

import { AdminPageHeader } from '@/components/admin/shell'
import { ROUTES } from '@/constants'
import { useAdminChallengeResults, useAdminChallengeRooms, useAdminPoints } from '@/hooks/admin'
import { cn } from '@/lib/utils'

const PAGE_LIMIT = 20

type MonitorTab = 'rooms' | 'results' | 'points'

function formatPlayerList(raw: unknown): string {
  if (!Array.isArray(raw)) return '—'
  return raw
    .map((p) => {
      if (!p || typeof p !== 'object') return ''
      const obj = p as Record<string, unknown>
      const name = typeof obj.name === 'string' ? obj.name : 'Player'
      const score = typeof obj.score === 'number' ? obj.score : 0
      return `${name} (${score})`
    })
    .filter(Boolean)
    .join(', ')
}

export function ChallengesAdminView(): ReactElement {
  const [tab, setTab] = useState<MonitorTab>('rooms')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [sourceFilter, setSourceFilter] = useState('all')
  const [page, setPage] = useState(1)

  const roomsQuery = useAdminChallengeRooms({
    status: statusFilter === 'all' ? undefined : statusFilter,
    q: search.trim() || undefined,
    page: tab === 'rooms' ? page : 1,
    limit: PAGE_LIMIT,
  })
  const resultsQuery = useAdminChallengeResults({
    q: search.trim() || undefined,
    page: tab === 'results' ? page : 1,
    limit: PAGE_LIMIT,
  })
  const pointsQuery = useAdminPoints({
    source: sourceFilter === 'all' ? undefined : sourceFilter,
    q: search.trim() || undefined,
    page: tab === 'points' ? page : 1,
    limit: PAGE_LIMIT,
  })

  const activeQuery = tab === 'rooms' ? roomsQuery : tab === 'results' ? resultsQuery : pointsQuery
  const total = activeQuery.data?.total ?? 0
  const totalPages = Math.max(1, Math.ceil(total / PAGE_LIMIT))

  return (
    <>
      <AdminPageHeader
        title="Giám sát Đấu trường & Nhật ký điểm"
        description="Theo dõi phòng đấu trực tuyến, kết quả các trận Thách đấu và lịch sử cộng điểm học viên."
        breadcrumbs={[{ label: 'Trang chủ', href: ROUTES.HOME }, { label: 'Đấu trường & Điểm' }]}
      />

      {activeQuery.error && (
        <div
          role="alert"
          className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700"
        >
          {activeQuery.error instanceof Error
            ? activeQuery.error.message
            : 'Không tải được dữ liệu giám sát.'}
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-slate-50 px-4 py-3">
          <div role="tablist" className="flex flex-wrap gap-1.5">
            {(
              [
                { id: 'rooms', label: 'Phòng đấu', icon: Swords },
                { id: 'results', label: 'Kết quả trận', icon: Trophy },
                { id: 'points', label: 'Nhật ký điểm', icon: Coins },
              ] as const
            ).map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={tab === id}
                onClick={() => {
                  setTab(id)
                  setPage(1)
                }}
                className={cn(
                  'inline-flex cursor-pointer items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors',
                  tab === id
                    ? 'bg-admin-primary text-white shadow-xs'
                    : 'bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-100',
                )}
              >
                <Icon className="size-3.5" aria-hidden="true" />
                {label}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {tab === 'rooms' && (
              <select
                aria-label="Lọc trạng thái phòng"
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value)
                  setPage(1)
                }}
                className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-800"
              >
                <option value="all">Mọi trạng thái</option>
                <option value="waiting">waiting</option>
                <option value="playing">playing</option>
                <option value="finished">finished</option>
              </select>
            )}

            {tab === 'points' && (
              <select
                aria-label="Lọc nguồn điểm"
                value={sourceFilter}
                onChange={(e) => {
                  setSourceFilter(e.target.value)
                  setPage(1)
                }}
                className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-800"
              >
                <option value="all">Mọi nguồn</option>
                <option value="EXAM">EXAM</option>
                <option value="SPEAKING">SPEAKING</option>
                <option value="WRITING">WRITING</option>
                <option value="CHALLENGE">CHALLENGE</option>
                <option value="TASK">TASK</option>
              </select>
            )}

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
                placeholder="Tìm mã phòng, đề hoặc user..."
                className="w-56 rounded-lg border border-slate-200 bg-white py-1.5 pr-3 pl-9 text-sm text-slate-900 placeholder:text-slate-500"
              />
            </div>
          </div>
        </div>

        {activeQuery.isLoading ? (
          <div className="flex items-center justify-center gap-2 py-14 text-sm text-slate-500">
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            Đang tải dữ liệu...
          </div>
        ) : tab === 'rooms' ? (
          <RoomsTable items={roomsQuery.data?.items ?? []} />
        ) : tab === 'results' ? (
          <ResultsTable items={resultsQuery.data?.items ?? []} />
        ) : (
          <PointsTable items={pointsQuery.data?.items ?? []} />
        )}

        <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-600">
          <span>
            Tổng {total} bản ghi · Trang {page}/{totalPages}
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

function RoomsTable({
  items,
}: {
  items: NonNullable<ReturnType<typeof useAdminChallengeRooms>['data']>['items']
}): ReactElement {
  if (items.length === 0) {
    return <div className="py-14 text-center text-sm text-slate-500">Chưa có phòng đấu nào.</div>
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[700px] border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold tracking-wider text-slate-600 uppercase">
            <th className="px-4 py-3">Mã phòng</th>
            <th className="px-4 py-3">Tiêu đề / Cấp độ</th>
            <th className="px-4 py-3">Trạng thái</th>
            <th className="px-4 py-3">Người chơi</th>
            <th className="px-4 py-3">Tạo lúc</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {items.map((r) => (
            <tr key={r.id} className="hover:bg-slate-50">
              <td className="px-4 py-3 font-mono font-semibold text-blue-700">{r.code}</td>
              <td className="px-4 py-3">
                <p className="font-medium text-slate-900">{r.title || '—'}</p>
                <p className="text-xs text-slate-500 uppercase">{r.levelSlug}</p>
              </td>
              <td className="px-4 py-3">
                <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700">
                  {r.status}
                </span>
              </td>
              <td className="px-4 py-3 text-xs text-slate-700">
                {r.players.map((p) => `${p.name} (${p.score})`).join(', ') || '—'}
              </td>
              <td className="px-4 py-3 text-xs text-slate-500">
                {new Date(r.createdAt).toLocaleString('vi-VN', {
                  dateStyle: 'short',
                  timeStyle: 'short',
                })}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function ResultsTable({
  items,
}: {
  items: NonNullable<ReturnType<typeof useAdminChallengeResults>['data']>['items']
}): ReactElement {
  if (items.length === 0) {
    return (
      <div className="py-14 text-center text-sm text-slate-500">Chưa có kết quả trận đấu nào.</div>
    )
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[700px] border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold tracking-wider text-slate-600 uppercase">
            <th className="px-4 py-3">Mã trận</th>
            <th className="px-4 py-3">Đề / Cấp độ</th>
            <th className="px-4 py-3">Bảng điểm người chơi</th>
            <th className="px-4 py-3">Thời gian</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {items.map((r) => (
            <tr key={r.id} className="hover:bg-slate-50">
              <td className="px-4 py-3 font-mono font-semibold text-blue-700">{r.code}</td>
              <td className="px-4 py-3">
                <p className="font-medium text-slate-900">{r.title || '—'}</p>
                <p className="text-xs text-slate-500 uppercase">{r.levelSlug}</p>
              </td>
              <td className="px-4 py-3 text-xs text-slate-700">{formatPlayerList(r.players)}</td>
              <td className="px-4 py-3 text-xs text-slate-500">
                {new Date(r.playedAt).toLocaleString('vi-VN', {
                  dateStyle: 'short',
                  timeStyle: 'short',
                })}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function PointsTable({
  items,
}: {
  items: NonNullable<ReturnType<typeof useAdminPoints>['data']>['items']
}): ReactElement {
  if (items.length === 0) {
    return <div className="py-14 text-center text-sm text-slate-500">Chưa có nhật ký điểm.</div>
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[680px] border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold tracking-wider text-slate-600 uppercase">
            <th className="px-4 py-3">Học viên</th>
            <th className="px-4 py-3">Nguồn</th>
            <th className="px-4 py-3">Điểm</th>
            <th className="px-4 py-3">Tham chiếu (refId)</th>
            <th className="px-4 py-3">Thời gian</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {items.map((p) => (
            <tr key={p.id} className="hover:bg-slate-50">
              <td className="px-4 py-3">
                <p className="font-semibold text-slate-900">
                  {p.user?.fullName || p.user?.username || `User #${p.userId}`}
                </p>
                <p className="text-xs text-slate-500">@{p.user?.username ?? p.userId}</p>
              </td>
              <td className="px-4 py-3">
                <span className="rounded-md bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-700">
                  {p.source}
                </span>
              </td>
              <td className="px-4 py-3 font-semibold text-emerald-700">+{p.points}</td>
              <td className="px-4 py-3 font-mono text-xs text-slate-500">{p.refId || '—'}</td>
              <td className="px-4 py-3 text-xs text-slate-500">
                {new Date(p.createdAt).toLocaleString('vi-VN', {
                  dateStyle: 'short',
                  timeStyle: 'short',
                })}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
