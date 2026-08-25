"use client"

import Image from "next/image"
import { useState } from "react"
import type { ReactElement } from "react"

import type { PartRendererProps } from "./types"

import { AnswerFeedback } from "@/components/exam/answer-feedback"
import { getColorName, isColorCode } from "@/lib/exam"
import { cn } from "@/lib/utils"

function NameButton({
  matchedName,
  isSelected,
  isMatched,
  onSelect,
}: {
  matchedName: string
  isSelected: boolean
  isMatched: boolean
  onSelect: () => void
}): ReactElement {
  const isColor = isColorCode(matchedName)
  const displayName = isColor ? getColorName(matchedName) : matchedName

  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "relative rounded-[10px] p-[2px] transition-all cursor-pointer",
        isSelected
          ? "bg-[#1985F6] scale-105"
          : isMatched
            ? "bg-slate-200 opacity-50 pointer-events-none"
            : "bg-gradient-to-b from-[#FFE03B] to-[#E39600] hover:scale-102",
      )}
    >
      <div
        className={cn(
          "px-4 py-1.5 rounded-[8px] text-xs font-black tracking-wide border-b-2 flex items-center gap-2",
          isSelected
            ? "bg-[#4DA7FF] text-white border-[#1985F6]"
            : "bg-white text-slate-800 border-slate-300",
        )}
      >
        {isColor && (
          <span
            className="w-3 h-3 rounded-full border border-black/10 inline-block shadow-sm shrink-0"
            style={{ backgroundColor: matchedName }}
          />
        )}
        <span>{displayName}</span>
      </div>
    </button>
  )
}

export function PartDragdrop({
  part,
  answers,
  onChange,
  review,
}: PartRendererProps): ReactElement {
  const [selectedItemName, setSelectedItemName] = useState<string | null>(null)
  const question = part.questions.find((q) => !q.isExample) ?? part.questions[0]
  const partAnswers = answers[part.id] ?? {}

  if (!question) {
    return <div className="text-sm text-slate-500">Chưa có câu hỏi</div>
  }

  return (
    <div className="flex flex-col h-full justify-between items-center gap-3">
      <div className="w-full text-center py-2 px-4 bg-white border-2 border-[#f37c70] rounded-2xl shrink-0 shadow-sm">
        <span className="text-slate-800 text-[11px] font-black uppercase tracking-wider leading-none">
          {part.title}
        </span>
      </div>

      <div className="flex flex-wrap gap-2.5 justify-center bg-slate-100/80 p-3 rounded-2xl border border-slate-200/60 w-full shadow-sm shrink-0">
        {(question.choices ?? []).map((c) => {
          const matchedName = c.label
          const isSelected = selectedItemName === matchedName
          const isMatched = Object.values(partAnswers).includes(matchedName)
          return (
            <NameButton
              key={matchedName}
              matchedName={matchedName}
              isSelected={isSelected}
              isMatched={isMatched}
              onSelect={() =>
                setSelectedItemName((prev) => (prev === matchedName ? null : matchedName))
              }
            />
          )
        })}
      </div>

      <div className="relative flex-1 w-full flex items-center justify-center overflow-hidden">
        <div className="relative w-full h-full max-w-[680px] max-h-[460px] aspect-[1.33] border border-slate-200 rounded-2xl overflow-hidden shadow-inner bg-slate-50">
          {question.promptHtml && (
            <Image
              src={question.promptHtml}
              alt="Exam content"
              fill
              className="object-contain select-none"
              draggable={false}
            />
          )}
          {question.details.map((d) => {
            const matchedName = (partAnswers[d.id] as string | undefined) ?? null
            const grade = review ? review.getGrade(d.id) : undefined
            return (
              <button
                key={d.id}
                type="button"
                onClick={() => {
                  if (selectedItemName && d.box) {
                    onChange(part.id, d.id, selectedItemName)
                    setSelectedItemName(null)
                  } else if (matchedName) {
                    onChange(part.id, d.id, null)
                  }
                }}
                disabled={Boolean(review)}
                style={{ position: "absolute", left: d.box?.left, top: d.box?.top, width: d.box?.width, height: d.box?.height }}
                title={matchedName ? "Nhấp để xoá" : "Nhấp để gán tên"}
                className={cn(
                  "border-2 border-dashed rounded-xl flex items-center justify-center transition-all gap-1.5",
                  review
                    ? "pointer-events-none"
                    : matchedName
                      ? "bg-gradient-to-b from-[#4DA7FF] to-[#1985F6] border-[#005CAB] text-white text-xs font-black shadow-lg scale-105"
                      : "bg-white/40 border-slate-400 hover:bg-white/70 hover:border-[#1985F6]",
                  review && !matchedName && "border-slate-300 bg-white/30",
                  review && grade?.status === "wrong" && "!border-rose-500 !bg-rose-50 !text-rose-900",
                  review && (!matchedName || grade?.status === "empty") && "!border-slate-300",
                )}
              >
                {(() => {
                  const isColor = matchedName && isColorCode(matchedName)
                  const displayName = matchedName ? (isColor ? getColorName(matchedName) : matchedName) : ""
                  return (
                    <>
                      {isColor && (
                        <span
                          className="w-3 h-3 rounded-full border border-white/20 inline-block shadow-sm shrink-0"
                          style={{ backgroundColor: matchedName as string }}
                        />
                      )}
                      <span className="truncate max-w-full px-1">{displayName}</span>
                      {review && (grade?.status ?? "empty") !== "correct" && (
                        <AnswerFeedback grade={grade} format="color" />
                      )}
                    </>
                  )
                })()}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}