"use client"

import Image from "next/image"
import { useMemo, useState } from "react"

import { SpeakingMicRecord } from "./speaking-mic-record"
import { SpeakingScene } from "./speaking-scene"

import type { SpeakingAnswer, SpeakingQuestion } from "@/types/speaking"

interface SpeakingQuestionProps {
  question: SpeakingQuestion
  answer?: SpeakingAnswer
  onAnswered: (id: string, partial: Omit<SpeakingAnswer, "questionId">) => void
  questionNumber?: number
}

/** Dòng audio câu hỏi: avatar giáo viên + nút loa + câu hỏi tiếng Anh. */
function QuestionHeader({
  question,
  questionNumber,
}: {
  question: SpeakingQuestion
  questionNumber?: number
}): React.ReactElement {
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-[#f7e9d4] px-4 py-3 shadow-md">
      <Image
        src="/clone-assets/speaking/teacher-avatar.68a16d1c.png"
        alt="Giáo viên"
        width={56}
        height={56}
        className="h-12 w-12 rounded-full object-cover ring-2 ring-amber-300"
      />
      <div className="min-w-0 flex-1">
        <p className="text-xs font-bold uppercase tracking-wide text-amber-800">
          {questionNumber ? `CÂU HỎI SỐ ${questionNumber}` : ""}
        </p>
        <p className="truncate text-base font-black text-slate-800">{question.text}</p>
        {question.vi ? <p className="text-xs text-slate-500">{question.vi}</p> : null}
      </div>
      <Image
        src="/clone-assets/speaking/ic-speaker.1fe89d31.png"
        alt="Phát âm thanh"
        width={34}
        height={34}
        className="h-8 w-8 cursor-pointer"
      />
    </div>
  )
}

/** Phần 1b: lưới lựa chọn ảnh thật. */
function SelectableChoices({
  question,
  selected,
  onPick,
}: {
  question: SpeakingQuestion
  selected?: string
  onPick: (id: string) => void
}): React.ReactElement {
  const choices = question.choices ?? []
  return (
    <div className="grid grid-cols-4 gap-3">
      {choices.map((c) => (
        <button
          key={c.id}
          type="button"
          onClick={() => onPick(c.id)}
          className={
            "flex aspect-square cursor-pointer items-center justify-center rounded-3xl border-4 bg-white p-2 shadow-md transition-transform hover:scale-105 " +
            (selected === c.id ? "border-emerald-500 ring-4 ring-emerald-200" : "border-[#f0d9b0]")
          }
          aria-label={c.label}
        >
          <Image src={c.src} alt={c.label} width={0} height={0} sizes="100vw" className="h-auto max-h-full w-auto rounded-xl" />
        </button>
      ))}
    </div>
  )
}

/** Vùng chỉ dẫn mic lớn + nút ghi âm. */
function MicPrompt({
  onRecorded,
  onReset,
  recorded,
}: {
  onRecorded: (r: { duration: number; blobUrl: string }) => void
  onReset?: () => void
  recorded?: boolean
}): React.ReactElement {
  return (
    <div className="flex flex-col items-center gap-4">
      <p className="text-xs text-slate-500">{recorded ? "Bạn đã ghi âm câu trả lời." : ""}</p>
      <SpeakingMicRecord onRecorded={onRecorded} onReset={onReset} />
    </div>
  )
}

/** Phần 2: cảnh + mũi tên chỉ vật + mic. */
function PointerPrompt({
  question,
  onRecorded,
  onReset,
}: {
  question: SpeakingQuestion
  onRecorded: (r: { duration: number; blobUrl: string }) => void
  onReset?: () => void
}): React.ReactElement {
  const { pointer, sceneBg } = question
  return (
    <div className="flex flex-col gap-4">
      <div className="relative w-full overflow-hidden rounded-[1.75rem] border-4 border-[#f0d9b0] shadow-xl">
        {sceneBg ? (
          <Image
            src={sceneBg}
            alt="Bức tranh"
            width={0}
            height={0}
            sizes="100vw"
            className="h-auto w-full"
          />
        ) : null}
        {pointer ? (
          <svg viewBox="0 0 100 100" className="pointer-events-none absolute inset-0 h-full w-full">
            <g
              transform={`translate(${pointer.left} ${pointer.top}) rotate(-45)`}
              className="origin-center"
            >
              <circle r={10} fill="#ff4d4f" />
              <polygon points="-4,-14 4,-14 0,-2" fill="#ff4d4f" />
            </g>
          </svg>
        ) : null}
      </div>
      <SpeakingMicRecord onRecorded={onRecorded} onReset={onReset} />
    </div>
  )
}

/** Phần 3: dải 4 thẻ + thẻ phóng to + mic. */
function ZoomPrompt({
  question,
  onRecorded,
  onReset,
}: {
  question: SpeakingQuestion
  onRecorded: (r: { duration: number; blobUrl: string }) => void
  onReset?: () => void
}): React.ReactElement {
  const cards = question.cards ?? []
  const zoom = question.zoomCard ?? cards[0]?.src
  return (
    <div className="flex flex-col items-center gap-4">
      <div className="grid w-full max-w-lg grid-cols-4 gap-2">
        {cards.map((c) => (
          <span
            key={c.src}
            className="flex aspect-square items-center justify-center overflow-hidden rounded-2xl bg-white p-1 shadow-md ring-2 ring-[#f0d9b0]"
          >
            <Image src={c.src} alt={c.label} width={0} height={0} sizes="100vw" className="h-full w-full rounded-xl object-contain" />
          </span>
        ))}
      </div>
      {zoom ? (
        <div className="flex h-44 w-44 items-center justify-center overflow-hidden rounded-3xl bg-white p-2 shadow-lg ring-4 ring-amber-300">
          <Image src={zoom} alt="phóng to" width={0} height={0} sizes="100vw" className="h-full w-full object-contain" />
        </div>
      ) : null}
      <SpeakingMicRecord onRecorded={onRecorded} onReset={onReset} />
    </div>
  )
}

interface LocalAnswer {
  selected?: string
  detail?: string
  recorded?: boolean
  duration?: number
}

/**
 * Render một câu hỏi theo dạng thao tác thật: bấm vật / chọn ảnh / kéo-thả / ghi âm.
 */
export function SpeakingQuestion({
  question,
  answer,
  onAnswered,
  questionNumber,
}: SpeakingQuestionProps): React.ReactElement {
  const [local, setLocal] = useState<LocalAnswer>({
    selected: answer?.selected,
    detail: answer?.detail,
    recorded: answer?.answered && answer?.duration !== undefined,
    duration: answer?.duration,
  })

  const partTitle = useMemo(() => question.partTitle, [question.partTitle])

  const commit = (partial: Omit<SpeakingAnswer, "questionId">) => {
    setLocal({ ...local, ...partial })
    onAnswered(question.id, partial)
  }

  return (
    <div className="flex flex-col gap-5">
      {partTitle ? (
        <p className="rounded-2xl bg-[#e63a2e] px-4 py-3 text-center text-sm font-black uppercase tracking-wide text-white shadow-md">
          {partTitle}
        </p>
      ) : null}

      <QuestionHeader question={question} questionNumber={questionNumber} />

      {question.kind === "scene-mark" && (
        <SpeakingScene
          sceneBg={question.sceneBg}
          slots={question.scene ?? []}
          mode="mark"
          selectedId={local.selected}
          onSelect={(id) =>
            commit({
              answered: true,
              selected: id,
              detail: question.scene?.find((s) => s.id === id)?.label,
            })
          }
        />
      )}

      {question.kind === "choose-object" && (
        <SelectableChoices
          question={question}
          selected={local.selected}
          onPick={(id) =>
            commit({
              answered: true,
              selected: id,
              detail: question.choices?.find((c) => c.id === id)?.label,
            })
          }
        />
      )}

      {question.kind === "drag-object" && (
        <SpeakingScene
          sceneBg={question.sceneBg}
          slots={question.scene ?? []}
          draggable={question.draggable}
          mode="drag"
          correctTargetId={question.correctTargetId}
          selectedId={local.selected}
          placed={local.recorded}
          onDrop={(targetId, matched) =>
            commit({
              answered: true,
              recorded: matched,
              selected: targetId,
              detail: matched ? question.scene?.find((s) => s.id === targetId)?.label : undefined,
            })
          }
        />
      )}

      {question.kind === "mic-answer" && (
        <PointerPrompt
          question={question}
          onRecorded={(r) => commit({ answered: true, recorded: true, duration: r.duration })}
          onReset={() => commit({ answered: false, recorded: false, duration: undefined })}
        />
      )}

      {question.kind === "mic-zoom" && (
        <ZoomPrompt
          question={question}
          onRecorded={(r) => commit({ answered: true, recorded: true, duration: r.duration })}
          onReset={() => commit({ answered: false, recorded: false, duration: undefined })}
        />
      )}

      {question.kind === "mic-plain" && (
        <MicPrompt
          onRecorded={(r) => commit({ answered: true, recorded: true, duration: r.duration })}
          onReset={() => commit({ answered: false, recorded: false, duration: undefined })}
        />
      )}
    </div>
  )
}