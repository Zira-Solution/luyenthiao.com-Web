'use client'

import { ChevronDown, ChevronRight, KeyRound, LogOut, X } from 'lucide-react'
import { useRouter, usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'

import { UnreadBadge } from '@/components/common/unread-badge'
import { DEMO_SPEAKING_TEST_PATH, DEMO_WRITE_TEST_PATH } from '@/constants'
import { cn } from '@/lib/utils'

interface MobileNavDrawerProps {
  isOpen: boolean
  onClose: () => void
  status: string
  user: any
  onLogin: () => void
  onRegister: () => void
  onLogout: () => void
}

export function MobileNavDrawer({
  isOpen,
  onClose,
  status,
  user,
  onLogin,
  onRegister,
  onLogout,
}: MobileNavDrawerProps) {
  const router = useRouter()
  const pathname = usePathname()

  // Collapsible accordion states
  const [openSection, setOpenSection] = useState<string | null>(null)

  // Close on route change or Escape
  useEffect(() => {
    onClose()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname])

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const toggleSection = (id: string) => {
    setOpenSection((current) => (current === id ? null : id))
  }

  const navigateTo = (path: string) => {
    onClose()
    router.push(path)
  }

  return (
    <div className="fixed inset-0 z-[100] select-none">
      {/* Backdrop */}
      <div
        className="animate-in fade-in fixed inset-0 bg-slate-900/40 backdrop-blur-xs duration-200"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer Panel */}
      <aside
        className={cn(
          'animate-in slide-in-from-right fixed top-0 right-0 bottom-0 z-10 flex w-[85vw] max-w-[340px] flex-col duration-300 ease-out',
          'border-l-2 border-[#8e6fd8]',
          'bg-gradient-to-b from-[#ffffff] via-[#f7f4ff] to-[#ebe4fb]',
          'shadow-[-8px_0_24px_rgba(56,26,108,0.2)]',
          'pt-[max(1rem,env(safe-area-inset-top))] pb-[max(1rem,env(safe-area-inset-bottom))]',
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#e2d8f7] px-4 pb-3">
          <div className="flex items-center gap-2">
            <span className="font-heading text-base font-black tracking-wide text-[#381a6c] uppercase">
              Menu Tính Năng
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng menu"
            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-xl border border-[#8e6fd8] bg-white text-[#5a379e] shadow-[0_2px_0_#5a379e] transition-transform active:translate-y-[1px]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="no-scrollbar flex-1 space-y-4 overflow-y-auto px-4 py-3">
          {/* Section 1: User / Authentication */}
          <div className="rounded-2xl border-2 border-[#8e6fd8] bg-gradient-to-b from-[#baa2f5] via-[#9e80ee] to-[#805dd6] p-2.5 shadow-[0_4px_0_#543394,0_6px_12px_rgba(84,51,148,0.3)]">
            {status === 'authenticated' && user ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between rounded-xl bg-white/95 px-3 py-2">
                  <div className="flex flex-col">
                    <span className="font-heading truncate text-xs font-black text-[#381a6c] uppercase">
                      {user.fullName || user.username || 'Học sinh'}
                    </span>
                    <span className="text-[10px] font-bold text-indigo-500 uppercase">
                      {user.role || 'Học viên'}
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => navigateTo('/account/change-password')}
                    className="flex cursor-pointer items-center justify-center gap-1.5 rounded-lg bg-white/90 py-1.5 text-xs font-bold text-slate-800 transition-colors hover:bg-white"
                  >
                    <KeyRound className="h-3.5 w-3.5 text-indigo-600" />
                    <span>Đổi MK</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onClose()
                      onLogout()
                    }}
                    className="flex cursor-pointer items-center justify-center gap-1.5 rounded-lg bg-rose-50 py-1.5 text-xs font-bold text-rose-600 transition-colors hover:bg-rose-100"
                  >
                    <LogOut className="h-3.5 w-3.5 text-rose-600" />
                    <span>Đăng xuất</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => {
                    onClose()
                    onLogin()
                  }}
                  className="flex h-9 w-full cursor-pointer items-center justify-center rounded-xl border border-b-[2px] border-[#d0bcf6] border-b-[#8f70d8] bg-gradient-to-b from-[#ffffff] via-[#fbf9ff] to-[#ece5fa] shadow-sm transition-transform active:translate-y-[1px]"
                >
                  <span className="font-heading text-xs font-black tracking-wide text-[#432177] uppercase">
                    Đăng nhập
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onClose()
                    onRegister()
                  }}
                  className="flex h-9 w-full cursor-pointer items-center justify-center rounded-xl border border-b-[2px] border-[#fed7aa] border-b-[#9a3412] bg-gradient-to-b from-[#ffbe3b] via-[#ff8800] to-[#e65c00] shadow-sm transition-transform active:translate-y-[1px]"
                >
                  <span className="font-heading text-xs font-black tracking-wide text-white uppercase drop-shadow-[0_1px_1px_rgba(154,52,18,0.8)]">
                    Đăng ký tài khoản
                  </span>
                </button>
              </div>
            )}
          </div>

          {/* Section 2: Luyện thi & Kỹ năng */}
          <div className="space-y-1.5">
            <span className="px-1 text-[10px] font-black tracking-wider text-[#63459c] uppercase">
              Luyện thi & Kỹ năng
            </span>

            {/* Thách đấu */}
            <button
              type="button"
              onClick={() => navigateTo('/')}
              className="flex w-full cursor-pointer items-center justify-between rounded-xl border border-[#d9ccf5] bg-white px-3 py-2 text-left shadow-xs transition-colors hover:bg-[#f6f2ff]"
            >
              <div className="flex items-center gap-2.5">
                <img
                  src="/assets/topbar/ic_challenge_3d.webp"
                  alt="Thách đấu"
                  className="h-7 w-7 object-contain"
                />
                <span className="font-heading text-xs font-black text-[#381a6c] uppercase">
                  Thách đấu
                </span>
              </div>
              <ChevronRight className="h-4 w-4 text-[#8e6fd8]" />
            </button>

            {/* Luyện tập (Orange highlight) */}
            <button
              type="button"
              onClick={() => navigateTo('/')}
              className="flex w-full cursor-pointer items-center justify-between rounded-xl border border-[#ffe885] bg-gradient-to-r from-[#ffd147]/15 to-[#ff9500]/15 px-3 py-2 text-left shadow-xs transition-colors hover:from-[#ffd147]/25 hover:to-[#ff9500]/25"
            >
              <div className="flex items-center gap-2.5">
                <img
                  src="/assets/topbar/ic_potion_3d.webp"
                  alt="Luyện tập"
                  className="h-7 w-7 object-contain"
                />
                <div className="flex items-center gap-1.5">
                  <span className="font-heading text-xs font-black text-[#c2410c] uppercase">
                    Luyện tập
                  </span>
                  <span className="py-0.2 rounded-full bg-emerald-500 px-1.5 text-[8px] font-black text-white">
                    NEW
                  </span>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-[#ea580c]" />
            </button>

            {/* Writing (Accordion) */}
            <div className="overflow-hidden rounded-xl border border-[#d9ccf5] bg-white shadow-xs">
              <button
                type="button"
                onClick={() => toggleSection('writing')}
                className="flex w-full cursor-pointer items-center justify-between px-3 py-2 text-left"
              >
                <div className="flex items-center gap-2.5">
                  <img
                    src="/assets/topbar/ic_writing_3d.webp"
                    alt="Writing"
                    className="h-7 w-7 object-contain"
                  />
                  <span className="font-heading text-xs font-black text-[#381a6c] uppercase">
                    Writing
                  </span>
                </div>
                <ChevronDown
                  className={cn(
                    'h-4 w-4 text-[#8e6fd8] transition-transform duration-200',
                    openSection === 'writing' && 'rotate-180',
                  )}
                />
              </button>
              {openSection === 'writing' && (
                <div className="space-y-1 border-t border-[#f0ebfc] bg-[#faf8ff] p-1.5">
                  <button
                    type="button"
                    onClick={() => navigateTo(DEMO_WRITE_TEST_PATH)}
                    className="flex w-full cursor-pointer rounded-lg px-3 py-1.5 text-xs font-bold text-[#381a6c] transition-colors hover:bg-purple-100/60"
                  >
                    Luyện Viết Thử
                  </button>
                  <button
                    type="button"
                    onClick={() => navigateTo('/exam')}
                    className="flex w-full cursor-pointer rounded-lg px-3 py-1.5 text-xs font-bold text-[#381a6c] transition-colors hover:bg-purple-100/60"
                  >
                    Đề Thi Writing
                  </button>
                </div>
              )}
            </div>

            {/* Speaking (Accordion) */}
            <div className="overflow-hidden rounded-xl border border-[#d9ccf5] bg-white shadow-xs">
              <button
                type="button"
                onClick={() => toggleSection('speaking')}
                className="flex w-full cursor-pointer items-center justify-between px-3 py-2 text-left"
              >
                <div className="flex items-center gap-2.5">
                  <img
                    src="/assets/topbar/ic_speaking_3d.webp"
                    alt="Speaking"
                    className="h-7 w-7 object-contain"
                  />
                  <span className="font-heading text-xs font-black text-[#381a6c] uppercase">
                    Speaking
                  </span>
                </div>
                <ChevronDown
                  className={cn(
                    'h-4 w-4 text-[#8e6fd8] transition-transform duration-200',
                    openSection === 'speaking' && 'rotate-180',
                  )}
                />
              </button>
              {openSection === 'speaking' && (
                <div className="space-y-1 border-t border-[#f0ebfc] bg-[#faf8ff] p-1.5">
                  <button
                    type="button"
                    onClick={() => navigateTo(DEMO_SPEAKING_TEST_PATH)}
                    className="flex w-full cursor-pointer rounded-lg px-3 py-1.5 text-xs font-bold text-[#381a6c] transition-colors hover:bg-purple-100/60"
                  >
                    Luyện Nói Thử
                  </button>
                  <button
                    type="button"
                    onClick={() => navigateTo('/exam')}
                    className="flex w-full cursor-pointer rounded-lg px-3 py-1.5 text-xs font-bold text-[#381a6c] transition-colors hover:bg-purple-100/60"
                  >
                    Đề Thi Speaking
                  </button>
                </div>
              )}
            </div>

            {/* Vocabulary (Accordion) */}
            <div className="overflow-hidden rounded-xl border border-[#d9ccf5] bg-white shadow-xs">
              <button
                type="button"
                onClick={() => toggleSection('vocab')}
                className="flex w-full cursor-pointer items-center justify-between px-3 py-2 text-left"
              >
                <div className="flex items-center gap-2.5">
                  <img
                    src="/assets/topbar/ic_vocab_3d.webp"
                    alt="Vocabulary"
                    className="h-7 w-7 object-contain"
                  />
                  <span className="font-heading text-xs font-black text-[#381a6c] uppercase">
                    Vocabulary
                  </span>
                </div>
                <ChevronDown
                  className={cn(
                    'h-4 w-4 text-[#8e6fd8] transition-transform duration-200',
                    openSection === 'vocab' && 'rotate-180',
                  )}
                />
              </button>
              {openSection === 'vocab' && (
                <div className="space-y-1 border-t border-[#f0ebfc] bg-[#faf8ff] p-1.5">
                  <button
                    type="button"
                    onClick={() => navigateTo('/notebook')}
                    className="flex w-full cursor-pointer rounded-lg px-3 py-1.5 text-xs font-bold text-[#381a6c] transition-colors hover:bg-purple-100/60"
                  >
                    Sổ Tay Từ Vựng
                  </button>
                  <button
                    type="button"
                    onClick={() => navigateTo('/exam')}
                    className="flex w-full cursor-pointer rounded-lg px-3 py-1.5 text-xs font-bold text-[#381a6c] transition-colors hover:bg-purple-100/60"
                  >
                    Kho Từ Vựng
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Section 3: Hoạt động & Bảng vàng */}
          <div className="space-y-1.5">
            <span className="px-1 text-[10px] font-black tracking-wider text-[#63459c] uppercase">
              Hoạt động & Bảng vàng
            </span>

            {/* Xếp hạng */}
            <button
              type="button"
              onClick={() => navigateTo('/ranking')}
              className="flex w-full cursor-pointer items-center justify-between rounded-xl border border-[#d9ccf5] bg-white px-3 py-2 text-left shadow-xs transition-colors hover:bg-[#f6f2ff]"
            >
              <div className="flex items-center gap-2.5">
                <img
                  src="/assets/topbar/ic_trophy_3d.webp"
                  alt="Xếp hạng"
                  className="h-7 w-7 object-contain"
                />
                <span className="font-heading text-xs font-black text-[#381a6c] uppercase">
                  Xếp hạng
                </span>
              </div>
              <ChevronRight className="h-4 w-4 text-[#8e6fd8]" />
            </button>

            {/* Lịch sử */}
            <button
              type="button"
              onClick={() => navigateTo('/history')}
              className="flex w-full cursor-pointer items-center justify-between rounded-xl border border-[#d9ccf5] bg-white px-3 py-2 text-left shadow-xs transition-colors hover:bg-[#f6f2ff]"
            >
              <div className="flex items-center gap-2.5">
                <img
                  src="/assets/topbar/ic_book_3d.webp"
                  alt="Lịch sử"
                  className="h-7 w-7 object-contain"
                />
                <span className="font-heading text-xs font-black text-[#381a6c] uppercase">
                  Lịch sử
                </span>
              </div>
              <ChevronRight className="h-4 w-4 text-[#8e6fd8]" />
            </button>

            {/* Trường của tôi */}
            <button
              type="button"
              onClick={() => navigateTo('/school-ranking')}
              className="flex w-full cursor-pointer items-center justify-between rounded-xl border border-[#d9ccf5] bg-white px-3 py-2 text-left shadow-xs transition-colors hover:bg-[#f6f2ff]"
            >
              <div className="flex items-center gap-2.5">
                <img
                  src="/assets/topbar/ic_school_3d.webp"
                  alt="Trường của tôi"
                  className="h-7 w-7 object-contain"
                />
                <span className="font-heading text-xs font-black text-[#381a6c] uppercase">
                  Trường của tôi
                </span>
              </div>
              <ChevronRight className="h-4 w-4 text-[#8e6fd8]" />
            </button>

            {/* Nhiệm vụ */}
            <button
              type="button"
              onClick={() => navigateTo('/tasks')}
              className="flex w-full cursor-pointer items-center justify-between rounded-xl border border-[#d9ccf5] bg-white px-3 py-2 text-left shadow-xs transition-colors hover:bg-[#f6f2ff]"
            >
              <div className="flex items-center gap-2.5">
                <img
                  src="/assets/topbar/ic_task_3d.webp"
                  alt="Nhiệm vụ"
                  className="h-7 w-7 object-contain"
                />
                <span className="font-heading text-xs font-black text-[#381a6c] uppercase">
                  Nhiệm vụ
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[9px] font-black text-white">
                  !
                </span>
                <ChevronRight className="h-4 w-4 text-[#8e6fd8]" />
              </div>
            </button>

            {/* Thông báo */}
            <button
              type="button"
              onClick={() => navigateTo('/notifications')}
              className="flex w-full cursor-pointer items-center justify-between rounded-xl border border-[#d9ccf5] bg-white px-3 py-2 text-left shadow-xs transition-colors hover:bg-[#f6f2ff]"
            >
              <div className="flex items-center gap-2.5">
                <img
                  src="/assets/topbar/ic_bell_3d.webp"
                  alt="Thông báo"
                  className="h-7 w-7 object-contain"
                />
                <span className="font-heading text-xs font-black text-[#381a6c] uppercase">
                  Thông báo
                </span>
              </div>
              <div className="flex items-center gap-2">
                <UnreadBadge />
                <ChevronRight className="h-4 w-4 text-[#8e6fd8]" />
              </div>
            </button>
          </div>
        </div>
      </aside>
    </div>
  )
}
