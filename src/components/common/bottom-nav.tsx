'use client'

import { ChevronDown } from 'lucide-react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'

import { cn } from '@/lib/utils'

const NAV_LEFT = [
  {
    href: '/',
    label: 'TẤT CẢ\nCẤP ĐỘ',
    icon: 'level-filter.337790ac.png',
    dropdown: true,
    pillClass:
      'bg-white/85 text-purple-950 border border-purple-200/80 shadow-[0_4px_12px_rgba(147,51,234,0.08)] hover:bg-white',
  },
  {
    href: '/placement-test',
    label: 'KIỂM TRA TRÌNH ĐỘ',
    icon: 'map.30295c2a.png',
    hideOnMobile: true,
    pillClass:
      'bg-gradient-to-r from-[#fb7185] to-[#f43f5e] text-white border-b-2 border-[#be123c] shadow-[0_4px_12px_rgba(244,63,94,0.25)] hover:brightness-105',
  },
  {
    href: '/notebook',
    label: 'SỔ TAY',
    icon: 'icon_target.87047c90.png',
    badge: 'MỚI',
    pillClass:
      'bg-gradient-to-r from-[#34d399] to-[#10b981] text-white border-b-2 border-[#047857] shadow-[0_4px_12px_rgba(16,185,129,0.25)] hover:brightness-105',
  },
]

const NAV_RIGHT = [
  {
    href: '#',
    label: 'KÍCH HOẠT TÀI KHOẢN',
    icon: 'icon_trophy.32089636.png',
    notification: true,
    pillClass:
      'bg-gradient-to-r from-[#60a5fa] to-[#3b82f6] text-white border-b-2 border-[#1d4ed8] shadow-[0_4px_12px_rgba(59,130,246,0.25)] hover:brightness-105',
  },
  {
    href: '#',
    label: 'THẦY CÔ/PHỤ HUYNH',
    icon: 'ic_free.7a24c735.png',
    hideOnTablet: true,
    pillClass:
      'bg-gradient-to-r from-[#818cf8] to-[#6366f1] text-white border-b-2 border-[#4338ca] shadow-[0_4px_12px_rgba(99,102,241,0.25)] hover:brightness-105',
  },
  {
    href: '#',
    label: 'Mời\nbạn bè',
    icon: 'icon_bag.b6e8d7e3.png',
    hideOnMobile: true,
    pillClass:
      'bg-white/85 text-indigo-950 border border-indigo-200/80 shadow-[0_4px_12px_rgba(99,102,241,0.08)] hover:bg-white',
  },
]

interface NavItemData {
  href: string
  label: string
  icon: string
  dropdown?: boolean
  badge?: string
  notification?: boolean
  pillClass?: string
  hideOnMobile?: boolean
  hideOnTablet?: boolean
}

const NavItem = ({ item, pathname }: { item: NavItemData; pathname: string }) => {
  const isActive = pathname === item.href
  const isLinkable = item.href !== '#'

  return (
    <Link
      key={item.href}
      href={item.href}
      onClick={(e) => {
        if (!isLinkable) {
          e.preventDefault()
        }
      }}
      className={cn(
        'group relative flex cursor-pointer items-center gap-1 rounded-full px-2 py-1 transition-all duration-200 select-none sm:gap-1.5 sm:px-3 sm:py-1.5 md:gap-2 md:px-4',
        item.hideOnMobile && 'hidden sm:flex',
        item.hideOnTablet && 'hidden lg:flex',
        item.pillClass,
        isActive
          ? 'shadow-md ring-2 ring-amber-400'
          : 'hover:-translate-y-0.5 active:translate-y-0',
        !isLinkable && 'opacity-90 hover:opacity-100',
      )}
    >
      <div className="relative flex h-6 w-6 shrink-0 items-center justify-center sm:h-8 sm:w-8 md:h-9 md:w-9">
        <img
          src={`/clone-assets/media/${item.icon}`}
          alt={item.label}
          className="relative z-10 h-full w-full object-contain drop-shadow-[0_2px_4px_rgba(0,0,0,0.15)] transition-all duration-200 group-hover:scale-110"
          onError={(e) => {
            ;(e.target as HTMLImageElement).src =
              'https://api.dicebear.com/7.x/shapes/svg?seed=' + item.label
          }}
        />
        {item.notification && (
          <div className="absolute top-0 right-0 z-20 flex h-3 w-3 animate-pulse items-center justify-center rounded-full border border-white bg-rose-500 shadow-xs sm:h-3.5 sm:w-3.5">
            <span className="text-[7px] leading-none font-black text-white sm:text-[8px]">!</span>
          </div>
        )}
        {item.badge && (
          <div className="py-0.2 absolute -top-1.5 -right-3 z-20 rotate-12 transform rounded-full border border-white/60 bg-emerald-500 px-1 text-[6.5px] font-black tracking-wider text-white uppercase shadow-xs sm:-top-2 sm:-right-4 sm:px-1.5 sm:text-[7.5px]">
            {item.badge}
          </div>
        )}
      </div>
      <div className="flex items-center gap-0.5">
        <span className="text-center text-[8px] leading-tight font-black tracking-wider whitespace-pre-line uppercase sm:text-[9px] md:text-left md:text-[10px]">
          {item.label}
        </span>
        {item.dropdown && (
          <ChevronDown className="mt-0.5 h-2.5 w-2.5 shrink-0 self-center opacity-70 group-hover:opacity-100 sm:h-3 sm:w-3" />
        )}
      </div>
    </Link>
  )
}

export function BottomNav() {
  const pathname = usePathname()
  const router = useRouter()

  return (
    <div className="relative z-50 flex w-full justify-center px-2 pb-2 select-none sm:px-4 sm:pb-3 md:pb-5">
      <div className="relative flex w-full max-w-6xl justify-center">
        {/* Floating Cloud Dock Bar */}
        <div className="relative flex h-[58px] w-full max-w-5xl items-center justify-between px-1.5 sm:h-[72px] sm:px-3 md:h-[80px] md:px-6">
          {/* Authentic Pure Vector Organic Cloud Dock Background - Enlarged & Puffy */}
          <div className="pointer-events-none absolute -inset-x-3 -top-6 -bottom-3 -z-10 sm:-inset-x-6 sm:-top-9 sm:-bottom-4 md:-inset-x-8 md:-top-11 md:-bottom-5">
            <svg
              viewBox="0 0 1024 135"
              className="h-full w-full overflow-visible drop-shadow-[0_12px_28px_rgba(30,58,138,0.12)]"
              preserveAspectRatio="none"
              fill="none"
            >
              <defs>
                <linearGradient id="cloud-dock-gradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ffffff" stopOpacity="0.99" />
                  <stop offset="45%" stopColor="#ffffff" stopOpacity="0.97" />
                  <stop offset="100%" stopColor="#f3f6fc" stopOpacity="0.95" />
                </linearGradient>
                <linearGradient id="cloud-dock-back" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f8faff" stopOpacity="0.85" />
                  <stop offset="100%" stopColor="#e8effc" stopOpacity="0.7" />
                </linearGradient>
              </defs>
              {/* Secondary Back Cloud Layer for 3D Volume & Loft */}
              <path
                d="M 30 55 C 50 18 90 18 115 48 C 140 15 185 15 210 48 C 235 12 280 12 305 48 C 330 18 375 18 400 48 C 430 8 480 8 512 35 C 544 8 594 8 624 48 C 649 18 694 18 719 48 C 744 12 789 12 814 48 C 839 15 884 15 909 48 C 934 18 974 18 994 55 C 1018 62 1024 85 1024 135 L 0 135 C 0 85 6 62 30 55 Z"
                fill="url(#cloud-dock-back)"
                opacity="0.75"
              />
              {/* Primary Foreground Puffy Cloud Dock */}
              <path
                d="M 35 60 C 55 25 95 25 120 56 C 145 22 190 22 215 56 C 240 18 285 18 310 56 C 335 24 375 24 400 56 C 428 15 475 15 500 48 C 512 38 528 38 540 48 C 565 15 612 15 640 56 C 665 24 705 24 730 56 C 755 18 800 18 825 56 C 850 22 895 22 920 56 C 945 25 985 25 1005 60 C 1020 70 1024 95 1024 135 L 0 135 C 0 95 4 70 35 60 Z"
                fill="url(#cloud-dock-gradient)"
                stroke="rgba(255,255,255,0.98)"
                strokeWidth="2"
              />
            </svg>
          </div>

          {/* Left Nav Tabs */}
          <div className="flex flex-1 items-center justify-start gap-1 sm:gap-1.5 md:gap-2">
            {NAV_LEFT.map((item) => (
              <NavItem key={item.label} item={item} pathname={pathname} />
            ))}
          </div>

          {/* Center Interactive Hub: Chat FAB + Mascot + Call FAB */}
          <div className="relative mx-1 -mt-6 flex shrink-0 items-center justify-center gap-1 sm:mx-2 sm:-mt-8 sm:gap-1.5 md:mx-4 md:-mt-10 md:gap-2.5">
            {/* Chat FAB (left of mascot) */}
            <button
              onClick={() => window.open('https://zalo.me', '_blank')}
              aria-label="Chat hỗ trợ"
              className="flex h-7 w-7 -translate-y-1.5 cursor-pointer items-center justify-center rounded-full border-2 border-amber-300 bg-gradient-to-b from-[#f59e0b] to-[#d97706] shadow-[0_4px_12px_rgba(217,119,6,0.35)] transition-all duration-200 hover:scale-110 active:scale-95 sm:h-9 sm:w-9 sm:-translate-y-2 md:h-10 md:w-10"
            >
              <img
                src="/clone-assets/media/icon-chat.fa14d2f7.png"
                alt="Chat"
                className="h-full w-full object-contain p-0.5 sm:p-1"
              />
            </button>

            {/* Center Mascot Button with 3D Levitation */}
            <div className="group relative cursor-pointer" onClick={() => router.push('/')}>
              <div className="relative h-15 w-15 transform animate-[float-slow_4s_ease-in-out_infinite] transition-all duration-300 group-hover:-translate-y-1.5 group-hover:scale-110 group-active:scale-95 sm:h-20 sm:w-20 md:h-24 md:w-24">
                {/* Soft radiant glow halo behind mascot */}
                <div className="pointer-events-none absolute -inset-2 -top-4 h-18 w-18 rounded-full bg-gradient-to-t from-pink-400/40 via-purple-300/35 to-amber-200/45 opacity-85 blur-xl transition-opacity group-hover:opacity-100 sm:-inset-3 sm:-top-5 sm:h-24 sm:w-24 sm:blur-2xl md:-inset-5 md:-top-7 md:h-32 md:w-32" />
                {/* Official Baby Lion Mascot */}
                <img
                  src="/clone-assets/mascot/mascot_standing_front.png"
                  alt="Luyện Thi Ảo Mascot"
                  className="relative z-10 h-full w-full object-contain drop-shadow-[0_8px_16px_rgba(0,0,0,0.28)] filter"
                  onError={(e) => {
                    ;(e.target as HTMLImageElement).src =
                      '/clone-assets/media/ic-challenge.9b2229cb.png'
                  }}
                />
                {/* Luyện Thi Ảo text banner below mascot */}
                <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 -rotate-2 transform rounded-full border border-white bg-gradient-to-r from-purple-500 via-pink-500 to-rose-500 px-1.5 py-0.2 text-[7.5px] font-black tracking-wider whitespace-nowrap text-white uppercase italic shadow-md select-none sm:-bottom-3 sm:border-2 sm:px-2.5 sm:py-0.5 sm:text-[9px] sm:tracking-widest md:-bottom-3.5 md:px-3.5 md:text-xs">
                  LUYỆN THI ẢO
                </div>
              </div>
            </div>

            {/* Call FAB (right of mascot) */}
            <a
              href="tel:19001234"
              aria-label="Hotline tư vấn"
              className="flex h-7 w-7 -translate-y-1.5 cursor-pointer items-center justify-center rounded-full border-2 border-sky-300 bg-gradient-to-b from-[#38bdf8] to-[#0284c7] shadow-[0_4px_12px_rgba(2,132,199,0.35)] transition-all duration-200 hover:scale-110 active:scale-95 sm:h-9 sm:w-9 sm:-translate-y-2 md:h-10 md:w-10"
            >
              <img
                src="/clone-assets/media/icon-call.c4ff351b.png"
                alt="Call Hotline"
                className="h-full w-full object-contain p-0.5 sm:p-1"
              />
            </a>
          </div>

          {/* Right Nav Tabs */}
          <div className="flex flex-1 items-center justify-end gap-1.5 md:gap-2">
            {NAV_RIGHT.map((item) => (
              <NavItem key={item.label} item={item} pathname={pathname} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
