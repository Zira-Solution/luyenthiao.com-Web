'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useRef } from 'react'

import { LearningGardenScene } from '@/components/auth/learning-garden-scene'

interface AuthPageShellProps {
  /** The auth form rendered in the right column. */
  children: React.ReactNode
}

/**
 * AmbientFairyMotesCanvas
 * Renders upward-drifting golden fairy motes & stardust:
 * 60fps locked, responsive, pauses when tab is hidden, respects prefers-reduced-motion.
 */
function AmbientFairyMotesCanvas(): React.ReactElement {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationFrameId: number
    let width = (canvas.width = window.innerWidth)
    let height = (canvas.height = window.innerHeight)

    const handleResize = () => {
      if (!canvas) return
      width = canvas.width = window.innerWidth
      height = canvas.height = window.innerHeight
    }
    window.addEventListener('resize', handleResize)

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) return

    const particleCount = Math.min(30, Math.floor(width / 50))
    const particles = Array.from({ length: particleCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: Math.random() * 2.2 + 1.0,
      baseAlpha: Math.random() * 0.45 + 0.2,
      alpha: 0.3,
      speedY: Math.random() * 0.4 + 0.15,
      swaySpeed: Math.random() * 0.02 + 0.01,
      swayOffset: Math.random() * Math.PI * 2,
      swayRadius: Math.random() * 16 + 8,
      color: Math.random() > 0.4 ? '255, 235, 160' : '200, 245, 220',
    }))

    let time = 0

    const render = () => {
      ctx.clearRect(0, 0, width, height)
      time += 0.015

      for (const p of particles) {
        p.y -= p.speedY
        if (p.y < -10) {
          p.y = height + 10
          p.x = Math.random() * width
        }

        const swayX = p.x + Math.sin(time * p.swaySpeed + p.swayOffset) * p.swayRadius
        p.alpha = p.baseAlpha + Math.sin(time * 2 + p.swayOffset) * 0.15

        const gradient = ctx.createRadialGradient(swayX, p.y, 0, swayX, p.y, p.radius * 3)
        gradient.addColorStop(0, `rgba(${p.color}, ${Math.max(0, p.alpha)})`)
        gradient.addColorStop(0.5, `rgba(${p.color}, ${Math.max(0, p.alpha * 0.35)})`)
        gradient.addColorStop(1, `rgba(${p.color}, 0)`)

        ctx.fillStyle = gradient
        ctx.beginPath()
        ctx.arc(swayX, p.y, p.radius * 3, 0, Math.PI * 2)
        ctx.fill()
      }

      animationFrameId = requestAnimationFrame(render)
    }

    render()

    return () => {
      window.removeEventListener('resize', handleResize)
      cancelAnimationFrame(animationFrameId)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0 -z-10 h-full w-full select-none"
    />
  )
}

/**
 * AuthPageShell
 * Full-viewport Learning Garden environment for the Luyện Thi Ảo login portal:
 * - Full-screen background: Illustrated daytime sky with painterly clouds matching Flyer homepage mood
 * - Ambient living motes: Canvas fairy dust motes drifting upward
 * - Navigation: Back-to-home pill at top-left
 * - Desktop: Two-zone layout (Left: Learning Garden Diorama, Right: Login Form)
 * - Mobile/Tablet: Compact mascot island above form, touch-friendly, zero horizontal overflow
 */
export function AuthPageShell({ children }: AuthPageShellProps): React.ReactElement {
  return (
    <main className="relative isolate flex min-h-screen w-full flex-col items-center overflow-x-hidden overflow-y-auto px-3.5 py-4 select-none sm:px-6 sm:py-8 md:px-8 lg:flex-row lg:justify-center lg:py-8">
      {/* 1. Illustrated Daytime Sky Background Artwork */}
      <div className="pointer-events-none fixed inset-0 -z-30 overflow-hidden">
        <Image
          src="/assets/learning-garden/background/sky_daytime_illustrated.webp"
          alt="Bầu trời diệu kỳ Luyện Thi Ảo"
          fill
          unoptimized
          priority
          sizes="100vw"
          className="h-full w-full object-cover object-center select-none"
        />
      </div>

      {/* 2. Interactive Ambient Fairy Motes Canvas */}
      <AmbientFairyMotesCanvas />

      {/* 3. Fantasy Adventure Signboard (Option 3: Exact Reference Match) */}
      <div className="fixed top-3.5 left-3.5 z-50 sm:top-5 sm:left-5 md:top-5 md:left-6">
        <Link
          href="/"
          aria-label="Về trang chủ"
          className="group relative inline-flex h-[46px] w-[174px] items-center justify-center transition-all duration-200 select-none hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 focus-visible:outline-none active:translate-y-0.5 motion-reduce:transition-none sm:h-[50px] sm:w-[188px]"
        >
          {/* SVG Signboard Frame + Chamfers + 3D Bevel + Glossy Leaves */}
          <svg
            className="absolute inset-0 h-full w-full overflow-visible"
            viewBox="0 0 188 50"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              {/* Outer Caramel-Wood Gradient */}
              <linearGradient
                id="fantasy-wood-main"
                x1="94"
                y1="0"
                x2="94"
                y2="44"
                gradientUnits="userSpaceOnUse"
              >
                <stop offset="0%" stopColor="#f59e0b" />
                <stop offset="15%" stopColor="#ea580c" />
                <stop offset="70%" stopColor="#c2410c" />
                <stop offset="100%" stopColor="#9a3412" />
              </linearGradient>

              {/* 3D Bottom Wood Bevel */}
              <linearGradient
                id="fantasy-wood-bevel"
                x1="94"
                y1="42"
                x2="94"
                y2="48"
                gradientUnits="userSpaceOnUse"
              >
                <stop offset="0%" stopColor="#78350f" />
                <stop offset="100%" stopColor="#451a03" />
              </linearGradient>

              {/* Inner Cream / Pale Yellow Plaque Face */}
              <linearGradient
                id="fantasy-cream-face"
                x1="94"
                y1="3"
                x2="94"
                y2="41"
                gradientUnits="userSpaceOnUse"
              >
                <stop offset="0%" stopColor="#fffef5" />
                <stop offset="25%" stopColor="#fefae0" />
                <stop offset="70%" stopColor="#fef08a" />
                <stop offset="100%" stopColor="#fde047" />
              </linearGradient>

              {/* Fresh Lime-to-Emerald Leaf Gradients */}
              <linearGradient
                id="fantasy-leaf-g1"
                x1="0"
                y1="0"
                x2="18"
                y2="22"
                gradientUnits="userSpaceOnUse"
              >
                <stop offset="0%" stopColor="#bef264" />
                <stop offset="45%" stopColor="#4ade80" />
                <stop offset="85%" stopColor="#16a34a" />
                <stop offset="100%" stopColor="#14532d" />
              </linearGradient>

              <linearGradient
                id="fantasy-leaf-g2"
                x1="0"
                y1="0"
                x2="14"
                y2="18"
                gradientUnits="userSpaceOnUse"
              >
                <stop offset="0%" stopColor="#86efac" />
                <stop offset="55%" stopColor="#22c55e" />
                <stop offset="100%" stopColor="#15803d" />
              </linearGradient>

              {/* Natural Ambient Drop Shadow */}
              <filter
                id="fantasy-shadow-sign"
                x="-10%"
                y="-10%"
                width="120%"
                height="130%"
                filterUnits="userSpaceOnUse"
              >
                <feDropShadow
                  dx="0"
                  dy="3"
                  stdDeviation="2.5"
                  floodColor="#451a03"
                  floodOpacity="0.22"
                />
              </filter>
            </defs>

            {/* Base Signboard Structure with Drop Shadow */}
            <g filter="url(#fantasy-shadow-sign)">
              {/* 1. 3D Bottom Wood Bevel (depth: 4px) */}
              <path
                d="M 11 42 L 177 42 L 186 33 L 186 37 L 177 46 L 11 46 L 2 37 L 2 33 Z"
                fill="url(#fantasy-wood-bevel)"
              />

              {/* 2. Main Chamfered Wooden Plaque (W=188, H=42, Chamfer=10) */}
              <path
                d="M 10 0 L 178 0 L 188 10 L 188 32 L 178 42 L 10 42 L 0 32 L 0 10 Z"
                fill="url(#fantasy-wood-main)"
                stroke="#fde68a"
                strokeWidth="1.2"
                strokeLinejoin="round"
              />

              {/* 3. Inner Cream Face (W=180, H=34, Inset=4) */}
              <path
                d="M 12 4 L 176 4 L 184 12 L 184 30 L 176 38 L 12 38 L 4 30 L 4 12 Z"
                fill="url(#fantasy-cream-face)"
                stroke="#ca8a04"
                strokeOpacity="0.35"
                strokeWidth="0.8"
                strokeLinejoin="round"
              />

              {/* Specular Highlight Arc along top rim */}
              <path
                d="M 14 5.5 L 174 5.5"
                stroke="#ffffff"
                strokeWidth="1.2"
                strokeLinecap="round"
                strokeOpacity="0.8"
              />
              <path
                d="M 176 4.5 L 183.5 12"
                stroke="#ffffff"
                strokeWidth="1.2"
                strokeLinecap="round"
                strokeOpacity="0.7"
              />
            </g>

            {/* 4. Top-Left Green Leaf Cluster (Hugging the chamfered corner) */}
            <g className="transition-transform duration-200 group-hover:scale-105 group-hover:-rotate-3">
              {/* Leaf 1: pointing down-left */}
              <path
                d="M 3 24 C -6 20 -8 14 -3 8 C 2 13 6 18 3 24 Z"
                fill="url(#fantasy-leaf-g1)"
                stroke="#15803d"
                strokeWidth="0.8"
              />
              <path
                d="M -2 10 C 1 13 2 16 2 20"
                stroke="#dcfce7"
                strokeWidth="0.7"
                strokeLinecap="round"
                strokeOpacity="0.8"
              />

              {/* Leaf 2: pointing up-left (prominent, glossy) */}
              <path
                d="M 12 12 C 5 2 -1 -3 -6 2 C -6 10 1 15 12 12 Z"
                fill="url(#fantasy-leaf-g1)"
                stroke="#15803d"
                strokeWidth="0.9"
              />
              <path
                d="M -3 1 C 0 3 4 5 8 9"
                stroke="#ffffff"
                strokeWidth="1"
                strokeLinecap="round"
                strokeOpacity="0.85"
              />

              {/* Leaf 3: pointing up */}
              <path
                d="M 19 8 C 16 -3 7 -6 3 -3 C 1 4 9 10 19 8 Z"
                fill="url(#fantasy-leaf-g2)"
                stroke="#166534"
                strokeWidth="0.8"
              />
            </g>

            {/* 5. Top-Right Leaf Sprout */}
            <g className="transition-transform duration-200 group-hover:scale-105 group-hover:rotate-3">
              {/* Leaf A: pointing up-right */}
              <path
                d="M 174 8 C 178 -3 186 -5 190 -1 C 190 7 183 9 174 8 Z"
                fill="url(#fantasy-leaf-g2)"
                stroke="#15803d"
                strokeWidth="0.8"
              />
              {/* Leaf B: pointing right */}
              <path
                d="M 183 15 C 191 10 196 14 196 19 C 191 22 186 20 183 15 Z"
                fill="url(#fantasy-leaf-g1)"
                stroke="#166534"
                strokeWidth="0.8"
              />
              <path
                d="M 192 13 C 193 15 193 17 190 19"
                stroke="#ffffff"
                strokeWidth="0.8"
                strokeLinecap="round"
                strokeOpacity="0.75"
              />
            </g>
          </svg>

          {/* Overlay Content: Chunky 3D Brown Arrow + Bold Playful Label */}
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center gap-2 px-3 pb-1.5">
            {/* Chunky 3D Arrow (rich dark caramel-brown) */}
            <span className="flex items-center justify-center text-[#6c2e05] drop-shadow-[0_1px_0_rgba(255,255,255,0.7)] transition-transform duration-200 group-hover:-translate-x-1">
              <svg width="20" height="16" viewBox="0 0 20 16" fill="none">
                {/* 3D bottom shadow of arrow */}
                <path
                  d="M 7 1.5 L 1 7.5 L 7 13.5 L 7 10 L 18 10 L 18 5 L 7 5 Z"
                  fill="#451a03"
                  transform="translate(0, 1.2)"
                />
                {/* Arrow body */}
                <path
                  d="M 7 1 L 1 7 L 7 13 L 7 9.5 L 18 9.5 L 18 4.5 L 7 4.5 Z"
                  fill="#6c2e05"
                  stroke="#92400e"
                  strokeWidth="0.7"
                  strokeLinejoin="round"
                />
                {/* Top highlight line */}
                <path
                  d="M 7 2 L 2 7 M 7 5.5 L 17 5.5"
                  stroke="#b45309"
                  strokeWidth="0.8"
                  strokeLinecap="round"
                />
              </svg>
            </span>

            {/* Label: Về trang chủ (font-heading font-black, warm chocolate brown) */}
            <span className="font-heading text-[13.5px] font-black tracking-wide whitespace-nowrap text-[#5c2406] drop-shadow-[0_1px_0_rgba(255,255,255,0.95)] sm:text-sm">
              Về trang chủ
            </span>
          </div>
        </Link>
      </div>

      {/* 4. Two-Zone Seamless Layout (56% / 44% Split) */}
      <div className="relative z-10 my-auto flex w-full max-w-[1280px] flex-col items-center justify-center py-4 lg:min-h-[calc(100vh-4rem)] lg:flex-row lg:items-center lg:justify-between lg:gap-10 lg:py-0">
        {/* ================= DESKTOP LEFT ZONE (~56%): LEARNING GARDEN DIORAMA ================= */}
        <div className="hidden w-full flex-col items-center justify-center lg:flex lg:w-[56%] lg:translate-x-0 lg:items-start xl:translate-x-12 2xl:translate-x-20">
          <LearningGardenScene />
        </div>

        {/* ================= MOBILE / TABLET COMPACT MASCOT HEADER (< 1024px) ================= */}
        <div className="flex w-full flex-col items-center justify-center pt-2 pb-3 lg:hidden">
          <div className="xs:w-[160px] relative aspect-[875/734] w-[140px] animate-[float-slow_6s_ease-in-out_infinite] motion-reduce:animate-none sm:w-[200px]">
            <Image
              src="/assets/learning-garden/island/garden_island_diorama.png"
              alt="Linh vật Luyện Thi Ảo"
              fill
              priority
              unoptimized
              sizes="(max-width: 640px) 160px, 200px"
              className="pointer-events-none object-contain drop-shadow-[0_12px_24px_rgba(20,60,140,0.16)] select-none"
            />
          </div>
        </div>

        {/* ================= RIGHT ZONE (~44%): POLISHED LOGIN PANEL ================= */}
        <div className="flex w-full flex-1 items-center justify-center lg:w-[44%] lg:justify-end">
          {children}
        </div>
      </div>
    </main>
  )
}
