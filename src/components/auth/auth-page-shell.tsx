import { ChevronLeft } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

import { AuthBrandShowcase } from '@/components/auth/auth-brand-showcase'

interface AuthPageShellProps {
  /** The auth form rendered in the right column. */
  children: React.ReactNode
}

/**
 * Dreamy World Auth Page Shell (Phase 1 — Full-Screen Seamless Environment)
 * Rebuilt from scratch as a cohesive, single-canvas panoramic fantasy world:
 * - Layer 1: 16:9 Cinematic Full-Screen Panoramic Environment (Gateway to Luyện Thi Ảo)
 * - Layer 2: Atmospheric Sunburst & Volumetric Depth Mist
 * - Layer 3: Subtle Environmental Motion (Drifting Paper Planes, Twinkling Stars & Fairy Dust)
 * - Layer 4: Preserved Navigation Capsule (Return to Home)
 * - Layer 5: Asymmetrical Form-Aware Layout (Left: Scenic Island Showcase, Right: UI Sanctuary)
 */
export function AuthPageShell({ children }: AuthPageShellProps): React.ReactElement {
  return (
    <main className="relative isolate flex min-h-screen w-full items-center justify-center overflow-x-hidden overflow-y-auto px-4 py-6 select-none sm:py-8 md:px-8 md:py-12">
      {/* 1. Seamless Full-Screen Panoramic Environment (No boxes, no seams, covers 100% viewport) */}
      <div className="pointer-events-none fixed inset-0 -z-30 overflow-hidden">
        <Image
          src="/clone-assets/media/login_panoramic_clean.png"
          alt="Luyện Thi Ảo Magical Learning World"
          fill
          priority
          sizes="100vw"
          className="h-full w-full object-cover object-[72%_center] select-none sm:object-[50%_center] lg:object-center"
        />
      </div>

      {/* 2. Soft Ambient Sunburst & Volumetric Sky Lighting */}
      <div
        className="pointer-events-none fixed top-1/4 left-1/4 -z-20 h-[700px] w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-45 mix-blend-screen blur-[120px]"
        style={{
          background:
            'radial-gradient(circle, rgba(255, 252, 210, 0.85) 0%, rgba(255, 215, 160, 0.35) 45%, transparent 70%)',
        }}
      />

      {/* 3. Subtle Horizon Ambient Mist for Depth */}
      <div
        className="pointer-events-none fixed inset-x-0 bottom-0 -z-20 h-40 opacity-40 mix-blend-soft-light"
        style={{
          background: 'linear-gradient(to top, rgba(243, 232, 255, 0.7) 0%, transparent 100%)',
        }}
      />

      {/* 4. Environmental Motion: Floating Paper Airplanes & Twinkling Stars */}
      <div className="pointer-events-none fixed inset-0 -z-15 overflow-hidden">
        {/* Paper Plane 1 (Top Left, gliding over the floating island) */}
        <div className="absolute top-[7%] left-[12%] h-10 w-10 -rotate-12 animate-[floating_7s_ease-in-out_infinite] opacity-85 transition-transform duration-1000 sm:h-12 sm:w-12">
          <svg
            viewBox="0 0 48 48"
            fill="none"
            className="h-full w-full drop-shadow-[0_6px_12px_rgba(40,100,200,0.18)]"
          >
            <path d="M4 22L44 6L28 42L22 28L4 22Z" fill="#FFFFFF" />
            <path d="M22 28L44 6L28 42L22 28Z" fill="#EBF3FD" />
            <path d="M22 28L26 36L28 42L22 28Z" fill="#D3E4F8" />
          </svg>
        </div>

        {/* Paper Plane 2 (Top Right, floating above the form sanctuary) */}
        <div className="absolute top-[9%] right-[10%] h-9 w-9 rotate-15 animate-[floating_8s_ease-in-out_infinite_1s] opacity-80 transition-transform duration-1000 sm:h-11 sm:w-11">
          <svg
            viewBox="0 0 48 48"
            fill="none"
            className="h-full w-full drop-shadow-[0_6px_12px_rgba(40,100,200,0.16)]"
          >
            <path d="M4 22L44 6L28 42L22 28L4 22Z" fill="#FFFFFF" />
            <path d="M22 28L44 6L28 42L22 28Z" fill="#F0F5FD" />
            <path d="M22 28L26 36L28 42L22 28Z" fill="#DCE8F7" />
          </svg>
        </div>

        {/* Twinkling Fairy Dust & Golden Stars */}
        <div className="absolute top-[13%] left-[34%] h-5 w-5 animate-pulse text-amber-300 drop-shadow-[0_0_8px_rgba(255,215,0,0.6)]">
          ★
        </div>
        <div className="absolute top-[17%] left-[45%] h-4 w-4 animate-pulse text-amber-200 drop-shadow-[0_0_8px_rgba(255,215,0,0.5)]">
          ✦
        </div>
        <div
          className="absolute top-[22%] right-[22%] h-4 w-4 animate-pulse text-amber-200 opacity-70 drop-shadow-[0_0_6px_rgba(255,215,0,0.4)]"
          style={{ animationDelay: '1.5s' }}
        >
          ✦
        </div>
        <div
          className="absolute top-[82%] right-[12%] h-5 w-5 animate-pulse text-amber-300 opacity-60 drop-shadow-[0_0_8px_rgba(255,215,0,0.5)]"
          style={{ animationDelay: '2s' }}
        >
          ★
        </div>
      </div>

      {/* 5. Preserved Top Navigation Bar: Return to Home Capsule */}
      <div className="fixed top-4 left-4 z-50 md:top-6 md:left-8">
        <Link
          href="/"
          className="group inline-flex items-center gap-2 rounded-full border border-white/80 bg-white/80 px-3.5 py-2 text-xs font-black tracking-wider text-sky-950 uppercase shadow-[0_6px_20px_rgba(30,58,138,0.1)] backdrop-blur-xl transition-all duration-200 hover:-translate-y-0.5 hover:bg-white active:translate-y-0 sm:px-4 sm:py-2.5 sm:text-sm"
        >
          <ChevronLeft className="h-4 w-4 text-sky-600 transition-transform group-hover:-translate-x-0.5" />
          <span>Về trang chủ</span>
        </Link>
      </div>

      {/* 6. Two-Zone Art-Directed Composition: Left = Storytelling Sanctuary, Right = Login Portal */}
      <div className="short-landscape-row relative z-10 mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-[1280px] flex-col items-center justify-center gap-6 pt-6 sm:gap-10 sm:pt-12 lg:flex-row lg:items-center lg:justify-between lg:gap-12 lg:pt-0">
        {/* ================= LEFT ZONE: MASCOT & BRAND IDENTITY ================= */}
        <div className="flex w-full flex-col items-center lg:w-[50%] lg:max-w-[540px] lg:items-start">
          <AuthBrandShowcase />
        </div>

        {/* ================= RIGHT ZONE: MAGICAL LOGIN PORTAL ================= */}
        <div className="flex w-full flex-1 items-center justify-center lg:w-[50%] lg:max-w-[450px]">
          {children}
        </div>
      </div>
    </main>
  )
}
