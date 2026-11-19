'use client'

import { School, Filter } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

import { MyRankCard } from './my-rank-card'
import { Pagination, PeriodTabs, RankingMessage } from './ranking-controls'
import { RankingTable } from './ranking-table'

import type { PublicResult } from '@/lib/api/public-result'
import { rankingHref, type RankingQuery } from '@/lib/ranking-params'
import { cn } from '@/lib/utils'
import type { PublicSchool, StudentRankingPage } from '@/schemas/ranking'

interface RankingViewProps {
  query: RankingQuery
  ranking: PublicResult<StudentRankingPage>
  schools: PublicSchool[]
}

export function RankingView({ query, ranking, schools }: RankingViewProps): React.ReactElement {
  const router = useRouter()

  return (
    <div className="text-shadow-game-title z-10 mx-auto flex w-full max-w-7xl flex-col items-center px-4 py-4 pb-[120px] md:px-8 md:py-6">
      {/* Title with beautiful 3D text shadow */}
      <h1 className="font-heading text-shadow-game-title mb-5 text-center text-4xl font-black tracking-wider text-white uppercase drop-shadow-lg md:text-5xl">
        BẢNG XẾP HẠNG
      </h1>

      {/* Gamified Filters Panel */}
      <div className="bg-ranking-table-bg border-ranking-table-border text-shadow-game-title mb-6 flex w-full flex-col gap-4 rounded-[2rem] border-3 p-5 shadow-[0_15px_30px_rgba(0,0,0,0.4)] backdrop-blur-sm">
        <div className="text-shadow-game-title flex items-center gap-2 border-b border-white/10 pb-3 text-sm font-black tracking-wider text-white/80 uppercase">
          <Filter className="text-shadow-game-title h-4 w-4 text-orange-400" />
          <span>Bộ lọc nâng cao</span>
        </div>

        <div className="text-shadow-game-title grid w-full grid-cols-1 items-center gap-4">
          {/* School Select */}
          <div className="text-shadow-game-title relative w-full">
            <select
              aria-label="Lọc theo trường"
              value={query.schoolId ? String(query.schoolId) : ''}
              onChange={(e) =>
                router.push(
                  rankingHref('/ranking', {
                    period: query.period,
                    page: 1,
                    ...(e.target.value ? { schoolId: Number(e.target.value) } : {}),
                  }),
                )
              }
              className="bg-game-input-focus-shadow hover:bg-game-input-hover-bg border-ranking-table-border text-shadow-game-title w-full cursor-pointer appearance-none rounded-xl border-2 px-4 py-3 text-sm font-semibold text-white shadow-inner outline-none focus:border-blue-400"
            >
              <option value="" className="bg-dropdown-bg text-shadow-game-title text-white">
                Tất cả trường
              </option>
              {schools.map((school) => (
                <option
                  key={school.id}
                  value={school.id}
                  className="bg-dropdown-bg text-shadow-game-title text-white"
                >
                  {school.name}
                </option>
              ))}
            </select>
            <div className="text-shadow-game-title pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-blue-300">
              <School className="text-shadow-game-title h-4 w-4" />
            </div>
          </div>
        </div>
      </div>

      <MyRankCard period={query.period} />

      {/* Tabs Layout */}
      <div className="text-shadow-game-title mb-6 flex w-full flex-col items-center justify-between gap-5 md:flex-row">
        {/* Time Tabs (Bubbly Pill style) */}
        <PeriodTabs base="/ranking" query={query} />

        {/* Entity Tabs with bold text and custom highlights */}
        <div className="text-shadow-game-title flex gap-8">
          <Link
            href="/ranking"
            aria-current="page"
            className={cn(
              'font-heading relative cursor-pointer pb-1 text-xl font-black tracking-wider uppercase transition-all duration-300',
              "text-yellow-400 drop-shadow-[0_2px_4px_rgba(234,179,8,0.3)] after:absolute after:bottom-[-4px] after:left-0 after:h-[4px] after:w-full after:rounded-full after:bg-gradient-to-r after:from-yellow-300 after:to-amber-500 after:content-['']",
            )}
          >
            Học sinh xuất sắc
          </Link>
          <Link
            href="/school-ranking"
            className={cn(
              'font-heading relative cursor-pointer pb-1 text-xl font-black tracking-wider uppercase transition-all duration-300',
              'text-white/40 hover:text-white/70',
            )}
          >
            Trường học tích cực
          </Link>
        </div>
      </div>

      {/* Main Ranking Table Card */}
      <div className="animate-in fade-in slide-in-from-bottom-5 text-shadow-game-title w-full transition-all duration-300 duration-500">
        {!ranking.ok ? (
          <RankingMessage>Tạm thời không tải được dữ liệu, vui lòng thử lại sau.</RankingMessage>
        ) : ranking.data.items.length === 0 ? (
          <>
            <RankingMessage>Chưa có dữ liệu xếp hạng.</RankingMessage>
            <Pagination base="/ranking" query={query} total={ranking.data.total} />
          </>
        ) : (
          <>
            <RankingTable items={ranking.data.items} />
            <Pagination base="/ranking" query={query} total={ranking.data.total} />
          </>
        )}
      </div>
    </div>
  )
}
