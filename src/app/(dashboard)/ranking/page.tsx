"use client";

import { Search, Trophy, MapPin, School, Filter } from "lucide-react";
import { useState } from "react";

import { RankingTable } from "@/components/ranking/ranking-table";
import { cn } from "@/lib/utils";

export default function RankingPage() {
  const [activeTab, setActiveTab] = useState<"day" | "week" | "month" | "year">("day");
  const [entityTab, setEntityTab] = useState<"student" | "school">("student");

  return (
    <div className="w-full max-w-7xl mx-auto px-4 md:px-8 py-4 md:py-6 pb-[120px] flex flex-col items-center z-10 text-shadow-game-title">
      
      {/* Title with beautiful 3D text shadow */}
      <h1 
        className="text-4xl md:text-5xl font-black text-white uppercase tracking-wider mb-5 drop-shadow-lg text-center font-heading text-shadow-game-title"
        
      >
        BẢNG XẾP HẠNG
      </h1>

      {/* Gamified Filters Panel */}
      <div className="w-full bg-ranking-table-bg backdrop-blur-sm rounded-[2rem] p-5 border-3 border-ranking-table-border shadow-[0_15px_30px_rgba(0,0,0,0.4)] mb-6 flex flex-col gap-4 text-shadow-game-title">
        
        <div className="flex items-center gap-2 text-white/80 font-black text-sm uppercase tracking-wider border-b border-white/10 pb-3 text-shadow-game-title">
          <Filter className="w-4 h-4 text-orange-400 text-shadow-game-title" />
          <span>Bộ lọc nâng cao</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-center w-full text-shadow-game-title">
          {/* Search Box */}
          <div className="flex items-center bg-game-input-focus-shadow rounded-xl px-4 py-3 border-2 border-ranking-table-border focus-within:border-blue-400 transition-all shadow-inner w-full text-shadow-game-title">
            <Search className="w-5 h-5 text-blue-300 mr-2 shrink-0 text-shadow-game-title" />
            <input 
              type="text" 
              placeholder="Mã lớp / Mã thách đấu..." 
              className="bg-transparent border-none outline-none text-white font-semibold text-sm placeholder:text-blue-300/40 w-full text-shadow-game-title"
            />
          </div>
          
          {/* Level Select */}
          <div className="relative w-full text-shadow-game-title">
            <select className="w-full bg-game-input-focus-shadow hover:bg-game-input-hover-bg rounded-xl px-4 py-3 border-2 border-ranking-table-border focus:border-blue-400 text-white font-semibold text-sm outline-none appearance-none cursor-pointer shadow-inner text-shadow-game-title">
              <option value="" disabled selected className="bg-dropdown-bg text-white text-shadow-game-title">Chọn cấp độ</option>
              <option value="ioe" className="bg-dropdown-bg text-white text-shadow-game-title">IOE</option>
              <option value="starters" className="bg-dropdown-bg text-white text-shadow-game-title">Starters (Pre A1)</option>
              <option value="movers" className="bg-dropdown-bg text-white text-shadow-game-title">Movers (A1)</option>
              <option value="flyers" className="bg-dropdown-bg text-white text-shadow-game-title">Flyers (A2)</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-blue-300 text-shadow-game-title">
              <Trophy className="w-4 h-4 text-shadow-game-title" />
            </div>
          </div>

          {/* City Select */}
          <div className="relative w-full text-shadow-game-title">
            <select className="w-full bg-game-input-focus-shadow hover:bg-game-input-hover-bg rounded-xl px-4 py-3 border-2 border-ranking-table-border focus:border-blue-400 text-white font-semibold text-sm outline-none appearance-none cursor-pointer shadow-inner text-shadow-game-title">
              <option value="" disabled selected className="bg-dropdown-bg text-white text-shadow-game-title">Tỉnh / Thành phố</option>
              <option value="hn" className="bg-dropdown-bg text-white text-shadow-game-title">Hà Nội</option>
              <option value="hcm" className="bg-dropdown-bg text-white text-shadow-game-title">Hồ Chí Minh</option>
              <option value="dn" className="bg-dropdown-bg text-white text-shadow-game-title">Đà Nẵng</option>
              <option value="bd" className="bg-dropdown-bg text-white text-shadow-game-title">Bình Dương</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-blue-300 text-shadow-game-title">
              <MapPin className="w-4 h-4 text-shadow-game-title" />
            </div>
          </div>

          {/* School Select */}
          <div className="relative w-full text-shadow-game-title">
            <select className="w-full bg-game-input-focus-shadow hover:bg-game-input-hover-bg rounded-xl px-4 py-3 border-2 border-ranking-table-border focus:border-blue-400 text-white font-semibold text-sm outline-none appearance-none cursor-pointer shadow-inner text-shadow-game-title">
              <option value="" disabled selected className="bg-dropdown-bg text-white text-shadow-game-title">Trường / Trung tâm</option>
              <option value="all" className="bg-dropdown-bg text-white text-shadow-game-title">Tất cả các trường</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-blue-300 text-shadow-game-title">
              <School className="w-4 h-4 text-shadow-game-title" />
            </div>
          </div>
        </div>

      </div>

      {/* Tabs Layout */}
      <div className="w-full flex flex-col md:flex-row gap-5 justify-between items-center mb-6 text-shadow-game-title">
        
        {/* Time Tabs (Bubbly Pill style) */}
        <div className="flex gap-1 p-1.5 bg-game-input-focus-shadow/80 backdrop-blur-sm rounded-full border-2 border-ranking-table-border shadow-lg text-shadow-game-title">
          {(["day", "week", "month", "year"] as const).map((tab) => {
            const label = {
              day: "NGÀY",
              week: "TUẦN",
              month: "THÁNG",
              year: "NĂM"
            }[tab];
            
            const isSelected = activeTab === tab;
            
            return isSelected ? (
              <button
                key={tab}
                className="px-5 py-1.5 rounded-full min-h-[36px] text-xs font-black w-24 text-white bg-orange-500 border-b-3 border-orange-700 shadow-[0_3px_6px_rgba(0,0,0,0.35)] text-shadow-game-title"
              >
                {label}
              </button>
            ) : (
              <button 
                key={tab} 
                onClick={() => setActiveTab(tab)}
                className="px-5 py-1.5 rounded-full text-blue-200/70 hover:text-white hover:bg-white/5 font-extrabold transition-all text-xs tracking-wider uppercase cursor-pointer w-24 text-shadow-game-title"
              >
                {label}
              </button>
            );
          })}
        </div>

        {/* Entity Tabs with bold text and custom highlights */}
        <div className="flex gap-8 text-shadow-game-title">
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
      <div className="w-full transition-all duration-300 animate-in fade-in duration-500 slide-in-from-bottom-5 text-shadow-game-title">
        <RankingTable />
      </div>

    </div>
  );
}
