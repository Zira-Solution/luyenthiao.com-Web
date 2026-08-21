"use client";

import { GraduationCap, Trophy } from "lucide-react";

import schoolRankingData from "../../../_webclone/design-model/mocks/school-ranking.json";

import { cn } from "@/lib/utils";

export function SchoolRankingTable() {
  return (
    <div className="w-full bg-ranking-table-bg backdrop-blur-sm rounded-[2rem] border-3 border-ranking-table-border overflow-hidden shadow-[0_15px_30px_rgba(0,0,0,0.5)]">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b-2 border-ranking-table-border bg-game-input-focus-shadow">
              <th className="py-4.5 px-6 text-blue-200 font-black uppercase text-xs md:text-sm tracking-widest w-24 text-center font-heading">
                Hạng
              </th>
              <th className="py-4.5 px-6 text-blue-200 font-black uppercase text-xs md:text-sm tracking-widest font-heading">
                Trường Học
              </th>
              <th className="py-4.5 px-6 text-blue-200 font-black uppercase text-xs md:text-sm tracking-widest hidden md:table-cell font-heading">
                Tỉnh/Thành Phố
              </th>
              <th className="py-4.5 px-6 text-blue-200 font-black uppercase text-xs md:text-sm tracking-widest hidden lg:table-cell font-heading">
                Số Học Sinh
              </th>
              <th className="py-4.5 px-6 text-blue-200 font-black uppercase text-xs md:text-sm tracking-widest text-right font-heading">
                Tổng Điểm
              </th>
            </tr>
          </thead>
          <tbody>
            {schoolRankingData.map((school) => {
              const isTop1 = school.rank === 1;
              const isTop2 = school.rank === 2;
              const isTop3 = school.rank === 3;

              return (
                <tr
                  key={school.rank}
                  className={cn(
                    "border-b border-white/5 transition-colors hover:bg-game-input-focus-shadow/40 group",
                    isTop1 && "bg-gradient-to-r from-yellow-500/10 via-yellow-500/5 to-transparent border-l-4 border-yellow-400",
                    isTop2 && "bg-gradient-to-r from-slate-400/10 via-slate-400/5 to-transparent border-l-4 border-slate-400",
                    isTop3 && "bg-gradient-to-r from-amber-700/15 via-amber-750/5 to-transparent border-l-4 border-amber-600"
                  )}
                >
                  {/* Rank Column with 3D Medals */}
                  <td className="py-4 px-6 text-center">
                    {isTop1 ? (
                      <div className="w-9 h-9 mx-auto bg-gradient-to-b from-yellow-350 to-amber-500 rounded-full flex items-center justify-center border-2 border-yellow-200 shadow-[0_3px_6px_rgba(234,179,8,0.4)] transform hover:scale-105 transition-transform">
                        <Trophy className="w-5 h-5 text-yellow-950 drop-shadow-[0_1px_1px_rgba(255,255,255,0.4)]" />
                      </div>
                    ) : isTop2 ? (
                      <div className="w-9 h-9 mx-auto bg-gradient-to-b from-slate-200 to-slate-400 rounded-full flex items-center justify-center border-2 border-slate-100 shadow-[0_3px_6px_rgba(156,163,175,0.3)] transform hover:scale-105 transition-transform">
                        <Trophy className="w-5 h-5 text-slate-800 drop-shadow-[0_1px_1px_rgba(255,255,255,0.4)]" />
                      </div>
                    ) : isTop3 ? (
                      <div className="w-9 h-9 mx-auto bg-gradient-to-b from-amber-500 to-amber-700 rounded-full flex items-center justify-center border-2 border-amber-400 shadow-[0_3px_6px_rgba(217,119,6,0.3)] transform hover:scale-105 transition-transform">
                        <Trophy className="w-5 h-5 text-amber-950 drop-shadow-[0_1px_1px_rgba(255,255,255,0.3)]" />
                      </div>
                    ) : (
                      <span className="text-white/50 font-black text-base md:text-lg font-heading">{school.rank}</span>
                    )}
                  </td>

                  {/* School Column */}
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "rounded-full overflow-hidden border-2 shrink-0 bg-game-input-focus-shadow shadow-md",
                        isTop1 ? "w-12 h-12 border-yellow-400 ring-2 ring-yellow-400/20" : 
                        isTop2 ? "w-11 h-11 border-slate-300 ring-2 ring-slate-350/20" : 
                        isTop3 ? "w-11 h-11 border-amber-600 ring-2 ring-amber-600/20" : 
                        "w-9 h-9 border-blue-500/30"
                      )}>
                        <div
                          className="w-full h-full flex items-center justify-center"
                          style={{ background: "linear-gradient(135deg, rgba(59,130,246,0.3), rgba(88,28,135,0.5))" }}
                        >
                          <GraduationCap className="w-3/5 h-3/5 text-white/90" />
                        </div>
                      </div>
                      <span className={cn(
                        "font-extrabold transition-colors group-hover:text-blue-300",
                        isTop1 ? "text-base md:text-lg text-yellow-350 drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]" : 
                        isTop2 ? "text-sm md:text-base text-slate-200" : 
                        isTop3 ? "text-sm md:text-base text-amber-300" : "text-sm text-white/90"
                      )}>
                        {school.name}
                      </span>
                    </div>
                  </td>

                  {/* Location Column */}
                  <td className="py-4 px-6 hidden md:table-cell">
                    <span className="text-white/70 font-semibold text-sm">{school.location}</span>
                  </td>

                  {/* Student Count Column */}
                  <td className="py-4 px-6 hidden lg:table-cell">
                    <span className="text-white/70 font-semibold text-sm">{school.studentCount}</span>
                  </td>

                  {/* Score Column */}
                  <td className="py-4 px-6 text-right">
                    <span className={cn(
                      "font-black tracking-widest font-heading",
                      isTop1 ? "text-xl md:text-2xl text-yellow-350 drop-shadow-[0_2px_4px_rgba(234,179,8,0.4)]" : 
                      isTop2 ? "text-lg md:text-xl text-slate-200 drop-shadow-[0_2px_4px_rgba(156,163,175,0.3)]" : 
                      isTop3 ? "text-lg md:text-xl text-amber-300 drop-shadow-[0_2px_4px_rgba(217,119,6,0.3)]" : "text-base md:text-lg text-white"
                    )}>
                      {school.score.toLocaleString()}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      
      {/* Table Footer with custom game design */}
      <div className="p-4.5 bg-game-input-focus-shadow border-t-2 border-ranking-table-border text-center shadow-inner">
        <p className="text-yellow-400 font-black text-xs md:text-sm tracking-wider uppercase font-heading flex items-center justify-center gap-2">
          <span>✨</span>
          <span>Những Ngôi Trường “nhà Du Hành” Sôi Nổi Nhất Cuộc Thi</span>
          <span>✨</span>
        </p>
      </div>
    </div>
  );
}