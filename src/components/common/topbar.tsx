'use client'

import { ChevronDown, Plus } from 'lucide-react'
import { useRouter, usePathname } from 'next/navigation'
import { useState } from 'react'

import { UnreadBadge } from '@/components/common/unread-badge'
import { DEMO_SPEAKING_TEST_PATH, DEMO_WRITE_TEST_PATH } from '@/constants'
import { useLogout } from '@/hooks'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/store/auth-store'

/**
 * HalfOutNavButton
 * Precision 3D Game Navigation Button with 40-50% half-out icon protrusion.
 * Matches Flyer fantasy-game visual language: soft capsule silhouette, glossy highlight,
 * 3D tactile bottom border, and unclipped protruding icon.
 */
interface HalfOutNavButtonProps {
  iconSrc: string
  alt: string
  label: string
  variant?: 'white' | 'purple' | 'orange'
  badgeText?: string
  hasDropdown?: boolean
  onClick?: () => void
  isActive?: boolean
  className?: string
  iconSizeClass?: string
  children?: React.ReactNode
  fallbackSeed?: string
}

function HalfOutNavButton({
  iconSrc,
  alt,
  label,
  variant = 'white',
  badgeText,
  hasDropdown = false,
  onClick,
  isActive = false,
  className,
  iconSizeClass = 'h-[28px] w-[28px] sm:h-[30px] sm:w-[30px] md:h-[33px] md:w-[33px]',
  children,
  fallbackSeed = 'game',
}: HalfOutNavButtonProps) {
  const innerFaceStyles = {
    white:
      'bg-gradient-to-b from-white via-[#fbfdff] to-[#edf4fc] border border-sky-100/70 text-[#1e3a8a] shadow-[inset_0_1px_1px_rgba(255,255,255,0.9)] hover:to-[#e2eefb]',
    purple:
      'bg-gradient-to-b from-[#a855f7] via-[#9333ea] to-[#7e22ce] text-white shadow-[inset_0_1px_1px_rgba(255,255,255,0.4)] border-t border-purple-300/50 hover:brightness-105',
    orange:
      'bg-gradient-to-b from-[#fb923c] via-[#f97316] to-[#ea580c] text-white shadow-[inset_0_1px_1px_rgba(255,255,255,0.4)] border-t border-orange-300/50 hover:brightness-105',
  }[variant]

  return (
    <button
      onClick={onClick}
      className={cn(
        'group relative flex h-[44px] min-w-[58px] shrink-0 cursor-pointer flex-col items-center justify-end rounded-[16px] border-t-2 border-b-[3px] border-[#60a5fa] border-white bg-gradient-to-b from-white to-[#f0f7ff] p-[2.5px] shadow-[0_4px_12px_rgba(37,99,235,0.16)] transition-all duration-200 select-none hover:-translate-y-0.5 hover:shadow-[0_6px_16px_rgba(37,99,235,0.22)] active:translate-y-[2px] active:border-b-2 sm:h-[46px] sm:min-w-[64px] sm:rounded-[18px] sm:p-[2.5px] md:h-[48px] md:min-w-[68px] md:rounded-[20px] md:border-b-[3.5px] md:p-[3px]',
        isActive && 'ring-2 ring-amber-400',
        className,
      )}
    >
      {/* Delicate floating badge pinned to the upper-left of the outer white casing */}
      {badgeText && (
        <span className="absolute -top-1.5 -left-1.5 z-20 -rotate-6 transform rounded-full bg-[#10b981] px-1.5 py-0.5 text-[7px] font-black tracking-wider text-white uppercase shadow-xs sm:text-[7.5px] md:text-[8px]">
          {badgeText}
        </span>
      )}

      {/* 3D Icon with 35-45% protrusion above top edge */}
      <div className="pointer-events-none absolute -top-[10px] left-1/2 z-10 flex -translate-x-1/2 items-center justify-center sm:-top-[11px] md:-top-[12px]">
        <img
          src={iconSrc}
          alt={alt}
          className={cn(
            'object-contain drop-shadow-[0_3px_5px_rgba(0,0,0,0.16)] filter transition-transform duration-200 group-hover:scale-105',
            iconSizeClass,
          )}
          onError={(e) => {
            ;(e.target as HTMLImageElement).src =
              `https://api.dicebear.com/7.x/bottts/svg?seed=${fallbackSeed}`
          }}
        />
        {children}
      </div>

      {/* Recessed Inner Button Face */}
      <div
        className={cn(
          'flex h-full w-full flex-col items-center justify-end rounded-[13px] px-1.5 pb-1 transition-colors sm:rounded-[15px] sm:pb-1.5 md:rounded-[17px]',
          innerFaceStyles,
        )}
      >
        <div className="flex items-center justify-center gap-0.5">
          <span
            className={cn(
              'font-heading text-[8.5px] font-black tracking-wider uppercase select-none sm:text-[9.5px] md:text-[10px]',
              variant === 'white'
                ? 'text-[#1e3a8a]'
                : 'text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.4)]',
            )}
          >
            {label}
          </span>
          {hasDropdown && (
            <ChevronDown
              className={cn(
                'h-2.5 w-2.5 shrink-0 stroke-[3] sm:h-3 sm:w-3',
                variant === 'white' ? 'text-sky-500' : 'text-white/90',
              )}
            />
          )}
        </div>
      </div>
    </button>
  )
}

export function Topbar() {
  const router = useRouter()
  const pathname = usePathname()
  const status = useAuthStore((state) => state.status)
  const user = useAuthStore((state) => state.user)
  const logout = useLogout()
  const [menuOpen, setMenuOpen] = useState(false)

  const handleRanking = () => {
    router.push('/ranking')
  }

  return (
    <header className="absolute top-0 left-0 z-50 w-full overflow-visible px-2 pt-4 pb-2 select-none sm:px-3 sm:pt-5 md:px-5 md:pt-6 lg:px-6">
      {/* 2 Balanced Floating Navigation Groups with Visually Open Center Sky */}
      <div className="flex w-full items-start justify-between">
        {/* ================= LEFT SECTION: ACTIVITIES GROUP ================= */}
        <div className="no-scrollbar flex max-w-[48vw] shrink-0 items-end gap-1.5 overflow-x-auto pt-4 pb-1 sm:max-w-none sm:gap-2 md:gap-2.5">
          {/* 1. Thách Đấu (Purple Active) */}
          <HalfOutNavButton
            iconSrc="/clone-assets/media/ic-challenge.9b2229cb.png"
            alt="Thách đấu"
            label="Thách đấu"
            variant="purple"
            fallbackSeed="challenge"
          />

          {/* 2. Writing (Reference Benchmark) */}
          <HalfOutNavButton
            iconSrc="/clone-assets/media/ic-writing.9b3fd4e6.png"
            alt="Writing"
            label="Writing"
            variant="white"
            badgeText="MỚI"
            hasDropdown
            fallbackSeed="writing"
            onClick={() => router.push(DEMO_WRITE_TEST_PATH)}
          />

          {/* 3. Speaking */}
          <HalfOutNavButton
            iconSrc="/clone-assets/media/ic-speaking.3f0031fd.png"
            alt="Speaking"
            label="Speaking"
            variant="white"
            hasDropdown
            fallbackSeed="speaking"
            onClick={() => router.push(DEMO_SPEAKING_TEST_PATH)}
          />

          {/* 4. Vocabulary */}
          <HalfOutNavButton
            iconSrc="/clone-assets/media/ic-vocab.1dd303ec.png"
            alt="Vocabulary"
            label="Vocabulary"
            variant="white"
            hasDropdown
            fallbackSeed="vocab"
            className="min-w-[64px] sm:min-w-[68px] md:min-w-[72px]"
          />

          {/* 5. Luyện Tập (Orange Active) */}
          <HalfOutNavButton
            iconSrc="/clone-assets/media/ic-practice.png"
            alt="Luyện tập"
            label="Luyện tập"
            variant="orange"
            badgeText="MỚI"
            fallbackSeed="practice"
          />

          {/* 6. Coin Counter Capsule (Tactile resource capsule, NOT half-out) */}
          <div className="flex h-[42px] min-w-[72px] shrink-0 items-center gap-1.5 rounded-2xl border-t border-b-[3px] border-[#eab308] border-white bg-gradient-to-b from-[#fffbeb] to-[#fef08a] px-2 shadow-[0_4px_12px_rgba(234,179,8,0.18)] sm:h-[46px] sm:min-w-[80px] sm:gap-2 sm:px-2.5 md:h-[48px] md:min-w-[86px]">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-yellow-300 bg-amber-400 text-xs font-black text-amber-950 shadow-xs sm:h-7 sm:w-7">
              C
            </div>
            <div className="flex flex-col">
              <span className="text-[7px] font-extrabold tracking-wider text-amber-800 uppercase sm:text-[8px]">
                COIN
              </span>
              <span className="-mt-1 text-xs font-black text-amber-950 sm:text-sm">0</span>
            </div>
          </div>
        </div>

        {/* ================= RIGHT SECTION: UTILITY CONTROLS GROUP ================= */}
        <div className="no-scrollbar flex max-w-[48vw] shrink-0 items-end justify-end gap-1.5 overflow-x-auto pt-4 pb-1 sm:max-w-none sm:gap-2 md:gap-2.5">
          {/* 1. Diamond Counter Capsule (Tactile resource capsule, NOT half-out) */}
          <div className="flex h-[42px] min-w-[80px] shrink-0 items-center gap-1.5 rounded-2xl border-t border-b-[3px] border-[#7dd3fc] border-white bg-gradient-to-b from-white to-[#f0f9ff] px-2 shadow-[0_4px_12px_rgba(2,132,199,0.15)] sm:h-[46px] sm:min-w-[90px] sm:gap-2 sm:px-2.5 md:h-[48px] md:min-w-[100px]">
            <div className="h-4.5 w-4.5 shrink-0 sm:h-5.5 sm:w-5.5">
              <img
                src="/clone-assets/media/icon-diamonds.580d8a36.png"
                alt="Kim Cương"
                className="h-full w-full object-contain"
                onError={(e) => {
                  ;(e.target as HTMLImageElement).src =
                    'https://api.dicebear.com/7.x/bottts/svg?seed=diamond'
                }}
              />
            </div>
            <div className="flex flex-1 flex-col">
              <span className="text-[6.5px] font-extrabold tracking-wider text-sky-800 uppercase sm:text-[7.5px]">
                KIM CƯƠNG
              </span>
              <span className="-mt-1 text-xs font-black text-sky-950 sm:text-sm">0</span>
            </div>
            <button
              aria-label="Thêm kim cương"
              className="flex h-4 w-4 cursor-pointer items-center justify-center rounded-md border-b-2 border-emerald-600 bg-emerald-500 text-[10px] font-black text-white shadow-xs transition-transform hover:bg-emerald-400 active:scale-95 sm:h-4.5 sm:w-4.5"
            >
              <Plus className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
            </button>
          </div>

          {/* 2. Xếp Hạng */}
          <HalfOutNavButton
            iconSrc="/clone-assets/media/icon_trophy.32089636.png"
            alt="Xếp hạng"
            label="Xếp hạng"
            variant="white"
            fallbackSeed="trophy"
            isActive={pathname === '/ranking'}
            onClick={handleRanking}
          />

          {/* 3. Lịch Sử (Hidden on small mobile) */}
          <HalfOutNavButton
            iconSrc="/clone-assets/media/ic-history.png"
            alt="Lịch sử"
            label="Lịch sử"
            variant="white"
            fallbackSeed="history"
            isActive={pathname === '/history'}
            onClick={() => router.push('/history')}
            className="hidden sm:flex"
          />

          {/* 4. Trường Của Tôi (Hidden on mobile / tablet portrait) */}
          <HalfOutNavButton
            iconSrc="/clone-assets/media/ic-school.png"
            alt="Trường của tôi"
            label="Trường của tôi"
            variant="white"
            fallbackSeed="school"
            isActive={pathname === '/school-ranking'}
            onClick={() => router.push('/school-ranking')}
            className="hidden min-w-[66px] px-2 sm:min-w-[70px] md:min-w-[76px] lg:flex"
          />

          {/* 5. Nhiệm Vụ (Hidden on small mobile) */}
          <HalfOutNavButton
            iconSrc="/clone-assets/media/ic-task.png"
            alt="Nhiệm vụ"
            label="Nhiệm vụ"
            variant="white"
            fallbackSeed="task"
            isActive={pathname === '/tasks'}
            onClick={() => router.push('/tasks')}
            className="hidden md:flex"
          />

          {/* 6. Thông Báo (With unread count badge) */}
          <HalfOutNavButton
            iconSrc="/clone-assets/media/ic_bell.19fd4917.png"
            alt="Thông báo"
            label="Thông báo"
            variant="white"
            fallbackSeed="bell"
            isActive={pathname === '/notifications'}
            onClick={() => router.push('/notifications')}
          >
            <UnreadBadge />
          </HalfOutNavButton>

          {/* 7. Authenticated User Profile Menu */}
          {status === 'authenticated' && user && (
            <div className="relative">
              <button
                onClick={() => setMenuOpen((open) => !open)}
                className="flex h-[38px] cursor-pointer items-center gap-1.5 rounded-full border-t border-b-[2.5px] border-[#93c5fd] border-white bg-gradient-to-b from-white via-[#f0f9ff] to-[#e0f2fe] px-2.5 shadow-sm backdrop-blur-md transition-all hover:bg-white sm:h-[42px] sm:px-3"
              >
                <span className="text-[9.5px] font-black tracking-wide text-sky-950 uppercase sm:text-xs">
                  {user.role}
                </span>
                <ChevronDown className="h-3 w-3 text-sky-600 sm:h-3.5 sm:w-3.5" />
              </button>

              {menuOpen && (
                <div className="absolute top-full right-0 z-50 mt-2 min-w-[160px] overflow-hidden rounded-2xl border border-sky-100 bg-white/95 p-1.5 shadow-xl backdrop-blur-xl">
                  <button
                    onClick={() => {
                      setMenuOpen(false)
                      router.push('/account/change-password')
                    }}
                    className="w-full cursor-pointer rounded-xl px-4 py-2 text-left text-xs font-bold text-slate-800 transition-colors hover:bg-sky-50"
                  >
                    Đổi mật khẩu
                  </button>
                  <button
                    onClick={() => {
                      setMenuOpen(false)
                      logout.mutate(undefined, { onSettled: () => router.push('/') })
                    }}
                    className="w-full cursor-pointer rounded-xl px-4 py-2 text-left text-xs font-bold text-rose-600 transition-colors hover:bg-rose-50"
                  >
                    Đăng xuất
                  </button>
                </div>
              )}
            </div>
          )}

          {/* 8. Vietnam Flag / Language Selector */}
          <button
            aria-label="Ngôn ngữ Tiếng Việt"
            className="flex h-[36px] w-[36px] shrink-0 cursor-pointer items-center justify-center rounded-full border-2 border-b-[3px] border-amber-300 border-amber-500 bg-red-600 shadow-[0_4px_12px_rgba(220,38,38,0.25)] transition-all hover:scale-105 active:translate-y-[2px] sm:h-[40px] sm:w-[40px] md:h-[44px] md:w-[44px]"
          >
            <div className="flex items-center justify-center">
              <svg viewBox="0 0 30 20" className="h-5 w-5 sm:h-5.5 sm:w-5.5">
                <polygon
                  fill="#FFFF00"
                  points="15,4 16.2,8.8 21.2,8.8 21.2,8.8 17.2,11.8 18.7,16.6 15,13.6 11.3,16.6 12.8,11.8 8.8,8.8 13.8,8.8"
                />
              </svg>
            </div>
          </button>
        </div>
      </div>
    </header>
  )
}
