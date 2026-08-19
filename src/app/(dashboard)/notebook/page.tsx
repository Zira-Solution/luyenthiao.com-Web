"use client";

import { ChevronLeft, Search, BookOpen, Star, RefreshCw, Volume2, HelpCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { cn } from "@/lib/utils";

interface VocabWord {
  id: string;
  word: string;
  type: string; // noun, verb, adj, etc.
  ipa: string;
  vietnamese: string;
  example: string;
  exampleVietnamese: string;
  level: string;
  starred: boolean;
}

const MOCK_WORDS: VocabWord[] = [
  {
    id: "1",
    word: "Astronaut",
    type: "noun",
    ipa: "/ˈæstrənɔːt/",
    vietnamese: "Phi hành gia",
    example: "The astronaut floats in outer space.",
    exampleVietnamese: "Phi hành gia trôi nổi trong không gian vũ trụ.",
    level: "Starters (Pre A1)",
    starred: true
  },
  {
    id: "2",
    word: "Adventure",
    type: "noun",
    ipa: "/ədˈventʃə(r)/",
    vietnamese: "Cuộc phiêu lưu",
    example: "We had a big adventure on the dinosaur planet.",
    exampleVietnamese: "Chúng tôi đã có một cuộc phiêu lưu lớn trên hành tinh khủng long.",
    level: "Movers (A1)",
    starred: false
  },
  {
    id: "3",
    word: "Knowledge",
    type: "noun",
    ipa: "/ˈnɒlɪdʒ/",
    vietnamese: "Tri thức, kiến thức",
    example: "Books give us valuable knowledge about the world.",
    exampleVietnamese: "Sách mang lại cho chúng ta tri thức quý giá về thế giới.",
    level: "Flyers (A2)",
    starred: true
  },
  {
    id: "4",
    word: "Challenge",
    type: "noun / verb",
    ipa: "/ˈtʃælɪndʒ/",
    vietnamese: "Thách thức, thử thách",
    example: "Completing this grammar quiz is a fun challenge.",
    exampleVietnamese: "Hoàn thành bài trắc nghiệm ngữ pháp này là một thử thách thú vị.",
    level: "TOEFL Primary",
    starred: false
  },
  {
    id: "5",
    word: "Dinosaur",
    type: "noun",
    ipa: "/ˈdaɪnəsɔː(r)/",
    vietnamese: "Khủng long",
    example: "Dinosaurs lived on Earth millions of years ago.",
    exampleVietnamese: "Khủng long đã sống trên Trái đất hàng triệu năm trước.",
    level: "Movers (A1)",
    starred: true
  },
  {
    id: "6",
    word: "Galaxy",
    type: "noun",
    ipa: "/ˈɡæləksi/",
    vietnamese: "Thiên hà",
    example: "Our planet Earth is part of the Milky Way galaxy.",
    exampleVietnamese: "Trái đất của chúng ta là một phần của thiên hà Milky Way.",
    level: "TOEFL Junior",
    starred: false
  }
];

export default function NotebookPage() {
  const router = useRouter();
  
  const [activeCategory, setActiveCategory] = useState<"vocab" | "grammar" | "starred">("vocab");
  const [searchQuery, setSearchQuery] = useState("");
  const [levelFilter, setLevelFilter] = useState("all");
  
  // Flip states of cards by id
  const [flippedCards, setFlippedCards] = useState<Record<string, boolean>>({});
  
  // Starred states of words
  const [starredWords, setStarredWords] = useState<Record<string, boolean>>(
    MOCK_WORDS.reduce((acc, word) => ({ ...acc, [word.id]: word.starred }), {})
  );

  const toggleFlip = (id: string) => {
    setFlippedCards((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleStar = (e: React.MouseEvent, id: string) => {
    e.stopPropagation(); // prevent card flip
    setStarredWords((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleSpeak = (e: React.MouseEvent, text: string) => {
    e.stopPropagation(); // prevent card flip
    if (typeof window !== "undefined" && window.speechSynthesis) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "en-US";
      window.speechSynthesis.speak(utterance);
    }
  };

  // Filter words
  const filteredWords = MOCK_WORDS.filter((word) => {
    const matchesSearch = word.word.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          word.vietnamese.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLevel = levelFilter === "all" || word.level.toLowerCase().includes(levelFilter.toLowerCase());
    const matchesStarred = activeCategory !== "starred" || starredWords[word.id];
    return matchesSearch && matchesLevel && matchesStarred;
  });

  return (
    <div className="w-full max-w-7xl mx-auto px-4 md:px-8 py-6 md:py-10 pb-28 flex flex-col items-center z-10 animate-in fade-in duration-500 text-shadow-game-title">
      
      {/* Header Section */}
      <div className="w-full flex items-center justify-between mb-8 text-shadow-game-title">
        <button 
          onClick={() => router.push("/")}
          className="flex items-center gap-1.5 md:gap-2 px-4 py-2 rounded-2xl bg-topbar-blue-bg/80 border-2 border-blue-500/30 hover:bg-topbar-blue-hover active:translate-y-[2px] transition-all text-white font-black text-xs md:text-sm tracking-wider uppercase cursor-pointer text-shadow-game-title"
        >
          <ChevronLeft className="w-4 h-4 md:w-5 md:h-5 text-yellow-450 text-shadow-game-title" />
          <span>Quay lại</span>
        </button>

        <h1 
          className="text-3xl md:text-5xl font-black text-white uppercase tracking-wider drop-shadow-lg font-heading text-shadow-game-title"
          
        >
          Sổ tay từ vựng
        </h1>

        <div className="bg-topbar-blue-bg/80 border-2 border-blue-500/30 rounded-2xl px-4 py-1.5 flex items-center gap-2 text-shadow-game-title">
          <BookOpen className="w-5 h-5 text-yellow-450 text-shadow-game-title" />
          <span className="text-white font-black text-xs md:text-sm text-shadow-game-title">Notebook</span>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex gap-2 p-1.5 bg-game-input-focus-shadow/80 backdrop-blur-md rounded-full border-2 border-ranking-table-border shadow-lg mb-8 max-w-md w-full justify-between text-shadow-game-title">
        <button 
          onClick={() => setActiveCategory("vocab")}
          className={cn(
            "flex-1 py-2 px-4 rounded-full text-xs font-black uppercase tracking-wider transition-all cursor-pointer text-center",
            activeCategory === "vocab" ? "bg-gradient-to-b from-topbar-login-bg to-topbar-login-border border border-blue-400 text-white shadow-md" : "text-blue-200 hover:text-white"
          )}
        >
          Từ vựng
        </button>
        <button 
          onClick={() => setActiveCategory("grammar")}
          className={cn(
            "flex-1 py-2 px-4 rounded-full text-xs font-black uppercase tracking-wider transition-all cursor-pointer text-center",
            activeCategory === "grammar" ? "bg-gradient-to-b from-topbar-login-bg to-topbar-login-border border border-blue-400 text-white shadow-md" : "text-blue-200 hover:text-white"
          )}
        >
          Ngữ pháp
        </button>
        <button 
          onClick={() => setActiveCategory("starred")}
          className={cn(
            "flex-1 py-2 px-4 rounded-full text-xs font-black uppercase tracking-wider transition-all cursor-pointer text-center",
            activeCategory === "starred" ? "bg-gradient-to-b from-topbar-login-bg to-topbar-login-border border border-blue-400 text-white shadow-md" : "text-blue-200 hover:text-white"
          )}
        >
          Yêu thích ⭐
        </button>
      </div>

      {activeCategory === "grammar" ? (
        /* GRAMMAR VIEW */
        <div className="w-full bg-ranking-table-bg/80 backdrop-blur-md rounded-[2.2rem] p-8 border-3 border-ranking-table-border shadow-[0_15px_30px_rgba(0,0,0,0.5)] max-w-4xl text-shadow-game-title">
          <h2 className="text-white font-black text-xl md:text-2xl font-heading mb-6 border-b border-white/10 pb-3 flex items-center gap-2 text-shadow-game-title">
            <span>📝 Cấu trúc câu quan trọng</span>
          </h2>
          <div className="flex flex-col gap-6 text-shadow-game-title">
            <div className="p-5 rounded-2xl bg-white/5 border border-white/10 text-shadow-game-title">
              <span className="px-2.5 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30 text-[10px] font-black uppercase tracking-wider text-shadow-game-title">Cơ bản</span>
              <h3 className="text-yellow-350 font-black text-lg mt-2 text-shadow-game-title">1. Like + V-ing</h3>
              <p className="text-white/80 text-sm mt-1.5 text-shadow-game-title">Dùng để diễn tả sở thích làm một việc gì đó.</p>
              <div className="mt-3 p-3.5 rounded-xl bg-blue-950/40 text-xs text-blue-200 leading-relaxed font-semibold text-shadow-game-title">
                <span className="block text-white/50 text-[10px] uppercase font-bold mb-1 text-shadow-game-title">Ví dụ:</span>
                I like reading book. (Tôi thích đọc sách)
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white/5 border border-white/10 text-shadow-game-title">
              <span className="px-2.5 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[10px] font-black uppercase tracking-wider text-shadow-game-title">Trung cấp</span>
              <h3 className="text-yellow-350 font-black text-lg mt-2 text-shadow-game-title">2. Conditional Sentence Type 1</h3>
              <p className="text-white/80 text-sm mt-1.5 text-shadow-game-title">Diễn tả điều kiện có thể xảy ra ở hiện tại hoặc tương lai.</p>
              <div className="mt-3 p-3.5 rounded-xl bg-blue-950/40 text-xs text-blue-200 leading-relaxed font-semibold text-shadow-game-title">
                <span className="block text-white/50 text-[10px] uppercase font-bold mb-1 text-shadow-game-title">Ví dụ:</span>
                If it rains, we will stay at home. (Nếu trời mưa, chúng tôi sẽ ở nhà)
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* VOCABULARY / STARRED VIEW */
        <div className="w-full flex flex-col items-center text-shadow-game-title">
          
          {/* Search and level filter panel */}
          <div className="w-full bg-ranking-table-bg/80 backdrop-blur-md rounded-[2rem] p-6 border-3 border-ranking-table-border shadow-[0_15px_30px_rgba(0,0,0,0.4)] mb-8 flex flex-col sm:flex-row gap-4 items-center max-w-4xl text-shadow-game-title">
            {/* Search Box */}
            <div className="flex flex-1 items-center bg-game-input-focus-shadow rounded-xl px-4 py-3 border-2 border-ranking-table-border focus-within:border-blue-400 transition-all shadow-inner w-full text-shadow-game-title">
              <Search className="w-5 h-5 text-blue-300 mr-2 shrink-0 text-shadow-game-title" />
              <input 
                type="text" 
                placeholder="Tìm từ vựng hoặc nghĩa tiếng Việt..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent border-none outline-none text-white font-semibold text-sm placeholder:text-blue-300/40 w-full text-shadow-game-title"
              />
            </div>

            {/* Level Select */}
            <div className="relative w-full sm:w-64 text-shadow-game-title">
              <select 
                value={levelFilter}
                onChange={(e) => setLevelFilter(e.target.value)}
                className="w-full bg-game-input-focus-shadow hover:bg-game-input-hover-bg rounded-xl px-4 py-3 border-2 border-ranking-table-border focus:border-blue-400 text-white font-semibold text-sm outline-none appearance-none cursor-pointer shadow-inner text-shadow-game-title"
              >
                <option value="all" className="bg-ranking-table-bg text-white text-shadow-game-title">Tất cả cấp độ</option>
                <option value="Starters" className="bg-ranking-table-bg text-white text-shadow-game-title">Starters (Pre A1)</option>
                <option value="Movers" className="bg-ranking-table-bg text-white text-shadow-game-title">Movers (A1)</option>
                <option value="Flyers" className="bg-ranking-table-bg text-white text-shadow-game-title">Flyers (A2)</option>
                <option value="TOEFL" className="bg-ranking-table-bg text-white text-shadow-game-title">TOEFL Primary/Junior</option>
              </select>
            </div>
          </div>

          {/* Cards Grid */}
          {filteredWords.length === 0 ? (
            <div className="w-full max-w-md py-16 text-center bg-ranking-table-bg/80 backdrop-blur-md rounded-[2.2rem] border-3 border-ranking-table-border p-8 shadow-[0_15px_30px_rgba(0,0,0,0.5)] text-shadow-game-title">
              <HelpCircle className="w-16 h-16 text-blue-300 mx-auto mb-4 animate-bounce text-shadow-game-title" />
              <h3 className="text-white font-black text-xl font-heading mb-2 text-shadow-game-title">Không tìm thấy từ vựng</h3>
              <p className="text-blue-300 font-semibold text-xs uppercase tracking-wider text-shadow-game-title">Vui lòng điều chỉnh bộ lọc hoặc từ khoá tìm kiếm</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-5xl text-shadow-game-title">
              {filteredWords.map((word) => {
                const isFlipped = !!flippedCards[word.id];
                const isStarred = !!starredWords[word.id];

                return (
                  <div 
                    key={word.id}
                    onClick={() => toggleFlip(word.id)}
                    className="h-72 w-full cursor-pointer relative group select-none text-shadow-game-title"
                    style={{ perspective: "1000px" }} // clone-gate-ignore
                  >
                    {/* Card Inner Container with 3D Flip */}
                    <div 
                      className="absolute inset-0 w-full h-full rounded-3xl border-3 border-ranking-table-border shadow-[0_8px_16px_rgba(0,0,0,0.4)] transition-transform duration-500 ease-out text-shadow-game-title"
                      style={{ // clone-gate-ignore
                        transformStyle: "preserve-3d",
                        transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)"
                      }}
                    >
                      
                      {/* CARD FRONT SIDE */}
                      <div 
                        className="absolute inset-0 w-full h-full rounded-[1.4rem] bg-gradient-to-b from-ranking-table-bg to-notebook-card-to p-6 flex flex-col justify-between text-shadow-game-title"
                        style={{ backfaceVisibility: "hidden" }} // clone-gate-ignore
                      >
                        {/* Level badge and star indicator */}
                        <div className="flex justify-between items-center text-shadow-game-title">
                          <span className="px-2.5 py-0.5 rounded bg-blue-500/10 border border-blue-500/20 text-[9px] font-black text-blue-300 uppercase tracking-widest text-shadow-game-title">
                            {word.level}
                          </span>
                          <button 
                            onClick={(e) => toggleStar(e, word.id)}
                            className="text-yellow-450 hover:scale-115 transition-transform text-shadow-game-title"
                          >
                            <Star className={cn("w-5 h-5", isStarred ? "fill-yellow-450 text-yellow-450" : "text-white/30")} />
                          </button>
                        </div>

                        {/* Middle Word Section */}
                        <div className="text-center my-auto flex flex-col items-center text-shadow-game-title">
                          <h3 className="text-white font-black text-2xl md:text-3xl tracking-wide group-hover:text-yellow-350 transition-colors text-shadow-game-title">
                            {word.word}
                          </h3>
                          <span className="text-white/40 font-bold text-xs italic mt-1 uppercase tracking-wider text-shadow-game-title">
                            ({word.type})
                          </span>
                          <div className="flex items-center gap-2 mt-2 text-shadow-game-title">
                            <span className="text-blue-300 font-extrabold text-sm text-shadow-game-title">{word.ipa}</span>
                            <button 
                              onClick={(e) => handleSpeak(e, word.word)}
                              className="w-7 h-7 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-white hover:bg-blue-500/40 transition-colors cursor-pointer active:scale-90 text-shadow-game-title"
                            >
                              <Volume2 className="w-3.5 h-3.5 text-shadow-game-title" />
                            </button>
                          </div>
                        </div>

                        {/* Tap to Flip Guide */}
                        <div className="text-center text-white/30 text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-1.5 group-hover:text-white/50 transition-colors text-shadow-game-title">
                          <RefreshCw className="w-3 h-3 animate-spin text-shadow-game-title" />
                          <span>Ấn để lật thẻ</span>
                        </div>
                      </div>

                      {/* CARD BACK SIDE */}
                      <div 
                        className="absolute inset-0 w-full h-full rounded-[1.4rem] bg-placement-hover-bg border-2 border-yellow-400/30 p-6 flex flex-col justify-between text-shadow-game-title"
                        style={{ // clone-gate-ignore
                          backfaceVisibility: "hidden", 
                          transform: "rotateY(180deg)" 
                        }}
                      >
                        <div className="flex justify-between items-center text-shadow-game-title">
                          <span className="px-2.5 py-0.5 rounded bg-yellow-400/10 border border-yellow-400/20 text-[9px] font-black text-yellow-400 uppercase tracking-widest text-shadow-game-title">
                            Nghĩa của từ
                          </span>
                          <span className="text-lg text-shadow-game-title">💡</span>
                        </div>

                        {/* Translation and Example */}
                        <div className="text-center my-auto flex flex-col items-center text-shadow-game-title">
                          <h4 className="text-yellow-350 font-black text-xl md:text-2xl tracking-wide leading-tight text-shadow-game-title">
                            {word.vietnamese}
                          </h4>
                          
                          <div className="w-full mt-4 p-3 rounded-xl bg-blue-950/50 text-[10px] md:text-xs text-blue-200 leading-relaxed font-semibold text-left text-shadow-game-title">
                            <span className="block text-white/40 font-bold uppercase tracking-wide mb-1 text-shadow-game-title">Ví dụ:</span>
                            <p className="text-white font-extrabold text-shadow-game-title">{word.example}</p>
                            <p className="text-blue-300/80 mt-1 text-shadow-game-title">{word.exampleVietnamese}</p>
                          </div>
                        </div>

                        {/* Tap to Flip Guide */}
                        <div className="text-center text-white/30 text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-1.5 text-shadow-game-title">
                          <RefreshCw className="w-3 h-3 text-shadow-game-title" />
                          <span>Ấn để quay lại</span>
                        </div>
                      </div>

                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </div>
      )}

    </div>
  );
}
