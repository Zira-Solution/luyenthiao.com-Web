"use client";

import {
  ChevronLeft,
  Gem,
  CircleDollarSign,
  FileQuestion,
  Trophy,
  PenLine,
  Mic,
  BookOpen,
  Languages,
  Swords,
  LogIn,
  CheckCircle2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { cn } from "@/lib/utils";
import tasksMocks from "@/mocks/tasks.json";


const taskIcons = {
  exam: { icon: FileQuestion, color: "text-blue-400 bg-blue-500/10 border-blue-500/30" },
  trophy: { icon: Trophy, color: "text-yellow-350 bg-yellow-500/10 border-yellow-500/30" },
  writing: { icon: PenLine, color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30" },
  speaking: { icon: Mic, color: "text-purple-400 bg-purple-500/10 border-purple-500/30" },
  vocab: { icon: BookOpen, color: "text-cyan-400 bg-cyan-500/10 border-cyan-500/30" },
  grammar: { icon: Languages, color: "text-orange-400 bg-orange-500/10 border-orange-500/30" },
  challenge: { icon: Swords, color: "text-red-400 bg-red-500/10 border-red-500/30" },
  login: { icon: LogIn, color: "text-green-400 bg-green-500/10 border-green-500/30" },
} as const;

export default function TasksPage() {
  const router = useRouter();
  const [claimTimers, setClaimTimers] = useState<Record<number, boolean>>({});

  const handleClaim = (id: number) => {
    setClaimTimers((prev) => ({ ...prev, [id]: true }));
    setTimeout(() => {
      setClaimTimers((prev) => ({ ...prev, [id]: false }));
      alert("Nhận thưởng thành công! 🎉");
    }, 800);
  };

  const doneCount = tasksMocks.filter((t) => t.done).length;
  const progressPercent = Math.round((doneCount / tasksMocks.length) * 100);

  return (
    <div className="w-full max-w-7xl mx-auto px-4 md:px-8 py-4 md:py-6 pb-[120px] flex flex-col items-center z-10 animate-in fade-in duration-500 text-shadow-game-title">
      
      {/* Top Action Header */}
      <div className="w-full flex items-center justify-between mb-5 gap-4 text-shadow-game-title">
        <button 
          onClick={() => router.push("/")}
          className="flex items-center gap-1.5 md:gap-2 px-4 py-2 rounded-2xl bg-topbar-blue-bg/80 border-2 border-blue-500/30 hover:bg-topbar-blue-hover active:translate-y-[2px] transition-all text-white font-black text-xs md:text-sm tracking-wider uppercase cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4 md:w-5 md:h-5 text-yellow-450" />
          <span>Quay lại</span>
        </button>

        {/* Rewards Balance Summary */}
        <div className="flex items-center gap-2 text-shadow-game-title">
          <div className="flex items-center gap-2 bg-topbar-blue-bg/80 border-2 border-blue-500/30 rounded-2xl px-3.5 py-2 h-[50px] shadow-inner">
            <CircleDollarSign className="w-5 h-5 text-yellow-400" />
            <span className="text-white font-black text-sm md:text-base">120</span>
          </div>
          <div className="flex items-center gap-2 bg-topbar-blue-bg/80 border-2 border-blue-500/30 rounded-2xl px-3.5 py-2 h-[50px] shadow-inner">
            <Gem className="w-5 h-5 text-cyan-300" />
            <span className="text-white font-black text-sm md:text-base">14</span>
          </div>
        </div>
      </div>

      {/* Main Title */}
      <h1 className="text-4xl md:text-5xl font-black text-white uppercase tracking-wider mb-3 drop-shadow-lg text-center font-heading text-shadow-game-title">
        NHIỆM VỤ HẰNG NGÀY
      </h1>

      {/* Daily Progress Summary Card */}
      <div className="w-full bg-ranking-table-bg backdrop-blur-sm rounded-[2rem] border-3 border-ranking-table-border shadow-[0_15px_30px_rgba(0,0,0,0.4)] p-5 mb-6 flex flex-col gap-3">
        <div className="flex items-center justify-between w-full">
          <span className="text-white/90 font-black text-sm md:text-base uppercase tracking-wider flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-350" />
            Tiến độ hôm nay
          </span>
          <span className="text-yellow-350 font-black text-sm md:text-base">
            {doneCount} / {tasksMocks.length} nhiệm vụ
          </span>
        </div>
        {/* Progress bar */}
        <div className="w-full h-4 bg-game-input-focus-shadow rounded-full overflow-hidden border-2 border-ranking-table-border shadow-inner">
          <div 
            className="h-full bg-gradient-to-r from-green-450 to-green-600 rounded-full transition-all duration-700"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <p className="text-blue-300 font-extrabold text-[10px] md:text-xs uppercase tracking-wider">
          Hoàn thành tất cả để nhận thưởng lớn hằng ngày! ✨
        </p>
      </div>

      {/* Task Grid */}
      <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {tasksMocks.map((task) => {
          const meta = taskIcons[task.icon as keyof typeof taskIcons] ?? taskIcons.exam;
          const Icon = meta.icon;
          const pct = Math.min(100, Math.round((task.progress / task.target) * 100));
          const isClaimable = task.done;
          const claimed = claimTimers[task.id];

          return (
            <div
              key={task.id}
              className={cn(
                "relative flex flex-col bg-ranking-table-bg/90 backdrop-blur-sm rounded-3xl border-3 p-5 shadow-[0_10px_20px_rgba(0,0,0,0.4)] transition-all duration-300",
                isClaimable 
                  ? "border-green-500/50 group hover:-translate-y-1 hover:shadow-[0_16px_30px_rgba(0,0,0,0.5)] cursor-pointer" 
                  : "border-ranking-table-border opacity-80"
              )}
              onClick={() => isClaimable && handleClaim(task.id)}
            >
              {/* Done badge */}
              {isClaimable && (
                <span className="absolute -top-2 -right-2 bg-gradient-to-b from-green-400 to-green-600 text-white text-[8px] font-black uppercase tracking-wider px-2 py-1 rounded-lg border border-green-300 shadow-md">
                  Xong ✓
                </span>
              )}

              {/* Icon */}
              <div className={cn(
                "w-14 h-14 rounded-2xl border-2 flex items-center justify-center mb-4",
                meta.color
              )}>
                <Icon className="w-7 h-7" />
              </div>

              {/* Title & desc */}
              <h3 className="text-white font-black text-base md:text-lg mb-1 tracking-wide font-heading">
                {task.title}
              </h3>
              <p className="text-blue-300 font-semibold text-xs mb-4 leading-relaxed min-h-[32px]">
                {task.description}
              </p>

              {/* Progress bar */}
              <div className="w-full h-2.5 bg-game-input-focus-shadow rounded-full overflow-hidden border border-white/10 mb-1">
                <div 
                  className={cn(
                    "h-full rounded-full transition-all duration-700",
                    isClaimable ? "bg-gradient-to-r from-green-400 to-green-600" : "bg-gradient-to-r from-blue-400 to-blue-600"
                  )}
                  style={{ width: `${pct}%` }}
                />
              </div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-white/50 text-[10px] font-bold uppercase tracking-wider">
                  {task.progress}/{task.target}
                </span>
                <span className="text-white/50 text-[10px] font-bold uppercase tracking-wider">
                  {pct}%
                </span>
              </div>

              {/* Reward + claim button */}
              <div className="mt-auto flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  {task.rewardType === "diamond" ? (
                    <Gem className="w-4 h-4 text-cyan-300" />
                  ) : (
                    <CircleDollarSign className="w-4 h-4 text-yellow-400" />
                  )}
                  <span className={cn(
                    "font-black text-sm",
                    task.rewardType === "diamond" ? "text-cyan-300" : "text-yellow-400"
                  )}>
                    +{task.rewardValue}
                  </span>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); if (isClaimable) handleClaim(task.id); }}
                  className={cn(
                    "px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer",
                    isClaimable 
                      ? "bg-gradient-to-b from-green-450 to-green-600 border-b-3 border-green-800 text-white hover:from-green-400 hover:to-green-500 shadow-md"
                      : "bg-game-input-focus-shadow border border-white/10 text-white/40 cursor-not-allowed"
                  )}
                  disabled={!isClaimable}
                >
                  {claimed ? "Đang nhận..." : isClaimable ? "Nhận" : "Chưa hoàn thành"}
                </button>
              </div>

              {/* Claim success checkmark overlay */}
              {claimed && (
                <div className="absolute inset-0 bg-black/50 rounded-3xl flex items-center justify-center z-10">
                  <div className="flex flex-col items-center gap-2 animate-in zoom-in-95">
                    <CheckCircle2 className="w-10 h-10 text-green-400" />
                    <span className="text-white font-black text-sm uppercase tracking-wider">Nhận thưởng!</span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

    </div>
  );
}