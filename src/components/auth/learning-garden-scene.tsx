'use client'

import { Compass, Sparkles, Star, Trophy } from 'lucide-react'
import Image from 'next/image'

/**
 * LearningGardenScene
 * Premium 3D Miniature Floating Garden Diorama:
 * - Layer 1: Radiant ambient aura matching Flyer homepage's PlanetDiorama
 * - Layer 2: Detached 3D wing-flapping butterfly and golden fairy sparkles
 * - Layer 3: Handcrafted miniature floating island featuring the waving lion mascot seated firmly
 *            on the grass beside the lush magical tree and 3D books with authentic ground contact occlusion
 * - Layer 4: Welcoming speech bubble ("Xin chào bạn nhỏ!")
 * - Layer 5: Dimensional 3D "LUYỆN THI ẢO" typography and storybook adventure badges
 * All island elements share one coordinate system and float together in synchronized harmony.
 */
export function LearningGardenScene(): React.ReactElement {
  return (
    <div className="flex w-full flex-col items-center select-none">
      {/* 1. FLOATING MINIATURE ISLAND & SEATED MASCOT DIORAMA */}
      <div className="relative flex w-full justify-center">
        {/* Synchronized floating scene container */}
        <div className="xs:max-w-[260px] relative aspect-[875/734] w-full max-w-[220px] animate-[float-slow_6s_ease-in-out_infinite] motion-reduce:animate-none sm:max-w-[380px] md:max-w-[450px] lg:max-w-[530px]">
          {/* Layer B1: Detached Floating 3D Wing-Flapping Butterfly */}
          <div
            className="pointer-events-none absolute -top-4 left-6 z-20 transition-transform duration-700 sm:-top-7 sm:left-8"
            style={{
              animation: 'float-butterfly 6s ease-in-out infinite',
            }}
          >
            <div className="relative flex items-center justify-center">
              <div className="absolute -bottom-2 h-1 w-3.5 rounded-full bg-black/15 blur-[2px]" />
              <svg
                className="h-6 w-6 text-amber-300 drop-shadow-[0_2px_6px_rgba(245,158,11,0.5)] sm:h-7 sm:w-7"
                viewBox="0 0 32 32"
                fill="none"
                style={{
                  animation: 'wing-flap 0.4s ease-in-out infinite alternate',
                  transformOrigin: 'center center',
                }}
              >
                <path
                  d="M16 16 C12 10, 4 8, 4 14 C4 18, 10 20, 16 17 Z"
                  fill="url(#butterfly-wing-left-lg)"
                  stroke="#d97706"
                  strokeWidth="0.8"
                />
                <path
                  d="M16 16 C20 10, 28 8, 28 14 C28 18, 22 20, 16 17 Z"
                  fill="url(#butterfly-wing-right-lg)"
                  stroke="#d97706"
                  strokeWidth="0.8"
                />
                <ellipse cx="16" cy="16" rx="1.5" ry="5" fill="#78350f" />
                <defs>
                  <linearGradient id="butterfly-wing-left-lg" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#fef08a" />
                    <stop offset="60%" stopColor="#f59e0b" />
                    <stop offset="100%" stopColor="#ea580c" />
                  </linearGradient>
                  <linearGradient id="butterfly-wing-right-lg" x1="1" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#fef08a" />
                    <stop offset="60%" stopColor="#f59e0b" />
                    <stop offset="100%" stopColor="#ea580c" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
          </div>

          {/* Layer B2: Detached Magic Sparkles / Fairy Dust near top-right of tree */}
          <div
            className="pointer-events-none absolute -top-1 left-24 z-20 text-amber-300 opacity-90 drop-shadow-[0_0_8px_rgba(253,224,71,0.8)] sm:-top-3 sm:left-32"
            style={{
              animation: 'pulse 3s ease-in-out infinite',
            }}
          >
            <Sparkles className="h-4 w-4 sm:h-5 sm:w-5" />
          </div>

          {/* Layer C: Learning Garden Island Core (Asset with Grounded Lion & Books) */}
          <Image
            src="/assets/learning-garden/island/garden_island_diorama.webp"
            alt="Đảo Vườn Học Tập Diệu Kỳ Luyện Thi Ảo"
            fill
            priority
            unoptimized
            sizes="(max-width: 640px) 260px, (max-width: 1024px) 450px, 540px"
            className="pointer-events-none object-contain drop-shadow-[0_16px_36px_rgba(20,60,140,0.18)] select-none"
          />

          {/* Layer D: Welcoming Speech Bubble (Desktop & Tablet) */}
          <div className="absolute -top-4 right-[-2%] hidden max-w-[200px] rounded-2xl border-2 border-white/95 bg-white/95 p-2.5 shadow-[0_8px_24px_rgba(50,80,180,0.12)] backdrop-blur-md transition-transform hover:-translate-y-0.5 sm:-top-5 sm:right-[-2%] sm:block sm:max-w-[215px] sm:p-3 lg:-top-6 lg:right-[-8px]">
            <div className="flex items-center gap-1.5 text-xs font-black text-amber-600 sm:text-sm">
              <Sparkles
                className="h-3.5 w-3.5 shrink-0 animate-spin text-amber-500"
                style={{ animationDuration: '6s' }}
              />
              <span>Xin chào bạn nhỏ!</span>
            </div>
            <p className="mt-1 text-[11px] leading-snug font-bold text-slate-700 sm:text-xs">
              Cùng tớ khám phá các hành trình luyện thi tiếng Anh kỳ thú nhé!
            </p>
            {/* Pointer beak pointing towards the lion's head */}
            <div className="absolute -bottom-1.5 left-7 h-3 w-3 rotate-45 border-r-2 border-b-2 border-white/95 bg-white/95" />
          </div>
        </div>
      </div>

      {/* 2. BRAND IDENTITY: "LUYỆN THI ẢO" 3D WORDMARK (Centered with Mascot) */}
      <div className="mt-1 flex w-full max-w-[540px] flex-col items-center text-center sm:mt-2.5">
        <div className="relative">
          <h1
            className="font-heading xs:text-3xl text-center text-2xl font-black tracking-wider uppercase select-none sm:text-4xl md:text-5xl lg:text-[3.5rem] lg:leading-[1.05]"
            style={{
              color: '#ffffff',
              textShadow: `
                -1.5px -1.5px 0 #7c3aed,
                 1.5px -1.5px 0 #7c3aed,
                -1.5px  1.5px 0 #7c3aed,
                 1.5px  1.5px 0 #7c3aed,
                 0 1px 0 #7c3aed,
                 0 2px 0 #6d28d9,
                 0 3px 0 #6d28d9,
                 0 4px 0 #5b21b6,
                 0 5px 0 #5b21b6,
                 0 6px 0 #4c1d95,
                 0 7px 0 #4c1d95,
                 0 8px 0 #3b0764,
                 0 12px 26px rgba(76, 29, 149, 0.42)
              `,
            }}
          >
            LUYỆN THI ẢO
          </h1>
          {/* Subtle golden star sparkle on top of the wordmark */}
          <span className="pointer-events-none absolute -top-2 -right-2 animate-ping text-[10px] text-amber-300 drop-shadow-[0_0_6px_rgba(251,191,36,0.9)] select-none sm:-top-3.5 sm:-right-3 sm:text-sm">
            ✦
          </span>
        </div>

        {/* 3. STORYBOOK TAGLINE BADGE */}
        <div className="mt-1 inline-flex max-w-[calc(100vw-2.5rem)] items-center gap-1 rounded-full border border-amber-300/80 bg-gradient-to-r from-amber-100/95 via-white/95 to-amber-100/95 px-2.5 py-0.5 shadow-[0_4px_14px_rgba(245,158,11,0.18)] backdrop-blur-md sm:mt-2 sm:max-w-none sm:gap-2 sm:px-4 sm:py-1.5">
          <Star className="h-2 w-2 shrink-0 fill-amber-400 text-amber-500 sm:h-3.5 sm:w-3.5" />
          <span className="font-heading xs:text-[10px] truncate text-[9px] font-black tracking-wide text-amber-950 uppercase sm:text-xs md:text-sm">
            Vương Quốc Luyện Thi Tiếng Anh Diệu Kỳ
          </span>
          <Star className="h-2 w-2 shrink-0 fill-amber-400 text-amber-500 sm:h-3.5 sm:w-3.5" />
        </div>

        {/* 4. ADVENTURE HIGHLIGHT TOKENS (Desktop / Tablet) */}
        <div className="mt-3 hidden flex-wrap items-center justify-center gap-2 sm:flex lg:mt-3.5">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-white/80 bg-white/85 px-3 py-1.5 text-xs font-bold text-slate-800 shadow-[0_4px_12px_rgba(50,80,180,0.08)] backdrop-blur-sm">
            <Compass className="h-3.5 w-3.5 text-sky-600" />
            <span>Chuẩn Cambridge & Bộ Giáo Dục</span>
          </div>
          <div className="inline-flex items-center gap-1.5 rounded-full border border-white/80 bg-white/85 px-3 py-1.5 text-xs font-bold text-slate-800 shadow-[0_4px_12px_rgba(50,80,180,0.08)] backdrop-blur-sm">
            <Trophy className="h-3.5 w-3.5 text-amber-500" />
            <span>Bảng vàng & Huy hiệu vinh danh</span>
          </div>
        </div>
      </div>
    </div>
  )
}
