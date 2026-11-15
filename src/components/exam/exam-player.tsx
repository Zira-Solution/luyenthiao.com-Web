"use client"

import { ArrowLeft, ArrowRight, Clock, X } from "lucide-react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react"

import { PART_RENDERERS, type ReviewContext } from "./parts"

import { gradeExam, saveAttempt, type ExamAttempt } from "@/lib/exam"
import type { AnswerMap, Exam } from "@/types/exam"

function formatTime(secs: number): string {
  const mins = Math.floor(secs / 60)
  const remainingSecs = secs % 60
  return `${mins.toString().padStart(2, "0")}:${remainingSecs.toString().padStart(2, "0")}`
}

function formatAudioTime(secs: number): string {
  if (isNaN(secs)) return "00:00"
  const mins = Math.floor(secs / 60)
  const remainingSecs = Math.floor(secs % 60)
  return `${mins.toString().padStart(2, "0")}:${remainingSecs.toString().padStart(2, "0")}`
}

interface ExamPlayerProps {
  exam: Exam
  attempt?: ExamAttempt | null
  mode: "exam" | "review"
  onExit: () => void
}

export function ExamPlayer({ exam, attempt, mode, onExit }: ExamPlayerProps): React.ReactElement {
  const router = useRouter()
  const isReview = mode === "review"

  // Exam structures & navigation
  const structures = exam.structures
  const totalPartsInStruct = structures[0]?.parts?.length ?? 0
  const [activeStructIdx, setActiveStructIdx] = useState(0)
  const [activePartIdx, setActivePartIdx] = useState(0)

  const currentStruct = structures[activeStructIdx]
  const currentPart = currentStruct?.parts?.[activePartIdx]
  const structPartCount = currentStruct?.parts?.length || 0

  // Answers – in review mode initialized from the attempt, otherwise read-only
  const [answers, setAnswers] = useState<AnswerMap>(() =>
    isReview && attempt ? attempt.answers : {},
  )

  // Timers (exam mode only)
  const [listeningTimer, setListeningTimer] = useState(() => (structures[0]?.minutes ?? 35) * 60)
  const [rwTimer, setRwTimer] = useState(() => (structures[1]?.minutes ?? 30) * 60)

  // Modals
  const [isTransitionOpen, setIsTransitionOpen] = useState(false)
  const [isSubmitWarningOpen, setIsSubmitWarningOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Audio player
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const currentTimer = activeStructIdx === 0 ? listeningTimer : rwTimer

  // Grading (only needed in review mode)
  const grade = useMemo(
    () => (isReview && attempt ? gradeExam(exam, attempt.answers) : null),
    [isReview, attempt, exam],
  )

  // Build review context for the current part
  const reviewContext: ReviewContext | undefined = useMemo(() => {
    if (!isReview || !grade || !currentPart) return undefined
    return {
      getGrade: (key) => grade.byKey[key],
      partScore: grade.byPart[currentPart.id],
    }
  }, [isReview, grade, currentPart])

  const handleSubmitExam = useCallback(() => {
    setIsSubmitWarningOpen(false)
    setIsSubmitting(true)
    setTimeout(() => {
      const result = gradeExam(exam, answers)
      const attemptRecord: ExamAttempt = {
        examId: exam.id,
        answers,
        grade: { correct: result.total.correct, total: result.total.total },
        submittedAt: new Date().toISOString(),
      }
      saveAttempt(attemptRecord)
      const listening = result.byStructure[exam.structures[0]?.id ?? ""]?.correct ?? 0
      const rw = result.byStructure[exam.structures[1]?.id ?? ""]?.correct ?? 0
      router.push(
        `/testresult?examId=${exam.id}&score=${result.total.correct}&listening=${listening}&rw=${rw}&total=${result.total.total}`,
      )
    }, 1500)
  }, [exam, answers, router])

  // Countdown timer – only runs in exam mode
  useEffect(() => {
    if (mode !== "exam") return
    const interval = setInterval(() => {
      if (activeStructIdx === 0) {
        setListeningTimer((prev) => {
          if (prev <= 1) {
            clearInterval(interval)
            setActiveStructIdx(1)
            setActivePartIdx(0)
            return 0
          }
          return prev - 1
        })
      } else {
        setRwTimer((prev) => {
          if (prev <= 1) {
            clearInterval(interval)
            handleSubmitExam()
            return 0
          }
          return prev - 1
        })
      }
    }, 1000)
    return () => clearInterval(interval)
  }, [activeStructIdx, mode, handleSubmitExam])

  // Audio loading & control
  useEffect(() => {
    if (!currentPart) return
    const prevAudio = audioRef.current
    const handleTimeUpdate = () => {
      if (audioRef.current) setCurrentTime(audioRef.current.currentTime)
    }
    const handleLoadedMetadata = () => {
      if (audioRef.current) setDuration(audioRef.current.duration)
    }
    const handleEnded = () => {
      setIsPlaying(false)
      setCurrentTime(0)
    }

    const audioUrl = currentPart.audioUrl ?? null

    if (audioUrl) {
      if (prevAudio) prevAudio.pause()
      const audio = new Audio(audioUrl)
      audioRef.current = audio
      audio.addEventListener("timeupdate", handleTimeUpdate)
      audio.addEventListener("loadedmetadata", handleLoadedMetadata)
      audio.addEventListener("ended", handleEnded)
      // reset inline audio state when the active part changes
      // eslint-disable-next-line react-hooks/set-state-in-effect -- reset đúng mục đích khi Audio mới được tạo
      setIsPlaying(false)
      setCurrentTime(0)
      setDuration(0)
    } else {
      if (prevAudio) prevAudio.pause()
      audioRef.current = null
       
      setIsPlaying(false)
      setCurrentTime(0)
      setDuration(0)
    }

    return () => {
      if (audioRef.current) {
        const aud = audioRef.current
        aud.pause()
        try {
          aud.removeEventListener("timeupdate", handleTimeUpdate)
          aud.removeEventListener("loadedmetadata", handleLoadedMetadata)
          aud.removeEventListener("ended", handleEnded)
        } catch {
          /* ignore */
        }
      }
    }
  }, [activeStructIdx, activePartIdx, currentPart])

  const updateAnswer = useCallback(
    (partId: string, key: string, val: string | null) => {
      if (isReview) return
      setAnswers((prev) => {
        const next = { ...prev }
        const existing = { ...(next[partId] ?? {}) }
        if (val === null) delete existing[key]
        else existing[key] = val
        next[partId] = existing
        return next
      })
    },
    [isReview],
  )

  const toggleAudio = () => {
    if (!audioRef.current) return
    if (isPlaying) {
      audioRef.current.pause()
      setIsPlaying(false)
    } else {
      audioRef.current.play().catch((err) => console.log("Audio play error:", err))
      setIsPlaying(true)
    }
  }

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value)
    if (audioRef.current) {
      audioRef.current.currentTime = val
      setCurrentTime(val)
    }
  }

  const handleNext = () => {
    const lastStructIdx = structures.length - 1
    if (activePartIdx < structPartCount - 1) {
      setActivePartIdx((p) => p + 1)
    } else if (activeStructIdx < lastStructIdx) {
      // qua cấu trúc tiếp theo (Listening → Reading)
      if (activeStructIdx === 0 && !isReview) {
        setIsTransitionOpen(true)
      } else {
        setActiveStructIdx(activeStructIdx + 1)
        setActivePartIdx(0)
      }
    } else if (!isReview) {
      setIsSubmitWarningOpen(true)
    }
    // review mode: phần cuối cùng → no-op
  }

  const handlePrev = () => {
    if (activePartIdx > 0) {
      setActivePartIdx((p) => p - 1)
    } else if (activeStructIdx > 0) {
      // về cấu trúc trước, nhảy tới phần cuối
      const prevStruct = structures[activeStructIdx - 1]
      if (!prevStruct) return
      setActiveStructIdx((s) => s - 1)
      setActivePartIdx(prevStruct.parts.length - 1)
    }
  }

  const handleStartReadingWriting = () => {
    setIsTransitionOpen(false)
    setActiveStructIdx(1)
    setActivePartIdx(0)
  }

  if (!currentStruct || !currentPart) {
    return (
      <main className="w-full h-[100dvh] bg-[#16143c] flex items-center justify-center text-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-white" />
      </main>
    )
  }

  // Progress across both structures
  const totalSteps = structures.reduce((acc, s) => acc + s.parts.length, 0)
  const currentStepIndex =
    activeStructIdx === 0 ? activePartIdx : totalPartsInStruct + activePartIdx
  const progressPercent = Math.min(100, Math.round((currentStepIndex / totalSteps) * 100))

  const Renderer = PART_RENDERERS[currentPart.kind]
  const partScore = grade?.byPart[currentPart.id]

  return (
    <main className="relative w-full h-[100dvh] overflow-hidden bg-[#16143c] flex flex-col justify-between select-none font-sans">
      <Image
        src="/clone-assets/bg.1e17df80.png"
        alt=""
        fill
        priority
        className="object-cover opacity-80 pointer-events-none"
      />

      {/* 1. Header Bar */}
      <header className="relative z-20 flex px-[3%] pt-[1.5%] justify-between items-center gap-x-[5%] w-full">
        <div className="flex items-center gap-3">
          <button
            onClick={onExit}
            className="w-11 h-11 rounded-2xl bg-gradient-to-b from-[#8FDDFF] to-[#005CAB] p-[2px] flex items-center justify-center cursor-pointer shadow-lg hover:scale-105 active:scale-95 transition-transform"
          >
            <div className="w-full h-full rounded-[14px] bg-gradient-to-b from-[#4DA7FF] to-[#1985F6] flex items-center justify-center text-white">
              <X className="w-5 h-5" />
            </div>
          </button>

          <div className="relative px-5 py-2 rounded-2xl bg-slate-900/60 border border-white/20 backdrop-blur-md flex flex-col text-left">
            <span className="text-white text-[10px] font-bold tracking-wider uppercase opacity-75">
              {exam.levelName || "Movers"} Practice Test 1
            </span>
            <span className="text-[#FFE03B] text-xs font-black uppercase tracking-wide">
              {currentStruct.name} - Phần {activePartIdx + 1}/{structPartCount}
            </span>
          </div>
        </div>

        {/* Center: Progress Bar */}
        <div className="relative flex-1 max-w-[35%] h-[18px] bg-slate-950/70 border border-white/10 rounded-full flex items-center p-0.5 shadow-inner">
          <div
            className="h-full bg-gradient-to-r from-[#4DFF8A] to-[#19F685] rounded-full transition-all duration-500 shadow-md"
            style={{ width: `${progressPercent}%` }}
          />
          <div
            className="absolute top-1/2 -translate-y-1/2 w-24 h-24 flex items-center justify-center transition-all duration-500 pointer-events-none"
            style={{ left: `calc(${progressPercent}% - 48px)` }}
          >
            <Image src="/clone-assets/rocket_flyer.png" alt="Rocket progress" fill className="object-contain" />
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-3">
          {!isReview && (
            <div className="relative rounded-[12px] p-[2.5px] bg-gradient-to-b from-[#FDDBD4] to-[#BF381C] shadow-lg">
              <div className="px-4 py-1.5 rounded-[10px] bg-gradient-to-b from-[#F48E77] to-[#E36245] flex items-center gap-2 text-white font-extrabold text-sm tracking-wide">
                <Clock className="w-4 h-4" />
                <span>{formatTime(currentTimer)}</span>
              </div>
            </div>
          )}
          <div className="relative w-16 h-10 max-md:hidden">
            <Image src="/clone-assets/exam/MOVERS.824079bd.png" alt="MOVERS" fill className="object-contain" />
          </div>
        </div>
      </header>

      {/* 2. Main Content Area */}
      <div className="w-full flex-1 flex items-center justify-between px-[2%] relative z-10 my-4">
        {/* Left Nav Arrow */}
        <button
          onClick={handlePrev}
          disabled={activePartIdx === 0 && activeStructIdx === 0}
          className="w-12 h-12 rounded-full bg-gradient-to-b from-[#8FDDFF] to-[#005CAB] p-[2.5px] flex items-center justify-center shadow-2xl disabled:opacity-30 disabled:pointer-events-none hover:scale-105 active:scale-95 transition-transform cursor-pointer shrink-0 z-20"
        >
          <div className="w-full h-full rounded-full bg-gradient-to-b from-[#4DA7FF] to-[#1985F6] flex items-center justify-center text-white">
            <ArrowLeft className="w-5 h-5 stroke-[3px]" />
          </div>
        </button>

        {/* Notebook */}
        <div className="flex-1 max-w-[88%] h-[74vh] flex flex-col [background-image:linear-gradient(#efeef0,#efeef0),linear-gradient(#f3a770,#f37b70)] [background-origin:padding-box,border-box] [background-clip:padding-box,border-box] border-4 border-transparent rounded-[24px] p-5 shadow-2xl relative overflow-hidden bg-white">
          <div className="flex flex-col h-full overflow-hidden justify-between">
            {/* Main Part Content */}
            <div className="flex-1 overflow-y-auto pr-1">
              {isReview && partScore && (
                <div className="mb-4 flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900/70 backdrop-blur-md border border-white/15 text-white text-xs font-black uppercase tracking-wide">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    {partScore.correct}/{partScore.total} đúng
                  </span>
                </div>
              )}

              <Renderer
                part={currentPart}
                structureName={currentStruct.name}
                answers={answers}
                onChange={updateAnswer}
                review={reviewContext}
              />
            </div>

            {/* Footer actions */}
            <div className="w-full flex justify-between items-center mt-4 gap-3 shrink-0">
              <button
                onClick={handlePrev}
                disabled={activePartIdx === 0 && activeStructIdx === 0}
                className="rounded-[12px] p-[2.5px] bg-gradient-to-b from-[#8FDDFF] to-[#005CAB] disabled:opacity-35 disabled:pointer-events-none shadow-lg hover:scale-105 active:scale-95 transition-transform cursor-pointer"
              >
                <div className="px-5 py-2.5 rounded-[10px] bg-gradient-to-b from-[#4DA7FF] to-[#1985F6] flex items-center gap-2 text-white font-extrabold text-sm tracking-wide">
                  <ArrowLeft className="w-4 h-4" />
                  <span>Câu trước</span>
                </div>
              </button>

              {isReview ? (
                <button
                  onClick={handleNext}
                  disabled={activeStructIdx === structures.length - 1 && activePartIdx === structPartCount - 1}
                  className="rounded-[12px] p-[2.5px] bg-gradient-to-b from-[#4DFF8A] to-[#00A857] disabled:opacity-35 disabled:pointer-events-none shadow-lg hover:scale-105 active:scale-95 transition-transform cursor-pointer"
                >
                  <div className="px-5 py-2.5 rounded-[10px] bg-gradient-to-b from-[#4DFF8A] to-[#19F685] flex items-center gap-2 text-white font-extrabold text-sm tracking-wide">
                    <span>Câu tiếp theo</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </button>
              ) : (
                <button
                  onClick={handleNext}
                  className="rounded-[12px] p-[2.5px] bg-gradient-to-b from-[#4DFF8A] to-[#00A857] shadow-lg hover:scale-105 active:scale-95 transition-transform cursor-pointer"
                >
                  <div className="px-5 py-2.5 rounded-[10px] bg-gradient-to-b from-[#4DFF8A] to-[#19F685] flex items-center gap-2 text-white font-extrabold text-sm tracking-wide">
                    <span>{activePartIdx === structPartCount - 1 && activeStructIdx === structures.length - 1 ? "Nộp bài" : "Tiếp tục"}</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Right Nav Arrow */}
        <button
          onClick={handleNext}
          disabled={isReview && activePartIdx === structPartCount - 1 && activeStructIdx === structures.length - 1}
          className="w-12 h-12 rounded-full bg-gradient-to-b from-[#8FDDFF] to-[#005CAB] p-[2.5px] flex items-center justify-center shadow-2xl disabled:opacity-30 disabled:pointer-events-none hover:scale-105 active:scale-95 transition-transform cursor-pointer shrink-0 z-20"
        >
          <div className="w-full h-full rounded-full bg-gradient-to-b from-[#4DA7FF] to-[#1985F6] flex items-center justify-center text-white">
            <ArrowRight className="w-5 h-5 stroke-[3px]" />
          </div>
        </button>
      </div>

      {/* Audio player (Listening) */}
      {activeStructIdx === 0 && currentPart.audioUrl && !isReview && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30">
          <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-slate-900/70 border border-white/20 backdrop-blur-md shadow-xl">
            <button
              onClick={toggleAudio}
              className="w-9 h-9 rounded-full bg-gradient-to-b from-[#4AFF86] to-[#00843D] flex items-center justify-center text-white shadow-inner cursor-pointer hover:scale-105 active:scale-95 transition-transform"
            >
              {isPlaying ? (
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="5" width="4" height="14" rx="1"/><rect x="14" y="5" width="4" height="14" rx="1"/></svg>
              ) : (
                <svg className="w-4 h-4 ml-0.5" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
              )}
            </button>
            <input
              type="range"
              min={0}
              max={duration || 0}
              value={currentTime}
              onChange={handleSeek}
              className="w-40 accent-[#19F685] cursor-pointer"
            />
            <span className="text-white text-[10px] font-bold tabular-nums">
              {formatAudioTime(currentTime)} / {formatAudioTime(duration)}
            </span>
          </div>
        </div>
      )}

      {/* Transition modal */}
      {isTransitionOpen && (
        <Modal
          title="Hoàn thành phần Listening"
          body="Phần nghe đã xong. Bạn có muốn chuyển sang phần Reading & Writing không?"
          confirmLabel="Bắt đầu Reading & Writing"
          onConfirm={handleStartReadingWriting}
          onCancel={() => setIsTransitionOpen(false)}
        />
      )}

      {/* Submit warning modal */}
      {isSubmitWarningOpen && (
        <Modal
          title="Nộp bài"
          body="Bạn chắc chắn muốn nộp bài? Sau khi nộp bạn sẽ không thể chỉnh sửa câu trả lời."
          confirmLabel="Nộp bài"
          loading={isSubmitting}
          loadingText="Đang chấm điểm..."
          onConfirm={handleSubmitExam}
          onCancel={() => setIsSubmitWarningOpen(false)}
        />
      )}
    </main>
  )
}

function Modal({
  title,
  body,
  confirmLabel,
  loading,
  loadingText,
  onConfirm,
  onCancel,
}: {
  title: string
  body: string
  confirmLabel: string
  loading?: boolean
  loadingText?: string
  onConfirm: () => void
  onCancel: () => void
}): React.ReactElement {
  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 text-center">
        <h3 className="text-lg font-black text-slate-800">{title}</h3>
        <p className="text-sm text-slate-500 font-medium mt-2">{body}</p>
        <div className="flex gap-3 mt-6">
          <button
            onClick={onCancel}
            disabled={loading}
            className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 font-extrabold text-sm disabled:opacity-50 transition-colors cursor-pointer"
          >
            Hủy
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 py-2.5 rounded-xl bg-gradient-to-b from-[#4DA7FF] to-[#1985F6] text-white font-extrabold text-sm hover:scale-105 active:scale-95 transition-transform disabled:opacity-50 cursor-pointer"
          >
            {loading ? loadingText : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}