"use client";

import { Search, ChevronLeft, Shield, Filter, Calendar, Award, BookOpen, CheckCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { cn } from "@/lib/utils";
import historyMocks from "@/mocks/history.json";

export default function HistoryPage() {
  const router = useRouter();
  
  // Filter States
  const [selectedLevel, setSelectedLevel] = useState<string>("all");
  const [selectedSkill, setSelectedSkill] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  
  // Toggle to simulate logged-in populated state vs default trial empty state
  const [isTrialMode, setIsTrialMode] = useState<boolean>(true);

  // Filter logic
  const filteredHistory = historyMocks.filter((item) => {
    const matchesLevel = selectedLevel === "all" || item.level.toLowerCase().includes(selectedLevel.toLowerCase());
    const matchesSkill = selectedSkill === "all" || item.skill.toLowerCase().includes(selectedSkill.toLowerCase());
    const matchesStatus = selectedStatus === "all" || item.status === selectedStatus;
    const matchesSearch = searchQuery === "" || item.examName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesLevel && matchesSkill && matchesStatus && matchesSearch;
  });

  return (
    <div className="w-full max-w-7xl mx-auto px-4 md:px-8 py-4 md:py-6 pb-[120px] flex flex-col items-center z-10 animate-in fade-in duration-500 text-shadow-game-title">
      
      {/* Top Navigation & Action Header */}
      <div className="w-full flex items-center justify-between mb-5 gap-4 text-shadow-game-title">
        <button 
          onClick={() => router.push("/")}
          className="flex items-center gap-1.5 md:gap-2 px-4 py-2 rounded-2xl bg-topbar-blue-bg/80 border-2 border-blue-500/30 hover:bg-topbar-blue-hover active:translate-y-[2px] transition-all text-white font-black text-xs md:text-sm tracking-wider uppercase cursor-pointer text-shadow-game-title"
        >
          <ChevronLeft className="w-4 h-4 md:w-5 md:h-5 text-yellow-450 text-shadow-game-title" />
          <span>Quay lại</span>
        </button>

        {/* Mode Toggle Banner (Helpful for testing both UI designs requested by spec) */}
        <div className="hidden sm:flex items-center bg-game-input-focus-shadow/90 border border-blue-500/40 px-3.5 py-1.5 rounded-full text-[10px] md:text-xs font-bold text-blue-200 shadow-md text-shadow-game-title">
          <span className="mr-2 text-shadow-game-title">Trạng thái:</span>
          <button 
            onClick={() => setIsTrialMode(true)}
            className={cn(
              "px-3 py-1 rounded-full cursor-pointer uppercase transition-all tracking-wider text-[10px]",
              isTrialMode ? "bg-red-500 text-white font-black" : "hover:text-white"
            )}
          >
            Dùng thử (Trống)
          </button>
          <button 
            onClick={() => setIsTrialMode(false)}
            className={cn(
              "px-3 py-1 rounded-full cursor-pointer uppercase transition-all tracking-wider text-[10px]",
              !isTrialMode ? "bg-green-500 text-white font-black" : "hover:text-white"
            )}
          >
            Đã đăng nhập (Có dữ liệu)
          </button>
        </div>

        <button 
          onClick={() => alert("Đang chuyển hướng đến trang đổi khiên...")}
          className="relative group active:translate-y-[2px] transition-all cursor-pointer rounded-2xl border-b-4 border-topbar-orange-border bg-topbar-orange-bg hover:bg-topbar-orange-hover active:bg-topbar-orange-active px-4 py-2 flex items-center gap-2 shadow-[0_4px_6px_rgba(0,0,0,0.3)] shrink-0 text-shadow-game-title"
        >
          <Shield className="w-4 h-4 text-yellow-350 fill-yellow-350 animate-bounce text-shadow-game-title" />
          <span className="text-white text-[10px] md:text-xs font-black uppercase tracking-wider text-shadow-game-title">
            Quy đổi khiên
          </span>
        </button>
      </div>

      {/* Main Title */}
      <h1 
        className="text-4xl md:text-5xl font-black text-white uppercase tracking-wider mb-5 drop-shadow-lg text-center font-heading text-shadow-game-title"
        
      >
        LỊCH SỬ LÀM BÀI
      </h1>

      {/* Interactive Mode Toggle for mobile/small screens */}
      <div className="flex sm:hidden items-center justify-center bg-game-input-focus-shadow/90 border border-blue-500/40 px-3.5 py-1.5 rounded-2xl text-[10px] font-bold text-blue-200 shadow-md mb-6 w-full max-w-xs text-shadow-game-title">
        <button 
          onClick={() => setIsTrialMode(true)}
          className={cn(
            "flex-1 py-1.5 rounded-lg cursor-pointer uppercase transition-all tracking-wider text-[9px] text-center",
            isTrialMode ? "bg-red-500 text-white font-black" : "hover:text-white"
          )}
        >
          Dùng thử
        </button>
        <button 
          onClick={() => setIsTrialMode(false)}
          className={cn(
            "flex-1 py-1.5 rounded-lg cursor-pointer uppercase transition-all tracking-wider text-[9px] text-center",
            !isTrialMode ? "bg-green-500 text-white font-black" : "hover:text-white"
          )}
        >
          Có dữ liệu
        </button>
      </div>

      {/* Filters Panel */}
      <div className="w-full bg-ranking-table-bg backdrop-blur-sm rounded-[2rem] p-5 border-3 border-ranking-table-border shadow-[0_15px_30px_rgba(0,0,0,0.4)] mb-6 flex flex-col gap-4 text-shadow-game-title">
        <div className="flex items-center gap-2 text-white/80 font-black text-sm uppercase tracking-wider border-b border-white/10 pb-3 text-shadow-game-title">
          <Filter className="w-4 h-4 text-orange-400 text-shadow-game-title" />
          <span>Bộ lọc lịch sử</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-center w-full text-shadow-game-title">
          {/* Test Name Search */}
          <div className="flex items-center bg-game-input-focus-shadow rounded-xl px-4 py-3 border-2 border-ranking-table-border focus-within:border-blue-400 transition-all shadow-inner w-full text-shadow-game-title">
            <Search className="w-5 h-5 text-blue-300 mr-2 shrink-0 text-shadow-game-title" />
            <input 
              type="text" 
              placeholder="Tìm tên bài kiểm tra..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-none outline-none text-white font-semibold text-sm placeholder:text-blue-300/40 w-full text-shadow-game-title"
            />
          </div>
          
          {/* Level Filter */}
          <div className="relative w-full text-shadow-game-title">
            <select 
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              className="w-full bg-game-input-focus-shadow hover:bg-game-input-hover-bg rounded-xl px-4 py-3 border-2 border-ranking-table-border focus:border-blue-400 text-white font-semibold text-sm outline-none appearance-none cursor-pointer shadow-inner text-shadow-game-title"
            >
              <option value="all" className="bg-dropdown-bg text-white text-shadow-game-title">Tất cả cấp độ</option>
              <option value="ioe" className="bg-dropdown-bg text-white text-shadow-game-title">IOE</option>
              <option value="starters" className="bg-dropdown-bg text-white text-shadow-game-title">Starters (Pre A1)</option>
              <option value="movers" className="bg-dropdown-bg text-white text-shadow-game-title">Movers (A1)</option>
              <option value="flyers" className="bg-dropdown-bg text-white text-shadow-game-title">Flyers (A2)</option>
              <option value="toefl" className="bg-dropdown-bg text-white text-shadow-game-title">TOEFL Primary</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-blue-300 text-shadow-game-title">
              <Award className="w-4 h-4 text-shadow-game-title" />
            </div>
          </div>

          {/* Skill Filter */}
          <div className="relative w-full text-shadow-game-title">
            <select 
              value={selectedSkill}
              onChange={(e) => setSelectedSkill(e.target.value)}
              className="w-full bg-game-input-focus-shadow hover:bg-game-input-hover-bg rounded-xl px-4 py-3 border-2 border-ranking-table-border focus:border-blue-400 text-white font-semibold text-sm outline-none appearance-none cursor-pointer shadow-inner text-shadow-game-title"
            >
              <option value="all" className="bg-dropdown-bg text-white text-shadow-game-title">Tất cả kĩ năng</option>
              <option value="listening" className="bg-dropdown-bg text-white text-shadow-game-title">Listening (Nghe)</option>
              <option value="reading" className="bg-dropdown-bg text-white text-shadow-game-title">Reading & Writing (Đọc & Viết)</option>
              <option value="speaking" className="bg-dropdown-bg text-white text-shadow-game-title">Speaking (Nói)</option>
              <option value="writing" className="bg-dropdown-bg text-white text-shadow-game-title">Writing (Viết)</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-blue-300 text-shadow-game-title">
              <BookOpen className="w-4 h-4 text-shadow-game-title" />
            </div>
          </div>

          {/* Status Filter */}
          <div className="relative w-full text-shadow-game-title">
            <select 
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full bg-game-input-focus-shadow hover:bg-game-input-hover-bg rounded-xl px-4 py-3 border-2 border-ranking-table-border focus:border-blue-400 text-white font-semibold text-sm outline-none appearance-none cursor-pointer shadow-inner text-shadow-game-title"
            >
              <option value="all" className="bg-dropdown-bg text-white text-shadow-game-title">Tất cả trạng thái</option>
              <option value="Hoàn thành" className="bg-dropdown-bg text-white text-shadow-game-title">Hoàn thành</option>
              <option value="Đang làm" className="bg-dropdown-bg text-white text-shadow-game-title">Đang làm</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-blue-300 text-shadow-game-title">
              <CheckCircle className="w-4 h-4 text-shadow-game-title" />
            </div>
          </div>
        </div>
      </div>

      {/* Trial Notification Banner */}
      {isTrialMode && (
        <div className="w-full bg-gradient-to-r from-amber-500/20 to-orange-500/20 border-2 border-orange-500/40 rounded-3xl p-4 text-center mb-6 shadow-inner animate-pulse text-shadow-game-title">
          <p className="text-yellow-250 font-black text-xs md:text-sm tracking-wider uppercase drop-shadow text-shadow-game-title">
            📢 THÔNG BÁO: Hiện bạn đang ở trạng thái dùng thử. Vui lòng đăng nhập để lưu trữ lịch sử, xem lại bài làm, đáp án và sử dụng trọn vẹn các tính năng của FLYER.
          </p>
          <div className="flex justify-center gap-4 mt-3 text-shadow-game-title">
            <button 
              onClick={() => router.push("/login")}
              className="px-4 py-1.5 rounded-xl bg-topbar-login-bg hover:bg-blue-500 text-white font-black text-[10px] md:text-xs uppercase tracking-wider border-b-3 border-topbar-login-border text-shadow-game-title"
            >
              Đăng Nhập
            </button>
            <button 
              onClick={() => alert("Chuyển sang trang Đăng Ký...")}
              className="px-4 py-1.5 rounded-xl bg-topbar-signup-bg hover:bg-red-500 text-white font-black text-[10px] md:text-xs uppercase tracking-wider border-b-3 border-topbar-signup-border text-shadow-game-title"
            >
              Đăng Ký
            </button>
          </div>
        </div>
      )}

      {/* History Content */}
      <div className="w-full bg-ranking-table-bg backdrop-blur-sm rounded-[2.2rem] border-3 border-ranking-table-border p-4 md:p-6 shadow-[0_15px_30px_rgba(0,0,0,0.5)] overflow-hidden text-shadow-game-title">
        {isTrialMode || filteredHistory.length === 0 ? (
          /* Empty State */
          <div className="w-full py-10 flex flex-col items-center justify-center text-center text-shadow-game-title">
            <div className="relative w-36 h-36 md:w-44 md:h-44 mb-6 animate-[floating_4s_ease-in-out_infinite] text-shadow-game-title">
              <img 
                src="/clone-assets/logo.46df16c4.png" 
                alt="Mascot sleeping" 
                className="w-full h-full object-contain filter drop-shadow-[0_8px_16px_rgba(0,0,0,0.4)] opacity-80 text-shadow-game-title"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/clone-assets/media/ic-challenge.9b2229cb.png'; // fallback
                }}
              />
              <span className="absolute -top-1 right-2 text-3xl md:text-4xl animate-bounce text-shadow-game-title">💤</span>
            </div>
            <h2 className="text-white font-black text-lg md:text-2xl tracking-wider mb-2 font-heading text-shadow-game-title">
              HIỆN TẠI CHƯA CÓ LỊCH SỬ BÀI LÀM.
            </h2>
            <p className="text-blue-300 font-extrabold text-xs md:text-sm tracking-widest uppercase text-shadow-game-title">
              CHĂM CHỈ LÀM BÀI HƠN BẠN NHÉ!
            </p>
            {isTrialMode && (
              <button 
                onClick={() => setIsTrialMode(false)}
                className="mt-6 px-5 py-2.5 bg-gradient-to-b from-green-450 to-green-600 hover:from-green-400 hover:to-green-500 border-2 border-green-800 text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-lg hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer text-shadow-game-title"
              >
                Mô phỏng tài khoản đã làm bài 🚀
              </button>
            )}
          </div>
        ) : (
          /* Populated History Table */
          <div className="w-full overflow-x-auto text-shadow-game-title">
            <table className="w-full border-collapse text-left text-shadow-game-title">
              <thead>
                <tr className="border-b-2 border-blue-500/20 text-[10px] md:text-xs font-black text-blue-300 tracking-wider uppercase text-shadow-game-title">
                  <th className="pb-4 pt-2 px-3 flex items-center gap-1.5 text-shadow-game-title">
                    <Calendar className="w-3.5 h-3.5 text-shadow-game-title" />
                    <span>Thời gian nộp bài</span>
                  </th>
                  <th className="pb-4 pt-2 px-3 text-shadow-game-title">Cấp độ</th>
                  <th className="pb-4 pt-2 px-3 text-shadow-game-title">Kĩ năng</th>
                  <th className="pb-4 pt-2 px-3 text-shadow-game-title">Đề thi</th>
                  <th className="pb-4 pt-2 px-3 text-center text-shadow-game-title">Điểm số</th>
                  <th className="pb-4 pt-2 px-3 text-center text-shadow-game-title">Số câu đúng</th>
                  <th className="pb-4 pt-2 px-3 text-center text-shadow-game-title">Trạng thái</th>
                  <th className="pb-4 pt-2 px-3 text-center text-shadow-game-title">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-blue-500/10 text-white font-semibold text-xs md:text-sm text-shadow-game-title">
                {filteredHistory.map((item) => (
                  <tr 
                    key={item.id}
                    className="hover:bg-white/5 transition-colors group text-shadow-game-title"
                  >
                    <td className="py-4 px-3 text-white/70 whitespace-nowrap text-shadow-game-title">
                      {item.submitTime}
                    </td>
                    <td className="py-4 px-3 whitespace-nowrap text-shadow-game-title">
                      <span className={cn(
                        "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider border",
                        item.level.includes("Starters") && "bg-green-500/10 border-green-500/30 text-green-400",
                        item.level.includes("Movers") && "bg-red-500/10 border-red-500/30 text-red-400",
                        item.level.includes("Flyers") && "bg-purple-500/10 border-purple-500/30 text-purple-400",
                        item.level.includes("IOE") && "bg-blue-500/10 border-blue-500/30 text-blue-400",
                        item.level.includes("TOEFL") && "bg-amber-500/10 border-amber-500/30 text-amber-400"
                      )}>
                        {item.level}
                      </span>
                    </td>
                    <td className="py-4 px-3 whitespace-nowrap text-blue-200 text-shadow-game-title">
                      {item.skill}
                    </td>
                    <td className="py-4 px-3 font-extrabold max-w-xs truncate group-hover:text-yellow-350 transition-colors text-shadow-game-title">
                      {item.examName}
                    </td>
                    <td className="py-4 px-3 text-center font-black text-yellow-350 text-base drop-shadow-sm text-shadow-game-title">
                      {item.score}
                    </td>
                    <td className="py-4 px-3 text-center font-bold text-green-400 text-shadow-game-title">
                      {item.ratio}
                    </td>
                    <td className="py-4 px-3 text-center whitespace-nowrap text-shadow-game-title">
                      <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold text-shadow-game-title">
                        {item.status}
                      </span>
                    </td>
                    <td className="py-4 px-3 text-center whitespace-nowrap text-shadow-game-title">
                      <button 
                        onClick={() => alert(`Đang tải bài thi: ${item.examName}`)}
                        className="px-3 py-1 bg-topbar-login-border hover:bg-blue-600 border border-blue-400 text-white text-[10px] font-black uppercase tracking-wider rounded-lg active:scale-95 transition-all cursor-pointer text-shadow-game-title"
                      >
                        Xem lại
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Footer Info / Parents QR Code */}
      <div className="w-full bg-topbar-blue-bg/40 backdrop-blur-sm border-2 border-blue-500/20 rounded-[2rem] p-5 mt-6 flex flex-col md:flex-row items-center justify-between gap-5 text-shadow-game-title">
        <div className="flex items-center gap-4 text-shadow-game-title">
          <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center p-1.5 shrink-0 shadow-md text-shadow-game-title">
            {/* Simple Mock QR Code */}
            <svg viewBox="0 0 24 24" className="w-full h-full text-blue-950 text-shadow-game-title">
              <path fill="currentColor" d="M3,3H9V9H3V3M5,5V7H7V5H5M15,3H21V9H15V3M17,5V7H19V5H17M3,15H9V21H3V15M5,17V19H7V17H5M15,15H17V17H15V15M17,17H19V19H17V17M19,15H21V17H19V15M15,19H17V21H15V19M19,19H21V21H19V19M11,3H13V5H11V3M11,7H13V9H11V7M11,11H13V13H11V11M3,11H5V13H3V11M7,11H9V13H7V11M15,11H17V13H15V11M19,11H21V13H19V11M11,15H13V17H11V15M11,19H13V21H11V19Z" />
            </svg>
          </div>
          <div className="flex flex-col text-shadow-game-title">
            <span className="text-white font-extrabold text-sm md:text-base text-shadow-game-title">
              Tải ứng dụng dành cho Thầy Cô / Phụ Huynh
            </span>
            <span className="text-blue-300 font-medium text-xs text-shadow-game-title">
              Quét mã QR tải App để dễ dàng theo dõi chi tiết tiến trình học tập của con.
            </span>
          </div>
        </div>
        <div className="flex gap-3 text-shadow-game-title">
          <a href="#" className="px-4 py-2 bg-topbar-auth-bg hover:bg-black border border-white/10 rounded-xl text-white text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 transition-all text-shadow-game-title">
            <span>Google Play</span>
          </a>
          <a href="#" className="px-4 py-2 bg-topbar-auth-bg hover:bg-black border border-white/10 rounded-xl text-white text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 transition-all text-shadow-game-title">
            <span>App Store</span>
          </a>
        </div>
      </div>

    </div>
  );
}
