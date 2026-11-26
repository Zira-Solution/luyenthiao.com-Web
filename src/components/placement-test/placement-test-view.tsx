'use client'

import {
  ChevronLeft,
  Clock,
  CheckCircle,
  XCircle,
  ArrowRight,
  Star,
  HelpCircle,
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState, useEffect, useRef } from 'react'

import { LEVEL_TESTS, MOCK_QUESTIONS, type Question } from './placement-test-data'
import { playBeep } from './placement-test-sound'

import { useDemoExam } from '@/hooks/use-student-exams'
import { cn } from '@/lib/utils'

export function PlacementTestView(): React.ReactElement {
  const router = useRouter()
  const { data: demoExam } = useDemoExam(true)

  const [gameState, setGameState] = useState<'lobby' | 'quiz' | 'result'>('lobby')
  const [selectedLevel, setSelectedLevel] = useState<(typeof LEVEL_TESTS)[0] | null>(null)

  // Quiz states
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false)
  const [score, setScore] = useState(0)

  // Timer states
  const [timeLeft, setTimeLeft] = useState(0)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  const currentQuestion = questions[currentIndex] || {
    id: 0,
    text: '',
    options: [],
    correct: 0,
    explanation: '',
  }

  // Handle level select
  const startTest = (level: (typeof LEVEL_TESTS)[0]) => {
    playBeep('click')
    setSelectedLevel(level)
    setQuestions(MOCK_QUESTIONS[level.id] || [])
    setCurrentIndex(0)
    setSelectedAnswer(null)
    setIsAnswerSubmitted(false)
    setScore(0)
    setTimeLeft(level.timeLimit)
    setGameState('quiz')
  }

  const submitTest = () => {
    if (timerRef.current) clearTimeout(timerRef.current)
    playBeep('victory')
    setGameState('result')
  }

  // Timer Effect
  useEffect(() => {
    if (gameState === 'quiz' && timeLeft > 0) {
      timerRef.current = setTimeout(() => {
        setTimeLeft((prev) => prev - 1)
      }, 1000)
    } else if (timeLeft === 0 && gameState === 'quiz') {
      setTimeout(() => submitTest(), 0)
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [timeLeft, gameState])

  // Answer Select
  const handleSelectAnswer = (idx: number) => {
    if (isAnswerSubmitted) return
    playBeep('click')
    setSelectedAnswer(idx)
  }

  // Submit current answer
  const handleSubmitAnswer = () => {
    if (selectedAnswer === null || isAnswerSubmitted) return

    const isCorrect = selectedAnswer === currentQuestion.correct
    if (isCorrect) {
      playBeep('correct')
      setScore((prev) => prev + 1)
    } else {
      playBeep('incorrect')
    }

    setIsAnswerSubmitted(true)
  }

  // Next question or view result
  const handleNext = () => {
    playBeep('click')
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1)
      setSelectedAnswer(null)
      setIsAnswerSubmitted(false)
    } else {
      submitTest()
    }
  }

  return (
    <div className="animate-in fade-in text-shadow-game-title z-10 mx-auto flex w-full max-w-7xl flex-col items-center px-4 py-4 pb-[120px] duration-500 md:px-8 md:py-6">
      {/* Header section */}
      <div className="text-shadow-game-title mb-5 flex w-full items-center justify-between">
        <button
          onClick={() => {
            playBeep('click')
            if (gameState !== 'lobby') {
              if (confirm('Bạn có muốn hủy bài kiểm tra và quay lại sảnh không?')) {
                setGameState('lobby')
              }
            } else {
              router.push('/')
            }
          }}
          className="bg-topbar-blue-bg/80 hover:bg-topbar-blue-hover text-shadow-game-title flex cursor-pointer items-center gap-1.5 rounded-2xl border-2 border-blue-500/30 px-4 py-2 text-xs font-black tracking-wider text-white uppercase transition-all active:translate-y-[2px] md:gap-2 md:text-sm"
        >
          <ChevronLeft className="text-yellow-450 text-shadow-game-title h-4 w-4 md:h-5 md:w-5" />
          <span>Quay lại</span>
        </button>

        <h1 className="font-heading text-shadow-game-title hidden text-3xl font-black tracking-wider text-white uppercase drop-shadow-lg sm:block md:text-5xl">
          {gameState === 'quiz'
            ? 'Đang thi'
            : gameState === 'result'
              ? 'Kết quả'
              : 'Kiểm tra trình độ'}
        </h1>

        <div className="bg-topbar-blue-bg/80 text-shadow-game-title flex items-center gap-2 rounded-2xl border-2 border-blue-500/30 px-4 py-1.5">
          <Star className="text-yellow-450 fill-yellow-450 text-shadow-game-title h-5 w-5 animate-pulse" />
          <span className="text-shadow-game-title text-xs font-black text-white md:text-sm">
            Trial Account
          </span>
        </div>
      </div>

      {gameState === 'lobby' && (
        /* LOBBY VIEW - Test Selection */
        <div className="text-shadow-game-title flex w-full flex-col items-center">
          <div className="text-shadow-game-title mb-6 max-w-2xl text-center">
            <h2 className="font-heading text-shadow-game-title mb-3 text-xl font-black tracking-wider text-white uppercase md:text-3xl">
              Chọn cấp độ của bạn
            </h2>
            <p className="text-shadow-game-title text-xs leading-relaxed font-bold text-blue-200 md:text-sm">
              Hãy hoàn thành bài thi thử ngắn 3 câu để kiểm tra ngay trình độ ngoại ngữ của bản thân
              và nhận huân chương tri thức!
            </p>
            {demoExam && (
              <div className="mt-4 flex flex-wrap items-center justify-center gap-3 rounded-2xl border border-amber-300/40 bg-amber-400/15 px-4 py-3 text-xs font-bold text-amber-100">
                <span>Đang mở Đề Demo đầy đủ: {demoExam.name}</span>
                <button
                  type="button"
                  onClick={() => {
                    playBeep('click')
                    router.push('/check-point/demo')
                  }}
                  className="cursor-pointer rounded-xl bg-amber-400 px-3.5 py-1.5 font-black text-slate-950 shadow transition hover:bg-amber-300"
                >
                  Làm Đề Demo chính thức
                </button>
              </div>
            )}
          </div>

          <div className="text-shadow-game-title grid w-full max-w-4xl grid-cols-1 gap-6 md:grid-cols-2">
            {LEVEL_TESTS.map((test) => (
              <div
                key={test.id}
                onClick={() => startTest(test)}
                className="bg-ranking-table-bg hover:bg-placement-hover-bg border-ranking-table-border group text-shadow-game-title flex transform cursor-pointer gap-4 rounded-3xl border-3 p-6 shadow-[0_8px_16px_rgba(0,0,0,0.4)] transition-all duration-300 hover:-translate-y-1 hover:border-yellow-400 hover:shadow-[0_12px_24px_rgba(234,179,8,0.2)]"
              >
                <div className="text-shadow-game-title flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border-2 border-blue-500/20 bg-gradient-to-b from-slate-800 to-slate-900 text-3xl transition-transform group-hover:scale-110">
                  {test.icon}
                </div>
                <div className="text-shadow-game-title flex flex-col justify-between">
                  <div>
                    <h3 className="group-hover:text-yellow-350 text-shadow-game-title text-base font-black tracking-wide text-white uppercase transition-colors md:text-lg">
                      {test.name}
                    </h3>
                    <p className="text-shadow-game-title mt-1 text-xs leading-relaxed font-semibold text-blue-300">
                      {test.desc}
                    </p>
                  </div>
                  <div className="text-shadow-game-title mt-3 flex items-center gap-4 text-[10px] font-black tracking-widest text-white/50 uppercase transition-colors group-hover:text-white/80">
                    <span className="text-shadow-game-title flex items-center gap-1">
                      <Clock className="text-shadow-game-title h-3.5 w-3.5 text-blue-400" />{' '}
                      {test.timeLimit}s
                    </span>
                    <span className="text-shadow-game-title flex items-center gap-1">
                      <HelpCircle className="text-shadow-game-title h-3.5 w-3.5 text-orange-400" />{' '}
                      {test.questionsCount} câu hỏi
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {gameState === 'quiz' && selectedLevel && questions.length > 0 && (
        /* QUIZ VIEW - Active quiz playing */
        <div className="text-shadow-game-title flex w-full max-w-3xl flex-col items-center">
          {/* Progress bar and countdown timer */}
          <div className="bg-ranking-table-bg/90 border-ranking-table-border text-shadow-game-title mb-6 flex w-full items-center justify-between gap-6 rounded-[2rem] border-3 p-4">
            <div className="text-shadow-game-title flex-1">
              <div className="text-shadow-game-title mb-1.5 flex justify-between text-[10px] font-black tracking-wider text-white uppercase md:text-xs">
                <span>
                  Tiến trình: Câu {currentIndex + 1}/{questions.length}
                </span>
                <span>{Math.round(((currentIndex + 1) / questions.length) * 100)}%</span>
              </div>
              <div className="text-shadow-game-title h-3 w-full overflow-hidden rounded-full border border-blue-500/20 bg-blue-950">
                <div
                  className="text-shadow-game-title h-full bg-gradient-to-r from-green-400 to-emerald-500 transition-all duration-300"
                  style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }} // clone-gate-ignore
                />
              </div>
            </div>

            <div className="bg-topbar-orange-bg border-topbar-orange-border text-shadow-game-title flex shrink-0 items-center gap-2 rounded-2xl border-2 px-4 py-2 text-sm font-black text-white shadow-md">
              <Clock className="text-shadow-game-title h-4 w-4 animate-spin" />
              <span>{timeLeft}s</span>
            </div>
          </div>

          {/* Question Card */}
          <div className="bg-ranking-table-bg border-ranking-table-border text-shadow-game-title w-full rounded-[2.2rem] border-3 p-6 shadow-[0_15px_30px_rgba(0,0,0,0.5)] backdrop-blur-sm md:p-8">
            <span className="bg-yellow-450/15 text-shadow-game-title rounded-lg border border-yellow-400/30 px-3 py-1 text-[10px] font-black tracking-widest text-yellow-400 uppercase">
              {selectedLevel.name} Test
            </span>
            <h2 className="font-heading text-shadow-game-title mt-4 mb-6 text-lg leading-relaxed font-black text-white md:text-2xl">
              {currentQuestion.text}
            </h2>

            {/* Answer Options Grid */}
            <div className="text-shadow-game-title flex flex-col gap-4">
              {currentQuestion.options.map((opt, idx) => {
                const isSelected = selectedAnswer === idx
                const isCorrectAns = currentQuestion.correct === idx

                let btnStyles =
                  'bg-game-input-focus-shadow hover:bg-game-input-hover-bg border-ranking-table-border text-white'
                let statusIcon = null

                if (isAnswerSubmitted) {
                  if (isCorrectAns) {
                    btnStyles = 'bg-green-500/20 border-green-500 text-green-400'
                    statusIcon = (
                      <CheckCircle className="text-shadow-game-title h-5 w-5 shrink-0 text-green-400" />
                    )
                  } else if (isSelected) {
                    btnStyles = 'bg-red-500/20 border-red-500 text-red-400'
                    statusIcon = (
                      <XCircle className="text-shadow-game-title h-5 w-5 shrink-0 text-red-400" />
                    )
                  } else {
                    btnStyles = 'bg-blue-950/20 border-blue-950/40 text-white/30'
                  }
                } else if (isSelected) {
                  btnStyles = 'bg-blue-600/35 border-blue-400 text-yellow-350 shadow-inner'
                }

                return (
                  <button
                    key={idx}
                    disabled={isAnswerSubmitted}
                    onClick={() => handleSelectAnswer(idx)}
                    className={cn(
                      'flex w-full cursor-pointer items-center justify-between rounded-2xl border-2 px-5 py-4 text-left text-sm font-bold transition-all md:text-base',
                      btnStyles,
                    )}
                  >
                    <div className="text-shadow-game-title flex items-center gap-3">
                      <span
                        className={cn(
                          'flex h-7 w-7 shrink-0 items-center justify-center rounded-xl border text-xs font-black',
                          isSelected
                            ? 'border-blue-300 bg-blue-500 text-white'
                            : 'border-blue-500/20 bg-blue-950/40 text-blue-300',
                        )}
                      >
                        {String.fromCharCode(65 + idx)}
                      </span>
                      <span>{opt}</span>
                    </div>
                    {statusIcon}
                  </button>
                )
              })}
            </div>

            {/* Answer Explanation (Appears after submission) */}
            {isAnswerSubmitted && (
              <div className="animate-in fade-in slide-in-from-top-2 text-shadow-game-title mt-6 rounded-2xl border border-blue-400/20 bg-blue-500/10 p-4 text-xs leading-relaxed text-blue-200 md:text-sm">
                <span className="text-yellow-450 text-shadow-game-title mb-1 block font-black uppercase">
                  💡 Hướng dẫn đáp án:
                </span>
                {currentQuestion.explanation}
              </div>
            )}

            {/* Submit / Next Button */}
            <div className="text-shadow-game-title mt-8 flex justify-end">
              {!isAnswerSubmitted ? (
                <button
                  onClick={handleSubmitAnswer}
                  disabled={selectedAnswer === null}
                  className="text-shadow-game-title flex cursor-pointer items-center gap-2 rounded-2xl border-2 border-green-800 bg-gradient-to-b from-green-400 to-green-600 px-6 py-3 text-xs font-black tracking-widest text-white uppercase shadow-md transition-all hover:scale-105 active:scale-95 disabled:opacity-50 md:text-sm"
                >
                  <span>Kiểm tra</span>
                  <CheckCircle className="text-shadow-game-title h-4 w-4" />
                </button>
              ) : (
                <button
                  onClick={handleNext}
                  className="text-shadow-game-title flex cursor-pointer items-center gap-2 rounded-2xl border-2 border-blue-800 bg-gradient-to-b from-blue-400 to-blue-600 px-6 py-3 text-xs font-black tracking-widest text-white uppercase shadow-md transition-all hover:scale-105 active:scale-95 md:text-sm"
                >
                  <span>
                    {currentIndex === questions.length - 1 ? 'Xem kết quả' : 'Câu tiếp theo'}
                  </span>
                  <ArrowRight className="text-shadow-game-title h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {gameState === 'result' && selectedLevel && (
        /* RESULT VIEW - Test finished details */
        <div className="text-shadow-game-title flex w-full max-w-md flex-col items-center">
          <div className="bg-ranking-table-bg border-ranking-table-border text-shadow-game-title flex w-full flex-col items-center rounded-[2.2rem] border-3 p-8 text-center shadow-[0_15px_30px_rgba(0,0,0,0.5)] backdrop-blur-sm">
            {/* Trophy Icon */}
            <div className="text-shadow-game-title mb-6 flex h-24 w-24 animate-bounce items-center justify-center rounded-3xl border-3 border-white bg-gradient-to-b from-yellow-400 to-amber-500 text-5xl shadow-lg">
              🏆
            </div>

            <span className="text-yellow-450 text-shadow-game-title text-[10px] font-black tracking-widest uppercase">
              Hoàn thành kiểm tra
            </span>
            <h2 className="font-heading text-shadow-game-title mt-1 mb-4 text-2xl font-black tracking-wide text-white uppercase md:text-3xl">
              {selectedLevel.name}
            </h2>

            {/* Score circle */}
            <div className="text-shadow-game-title relative mb-6 flex h-36 w-36 flex-col items-center justify-center rounded-full border-4 border-blue-500/30 bg-blue-950/40">
              <span className="text-shadow-game-title text-xs font-black tracking-wider text-white/60 uppercase">
                Đúng
              </span>
              <span className="text-yellow-350 text-shadow-game-title my-0.5 text-5xl font-black drop-shadow-md">
                {score}/{questions.length}
              </span>
              <span className="text-shadow-game-title text-xs font-extrabold text-green-400 uppercase">
                +{score * 20} Coins
              </span>
            </div>

            {/* Assessment feedback */}
            <div className="text-shadow-game-title mb-6 w-full rounded-2xl border border-white/10 bg-white/5 p-4 text-xs leading-relaxed font-semibold text-blue-200 md:text-sm">
              {score === questions.length ? (
                <span>
                  🎉 Tuyệt vời! Bạn đã đạt điểm tuyệt đối. Trình độ của bạn rất phù hợp để tiếp tục
                  khám phá thế giới tiếp theo!
                </span>
              ) : score >= 1 ? (
                <span>
                  👍 Tốt lắm! Bạn có nền tảng vững vàng, hãy cố gắng ôn tập thêm các câu sai để bứt
                  phá nhé.
                </span>
              ) : (
                <span>
                  🎯 Bạn cần cố gắng học tập nhiều hơn. Hãy bắt đầu ôn tập từ các cấp độ cơ bản nhất
                  nhé!
                </span>
              )}
            </div>

            {/* Action buttons */}
            <div className="text-shadow-game-title flex w-full flex-col gap-3">
              <button
                onClick={() => startTest(selectedLevel)}
                className="from-topbar-orange-bg to-placement-btn-to border-topbar-orange-hover text-shadow-game-title w-full cursor-pointer rounded-2xl border-2 bg-gradient-to-b py-3 text-xs font-black tracking-widest text-white uppercase shadow-md transition-all hover:scale-105 active:scale-95 md:text-sm"
              >
                Làm lại bài thi
              </button>

              <button
                onClick={() => {
                  playBeep('click')
                  setGameState('lobby')
                }}
                className="text-shadow-game-title w-full cursor-pointer rounded-2xl border-2 border-blue-800 bg-gradient-to-b from-blue-400 to-blue-600 py-3 text-xs font-black tracking-widest text-white uppercase shadow-md transition-all hover:scale-105 active:scale-95 md:text-sm"
              >
                Chọn cấp độ khác
              </button>

              <button
                onClick={() => {
                  playBeep('click')
                  router.push('/')
                }}
                className="bg-topbar-blue-bg/80 hover:bg-topbar-blue-hover text-shadow-game-title w-full cursor-pointer rounded-2xl border-2 border-blue-500/30 py-3 text-xs font-black tracking-widest text-white uppercase transition-all active:scale-95 md:text-sm"
              >
                Về trang chủ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
