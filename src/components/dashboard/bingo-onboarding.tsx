"use client";

import Image from "next/image";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export function BingoOnboarding() {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 -z-10">
        <Image
          src="/clone-assets/bg.1e17df80.png"
          alt="Space Background"
          fill
          className="object-cover"
          priority
        />
        
        {/* Glow Effects */}
        <div className="absolute -bottom-[200px] -left-[100px] w-[600px] h-[600px] rounded-full blur-[80px] opacity-30 bg-[radial-gradient(circle,#7c3aed_0%,transparent_70%)]" />
        <div className="absolute -top-[100px] -right-[100px] w-[500px] h-[500px] rounded-full blur-[80px] opacity-30 bg-[radial-gradient(circle,#6366f1_0%,transparent_70%)]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full blur-[80px] opacity-15 bg-[radial-gradient(circle,#a78bfa_0%,transparent_70%)]" />
      </div>

      {/* Logout Button */}
      <div className="absolute top-6 right-6 md:right-28">
        <Button 
          variant="outline" 
          className="bg-white/10 text-white border-none hover:bg-white/20 font-bold px-4 py-2 flex items-center gap-2"
          onClick={() => {}}
        >
          <Image src="/clone-assets/ic-logout.7baec1b3.png" alt="Logout" width={24} height={24} />
          Đăng xuất
        </Button>
      </div>

      {/* Main Content */}
      <div className="relative w-full max-w-[1200px] px-4 md:px-10 flex flex-col md:flex-row items-center justify-center gap-8">
        
        {/* Bingo Mascot */}
        <div className="relative w-[300px] h-[300px] md:w-[500px] md:h-[500px] shrink-0">
          <Image
            src="/clone-assets/logo.46df16c4.png"
            alt="Bingo Mascot"
            fill
            className="object-contain drop-shadow-2xl"
          />
        </div>

        {/* Speech Bubble */}
        <div className="relative flex-1 max-w-[600px] animate-in slide-in-from-bottom-10 fade-in duration-500">
          {/* Bubble Tail */}
          <div className="absolute -left-4 top-1/2 -translate-y-1/2 w-0 h-0 border-y-[15px] border-y-transparent border-r-[20px] border-r-white hidden md:block" />
          
          <Card className="p-6 md:p-8 bg-white rounded-2xl shadow-[0_8px_0_0_#5eccf7] border-none">
            <h1 className="text-4xl md:text-[40px] font-extrabold text-[#323131] uppercase mb-4 tracking-wide" style={{ textShadow: "0px 2px 0px rgba(0,0,0,0.1)" }}>
              BINGO
            </h1>
            
            <div className="text-lg md:text-[24px] leading-relaxed font-bold text-[#323131] space-y-4">
              <p>Xin chào! Mình là Bingo đến từ Hành tinh FLYER.</p>
              <p>Một con quái vật đã lấy mất những Viên Đá Tri Thức của chúng mình. Không có chúng, hành tinh của mình trở nên tăm tối!</p>
              <p>Mình không thể lấy lại chúng một mình…</p>
              <p>Bạn có muốn tham gia cuộc phiêu lưu với mình không?</p>
              <p>Bắt đầu nào!</p>
            </div>

            <div className="mt-8">
              <Button 
                onClick={() => setIsVisible(false)}
                className="w-[200px] h-14 rounded-2xl text-lg font-black text-white uppercase tracking-wider
                         bg-gradient-to-b from-[#00c8ff] to-[#0075fb] hover:opacity-95 hover:scale-105 active:scale-95 transition-all
                         border-2 border-[#006cd2] shadow-[0_4px_0_0_#0048ff]"
              >
                Đi thôi!
              </Button>
            </div>
          </Card>
        </div>

      </div>
    </div>
  );
}
