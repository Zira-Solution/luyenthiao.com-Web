"use client";

import { Trophy, Shield, Home, FileText } from "lucide-react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";

import { GameButton } from "@/components/ui/game-button";

export function ExamResultView(): React.ReactElement {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Extract scores
  const score = parseInt(searchParams.get("score") || "0", 10);
  const listening = parseInt(searchParams.get("listening") || "0", 10);
  const rw = parseInt(searchParams.get("rw") || "0", 10);
  const total = parseInt(searchParams.get("total") || "60", 10);
  const examId = searchParams.get("examId") || "7778495e-531b-4039-a3ea-321874ba1a7a";

  // Calculate shields (out of 5)
  // Listening: max 25 -> 5 points per shield
  const listeningShields = Math.max(1, Math.min(5, Math.ceil(listening / 5)));
  // Reading & Writing: max 35 -> 7 points per shield
  const rwShields = Math.max(1, Math.min(5, Math.ceil(rw / 7)));

  // Calculate comparative percentage
  let percentage = 20;
  if (score > 40) percentage = 85;
  else if (score > 20) percentage = 55;
  if (score === 60) percentage = 99;

  return (
    <main className="relative w-full min-h-[100dvh] overflow-y-auto bg-dashboard-bg flex flex-col items-center py-10 px-4">
      {/* Background Image */}
      <Image
        src="/clone-assets/exam/bg-checkpoint-page.d7e3979b.jpg"
        alt=""
        fill
        className="object-cover pointer-events-none -z-10 opacity-40"
      />

      <div className="w-full max-w-[650px] relative z-10">
        
        {/* Achievement Modal Frame */}
        <div className="relative p-6 sm:p-10 rounded-[40px] shadow-2xl border-4 border-cp-card-border overflow-hidden"
             style={{ background: "radial-gradient(50% 50%, var(--color-cp-modal-bg-top) 0%, var(--color-cp-modal-bg-bottom) 100%)" }}>
          
          {/* Border Frame Decoration */}
          <Image
            src="/clone-assets/exam/border.c71a6ea1.webp"
            alt=""
            fill
            className="object-fill pointer-events-none rounded-[40px]"
          />

          {/* Close button redirection */}
          <button
            onClick={() => router.push("/testlevels/movers")}
            className="absolute top-4 right-4 w-10 h-10 cursor-pointer hover:scale-105 active:scale-95 transition-transform z-20"
          >
            <Image
              src="/clone-assets/exam/close.6f7d2509.webp"
              alt="Close"
              fill
              className="object-contain"
            />
          </button>

          <div className="relative z-10 flex flex-col items-center text-center">
            
            {/* User Name */}
            <h1 className="text-white text-3xl font-heading tracking-wide uppercase m-0 drop-shadow-md">
              phúc
            </h1>

            {/* Achievement Badge */}
            <div className="flex items-center gap-2 mt-2 px-4 py-1.5 rounded-full bg-cp-accent-yellow/20 border border-cp-accent-yellow/40">
              <Trophy className="w-5 h-5 text-cp-accent-yellow animate-bounce" />
              <span className="text-cp-accent-yellow font-black text-sm uppercase tracking-wider">
                Vừa đạt mốc điểm mới
              </span>
            </div>

            {/* Huge Score Circle */}
            <div className="w-36 h-36 rounded-full bg-white/10 border-4 border-white/20 flex flex-col items-center justify-center mt-6 shadow-inner">
              <span className="text-cp-accent-yellow font-heading text-5xl leading-none font-black drop-shadow">
                {score}
              </span>
              <span className="text-white/60 text-sm font-bold border-t border-white/25 mt-1 pt-1 px-4">
                /{total} Điểm
              </span>
            </div>

            {/* Stat Message */}
            <p className="text-white text-sm font-semibold mt-4 leading-relaxed max-w-[320px]">
              Điểm của bạn cao hơn <strong className="text-cp-accent-yellow text-base font-black">{percentage}%</strong> số thí sinh từng làm.
            </p>

            {/* Test Level Info */}
            <div className="mt-2 text-white/80 text-xs font-heading tracking-wide">
              Movers - [MOVERS] Bài thi thử 1 - Nghe, Đọc, Viết
            </div>

            {/* Skills Breakdown Grid */}
            <div className="w-full bg-cp-tab-track/70 border border-cp-tab-track rounded-3xl p-6 flex flex-col gap-4 mt-6 text-left">
              
              {/* Reading & Writing */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-3">
                <span className="text-white font-heading text-sm uppercase tracking-wider">
                  Đọc & Viết
                </span>
                
                {/* Shield Icons representation */}
                <div className="flex gap-1.5">
                  {Array.from({ length: 5 }).map((_, idx) => (
                    <Shield
                      key={idx}
                      className={`w-6 h-6 transition-all ${
                        idx < rwShields
                          ? "text-cp-accent-yellow fill-cp-accent-yellow scale-110 drop-shadow"
                          : "text-white/20 fill-white/10"
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Listening */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <span className="text-white font-heading text-sm uppercase tracking-wider">
                  Nghe
                </span>
                
                {/* Shield Icons representation */}
                <div className="flex gap-1.5">
                  {Array.from({ length: 5 }).map((_, idx) => (
                    <Shield
                      key={idx}
                      className={`w-6 h-6 transition-all ${
                        idx < listeningShields
                          ? "text-cp-accent-yellow fill-cp-accent-yellow scale-110 drop-shadow"
                          : "text-white/20 fill-white/10"
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Details & Comments Card */}
            <div className="w-full bg-cp-card-bg/50 border border-cp-card-border rounded-3xl p-5 mt-4 text-left">
              <span className="text-cp-accent-yellow font-heading text-xs uppercase block mb-1">
                Chi tiết & nhận xét
              </span>
              <p className="text-white/90 text-sm leading-relaxed m-0 font-medium">
                {score >= 50
                  ? "Tuyệt vời! Bạn hoàn thành xuất sắc bài thi thử. Hãy tiếp tục duy trì phong độ này để đạt điểm tối đa nhé!"
                  : score >= 30
                  ? "Khá tốt! Bạn đã nắm chắc các kiến thức cơ bản. Rèn luyện thêm một chút ở phần từ vựng và ngữ pháp để cải thiện điểm số nhé."
                  : "Cố lên! Hãy thử làm lại bài thi và chú ý kỹ phần nghe kéo thả để đạt kết quả tốt hơn nhé."}
              </p>
            </div>

            {/* Actions Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full mt-8">
              <GameButton
                variant="secondary"
                onClick={() => router.push("/testlevels/movers")}
              >
                <div className="flex items-center gap-2">
                  <Home className="w-5 h-5 text-white" />
                  <span>Trang chủ</span>
                </div>
              </GameButton>

              <GameButton
                variant="cta"
                onClick={() => router.push(`/check-point/${examId}?review=true`)}
              >
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-white" />
                  <span>Xem đáp án</span>
                </div>
              </GameButton>
            </div>

          </div>
        </div>

        {/* Bottom Logo Decoration */}
        <div className="flex justify-center mt-6">
          <Image
            src="/clone-assets/exam/MOVERS.824079bd.webp"
            alt="Movers"
            width={120}
            height={60}
            className="object-contain"
          />
        </div>
      </div>
    </main>
  );
}
