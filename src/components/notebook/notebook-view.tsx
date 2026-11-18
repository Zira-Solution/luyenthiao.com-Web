"use client";

import { ChevronLeft, Search, BookOpen, Star, RefreshCw, Volume2, HelpCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

import { useDeleteNotebookEntry, useMyNotebook, useUpdateNotebookEntry } from "@/hooks/use-notebook";
import { GENERIC_ERROR_MESSAGE } from "@/lib/api-client";
import { LEVEL_OPTIONS, levelLabel } from "@/lib/level-label";
import { cn } from "@/lib/utils";
import type { NotebookWord } from "@/schemas/notebook";

export function NotebookView(): React.ReactElement {
  const router = useRouter();
  
  const [activeCategory, setActiveCategory] = useState<"vocab" | "grammar" | "starred">("vocab");
  const [searchQuery, setSearchQuery] = useState("");
  const [levelFilter, setLevelFilter] = useState("all");
  
  // Flip states of cards by id
  const [flippedCards, setFlippedCards] = useState<Record<number, boolean>>({});

  const { data, isPending, error, refetch } = useMyNotebook();
  const update = useUpdateNotebookEntry();
  const remove = useDeleteNotebookEntry();
  const words = data ?? [];
  const [actionError, setActionError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const onActionError = (e: unknown) => {
    setActionError(e instanceof Error ? e.message : GENERIC_ERROR_MESSAGE);
  };

  const toggleFlip = (id: number) => {
    setFlippedCards((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleStar = (e: React.MouseEvent, word: NotebookWord) => {
    e.stopPropagation(); // prevent card flip
    if (update.isPending) return;
    setActionError(null);
    update.mutate({ id: word.id, patch: { isFavorite: !word.isFavorite } }, { onError: onActionError });
  };

  const toggleMemorized = (e: React.MouseEvent, word: NotebookWord) => {
    e.stopPropagation(); // prevent card flip
    if (update.isPending) return;
    setActionError(null);
    update.mutate({ id: word.id, patch: { memorized: !word.memorized } }, { onError: onActionError });
  };

  const handleDelete = (e: React.MouseEvent, word: NotebookWord) => {
    e.stopPropagation(); // prevent card flip
    if (remove.isPending) return;
    if (!window.confirm("Xoá từ này khỏi sổ tay?")) return;
    setActionError(null);
    remove.mutate(word.id, { onError: onActionError });
  };

  const speakWithVoice = (text: string) => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "en-US";
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleSpeak = (e: React.MouseEvent, word: NotebookWord) => {
    e.stopPropagation(); // prevent card flip
    if (word.audioUrl) {
      audioRef.current?.pause();
      const audio = new Audio(word.audioUrl);
      audioRef.current = audio;
      audio.play().catch(() => speakWithVoice(word.word));
      return;
    }
    speakWithVoice(word.word);
  };

  // Filter words
  const filteredWords = words.filter((word) => {
    const needle = searchQuery.trim().toLowerCase();
    const matchesSearch = word.word.toLowerCase().includes(needle) ||
                          word.meaningVi.toLowerCase().includes(needle);
    const matchesLevel = levelFilter === "all" || word.level === levelFilter;
    const matchesStarred = activeCategory !== "starred" || word.isFavorite;
    return matchesSearch && matchesLevel && matchesStarred;
  });

  return (
    <div className="w-full max-w-7xl mx-auto px-4 md:px-8 py-4 md:py-6 pb-[120px] flex flex-col items-center z-10 animate-in fade-in duration-500 text-shadow-game-title">
      
      {/* Header Section */}
      <div className="w-full flex items-center justify-between mb-5 text-shadow-game-title">
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
      <div className="flex gap-2 p-1.5 bg-game-input-focus-shadow/80 backdrop-blur-sm rounded-full border-2 border-ranking-table-border shadow-lg mb-6 max-w-md w-full justify-between text-shadow-game-title">
        <button 
          onClick={() => setActiveCategory("vocab")}
          aria-pressed={activeCategory === "vocab"}
          className={cn(
            "flex-1 py-2 px-4 rounded-full text-xs font-black uppercase tracking-wider transition-all cursor-pointer text-center",
            activeCategory === "vocab" ? "bg-gradient-to-b from-topbar-login-bg to-topbar-login-border border border-blue-400 text-white shadow-md" : "text-blue-200 hover:text-white"
          )}
        >
          Từ vựng
        </button>
        <button 
          onClick={() => setActiveCategory("grammar")}
          aria-pressed={activeCategory === "grammar"}
          className={cn(
            "flex-1 py-2 px-4 rounded-full text-xs font-black uppercase tracking-wider transition-all cursor-pointer text-center",
            activeCategory === "grammar" ? "bg-gradient-to-b from-topbar-login-bg to-topbar-login-border border border-blue-400 text-white shadow-md" : "text-blue-200 hover:text-white"
          )}
        >
          Ngữ pháp
        </button>
        <button 
          onClick={() => setActiveCategory("starred")}
          aria-pressed={activeCategory === "starred"}
          className={cn(
            "flex-1 py-2 px-4 rounded-full text-xs font-black uppercase tracking-wider transition-all cursor-pointer text-center",
            activeCategory === "starred" ? "bg-gradient-to-b from-topbar-login-bg to-topbar-login-border border border-blue-400 text-white shadow-md" : "text-blue-200 hover:text-white"
          )}
        >
          Đánh dấu sao ⭐
        </button>
      </div>

      {activeCategory === "grammar" ? (
        /* GRAMMAR VIEW */
        <div className="w-full bg-ranking-table-bg backdrop-blur-sm rounded-[2.2rem] p-8 border-3 border-ranking-table-border shadow-[0_15px_30px_rgba(0,0,0,0.5)] max-w-4xl text-shadow-game-title">
          <p className="text-white font-black text-sm md:text-base text-center text-shadow-game-title">
            Ngữ pháp sắp có. Hãy quay lại sau nhé!
          </p>
        </div>
      ) : isPending ? (
        <p className="w-full text-center text-blue-300 font-extrabold text-sm uppercase tracking-wider">
          Đang tải sổ tay…
        </p>
      ) : error ? (
        <div className="w-full text-center">
          <p className="text-white font-black text-sm tracking-wider mb-4">{error instanceof Error ? error.message : GENERIC_ERROR_MESSAGE}</p>
          <button
            onClick={() => refetch()}
            className="px-4 py-2 rounded-2xl bg-topbar-blue-bg/80 border-2 border-blue-500/30 hover:bg-topbar-blue-hover active:translate-y-[2px] transition-all text-white font-black text-xs uppercase tracking-wider cursor-pointer"
          >
            Thử lại
          </button>
        </div>
      ) : (
        /* VOCABULARY / STARRED VIEW */
        <div className="w-full flex flex-col items-center text-shadow-game-title">
          
          {/* Search and level filter panel */}
          <div className="w-full bg-ranking-table-bg backdrop-blur-sm rounded-[2rem] p-5 border-3 border-ranking-table-border shadow-[0_15px_30px_rgba(0,0,0,0.4)] mb-6 flex flex-col sm:flex-row gap-4 items-center max-w-4xl text-shadow-game-title">
            {/* Search Box */}
            <div className="flex flex-1 items-center bg-game-input-focus-shadow rounded-xl px-4 py-3 border-2 border-ranking-table-border focus-within:border-blue-400 transition-all shadow-inner w-full text-shadow-game-title">
              <Search className="w-5 h-5 text-blue-300 mr-2 shrink-0 text-shadow-game-title" />
              <input 
                type="search"
                aria-label="Tìm kiếm"
                placeholder="Tìm từ vựng hoặc nghĩa tiếng Việt..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent border-none outline-none text-white font-semibold text-sm placeholder:text-blue-300/40 w-full text-shadow-game-title"
              />
            </div>

            {/* Level Select */}
            <div className="relative w-full sm:w-64 text-shadow-game-title">
              <select
                aria-label="Lọc theo cấp độ" 
                value={levelFilter}
                onChange={(e) => setLevelFilter(e.target.value)}
                className="w-full bg-game-input-focus-shadow hover:bg-game-input-hover-bg rounded-xl px-4 py-3 border-2 border-ranking-table-border focus:border-blue-400 text-white font-semibold text-sm outline-none appearance-none cursor-pointer shadow-inner text-shadow-game-title"
              >
                <option value="all" className="bg-dropdown-bg text-white text-shadow-game-title">Tất cả cấp độ</option>
                {LEVEL_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value} className="bg-dropdown-bg text-white text-shadow-game-title">{o.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Cards Grid */}
          {actionError && (
            <p role="alert" className="w-full max-w-5xl mb-4 text-center text-red-300 font-black text-sm tracking-wider text-shadow-game-title">
              {actionError}
            </p>
          )}

          {words.length === 0 ? (
            <div className="w-full max-w-md py-16 text-center bg-ranking-table-bg backdrop-blur-sm rounded-[2.2rem] border-3 border-ranking-table-border p-8 shadow-[0_15px_30px_rgba(0,0,0,0.5)] text-shadow-game-title">
              <HelpCircle className="w-16 h-16 text-blue-300 mx-auto mb-4 text-shadow-game-title" />
              <p className="text-white font-black text-sm tracking-wider text-shadow-game-title">Sổ tay trống. Từ bạn tra trong lúc làm bài sẽ xuất hiện ở đây.</p>
            </div>
          ) : filteredWords.length === 0 ? (
            <div className="w-full max-w-md py-16 text-center bg-ranking-table-bg backdrop-blur-sm rounded-[2.2rem] border-3 border-ranking-table-border p-8 shadow-[0_15px_30px_rgba(0,0,0,0.5)] text-shadow-game-title">
              <HelpCircle className="w-16 h-16 text-blue-300 mx-auto mb-4 animate-bounce text-shadow-game-title" />
              <h3 className="text-white font-black text-xl font-heading mb-2 text-shadow-game-title">Không tìm thấy từ phù hợp.</h3>
              <p className="text-blue-300 font-semibold text-xs uppercase tracking-wider text-shadow-game-title">Vui lòng điều chỉnh bộ lọc hoặc từ khoá tìm kiếm</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-5xl text-shadow-game-title">
              {filteredWords.map((word) => {
                const isFlipped = !!flippedCards[word.id];
                const isStarred = word.isFavorite;

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
                            {levelLabel(word.level)}
                          </span>
                          <button 
                            onClick={(e) => toggleStar(e, word)}
                            disabled={update.isPending}
                            aria-label={`Đánh dấu sao ${word.word}`}
                            aria-pressed={word.isFavorite}
                            className="text-yellow-450 hover:scale-115 transition-transform text-shadow-game-title disabled:opacity-50 disabled:cursor-not-allowed"
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
                              onClick={(e) => handleSpeak(e, word)}
                              aria-label={`Phát âm ${word.word}`}
                              className="w-7 h-7 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-white hover:bg-blue-500/40 transition-colors cursor-pointer active:scale-90 text-shadow-game-title"
                            >
                              <Volume2 className="w-3.5 h-3.5 text-shadow-game-title" />
                            </button>
                          </div>
                        </div>

                        {/* Memorized / delete */}
                        <div className="flex items-center justify-center gap-2 mb-1 text-shadow-game-title">
                          <button
                            onClick={(e) => toggleMemorized(e, word)}
                            aria-pressed={word.memorized}
                            aria-label={`Đã thuộc ${word.word}`}
                            disabled={update.isPending}
                            className={cn(
                              "px-3 py-1 rounded-lg border text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed",
                              word.memorized ? "bg-green-500/20 border-green-500/40 text-green-400" : "bg-white/5 border-white/20 text-white/60 hover:text-white"
                            )}
                          >
                            Đã thuộc
                          </button>
                          <button
                            onClick={(e) => handleDelete(e, word)}
                            aria-label={`Xoá ${word.word}`}
                            disabled={remove.isPending}
                            className="px-3 py-1 rounded-lg border border-red-500/40 bg-red-500/10 text-red-400 hover:bg-red-500/20 text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Xoá
                          </button>
                        </div>

                        {/* Tap to Flip Guide */}
                        <button
                          onClick={(e) => { e.stopPropagation(); toggleFlip(word.id); }}
                          aria-pressed={isFlipped}
                          aria-label={`Lật thẻ ${word.word}`}
                          className="text-center text-white/30 text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-1.5 group-hover:text-white/50 transition-colors cursor-pointer text-shadow-game-title"
                        >
                          <RefreshCw className="w-3 h-3 animate-spin motion-reduce:animate-none text-shadow-game-title" />
                          <span>Ấn để lật thẻ</span>
                        </button>
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
                            {word.meaningVi}
                          </h4>
                          
                          {(word.exampleEn || word.exampleVi) && (
                            <div className="w-full mt-4 p-3 rounded-xl bg-blue-950/50 text-[10px] md:text-xs text-blue-200 leading-relaxed font-semibold text-left text-shadow-game-title">
                              <span className="block text-white/40 font-bold uppercase tracking-wide mb-1 text-shadow-game-title">Ví dụ:</span>
                              {word.exampleEn && <p className="text-white font-extrabold text-shadow-game-title">{word.exampleEn}</p>}
                              {word.exampleVi && <p className="text-blue-300/80 mt-1 text-shadow-game-title">{word.exampleVi}</p>}
                            </div>
                          )}
                        </div>

                        {/* Tap to Flip Guide */}
                        <button
                          onClick={(e) => { e.stopPropagation(); toggleFlip(word.id); }}
                          aria-pressed={isFlipped}
                          aria-label={`Lật lại thẻ ${word.word}`}
                          className="text-center text-white/30 text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-1.5 cursor-pointer text-shadow-game-title"
                        >
                          <RefreshCw className="w-3 h-3 text-shadow-game-title" />
                          <span>Ấn để quay lại</span>
                        </button>
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
