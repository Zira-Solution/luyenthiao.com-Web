"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { cn } from "@/lib/utils";

interface CheckpointData {
  level: string;
  levelName: string;
  challengeNumber: number;
  totalMinutes: number;
  parts: { name: string; maxScore: number; minutes: number }[];
}

export function ExamModeSelectModal({ data, onStart }: { data: CheckpointData; onStart: () => void }) {
  const router = useRouter();
  const [mode, setMode] = useState<"exam" | "practice">("exam");
  const totalParts = data.parts.length;

  const testTitle = `[${data.levelName}] Bài thi thử ${data.challengeNumber} - Nghe, Đọc, Viết`;

  return (
    <div
      className="relative p-6 md:p-12 w-[520px] md:w-[720px] h-auto rounded-[40px] shadow-2xl flex flex-col items-center"
      style={{
        background:
          "radial-gradient(50% 50%, var(--color-cp-modal-bg-top) 0%, var(--color-cp-modal-bg-bottom) 100%)",
      }}
    >
      {/* Border frame */}
      <Image
        src="/clone-assets/exam/border.c71a6ea1.webp"
        alt=""
        fill
        className="object-fill pointer-events-none"
        style={{ borderRadius: "40px" }}
      />

      {/* Close button */}
      <button
        onClick={() => router.push("/testlevels/movers")}
        className="absolute top-4 right-4 w-10 h-10 cursor-pointer hover:scale-105 active:scale-95 transition-transform z-20"
        aria-label="Đóng"
      >
        <Image
          src="/clone-assets/exam/close.6f7d2509.webp"
          alt="Close"
          fill
          className="object-contain"
        />
      </button>

      {/* Bottom decorations */}
      <Image
        src="/clone-assets/exam/icon-bottom-left.86e6ba91.webp"
        alt=""
        width={180}
        height={90}
        className="absolute -bottom-4 -left-4 z-[3] pointer-events-none max-md:hidden"
      />
      <Image
        src="/clone-assets/exam/icon-bottom-right.4c460589.webp"
        alt=""
        width={240}
        height={210}
        className="absolute -bottom-4 -right-6 z-[3] pointer-events-none max-md:hidden"
      />

      {/* Title */}
      <div className="relative z-10 w-full mb-6 text-center">
        <h2
          className="m-0 mb-2 text-white font-heading text-xl md:text-2xl leading-snug drop-shadow"
          style={{ textShadow: "rgba(0,0,0,0.45) 1.5px 2.5px 0px" }}
        >
          {testTitle}
        </h2>
        <h3
          className="m-0 text-[#FFE03B] font-black text-sm uppercase tracking-wider"
          style={{ textShadow: "rgba(0,0,0,0.3) 1px 1.5px 0px" }}
        >
          Chọn chế độ
        </h3>
      </div>

      {/* Mode Tabs */}
      <div className="relative z-10 flex justify-center w-full mb-6">
        <div className="w-[300px] md:w-[380px] h-[50px] p-1 rounded-xl flex relative bg-cp-tab-track border border-white/5">
          <div
            role="tab"
            aria-selected={mode === "exam"}
            onClick={() => setMode("exam")}
            className={cn(
              "h-full flex justify-center items-center flex-1 cursor-pointer rounded-lg transition-all",
              mode === "exam" ? "bg-cp-tab-active shadow-md" : "hover:bg-white/5"
            )}
          >
            <span
              className={cn(
                "text-sm font-black uppercase tracking-wide",
                mode === "exam" ? "text-white" : "text-cp-tab-muted"
              )}
            >
              Thi thử
            </span>
          </div>
          <div
            role="tab"
            aria-selected={mode === "practice"}
            onClick={() => setMode("practice")}
            className={cn(
              "h-full flex justify-center items-center flex-1 cursor-pointer rounded-lg transition-all",
              mode === "practice" ? "bg-cp-tab-active shadow-md" : "hover:bg-white/5"
            )}
          >
            <span
              className={cn(
                "text-sm font-black uppercase tracking-wide",
                mode === "practice" ? "text-white" : "text-cp-tab-muted"
              )}
            >
              Luyện tập
            </span>
          </div>
        </div>
      </div>

      {/* Detail Card */}
      <div className="relative z-10 border border-cp-card-border w-full max-w-[580px] rounded-3xl p-5 md:p-6 flex flex-col bg-cp-card-bg/60 backdrop-blur-sm shadow-inner mb-6">
        <p className="mb-2 text-xs font-black text-[#FFE03B] uppercase tracking-wider border-b border-white/10 pb-2">
          Chi tiết
        </p>
        <div className="rounded-2xl p-4 bg-cp-tab-track/70 border border-white/5 flex flex-col gap-4">
          <p className="text-white text-xs font-bold leading-normal m-0">
            Bài kiểm tra có: <span className="text-[#FFE03B] font-black">{totalParts} Phần</span> - Tổng thời gian: <span className="text-[#FFE03B] font-black">{data.totalMinutes} Phút</span>
          </p>

          <div className="flex flex-col gap-3">
            {data.parts.map((part) => (
              <div key={part.name} className="flex flex-col gap-1 border-t border-white/5 pt-2.5 first:border-0 first:pt-0">
                <span className="text-white font-black text-xs uppercase tracking-wide">{part.name}</span>
                <div className="flex items-center gap-1.5 text-white/80 text-xs font-semibold">
                  <span className="text-[#FFE03B] text-base leading-none">·</span>
                  <span>Điểm tối đa:</span>
                  <span className="text-[#FFE03B] font-black">{part.maxScore} Điểm</span>
                  <span className="text-white/40">/</span>
                  <span className="text-[#FFE03B] font-black">{part.minutes} Phút</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Start Button */}
      <div className="relative z-10 flex justify-center w-full">
        <button
          onClick={onStart}
          className="relative cursor-pointer hover:scale-105 active:scale-95 transition-transform"
        >
          <div className="relative px-8 py-3 rounded-2xl bg-gradient-to-b from-cp-start-from to-cp-start-to border-b-4 border-cp-start-border shadow-lg flex items-center gap-2">
            <Image
              src="/clone-assets/exam/rocket.67fd0fe5.webp"
              alt=""
              width={36}
              height={36}
              className="w-8 h-8 -ml-1 object-contain"
            />
            <span
              className="text-white text-sm font-black uppercase tracking-wider"
              style={{ textShadow: "rgba(0,0,0,0.45) 0.5px 2.5px 0px" }}
            >
              Bắt đầu
            </span>
          </div>
        </button>
      </div>
    </div>
  );
}
