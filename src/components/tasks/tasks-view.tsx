"use client";

import {
  ChevronLeft,
  CircleDollarSign,
  FileQuestion,
  Trophy,
  PenLine,
  Mic,
  BookOpen,
  Languages,
  Swords,
  LogIn,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { useClaimTask, useMyTasks } from "@/hooks/use-tasks";
import { claimErrorMessage } from "@/lib/api/tasks";
import { GENERIC_ERROR_MESSAGE } from "@/lib/api-client";
import { cn } from "@/lib/utils";
import { TASK_GROUP_LABELS } from "@/schemas/task";
import type { Task, TaskGroup } from "@/types/task";

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

const GROUP_ORDER: TaskGroup[] = ["daily", "weekly", "achievement", "other"];

export function TasksView(): React.ReactElement {
  const router = useRouter();
  const { data, isPending, error, refetch } = useMyTasks();
  const claim = useClaimTask();
  const [claimError, setClaimError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const tasks = data ?? [];
  const groups = GROUP_ORDER.map((group) => ({
    group,
    items: tasks.filter((t) => t.group === group),
  })).filter((g) => g.items.length > 0);

  const dailyTasks = tasks.filter((t) => t.group === "daily");
  const doneCount = dailyTasks.filter((t) => t.done).length;
  const progressPercent = dailyTasks.length > 0 ? Math.round((doneCount / dailyTasks.length) * 100) : 0;

  const handleClaim = (task: Task) => {
    if (claim.isPending) return;
    setClaimError(null);
    setNotice(null);
    claim.mutate(task.id, {
      onError: (e) => setClaimError(claimErrorMessage(e)),
      onSuccess: (points) => setNotice(`+${points} điểm`),
    });
  };

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
      </div>

      {/* Main Title */}
      <h1 className="text-4xl md:text-5xl font-black text-white uppercase tracking-wider mb-3 drop-shadow-lg text-center font-heading text-shadow-game-title">
        NHIỆM VỤ
      </h1>

      {/* Daily Progress Summary Card */}
      {dailyTasks.length > 0 && (
        <div className="w-full bg-ranking-table-bg backdrop-blur-sm rounded-[2rem] border-3 border-ranking-table-border shadow-[0_15px_30px_rgba(0,0,0,0.4)] p-5 mb-6 flex flex-col gap-3">
          <div className="flex items-center justify-between w-full">
            <span className="text-white/90 font-black text-sm md:text-base uppercase tracking-wider flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-350" />
              Tiến độ hôm nay
            </span>
            <span className="text-yellow-350 font-black text-sm md:text-base">
              {doneCount} / {dailyTasks.length} nhiệm vụ
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
            Hoàn thành nhiệm vụ để nhận điểm thưởng.
          </p>
        </div>
      )}

      {/* Claim feedback */}
      {claimError && (
        <p role="alert" className="w-full mb-4 text-center text-red-300 font-black text-sm tracking-wider">
          {claimError}
        </p>
      )}
      {notice && (
        <p role="status" className="w-full mb-4 text-center text-green-300 font-black text-sm tracking-wider">
          {notice}
        </p>
      )}

      {isPending ? (
        <p className="w-full text-center text-blue-300 font-extrabold text-sm uppercase tracking-wider">
          Đang tải nhiệm vụ…
        </p>
      ) : error ? (
        <div className="w-full text-center">
          <p className="text-white font-black text-sm tracking-wider mb-4">{error instanceof Error ? error.message : GENERIC_ERROR_MESSAGE}</p>
          <button
            onClick={() => refetch()}
            className="px-4 py-2 rounded-2xl bg-topbar-blue-bg/80 border-2 border-blue-500/30 hover:bg-topbar-blue-hover active:translate-y-[2px] transition-all text-white font-black text-xs uppercase tracking-wider cursor-pointer"
          >
            Thử lại
          </button>
        </div>
      ) : groups.length === 0 ? (
        <p className="w-full text-center text-blue-300 font-extrabold text-sm uppercase tracking-wider">
          Chưa có nhiệm vụ nào.
        </p>
      ) : (
        groups.map(({ group, items }) => (
          <section key={group} className="w-full mb-8">
            <h2 className="text-white font-black text-xl uppercase tracking-wider mb-4 font-heading text-shadow-game-title">
              {TASK_GROUP_LABELS[group]}
            </h2>
            {/* Task Grid */}
            <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {items.map((task) => {
              const meta = taskIcons[task.icon as keyof typeof taskIcons] ?? taskIcons.exam;
              const Icon = meta.icon;
              const pct = task.target > 0 ? Math.min(100, Math.round((task.progress / task.target) * 100)) : 100;
              const isClaimable = task.done && !task.claimed;

              return (
                <div
                  key={task.id}
                  className={cn(
                    "relative flex flex-col bg-ranking-table-bg/90 backdrop-blur-sm rounded-3xl border-3 p-5 shadow-[0_10px_20px_rgba(0,0,0,0.4)] transition-all duration-300",
                    isClaimable 
                      ? "border-green-500/50 group hover:-translate-y-1 hover:shadow-[0_16px_30px_rgba(0,0,0,0.5)]" 
                      : "border-ranking-table-border opacity-80"
                  )}
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
                      <CircleDollarSign className="w-4 h-4 text-yellow-400" />
                      <span className="font-black text-sm text-yellow-400">
                        {`${task.points} điểm`}
                      </span>
                    </div>
                    <button
                      onClick={() => { if (isClaimable) handleClaim(task); }}
                      className={cn(
                        "px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed",
                        isClaimable 
                          ? "bg-gradient-to-b from-green-450 to-green-600 border-b-3 border-green-800 text-white hover:from-green-400 hover:to-green-500 shadow-md"
                          : "bg-game-input-focus-shadow border border-white/10 text-white/40 cursor-not-allowed"
                      )}
                      disabled={!isClaimable || claim.isPending}
                    >
                      {task.claimed ? "Đã nhận" : isClaimable ? "Nhận thưởng" : "Chưa hoàn thành"}
                    </button>
                  </div>
                </div>
              );

              })}
            </div>
          </section>
        ))
      )}

    </div>
  );
}