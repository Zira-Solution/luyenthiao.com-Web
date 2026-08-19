"use client";

import { ChevronLeft, Clock, CheckCircle, XCircle, ArrowRight, Star, HelpCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";

import { cn } from "@/lib/utils";

// Web Audio API helper for gamified sound effects without downloading mp3 files
function playBeep(type: "correct" | "incorrect" | "click" | "victory") {
  if (typeof window === "undefined") return;
  try {
    const ctx = new (window.AudioContext || (window as Window & typeof globalThis & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === "click") {
      osc.type = "sine";
      osc.frequency.setValueAtTime(600, ctx.currentTime);
      gain.gain.setValueAtTime(0.05, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
      osc.start();
      osc.stop(ctx.currentTime + 0.1);
    } else if (type === "correct") {
      osc.type = "triangle";
      osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
      osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.1); // E5
      osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.2); // G5
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    } else if (type === "incorrect") {
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(150, ctx.currentTime);
      osc.frequency.setValueAtTime(100, ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);
      osc.start();
      osc.stop(ctx.currentTime + 0.25);
    } else if (type === "victory") {
      osc.type = "sine";
      const notes = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99, 1046.50];
      notes.forEach((freq, idx) => {
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.08);
      });
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.8);
      osc.start();
      osc.stop(ctx.currentTime + 0.8);
    }
  } catch (e) {
    console.error("Audio API not supported or blocked", e);
  }
}

interface Question {
  id: number;
  text: string;
  type: "text" | "image";
  options: string[];
  correct: number;
  explanation: string;
  audioText?: string;
}

const LEVEL_TESTS = [
  { id: "starters", name: "Starters (Pre A1)", desc: "Dành cho lớp 1, 2. Kiểm tra từ vựng cơ bản và phản xạ nghe.", questionsCount: 3, timeLimit: 60, icon: "🍭" },
  { id: "movers", name: "Movers (A1)", desc: "Dành cho lớp 3, 4. Từ vựng nâng cao và câu đơn.", questionsCount: 3, timeLimit: 90, icon: "🦖" },
  { id: "flyers", name: "Flyers (A2)", desc: "Dành cho lớp 5. Kỹ năng đọc hiểu và đặt câu hỏi phức tạp.", questionsCount: 3, timeLimit: 120, icon: "☁️" },
  { id: "toefl", name: "TOEFL Primary", desc: "Chuẩn quốc tế. Đo lường kỹ năng giao tiếp và ngữ pháp chuẩn.", questionsCount: 3, timeLimit: 150, icon: "🚀" }
];

const MOCK_QUESTIONS: Record<string, Question[]> = {
  starters: [
    { id: 1, text: "Chọn từ đúng với hình sau: 🍎", type: "text", options: ["Banana", "Apple", "Orange", "Grape"], correct: 1, explanation: "Apple nghĩa là quả táo." },
    { id: 2, text: "Điền vào chỗ trống: 'This is ___ elephant.'", type: "text", options: ["a", "an", "the", "some"], correct: 1, explanation: "Elephant bắt đầu bằng nguyên âm 'e' nên dùng 'an'." },
    { id: 3, text: "Nhìn vào màu sắc sau 🟦. Đây là màu gì?", type: "text", options: ["Red", "Green", "Blue", "Yellow"], correct: 2, explanation: "Màu xanh dương trong tiếng Anh là Blue." }
  ],
  movers: [
    { id: 1, text: "Chọn từ trái nghĩa với 'heavy' (nặng):", type: "text", options: ["Light", "Hard", "Soft", "Small"], correct: 0, explanation: "Light nghĩa là nhẹ, trái nghĩa với heavy." },
    { id: 2, text: "Điền vào chỗ trống: 'She ___ to school every day.'", type: "text", options: ["go", "goes", "going", "gone"], correct: 1, explanation: "Chủ ngữ ngôi thứ ba số ít 'She' chia động từ thêm -es." },
    { id: 3, text: "Câu nào đúng ngữ pháp?", type: "text", options: ["They is playing soccer.", "They are playing soccer.", "They playing soccer.", "They am playing soccer."], correct: 1, explanation: "Chủ ngữ 'They' đi kèm động từ tobe 'are'." }
  ],
  flyers: [
    { id: 1, text: "Tìm từ đồng nghĩa với 'quick':", type: "text", options: ["Slow", "Fast", "Quiet", "Heavy"], correct: 1, explanation: "Fast đồng nghĩa với quick (nhanh chóng)." },
    { id: 2, text: "Điền vào chỗ trống: 'If it ___ tomorrow, we will stay at home.'", type: "text", options: ["rain", "rains", "will rain", "rained"], correct: 1, explanation: "Mệnh đề điều kiện loại 1 (If + HTĐ)." },
    { id: 3, text: "Chọn từ phù hợp: 'The book ___ was on the table is mine.'", type: "text", options: ["who", "which", "whom", "whose"], correct: 1, explanation: "Mệnh đề quan hệ chỉ vật dùng 'which'." }
  ],
  toefl: [
    { id: 1, text: "Which sentence is correct?", type: "text", options: ["Although she was tired, but she finished her homework.", "Although she was tired, she finished her homework.", "She was tired, although she finished her homework.", "Despite she was tired, she finished her homework."], correct: 1, explanation: "Cấu trúc Although không đi cùng 'but' trong cùng một câu." },
    { id: 2, text: "Choose the correct preposition: 'He is interested ___ studying languages.'", type: "text", options: ["in", "on", "at", "with"], correct: 0, explanation: "Cấu trúc 'interested in' (thích thú với cái gì)." },
    { id: 3, text: "Complete the sentence: 'She hasn't seen her cousin ___ two years.'", type: "text", options: ["since", "for", "ago", "during"], correct: 1, explanation: "Dùng 'for' kèm khoảng thời gian (two years) trong thì Hiện tại hoàn thành." }
  ]
};

export default function PlacementTestPage() {
  const router = useRouter();

  const [gameState, setGameState] = useState<"lobby" | "quiz" | "result">("lobby");
  const [selectedLevel, setSelectedLevel] = useState<typeof LEVEL_TESTS[0] | null>(null);
  
  // Quiz states
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  
  // Timer states
  const [timeLeft, setTimeLeft] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const currentQuestion = questions[currentIndex] || { id: 0, text: "", options: [], correct: 0, explanation: "" };

  // Handle level select
  const startTest = (level: typeof LEVEL_TESTS[0]) => {
    playBeep("click");
    setSelectedLevel(level);
    setQuestions(MOCK_QUESTIONS[level.id] || []);
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setIsAnswerSubmitted(false);
    setScore(0);
    setTimeLeft(level.timeLimit);
    setGameState("quiz");
  };

  const submitTest = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    playBeep("victory");
    setGameState("result");
  };

  // Timer Effect
  useEffect(() => {
    if (gameState === "quiz" && timeLeft > 0) {
      timerRef.current = setTimeout(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && gameState === "quiz") {
      setTimeout(() => submitTest(), 0);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [timeLeft, gameState]);

  // Answer Select
  const handleSelectAnswer = (idx: number) => {
    if (isAnswerSubmitted) return;
    playBeep("click");
    setSelectedAnswer(idx);
  };

  // Submit current answer
  const handleSubmitAnswer = () => {
    if (selectedAnswer === null || isAnswerSubmitted) return;
    
    const isCorrect = selectedAnswer === currentQuestion.correct;
    if (isCorrect) {
      playBeep("correct");
      setScore((prev) => prev + 1);
    } else {
      playBeep("incorrect");
    }

    setIsAnswerSubmitted(true);
  };

  // Next question or view result
  const handleNext = () => {
    playBeep("click");
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedAnswer(null);
      setIsAnswerSubmitted(false);
    } else {
      submitTest();
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 md:px-8 py-6 md:py-10 pb-28 flex flex-col items-center z-10 animate-in fade-in duration-500 text-shadow-game-title">
      
      {/* Header section */}
      <div className="w-full flex items-center justify-between mb-8 text-shadow-game-title">
        <button 
          onClick={() => {
            playBeep("click");
            if (gameState !== "lobby") {
              if (confirm("Bạn có muốn hủy bài kiểm tra và quay lại sảnh không?")) {
                setGameState("lobby");
              }
            } else {
              router.push("/");
            }
          }}
          className="flex items-center gap-1.5 md:gap-2 px-4 py-2 rounded-2xl bg-topbar-blue-bg/80 border-2 border-blue-500/30 hover:bg-topbar-blue-hover active:translate-y-[2px] transition-all text-white font-black text-xs md:text-sm tracking-wider uppercase cursor-pointer text-shadow-game-title"
        >
          <ChevronLeft className="w-4 h-4 md:w-5 md:h-5 text-yellow-450 text-shadow-game-title" />
          <span>Quay lại</span>
        </button>

        <h1 
          className="text-3xl md:text-5xl font-black text-white uppercase tracking-wider drop-shadow-lg font-heading hidden sm:block text-shadow-game-title"
          
        >
          {gameState === "quiz" ? "Đang thi" : gameState === "result" ? "Kết quả" : "Kiểm tra trình độ"}
        </h1>

        <div className="bg-topbar-blue-bg/80 border-2 border-blue-500/30 rounded-2xl px-4 py-1.5 flex items-center gap-2 text-shadow-game-title">
          <Star className="w-5 h-5 text-yellow-450 fill-yellow-450 animate-pulse text-shadow-game-title" />
          <span className="text-white font-black text-xs md:text-sm text-shadow-game-title">Trial Account</span>
        </div>
      </div>

      {gameState === "lobby" && (
        /* LOBBY VIEW - Test Selection */
        <div className="w-full flex flex-col items-center text-shadow-game-title">
          <div className="text-center max-w-2xl mb-10 text-shadow-game-title">
            <h2 className="text-white font-black text-xl md:text-3xl mb-3 uppercase font-heading tracking-wider text-shadow-game-title">
              Chọn cấp độ của bạn
            </h2>
            <p className="text-blue-200 font-bold text-xs md:text-sm leading-relaxed text-shadow-game-title">
              Hãy hoàn thành bài thi thử ngắn 3 câu để kiểm tra ngay trình độ ngoại ngữ của bản thân và nhận huân chương tri thức!
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl text-shadow-game-title">
            {LEVEL_TESTS.map((test) => (
              <div 
                key={test.id}
                onClick={() => startTest(test)}
                className="bg-ranking-table-bg/80 hover:bg-placement-hover-bg border-3 border-ranking-table-border hover:border-yellow-400 rounded-3xl p-6 shadow-[0_8px_16px_rgba(0,0,0,0.4)] hover:shadow-[0_12px_24px_rgba(234,179,8,0.2)] transition-all duration-300 transform hover:-translate-y-1 cursor-pointer flex gap-4 group text-shadow-game-title"
              >
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-b from-slate-800 to-slate-900 border-2 border-blue-500/20 flex items-center justify-center text-3xl shrink-0 group-hover:scale-110 transition-transform text-shadow-game-title">
                  {test.icon}
                </div>
                <div className="flex flex-col justify-between text-shadow-game-title">
                  <div>
                    <h3 className="text-white font-black text-base md:text-lg uppercase tracking-wide group-hover:text-yellow-350 transition-colors text-shadow-game-title">
                      {test.name}
                    </h3>
                    <p className="text-blue-300 font-semibold text-xs mt-1 leading-relaxed text-shadow-game-title">
                      {test.desc}
                    </p>
                  </div>
                  <div className="flex items-center gap-4 mt-3 text-[10px] font-black text-white/50 group-hover:text-white/80 transition-colors uppercase tracking-widest text-shadow-game-title">
                    <span className="flex items-center gap-1 text-shadow-game-title"><Clock className="w-3.5 h-3.5 text-blue-400 text-shadow-game-title" /> {test.timeLimit}s</span>
                    <span className="flex items-center gap-1 text-shadow-game-title"><HelpCircle className="w-3.5 h-3.5 text-orange-400 text-shadow-game-title" /> {test.questionsCount} câu hỏi</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {gameState === "quiz" && selectedLevel && questions.length > 0 && (
        /* QUIZ VIEW - Active quiz playing */
        <div className="w-full max-w-3xl flex flex-col items-center text-shadow-game-title">
          {/* Progress bar and countdown timer */}
          <div className="w-full bg-ranking-table-bg/90 border-3 border-ranking-table-border rounded-[2rem] p-4 flex items-center justify-between gap-6 mb-6 text-shadow-game-title">
            <div className="flex-1 text-shadow-game-title">
              <div className="flex justify-between text-white font-black text-[10px] md:text-xs mb-1.5 uppercase tracking-wider text-shadow-game-title">
                <span>Tiến trình: Câu {currentIndex + 1}/{questions.length}</span>
                <span>{Math.round(((currentIndex + 1) / questions.length) * 100)}%</span>
              </div>
              <div className="w-full h-3 bg-blue-950 rounded-full overflow-hidden border border-blue-500/20 text-shadow-game-title">
                <div 
                  className="h-full bg-gradient-to-r from-green-400 to-emerald-500 transition-all duration-300 text-shadow-game-title"
                  style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }} // clone-gate-ignore
                />
              </div>
            </div>

            <div className="flex items-center gap-2 bg-topbar-orange-bg border-2 border-topbar-orange-border px-4 py-2 rounded-2xl shadow-md text-white font-black text-sm shrink-0 text-shadow-game-title">
              <Clock className="w-4 h-4 animate-spin text-shadow-game-title" />
              <span>{timeLeft}s</span>
            </div>
          </div>

          {/* Question Card */}
          <div className="w-full bg-ranking-table-bg/80 backdrop-blur-md rounded-[2.2rem] p-6 md:p-8 border-3 border-ranking-table-border shadow-[0_15px_30px_rgba(0,0,0,0.5)] text-shadow-game-title">
            <span className="px-3 py-1 bg-yellow-450/15 border border-yellow-400/30 text-yellow-400 font-black text-[10px] uppercase tracking-widest rounded-lg text-shadow-game-title">
              {selectedLevel.name} Test
            </span>
            <h2 className="text-white font-black text-lg md:text-2xl mt-4 mb-6 leading-relaxed font-heading text-shadow-game-title">
              {currentQuestion.text}
            </h2>

            {/* Answer Options Grid */}
            <div className="flex flex-col gap-4 text-shadow-game-title">
              {currentQuestion.options.map((opt, idx) => {
                const isSelected = selectedAnswer === idx;
                const isCorrectAns = currentQuestion.correct === idx;
                
                let btnStyles = "bg-game-input-focus-shadow hover:bg-game-input-hover-bg border-ranking-table-border text-white";
                let statusIcon = null;

                if (isAnswerSubmitted) {
                  if (isCorrectAns) {
                    btnStyles = "bg-green-500/20 border-green-500 text-green-400";
                    statusIcon = <CheckCircle className="w-5 h-5 text-green-400 shrink-0 text-shadow-game-title" />;
                  } else if (isSelected) {
                    btnStyles = "bg-red-500/20 border-red-500 text-red-400";
                    statusIcon = <XCircle className="w-5 h-5 text-red-400 shrink-0 text-shadow-game-title" />;
                  } else {
                    btnStyles = "bg-blue-950/20 border-blue-950/40 text-white/30";
                  }
                } else if (isSelected) {
                  btnStyles = "bg-blue-600/35 border-blue-400 text-yellow-350 shadow-inner";
                }

                return (
                  <button
                    key={idx}
                    disabled={isAnswerSubmitted}
                    onClick={() => handleSelectAnswer(idx)}
                    className={cn(
                      "w-full flex items-center justify-between rounded-2xl border-2 px-5 py-4 font-bold text-sm md:text-base text-left transition-all cursor-pointer",
                      btnStyles
                    )}
                  >
                    <div className="flex items-center gap-3 text-shadow-game-title">
                      <span className={cn(
                        "w-7 h-7 rounded-xl flex items-center justify-center font-black text-xs border shrink-0",
                        isSelected ? "bg-blue-500 text-white border-blue-300" : "bg-blue-950/40 text-blue-300 border-blue-500/20"
                      )}>
                        {String.fromCharCode(65 + idx)}
                      </span>
                      <span>{opt}</span>
                    </div>
                    {statusIcon}
                  </button>
                );
              })}
            </div>

            {/* Answer Explanation (Appears after submission) */}
            {isAnswerSubmitted && (
              <div className="mt-6 p-4 rounded-2xl bg-blue-500/10 border border-blue-400/20 text-xs md:text-sm text-blue-200 leading-relaxed animate-in fade-in slide-in-from-top-2 text-shadow-game-title">
                <span className="font-black text-yellow-450 uppercase block mb-1 text-shadow-game-title">💡 Hướng dẫn đáp án:</span>
                {currentQuestion.explanation}
              </div>
            )}

            {/* Submit / Next Button */}
            <div className="mt-8 flex justify-end text-shadow-game-title">
              {!isAnswerSubmitted ? (
                <button
                  onClick={handleSubmitAnswer}
                  disabled={selectedAnswer === null}
                  className="px-6 py-3 rounded-2xl border-2 bg-gradient-to-b from-green-400 to-green-600 border-green-800 disabled:opacity-50 text-white font-black text-xs md:text-sm uppercase tracking-widest cursor-pointer hover:scale-105 active:scale-95 transition-all shadow-md flex items-center gap-2 text-shadow-game-title"
                >
                  <span>Kiểm tra</span>
                  <CheckCircle className="w-4 h-4 text-shadow-game-title" />
                </button>
              ) : (
                <button
                  onClick={handleNext}
                  className="px-6 py-3 rounded-2xl border-2 bg-gradient-to-b from-blue-400 to-blue-600 border-blue-800 text-white font-black text-xs md:text-sm uppercase tracking-widest cursor-pointer hover:scale-105 active:scale-95 transition-all shadow-md flex items-center gap-2 text-shadow-game-title"
                >
                  <span>{currentIndex === questions.length - 1 ? "Xem kết quả" : "Câu tiếp theo"}</span>
                  <ArrowRight className="w-4 h-4 text-shadow-game-title" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {gameState === "result" && selectedLevel && (
        /* RESULT VIEW - Test finished details */
        <div className="w-full max-w-md flex flex-col items-center text-shadow-game-title">
          <div className="w-full bg-ranking-table-bg/80 backdrop-blur-md rounded-[2.2rem] p-8 border-3 border-ranking-table-border shadow-[0_15px_30px_rgba(0,0,0,0.5)] flex flex-col items-center text-center text-shadow-game-title">
            
            {/* Trophy Icon */}
            <div className="w-24 h-24 bg-gradient-to-b from-yellow-400 to-amber-500 rounded-3xl border-3 border-white flex items-center justify-center text-5xl shadow-lg mb-6 animate-bounce text-shadow-game-title">
              🏆
            </div>

            <span className="text-yellow-450 font-black text-[10px] uppercase tracking-widest text-shadow-game-title">
              Hoàn thành kiểm tra
            </span>
            <h2 className="text-white font-black text-2xl md:text-3xl mt-1 mb-4 font-heading uppercase tracking-wide text-shadow-game-title">
              {selectedLevel.name}
            </h2>

            {/* Score circle */}
            <div className="relative w-36 h-36 rounded-full bg-blue-950/40 border-4 border-blue-500/30 flex flex-col items-center justify-center mb-6 text-shadow-game-title">
              <span className="text-white/60 font-black text-xs uppercase tracking-wider text-shadow-game-title">Đúng</span>
              <span className="text-5xl font-black text-yellow-350 drop-shadow-md my-0.5 text-shadow-game-title">
                {score}/{questions.length}
              </span>
              <span className="text-green-400 font-extrabold text-xs uppercase text-shadow-game-title">
                +{score * 20} Coins
              </span>
            </div>

            {/* Assessment feedback */}
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 w-full mb-6 text-xs md:text-sm text-blue-200 font-semibold leading-relaxed text-shadow-game-title">
              {score === questions.length ? (
                <span>🎉 Tuyệt vời! Bạn đã đạt điểm tuyệt đối. Trình độ của bạn rất phù hợp để tiếp tục phá đảo hành tinh tiếp theo!</span>
              ) : score >= 1 ? (
                <span>👍 Tốt lắm! Bạn có nền tảng vững vàng, hãy cố gắng ôn tập thêm các câu sai để bứt phá nhé.</span>
              ) : (
                <span>🎯 Bạn cần cố gắng học tập nhiều hơn. Hãy bắt đầu ôn tập từ các cấp độ cơ bản nhất nhé!</span>
              )}
            </div>

            {/* Action buttons */}
            <div className="flex flex-col gap-3 w-full text-shadow-game-title">
              <button 
                onClick={() => startTest(selectedLevel)}
                className="w-full py-3 rounded-2xl border-2 bg-gradient-to-b from-topbar-orange-bg to-placement-btn-to border-topbar-orange-hover text-white font-black text-xs md:text-sm uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-md cursor-pointer text-shadow-game-title"
              >
                Làm lại bài thi
              </button>

              <button 
                onClick={() => {
                  playBeep("click");
                  setGameState("lobby");
                }}
                className="w-full py-3 rounded-2xl border-2 bg-gradient-to-b from-blue-400 to-blue-600 border-blue-800 text-white font-black text-xs md:text-sm uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-md cursor-pointer text-shadow-game-title"
              >
                Chọn cấp độ khác
              </button>

              <button 
                onClick={() => {
                  playBeep("click");
                  router.push("/");
                }}
                className="w-full py-3 rounded-2xl bg-topbar-blue-bg/80 hover:bg-topbar-blue-hover border-2 border-blue-500/30 text-white font-black text-xs md:text-sm uppercase tracking-widest active:scale-95 transition-all cursor-pointer text-shadow-game-title"
              >
                Về trang chủ
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
