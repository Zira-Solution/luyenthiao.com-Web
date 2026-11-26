'use client'

import {
  Search,
  ChevronLeft,
  Shield,
  Filter,
  Calendar,
  Award,
  CheckCircle,
  ExternalLink,
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

import { useMyHistory } from '@/hooks/use-history'
import { GENERIC_ERROR_MESSAGE } from '@/lib/api-client'
import { formatDateTimeVi } from '@/lib/format'
import { LEVEL_OPTIONS, levelLabel } from '@/lib/level-label'
import { cn } from '@/lib/utils'
import {
  HISTORY_KIND_LABELS,
  HISTORY_STATUS_LABELS,
  kindLabel,
  statusLabel,
  type HistoryKind,
  type HistoryQuery,
  type HistoryStatus,
} from '@/schemas/history'

const KIND_TABS: { value: 'all' | HistoryKind; label: string }[] = [
  { value: 'all', label: 'Tất cả' },
  ...(Object.keys(HISTORY_KIND_LABELS) as HistoryKind[]).map((value) => ({
    value,
    label: HISTORY_KIND_LABELS[value],
  })),
]

export function HistoryView(): React.ReactElement {
  const router = useRouter()

  // Filter States: kind, status and level go to the server; the title search runs in the browser.
  const [selectedLevel, setSelectedLevel] = useState<string>('all')
  const [selectedKind, setSelectedKind] = useState<'all' | HistoryKind>('all')
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [selectedStatus, setSelectedStatus] = useState<'all' | HistoryStatus>('all')

  const query: HistoryQuery = {}
  if (selectedKind !== 'all') query.kind = selectedKind
  if (selectedStatus !== 'all') query.status = selectedStatus
  if (selectedLevel !== 'all') query.levelSlug = selectedLevel

  const { data, isPending, error, refetch } = useMyHistory(query)

  const needle = searchQuery.trim().toLowerCase()
  const filteredHistory = (data ?? []).filter(
    (item) => needle === '' || item.title.toLowerCase().includes(needle),
  )

  return (
    <div className="animate-in fade-in text-shadow-game-title z-10 mx-auto flex w-full max-w-7xl flex-col items-center px-4 py-4 pb-[120px] duration-500 md:px-8 md:py-6">
      {/* Top Navigation & Action Header */}
      <div className="text-shadow-game-title mb-5 flex w-full items-center justify-between gap-4">
        <button
          onClick={() => router.push('/')}
          className="bg-topbar-blue-bg/80 hover:bg-topbar-blue-hover text-shadow-game-title flex cursor-pointer items-center gap-1.5 rounded-2xl border-2 border-blue-500/30 px-4 py-2 text-xs font-black tracking-wider text-white uppercase transition-all active:translate-y-[2px] md:gap-2 md:text-sm"
        >
          <ChevronLeft className="text-yellow-450 text-shadow-game-title h-4 w-4 md:h-5 md:w-5" />
          <span>Quay lại</span>
        </button>

        <button
          onClick={() => alert('Đang chuyển hướng đến trang đổi khiên...')}
          className="group border-topbar-orange-border bg-topbar-orange-bg hover:bg-topbar-orange-hover active:bg-topbar-orange-active text-shadow-game-title relative flex shrink-0 cursor-pointer items-center gap-2 rounded-2xl border-b-4 px-4 py-2 shadow-[0_4px_6px_rgba(0,0,0,0.3)] transition-all active:translate-y-[2px]"
        >
          <Shield className="text-yellow-350 fill-yellow-350 text-shadow-game-title h-4 w-4 animate-bounce" />
          <span className="text-shadow-game-title text-[10px] font-black tracking-wider text-white uppercase md:text-xs">
            Quy đổi khiên
          </span>
        </button>
      </div>

      {/* Main Title */}
      <h1 className="font-heading text-shadow-game-title mb-5 text-center text-4xl font-black tracking-wider text-white uppercase drop-shadow-lg md:text-5xl">
        LỊCH SỬ LÀM BÀI
      </h1>

      {/* Filters Panel */}
      <div className="bg-ranking-table-bg border-ranking-table-border text-shadow-game-title mb-6 flex w-full flex-col gap-4 rounded-[2rem] border-3 p-5 shadow-[0_15px_30px_rgba(0,0,0,0.4)] backdrop-blur-sm">
        <div className="text-shadow-game-title flex items-center gap-2 border-b border-white/10 pb-3 text-sm font-black tracking-wider text-white/80 uppercase">
          <Filter className="text-shadow-game-title h-4 w-4 text-orange-400" />
          <span>Bộ lọc lịch sử</span>
        </div>

        <div className="text-shadow-game-title grid w-full grid-cols-1 items-center gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Test Name Search */}
          <div className="bg-game-input-focus-shadow border-ranking-table-border text-shadow-game-title flex w-full items-center rounded-xl border-2 px-4 py-3 shadow-inner transition-all focus-within:border-blue-400">
            <Search className="text-shadow-game-title mr-2 h-5 w-5 shrink-0 text-blue-300" />
            <input
              type="search"
              aria-label="Tìm kiếm"
              placeholder="Tìm tên bài kiểm tra..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="text-shadow-game-title w-full border-none bg-transparent text-sm font-semibold text-white outline-none placeholder:text-blue-300/40"
            />
          </div>

          {/* Level Filter */}
          <div className="text-shadow-game-title relative w-full">
            <select
              aria-label="Lọc theo cấp độ"
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              className="bg-game-input-focus-shadow hover:bg-game-input-hover-bg border-ranking-table-border text-shadow-game-title w-full cursor-pointer appearance-none rounded-xl border-2 px-4 py-3 text-sm font-semibold text-white shadow-inner outline-none focus:border-blue-400"
            >
              <option value="all" className="bg-dropdown-bg text-shadow-game-title text-white">
                Tất cả cấp độ
              </option>
              {LEVEL_OPTIONS.map((o) => (
                <option
                  key={o.value}
                  value={o.value}
                  className="bg-dropdown-bg text-shadow-game-title text-white"
                >
                  {o.label}
                </option>
              ))}
            </select>
            <div className="text-shadow-game-title pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-blue-300">
              <Award className="text-shadow-game-title h-4 w-4" />
            </div>
          </div>

          {/* Kind Tabs */}
          <div className="bg-game-input-focus-shadow border-ranking-table-border text-shadow-game-title flex w-full gap-1 rounded-xl border-2 p-1">
            {KIND_TABS.map((tab) => (
              <button
                key={tab.value}
                onClick={() => setSelectedKind(tab.value)}
                aria-pressed={selectedKind === tab.value}
                className={cn(
                  'flex-1 cursor-pointer rounded-lg py-2 text-center text-xs font-black tracking-wider uppercase transition-all',
                  selectedKind === tab.value
                    ? 'bg-topbar-login-border border border-blue-400 text-white'
                    : 'text-blue-200 hover:text-white',
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Status Filter */}
          <div className="text-shadow-game-title relative w-full">
            <select
              aria-label="Lọc theo trạng thái"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as 'all' | HistoryStatus)}
              className="bg-game-input-focus-shadow hover:bg-game-input-hover-bg border-ranking-table-border text-shadow-game-title w-full cursor-pointer appearance-none rounded-xl border-2 px-4 py-3 text-sm font-semibold text-white shadow-inner outline-none focus:border-blue-400"
            >
              <option value="all" className="bg-dropdown-bg text-shadow-game-title text-white">
                Tất cả trạng thái
              </option>
              {(Object.keys(HISTORY_STATUS_LABELS) as HistoryStatus[]).map((value) => (
                <option
                  key={value}
                  value={value}
                  className="bg-dropdown-bg text-shadow-game-title text-white"
                >
                  {HISTORY_STATUS_LABELS[value]}
                </option>
              ))}
            </select>
            <div className="text-shadow-game-title pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-blue-300">
              <CheckCircle className="text-shadow-game-title h-4 w-4" />
            </div>
          </div>
        </div>
      </div>

      {/* History Content */}
      <div className="bg-ranking-table-bg border-ranking-table-border text-shadow-game-title w-full overflow-hidden rounded-[2.2rem] border-3 p-4 shadow-[0_15px_30px_rgba(0,0,0,0.5)] backdrop-blur-sm md:p-6">
        {isPending ? (
          <p className="w-full py-10 text-center text-sm font-extrabold tracking-wider text-blue-300 uppercase">
            Đang tải lịch sử…
          </p>
        ) : error ? (
          <div className="w-full py-10 text-center">
            <p className="mb-4 text-sm font-black tracking-wider text-white">
              {error instanceof Error ? error.message : GENERIC_ERROR_MESSAGE}
            </p>
            <button
              onClick={() => refetch()}
              className="bg-topbar-blue-bg/80 hover:bg-topbar-blue-hover cursor-pointer rounded-2xl border-2 border-blue-500/30 px-4 py-2 text-xs font-black tracking-wider text-white uppercase transition-all active:translate-y-[2px]"
            >
              Thử lại
            </button>
          </div>
        ) : filteredHistory.length === 0 ? (
          /* Empty State */
          <div className="text-shadow-game-title flex w-full flex-col items-center justify-center py-10 text-center">
            <div className="text-shadow-game-title relative mb-6 h-36 w-36 animate-[floating_4s_ease-in-out_infinite] md:h-44 md:w-44">
              <img
                src="/clone-assets/logo.46df16c4.png"
                alt="Mascot sleeping"
                className="text-shadow-game-title h-full w-full object-contain opacity-80 drop-shadow-[0_8px_16px_rgba(0,0,0,0.4)] filter"
                onError={(e) => {
                  ;(e.target as HTMLImageElement).src =
                    '/clone-assets/media/ic-challenge.9b2229cb.png' // fallback
                }}
              />
              <span className="text-shadow-game-title absolute -top-1 right-2 animate-bounce text-3xl md:text-4xl">
                💤
              </span>
            </div>
            <h2 className="font-heading text-shadow-game-title mb-2 text-lg font-black tracking-wider text-white md:text-2xl">
              Chưa có bài làm nào.
            </h2>
            <p className="text-shadow-game-title text-xs font-extrabold tracking-widest text-blue-300 uppercase md:text-sm">
              CHĂM CHỈ LÀM BÀI HƠN BẠN NHÉ!
            </p>
          </div>
        ) : (
          /* Populated History Table */
          <div className="text-shadow-game-title w-full overflow-x-auto">
            <table className="text-shadow-game-title w-full border-collapse text-left">
              <thead>
                <tr className="text-shadow-game-title border-b-2 border-blue-500/20 text-[10px] font-black tracking-wider text-blue-300 uppercase md:text-xs">
                  <th className="text-shadow-game-title flex items-center gap-1.5 px-3 pt-2 pb-4">
                    <Calendar className="text-shadow-game-title h-3.5 w-3.5" />
                    <span>Thời gian nộp bài</span>
                  </th>
                  <th className="text-shadow-game-title px-3 pt-2 pb-4">Cấp độ</th>
                  <th className="text-shadow-game-title px-3 pt-2 pb-4">Loại</th>
                  <th className="text-shadow-game-title px-3 pt-2 pb-4">Đề thi</th>
                  <th className="text-shadow-game-title px-3 pt-2 pb-4 text-center">Điểm số</th>
                  <th className="text-shadow-game-title px-3 pt-2 pb-4 text-center">Số câu đúng</th>
                  <th className="text-shadow-game-title px-3 pt-2 pb-4 text-center">Trạng thái</th>
                  <th className="text-shadow-game-title px-3 pt-2 pb-4 text-right">Chi tiết</th>
                </tr>
              </thead>
              <tbody className="text-shadow-game-title divide-y divide-blue-500/10 text-xs font-semibold text-white md:text-sm">
                {filteredHistory.map((item) => (
                  <tr
                    key={item.id}
                    onClick={() => item.detailUrl && router.push(item.detailUrl)}
                    className="group text-shadow-game-title cursor-pointer transition-colors hover:bg-white/5"
                  >
                    <td className="text-shadow-game-title px-3 py-4 whitespace-nowrap text-white/70">
                      {formatDateTimeVi(item.createdAt)}
                    </td>
                    <td className="text-shadow-game-title px-3 py-4 whitespace-nowrap">
                      <span
                        className={cn(
                          'rounded-full border px-3 py-1 text-[9px] font-black tracking-wider uppercase',
                          item.levelSlug === 'starters' &&
                            'border-green-500/30 bg-green-500/10 text-green-400',
                          item.levelSlug === 'movers' &&
                            'border-red-500/30 bg-red-500/10 text-red-400',
                          item.levelSlug === 'flyers' &&
                            'border-purple-500/30 bg-purple-500/10 text-purple-400',
                          item.levelSlug === 'ioe' &&
                            'border-blue-500/30 bg-blue-500/10 text-blue-400',
                          item.levelSlug === 'toefl_primary' &&
                            'border-amber-500/30 bg-amber-500/10 text-amber-400',
                        )}
                      >
                        {levelLabel(item.levelSlug)}
                      </span>
                    </td>
                    <td className="text-shadow-game-title px-3 py-4 whitespace-nowrap text-blue-200">
                      {kindLabel(item.kind)}
                    </td>
                    <td className="group-hover:text-yellow-350 text-shadow-game-title max-w-xs truncate px-3 py-4 font-extrabold transition-colors">
                      {item.title}
                    </td>
                    <td className="text-yellow-350 text-shadow-game-title px-3 py-4 text-center text-base font-black drop-shadow-sm">
                      {item.score}/{item.maxScore}
                    </td>
                    <td className="text-shadow-game-title px-3 py-4 text-center font-bold text-green-400">
                      {item.correctCount}/{item.totalQuestions}
                    </td>
                    <td className="text-shadow-game-title px-3 py-4 text-center whitespace-nowrap">
                      <span
                        className={cn(
                          'text-shadow-game-title rounded-md border px-2 py-0.5 text-[10px] font-bold',
                          item.status === 'passed' &&
                            'border-emerald-500/30 bg-emerald-500/20 text-emerald-400',
                          item.status === 'failed' &&
                            'border-red-500/30 bg-red-500/20 text-red-400',
                          item.status === 'pending' &&
                            'border-amber-500/30 bg-amber-500/20 text-amber-400',
                          item.status === 'graded' &&
                            'border-blue-500/30 bg-blue-500/20 text-blue-400',
                        )}
                      >
                        {statusLabel(item.status)}
                      </span>
                    </td>
                    <td className="text-shadow-game-title px-3 py-4 text-right whitespace-nowrap">
                      {item.detailUrl ? (
                        <Link
                          href={item.detailUrl}
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex items-center gap-1 rounded-lg bg-blue-500/20 px-2.5 py-1 text-xs font-bold text-blue-200 hover:bg-blue-500/35 hover:text-white"
                        >
                          <span>Xem</span>
                          <ExternalLink className="h-3.5 w-3.5" aria-hidden />
                        </Link>
                      ) : (
                        <span className="text-white/40">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Footer Info / Parents QR Code */}
      <div className="bg-topbar-blue-bg/40 text-shadow-game-title mt-6 flex w-full flex-col items-center justify-between gap-5 rounded-[2rem] border-2 border-blue-500/20 p-5 backdrop-blur-sm md:flex-row">
        <div className="text-shadow-game-title flex items-center gap-4">
          <div className="text-shadow-game-title flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white p-1.5 shadow-md">
            {/* Simple Mock QR Code */}
            <svg viewBox="0 0 24 24" className="text-shadow-game-title h-full w-full text-blue-950">
              <path
                fill="currentColor"
                d="M3,3H9V9H3V3M5,5V7H7V5H5M15,3H21V9H15V3M17,5V7H19V5H17M3,15H9V21H3V15M5,17V19H7V17H5M15,15H17V17H15V15M17,17H19V19H17V17M19,15H21V17H19V15M15,19H17V21H15V19M19,19H21V21H19V19M11,3H13V5H11V3M11,7H13V9H11V7M11,11H13V13H11V11M3,11H5V13H3V11M7,11H9V13H7V11M15,11H17V13H15V11M19,11H21V13H19V11M11,15H13V17H11V15M11,19H13V21H11V19Z"
              />
            </svg>
          </div>
          <div className="text-shadow-game-title flex flex-col">
            <span className="text-shadow-game-title text-sm font-extrabold text-white md:text-base">
              Tải ứng dụng dành cho Thầy Cô / Phụ Huynh
            </span>
            <span className="text-shadow-game-title text-xs font-medium text-blue-300">
              Quét mã QR tải App để dễ dàng theo dõi chi tiết tiến trình học tập của con.
            </span>
          </div>
        </div>
        <div className="text-shadow-game-title flex gap-3">
          <a
            href="#"
            className="bg-topbar-auth-bg text-shadow-game-title flex items-center gap-1.5 rounded-xl border border-white/10 px-4 py-2 text-[10px] font-black tracking-wider text-white uppercase transition-all hover:bg-black"
          >
            <span>Google Play</span>
          </a>
          <a
            href="#"
            className="bg-topbar-auth-bg text-shadow-game-title flex items-center gap-1.5 rounded-xl border border-white/10 px-4 py-2 text-[10px] font-black tracking-wider text-white uppercase transition-all hover:bg-black"
          >
            <span>App Store</span>
          </a>
        </div>
      </div>
    </div>
  )
}
