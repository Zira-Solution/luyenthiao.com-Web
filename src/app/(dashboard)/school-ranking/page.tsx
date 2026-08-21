"use client";

import { MapPin, School } from "lucide-react";
import { useState } from "react";

import { SchoolRankingTable } from "@/components/ranking/school-ranking-table";
import { GameButton } from "@/components/ui/game-button";

export default function SchoolRankingPage() {
  const [activeTab, setActiveTab] = useState<"day" | "week" | "month" | "year">("day");

  return (
    <div className="w-full max-w-7xl mx-auto px-4 md:px-8 py-4 md:py-6 pb-[120px] flex flex-col items-center z-10">
      
      {/* Title */}
      <h1 className="text-4xl md:text-5xl font-black text-white uppercase tracking-wider mb-5 drop-shadow-lg text-center font-heading text-shadow-game-title">
        BẢNG XẾP HẠNG TRƯỜNG HỌC
      </h1>

      {/* Gamified Filters Panel */}
      <div className="w-full bg-ranking-table-bg backdrop-blur-sm rounded-[2rem] p-5 border-3 border-ranking-table-border shadow-[0_15px_30px_rgba(0,0,0,0.4)] mb-6 flex flex-col gap-4">
        
        <div className="flex items-center gap-2 text-white/80 font-black text-sm uppercase tracking-wider border-b border-white/10 pb-3">
          <School className="w-4 h-4 text-emerald-400" />
          <span>Bộ lọc trường học</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-center w-full">
          {/* Level Select */}
          <div className="relative w-full">
            <select className="w-full bg-game-input-focus-shadow hover:bg-game-input-hover-bg rounded-xl px-4 py-3 border-2 border-ranking-table-border focus:border-blue-400 text-white font-semibold text-sm outline-none appearance-none cursor-pointer shadow-inner">
              <option value="" disabled selected className="bg-dropdown-bg text-white">Chọn cấp độ</option>
              <option value="ioe" className="bg-dropdown-bg text-white">IOE</option>
              <option value="starters" className="bg-dropdown-bg text-white">Starters (Pre A1)</option>
              <option value="movers" className="bg-dropdown-bg text-white">Movers (A1)</option>
              <option value="flyers" className="bg-dropdown-bg text-white">Flyers (A2)</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-blue-300">
              <School className="w-4 h-4" />
            </div>
          </div>

          {/* City Select */}
          <div className="relative w-full">
            <select className="w-full bg-game-input-focus-shadow hover:bg-game-input-hover-bg rounded-xl px-4 py-3 border-2 border-ranking-table-border focus:border-blue-400 text-white font-semibold text-sm outline-none appearance-none cursor-pointer shadow-inner">
              <option value="" disabled selected className="bg-dropdown-bg text-white">Tỉnh / Thành phố</option>
              <option value="hn" className="bg-dropdown-bg text-white">Hà Nội</option>
              <option value="hcm" className="bg-dropdown-bg text-white">Hồ Chí Minh</option>
              <option value="dn" className="bg-dropdown-bg text-white">Đà Nẵng</option>
              <option value="bd" className="bg-dropdown-bg text-white">Bình Dương</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-blue-300">
              <MapPin className="w-4 h-4" />
            </div>
          </div>

          {/* Time Period Select */}
          <div className="relative w-full">
            <select className="w-full bg-game-input-focus-shadow hover:bg-game-input-hover-bg rounded-xl px-4 py-3 border-2 border-ranking-table-border focus:border-blue-400 text-white font-semibold text-sm outline-none appearance-none cursor-pointer shadow-inner">
              <option value="day" className="bg-dropdown-bg text-white">Hôm nay</option>
              <option value="week" className="bg-dropdown-bg text-white">Tuần này</option>
              <option value="month" className="bg-dropdown-bg text-white">Tháng này</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-blue-300">
              <School className="w-4 h-4" />
            </div>
          </div>
        </div>

      </div>

      {/* Time Tabs (Bubbly Pill style) */}
      <div className="w-full flex flex-col md:flex-row gap-5 justify-between items-center mb-6">
        <div className="flex gap-1 p-1.5 bg-game-input-focus-shadow/80 backdrop-blur-sm rounded-full border-2 border-ranking-table-border shadow-lg">
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
      </div>

      {/* Main Ranking Table Card */}
      <div className="w-full transition-all duration-300 animate-in fade-in duration-500 slide-in-from-bottom-5">
        <SchoolRankingTable />
      </div>

    </div>
  );
}