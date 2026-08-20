"use client"

import Image from "next/image"
import type { ReactElement } from "react"

import type { PartRendererProps } from "./types"

import { AnswerFeedback } from "@/components/exam/answer-feedback"
import { cn } from "@/lib/utils"


export function PartMatching({
  part,
  structureName,
  answers,
  onChange,
  review,
}: PartRendererProps): ReactElement {
  const partAnswers = answers[part.id] ?? {}
  const letterOptions = (part.wordBox ?? []).map((w) => w.label).filter(Boolean)
  const items = part.questions.filter((q) => !q.isExample)

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-5 h-full overflow-hidden">
      <div className="md:col-span-6 flex flex-col gap-3 overflow-y-auto pr-1">
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl mb-2 shadow-sm shrink-0">
          <span className="px-2 py-0.5 bg-violet-600 text-white font-extrabold text-[9px] uppercase rounded tracking-wider">
            {structureName}
          </span>
          <h3 className="text-slate-700 text-xs font-black mt-2 leading-relaxed">
            {part.title}
          </h3>
        </div>

        <h4 className="text-slate-800 text-xs font-black uppercase tracking-wider border-b pb-2 mb-1">
          Danh sách vật phẩm
        </h4>

        {items.map((q) => {
          const detail = q.details[0]
          if (!detail) return null
          const userLetter = (partAnswers[detail.id] as string | undefined) ?? ""
          const grade = review ? review.getGrade(detail.id) : undefined

          return (
            <div
              key={q.id}
              className={cn(
                "flex items-center justify-between p-2.5 rounded-xl shadow-sm",
                review
                  ? grade?.status === "correct"
                    ? "border-2 border-emerald-500 bg-emerald-50"
                    : grade?.status === "wrong"
                      ? "border-2 border-rose-500 bg-rose-50"
                      : "border border-slate-200 bg-slate-50"
                  : "bg-slate-50 border border-slate-200",
              )}
            >
              <div className="flex items-center gap-3">
                {detail.imageUrl && (
                  <div className="relative w-12 h-12 rounded-lg border bg-white overflow-hidden shrink-0">
                    <Image src={detail.imageUrl} alt="" fill className="object-contain" />
                  </div>
                )}
                <span className="font-extrabold text-xs text-slate-700">{detail.label}</span>
                {review && grade && (
                  <AnswerFeedback grade={grade} />
                )}
              </div>

              <div className="flex items-center gap-1.5">
                <select
                  value={userLetter}
                  disabled={Boolean(review)}
                  onChange={(e) => onChange(part.id, detail.id, e.target.value || null)}
                  className={cn(
                    "w-14 h-9 rounded-lg border-2 bg-white text-center font-black text-xs text-slate-700 focus:outline-none",
                    review
                      ? "pointer-events-none"
                      : "border-slate-200 focus:border-[#1985F6]",
                    review && grade?.status === "correct" && "border-emerald-500 bg-emerald-50",
                    review && grade?.status === "wrong" && "border-rose-500 bg-rose-50",
                  )}
                >
                  <option value="">-</option>
                  {letterOptions.map((l) => (
                    <option key={l} value={l}>
                      {l}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )
        })}
      </div>

      <div className="md:col-span-6 bg-slate-100/60 border border-slate-200/50 p-4 rounded-2xl h-full overflow-y-auto">
        <div className="grid grid-cols-2 gap-3.5">
          {(part.wordBox ?? []).map((img) => (
            <div
              key={img.label}
              className="bg-white p-2 rounded-xl border border-slate-200 flex flex-col items-center gap-1 shadow-sm relative"
            >
              <div className="relative w-full aspect-square rounded-lg overflow-hidden border border-slate-100 bg-slate-50">
                {img.imageId && (
                  <Image src={img.imageId} alt="" fill className="object-contain p-1" />
                )}
              </div>
              <span className="w-5 h-5 rounded-full bg-[#1985F6] text-white text-[10px] font-black flex items-center justify-center shadow">
                {img.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}