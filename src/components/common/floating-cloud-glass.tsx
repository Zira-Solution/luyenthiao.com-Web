'use client'

import { memo } from 'react'

/**
 * FloatingCloudGlass
 *
 * A continuous, translucent, organically sculpted cloud-shaped glass ribbon
 * stretching horizontally across the top of the viewport behind the top navigation.
 *
 * Design characteristics:
 * - Fluid Bézier curve that dips gently around navigation groups and rises between them.
 * - Premium glassmorphism: semi-transparent milky-white surface with lavender/ice-blue undertones.
 * - Backdrop blur (14–16px) that keeps the dreamy sky visible underneath.
 * - Delicate luminous white bottom edge highlight and soft ambient depth shadow.
 * - Zero pointer event interception (pointer-events-none).
 */
export const FloatingCloudGlass = memo(function FloatingCloudGlass() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute top-0 left-0 -z-10 h-[96px] w-full overflow-visible select-none sm:h-[106px] md:h-[114px]"
    >
      {/* SVG Definitions for ClipPath & Highlight Gradients */}
      <svg className="absolute h-0 w-0" aria-hidden="true" focusable="false">
        <defs>
          {/*
            Normalized Bézier path (0.0 to 1.0) for responsive resolution-independent clipping:
            Top edge: (0, 0) to (1, 0)
            Right edge: (1, 0) to (1, 0.65)
            Organic bottom edge flowing from right to left:
            - Curves gently around Right Group & Flag
            - Rises smoothly between Right Group and Center
            - Dips gracefully around Luyện tập & Currencies
            - Rises smoothly between Center and Skills
            - Dips gently around Skills & Thách đấu
            - Tapers softly to left edge (0, 0.66)
          */}
          <clipPath id="cloud-glass-ribbon-clip" clipPathUnits="objectBoundingBox">
            <path d="M 0,0 L 1,0 L 1,0.65 C 0.95,0.67 0.90,0.80 0.83,0.81 C 0.75,0.82 0.69,0.70 0.63,0.68 C 0.57,0.66 0.52,0.84 0.46,0.84 C 0.40,0.84 0.36,0.70 0.30,0.68 C 0.24,0.66 0.17,0.82 0.11,0.82 C 0.05,0.82 0.015,0.68 0,0.66 Z" />
          </clipPath>

          <linearGradient id="cloud-glass-edge-grad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="rgba(255, 255, 255, 0.35)" />
            <stop offset="12%" stopColor="rgba(255, 255, 255, 0.85)" />
            <stop offset="35%" stopColor="rgba(255, 255, 255, 0.95)" />
            <stop offset="50%" stopColor="rgba(255, 255, 255, 0.75)" />
            <stop offset="65%" stopColor="rgba(255, 255, 255, 0.95)" />
            <stop offset="88%" stopColor="rgba(255, 255, 255, 0.85)" />
            <stop offset="100%" stopColor="rgba(255, 255, 255, 0.35)" />
          </linearGradient>
        </defs>
      </svg>

      {/* Ambient Drop Shadow & Glass Container */}
      <div className="relative h-full w-full drop-shadow-[0_4px_10px_rgba(30,27,75,0.05)] drop-shadow-[0_12px_24px_rgba(99,102,241,0.13)] filter">
        {/* The Clipped Frosted Glass Surface */}
        <div
          style={{ clipPath: 'url(#cloud-glass-ribbon-clip)' }}
          className="absolute inset-0 h-full w-full bg-gradient-to-b from-white/65 via-[#f8faff]/50 via-[45%] to-[#eef2ff]/30 backdrop-blur-[16px] backdrop-saturate-[140%]"
        />

        {/* Delicate Luminous White Edge Highlight along the bottom organic curve */}
        <svg
          viewBox="0 0 1000 120"
          preserveAspectRatio="none"
          className="absolute inset-0 h-full w-full overflow-visible"
        >
          <path
            d="M 0,79 C 15,82 50,98 110,98 C 170,98 240,79 300,82 C 360,84 400,101 460,101 C 520,101 570,79 630,82 C 690,84 750,98 830,97 C 900,96 950,80 1000,78"
            fill="none"
            stroke="url(#cloud-glass-edge-grad)"
            strokeWidth="1.5"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
      </div>
    </div>
  )
})
