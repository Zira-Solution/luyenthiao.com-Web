"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

const NAV_LEFT = [
  { href: "/", label: "Hành tinh\ncấp độ", icon: "level-filter.337790ac.png" },
  { href: "/ranking", label: "Bảng xếp hạng", icon: "icon_trophy.32089636.png", badge: "HOT" },
  { href: "#", label: "Thi thử\ntrình độ", icon: "map.30295c2a.png" }
];

const NAV_RIGHT = [
  { href: "#", label: "Kích hoạt\ntài khoản", icon: "icon_target.87047c90.png", notification: true },
  { href: "#", label: "Phụ huynh\nthầy cô", icon: "ic_free.7a24c735.png" },
  { href: "#", label: "Mời bạn\nnhận quà", icon: "icon_bag.b6e8d7e3.png" }
];

export function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();

  const NavItem = ({ item }: { item: any }) => {
    const isActive = pathname === item.href;
    const isLinkable = item.href !== "#";

    return (
      <Link 
        key={item.href} 
        href={item.href}
        onClick={(e) => {
          if (!isLinkable) {
            e.preventDefault();
            // Optional: alert or toast message
          }
        }}
        className={cn(
          "flex items-center gap-2.5 group relative px-2.5 md:px-4 py-2 rounded-2xl transition-all duration-250 cursor-pointer select-none border",
          isActive 
            ? "bg-white/15 border-white/20 shadow-inner" 
            : "hover:bg-white/10 border-transparent",
          !isLinkable && "opacity-75 hover:opacity-100"
        )}
      >
        <div className="relative w-10 h-10 md:w-12 md:h-12 flex items-center justify-center shrink-0">
          <img 
            src={`/clone-assets/media/${item.icon}`} 
            alt={item.label}
            className="w-full h-full object-contain relative z-10 drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)] group-hover:scale-110 group-hover:-translate-y-1 transition-all duration-200"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://api.dicebear.com/7.x/shapes/svg?seed=' + item.label;
            }}
          />
          {item.notification && (
            <div className="absolute top-0 right-0 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center border-2 border-[#4a1c82] z-20 animate-pulse">
              <span className="text-white text-[9px] font-black leading-none">!</span>
            </div>
          )}
          {item.badge && (
            <div className="absolute -top-3 -right-6 bg-gradient-to-r from-amber-400 to-orange-500 text-white text-[8px] font-black px-1.5 py-0.5 rounded border border-[#4a1c82] z-20 transform rotate-12 shadow-sm uppercase tracking-wider">
              {item.badge}
            </div>
          )}
        </div>
        <span className={cn(
          "text-[9px] md:text-xs font-black whitespace-pre-line leading-tight text-left uppercase tracking-wider drop-shadow-md transition-colors",
          isActive ? "text-yellow-350" : "text-white group-hover:text-blue-200"
        )}>
          {item.label}
        </span>
      </Link>
    );
  };

  return (
    <div className="w-full flex justify-center pb-4 px-4 sm:pb-8 relative z-50 select-none">
      {/* 3D Nav Bar panel */}
      <div className="bg-[#4a1c82]/95 backdrop-blur-md border-t-4 border-[#7c3aed] rounded-[2.2rem] px-4 md:px-8 py-2.5 flex items-center justify-between w-full max-w-6xl shadow-[0_12px_40px_rgba(0,0,0,0.6)]">
        
        {/* Left Nav Tabs */}
        <div className="flex items-center gap-2 md:gap-4 flex-1 justify-start">
          {NAV_LEFT.map((item) => <NavItem key={item.href} item={item} />)}
        </div>

        {/* Center Mascot Button with 3D Pop and Click Effects */}
        <div 
          className="relative -mt-16 md:-mt-22 mx-6 shrink-0 group cursor-pointer"
          onClick={() => router.push("/")}
        >
          <div className="relative w-24 h-24 md:w-34 md:h-34 transform group-hover:scale-110 group-hover:-translate-y-2 group-active:scale-95 transition-all duration-300">
            {/* Mascot bunny with 3D drop shadow */}
            <img 
              src="https://statics.flyer.vn/avatar/de905412fc63465bb5ccebb2c0561ac9" 
              alt="FLYER Mascot"
              className="w-full h-full object-contain filter drop-shadow-[0_12px_15px_rgba(0,0,0,0.6)]"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/clone-assets/media/ic-challenge.9b2229cb.png'; // fallback
              }}
            />
            {/* FLYER text banner below mascot */}
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 border-2 border-white text-white font-black italic text-xs md:text-sm px-4.5 py-1 rounded-full shadow-lg transform -rotate-3 select-none tracking-widest uppercase">
              FLYER
            </div>
          </div>
          
          {/* 3D Action bubble widgets */}
          <div className="absolute -top-3 -left-4 w-9 h-9 bg-purple-600 rounded-full flex items-center justify-center border-2 border-white hover:bg-purple-500 transition-colors shadow-[0_3px_0_rgba(74,16,128,1)] active:translate-y-[2px] active:shadow-none cursor-pointer">
            <img src="/clone-assets/media/icon-chat.fa14d2f7.png" alt="Chat" className="w-5 h-5 object-contain" />
          </div>
          <div className="absolute top-1 -right-5 w-9 h-9 bg-blue-400 rounded-full flex items-center justify-center border-2 border-white hover:bg-blue-300 transition-colors shadow-[0_3px_0_rgba(29,78,216,1)] active:translate-y-[2px] active:shadow-none cursor-pointer">
            <img src="/clone-assets/media/icon-call.c4ff351b.png" alt="Call" className="w-5 h-5 object-contain" />
          </div>
        </div>

        {/* Right Nav Tabs */}
        <div className="flex items-center gap-2 md:gap-4 flex-1 justify-end">
          {NAV_RIGHT.map((item) => <NavItem key={item.href} item={item} />)}
        </div>

      </div>
    </div>
  );
}
