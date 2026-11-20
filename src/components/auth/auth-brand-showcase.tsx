'use client'

import { Sparkles, Trophy, Compass, Star } from 'lucide-react'
import Image from 'next/image'

/**
 * AuthBrandShowcase (Left Zone of the Login Experience)
 * Art-directed storytelling sanctuary featuring:
 * - Layer A: Living 3D Baby Lion Mascot (curious, warm, playful, floating on cloud dais)
 * - Layer B: Welcoming Explorer Bubble ("Cùng tớ khám phá vũ trụ diệu kỳ nhé! ✨")
 * - Layer C: 3D Dimensional "LUYỆN THI ẢO" Brand Wordmark
 * - Layer D: Storybook Tagline Badge ("Vương Quốc Luyện Thi Tiếng Anh Diệu Kỳ")
 * - Layer E: 3 Compact Adventure Feature Tokens (Cambridge, Planets, Rewards)
 */
export function AuthBrandShowcase(): React.ReactElement {
  return (
    <div className="flex w-full flex-col items-center select-none lg:items-start">
      {/* 1. MASCOT & WELCOME BUBBLE DIORAMA ON FLOATING SANCTUARY DAIS */}
      <div className="relative flex flex-col items-center lg:items-start">
        {/* Soft Ambient Golden Aura behind the sanctuary */}
        <div
          className="pointer-events-none absolute -top-10 -left-10 -z-10 h-72 w-72 rounded-full opacity-60 blur-3xl sm:h-80 sm:w-80"
          style={{
            background:
              'radial-gradient(circle, rgba(254, 215, 170, 0.85) 0%, rgba(253, 230, 138, 0.45) 50%, transparent 70%)',
          }}
        />

        {/* Floating Sanctuary Stage (Mascot standing on 3D Pedestal Dais) */}
        <div className="relative flex items-center gap-2 sm:items-end sm:gap-4">
          {/* Unified Floating Island Group */}
          <div className="relative flex flex-col items-center animate-[floating_6s_ease-in-out_infinite]">
            {/* Living 3D Baby Lion Cub Hero (Interactive separate layer, NOT baked into background) */}
            <div className="relative z-10 -mb-[26%] transition-transform duration-500 hover:scale-105 active:scale-95 sm:-mb-[28%] md:-mb-[30%]">
              <Image
                src="/clone-assets/mascot/mascot_hero_standing.png"
                alt="Luyện Thi Ảo Lion Mascot"
                width={260}
                height={358}
                priority
                className="short-landscape-mascot w-[95px] drop-shadow-[0_12px_24px_rgba(234,88,12,0.22)] sm:w-[145px] md:w-[175px] lg:w-[205px]"
              />
              {/* Natural Contact Shadow on the stone dais */}
              <div className="pointer-events-none absolute -bottom-1 left-1/2 -z-10 h-2.5 w-3/5 -translate-x-1/2 rounded-full bg-amber-950/30 blur-[2px] sm:h-3.5" />

              {/* Magical star sparkle near lion's ear */}
              <div className="pointer-events-none absolute -top-1 -right-1 animate-pulse text-xs text-amber-300 drop-shadow-[0_0_8px_rgba(251,191,36,0.9)] sm:text-sm">
                ★
              </div>
            </div>

            {/* 3D Whimsical Floating Pedestal Dais (Stone ring, lush grass, golden runes, clouds) */}
            <div className="relative z-0 select-none">
              <Image
                src="/clone-assets/mascot/mascot_pedestal_stage.png"
                alt="Floating Sanctuary Pedestal"
                width={360}
                height={342}
                priority
                className="w-[155px] drop-shadow-[0_18px_32px_rgba(30,58,138,0.22)] sm:w-[235px] md:w-[285px] lg:w-[330px]"
              />
            </div>
          </div>

          {/* Welcoming Explorer Speech Bubble (Desktop/Tablet prominent, compact on mobile) */}
          <div className="relative hidden max-w-[210px] rounded-2xl border-2 border-white/90 bg-white/90 p-3 shadow-[0_8px_24px_rgba(100,110,180,0.14)] backdrop-blur-md transition-transform hover:-translate-y-1 sm:block sm:max-w-[230px] sm:p-3.5 lg:mb-12">
            <div className="flex items-center gap-1.5 text-xs font-black text-amber-600 sm:text-sm">
              <Sparkles
                className="h-4 w-4 shrink-0 animate-spin text-amber-500"
                style={{ animationDuration: '6s' }}
              />
              <span>Xin chào bạn nhỏ!</span>
            </div>
            <p className="mt-1 text-[11px] leading-snug font-bold text-slate-700 sm:text-xs">
              Cùng tớ khám phá các hành tinh luyện thi tiếng Anh kỳ thú nhé!
            </p>
            {/* Speech bubble pointer triangle */}
            <div className="absolute -bottom-2 left-6 hidden h-3 w-3 rotate-45 border-r-2 border-b-2 border-white/90 bg-white lg:block" />
          </div>
        </div>
      </div>

      {/* 2. BRAND IDENTITY: "LUYỆN THI ẢO" 3D WORDMARK */}
      <div className="mt-2 flex flex-col items-center sm:mt-4 lg:items-start">
        <div className="relative">
          <h1
            className="font-heading text-center text-2xl font-black tracking-wider uppercase select-none sm:text-4xl md:text-5xl lg:text-left lg:text-[3.65rem] lg:leading-[1.05]"
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
        <div className="mt-1.5 inline-flex items-center gap-1.5 rounded-full border border-amber-300/80 bg-gradient-to-r from-amber-100/90 via-white/95 to-amber-100/90 px-3 py-0.5 shadow-[0_6px_18px_rgba(245,158,11,0.2)] backdrop-blur-md sm:mt-2 sm:gap-2 sm:px-4 sm:py-1.5">
          <Star className="h-2.5 w-2.5 fill-amber-400 text-amber-500 sm:h-3.5 sm:w-3.5" />
          <span className="font-heading text-[10px] font-black tracking-wide text-amber-950 uppercase sm:text-xs md:text-sm">
            Vương Quốc Luyện Thi Tiếng Anh Diệu Kỳ
          </span>
          <Star className="h-2.5 w-2.5 fill-amber-400 text-amber-500 sm:h-3.5 sm:w-3.5" />
        </div>

        {/* 4. ADVENTURE HIGHLIGHT TOKENS */}
        <div className="mt-5 hidden flex-wrap items-center gap-2.5 sm:flex lg:mt-6">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-white/80 bg-white/75 px-3 py-1.5 text-xs font-bold text-slate-800 shadow-[0_4px_12px_rgba(100,110,180,0.08)] backdrop-blur-sm">
            <Compass className="h-3.5 w-3.5 text-sky-600" />
            <span>Chuẩn Cambridge & Bộ Giáo Dục</span>
          </div>
          <div className="inline-flex items-center gap-1.5 rounded-full border border-white/80 bg-white/75 px-3 py-1.5 text-xs font-bold text-slate-800 shadow-[0_4px_12px_rgba(100,110,180,0.08)] backdrop-blur-sm">
            <Trophy className="h-3.5 w-3.5 text-amber-500" />
            <span>Bảng vàng & Huy hiệu vinh danh</span>
          </div>
        </div>
      </div>
    </div>
  )
}
