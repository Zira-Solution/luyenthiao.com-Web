"use client";

import { Trophy } from "lucide-react";

import rankingData from "../../../_webclone/design-model/mocks/ranking.json";

import { cn } from "@/lib/utils";

export function RankingTable() {
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
                Học Sinh
              </th>
              <th className="py-4.5 px-6 text-blue-200 font-black uppercase text-xs md:text-sm tracking-widest hidden md:table-cell font-heading">
                Tỉnh/Thành Phố
              </th>
              <th className="py-4.5 px-6 text-blue-200 font-black uppercase text-xs md:text-sm tracking-widest hidden lg:table-cell font-heading">
                Trường học
              </th>
              <th className="py-4.5 px-6 text-blue-200 font-black uppercase text-xs md:text-sm tracking-widest text-right font-heading">
                Điểm số
              </th>
            </tr>
          </thead>
          <tbody>
            {rankingData.map((user) => {
              const isTop1 = user.rank === 1;
              const isTop2 = user.rank === 2;
              const isTop3 = user.rank === 3;

              return (
                <tr
                  key={user.rank}
                  className={cn(
                    "border-b border-white/5 transition-colors hover:bg-game-input-focus-shadow/40 group",
                    isTop1 && "bg-gradient-to-r from-yellow-500/10 via-yellow-500/5 to-transparent border-l-4 border-yellow-400",
                    isTop2 && "bg-gradient-to-r from-slate-400/10 via-slate-400/5 to-transparent border-l-4 border-slate-400",
                    isTop3 && "bg-gradient-to-r from-orange-900/15 via-orange-900/5 to-transparent border-l-4 border-orange-800"
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
                      <div className="w-9 h-9 mx-auto bg-gradient-to-b from-orange-800 to-amber-900 rounded-full flex items-center justify-center border-2 border-orange-600 shadow-[0_3px_6px_rgba(154,52,18,0.4)] transform hover:scale-105 transition-transform">
                        <Trophy className="w-5 h-5 text-orange-100 drop-shadow-[0_1px_1px_rgba(255,255,255,0.2)]" />
                      </div>
                    ) : (
                      <span className="text-white/50 font-black text-base md:text-lg font-heading">{user.rank}</span>
                    )}
                  </td>

                  {/* Student Column */}
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-4">
                      {/* Avatar container with dynamic gradient border */}
                      <div className={cn(
                        "rounded-full overflow-hidden border-2 shrink-0 bg-game-input-focus-shadow shadow-md",
                        isTop1 ? "w-12 h-12 border-yellow-400 ring-2 ring-yellow-400/20" : 
                        isTop2 ? "w-11 h-11 border-slate-300 ring-2 ring-slate-350/20" : 
                        isTop3 ? "w-11 h-11 border-orange-700 ring-2 ring-orange-700/20" : 
                        "w-9 h-9 border-blue-500/30"
                      )}>
                        <img 
                          src={user.avatar} 
                          alt={user.name} 
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://api.dicebear.com/7.x/adventurer/svg?seed=' + user.name;
                          }}
                        />
                      </div>
                      
                      {/* Name styling */}
                      <span className={cn(
                        "font-extrabold transition-colors group-hover:text-blue-300",
                        isTop1 ? "text-base md:text-lg text-yellow-350 drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]" : 
                        isTop2 ? "text-sm md:text-base text-slate-200" : 
                        isTop3 ? "text-sm md:text-base text-orange-300" : "text-sm text-white/90"
                      )}>
                        {user.name}
                      </span>
                    </div>
                  </td>

                  {/* Location Column */}
                  <td className="py-4 px-6 hidden md:table-cell">
                    <span className="text-white/70 font-semibold text-sm">{user.location}</span>
                  </td>

                  {/* School Column */}
                  <td className="py-4 px-6 hidden lg:table-cell">
                    <span className="text-white/70 font-semibold text-sm">{user.school}</span>
                  </td>

                  {/* Score Column */}
                  <td className="py-4 px-6 text-right">
                    <span className={cn(
                      "font-black tracking-widest font-heading",
                      isTop1 ? "text-2xl md:text-3xl text-yellow-350 drop-shadow-[0_2px_4px_rgba(234,179,8,0.4)]" : 
                      isTop2 ? "text-xl md:text-2xl text-slate-200 drop-shadow-[0_2px_4px_rgba(156,163,175,0.3)]" : 
                      isTop3 ? "text-lg md:text-xl text-orange-300 drop-shadow-[0_2px_4px_rgba(154,52,18,0.3)]" : "text-base md:text-lg text-white"
                    )}>
                      {user.score.toLocaleString()}
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
          <span>Bảng Xếp Hạng “nhà Du Hành” Xuất Sắc Của Cuộc Thi Phá Đảo Cùng Flyer</span>
          <span>✨</span>
        </p>
      </div>
    </div>
  );
}
