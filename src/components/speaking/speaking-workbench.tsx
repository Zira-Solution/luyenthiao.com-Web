"use client"

import Image from "next/image"
import { useMemo, useState } from "react"

import { SpeakingQuestion } from "./speaking-question"

import type { SpeakingAnswer, SpeakingAttempt } from "@/types/speaking"

interface SpeakingWorkbenchProps {
  attempt: SpeakingAttempt
  answers: Record<string, SpeakingAnswer>
  onAnswered: (id: string, partial: Omit<SpeakingAnswer, "questionId">) => void
  onOpenSubmit: () => void
  onPrevious?: () => void
}

interface FlatQuestion {
  partLabel: string
  partInstruction: string
  partTitle?: string
  question: SpeakingAttempt["parts"][number]["questions"][number]
  qinpart: number
}

/**
 * Phòng thi Nói — khung gỗ + asset thật của Flyer. Header cố định, hiển thị
 * từng câu, mũi tên sang câu tiếp; câu cuối → mở hộp xác nhận nộp bài.
 */
export function SpeakingWorkbench({
  attempt,
  answers,
  onAnswered,
  onOpenSubmit,
  onPrevious,
}: SpeakingWorkbenchProps): React.ReactElement {
  const flat = useMemo<FlatQuestion[]>(
    () =>
      attempt.parts.flatMap((part) =>
        part.questions.map((q, i) => ({
          partLabel: part.indexLabel,
          partInstruction: part.instruction,
          partTitle: q.partTitle,
          question: q,
          qinpart: i + 1,
        })),
      ),
    [attempt],
  )

  const [index, setIndex] = useState(0)
  const current = flat[index]

  if (!current) {
    return (
      <main className="flex min-h-[100dvh] items-center justify-center bg-slate-100">
        <p className="text-slate-500">Không có câu hỏi nào.</p>
      </main>
    )
  }

  const isLast = index === flat.length - 1
  const goNext = () => (isLast ? onOpenSubmit() : setIndex(index + 1))
  const goPrev = () => (index > 0 ? setIndex(index - 1) : onPrevious?.())

  return (
    <div className="relative min-h-[100dvh] w-full overflow-hidden">
      {/* Nền trang */}
      <Image
        src="/clone-assets/speaking/bg.894c95ef.png"
        alt=""
        fill
        priority
        className="object-cover"
      />

      <div className="relative z-10 flex min-h-[100dvh] flex-col">
        {/* Header */}
        <header className="flex items-center justify-between gap-2 px-4 py-3">
          <button
            type="button"
            onClick={onPrevious}
            className="relative flex cursor-pointer items-center gap-1"
            aria-label="Thoát"
          >
            <Image
              src="/clone-assets/speaking/btn-out.94d0dd6c.png"
              alt=""
              width={118}
              height={48}
              className="h-12 w-28 object-contain"
            />
          </button>

          <div className="flex flex-col items-center">
            <div className="flex items-center gap-2">
              <Image
                src="/clone-assets/speaking/bg-logo-speaking.2a909457.png"
                alt="STARTERS"
                width={120}
                height={44}
                className="h-11 w-auto object-contain"
              />
            </div>
            <p className="mt-1 rounded-full bg-slate-800/80 px-3 py-0.5 text-sm font-black text-white">
              {current.partLabel}
            </p>
          </div>

          <div className="relative flex items-center gap-1">
            <Image
              src="/clone-assets/speaking/box-time.2ac9e25e.png"
              alt=""
              width={132}
              height={48}
              className="h-12 w-32 object-contain"
            />
          </div>
        </header>

        {/* Tiêu đề phần */}
        {current.partTitle ? (
          <div className="relative mx-auto -mt-1 mb-1 w-full max-w-3xl px-4">
            <Image
              src="/clone-assets/speaking/fr-exam-header.ec6a528f.png"
              alt=""
              width={0}
              height={0}
              sizes="100vw"
              className="h-[84px] w-full object-contain"
            />
            <p className="absolute inset-0 flex items-center justify-center text-center text-base font-black uppercase tracking-wide text-white drop-shadow">
              {current.partTitle}
            </p>
          </div>
        ) : null}

        {/* Nội dung câu hỏi */}
        <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-4 px-4 py-5">
          <p className="rounded-2xl bg-[#eaf5ff]/95 px-4 py-2.5 text-center text-sm font-semibold text-[#1667a8] shadow">
            {current.partInstruction}
          </p>

          <div className="rounded-[1.75rem] bg-[#fff8ed]/95 p-4 shadow-xl ring-1 ring-[#e7cfa6]">
            <SpeakingQuestion
              key={current.question.id}
              question={current.question}
              answer={answers[current.question.id]}
              onAnswered={onAnswered}
              questionNumber={current.qinpart}
            />
          </div>
        </main>

        {/* Footer: nút điều hướng */}
        <footer className="relative z-10 mt-auto px-6 pb-6">
          <div className="mx-auto flex max-w-3xl items-center justify-center gap-4">
            <button
              type="button"
              onClick={goPrev}
              className="cursor-pointer rounded-full border-2 border-white/70 bg-white/80 px-6 py-2.5 text-sm font-bold text-slate-700 shadow hover:bg-white"
            >
              Quay lại
            </button>
            <button
              type="button"
              onClick={goNext}
              className="relative flex cursor-pointer items-center gap-1 p-1"
            >
              <Image
                src="/clone-assets/speaking/btn-next.776b1baf.png"
                alt={isLast ? "Nộp bài" : "Câu tiếp theo"}
                width={0}
                height={0}
                sizes="100vw"
                className="h-16 w-auto object-contain drop-shadow-lg"
              />
            </button>
          </div>
        </footer>
      </div>
    </div>
  )
}