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

export function ModeSelectModal({ data }: { data: CheckpointData }) {
  const router = useRouter();
  const [mode, setMode] = useState<"exam" | "practice">("exam");
  const totalParts = data.parts.length;

  return (
    <div
      className="relative p-[30px] md:p-[70px] w-[520px] md:w-[721px] h-auto md:h-[688px] rounded-[40px]"
      style={{ // clone-gate-ignore
        background:
          "radial-gradient(50% 50%, var(--color-cp-modal-bg-top) 0%, var(--color-cp-modal-bg-bottom) 100%)",
      }}
    >
      {/* Border frame */}
      <Image
        src="/clone-assets/exam/border.c71a6ea1.png"
        alt=""
        fill
        className="object-fill pointer-events-none"
        style={{ borderRadius: "40px" }} // clone-gate-ignore
      />

      {/* Close button */}
      <button
        onClick={() => router.push("/testlevels/movers")}
        className="absolute -top-3 -right-3 md:top-2 md:right-2 w-10 h-10 md:w-12 md:h-12 cursor-pointer hover:scale-110 active:scale-95 transition-transform z-20"
        aria-label="Đóng"
      >
        <Image
          src="/clone-assets/exam/close.6f7d2509.png"
          alt=""
          fill
          className="object-contain"
        />
      </button>

      {/* Bottom decorations */}
      <Image
        src="/clone-assets/exam/icon-bottom-left.86e6ba91.png"
        alt=""
        width={210}
        height={100}
        className="absolute -bottom-4 -left-6 w-[160px] md:w-[210px] z-[3] pointer-events-none"
      />
      <Image
        src="/clone-assets/exam/icon-bottom-right.4c460589.png"
        alt=""
        width={320}
        height={280}
        className="absolute -bottom-5 -right-10 w-[220px] md:w-[320px] z-[3] pointer-events-none"
      />

      {/* Title */}
      <div className="relative z-10 mb-[30px]">
        <h3
          className="m-0 mb-3 text-[16px] md:text-[20px] text-white text-center"
          style={{ textShadow: "rgba(0,0,0,0.45) 1.5px 2.5px 0px" }} // clone-gate-ignore
        >
          Thử thách {data.challengeNumber}
        </h3>
        <h2
          className="m-0 text-white text-center text-[32px] md:text-[46px] leading-[1.1] font-heading"
          style={{ textShadow: "rgba(0,0,0,0.45) 1.5px 4px 0px" }} // clone-gate-ignore
        >
          Chọn chế độ
        </h2>
      </div>

      {/* Mode Tabs */}
      <div className="relative z-10 flex justify-center">
        <div className="w-[320px] md:w-[439px] h-[50px] md:h-[60px] p-1 rounded-[10px] flex relative mb-[30px] bg-cp-tab-track">
          <div
            role="tab"
            aria-selected={mode === "exam"}
            onClick={() => setMode("exam")}
            className={cn(
              "h-full flex justify-center items-center flex-1 cursor-pointer rounded-[7px] transition-colors",
              mode === "exam" && "bg-cp-tab-active"
            )}
          >
            <p
              className={cn(
                "text-[16px] md:text-[20px] text-center leading-5",
                mode === "exam" ? "text-white" : "text-cp-tab-muted"
              )}
            >
              Thi thử
            </p>
          </div>
          <div
            role="tab"
            aria-selected={mode === "practice"}
            onClick={() => setMode("practice")}
            className={cn(
              "h-full flex justify-center items-center flex-1 cursor-pointer rounded-[7px] transition-colors",
              mode === "practice" && "bg-cp-tab-active"
            )}
          >
            <p
              className={cn(
                "text-[16px] md:text-[20px] text-center leading-5",
                mode === "practice" ? "text-white" : "text-cp-tab-muted"
              )}
            >
              Luyện tập
            </p>
          </div>
        </div>
      </div>

      {/* Detail Card */}
      <div className="relative z-10 border-[1px] w-full md:w-[578px] h-auto md:h-[430px] border-solid rounded-[40px] p-5 md:p-8 flex flex-col bg-cp-card-bg border-cp-card-border">
        <p className="mb-[12px] text-base md:text-lg px-[6px] text-cp-accent-yellow">
          Chi tiết
        </p>
        <div className="h-full rounded-[12px] p-[16px] md:p-[30px] text-base md:text-lg bg-cp-tab-track">
          <p className="mb-[18px] text-base md:text-lg text-cp-accent-yellow">
            Bài kiểm tra có: {totalParts} Phần - Tổng thời gian: {data.totalMinutes} Phút
          </p>
          {data.parts.map((part) => (
            <div key={part.name} className="px-0 mb-2">
              <p className="mb-0 text-cp-accent-yellow">{part.name}</p>
              <p className="flex items-center text-white text-base md:text-lg">
                <span className="w-auto text-base md:text-lg">
                  <span className="mx-3 font-black">·</span>Điểm tối đa
                </span>
                <span className="ml-[20px] md:ml-[30px]">
                  <span className="text-lg md:text-xl text-cp-accent-yellow">
                    {part.maxScore}
                  </span>{" "}
                  Điểm /{" "}
                  <span className="text-lg md:text-xl text-cp-accent-yellow">
                    {part.minutes}
                  </span>{" "}
                  Phút
                </span>
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Start Button */}
      <div className="relative z-10 flex justify-center mt-[24px]">
        <button
          onClick={() => alert("Bắt đầu làm bài — phase tiếp theo (exam player)")}
          className="relative cursor-pointer hover:scale-105 active:scale-95 transition-transform"
        >
          <div className="relative px-6 md:px-8 py-3 rounded-[12px] bg-gradient-to-b from-cp-start-from to-cp-start-to border-b-4 border-cp-start-border shadow-[0_6px_12px_rgba(0,0,0,0.4)]">
            <div className="flex items-center gap-2">
              <Image
                src="/clone-assets/exam/rocket.67fd0fe5.png"
                alt=""
                width={40}
                height={40}
                className="w-9 h-9 md:w-11 md:h-11 -ml-2 object-contain"
              />
              <span
                className="text-white text-base md:text-lg font-semibold pr-2"
                style={{ textShadow: "rgba(0,0,0,0.45) 0.5px 2.5px 0px" }} // clone-gate-ignore
              >
                Bắt đầu
              </span>
            </div>
          </div>
        </button>
      </div>
    </div>
  );
}
