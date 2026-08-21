"use client";

import { ChevronDown, Plus, Trophy, BookOpen, School, ClipboardList } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";

import { DEMO_SPEAKING_TEST_PATH, DEMO_WRITE_TEST_PATH } from "@/constants";
import { cn } from "@/lib/utils";

// Topbar Button Component (3D Game Style)
const GameNavButton = ({ 
  onClick, 
  className, 
  children, 
  variant = "blue",
  badgeText,
  badgeColor = "bg-green-500"
}: { 
  onClick?: () => void; 
  className?: string; 
  children: React.ReactNode; 
  variant?: "blue" | "orange" | "yellow" | "purple";
  badgeText?: string;
  badgeColor?: string;
}) => {
  const styles = {
    blue: "bg-topbar-blue-bg border-topbar-blue-border hover:bg-topbar-blue-hover active:bg-topbar-blue-active",
    orange: "bg-topbar-orange-bg border-topbar-orange-border hover:bg-topbar-orange-hover active:bg-topbar-orange-active",
    yellow: "bg-topbar-yellow-bg border-topbar-yellow-border hover:bg-topbar-yellow-hover active:bg-topbar-yellow-active",
    purple: "bg-topbar-purple-bg border-topbar-purple-border hover:bg-topbar-purple-hover active:bg-topbar-purple-active"
  }[variant];

  return (
    <button
      onClick={onClick}
      className={cn(
        "relative group active:translate-y-[2px] active:border-b-[2px] transition-all duration-100 cursor-pointer rounded-2xl px-3 py-1.5 md:py-2 border-b-4 flex flex-col items-center justify-center min-w-[70px] md:min-w-[85px] h-[65px] md:h-[75px] shadow-[0_4px_6px_rgba(0,0,0,0.3)]",
        styles,
        className
      )}
    >
      {/* Cute badge on top-left of the button */}
      {badgeText && (
        <span className={cn(
          "absolute -top-1.5 -left-1.5 text-[8px] md:text-[9px] font-black text-white px-1.5 py-0.5 rounded-md border border-white/20 transform -rotate-6 tracking-wider uppercase animate-pulse shadow-md z-20",
          badgeColor
        )}>
          {badgeText}
        </span>
      )}
      <div className="flex flex-col items-center justify-between h-full w-full">
        {children}
      </div>
    </button>
  );
};

export function Topbar() {
  const router = useRouter();
  const pathname = usePathname();

  const handleLogin = () => {
    router.push("/login");
  };

  const handleRanking = () => {
    router.push("/ranking");
  };

  return (
    <header className="w-full absolute top-0 left-0 z-50 p-2 md:p-4 select-none">
      
      {/* Container wraps layout into 3 distinct sections */}
      <div className="w-full max-w-[100dvw] flex flex-wrap items-center justify-between gap-y-3 lg:gap-0">
        
        {/* ================= LEFT SECTION ================= */}
        <div className="flex flex-wrap items-center gap-1.5 md:gap-2">
          
          {/* Thách Đấu Button */}
          <GameNavButton variant="orange">
            <img 
              src="/clone-assets/media/ic-challenge.9b2229cb.png" 
              alt="Thách đấu" 
              className="w-7 h-7 md:w-9 md:h-9 object-contain"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://api.dicebear.com/7.x/bottts/svg?seed=challenge';
              }}
            />
            <span className="text-white text-[9px] md:text-[10px] font-black uppercase tracking-wider">
              Thách đấu
            </span>
          </GameNavButton>

          {/* Writing Button */}
          <GameNavButton
            variant="blue"
            badgeText="FREE"
            badgeColor="bg-gradient-to-r from-emerald-400 to-green-600"
            onClick={() => router.push(DEMO_WRITE_TEST_PATH)}
          >
            <div className="flex items-center justify-center w-7 h-7 md:w-9 md:h-9">
              <img 
                src="/clone-assets/media/ic-writing.9b3fd4e6.png" 
                alt="Writing" 
                className="w-full h-full object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://api.dicebear.com/7.x/bottts/svg?seed=writing';
                }}
              />
            </div>
            <div className="flex items-center gap-0.5">
              <span className="text-white text-[9px] md:text-[10px] font-black uppercase tracking-wider">
                Writing
              </span>
              <ChevronDown className="w-2.5 h-2.5 text-blue-300" />
            </div>
          </GameNavButton>

          {/* Speaking Button */}
          <GameNavButton
            variant="blue"
            onClick={() => router.push(DEMO_SPEAKING_TEST_PATH)}
          >
            <div className="flex items-center justify-center w-7 h-7 md:w-9 md:h-9">
              <img 
                src="/clone-assets/media/ic-speaking.3f0031fd.png" 
                alt="Speaking" 
                className="w-full h-full object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://api.dicebear.com/7.x/bottts/svg?seed=speaking';
                }}
              />
            </div>
            <div className="flex items-center gap-0.5">
              <span className="text-white text-[9px] md:text-[10px] font-black uppercase tracking-wider">
                Speaking
              </span>
              <ChevronDown className="w-2.5 h-2.5 text-blue-300" />
            </div>
          </GameNavButton>

          {/* Vocabulary Button */}
          <GameNavButton variant="blue">
            <div className="flex items-center justify-center w-7 h-7 md:w-9 md:h-9">
              <img 
                src="/clone-assets/media/ic-vocab.1dd303ec.png" 
                alt="Vocabulary" 
                className="w-full h-full object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://api.dicebear.com/7.x/bottts/svg?seed=vocab';
                }}
              />
            </div>
            <div className="flex items-center gap-0.5">
              <span className="text-white text-[9px] md:text-[10px] font-black uppercase tracking-wider">
                Vocab
              </span>
              <ChevronDown className="w-2.5 h-2.5 text-blue-300" />
            </div>
          </GameNavButton>

          {/* Luyện Tập Button */}
          <GameNavButton variant="yellow" badgeText="NEW" badgeColor="bg-gradient-to-r from-red-500 to-orange-500">
            <div className="flex items-center justify-center w-7 h-7 md:w-9 md:h-9">
              <span className="text-xl md:text-2xl animate-pulse">⚡</span>
            </div>
            <span className="text-topbar-yellow-text text-[9px] md:text-[10px] font-black uppercase tracking-wider">
              Luyện tập
            </span>
          </GameNavButton>

          {/* Coin Indicator Box */}
          <div className="bg-topbar-blue-bg/80 border-2 border-blue-500/30 rounded-2xl px-3.5 py-1.5 h-[50px] md:h-[55px] flex items-center gap-2 shadow-inner min-w-[90px] md:min-w-[110px]">
            <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-yellow-400 border border-yellow-200 flex items-center justify-center shadow-md animate-[spin_4s_linear_infinite] shrink-0">
              <span className="text-yellow-950 font-black text-sm">C</span>
            </div>
            <div className="flex flex-col">
              <span className="text-blue-300 font-extrabold text-[8px] md:text-[9px] uppercase tracking-wider">COIN</span>
              <span className="text-white font-black text-xs md:text-sm -mt-1">0</span>
            </div>
          </div>

        </div>

        {/* ================= CENTER SECTION ================= */}
        {/* Beautiful 3D Auth Control Box */}
        <div className="flex justify-center shrink-0 mx-auto lg:mx-0">
          <div className="bg-topbar-auth-bg/90 backdrop-blur-md border-3 border-ranking-table-border rounded-2xl p-2 w-[160px] md:w-[180px] flex flex-col gap-1.5 shadow-[0_8px_16px_rgba(0,0,0,0.5)] transform -translate-y-1">
            {/* Đăng Nhập Button */}
            <button 
              onClick={handleLogin}
              className="relative group active:translate-y-[2px] transition-all cursor-pointer w-full text-center"
            >
              <div className="absolute inset-x-0 -bottom-0.5 h-full rounded-lg bg-topbar-login-shadow -z-10 group-active:bottom-0" />
              <div className="bg-topbar-login-bg border border-topbar-login-border text-white font-black text-[10px] md:text-xs py-1 px-3 rounded-lg uppercase tracking-wider hover:bg-blue-500">
                Đăng Nhập
              </div>
            </button>

            {/* Đăng Ký Button */}
            <button 
              className="relative group active:translate-y-[2px] transition-all cursor-pointer w-full text-center"
            >
              <div className="absolute inset-x-0 -bottom-0.5 h-full rounded-lg bg-topbar-signup-shadow -z-10 group-active:bottom-0" />
              <div className="bg-topbar-signup-bg border border-topbar-signup-border text-white font-black text-[10px] md:text-xs py-1 px-3 rounded-lg uppercase tracking-wider hover:bg-red-500">
                Đăng Ký
              </div>
            </button>
          </div>
        </div>

        {/* ================= RIGHT SECTION ================= */}
        <div className="flex flex-wrap items-center gap-1.5 md:gap-2 justify-end">
          
          {/* Diamond Indicator Box with Add Button */}
          <div className="bg-topbar-blue-bg/80 border-2 border-blue-500/30 rounded-2xl px-3.5 py-1.5 h-[50px] md:h-[55px] flex items-center gap-2 shadow-inner min-w-[100px] md:min-w-[125px]">
            <div className="w-7 h-7 md:w-8 md:h-8 shrink-0">
              <img 
                src="/clone-assets/media/icon-diamonds.580d8a36.png" 
                alt="Kim Cương" 
                className="w-full h-full object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://api.dicebear.com/7.x/bottts/svg?seed=diamond';
                }}
              />
            </div>
            <div className="flex flex-col flex-1">
              <span className="text-blue-300 font-extrabold text-[8px] md:text-[9px] uppercase tracking-wider">KIM CƯƠNG</span>
              <span className="text-white font-black text-xs md:text-sm -mt-1">0</span>
            </div>
            <button className="w-5 h-5 rounded-md bg-green-500 hover:bg-green-400 border border-green-600 flex items-center justify-center cursor-pointer text-white font-black text-xs active:scale-90 transition-transform">
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Xếp Hạng Button */}
          <GameNavButton 
            variant="blue" 
            onClick={handleRanking} 
            className={cn(pathname === "/ranking" && "bg-white/10 border-yellow-400")}
          >
            <div className="w-7 h-7 md:w-8 md:h-8 flex items-center justify-center text-yellow-400 shrink-0">
              <Trophy className="w-6 h-6 md:w-7 md:h-7" />
            </div>
            <span className="text-white text-[9px] md:text-[10px] font-black uppercase tracking-wider">
              Xếp hạng
            </span>
          </GameNavButton>

          {/* Lịch Sử Button */}
          <GameNavButton 
            variant="blue"
            onClick={() => router.push("/history")}
            className={cn(pathname === "/history" && "bg-white/10 border-yellow-400")}
          >
            <div className="w-7 h-7 md:w-8 md:h-8 flex items-center justify-center text-violet-400 shrink-0">
              <BookOpen className="w-6 h-6 md:w-7 md:h-7" />
            </div>
            <span className="text-white text-[9px] md:text-[10px] font-black uppercase tracking-wider">
              Lịch sử
            </span>
          </GameNavButton>

          {/* Trường Của Tôi Button */}
          <GameNavButton variant="blue">
            <div className="w-7 h-7 md:w-8 md:h-8 flex items-center justify-center text-emerald-400 shrink-0">
              <School className="w-6 h-6 md:w-7 md:h-7" />
            </div>
            <span className="text-white text-[9px] md:text-[10px] font-black uppercase tracking-wider">
              Trường học
            </span>
          </GameNavButton>

          {/* Nhiệm Vụ Button */}
          <GameNavButton variant="blue">
            <div className="w-7 h-7 md:w-8 md:h-8 flex items-center justify-center text-orange-400 shrink-0">
              <ClipboardList className="w-6 h-6 md:w-7 md:h-7" />
            </div>
            <span className="text-white text-[9px] md:text-[10px] font-black uppercase tracking-wider">
              Nhiệm vụ
            </span>
          </GameNavButton>

          {/* Thông Báo Button */}
          <GameNavButton variant="blue">
            <div className="w-7 h-7 md:w-8 md:h-8 flex items-center justify-center shrink-0">
              <img 
                src="/clone-assets/media/ic_bell.19fd4917.png" 
                alt="Thông báo" 
                className="w-6 h-6 md:w-7 md:h-7 object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://api.dicebear.com/7.x/bottts/svg?seed=bell';
                }}
              />
            </div>
            <span className="text-white text-[9px] md:text-[10px] font-black uppercase tracking-wider">
              Thông báo
            </span>
          </GameNavButton>

          {/* Vietnam Flag / Language Selector (Red circle with yellow star) */}
          <button className="w-10 h-10 md:w-11 md:h-11 rounded-full bg-red-600 border-2 border-yellow-400 flex items-center justify-center cursor-pointer shadow-[0_3px_6px_rgba(0,0,0,0.4)] active:translate-y-[2px] transition-all overflow-hidden relative group shrink-0">
            {/* Red background & Yellow Star representing Vietnam Flag */}
            <div className="absolute inset-0 bg-flag-red flex items-center justify-center">
              <svg viewBox="0 0 30 20" className="w-6.5 h-6.5">
                <polygon 
                  fill="#FFFF00" 
                  points="15,4 16.2,8.8 21.2,8.8 17.2,11.8 18.7,16.6 15,13.6 11.3,16.6 12.8,11.8 8.8,8.8 13.8,8.8"
                />
              </svg>
            </div>
          </button>

        </div>

      </div>
      
    </header>
  );
}
