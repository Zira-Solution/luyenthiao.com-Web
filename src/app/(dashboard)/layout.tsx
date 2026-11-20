import { BottomNav, Topbar } from '@/components/common'
import { DreamySkyBackground } from '@/components/dashboard'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative isolate h-[100dvh] w-full overflow-hidden font-sans">
      {/* Living Dream Worlds Sky Atmosphere */}
      <DreamySkyBackground />

      {/* Top Header */}
      <Topbar />

      <div className="short-landscape-layout-padding relative z-10 flex h-full flex-col pt-[58px] pb-[68px] sm:pt-[74px] sm:pb-[84px] md:pt-[90px] md:pb-[98px]">
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
        <button className="writing-vertical-rl flex flex-col items-center gap-2 rounded-l-xl border-y-2 border-l-2 border-amber-400 bg-amber-300/90 px-1.5 py-4 text-[10px] font-black tracking-widest text-amber-950 uppercase shadow-[-4px_0_12px_rgba(245,158,11,0.25)] backdrop-blur-md transition-all hover:scale-105 hover:bg-amber-300 active:scale-95">
          <span>BÁO CÁO LỖI</span>
          <span className="mt-1 rotate-90 transform text-sm">🚀</span>
        </button>
      </div>
    </div>
  )
}
