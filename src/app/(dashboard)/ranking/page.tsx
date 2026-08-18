"use client";

import { useState } from "react";
import { RankingTable } from "@/components/ranking/ranking-table";
import { GameButton } from "@/components/ui/game-button";
import { Search, Trophy, MapPin, School, Filter } from "lucide-react";
import { cn } from "@/lib/utils";

export default function RankingPage() {
  const [activeTab, setActiveTab] = useState<"day" | "week" | "month" | "year">("day");
  const [entityTab, setEntityTab] = useState<"student" | "school">("student");

  return (
    <div className="w-full max-w-7xl mx-auto px-4 md:px-8 py-6 md:py-10 pb-28 flex flex-col items-center z-10">
      
      {/* Title with beautiful 3D text shadow */}
      <h1 
        className="text-4xl md:text-5xl font-black text-white uppercase tracking-wider mb-8 drop-shadow-lg text-center font-heading"
        style={{
          textShadow: "0px 4px 0px #1e3a8a, 0px -2px 0px #1e3a8a, 2px 0px 0px #1e3a8a, -2px 0px 0px #1e3a8a, 0px 8px 15px rgba(0,0,0,0.5)"
        }}
      >
        BẢNG XẾP HẠNG
      </h1>

      {/* Gamified Filters Panel */}
      <div className="w-full bg-[#0a1a3a]/80 backdrop-blur-md rounded-[2rem] p-6 border-3 border-[#1e3a8a] shadow-[0_15px_30px_rgba(0,0,0,0.4)] mb-8 flex flex-col gap-5">
        
        <div className="flex items-center gap-2 text-white/80 font-black text-sm uppercase tracking-wider border-b border-white/10 pb-3">
          <Filter className="w-4 h-4 text-orange-400" />
          <span>Bộ lọc nâng cao</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-center w-full">
          {/* Search Box */}
          <div className="flex items-center bg-[#072450] rounded-xl px-4 py-3 border-2 border-[#1e3a8a] focus-within:border-blue-400 transition-all shadow-inner w-full">
            <Search className="w-5 h-5 text-blue-300 mr-2 shrink-0" />
            <input 
              type="text" 
              placeholder="Mã lớp / Mã thách đấu..." 
              className="bg-transparent border-none outline-none text-white font-semibold text-sm placeholder:text-blue-300/40 w-full"
            />
          </div>
          
          {/* Level Select */}
          <div className="relative w-full">
            <select className="w-full bg-[#072450] hover:bg-[#092e62] rounded-xl px-4 py-3 border-2 border-[#1e3a8a] focus:border-blue-400 text-white font-semibold text-sm outline-none appearance-none cursor-pointer shadow-inner">
              <option value="" disabled selected className="bg-[#0a1a3a] text-white">Chọn cấp độ</option>
              <option value="ioe" className="bg-[#0a1a3a] text-white">IOE</option>
              <option value="starters" className="bg-[#0a1a3a] text-white">Starters (Pre A1)</option>
              <option value="movers" className="bg-[#0a1a3a] text-white">Movers (A1)</option>
              <option value="flyers" className="bg-[#0a1a3a] text-white">Flyers (A2)</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-blue-300">
              <Trophy className="w-4 h-4" />
            </div>
          </div>

          {/* City Select */}
          <div className="relative w-full">
            <select className="w-full bg-[#072450] hover:bg-[#092e62] rounded-xl px-4 py-3 border-2 border-[#1e3a8a] focus:border-blue-400 text-white font-semibold text-sm outline-none appearance-none cursor-pointer shadow-inner">
              <option value="" disabled selected className="bg-[#0a1a3a] text-white">Tỉnh / Thành phố</option>
              <option value="hn" className="bg-[#0a1a3a] text-white">Hà Nội</option>
              <option value="hcm" className="bg-[#0a1a3a] text-white">Hồ Chí Minh</option>
              <option value="dn" className="bg-[#0a1a3a] text-white">Đà Nẵng</option>
              <option value="bd" className="bg-[#0a1a3a] text-white">Bình Dương</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-blue-300">
              <MapPin className="w-4 h-4" />
            </div>
          </div>

          {/* School Select */}
          <div className="relative w-full">
            <select className="w-full bg-[#072450] hover:bg-[#092e62] rounded-xl px-4 py-3 border-2 border-[#1e3a8a] focus:border-blue-400 text-white font-semibold text-sm outline-none appearance-none cursor-pointer shadow-inner">
              <option value="" disabled selected className="bg-[#0a1a3a] text-white">Trường / Trung tâm</option>
              <option value="all" className="bg-[#0a1a3a] text-white">Tất cả các trường</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-blue-300">
              <School className="w-4 h-4" />
            </div>
          </div>
        </div>

      </div>

      {/* Tabs Layout */}
      <div className="w-full flex flex-col md:flex-row gap-6 justify-between items-center mb-8">
        
        {/* Time Tabs (Bubbly Pill style) */}
        <div className="flex gap-1 p-1.5 bg-[#072450]/80 backdrop-blur-md rounded-full border-2 border-[#1e3a8a] shadow-lg">
          {(["day", "week", "month", "year"] as const).map((tab) => {
            const label = {
              day: "NGÀY",
              week: "TUẦN",
              month: "THÁNG",
              year: "NĂM"
            }[tab];
            
            const isSelected = activeTab === tab;
            
            return isSelected ? (
              <GameButton 
                key={tab} 
                variant="primary" 
                className="px-5 py-1.5 rounded-full min-h-[36px] text-xs font-black w-24"
              >
                {label}
              </GameButton>
            ) : (
              <button 
                key={tab} 
                onClick={() => setActiveTab(tab)}
                className="px-5 py-1.5 rounded-full text-blue-200/70 hover:text-white hover:bg-white/5 font-extrabold transition-all text-xs tracking-wider uppercase cursor-pointer w-24"
              >
                {label}
              </button>
            );
          })}
        </div>

        {/* Entity Tabs with bold text and custom highlights */}
        <div className="flex gap-8">
          <button 
            onClick={() => setEntityTab("student")}
            className={cn(
              "font-heading font-black text-xl uppercase tracking-wider transition-all duration-300 relative pb-1 cursor-pointer",
              entityTab === "student" 
                ? "text-yellow-400 after:content-[''] after:absolute after:bottom-[-4px] after:left-0 after:w-full after:h-[4px] after:bg-gradient-to-r after:from-yellow-300 after:to-amber-500 after:rounded-full drop-shadow-[0_2px_4px_rgba(234,179,8,0.3)]" 
                : "text-white/40 hover:text-white/70"
            )}
          >
            Học sinh xuất sắc
          </button>
          <button 
            onClick={() => setEntityTab("school")}
            className={cn(
              "font-heading font-black text-xl uppercase tracking-wider transition-all duration-300 relative pb-1 cursor-pointer",
              entityTab === "school" 
                ? "text-yellow-400 after:content-[''] after:absolute after:bottom-[-4px] after:left-0 after:w-full after:h-[4px] after:bg-gradient-to-r after:from-yellow-300 after:to-amber-500 after:rounded-full drop-shadow-[0_2px_4px_rgba(234,179,8,0.3)]" 
                : "text-white/40 hover:text-white/70"
            )}
          >
            Trường học tích cực
          </button>
        </div>

      </div>

      {/* Main Ranking Table Card */}
      <div className="w-full transition-all duration-300 animate-in fade-in duration-500 slide-in-from-bottom-5">
        <RankingTable />
      </div>

    </div>
  );
}
