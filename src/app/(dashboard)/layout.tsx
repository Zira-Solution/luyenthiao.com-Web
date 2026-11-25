import { BottomNav, Topbar } from '@/components/common'
import { DreamySkyBackground } from '@/components/dashboard'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative isolate h-[100dvh] w-full overflow-hidden font-sans">
      {/* Living Dream Worlds Sky Atmosphere */}
      <DreamySkyBackground />

      {/* Top Header */}
      <Topbar />

      <div className="short-landscape-layout-padding relative z-10 flex h-full flex-col pt-[58px] pb-[calc(76px+env(safe-area-inset-bottom,0px))] sm:pt-[74px] sm:pb-[84px] md:pt-[90px] md:pb-[98px]">
        {/* Main Content (Swiper Planets or Pages) */}
        <main className="scrollbar-game flex w-full flex-1 flex-col items-center justify-center overflow-hidden">
          {children}
        </main>
      </div>

      {/* Bottom Navigation */}
      <div className="absolute bottom-0 z-50 w-full">
        <BottomNav />
      </div>

      {/* Report Bug Button on Right Edge */}
      <div className="absolute right-0 bottom-44 z-50 hidden md:flex">
        <button
          aria-label="Báo cáo lỗi"
          className="group cursor-pointer transition-transform duration-200 hover:-translate-x-1 hover:brightness-105 active:translate-x-0"
        >
          <img
            src="/clone-assets/exam/button_feedback_vi.5162d6f8.webp"
            alt="Báo cáo lỗi"
            loading="lazy"
            decoding="async"
            className="h-[110px] w-auto object-contain drop-shadow-[-3px_4px_10px_rgba(0,0,0,0.2)] lg:h-[120px]"
          />
        </button>
      </div>
    </div>
  )
}
