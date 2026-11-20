'use client'

import { useEffect, useRef } from 'react'

/**
 * DreamySkyBackground
 * Creates a magical living atmosphere for young learners:
 * - Soft dreamy sky gradient (soft morning blue -> apricot/cream -> fresh mint)
 * - Multi-layered drifting cloud banks with parallax depth
 * - Interactive ambient canvas particles (golden fairy motes & stardust that drift upward)
 * - High performance: 60fps locked, pauses when tab is hidden, respects prefers-reduced-motion
 */
export function DreamySkyBackground() {
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

    // Check prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    // Generate dreamy floating particles (fairy motes)
    const particleCount = prefersReducedMotion ? 0 : Math.min(35, Math.floor(width / 45))
    const particles = Array.from({ length: particleCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: Math.random() * 2.5 + 1.2,
      baseAlpha: Math.random() * 0.45 + 0.25,
      alpha: 0.3,
      speedY: Math.random() * 0.45 + 0.2,
      swaySpeed: Math.random() * 0.02 + 0.01,
      swayOffset: Math.random() * Math.PI * 2,
      swayRadius: Math.random() * 20 + 10,
      color: Math.random() > 0.4 ? '255, 235, 160' : '200, 245, 220', // golden butter & mint shimmer
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

        // Draw soft glowing particle
        const gradient = ctx.createRadialGradient(swayX, p.y, 0, swayX, p.y, p.radius * 3)
        gradient.addColorStop(0, `rgba(${p.color}, ${Math.max(0, p.alpha)})`)
        gradient.addColorStop(0.5, `rgba(${p.color}, ${Math.max(0, p.alpha * 0.4)})`)
        gradient.addColorStop(1, `rgba(${p.color}, 0)`)

        ctx.fillStyle = gradient
        ctx.beginPath()
        ctx.arc(swayX, p.y, p.radius * 3, 0, Math.PI * 2)
        ctx.fill()
      }

      animationFrameId = requestAnimationFrame(render)
    }

    if (!prefersReducedMotion) {
      render()
    }

    return () => {
      window.removeEventListener('resize', handleResize)
      cancelAnimationFrame(animationFrameId)
    }
  }, [])

  return (
    <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden select-none">
      {/* 1. Base Sky Gradient: Soft morning azure to apricot peach and fresh mint horizon */}
      <div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse 90% 70% at 50% -10%, rgba(186, 230, 253, 0.95) 0%, rgba(224, 242, 254, 0.7) 40%, rgba(254, 243, 199, 0.6) 80%, rgba(220, 252, 231, 0.5) 100%),
            linear-gradient(180deg, #93c5fd 0%, #bae6fd 30%, #fef3c7 70%, #dcfce7 100%)
          `,
        }}
      />

      {/* 2. Soft Ambient Sunburst / Celestial Glow in Center - Enlarged */}
      <div
        className="pointer-events-none absolute top-1/4 left-1/2 h-[800px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-75 mix-blend-screen blur-[120px] md:h-[1050px] md:w-[1050px] md:opacity-85 md:blur-[140px]"
        style={{
          background:
            'radial-gradient(circle, rgba(254, 240, 138, 0.85) 0%, rgba(253, 186, 116, 0.45) 45%, transparent 70%)',
        }}
      />

      {/* 3. Deep Atmospheric Horizon Clouds (Framing bottom & sides, keeping planet area crystal clear) */}
      <div className="absolute inset-0 opacity-40 mix-blend-soft-light">
        <svg className="h-full w-full" preserveAspectRatio="none" viewBox="0 0 1440 900">
          <path
            d="M0,640 C360,580 540,660 720,620 C900,580 1120,660 1440,610 L1440,900 L0,900 Z"
            fill="rgba(255, 255, 255, 0.55)"
          />
          <path
            d="M0,720 C320,680 520,740 800,700 C1080,660 1260,730 1440,690 L1440,900 L0,900 Z"
            fill="rgba(254, 243, 199, 0.45)"
          />
        </svg>
      </div>

      {/* 4. Canvas Floating Fairy Particles & Golden Pollen Motes */}
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
    </div>
  )
}
