"use client"

import { Clock, HelpCircle, Maximize2 } from "lucide-react"
import Image from "next/image"
import { useEffect, useMemo, useState } from "react"

import { WritingStoryImage } from "./writing-story-image"

import type { WritingAttempt } from "@/types/writing"

interface WritingWorkbenchProps {
  attempt: WritingAttempt
  onExit: () => void
  onSubmit: (answer: string) => void
}

export function formatTimer(secs: number): string {
  const m = Math.floor(secs / 60)
  const s = secs % 60
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`
}

function countWords(text: string): number {
  const trimmed = text.trim()
  if (!trimmed) return 0
  return trimmed.split(/\s+/).length
}

/** Giao diện làm bài thi Viết: đề & ảnh bên trái, vùng ghi bên phải. */
export function WritingWorkbench({
  attempt,
  onExit,
  onSubmit,
}: WritingWorkbenchProps): React.ReactElement {
  const { prompt, headerBadge, headerTitle, badge, minutes } = attempt
  const [remaining, setRemaining] = useState(minutes * 60)
  const [answer, setAnswer] = useState("")


  // Đếm ngược thời gian làm bài.
  useEffect(() => {
    const id = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(id)
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(id)
  }, [])

  // Chặn thoát trang nhỡ tay.
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (answer.trim()) {
        e.preventDefault()
      }
    }
    window.addEventListener("beforeunload", handler)
    return () => window.removeEventListener("beforeunload", handler)
  }, [answer])

  const wordCount = useMemo(() => countWords(answer), [answer])


  return (
    <div className="relative flex min-h-[100dvh] w-full flex-col bg-page-bg text-white">
      <Image
        src="/clone-assets/bg.1e17df80.webp"
        alt=""
        fill
        priority
        className="object-cover opacity-80 pointer-events-none"
      />

      {/* ===== Header Bar ===== */}
      <header className="relative z-20 flex items-center justify-between gap-4 border-b-2 border-white/10 bg-slate-900/50 px-4 py-2.5 backdrop-blur">
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            onClick={onExit}
            aria-label="Đóng và thoát"
            className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-xl bg-gradient-to-b from-sky-400 to-blue-600 p-[2px] shadow transition-transform hover:scale-105 active:scale-95"
          >
            <span className="flex h-full w-full items-center justify-center rounded-[10px] bg-gradient-to-b from-sky-500 to-blue-700 text-lg leading-none">
              ×
            </span>
          </button>

          <div className="hidden min-w-0 flex-col sm:flex">
            <span className="truncate text-[11px] font-black uppercase tracking-wider text-purple-200">
              {headerBadge}
            </span>
            <span className="truncate text-sm font-bold text-white">{headerTitle}</span>
          </div>

          <span className="rounded-md bg-gradient-to-b from-orange-400 to-orange-600 px-3 py-1 text-xs font-black uppercase tracking-wider text-white shadow">
            {badge}
          </span>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {/* Đồng hồ */}
          <div className="flex items-center gap-2 rounded-full bg-slate-900/70 px-3 py-1.5 shadow ring-1 ring-white/10">
            <Clock className="h-4 w-4 text-amber-300" />
            <span className="font-mono text-sm font-black tabular-nums text-amber-300">
              {formatTimer(remaining)}
            </span>
            <span className="text-[11px] font-semibold text-white/60">
              Thời gian còn lại
            </span>
          </div>

          <button
            type="button"
            aria-label="Trợ giúp"
            className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl bg-white/10 text-white/80 ring-1 ring-white/15 transition hover:bg-white/20"
          >
            <HelpCircle className="h-5 w-5" />
          </button>
          <button
            type="button"
            aria-label="Phóng to"
            className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl bg-white/10 text-white/80 ring-1 ring-white/15 transition hover:bg-white/20"
          >
            <Maximize2 className="h-5 w-5" />
          </button>

          <button
            type="button"
            onClick={() => onSubmit(answer)}
            className="cursor-pointer rounded-full bg-gradient-to-b from-rose-500 to-red-700 px-5 py-2 text-sm font-black uppercase tracking-wider text-white shadow transition-transform hover:scale-[1.03] active:scale-95"
          >
            Nộp bài
          </button>
        </div>
      </header>

      {/* ===== Body ===== */}
      <main className="relative z-10 grid flex-1 gap-6 overflow-y-auto p-4 md:p-6 lg:grid-cols-[1.15fr_1fr]">
        {/* Bên trái: đề & ảnh */}
        <section className="flex flex-col gap-4">
          <div className="rounded-2xl bg-white/95 p-5 text-slate-800 shadow">
            <h2 className="text-2xl font-black uppercase tracking-wide text-slate-900 md:text-3xl">
              {prompt.title}
            </h2>
            <p className="mt-3 text-lg font-semibold leading-relaxed text-slate-700 md:text-xl">
              {prompt.instruction}
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            {prompt.images.map((img) => (
              <WritingStoryImage key={img.slot} image={img} />
            ))}
          </div>
        </section>

        {/* Bên phải: vùng ghi */}
        <section className="flex flex-col rounded-2xl bg-white/95 p-5 shadow">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <h2 className="font-black uppercase tracking-wider text-slate-900">
              Câu trả lời của bạn
            </h2>
            <span className="rounded-full bg-purple-100 px-3 py-1 text-xs font-black text-purple-700">
              Số từ: <span className="tabular-nums">{wordCount}</span>
            </span>
          </div>

          <textarea
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Viết câu trả lời của bạn ở đây…"
            className="mt-4 min-h-[300px] flex-1 resize-none rounded-xl border-2 border-purple-100 bg-white p-4 text-base leading-relaxed text-slate-800 outline-none transition focus:border-purple-400 focus:ring-4 focus:ring-purple-200/50"
          />

          <p className="mt-3 text-center text-xs font-medium text-slate-400">
            Đề bài yêu cầu viết 20 từ hoặc nhiều hơn.
          </p>
        </section>
      </main>
    </div>
  )
}