'use client'

import Image from 'next/image'
import { useEffect, useRef } from 'react'

/**
 * DreamySkyBackground (Illustrated High-Resolution Fantasy Daytime Sky)
 * - Coherent, high-resolution original illustrated daytime sky artwork (2560x1429 WebP)
 * - Crisp azure-blue upper sky with painterly volumetric clouds framing outer edges & horizon
 * - Soft layered blue distant mountains & subtle atmospheric depth
 * - Warm natural sunlight from the upper-right corner
 * - Clean open negative space behind all three planets (zero color stains, zero radial blur halos)
 * - Delicate upward-drifting golden fairy motes Canvas (60fps, GPU-accelerated, pauses on reduced motion)
 */
export function DreamySkyBackground(): React.ReactElement {
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
    const particleCount = prefersReducedMotion ? 0 : Math.min(20, Math.floor(width / 65))
    const particles = Array.from({ length: particleCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: Math.random() * 2.0 + 1.0,
      baseAlpha: Math.random() * 0.35 + 0.15,
      alpha: 0.25,
      speedY: Math.random() * 0.35 + 0.15,
      swaySpeed: Math.random() * 0.02 + 0.01,
      swayOffset: Math.random() * Math.PI * 2,
      swayRadius: Math.random() * 16 + 8,
      color: '255, 235, 170',
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
        p.alpha = p.baseAlpha + Math.sin(time * 2 + p.swayOffset) * 0.1
        const gradient = ctx.createRadialGradient(swayX, p.y, 0, swayX, p.y, p.radius * 2.5)
        gradient.addColorStop(0, `rgba(${p.color}, ${Math.max(0, p.alpha)})`)
        gradient.addColorStop(0.6, `rgba(${p.color}, ${Math.max(0, p.alpha * 0.3)})`)
        gradient.addColorStop(1, `rgba(${p.color}, 0)`)
        ctx.fillStyle = gradient
        ctx.beginPath()
        ctx.arc(swayX, p.y, p.radius * 2.5, 0, Math.PI * 2)
        ctx.fill()
      }
      animationFrameId = requestAnimationFrame(render)
    }

    if (!prefersReducedMotion) render()
    return () => {
      window.removeEventListener('resize', handleResize)
      cancelAnimationFrame(animationFrameId)
    }
  }, [])

  return (
    <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden select-none">
      {/* Semi-Realistic High-Resolution Fantasy Daytime Sky Artwork */}
      <Image
        src="/assets/homepage/background/universe-background.webp"
        alt="Bầu trời diệu kỳ Luyện Thi Ảo"
        fill
        unoptimized
        priority
        sizes="100vw"
        className="h-full w-full object-cover object-center select-none"
      />
      {/* Delicate Ambient Living Fairy Motes Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
    </div>
  )
}
