'use client'

import { Trophy } from 'lucide-react'

import { cn, formatScore } from '@/lib/utils'
import type { StudentRankingPage } from '@/schemas/ranking'

interface RankingTableProps {
  items: StudentRankingPage['items']
}

export function RankingTable({ items }: RankingTableProps): React.ReactElement {
  return (
    <div className="bg-ranking-table-bg border-ranking-table-border w-full overflow-hidden rounded-[2rem] border-3 shadow-[0_15px_30px_rgba(0,0,0,0.5)] backdrop-blur-sm">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-ranking-table-border bg-game-input-focus-shadow border-b-2">
              <th className="font-heading w-24 px-6 py-4.5 text-center text-xs font-black tracking-widest text-blue-200 uppercase md:text-sm">
                Hạng
              </th>
              <th className="font-heading px-6 py-4.5 text-xs font-black tracking-widest text-blue-200 uppercase md:text-sm">
                Học Sinh
              </th>
              <th className="font-heading hidden px-6 py-4.5 text-xs font-black tracking-widest text-blue-200 uppercase md:text-sm lg:table-cell">
                Trường học
              </th>
              <th className="font-heading px-6 py-4.5 text-right text-xs font-black tracking-widest text-blue-200 uppercase md:text-sm">
                Điểm số
              </th>
            </tr>
          </thead>
          <tbody>
            {items.map((user, index) => {
              const isTop1 = user.rank === 1
              const isTop2 = user.rank === 2
              const isTop3 = user.rank === 3

              return (
                <tr
                  key={`${user.rank}-${index}`}
                  className={cn(
                    'hover:bg-game-input-focus-shadow/40 group border-b border-white/5 transition-colors',
                    isTop1 &&
                      'border-l-4 border-yellow-400 bg-gradient-to-r from-yellow-500/10 via-yellow-500/5 to-transparent',
                    isTop2 &&
                      'border-l-4 border-slate-400 bg-gradient-to-r from-slate-400/10 via-slate-400/5 to-transparent',
                    isTop3 &&
                      'border-l-4 border-orange-800 bg-gradient-to-r from-orange-900/15 via-orange-900/5 to-transparent',
                  )}
                >
                  {/* Rank Column with 3D Medals */}
                  <td className="px-6 py-4 text-center">
                    {isTop1 ? (
                      <div className="from-yellow-350 mx-auto flex h-9 w-9 transform items-center justify-center rounded-full border-2 border-yellow-200 bg-gradient-to-b to-amber-500 shadow-[0_3px_6px_rgba(234,179,8,0.4)] transition-transform hover:scale-105">
                        <Trophy className="h-5 w-5 text-yellow-950 drop-shadow-[0_1px_1px_rgba(255,255,255,0.4)]" />
                      </div>
                    ) : isTop2 ? (
                      <div className="mx-auto flex h-9 w-9 transform items-center justify-center rounded-full border-2 border-slate-100 bg-gradient-to-b from-slate-200 to-slate-400 shadow-[0_3px_6px_rgba(156,163,175,0.3)] transition-transform hover:scale-105">
                        <Trophy className="h-5 w-5 text-slate-800 drop-shadow-[0_1px_1px_rgba(255,255,255,0.4)]" />
                      </div>
                    ) : isTop3 ? (
                      <div className="mx-auto flex h-9 w-9 transform items-center justify-center rounded-full border-2 border-orange-600 bg-gradient-to-b from-orange-800 to-amber-900 shadow-[0_3px_6px_rgba(154,52,18,0.4)] transition-transform hover:scale-105">
                        <Trophy className="h-5 w-5 text-orange-100 drop-shadow-[0_1px_1px_rgba(255,255,255,0.2)]" />
                      </div>
                    ) : (
                      <span className="font-heading text-base font-black text-white/50 md:text-lg">
                        {user.rank}
                      </span>
                    )}
                  </td>

                  {/* Student Column */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      {/* Avatar container with dynamic gradient border */}
                      <div
                        className={cn(
                          'bg-game-input-focus-shadow shrink-0 overflow-hidden rounded-full border-2 shadow-md',
                          isTop1
                            ? 'h-12 w-12 border-yellow-400 ring-2 ring-yellow-400/20'
                            : isTop2
                              ? 'ring-slate-350/20 h-11 w-11 border-slate-300 ring-2'
                              : isTop3
                                ? 'h-11 w-11 border-orange-700 ring-2 ring-orange-700/20'
                                : 'h-9 w-9 border-blue-500/30',
                        )}
                      >
                        <div className="flex h-full w-full items-center justify-center text-sm font-black text-white uppercase">
                          {user.displayName.charAt(0).toUpperCase()}
                        </div>
                      </div>

                      {/* Name styling */}
                      <span
                        className={cn(
                          'font-extrabold transition-colors group-hover:text-blue-300',
                          isTop1
                            ? 'text-yellow-350 text-base drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)] md:text-lg'
                            : isTop2
                              ? 'text-sm text-slate-200 md:text-base'
                              : isTop3
                                ? 'text-sm text-orange-300 md:text-base'
                                : 'text-sm text-white/90',
                        )}
                      >
                        {user.displayName}
                      </span>
                    </div>
                  </td>

                  {/* School Column */}
                  <td className="hidden px-6 py-4 lg:table-cell">
                    <span className="text-sm font-semibold text-white/70">{user.schoolName}</span>
                  </td>

                  {/* Score Column */}
                  <td className="px-6 py-4 text-right">
                    <span
                      className={cn(
                        'font-heading font-black tracking-widest',
                        isTop1
                          ? 'text-yellow-350 text-2xl drop-shadow-[0_2px_4px_rgba(234,179,8,0.4)] md:text-3xl'
                          : isTop2
                            ? 'text-xl text-slate-200 drop-shadow-[0_2px_4px_rgba(156,163,175,0.3)] md:text-2xl'
                            : isTop3
                              ? 'text-lg text-orange-300 drop-shadow-[0_2px_4px_rgba(154,52,18,0.3)] md:text-xl'
                              : 'text-base text-white md:text-lg',
                      )}
                    >
                      {formatScore(user.totalPoints)}
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Table Footer with custom game design */}
      <div className="bg-game-input-focus-shadow border-ranking-table-border border-t-2 p-4.5 text-center shadow-inner">
        <p className="font-heading flex items-center justify-center gap-2 text-xs font-black tracking-wider text-yellow-400 uppercase md:text-sm">
          <span>✨</span>
          <span>Bảng Xếp Hạng “nhà Du Hành” Xuất Sắc Của Cuộc Thi Phá Đảo Cùng Luyện Thi Ảo</span>
          <span>✨</span>
        </p>
      </div>
    </div>
  )
}
