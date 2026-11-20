'use client'

import { ChevronRight, Compass, Sparkles } from 'lucide-react'
import { useState } from 'react'

import { cn } from '@/lib/utils'
import type { Planet } from '@/schemas/planet'

interface PlanetDioramaProps {
  planet: Planet
  isActive: boolean
  isVisible: boolean
  onSelect?: () => void
}

export function getPlanetLevelBadges(
  planet: Planet,
): { label: string; bg: string; border: string }[] {
  const slug = planet.slug.toLowerCase()
  if (slug === 'starters') {
    return [{ label: 'Pre A1', bg: 'from-[#fb7185] to-[#f43f5e]', border: 'border-[#be123c]' }]
  }
  if (slug === 'movers') {
    return [{ label: 'A1', bg: 'from-[#38bdf8] to-[#0284c7]', border: 'border-[#0369a1]' }]
  }
  if (slug === 'flyers') {
    return [{ label: 'A2', bg: 'from-[#fb923c] to-[#ea580c]', border: 'border-[#c2410c]' }]
  }
  if (slug === 'toefl_primary') {
    return [
      { label: 'A2', bg: 'from-[#fb923c] to-[#ea580c]', border: 'border-[#c2410c]' },
      { label: 'B1', bg: 'from-[#4ade80] to-[#16a34a]', border: 'border-[#15803d]' },
    ]
  }
  if (slug === 'ioe') {
    return [{ label: 'Cấp 1 - 2', bg: 'from-[#60a5fa] to-[#2563eb]', border: 'border-[#1d4ed8]' }]
  }
  return [{ label: 'A1', bg: 'from-[#fb923c] to-[#ea580c]', border: 'border-[#c2410c]' }]
}

/**
 * PlanetDiorama
 * Multi-dimensional living miniature world:
 * - Layer A: Radiant ambient aura & atmospheric depth halo
 * - Layer B: Floating miniature island core with organic levitation & soft contact shadow
 * - Layer C: Detached floating creature/butterfly with independent 3D wing flapping motion
 * - Layer D: Pure Floating Typography (3D display title, subtitle, collectible level badges - NO card container)
 * - Layer E: "KHÁM PHÁ NGAY" emerald capsule CTA button with tactile 3D affordance
 */
export function PlanetDiorama({ planet, isActive, isVisible, onSelect }: PlanetDioramaProps) {
  const [isHovered, setIsHovered] = useState(false)
  const isInteracting = isActive || isHovered

  return (
    <div
      onClick={onSelect}
      className={cn(
        'short-diorama-scale group relative flex h-full w-full cursor-pointer flex-col items-center justify-center transition-all duration-700 ease-out select-none',
        isActive
          ? 'z-30 scale-100 opacity-100'
          : isVisible
            ? 'z-10 scale-[0.78] opacity-65 hover:opacity-85'
            : 'pointer-events-none scale-60 opacity-0',
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* 1. THEMATIC AURA & SOFT ATMOSPHERIC GLOW */}
      <div
        className={cn(
          'pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full transition-all duration-1000 ease-in-out',
          isActive
            ? 'h-[360px] w-[360px] opacity-75 blur-[65px] md:h-[450px] md:w-[450px] md:opacity-85 md:blur-[85px]'
            : 'h-[220px] w-[220px] opacity-30 blur-[40px]',
        )}
        style={{
          background: `radial-gradient(circle, ${planet.glowColor || planet.ribbonFrom} 0%, rgba(254, 240, 138, 0.35) 45%, transparent 70%)`,
        }}
      />

      {/* 2. PLANET CORE & DETACHED FLOATING ELEMENTS CONTAINER */}
      <div className="relative flex flex-col items-center justify-center">
        {/* Detached Floating Element 1: Playful 3D Wing-Flapping Butterfly */}
        <div
          className={cn(
            'pointer-events-none absolute -top-6 -left-6 z-20 transition-transform duration-700 md:-top-9 md:-left-9',
            isInteracting ? 'translate-y-[-6px]' : '',
          )}
          style={{
            animation: isActive ? 'float-butterfly 6s ease-in-out infinite' : 'none',
          }}
        >
          <div className="relative flex items-center justify-center">
            {/* Soft shadow below butterfly */}
            <div className="absolute -bottom-2 h-1.5 w-4 rounded-full bg-black/15 blur-[2px]" />
            {/* Butterfly SVG with 3D wing flapping */}
            <svg
              className="h-6 w-6 text-amber-300 drop-shadow-[0_2px_6px_rgba(245,158,11,0.5)] md:h-8 md:w-8"
              viewBox="0 0 32 32"
              fill="none"
              style={{
                animation: 'wing-flap 0.4s ease-in-out infinite alternate',
                transformOrigin: 'center center',
              }}
            >
              {/* Left Wing */}
              <path
                d="M16 16 C12 10, 4 8, 4 14 C4 18, 10 20, 16 17 Z"
                fill="url(#butterfly-wing-left)"
                stroke="#d97706"
                strokeWidth="0.8"
              />
              {/* Right Wing */}
              <path
                d="M16 16 C20 10, 28 8, 28 14 C28 18, 22 20, 16 17 Z"
                fill="url(#butterfly-wing-right)"
                stroke="#d97706"
                strokeWidth="0.8"
              />
              {/* Body */}
              <ellipse cx="16" cy="16" rx="1.5" ry="5" fill="#78350f" />
              <defs>
                <linearGradient id="butterfly-wing-left" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#fef08a" />
                  <stop offset="60%" stopColor="#f59e0b" />
                  <stop offset="100%" stopColor="#ea580c" />
                </linearGradient>
                <linearGradient id="butterfly-wing-right" x1="1" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#fef08a" />
                  <stop offset="60%" stopColor="#f59e0b" />
                  <stop offset="100%" stopColor="#ea580c" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>

        {/* Detached Floating Element 2: Magic Sparkles / Fairy Dust near top-right */}
        <div
          className="pointer-events-none absolute -top-3 -right-3 z-20 text-yellow-300 opacity-90 drop-shadow-[0_0_8px_rgba(253,224,71,0.8)] md:-top-5 md:-right-5"
          style={{
            animation: 'pulse 3s ease-in-out infinite',
          }}
        >
          <Sparkles className="h-4.5 w-4.5 md:h-5 md:w-5" />
        </div>

        {/* 3. CORE PLANET BODY (Fluid, Height-Aware Living Miniature World) */}
        <div
          className={cn(
            'relative transition-all duration-500 ease-out',
            'h-[min(170px,24vh)] w-[min(170px,24vh)] sm:h-[min(220px,28vh)] sm:w-[min(220px,28vh)] md:h-[min(270px,34vh)] md:w-[min(270px,34vh)] lg:h-[310px] lg:w-[310px]',
            isActive ? 'animate-[floating_6s_ease-in-out_infinite]' : '',
            isHovered ? '-translate-y-2 scale-[1.03]' : '',
          )}
        >
          <img
            src={planet.image}
            alt={planet.name}
            className="h-full w-full object-contain drop-shadow-[0_18px_36px_rgba(30,58,138,0.25)] transition-transform duration-500"
            onError={(e) => {
              ;(e.target as HTMLImageElement).src = '/clone-assets/media/planet_candy.png'
            }}
          />
          {/* Subtle 3D Island Contact Shadow */}
          <div className="pointer-events-none absolute -bottom-3 left-1/2 -z-10 h-4 w-3/4 -translate-x-1/2 rounded-full bg-indigo-950/15 blur-md" />
        </div>
      </div>

      {/* 4. TARGET CONCEPT: PURE FLOATING CURVED TYPOGRAPHY (Touches & hugs planet with 3D arc) */}
      <div className="relative z-40 -mt-9 flex w-full flex-col items-center justify-center sm:-mt-12 md:-mt-15 lg:-mt-18">
        {/* Subtle Golden Orbital Ring with Fairy Stars - Wraps planet base */}
        <div className="pointer-events-none absolute top-3 left-1/2 -z-10 flex -translate-x-1/2 items-center justify-center sm:top-4 md:top-5">
          {/* Elliptical orbit line */}
          <div className="h-[48px] w-[250px] rounded-[100%] border border-amber-300/40 bg-amber-200/[0.04] shadow-[0_0_12px_rgba(253,224,71,0.15)] sm:h-[58px] sm:w-[300px] md:h-[68px] md:w-[350px]" />
          {/* Orbit Star Sparkles */}
          <span className="absolute -left-1 text-xs text-amber-300 drop-shadow-[0_0_6px_rgba(251,191,36,0.8)] select-none sm:-left-2 sm:text-sm">
            ✦
          </span>
          <span
            className="absolute -right-1 text-xs text-amber-300 drop-shadow-[0_0_6px_rgba(251,191,36,0.8)] select-none sm:-right-2 sm:text-sm"
            style={{ animationDelay: '1s' }}
          >
            ✦
          </span>
          <span className="absolute -top-1 left-6 text-[10px] text-amber-200 drop-shadow-[0_0_4px_rgba(251,191,36,0.6)] select-none">
            ★
          </span>
          <span className="absolute right-6 -bottom-1 text-[10px] text-amber-200 drop-shadow-[0_0_4px_rgba(251,191,36,0.6)] select-none">
            ★
          </span>
        </div>

        {/* 4A. World Name: Playful Arched 3D Display Typography (Cong cong & chạm hẳn vào tinh cầu) */}
        <h2
          className={cn(
            'font-heading relative flex items-center justify-center text-center leading-none font-black uppercase select-none',
            'text-2xl sm:text-3xl md:text-4xl lg:text-[2.85rem]',
            'transition-transform duration-300',
            isHovered ? 'scale-105' : '',
          )}
        >
          {/* Accessible text for screen readers & tests */}
          <span className="sr-only">{planet.name}</span>

          {/* Visual Curved / Arched 3D Typography */}
          <span aria-hidden="true" className="flex items-center justify-center">
            {Array.from(planet.name).map((char, i, arr) => {
              if (char === ' ') {
                return <span key={i} className="inline-block w-2.5 sm:w-3.5" />
              }
              const n = arr.length
              const half = (n - 1) / 2 || 1
              // Normalized position t from -1 (leftmost) to +1 (rightmost)
              const t = (i - half) / half
              // Dramatic convex arc hugging the bottom curve of the planet
              const dy = Math.pow(Math.abs(t), 1.6) * (n > 6 ? 16 : 11)
              // Outward rotation along the arc
              const rot = t * (n > 6 ? 13 : 8.5)
              // Bookends (ends) are slightly punchier
              const scale = Math.abs(t) > 0.82 ? 1.05 : 1.0

              return (
                <span
                  key={i}
                  className="inline-block transition-transform duration-200"
                  style={{
                    transform: `translateY(${dy}px) rotate(${rot}deg) scale(${scale})`,
                    transformOrigin: 'center bottom',
                    color: '#ffffff',
                    textShadow: `
                      -1.5px -1.5px 0 #9333ea,
                       1.5px -1.5px 0 #9333ea,
                      -1.5px  1.5px 0 #9333ea,
                       1.5px  1.5px 0 #9333ea,
                       0 1px 0 #a855f7,
                       0 2px 0 #9333ea,
                       0 3px 0 #7e22ce,
                       0 4px 0 #7e22ce,
                       0 5px 0 #6b21a8,
                       0 6px 0 #581c87,
                       0 7px 0 #3b0764,
                       0 10px 22px rgba(88, 28, 135, 0.45)
                    `,
                  }}
                >
                  {char}
                </span>
              )
            })}
          </span>
        </h2>

        {/* 4B. Subtitle with Em-Dashes in Deep Violet */}
        <p className="font-heading mt-2 text-center text-xs font-extrabold tracking-wide text-[#581c87] drop-shadow-[0_1px_2px_rgba(255,255,255,0.9)] select-none sm:text-sm md:text-base">
          — {planet.description} —
        </p>

        {/* 4C. Collectible Gold Charm Token Level Badge(s) */}
        <div className="mt-1.5 flex items-center justify-center gap-2 sm:mt-2">
          {planet.comingSoon ? (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-purple-300/80 bg-gradient-to-r from-purple-100 to-indigo-100 px-3.5 py-1 text-[10px] font-black tracking-wider text-purple-900 uppercase shadow-xs sm:text-[11px]">
              <Sparkles className="h-3 w-3 text-purple-600" />
              Sắp ra mắt
            </span>
          ) : (
            getPlanetLevelBadges(planet).map((badge) => (
              <span
                key={badge.label}
                className="inline-flex items-center gap-1.5 rounded-full border-t border-b-[2.5px] border-[#b45309] border-amber-200/90 bg-gradient-to-b from-[#fef08a] via-[#facc15] to-[#f59e0b] px-3.5 py-1 text-[10px] font-black tracking-wider text-[#78350f] uppercase shadow-[0_4px_12px_rgba(245,158,11,0.35)] transition-transform hover:scale-105 sm:text-xs"
              >
                <span className="text-[11px] leading-none text-amber-700 drop-shadow-[0_1px_0_rgba(255,255,255,0.8)] sm:text-[12px]">
                  ★
                </span>
                <span>{badge.label}</span>
              </span>
            ))
          )}
        </div>

        {/* 4D. "KHÁM PHÁ NGAY" Emerald 3D Jelly Capsule Button (Matching Image 4) */}
        {!planet.comingSoon && (
          <div className="mt-2.5 flex items-center justify-center sm:mt-3">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                onSelect?.()
              }}
              className={cn(
                'group/btn relative inline-flex cursor-pointer items-center gap-1.5 rounded-full sm:gap-2',
                'border-t border-emerald-200/90 border-b-[3.5px] border-[#047857]',
                'bg-gradient-to-b from-[#34d399] via-[#10b981] to-[#059669]',
                'px-4 py-1.5 text-xs font-black tracking-wider text-white uppercase sm:px-6 sm:py-2.5 sm:text-sm',
                'shadow-[0_6px_18px_rgba(16,185,129,0.35)]',
                'transition-all duration-200 ease-out',
                'hover:-translate-y-0.5 hover:shadow-[0_10px_24px_rgba(16,185,129,0.48)] hover:brightness-105',
                'active:translate-y-[2px] active:border-b-2 active:brightness-95',
              )}
            >
              {/* Shiny glossy pill reflex highlight */}
              <div className="pointer-events-none absolute inset-x-3 top-0.5 h-[40%] rounded-full bg-gradient-to-b from-white/45 to-transparent" />

              {/* White circular compass icon */}
              <span className="relative flex h-4.5 w-4.5 items-center justify-center rounded-full bg-white/20 shadow-xs sm:h-5 sm:w-5">
                <Compass className="h-3 w-3 text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.2)] sm:h-3.5 sm:w-3.5" />
              </span>

              {/* Button text */}
              <span className="relative font-black tracking-wide drop-shadow-[0_1px_2px_rgba(0,0,0,0.25)]">
                Khám phá ngay
              </span>

              {/* Chevron Right */}
              <ChevronRight className="relative h-3.5 w-3.5 stroke-[3] text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.2)] transition-transform duration-200 group-hover/btn:translate-x-0.5 sm:h-4 sm:w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
