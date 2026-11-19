import Link from 'next/link'

import { rankingHref, type RankingQuery } from '@/lib/ranking-params'
import { RANKING_PAGE_SIZE, RANKING_PERIODS, type RankingPeriod } from '@/schemas/ranking'

const PERIOD_LABELS: Record<RankingPeriod, string> = {
  week: 'Tuần',
  month: 'Tháng',
  all: 'Tất cả',
}

interface PeriodTabsProps {
  base: string
  query: RankingQuery
}

interface PaginationProps extends PeriodTabsProps {
  total: number
}

export function PeriodTabs({ base, query }: PeriodTabsProps): React.ReactElement {
  return (
    <div className="bg-game-input-focus-shadow/80 border-ranking-table-border text-shadow-game-title flex gap-1 rounded-full border-2 p-1.5 shadow-lg backdrop-blur-sm">
      {RANKING_PERIODS.map((period) => (
        <Link
          key={period}
          aria-current={period === query.period ? 'page' : undefined}
          href={rankingHref(base, { ...query, period, page: 1 })}
          className={
            period === query.period
              ? 'text-shadow-game-title min-h-[36px] w-24 rounded-full border-b-3 border-orange-700 bg-orange-500 px-5 py-1.5 text-center text-xs font-black text-white uppercase shadow-[0_3px_6px_rgba(0,0,0,0.35)]'
              : 'text-shadow-game-title w-24 cursor-pointer rounded-full px-5 py-1.5 text-center text-xs font-extrabold tracking-wider text-blue-200/70 uppercase transition-all hover:bg-white/5 hover:text-white'
          }
        >
          {PERIOD_LABELS[period]}
        </Link>
      ))}
    </div>
  )
}

interface RankingMessageProps {
  children: React.ReactNode
}

export function RankingMessage({ children }: RankingMessageProps): React.ReactElement {
  return (
    <div className="bg-ranking-table-bg border-ranking-table-border w-full rounded-[2rem] border-3 p-10 text-center font-bold text-white shadow-[0_15px_30px_rgba(0,0,0,0.5)] backdrop-blur-sm">
      {children}
    </div>
  )
}

export function Pagination({ base, query, total }: PaginationProps): React.ReactElement | null {
  const pages = Math.max(1, Math.ceil(total / RANKING_PAGE_SIZE))
  if (total <= 0 || (pages === 1 && query.page === 1)) return null
  const linkClass =
    'px-4 py-2 rounded-full bg-game-input-focus-shadow border-2 border-ranking-table-border text-white font-extrabold text-xs hover:bg-white/10 transition-colors'
  return (
    <nav className="mt-6 flex items-center justify-center gap-4 text-sm font-bold text-white">
      {query.page > 1 && (
        <Link
          href={rankingHref(base, { ...query, page: Math.min(query.page - 1, pages) })}
          className={linkClass}
        >
          Trang trước
        </Link>
      )}
      <span>
        Trang {query.page}/{pages}
      </span>
      {query.page < pages && (
        <Link href={rankingHref(base, { ...query, page: query.page + 1 })} className={linkClass}>
          Trang sau
        </Link>
      )}
    </nav>
  )
}
