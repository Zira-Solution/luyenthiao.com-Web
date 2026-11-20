'use client'

import { ChevronDown, Plus } from 'lucide-react'
import { useRouter, usePathname } from 'next/navigation'
import { useState } from 'react'

import { UnreadBadge } from '@/components/common/unread-badge'
import { DEMO_SPEAKING_TEST_PATH, DEMO_WRITE_TEST_PATH } from '@/constants'
import { useLogout } from '@/hooks'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/store/auth-store'

// Sculpted Floating Pill Tile (Dream Worlds aesthetic)
const CapsuleNavButton = ({
  onClick,
  className,
  children,
  variant = 'blue',
  badgeText,
  badgeColor = 'bg-[#10b981]',
}: {
  onClick?: () => void
  className?: string
  children: React.ReactNode
  variant?: 'blue' | 'orange' | 'yellow' | 'purple' | 'mint'
  badgeText?: string
  badgeColor?: string
}) => {
  const styles = {
    blue: 'bg-gradient-to-b from-white/95 to-[#edf4fc] border-b-[3px] border-[#b9d5f3] hover:from-white hover:to-[#e2effd] active:to-[#d0e5fb] text-[#1e3a8a] shadow-[0_3px_8px_rgba(30,58,138,0.06)]',
    orange:
      'bg-gradient-to-b from-[#fb923c] to-[#ea580c] border-b-[3px] border-[#c2410c] hover:brightness-105 active:brightness-95 text-white shadow-[0_3px_8px_rgba(194,65,12,0.2)]',
    yellow:
      'bg-gradient-to-b from-[#fde047] to-[#eab308] border-b-[3px] border-[#ca8a04] hover:brightness-105 active:brightness-95 text-[#713f12] shadow-[0_3px_8px_rgba(202,138,4,0.2)]',
    purple:
      'bg-gradient-to-b from-[#a855f7] to-[#7e22ce] border-b-[3px] border-[#6b21a8] hover:brightness-105 active:brightness-95 text-white shadow-[0_3px_8px_rgba(107,33,168,0.2)]',
    mint: 'bg-gradient-to-b from-[#34d399] to-[#059669] border-b-[3px] border-[#047857] hover:brightness-105 active:brightness-95 text-white shadow-[0_3px_8px_rgba(5,150,105,0.2)]',
  }[variant]

  return (
    <button
      onClick={onClick}
      className={cn(
        'group relative flex h-[48px] min-w-[50px] shrink-0 cursor-pointer flex-col items-center justify-between rounded-xl border-b-[2.5px] px-1 py-1 transition-all duration-200 hover:-translate-y-0.5 active:translate-y-[2px] active:border-b-2 sm:h-[58px] sm:min-w-[62px] sm:rounded-2xl sm:px-1.5 sm:py-1.5 md:h-[68px] md:min-w-[76px] md:border-b-[3px] md:px-2 md:py-2',
        styles,
        className,
      )}
    >
      {/* Delicate floating badge */}
      {badgeText && (
        <span
          className={cn(
            'absolute -top-1.5 -left-1.5 z-20 -rotate-6 transform rounded-full px-1.5 py-0.5 text-[7px] font-black tracking-wider text-white uppercase shadow-sm sm:text-[8px] md:text-[9px]',
            badgeColor,
          )}
        >
          {badgeText}
        </span>
      )}
      <div className="flex h-full w-full flex-col items-center justify-between">{children}</div>
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

  const handleLogin = () => {
    router.push('/login')
  }

  const handleSignup = () => {
    router.push('/signup')
  }

  const handleRanking = () => {
    router.push('/ranking')
  }

  return (
    <header className="absolute top-0 left-0 z-50 w-full p-1.5 select-none sm:p-2 md:p-3">
      {/* 3 Distinct Floating Frosted Glass Capsules - Single row with horizontal fluid overflow */}
      <div className="flex w-full items-center justify-between gap-1 sm:gap-2">
        {/* ================= LEFT SECTION: ACTIVITIES CAPSULE ================= */}
        <div className="no-scrollbar flex max-w-[42vw] shrink-0 items-center gap-1 overflow-x-auto rounded-xl border border-white/70 bg-white/60 p-1 shadow-[0_8px_24px_rgba(30,58,138,0.06)] backdrop-blur-xl sm:max-w-none sm:gap-1.5 sm:rounded-2xl sm:p-1.5 md:gap-2">
          {/* Thách Đấu Button */}
          <CapsuleNavButton variant="purple">
            <img
              src="/clone-assets/media/ic-challenge.9b2229cb.png"
              alt="Thách đấu"
              className="h-5 w-5 object-contain sm:h-6 sm:w-6 md:h-7 md:w-7"
              onError={(e) => {
                ;(e.target as HTMLImageElement).src =
                  'https://api.dicebear.com/7.x/bottts/svg?seed=challenge'
              }}
            />
            <span className="text-[8px] font-black tracking-wider uppercase sm:text-[9px] md:text-[10px]">
              Thách đấu
            </span>
          </CapsuleNavButton>

          {/* Writing Button */}
          <CapsuleNavButton
            variant="blue"
            badgeText="MỚI"
            badgeColor="bg-[#10b981]"
            onClick={() => router.push(DEMO_WRITE_TEST_PATH)}
          >
            <div className="flex h-6 w-6 items-center justify-center md:h-7 md:w-7">
              <img
                src="/clone-assets/media/ic-writing.9b3fd4e6.png"
                alt="Writing"
                className="h-full w-full object-contain"
                onError={(e) => {
                  ;(e.target as HTMLImageElement).src =
                    'https://api.dicebear.com/7.x/bottts/svg?seed=writing'
                }}
              />
            </div>
            <div className="flex items-center gap-0.5">
              <span className="text-[9px] font-black tracking-wider uppercase md:text-[10px]">
                Writing
              </span>
              <ChevronDown className="h-2.5 w-2.5 text-blue-500" />
            </div>
          </CapsuleNavButton>

          {/* Speaking Button */}
          <CapsuleNavButton variant="blue" onClick={() => router.push(DEMO_SPEAKING_TEST_PATH)}>
            <div className="flex h-6 w-6 items-center justify-center md:h-7 md:w-7">
              <img
                src="/clone-assets/media/ic-speaking.3f0031fd.png"
                alt="Speaking"
                className="h-full w-full object-contain"
                onError={(e) => {
                  ;(e.target as HTMLImageElement).src =
                    'https://api.dicebear.com/7.x/bottts/svg?seed=speaking'
                }}
              />
            </div>
            <div className="flex items-center gap-0.5">
              <span className="text-[9px] font-black tracking-wider uppercase md:text-[10px]">
                Speaking
              </span>
              <ChevronDown className="h-2.5 w-2.5 text-blue-500" />
            </div>
          </CapsuleNavButton>

          {/* Vocabulary Button */}
          <CapsuleNavButton variant="blue">
            <div className="flex h-6 w-6 items-center justify-center md:h-7 md:w-7">
              <img
                src="/clone-assets/media/ic-vocab.1dd303ec.png"
                alt="Vocabulary"
                className="h-full w-full object-contain"
                onError={(e) => {
                  ;(e.target as HTMLImageElement).src =
                    'https://api.dicebear.com/7.x/bottts/svg?seed=vocab'
                }}
              />
            </div>
            <div className="flex items-center gap-0.5">
              <span className="text-[9px] font-black tracking-wider uppercase md:text-[10px]">
                Vocabulary
              </span>
              <ChevronDown className="h-2.5 w-2.5 text-blue-500" />
            </div>
          </CapsuleNavButton>

          {/* Luyện Tập Button */}
          <CapsuleNavButton variant="orange" badgeText="MỚI" badgeColor="bg-[#10b981]">
            <div className="flex h-6 w-6 items-center justify-center md:h-7 md:w-7">
              <img
                src="/clone-assets/media/ic-practice.png"
                alt="Luyện tập"
                className="h-full w-full object-contain drop-shadow-[0_2px_4px_rgba(0,0,0,0.15)] transition-transform duration-200 group-hover:scale-110"
              />
            </div>
            <span className="text-[9px] font-black tracking-wider uppercase md:text-[10px]">
              Luyện tập
            </span>
          </CapsuleNavButton>

          {/* Coin Counter Pill */}
          <div className="flex h-[46px] min-w-[80px] items-center gap-2 rounded-xl border-b-[2.5px] border-[#fde047] bg-gradient-to-b from-[#fffbeb] to-[#fef08a] px-2.5 py-1 shadow-sm md:h-[50px] md:min-w-[90px]">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-yellow-400 bg-amber-400 text-amber-950 shadow-xs md:h-7 md:w-7">
              <span className="text-xs font-black">C</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[7.5px] font-extrabold tracking-wider text-amber-800 uppercase md:text-[8.5px]">
                COIN
              </span>
              <span className="-mt-1 text-xs font-black text-amber-950 md:text-sm">0</span>
            </div>
          </div>
        </div>

        {/* ================= CENTER SECTION: DREAM CLOUD AUTH HUB ================= */}
        <div className="relative mx-auto flex shrink-0 items-center justify-center">
          {/* Authentic Pure Vector Cloud Background */}
          <div className="pointer-events-none absolute top-1/2 left-1/2 -z-10 hidden h-[110px] w-[180px] -translate-x-1/2 -translate-y-1/2 sm:block md:h-[135px] md:w-[220px]">
            <svg
              viewBox="0 0 200 120"
              className="h-full w-full overflow-visible drop-shadow-[0_8px_20px_rgba(0,0,0,0.08)]"
              preserveAspectRatio="none"
              fill="none"
            >
              <g fill="#ffffff">
                <rect x="25" y="20" width="150" height="80" rx="35" />
                <circle cx="35" cy="55" r="30" />
                <circle cx="65" cy="28" r="28" />
                <circle cx="105" cy="20" r="32" />
                <circle cx="145" cy="28" r="28" />
                <circle cx="170" cy="55" r="30" />
                <circle cx="65" cy="92" r="26" />
                <circle cx="105" cy="98" r="28" />
                <circle cx="145" cy="92" r="26" />
              </g>
            </svg>
          </div>

          {status === 'authenticated' && user ? (
            <div className="relative z-10 px-2 py-1 sm:px-4 sm:py-2">
              <button
                onClick={() => setMenuOpen((open) => !open)}
                className="flex cursor-pointer items-center gap-1.5 rounded-full border-2 border-sky-200 bg-white/95 px-3 py-1 shadow-sm backdrop-blur-md transition-all hover:bg-white sm:px-4 sm:py-1.5"
              >
                <span className="text-[10px] font-black tracking-wide text-sky-950 uppercase sm:text-xs md:text-sm">
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
          ) : (
            <div className="relative z-10 flex flex-col gap-1 p-0.5 sm:w-[145px] sm:gap-1.5 sm:p-1 md:w-[155px]">
              {/* Đăng Nhập Button */}
              <button
                onClick={handleLogin}
                className="group relative w-full cursor-pointer text-center transition-all hover:-translate-y-0.5 active:translate-y-[2px]"
              >
                <div className="rounded-full border-b-[2px] border-[#bfdbfe] bg-[#e2ebf8] px-2.5 py-1 text-[8.5px] font-black tracking-wider text-[#1e3a8a] uppercase shadow-xs transition-all hover:bg-[#d5e4f5] sm:px-4 sm:py-1.5 sm:text-[11px] md:border-b-[2.5px] md:text-xs">
                  ĐĂNG NHẬP
                </div>
              </button>

              {/* Đăng Ký Button */}
              <button
                onClick={handleSignup}
                className="group relative w-full cursor-pointer text-center transition-all hover:-translate-y-0.5 active:translate-y-[2px]"
              >
                <div className="rounded-full border-b-[2px] border-[#b91c1c] bg-gradient-to-r from-[#ef4444] to-[#dc2626] px-2.5 py-1 text-[8.5px] font-black tracking-wider text-white uppercase shadow-xs transition-all hover:brightness-105 sm:px-4 sm:py-1.5 sm:text-[11px] md:border-b-[2.5px] md:text-xs">
                  ĐĂNG KÝ
                </div>
              </button>
            </div>
          )}
        </div>

        {/* ================= RIGHT SECTION: UTILITY CONTROLS CAPSULE ================= */}
        <div className="no-scrollbar flex max-w-[42vw] shrink-0 items-center justify-end gap-1 overflow-x-auto rounded-xl border border-white/70 bg-white/60 p-1 shadow-[0_8px_24px_rgba(30,58,138,0.06)] backdrop-blur-xl sm:max-w-none sm:gap-1.5 sm:rounded-2xl sm:p-1.5 md:gap-2">
          {/* Diamond Counter Pill */}
          <div className="flex h-[38px] min-w-[70px] items-center gap-1 rounded-lg border-b-[2px] border-[#bae6fd] bg-gradient-to-b from-white to-[#f0f9ff] px-1.5 py-0.5 shadow-sm sm:h-[46px] sm:min-w-[90px] sm:rounded-xl sm:px-2.5 sm:py-1 md:h-[50px] md:min-w-[105px] md:border-b-[2.5px]">
            <div className="h-4 w-4 shrink-0 sm:h-5 sm:w-5 md:h-6 md:w-6">
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
              <span className="text-[6.5px] font-extrabold tracking-wider text-sky-800 uppercase sm:text-[7.5px] md:text-[8.5px]">
                KIM CƯƠNG
              </span>
              <span className="-mt-1 text-[11px] font-black text-sky-950 sm:text-xs md:text-sm">
                0
              </span>
            </div>
            <button
              aria-label="Thêm kim cương"
              className="flex h-3.5 w-3.5 cursor-pointer items-center justify-center rounded border-b-2 border-emerald-600 bg-emerald-500 text-[8px] font-black text-white shadow-xs transition-transform hover:bg-emerald-400 active:scale-95 sm:h-4.5 sm:w-4.5 sm:rounded-md sm:text-[10px]"
            >
              <Plus className="h-2 w-2 sm:h-2.5 sm:w-2.5" />
            </button>
          </div>

          {/* Xếp Hạng Button */}
          <CapsuleNavButton
            variant="blue"
            onClick={handleRanking}
            className={cn(pathname === '/ranking' && 'ring-2 ring-amber-400')}
          >
            <div className="flex h-5 w-5 shrink-0 items-center justify-center sm:h-6 sm:w-6 md:h-7 md:w-7">
              <img
                src="/clone-assets/media/icon_trophy.32089636.png"
                alt="Xếp hạng"
                className="h-4 w-4 object-contain sm:h-5 sm:w-5 md:h-6 md:w-6"
                onError={(e) => {
                  ;(e.target as HTMLImageElement).src =
                    'https://api.dicebear.com/7.x/bottts/svg?seed=trophy'
                }}
              />
            </div>
            <span className="text-[8px] font-black tracking-wider uppercase sm:text-[9px] md:text-[10px]">
              Xếp hạng
            </span>
          </CapsuleNavButton>

          {/* Lịch Sử Button (Hidden on small mobile) */}
          <CapsuleNavButton
            variant="blue"
            onClick={() => router.push('/history')}
            className={cn('hidden sm:flex', pathname === '/history' && 'ring-2 ring-amber-400')}
          >
            <div className="flex h-5 w-5 shrink-0 items-center justify-center sm:h-6 sm:w-6 md:h-7 md:w-7">
              <img
                src="/clone-assets/media/ic-history.png"
                alt="Lịch sử"
                className="h-full w-full object-contain drop-shadow-[0_2px_4px_rgba(0,0,0,0.12)]"
                onError={(e) => {
                  ;(e.target as HTMLImageElement).src =
                    'https://api.dicebear.com/7.x/bottts/svg?seed=history'
                }}
              />
            </div>
            <span className="text-[8px] font-black tracking-wider uppercase sm:text-[9px] md:text-[10px]">
              Lịch sử
            </span>
          </CapsuleNavButton>

          {/* Trường Của Tôi Button (Hidden on mobile and tablet portrait) */}
          <CapsuleNavButton
            variant="blue"
            onClick={() => router.push('/school-ranking')}
            className={cn(
              'hidden lg:flex',
              pathname === '/school-ranking' && 'ring-2 ring-amber-400',
            )}
          >
            <div className="flex h-5 w-5 shrink-0 items-center justify-center sm:h-6 sm:w-6 md:h-7 md:w-7">
              <img
                src="/clone-assets/media/ic-school.png"
                alt="Trường của tôi"
                className="h-full w-full object-contain drop-shadow-[0_2px_4px_rgba(0,0,0,0.12)]"
                onError={(e) => {
                  ;(e.target as HTMLImageElement).src =
                    'https://api.dicebear.com/7.x/bottts/svg?seed=school'
                }}
              />
            </div>
            <span className="text-[8px] font-black tracking-wider uppercase sm:text-[9px] md:text-[10px]">
              Trường của tôi
            </span>
          </CapsuleNavButton>

          {/* Nhiệm Vụ Button (Hidden on small mobile) */}
          <CapsuleNavButton
            variant="blue"
            onClick={() => router.push('/tasks')}
            className={cn('hidden md:flex', pathname === '/tasks' && 'ring-2 ring-amber-400')}
          >
            <div className="flex h-5 w-5 shrink-0 items-center justify-center sm:h-6 sm:w-6 md:h-7 md:w-7">
              <img
                src="/clone-assets/media/ic-task.png"
                alt="Nhiệm vụ"
                className="h-full w-full object-contain drop-shadow-[0_2px_4px_rgba(0,0,0,0.12)]"
                onError={(e) => {
                  ;(e.target as HTMLImageElement).src =
                    'https://api.dicebear.com/7.x/bottts/svg?seed=task'
                }}
              />
            </div>
            <span className="text-[8px] font-black tracking-wider uppercase sm:text-[9px] md:text-[10px]">
              Nhiệm vụ
            </span>
          </CapsuleNavButton>

          {/* Thông Báo Button */}
          <CapsuleNavButton
            variant="blue"
            onClick={() => router.push('/notifications')}
            className={cn(pathname === '/notifications' && 'ring-2 ring-amber-400')}
          >
            <div className="relative flex h-5 w-5 shrink-0 items-center justify-center sm:h-6 sm:w-6 md:h-7 md:w-7">
              <img
                src="/clone-assets/media/ic_bell.19fd4917.png"
                alt="Thông báo"
                className="h-4 w-4 object-contain sm:h-5 sm:w-5 md:h-6 md:w-6"
                onError={(e) => {
                  ;(e.target as HTMLImageElement).src =
                    'https://api.dicebear.com/7.x/bottts/svg?seed=bell'
                }}
              />
              <UnreadBadge />
            </div>
            <span className="text-[8px] font-black tracking-wider uppercase sm:text-[9px] md:text-[10px]">
              Thông báo
            </span>
          </CapsuleNavButton>

          {/* Vietnam Flag / Language Selector */}
          <button
            aria-label="Ngôn ngữ Tiếng Việt"
            className="group relative flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-full border-2 border-amber-300 bg-red-600 shadow-[0_2px_8px_rgba(220,38,38,0.25)] transition-all hover:scale-105 active:translate-y-[2px] sm:h-9 sm:w-9 md:h-10 md:w-10"
          >
            <div className="flex items-center justify-center">
              <svg viewBox="0 0 30 20" className="h-5 w-5 sm:h-6 sm:w-6">
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
