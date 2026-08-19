"use client";

import { ChevronDown } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import { cn } from "@/lib/utils";

const NAV_LEFT = [
  { href: "/", label: "TẤT CẢ\nCẤP ĐỘ", icon: "level-filter.337790ac.png", dropdown: true },
  { href: "/placement-test", label: "KIỂM TRA TRÌNH ĐỘ", icon: "map.30295c2a.png" },
  { href: "/notebook", label: "SỔ TAY", icon: "icon_target.87047c90.png", badge: "MỚI" }
];

const NAV_RIGHT = [
  { href: "#", label: "KÍCH HOẠT TÀI KHOẢN", icon: "icon_trophy.32089636.png", notification: true },
  { href: "#", label: "THẦY CÔ/PHỤ HUYNH", icon: "ic_free.7a24c735.png" },
  { href: "#", label: "Mời\nbạn bè", icon: "icon_bag.b6e8d7e3.png" }
];

interface NavItemData {
  href: string;
  label: string;
  icon: string;
  dropdown?: boolean;
  badge?: string;
  notification?: boolean;
}

const NavItem = ({ item, pathname }: { item: NavItemData; pathname: string }) => {
  const isActive = pathname === item.href;
  const isLinkable = item.href !== "#";

  return (
    <Link 
      key={item.href} 
      href={item.href}
      onClick={(e) => {
        if (!isLinkable) {
          e.preventDefault();
          // In the future, this can open modals or activate accounts
        }
      }}
      className={cn(
        "flex items-center gap-1.5 md:gap-2.5 group relative px-2 md:px-4 py-2 rounded-2xl transition-all duration-250 cursor-pointer select-none border",
        isActive 
          ? "bg-white/15 border-white/20 shadow-inner" 
          : "hover:bg-white/10 border-transparent",
        !isLinkable && "opacity-85 hover:opacity-100"
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
          <div className="absolute top-0 right-0 w-3.5 h-3.5 bg-red-500 rounded-full flex items-center justify-center border border-nav-bg z-20 animate-pulse shadow-md">
            <span className="text-white text-[8px] font-black leading-none">!</span>
          </div>
        )}
        {item.badge && (
          <div className="absolute -top-3 -right-6 bg-gradient-to-r from-nav-badge-green-from to-nav-badge-green-to text-white text-[8px] font-black px-1.5 py-0.5 rounded border border-white/10 z-20 transform rotate-12 shadow-md uppercase tracking-wider">
            {item.badge}
          </div>
        )}
      </div>
      <div className="flex items-center gap-0.5">
        <span className={cn(
          "text-[9px] md:text-[10px] font-black whitespace-pre-line leading-tight text-center md:text-left uppercase tracking-wider drop-shadow-md transition-colors",
          isActive ? "text-yellow-350" : "text-white group-hover:text-blue-200"
        )}>
          {item.label}
        </span>
        {item.dropdown && (
          <ChevronDown className="w-3 h-3 text-white/70 group-hover:text-white shrink-0 self-center mt-1" />
        )}
      </div>
    </Link>
  );
};

export function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <div className="w-full flex justify-center pb-4 px-4 sm:pb-8 relative z-50 select-none">
      <div className="relative w-full max-w-6xl flex justify-center">
        
        {/* Floating Call Button */}
        <a 
          href="tel:19001234"
          className="fixed left-4 bottom-24 min-[1360px]:absolute min-[1360px]:left-[-70px] min-[1360px]:bottom-3 z-50 block w-12 h-12 md:w-14 md:h-14 transition-all duration-300 hover:scale-115 active:scale-95 hover:-translate-y-1 filter drop-shadow-[0_8px_10px_rgba(0,0,0,0.5)] cursor-pointer animate-[pulse_3s_infinite]"
        >
          <img 
            src="/clone-assets/media/icon-call.c4ff351b.png" 
            alt="Call Hotline" 
            className="w-full h-full object-contain" 
          />
        </a>

        {/* 3D Curved Navigation Bar */}
        <div className="bg-bottom-nav-bg/95 backdrop-blur-md border-t-4 border-topbar-purple-bg rounded-[2.2rem] px-4 md:px-8 py-2 flex items-center justify-between w-full shadow-[0_12px_40px_rgba(0,0,0,0.6)]">
          
          {/* Left Nav Tabs */}
          <div className="flex items-center gap-1.5 md:gap-3 flex-1 justify-start">
            {NAV_LEFT.map((item) => <NavItem key={item.label} item={item} pathname={pathname} />)}
          </div>

          {/* Center Mascot Button sitting on FLYER logo */}
          <div 
            className="relative -mt-16 md:-mt-22 mx-5 shrink-0 group cursor-pointer"
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
          </div>

          {/* Right Nav Tabs */}
          <div className="flex items-center gap-1.5 md:gap-3 flex-1 justify-end">
            {NAV_RIGHT.map((item) => <NavItem key={item.label} item={item} pathname={pathname} />)}
          </div>

        </div>

        {/* Floating Chat Button */}
        <button 
          onClick={() => window.open("https://zalo.me", "_blank")}
          className="fixed right-4 bottom-24 min-[1360px]:absolute min-[1360px]:right-[-70px] min-[1360px]:bottom-3 z-50 block w-12 h-12 md:w-14 md:h-14 transition-all duration-300 hover:scale-115 active:scale-95 hover:-translate-y-1 filter drop-shadow-[0_8px_10px_rgba(0,0,0,0.5)] cursor-pointer"
        >
          <img 
            src="/clone-assets/media/icon-chat.fa14d2f7.png" 
            alt="Chat Support" 
            className="w-full h-full object-contain" 
          />
        </button>

      </div>
    </div>
  );
}
