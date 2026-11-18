'use client'

import { Pagination, PeriodTabs, RankingMessage } from './ranking-controls'
import { SchoolRankingTable } from './school-ranking-table'

import type { PublicResult } from '@/lib/api/public-result'
import type { RankingQuery } from '@/lib/ranking-params'
import type { SchoolRankingPage } from '@/schemas/ranking'

interface SchoolRankingViewProps {
  query: RankingQuery
  ranking: PublicResult<SchoolRankingPage>
}

export function SchoolRankingView({ query, ranking }: SchoolRankingViewProps): React.ReactElement {
  return (
    <div className="z-10 mx-auto flex w-full max-w-7xl flex-col items-center px-4 py-4 pb-[120px] md:px-8 md:py-6">
      {/* Title */}
      <h1 className="font-heading text-shadow-game-title mb-5 text-center text-4xl font-black tracking-wider text-white uppercase drop-shadow-lg md:text-5xl">
        BẢNG XẾP HẠNG TRƯỜNG HỌC
      </h1>

      {/* Time Tabs (Bubbly Pill style) */}
      <div className="mb-6 flex w-full flex-col items-center justify-between gap-5 md:flex-row">
        <PeriodTabs base="/school-ranking" query={query} />
      </div>

      {/* Main Ranking Table Card */}
      <div className="animate-in fade-in slide-in-from-bottom-5 w-full transition-all duration-300 duration-500">
        {!ranking.ok ? (
          <RankingMessage>Tạm thời không tải được dữ liệu, vui lòng thử lại sau.</RankingMessage>
        ) : ranking.data.items.length === 0 ? (
          <>
            <RankingMessage>Chưa có dữ liệu xếp hạng.</RankingMessage>
            <Pagination base="/school-ranking" query={query} total={ranking.data.total} />
          </>
        ) : (
          <>
            <SchoolRankingTable items={ranking.data.items} />
            <Pagination base="/school-ranking" query={query} total={ranking.data.total} />
          </>
        )}
      </div>
    </div>
  )
}
