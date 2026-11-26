'use client'

import { ChevronDown, KeyRound, LogOut, Menu, Shield } from 'lucide-react'
import { useRouter, usePathname } from 'next/navigation'
import { useState, useRef, useEffect } from 'react'

import { DEFAULT_SITE_CONFIG_CLIENT } from '@/components/admin/site-config/site-config-defaults'
import { MobileNavDrawer } from '@/components/common/mobile-nav-drawer'
import { UnreadBadge } from '@/components/common/unread-badge'
import { DEMO_SPEAKING_TEST_PATH, DEMO_WRITE_TEST_PATH, ROUTES } from '@/constants'
import { useLogout } from '@/hooks'
import { cn } from '@/lib/utils'
import { useSiteConfig } from '@/providers/site-config-provider'
import { useAuthStore } from '@/store/auth-store'

interface GameNavButtonProps {
  label: string
  iconSrc: string
  iconAlt: string
  hasDropdown?: boolean
  isOrange?: boolean
  hasNewRibbon?: boolean
  onClick?: () => void
  active?: boolean
  badge?: React.ReactNode
  dropdownContent?: React.ReactNode
  isDropdownOpen?: boolean
  onToggleDropdown?: () => void
}

/**
 * 3D Game Squircle Button
 * Pixel-accurate recreation matching the approved reference:
 * - Rounded-square game UI button
 * - Thick lavender-purple frame (or warm amber for Luyện tập)
 * - Multiple visible layers creating a 3D extruded appearance
 * - Clearly visible darker purple bottom extrusion
 * - Soft contact shadows beneath each button
 * - Centered 3D icon overflowing above the top edge
 */
function GameNavButton({
  label,
  iconSrc,
  iconAlt,
  hasDropdown = false,
  isOrange = false,
  hasNewRibbon = false,
  onClick,
  active = false,
  badge,
  dropdownContent,
  isDropdownOpen = false,
  onToggleDropdown,
}: GameNavButtonProps) {
  const handleClick = (e: React.MouseEvent) => {
    if (hasDropdown && onToggleDropdown) {
      e.stopPropagation()
      onToggleDropdown()
    } else if (onClick) {
      onClick()
    }
  }

  return (
    <div className="relative shrink-0 select-none">
      <button
        type="button"
        onClick={handleClick}
        aria-label={label}
        className={cn(
          'group relative flex cursor-pointer flex-col items-center justify-end transition-all duration-200 select-none',
          // Well-proportioned squircle dimensions (1:1 ratio matching reference)
          'h-[54px] w-[54px] xl:h-[58px] xl:w-[58px] 2xl:h-[68px] 2xl:w-[68px]',
          'rounded-[13px] xl:rounded-[15px] 2xl:rounded-[18px]',
          'px-0.5 pb-1 xl:pb-1.5 2xl:pb-2',
          isOrange
            ? [
                // Golden-orange 3D squircle button (Luyện tập)
                'bg-gradient-to-b from-[#ffd147] via-[#ff9500] to-[#f06700]',
                'border-[2px] border-[#ffe885] sm:border-[2.5px]',
                'shadow-[0_4px_0_#9a3412,0_7px_12px_rgba(154,52,18,0.4),inset_0_2px_3px_rgba(255,255,255,0.85),inset_0_-2px_4px_rgba(180,50,0,0.5)]',
                'hover:-translate-y-1 hover:shadow-[0_5px_0_#9a3412,0_9px_16px_rgba(154,52,18,0.48)] hover:brightness-105',
                'active:translate-y-[2px] active:shadow-[0_2px_0_#9a3412,0_4px_8px_rgba(154,52,18,0.3)]',
              ]
            : [
                // Soft lavender-purple 3D squircle button
                'bg-gradient-to-b from-[#ffffff] via-[#f7f4ff] to-[#ebe4fb]',
                'border-[2px] border-[#8e6fd8] sm:border-[2.5px]',
                'shadow-[0_4px_0_#5a379e,0_7px_12px_rgba(90,55,158,0.32),inset_0_2px_2px_rgba(255,255,255,0.95),inset_0_-2px_3px_rgba(142,111,216,0.22)]',
                'hover:-translate-y-1 hover:shadow-[0_5px_0_#5a379e,0_9px_16px_rgba(90,55,158,0.38)] hover:brightness-105',
                'active:translate-y-[2px] active:shadow-[0_2px_0_#5a379e,0_4px_8px_rgba(90,55,158,0.25)]',
                active &&
                  'bg-gradient-to-b from-[#f3edff] via-[#e8defe] to-[#ddd0f8] shadow-[0_3px_0_#5a379e,inset_0_2px_4px_rgba(90,55,158,0.2)]',
              ],
        )}
      >
        {/* NEW Green Ribbon (For Luyện tập) */}
        {hasNewRibbon && (
          <div className="pointer-events-none absolute -top-1 -left-1 z-20 h-7 w-7 overflow-hidden sm:h-8 sm:w-8 md:h-9 md:w-9">
            <div className="font-heading absolute top-1 -left-3.5 w-13 -rotate-45 border-t border-emerald-200 bg-gradient-to-b from-[#34d399] to-[#059669] py-0.5 text-center text-[5.5px] font-black tracking-tighter text-white uppercase shadow-[0_1.5px_3px_rgba(0,0,0,0.25)] sm:text-[6.5px]">
              NEW
            </div>
          </div>
        )}

        {/* 3D Prominent Icon protruding above top edge matching Image 2 (~70% width, ~12% top pop-out) */}
        <div className="pointer-events-none absolute inset-x-0 -top-1.5 flex items-center justify-center transition-transform duration-200 group-hover:scale-105 sm:-top-2 md:-top-2 lg:-top-2.5 xl:-top-2.5 2xl:-top-3">
          <img
            src={iconSrc}
            alt={iconAlt}
            className={cn(
              'max-w-none object-contain drop-shadow-[0_4px_6px_rgba(0,0,0,0.22)]',
              // Sized precisely at ~68-70% of squircle card dimensions
              isOrange
                ? 'h-[40px] w-[40px] xl:h-[42px] xl:w-[42px] 2xl:h-[48px] 2xl:w-[48px]'
                : 'h-[38px] w-[38px] xl:h-[40px] xl:w-[40px] 2xl:h-[46px] 2xl:w-[46px]',
            )}
            loading="eager"
          />
        </div>

        {/* Bottom Text Label */}
        <div className="flex w-full items-center justify-center gap-0.5 px-0.5">
          <span
            className={cn(
              'font-heading leading-none font-black tracking-tight whitespace-nowrap uppercase',
              'text-[7.5px] xl:text-[8px] 2xl:text-[9.5px]',
              'text-[#381a6c] drop-shadow-[0_0.5px_0_rgba(255,255,255,0.8)]',
            )}
          >
            {label}
          </span>
          {hasDropdown && (
            <span className="ml-0.5 text-[5px] font-black text-[#5a379e] opacity-80 sm:text-[6px]">
              ▼
            </span>
          )}
        </div>

        {/* Notification Badge */}
        {badge && <div className="absolute -top-1.5 -right-1.5 z-20">{badge}</div>}
      </button>

      {/* Dropdown Menu Popover */}
      {hasDropdown && isDropdownOpen && dropdownContent && (
        <div className="animate-in fade-in zoom-in-95 absolute top-[calc(100%+8px)] left-1/2 z-50 min-w-[140px] -translate-x-1/2 overflow-hidden rounded-2xl border-2 border-[#8e6fd8] bg-white/95 p-1.5 shadow-[0_10px_25px_rgba(90,55,158,0.25)] backdrop-blur-md duration-150">
          {dropdownContent}
        </div>
      )}
    </div>
  )
}

/**
 * Currency Counter Card (COIN & KIM CƯƠNG)
 */
function CurrencyCard({
  iconSrc,
  iconAlt,
  label,
  value,
  onClick,
}: {
  iconSrc: string
  iconAlt: string
  label: string
  value: number | string
  onClick?: () => void
}) {
  return (
    <div
      onClick={onClick}
      role="button"
      tabIndex={0}
      aria-label={`${label}: ${value}`}
      className={cn(
        'group relative flex shrink-0 cursor-pointer items-center justify-between transition-all duration-200 select-none',
        'h-[38px] min-w-[76px] sm:h-[40px] sm:min-w-[84px] xl:h-[44px] xl:min-w-[96px] 2xl:h-[48px] 2xl:min-w-[110px]',
        'gap-1.5 sm:gap-2',
        'rounded-[12px] sm:rounded-[14px] md:rounded-[16px] lg:rounded-[18px]',
        'border-[2px] border-[#8e6fd8]',
        'bg-gradient-to-b from-[#ffffff] via-[#f7f4ff] to-[#ebe5fb]',
        'shadow-[0_3.5px_0_#5a379e,0_5px_8px_rgba(90,55,158,0.22),inset_0_1.5px_2px_rgba(255,255,255,0.95),inset_0_-1.5px_2px_rgba(142,111,216,0.18)]',
        'px-2 sm:px-2.5 md:px-3',
        'hover:-translate-y-0.5 hover:shadow-[0_4.5px_0_#5a379e,0_7px_10px_rgba(90,55,158,0.28)] hover:brightness-105',
        'active:translate-y-[1px] active:shadow-[0_2px_0_#5a379e]',
      )}
    >
      {/* 3D Icon */}
      <img
        src={iconSrc}
        alt={iconAlt}
        className="h-[30px] w-[30px] object-contain drop-shadow-[0_2px_4px_rgba(0,0,0,0.2)] transition-transform group-hover:scale-105 sm:h-[34px] sm:w-[34px] md:h-[38px] md:w-[38px] lg:h-[42px] lg:w-[42px] xl:h-[45px] xl:w-[45px] 2xl:h-[48px] 2xl:w-[48px]"
      />

      {/* Label & Numeric Value */}
      <div className="flex flex-col items-end justify-center pr-0.5 leading-none">
        <span className="font-heading text-[6px] font-black tracking-wider whitespace-nowrap text-[#63459c] uppercase sm:text-[6.5px] md:text-[7px] lg:text-[7.5px] 2xl:text-[8px]">
          {label}
        </span>
        <span className="font-heading mt-0.5 text-[11px] font-black text-[#381a6c] sm:text-[12px] md:text-[13px] lg:text-[13.5px] 2xl:text-[14px]">
          {value}
        </span>
      </div>
    </div>
  )
}

/**
 * Center Authentication 3D Panel
 * Stacked ĐĂNG NHẬP & ĐĂNG KÝ buttons inside a taller lavender 3D container,
 * or authenticated user info when signed in.
 */
interface NavUser {
  role?: string
  fullName?: string
  username?: string
}

function CenterAuthPanel({
  status,
  user,
  onLogin,
  onRegister,
  onLogout,
}: {
  status: string
  user: NavUser | null
  onLogin: () => void
  onRegister: () => void
  onLogout: () => void
}) {
  const router = useRouter()
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // If user is authenticated, render the user profile state inside the matching container
  if (status === 'authenticated' && user) {
    return (
      <div
        ref={menuRef}
        className={cn(
          'relative flex shrink-0 items-center justify-center select-none',
          'h-[56px] w-[114px] xl:h-[60px] xl:w-[126px] 2xl:h-[70px] 2xl:w-[150px]',
          'rounded-[13px] sm:rounded-[15px] md:rounded-[17px] lg:rounded-[19px] 2xl:rounded-[20px]',
          'border-[2px] border-[#8e6fd8] sm:border-[2.5px]',
          'bg-gradient-to-b from-[#baa2f5] via-[#9e80ee] to-[#805dd6]',
          'shadow-[0_4px_0_#543394,0_7px_14px_rgba(84,51,148,0.35),inset_0_2px_3px_rgba(255,255,255,0.7)]',
          'p-1 sm:p-1.5',
        )}
      >
        <button
          type="button"
          onClick={() => setUserMenuOpen((prev) => !prev)}
          className="flex h-full w-full cursor-pointer flex-col items-center justify-center rounded-xl bg-white/90 px-2 py-1 shadow-xs transition-transform hover:scale-[1.02] active:scale-95"
        >
          <div className="flex items-center gap-1">
            <span className="font-heading truncate text-[9px] font-black text-[#381a6c] uppercase sm:text-[10px]">
              {user.fullName || user.username || user.role}
            </span>
            <ChevronDown className="h-3 w-3 text-[#5a379e]" />
          </div>
          <span className="text-[7px] font-bold text-indigo-500 uppercase sm:text-[8px]">
            {user.role}
          </span>
        </button>

        {userMenuOpen && (
          <div className="animate-in fade-in zoom-in-95 absolute top-[calc(100%+8px)] left-1/2 z-50 min-w-[150px] -translate-x-1/2 overflow-hidden rounded-2xl border-2 border-[#8e6fd8] bg-white/95 p-1 shadow-xl backdrop-blur-xl duration-150">
            {user.role === 'ADMIN' && (
              <button
                type="button"
                onClick={() => {
                  setUserMenuOpen(false)
                  router.push(ROUTES.ADMIN_HOME)
                }}
                className="flex w-full cursor-pointer items-center gap-2 rounded-xl px-3 py-1.5 text-left text-xs font-bold text-blue-700 transition-colors hover:bg-blue-50"
              >
                <Shield className="h-3.5 w-3.5 text-blue-700" />
                <span>Quản trị CMS</span>
              </button>
            )}
            <button
              onClick={() => {
                setUserMenuOpen(false)
                router.push('/account/change-password')
              }}
              className="flex w-full cursor-pointer items-center gap-2 rounded-xl px-3 py-1.5 text-left text-xs font-bold text-slate-800 transition-colors hover:bg-indigo-50"
            >
              <KeyRound className="h-3.5 w-3.5 text-indigo-600" />
              <span>Đổi mật khẩu</span>
            </button>
            <button
              onClick={() => {
                setUserMenuOpen(false)
                onLogout()
              }}
              className="flex w-full cursor-pointer items-center gap-2 rounded-xl px-3 py-1.5 text-left text-xs font-bold text-rose-600 transition-colors hover:bg-rose-50"
            >
              <LogOut className="h-3.5 w-3.5 text-rose-600" />
              <span>Đăng xuất</span>
            </button>
          </div>
        )}
      </div>
    )
  }

  // Unauthenticated: Exact stacked ĐĂNG NHẬP + ĐĂNG KÝ game container
  return (
    <div
      className={cn(
        'relative flex shrink-0 flex-col items-center justify-center select-none',
        'h-[56px] w-[114px] xl:h-[60px] xl:w-[126px] 2xl:h-[70px] 2xl:w-[150px]',
        'rounded-[13px] sm:rounded-[15px] md:rounded-[17px] lg:rounded-[19px] 2xl:rounded-[20px]',
        'border-[2px] border-[#8e6fd8] sm:border-[2.5px]',
        'bg-gradient-to-b from-[#baa2f5] via-[#9e80ee] to-[#805dd6]',
        'shadow-[0_4px_0_#543394,0_7px_14px_rgba(84,51,148,0.35),inset_0_2px_3px_rgba(255,255,255,0.7)]',
        'gap-0.5 p-1 sm:gap-1 sm:p-1.5',
      )}
    >
      {/* Top Button: ĐĂNG NHẬP */}
      <button
        type="button"
        onClick={onLogin}
        aria-label="Đăng nhập"
        className={cn(
          'relative flex w-full cursor-pointer items-center justify-center transition-all duration-150 select-none',
          'h-[21px] sm:h-[23px] md:h-[25px]',
          'rounded-full',
          'border border-b-[2px] border-[#d0bcf6] border-b-[#8f70d8]',
          'bg-gradient-to-b from-[#ffffff] via-[#fbf9ff] to-[#ece5fa]',
          'shadow-[0_1.5px_3px_rgba(0,0,0,0.12)]',
          'hover:brightness-105 active:translate-y-[1px] active:border-b',
        )}
      >
        <span className="font-heading text-[8px] font-black tracking-wide text-[#432177] uppercase sm:text-[9px] md:text-[9.5px]">
          Đăng nhập
        </span>
      </button>

      {/* Bottom Button: ĐĂNG KÝ */}
      <button
        type="button"
        onClick={onRegister}
        aria-label="Đăng ký"
        className={cn(
          'relative flex w-full cursor-pointer items-center justify-center transition-all duration-150 select-none',
          'h-[21px] sm:h-[23px] md:h-[25px]',
          'rounded-full',
          'border border-b-[2px] border-[#fed7aa] border-b-[#9a3412]',
          'bg-gradient-to-b from-[#ffbe3b] via-[#ff8800] to-[#e65c00]',
          'shadow-[0_2px_4px_rgba(154,52,18,0.3)]',
          'hover:brightness-105 active:translate-y-[1px] active:border-b',
        )}
      >
        <span className="font-heading text-[8px] font-black tracking-wide text-white uppercase drop-shadow-[0_1px_1px_rgba(154,52,18,0.8)] sm:text-[9px] md:text-[9.5px]">
          Đăng ký
        </span>
      </button>
    </div>
  )
}

/**
 * 3D Game Hamburger Button for Mobile / Tablet Viewports
 */
function HamburgerButton({ onClick, hasBadge }: { onClick: () => void; hasBadge?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Mở menu"
      className={cn(
        'group relative flex shrink-0 cursor-pointer flex-col items-center justify-center transition-all duration-200 select-none',
        'h-[38px] w-[44px] sm:h-[40px] sm:w-[48px] md:h-[44px] md:w-[52px]',
        'rounded-[12px] sm:rounded-[14px] md:rounded-[16px]',
        'bg-gradient-to-b from-[#ffffff] via-[#f7f4ff] to-[#ebe5fb]',
        'border-[2px] border-[#8e6fd8]',
        'shadow-[0_3.5px_0_#5a379e,0_5px_8px_rgba(90,55,158,0.22),inset_0_1.5px_2px_rgba(255,255,255,0.95),inset_0_-1.5px_2px_rgba(142,111,216,0.18)]',
        'hover:-translate-y-0.5 hover:shadow-[0_4.5px_0_#5a379e,0_7px_10px_rgba(90,55,158,0.28)] hover:brightness-105',
        'active:translate-y-[1px] active:shadow-[0_2px_0_#5a379e]',
      )}
    >
      <Menu className="h-4.5 w-4.5 text-[#381a6c] transition-transform duration-200 group-hover:scale-110 sm:h-5 sm:w-5" />
      <span className="font-heading text-[6.5px] font-black tracking-wider text-[#63459c] uppercase sm:text-[7px]">
        MENU
      </span>
      {hasBadge && (
        <span className="absolute -top-1 -right-1 z-20 flex h-3.5 w-3.5 items-center justify-center rounded-full border-2 border-white bg-rose-500 shadow-xs">
          <span className="text-[7px] leading-none font-black text-white">!</span>
        </span>
      )}
    </button>
  )
}

export function Topbar() {
  const router = useRouter()
  const pathname = usePathname()
  const status = useAuthStore((state) => state.status)
  const user = useAuthStore((state) => state.user)
  const logout = useLogout()
  const { config, language, setLanguage, resolveAsset } = useSiteConfig()
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  const iconChallenge = resolveAsset(
    config.homeAssets.topbarIcons.challenge,
    DEFAULT_SITE_CONFIG_CLIENT.homeAssets.topbarIcons.challenge ?? '',
    '/assets/topbar/ic_challenge_3d.webp',
  )
  const iconWriting = resolveAsset(
    config.homeAssets.topbarIcons.writing,
    DEFAULT_SITE_CONFIG_CLIENT.homeAssets.topbarIcons.writing ?? '',
    '/assets/topbar/ic_writing_3d.webp',
  )
  const iconSpeaking = resolveAsset(
    config.homeAssets.topbarIcons.speaking,
    DEFAULT_SITE_CONFIG_CLIENT.homeAssets.topbarIcons.speaking ?? '',
    '/assets/topbar/ic_speaking_3d.webp',
  )
  const iconVocab = resolveAsset(
    config.homeAssets.topbarIcons.vocab,
    DEFAULT_SITE_CONFIG_CLIENT.homeAssets.topbarIcons.vocab ?? '',
    '/assets/topbar/ic_vocab_3d.webp',
  )
  const iconBell = resolveAsset(
    config.homeAssets.topbarIcons.bell,
    DEFAULT_SITE_CONFIG_CLIENT.homeAssets.topbarIcons.bell ?? '',
    '/assets/topbar/ic_bell_3d.webp',
  )

  // Dropdown states for Writing, Speaking, Vocabulary
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)

  useEffect(() => {
    function handleGlobalClick() {
      setActiveDropdown(null)
    }
    window.addEventListener('click', handleGlobalClick)
    return () => window.removeEventListener('click', handleGlobalClick)
  }, [])

  const toggleDropdown = (name: string) => {
    setActiveDropdown((current) => (current === name ? null : name))
  }

  // Navigation handlers
  const handleThachDau = () => router.push(ROUTES.CHALLENGES)
  const handlePractice = () => router.push('/')
  const handleWriting = () => router.push(DEMO_WRITE_TEST_PATH)
  const handleSpeaking = () => router.push(DEMO_SPEAKING_TEST_PATH)
  const handleVocabulary = () => router.push('/notebook')
  const handleLogin = () => router.push('/login')
  const handleRegister = () => router.push('/register')
  const handleRanking = () => router.push('/ranking')
  const handleHistory = () => router.push('/history')
  const handleSchool = () => router.push('/school-ranking')
  const handleTasks = () => router.push('/tasks')
  const handleNotifications = () => router.push('/notifications')

  return (
    <>
      <header className="top-navbar pointer-events-auto absolute top-0 left-0 z-50 box-border w-full overflow-visible px-2 pt-[max(0.375rem,env(safe-area-inset-top))] select-none sm:px-3 sm:pt-2 md:px-4 md:pt-2.5 lg:px-6 xl:px-8 2xl:pt-3">
        {/* ================= MOBILE / TABLET COMPACT TOPBAR (< 1280px) ================= */}
        <div className="flex w-full items-center justify-between pt-1 pb-1 xl:hidden">
          {/* Left: COIN & KIM CƯƠNG */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <CurrencyCard
              iconSrc="/assets/topbar/ic_coin_3d.webp"
              iconAlt="Coin"
              label="COIN"
              value={0}
              onClick={() => router.push('/')}
            />
            <CurrencyCard
              iconSrc="/assets/topbar/ic_diamond_3d.webp"
              iconAlt="Kim Cương"
              label="KIM CƯƠNG"
              value={0}
              onClick={() => router.push('/')}
            />
          </div>

          {/* Right: 3D Hamburger Menu Button */}
          <HamburgerButton onClick={() => setIsDrawerOpen(true)} />
        </div>

        {/* ================= DESKTOP FULL-WIDTH TOPBAR (>= 1280px) ================= */}
        <div className="top-navbar-content no-scrollbar hidden w-full items-center justify-between gap-2 overflow-x-auto pt-2 pb-1.5 xl:flex xl:gap-3 2xl:gap-6 2xl:pt-3.5">
          {/* ================= LEFT GROUP (5 BUTTONS) ================= */}
          <div className="flex shrink-0 items-center gap-1.5 xl:gap-2 2xl:gap-3">
            {/* 1. THÁCH ĐẤU */}
            <GameNavButton
              label="Thách đấu"
              iconSrc={iconChallenge}
              iconAlt="Thách đấu"
              onClick={handleThachDau}
              active={pathname.startsWith(ROUTES.CHALLENGES)}
            />

            {/* 2. WRITING ▼ */}
            <GameNavButton
              label="Writing"
              iconSrc={iconWriting}
              iconAlt="Writing"
              hasDropdown
              isDropdownOpen={activeDropdown === 'writing'}
              onToggleDropdown={() => toggleDropdown('writing')}
              active={pathname.includes('/writing')}
              dropdownContent={
                <div className="flex flex-col gap-1 p-1">
                  <button
                    type="button"
                    onClick={handleWriting}
                    className="rounded-xl px-3 py-1.5 text-left text-xs font-bold text-[#381a6c] transition-colors hover:bg-purple-50"
                  >
                    Luyện Viết Thử
                  </button>
                  <button
                    type="button"
                    onClick={() => router.push('/placement-test')}
                    className="rounded-xl px-3 py-1.5 text-left text-xs font-bold text-[#381a6c] transition-colors hover:bg-purple-50"
                  >
                    Đề Thi Writing
                  </button>
                </div>
              }
            />

            {/* 3. SPEAKING ▼ */}
            <GameNavButton
              label="Speaking"
              iconSrc={iconSpeaking}
              iconAlt="Speaking"
              hasDropdown
              isDropdownOpen={activeDropdown === 'speaking'}
              onToggleDropdown={() => toggleDropdown('speaking')}
              active={pathname.includes('/speaking')}
              dropdownContent={
                <div className="flex flex-col gap-1 p-1">
                  <button
                    type="button"
                    onClick={handleSpeaking}
                    className="rounded-xl px-3 py-1.5 text-left text-xs font-bold text-[#381a6c] transition-colors hover:bg-purple-50"
                  >
                    Luyện Nói Thử
                  </button>
                  <button
                    type="button"
                    onClick={() => router.push('/placement-test')}
                    className="rounded-xl px-3 py-1.5 text-left text-xs font-bold text-[#381a6c] transition-colors hover:bg-purple-50"
                  >
                    Đề Thi Speaking
                  </button>
                </div>
              }
            />

            {/* 4. VOCABULARY ▼ */}
            <GameNavButton
              label="Vocabulary"
              iconSrc={iconVocab}
              iconAlt="Vocabulary"
              hasDropdown
              isDropdownOpen={activeDropdown === 'vocab'}
              onToggleDropdown={() => toggleDropdown('vocab')}
              active={pathname === '/notebook' || pathname === '/vocab'}
              dropdownContent={
                <div className="flex flex-col gap-1 p-1">
                  <button
                    type="button"
                    onClick={handleVocabulary}
                    className="rounded-xl px-3 py-1.5 text-left text-xs font-bold text-[#381a6c] transition-colors hover:bg-purple-50"
                  >
                    Sổ Tay Từ Vựng
                  </button>
                  <button
                    type="button"
                    onClick={() => router.push(ROUTES.VOCAB)}
                    className="rounded-xl px-3 py-1.5 text-left text-xs font-bold text-[#381a6c] transition-colors hover:bg-purple-50"
                  >
                    Kho Từ Vựng
                  </button>
                </div>
              }
            />

            {/* 5. LUYỆN TẬP (Orange with NEW Ribbon) */}
            <GameNavButton
              label="Luyện tập"
              iconSrc="/assets/topbar/ic_potion_3d.webp"
              iconAlt="Luyện tập"
              isOrange
              hasNewRibbon
              onClick={handlePractice}
              active={pathname === '/'}
            />
          </div>

          {/* ================= CENTER GROUP (COIN - AUTH - KIM CƯƠNG) ================= */}
          <div className="flex shrink-0 -translate-y-1 items-center gap-1.5 sm:-translate-y-1.5 xl:gap-2.5 2xl:gap-4">
            {/* 6. COIN Counter */}
            <CurrencyCard
              iconSrc="/assets/topbar/ic_coin_3d.webp"
              iconAlt="Coin"
              label="COIN"
              value={0}
              onClick={() => router.push('/')}
            />

            {/* 7. Stacked Authentication Panel */}
            <CenterAuthPanel
              status={status}
              user={user}
              onLogin={handleLogin}
              onRegister={handleRegister}
              onLogout={() => logout.mutate(undefined, { onSettled: () => router.push('/') })}
            />

            {/* 8. KIM CƯƠNG Counter */}
            <CurrencyCard
              iconSrc="/assets/topbar/ic_diamond_3d.webp"
              iconAlt="Kim Cương"
              label="KIM CƯƠNG"
              value={0}
              onClick={() => router.push('/')}
            />
          </div>

          {/* ================= RIGHT GROUP (5 BUTTONS) ================= */}
          <div className="flex shrink-0 items-center gap-1.5 xl:gap-2 2xl:gap-3">
            {/* 9. XẾP HẠNG */}
            <GameNavButton
              label="Xếp hạng"
              iconSrc="/assets/topbar/ic_trophy_3d.webp"
              iconAlt="Xếp hạng"
              onClick={handleRanking}
              active={pathname === '/ranking'}
            />

            {/* 10. LỊCH SỬ */}
            <GameNavButton
              label="Lịch sử"
              iconSrc="/assets/topbar/ic_book_3d.webp"
              iconAlt="Lịch sử"
              onClick={handleHistory}
              active={pathname === '/history'}
            />

            {/* 11. TRƯỜNG CỦA TÔI */}
            <GameNavButton
              label="Trường của tôi"
              iconSrc="/assets/topbar/ic_school_3d.webp"
              iconAlt="Trường của tôi"
              onClick={handleSchool}
              active={pathname === '/school-ranking'}
            />

            {/* 12. NHIỆM VỤ */}
            <GameNavButton
              label="Nhiệm vụ"
              iconSrc="/assets/topbar/ic_task_3d.webp"
              iconAlt="Nhiệm vụ"
              onClick={handleTasks}
              active={pathname === '/tasks'}
              badge={
                <span className="flex h-3.5 w-3.5 items-center justify-center rounded-full border-2 border-white bg-rose-500 shadow-xs">
                  <span className="text-[7px] leading-none font-black text-white">!</span>
                </span>
              }
            />

            {/* 13. THÔNG BÁO */}
            <GameNavButton
              label="Thông báo"
              iconSrc={iconBell}
              iconAlt="Thông báo"
              onClick={handleNotifications}
              active={pathname === '/notifications'}
              badge={<UnreadBadge />}
            />

            {config.languages.length > 1 && (
              <div
                className="flex shrink-0 items-center rounded-full border border-[#c7b5ec] bg-white/85 p-0.5 shadow-xs"
                role="group"
                aria-label="Chọn ngôn ngữ"
              >
                {config.languages.map((item) => (
                  <button
                    key={item.code}
                    type="button"
                    onClick={() => setLanguage(item.code)}
                    aria-pressed={language === item.code}
                    className={cn(
                      'cursor-pointer rounded-full px-2 py-1 text-[10px] font-black uppercase transition-colors',
                      language === item.code
                        ? 'bg-[#6d28d9] text-white'
                        : 'text-[#432177] hover:bg-purple-100',
                    )}
                  >
                    {item.code}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Navigation Drawer */}
      <MobileNavDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        status={status}
        user={user}
        onLogin={handleLogin}
        onRegister={handleRegister}
        onLogout={() => logout.mutate(undefined, { onSettled: () => router.push('/') })}
      />
    </>
  )
}
