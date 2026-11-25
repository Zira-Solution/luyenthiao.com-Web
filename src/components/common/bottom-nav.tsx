'use client'

import { ChevronDown } from 'lucide-react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'

import { cn } from '@/lib/utils'

interface NavItemData {
  href: string
  labelLine1: string
  labelLine2?: string
  icon: string
  dropdown?: boolean
  badge?: string
  notification?: boolean
  palette: {
    bg: string
    border: string
    text: string
    shadow: string
    activeBorder: string
  }
  hideOnMobile?: boolean
  hideOnTablet?: boolean
}

const NAV_ITEMS_LEFT: NavItemData[] = [
  {
    href: '/',
    labelLine1: 'TẤT CẢ',
    labelLine2: 'CẤP ĐỘ',
    icon: 'level-filter.337790ac.webp',
    dropdown: true,
    palette: {
      bg: 'bg-gradient-to-b from-[#fffef7] via-[#fffbeb] to-[#fef3c7]',
      border: 'border-t-white border-x-[#fde68a]/80 border-b-[#d97706]',
      text: 'text-[#92400e]',
      shadow: 'shadow-[0_2px_6px_rgba(217,119,6,0.16)]',
      activeBorder: 'ring-2 ring-amber-400',
    },
  },
  {
    href: '/placement-test',
    labelLine1: 'KIỂM TRA',
    labelLine2: 'TRÌNH ĐỘ',
    icon: 'map.30295c2a.webp',
    hideOnTablet: true,
    palette: {
      bg: 'bg-gradient-to-b from-[#fff1f2] via-[#ffe4e6] to-[#fecdd3]',
      border: 'border-t-white border-x-[#fecdd3]/80 border-b-[#e11d48]',
      text: 'text-[#be123c]',
      shadow: 'shadow-[0_2px_6px_rgba(225,29,72,0.16)]',
      activeBorder: 'ring-2 ring-rose-400',
    },
  },
  {
    href: '/notebook',
    labelLine1: 'SỔ TAY',
    icon: 'icon_target.87047c90.webp',
    badge: 'MỚI',
    hideOnMobile: true,
    palette: {
      bg: 'bg-gradient-to-b from-[#f0fdf4] via-[#dcfce7] to-[#bbf7d0]',
      border: 'border-t-white border-x-[#bbf7d0]/80 border-b-[#059669]',
      text: 'text-[#065f46]',
      shadow: 'shadow-[0_2px_6px_rgba(5,150,105,0.16)]',
      activeBorder: 'ring-2 ring-emerald-400',
    },
  },
]

const NAV_ITEMS_RIGHT: NavItemData[] = [
  {
    href: '#',
    labelLine1: 'KÍCH HOẠT',
    labelLine2: 'TÀI KHOẢN',
    icon: 'icon_trophy.32089636.webp',
    notification: true,
    palette: {
      bg: 'bg-gradient-to-b from-[#f0f9ff] via-[#e0f2fe] to-[#bae6fd]',
      border: 'border-t-white border-x-[#bae6fd]/80 border-b-[#0284c7]',
      text: 'text-[#0369a1]',
      shadow: 'shadow-[0_2px_6px_rgba(225,29,72,0.16)]',
      activeBorder: 'ring-2 ring-sky-400',
    },
  },
  {
    href: '#',
    labelLine1: 'THẦY CÔ',
    labelLine2: 'PHỤ HUYNH',
    icon: 'ic_free.7a24c735.webp',
    hideOnTablet: true,
    palette: {
      bg: 'bg-gradient-to-b from-[#f5f3ff] via-[#ede9fe] to-[#ddd6fe]',
      border: 'border-t-white border-x-[#ddd6fe]/80 border-b-[#7c3aed]',
      text: 'text-[#6d28d9]',
      shadow: 'shadow-[0_2px_6px_rgba(124,58,237,0.16)]',
      activeBorder: 'ring-2 ring-purple-400',
    },
  },
  {
    href: '#',
    labelLine1: 'MỜI',
    labelLine2: 'BẠN BÈ',
    icon: 'icon_bag.b6e8d7e3.webp',
    hideOnMobile: true,
    palette: {
      bg: 'bg-gradient-to-b from-[#fffbf5] via-[#fef7ee] to-[#ffedd5]',
      border: 'border-t-white border-x-[#fed7aa]/80 border-b-[#ea580c]',
      text: 'text-[#9a3412]',
      shadow: 'shadow-[0_2px_6px_rgba(234,88,12,0.16)]',
      activeBorder: 'ring-2 ring-orange-400',
    },
  },
]

const NavButton = ({ item, pathname }: { item: NavItemData; pathname: string }) => {
  const isActive = pathname === item.href
  const isLinkable = item.href !== '#'

  return (
    <Link
      href={item.href}
      onClick={(e) => {
        if (!isLinkable) {
          e.preventDefault()
        }
      }}
      className={cn(
        // Base structure & standardization
        'group relative inline-flex shrink-0 cursor-pointer items-center justify-center select-none',
        'h-8 sm:h-9 md:h-10 lg:h-10.5 xl:h-11',
        'gap-1 sm:gap-1.5 md:gap-2',
        'rounded-xl sm:rounded-full',
        'px-2 sm:px-2.5 md:px-3 lg:px-3.5 xl:px-4',
        'border-x border-t border-b-[2.5px] transition-all duration-200',
        'hover:-translate-y-0.5 hover:shadow-md hover:brightness-[1.03] active:translate-y-[1px] active:border-b active:brightness-95',
        item.palette.bg,
        item.palette.border,
        item.palette.shadow,
        item.palette.text,
        item.hideOnMobile && 'hidden sm:inline-flex',
        item.hideOnTablet && 'hidden xl:inline-flex',
        isActive && item.palette.activeBorder,
        !isLinkable && 'opacity-95 hover:opacity-100',
      )}
    >
      {/* Glossy top reflection highlight */}
      <div className="pointer-events-none absolute inset-x-2 top-0.5 h-[35%] rounded-full bg-gradient-to-b from-white/60 to-transparent" />

      {/* Standardized Icon Container */}
      <div className="relative flex h-4.5 w-4.5 shrink-0 items-center justify-center sm:h-5.5 sm:w-5.5 md:h-6 md:w-6 lg:h-7 lg:w-7">
        <img
          src={`/clone-assets/media/${item.icon}`}
          alt={item.labelLine1}
          className="relative z-10 h-full w-full object-contain drop-shadow-[0_1.5px_3px_rgba(0,0,0,0.12)] transition-transform duration-200 group-hover:scale-105"
          onError={(e) => {
            ;(e.target as HTMLImageElement).src =
              'https://api.dicebear.com/7.x/shapes/svg?seed=' + item.labelLine1
          }}
        />

        {/* Red Alert Notification Badge */}
        {item.notification && (
          <span className="absolute -top-1 -right-1 z-20 flex h-3 w-3 items-center justify-center rounded-full border border-white bg-rose-500 shadow-xs sm:h-3.5 sm:w-3.5">
            <span className="text-[6.5px] leading-none font-black text-white sm:text-[7.5px]">
              !
            </span>
          </span>
        )}

        {/* 'MỚI' Emerald Badge */}
        {item.badge && (
          <span className="py-0.2 absolute -top-1 -right-2 z-20 rounded-full border border-white/80 bg-emerald-500 px-1 text-[6px] font-black tracking-wider text-white uppercase shadow-xs sm:-top-1.5 sm:-right-2.5 sm:text-[7px]">
            {item.badge}
          </span>
        )}
      </div>

      {/* Strictly 1 or 2 Line Standardized Label with whitespace-nowrap */}
      <div className="flex items-center gap-0.5">
        <div className="flex flex-col justify-center text-left leading-[1.05] whitespace-nowrap">
          <span className="text-[7.5px] font-black tracking-wide whitespace-nowrap uppercase sm:text-[9px] md:text-[10px] lg:text-[10.5px]">
            {item.labelLine1}
          </span>
          {item.labelLine2 && (
            <span className="text-[7.5px] font-black tracking-wide whitespace-nowrap uppercase opacity-95 sm:text-[9px] md:text-[10px] lg:text-[10.5px]">
              {item.labelLine2}
            </span>
          )}
        </div>
        {item.dropdown && (
          <ChevronDown className="h-2.5 w-2.5 shrink-0 opacity-70 transition-opacity group-hover:opacity-100 sm:h-3 sm:w-3" />
        )}
      </div>
    </Link>
  )
}

export function BottomNav() {
  const pathname = usePathname()
  const router = useRouter()

  return (
    <div className="relative z-50 flex w-full justify-center px-2 pb-[max(0.75rem,calc(env(safe-area-inset-bottom)+8px))] select-none sm:px-4 sm:pb-3 md:pb-4">
      <div className="relative flex w-full max-w-fit items-center justify-center">
        {/* Soft Ambient Sky Glow beneath the Dock */}
        <div className="pointer-events-none absolute -inset-x-3 top-2 -bottom-2 -z-20 rounded-full bg-sky-200/25 blur-xl" />

        {/* Premium Floating Game Dock Bar — Mathematically Symmetrical 3-Column Grid */}
        <div
          className={cn(
            'relative grid grid-cols-[1fr_auto_1fr] items-center',
            'h-[52px] sm:h-[62px] md:h-[68px] lg:h-[72px]',
            'px-2 sm:px-3.5 md:px-5 lg:px-5 xl:px-6 2xl:px-7',
            'gap-1.5 sm:gap-2 md:gap-2.5 lg:gap-3',
            'rounded-2xl sm:rounded-3xl lg:rounded-full',
            // Surface & subtle 3D depth
            'bg-gradient-to-b from-white/96 via-[#fcfdff]/94 to-[#edf3ff]/92',
            'backdrop-blur-xl',
            'border-x border-t border-b-[2.5px] border-[#cddbf2]/80 border-white/70 border-white/95',
            'shadow-[0_12px_36px_rgba(28,45,100,0.12),0_2px_8px_rgba(0,0,0,0.03),inset_0_1.5px_1px_rgba(255,255,255,0.95)]',
          )}
        >
          {/* Left Wing: 3 Action Buttons + Chat FAB (Aligned to Center Mascot) */}
          <div className="flex items-center justify-end gap-1.5 sm:gap-2.5 md:gap-3 lg:gap-3.5 xl:gap-5 2xl:gap-6">
            {NAV_ITEMS_LEFT.map((item) => (
              <NavButton key={item.labelLine1} item={item} pathname={pathname} />
            ))}

            {/* Left Companion: Chat FAB */}
            <button
              onClick={() => window.open('https://zalo.me', '_blank')}
              aria-label="Chat hỗ trợ"
              className={cn(
                'group/chat relative flex h-6.5 w-6.5 shrink-0 cursor-pointer items-center justify-center rounded-full sm:h-7.5 sm:w-7.5 md:h-8.5 md:w-8.5 lg:h-9 lg:w-9',
                'border-x border-t border-b-[2px] border-[#d97706] border-amber-200/80 border-white/90',
                'bg-gradient-to-b from-[#fffbeb] via-[#fef3c7] to-[#fde68a]',
                'shadow-[0_3px_10px_rgba(217,119,6,0.22)]',
                'transition-all duration-150 hover:-translate-y-0.5 hover:shadow-md hover:brightness-105 active:translate-y-[1px]',
              )}
            >
              <div className="pointer-events-none absolute inset-x-1 top-0.5 h-[35%] rounded-full bg-gradient-to-b from-white/70 to-transparent" />
              <img
                src="/clone-assets/media/icon-chat.fa14d2f7.webp"
                alt="Chat"
                className="h-4 w-4 object-contain drop-shadow-[0_1px_2px_rgba(0,0,0,0.15)] transition-transform group-hover/chat:scale-110 sm:h-4.5 sm:w-4.5 md:h-5 md:w-5 lg:h-5.5 lg:w-5.5"
              />
            </button>
          </div>

          {/* Center Slot: Elevated Baby Lion Mascot (Guaranteed 50% Horizontal Center) */}
          <div className="flex items-center justify-center px-1 sm:px-1.5">
            <div
              className="group/mascot relative -mt-5 shrink-0 cursor-pointer sm:-mt-7 md:-mt-8 lg:-mt-9"
              onClick={() => router.push('/')}
            >
              {/* Elevated circular cradle / podium disc */}
              <div className="pointer-events-none absolute -inset-1 -z-10 rounded-full border border-white/90 bg-gradient-to-b from-white/90 via-[#f0f5ff]/70 to-[#dce8fd]/80 shadow-[0_6px_20px_rgba(30,58,138,0.12)] sm:-inset-1.5" />

              {/* Lion Character Container */}
              <div className="relative h-14 w-14 transition-transform duration-200 group-hover/mascot:scale-105 group-active/mascot:scale-95 sm:h-18 sm:w-18 md:h-22 md:w-22 lg:h-24 lg:w-24">
                {/* Contact shadow beneath paws */}
                <div className="pointer-events-none absolute bottom-1 left-1/2 -z-0 h-1.5 w-3/4 -translate-x-1/2 rounded-full bg-slate-900/15 blur-[2px] sm:h-2" />

                {/* Baby Lion Mascot */}
                <img
                  src="/clone-assets/mascot/mascot_standing_front.webp"
                  alt="Luyện Thi Ảo Mascot"
                  className="relative z-10 h-full w-full object-contain drop-shadow-[0_8px_16px_rgba(0,0,0,0.2)]"
                  onError={(e) => {
                    ;(e.target as HTMLImageElement).src =
                      '/clone-assets/media/ic-challenge.9b2229cb.webp'
                  }}
                />

                {/* 'LUYỆN THI ẢO' 3D Level Badge */}
                <div
                  className={cn(
                    'absolute -bottom-1.5 left-1/2 z-20 -translate-x-1/2 sm:-bottom-2 md:-bottom-2.5 lg:-bottom-3',
                    'rounded-full px-2 py-0.5 sm:px-2.5 sm:py-0.5 md:px-3 md:py-0.5 lg:px-3.5 lg:py-1',
                    'border border-b-2 border-purple-800 border-x-purple-400 border-t-white',
                    'bg-gradient-to-r from-[#6d28d9] via-[#7c3aed] to-[#8b5cf6]',
                    'text-[7.5px] font-black tracking-wider whitespace-nowrap text-white uppercase sm:text-[8.5px] md:text-[9.5px] lg:text-[10.5px]',
                    'shadow-[0_3px_10px_rgba(109,40,217,0.35)]',
                  )}
                >
                  LUYỆN THI ẢO
                </div>
              </div>
            </div>
          </div>

          {/* Right Wing: Call FAB + 3 Action Buttons (Aligned to Center Mascot) */}
          <div className="flex items-center justify-start gap-1.5 sm:gap-2.5 md:gap-3 lg:gap-3.5 xl:gap-5 2xl:gap-6">
            {/* Right Companion: Call FAB */}
            <a
              href="tel:19001234"
              aria-label="Hotline tư vấn"
              className={cn(
                'group/call relative flex h-6.5 w-6.5 shrink-0 cursor-pointer items-center justify-center rounded-full sm:h-7.5 sm:w-7.5 md:h-8.5 md:w-8.5 lg:h-9 lg:w-9',
                'border-t border-b-[2px] border-[#0284c7] border-white/90 border-x-sky-200/80',
                'bg-gradient-to-b from-[#f0f9ff] via-[#e0f2fe] to-[#bae6fd]',
                'shadow-[0_3px_10px_rgba(2,132,199,0.22)]',
                'transition-all duration-150 hover:-translate-y-0.5 hover:shadow-md hover:brightness-105 active:translate-y-[1px]',
              )}
            >
              <div className="pointer-events-none absolute inset-x-1 top-0.5 h-[35%] rounded-full bg-gradient-to-b from-white/70 to-transparent" />
              <img
                src="/clone-assets/media/icon-call.c4ff351b.webp"
                alt="Call Hotline"
                className="h-4 w-4 object-contain drop-shadow-[0_1px_2px_rgba(0,0,0,0.15)] transition-transform group-hover/call:scale-110 sm:h-4.5 sm:w-4.5 md:h-5 md:w-5 lg:h-5.5 lg:w-5.5"
              />
            </a>

            {NAV_ITEMS_RIGHT.map((item) => (
              <NavButton key={item.labelLine1} item={item} pathname={pathname} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
