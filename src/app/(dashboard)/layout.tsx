import Image from "next/image";

import { BottomNav } from "@/components/layout/bottom-nav";
import { Topbar } from "@/components/layout/topbar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative h-[100dvh] w-full overflow-hidden font-sans bg-dashboard-bg">
      {/* Background Image */}
      <div className="absolute inset-0 -z-20">
        <Image
          src="/clone-assets/media/bg-home.72e8fdd5.jpg"
          alt="Home Background"
          fill
          className="object-cover"
          priority
        />
      </div>

      {/* Top Header */}
      <Topbar />

      <div className="flex flex-col h-full relative z-10 pt-[140px] pb-[120px]">
        {/* Main Content (Swiper Planets or Pages) */}
        <main className="flex-1 w-full overflow-hidden flex flex-col justify-center items-center">
          {children}
        </main>
      </div>

      {/* Bottom Navigation */}
      <div className="absolute bottom-0 w-full z-50">
        <BottomNav />
      </div>

      {/* Report Bug Button on Right Edge */}
      <div className="absolute right-0 bottom-44 z-50 hidden md:flex">
        <button className="bg-bug-btn text-bug-btn-text px-1.5 py-4 rounded-l-lg font-bold text-[10px] tracking-widest flex flex-col items-center gap-2 border-y-2 border-l-2 border-bug-btn-border shadow-[-4px_0_10px_rgba(0,0,0,0.3)] uppercase hover:bg-yellow-300 transition-colors writing-vertical-rl">
          <span>BÁO CÁO LỖI</span>
          <span className="text-sm mt-1 transform rotate-90">🚀</span>
        </button>
      </div>
    </div>
  );
}
