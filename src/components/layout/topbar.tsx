"use client";

import { useState } from "react";
import { X, AlertTriangle, Play } from "lucide-react";
import { useRouter } from "next/navigation";

export function Topbar() {
  const router = useRouter();
  const [showWarning, setShowWarning] = useState(true);
  const [showChallenge, setShowChallenge] = useState(true);
  const [challengeCode, setChallengeCode] = useState("");

  const handleLogin = () => {
    router.push("/login");
  };

  return (
    <header className="w-full flex flex-col absolute top-0 left-0 z-50">
      
      {/* 3D Warning Banner for Trial Status */}
      {showWarning && (
        <div className="bg-gradient-to-r from-amber-200 via-yellow-100 to-amber-200 text-amber-950 px-4 md:px-8 py-3 w-full flex flex-col md:flex-row items-center justify-between text-xs sm:text-sm font-semibold shadow-md gap-4 md:gap-0 border-b-2 border-amber-300 transition-all duration-300 animate-in fade-in slide-in-from-top-2">
          
          <div className="flex items-center gap-2.5 text-center md:text-left select-none">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 animate-bounce" />
            <span>
              <strong className="font-black uppercase tracking-wider text-amber-900 mr-1">Thông báo:</strong> 
              Hiện bạn đang dùng thử. Hãy đăng nhập để lưu trữ lịch sử học tập, đáp án và mở khóa toàn bộ bài học!
            </span>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {/* 3D Mini Login Button */}
            <button 
              onClick={handleLogin}
              className="relative group active:translate-y-[2px] transition-all cursor-pointer"
            >
              <div className="absolute inset-x-0 -bottom-0.5 h-full rounded-full bg-[#1e40af] -z-10 group-active:bottom-0" />
              <div className="bg-blue-600 hover:bg-blue-500 text-white font-black px-4 py-1.5 rounded-full text-xs uppercase tracking-wider border border-[#1d4ed8]">
                Đăng Nhập
              </div>
            </button>

            {/* 3D Mini Register Button */}
            <button 
              className="relative group active:translate-y-[2px] transition-all cursor-pointer"
            >
              <div className="absolute inset-x-0 -bottom-0.5 h-full rounded-full bg-[#991b1b] -z-10 group-active:bottom-0" />
              <div className="bg-red-600 hover:bg-red-500 text-white font-black px-4 py-1.5 rounded-full text-xs uppercase tracking-wider border border-[#b91c1c]">
                Đăng Ký
              </div>
            </button>

            <button 
              onClick={() => setShowWarning(false)}
              className="ml-2 text-amber-800 hover:text-amber-950 bg-transparent hover:bg-amber-300/40 p-1.5 rounded-full transition-colors cursor-pointer"
              aria-label="Tắt thông báo"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

        </div>
      )}

      {/* 3D Challenge Box */}
      {showChallenge && (
        <div className="mt-4 ml-4 md:ml-8 transition-all duration-300 animate-in fade-in slide-in-from-left-2">
          <div className="relative inline-flex items-center bg-[#0a1a3a]/90 backdrop-blur-md border-2 border-blue-500/40 rounded-2xl p-1.5 shadow-[0_10px_20px_rgba(0,0,0,0.4)]">
            
            <input 
              type="text" 
              placeholder="Mã thách đấu..." 
              value={challengeCode}
              onChange={(e) => setChallengeCode(e.target.value)}
              className="bg-[#052b61] text-white placeholder-blue-300/40 px-4 py-2.5 rounded-xl outline-none w-[150px] md:w-[190px] text-xs font-black border border-blue-500/20 shadow-inner tracking-widest uppercase"
            />
            
            {/* 3D Join Button */}
            <button 
              className="ml-2 relative group active:translate-y-[2px] transition-all cursor-pointer"
            >
              <div className="absolute inset-x-0 -bottom-0.5 h-full rounded-xl bg-[#991b1b] -z-10 group-active:bottom-0" />
              <div className="bg-red-600 hover:bg-red-500 text-white font-black px-4 py-2.5 rounded-xl text-xs uppercase tracking-widest border border-[#b91c1c] flex items-center gap-1">
                <Play className="w-3 h-3 fill-white" />
                Tham Gia
              </div>
            </button>

            {/* Close Button */}
            <button 
              onClick={() => setShowChallenge(false)}
              className="absolute -top-2.5 -right-2.5 bg-white text-gray-800 hover:bg-gray-100 hover:text-red-500 rounded-full p-1 shadow-md transition-all z-10 border border-gray-200 cursor-pointer"
              aria-label="Tắt thách đấu"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}

    </header>
  );
}
