"use client";

import {
  ChevronLeft,
  FileText,
  Swords,
  Gift,
  Calendar,
  Settings,
  Bell,
  CheckCheck,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { cn } from "@/lib/utils";
import notificationsMocks from "@/mocks/notifications.json";

const typeMeta = {
  result: { icon: FileText, color: "text-blue-400 bg-blue-500/15 border-blue-500/30" },
  challenge: { icon: Swords, color: "text-red-400 bg-red-500/15 border-red-500/30" },
  reward: { icon: Gift, color: "text-yellow-350 bg-yellow-500/15 border-yellow-500/30" },
  event: { icon: Calendar, color: "text-purple-400 bg-purple-500/15 border-purple-500/30" },
  system: { icon: Settings, color: "text-slate-400 bg-slate-500/15 border-slate-500/30" },
} as const;

export default function NotificationsPage() {
  const router = useRouter();
  const [readIds, setReadIds] = useState<Set<number>>(new Set());
  const [filter, setFilter] = useState<"all" | "unread">("all");

  const unreadCount = notificationsMocks.filter((n) => n.read === false && !readIds.has(n.id)).length;

  const markAllRead = () => {
    setReadIds(new Set(notificationsMocks.map((n) => n.id)));
  };

  const markRead = (id: number) => {
    setReadIds((prev) => new Set(prev).add(id));
  };

  const visible = notificationsMocks.filter(
    (n) => filter === "all" || (n.read === false && !readIds.has(n.id))
  );

  return (
    <div className="w-full max-w-4xl mx-auto px-4 md:px-8 py-4 md:py-6 pb-[120px] flex flex-col items-center z-10 animate-in fade-in duration-500 text-shadow-game-title">
      
      {/* Top Action Header */}
      <div className="w-full flex items-center justify-between mb-5 gap-4 text-shadow-game-title">
        <button 
          onClick={() => router.push("/")}
          className="flex items-center gap-1.5 md:gap-2 px-4 py-2 rounded-2xl bg-topbar-blue-bg/80 border-2 border-blue-500/30 hover:bg-topbar-blue-hover active:translate-y-[2px] transition-all text-white font-black text-xs md:text-sm tracking-wider uppercase cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4 md:w-5 md:h-5 text-yellow-450" />
          <span>Quay lại</span>
        </button>

        {/* Mark all read */}
        <button
          onClick={markAllRead}
          className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-topbar-blue-bg/80 border-2 border-blue-500/30 hover:bg-topbar-blue-hover active:translate-y-[2px] transition-all text-white font-black text-[10px] md:text-xs uppercase tracking-wider cursor-pointer"
        >
          <CheckCheck className="w-4 h-4 text-green-400" />
          <span>Đánh dấu tất cả</span>
        </button>
      </div>

      {/* Main Title */}
      <h1 className="text-4xl md:text-5xl font-black text-white uppercase tracking-wider mb-4 drop-shadow-lg text-center font-heading text-shadow-game-title">
        THÔNG BÁO
      </h1>

      {/* Filters / summary */}
      <div className="w-full flex items-center justify-between mb-6 text-shadow-game-title">
        <div className="flex gap-1 p-1.5 bg-game-input-focus-shadow/80 backdrop-blur-sm rounded-full border-2 border-ranking-table-border shadow-lg">
          <button
            onClick={() => setFilter("all")}
            className={cn(
              "px-5 py-1.5 rounded-full text-xs font-black tracking-wider uppercase transition-all cursor-pointer",
              filter === "all" ? "bg-orange-500 text-white border-b-3 border-orange-700 shadow" : "text-blue-200/70 hover:text-white"
            )}
          >
            Tất cả
          </button>
          <button
            onClick={() => setFilter("unread")}
            className={cn(
              "px-5 py-1.5 rounded-full text-xs font-black tracking-wider uppercase transition-all cursor-pointer",
              filter === "unread" ? "bg-orange-500 text-white border-b-3 border-orange-700 shadow" : "text-blue-200/70 hover:text-white"
            )}
          >
            Chưa đọc{unreadCount > 0 ? ` (${unreadCount})` : ""}
          </button>
        </div>
        <span className="hidden sm:flex items-center gap-2 text-blue-300 font-extrabold text-xs uppercase tracking-wider">
          <Bell className="w-4 h-4" />
          {unreadCount > 0 ? `${unreadCount} thông báo chưa đọc` : "Bạn đã đọc hết thông báo"}
        </span>
      </div>

      {/* Notifications List */}
      <div className="w-full flex flex-col gap-4">
        {visible.length === 0 ? (
          <div className="w-full bg-ranking-table-bg backdrop-blur-sm rounded-3xl border-3 border-ranking-table-border p-10 text-center">
            <div className="mx-auto w-16 h-16 bg-game-input-focus-shadow rounded-full flex items-center justify-center mb-4">
              <Bell className="w-8 h-8 text-blue-300" />
            </div>
            <p className="text-white font-black text-lg tracking-wider mb-1 font-heading">
              KHÔNG CÒN THÔNG BÁO
            </p>
            <p className="text-blue-300 font-extrabold text-xs uppercase tracking-widest">
              Bạn đã xem hết các thông báo. 
            </p>
          </div>
        ) : (
          visible.map((n) => {
            const isRead = n.read === true || readIds.has(n.id);
            const meta = typeMeta[n.type as keyof typeof typeMeta] ?? typeMeta.system;
            const Icon = meta.icon;

            return (
              <button
                key={n.id}
                onClick={() => markRead(n.id)}
                className={cn(
                  "w-full text-left flex items-start gap-4 rounded-3xl border-2 p-4 backdrop-blur-sm transition-all duration-300 cursor-pointer hover:-translate-y-0.5 hover:shadow-lg text-shadow-game-title",
                  isRead
                    ? "bg-ranking-table-bg/60 border-ranking-table-border/60 opacity-70"
                    : "bg-ranking-table-bg border-blue-400/40 shadow-[0_8px_16px_rgba(0,0,0,0.35)]"
                )}
              >
                {/* Icon */}
                <div className={cn(
                  "w-12 h-12 rounded-2xl border-2 flex items-center justify-center shrink-0",
                  meta.color
                )}>
                  <Icon className="w-6 h-6" />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-white font-black text-sm md:text-base font-heading truncate">
                      {n.title}
                    </span>
                    {!isRead && (
                      <span className="w-2.5 h-2.5 rounded-full bg-red-500 shrink-0 animate-pulse" />
                    )}
                  </div>
                  <p className="text-blue-200 font-medium text-xs md:text-sm leading-relaxed">
                    {n.message}
                  </p>
                </div>

                {/* Time */}
                <span className="text-white/40 text-[10px] font-bold uppercase tracking-wider whitespace-nowrap shrink-0 mt-1">
                  {n.time}
                </span>
              </button>
            );
          })
        )}
      </div>

    </div>
  );
}