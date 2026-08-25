"use client"

import { Check, X } from "lucide-react"
import Image from "next/image"
import type { ReactElement } from "react"

import type { PartRendererProps } from "./types"

import { cn } from "@/lib/utils"
import type { ExamDetail, ExamQuestion } from "@/types/exam"


function hasImageChoices(questions: ExamQuestion[]): boolean {
  return questions.some((q) => q.details.some((d) => d.imageUrl))
}

function ChoiceBadge({
  detail,
  correctLabel,
  userVal,
}: {
  detail: ExamDetail
  correctLabel: string | null | undefined
  userVal: string | undefined
}): ReactElement | null {
  const isCorrect = detail.label === correctLabel
  const chosenWrong = userVal === detail.label && !isCorrect
  if (isCorrect)
    return <Check className="w-4 h-4 text-emerald-600 shrink-0" />
  if (chosenWrong) return <X className="w-4 h-4 text-rose-600 shrink-0" />
  return null
}

/** L4: many questions, each a row of image choices */
function ImageChoiceLayout({
  part,
  structureName,
  questions,
  answers,
  onChange,
  review,
}: PartRendererProps & { questions: ExamQuestion[] }): ReactElement {
  const partAnswers = answers[part.id] ?? {}
  return (
    <div className="flex flex-col gap-5 h-full overflow-y-auto pr-1">
      <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl mb-2 shadow-sm shrink-0">
        <span className="px-2 py-0.5 bg-violet-600 text-white font-extrabold text-[9px] uppercase rounded tracking-wider">
          {structureName}
        </span>
        <h3 className="text-slate-700 text-xs font-black mt-2 leading-relaxed">{part.title}</h3>
      </div>
      {questions.map((q, idx) => {
        const userVal = (partAnswers[q.id] as string | undefined) ?? undefined
        if (q.isExample) {
          return (
            <div
              key={q.id}
              className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-500 font-semibold"
            >
              <strong>Ví dụ:</strong> {q.title} (Đáp án mẫu đã được điền)
            </div>
          )
        }
        return (
          <div key={q.id} className="bg-slate-50 border border-slate-200/80 p-4 rounded-2xl flex flex-col gap-3">
            <div className="flex items-center gap-2.5">
              <span className="w-6 h-6 rounded-full bg-[#1985F6] text-white font-extrabold flex items-center justify-center text-xs shrink-0 shadow-sm">
                {idx}
              </span>
              <h4 className="font-black text-sm md:text-[15px] text-slate-800 leading-snug">
                {q.title}
              </h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {q.details.map((d) => {
                const isSelected = userVal === d.label
                const isCorrect = d.label === q.correctLabel
                const chosenWrong = isSelected && !isCorrect
                return (
                  <button
                    key={d.id}
                    type="button"
                    disabled={Boolean(review)}
                    onClick={() => onChange(part.id, q.id, d.label)}
                    className={cn(
                      "p-2.5 rounded-xl border-2 bg-white flex flex-col items-center gap-1.5 transition-all",
                      review ? "pointer-events-none" : "cursor-pointer hover:border-[#4DA7FF]/50",
                      review
                        ? isCorrect
                          ? "border-emerald-500 bg-emerald-50"
                          : chosenWrong
                            ? "border-rose-500 bg-rose-50"
                            : "border-slate-200"
                        : isSelected
                          ? "border-[#1985F6] bg-[#1985F6]/5 scale-[1.01] shadow-sm"
                          : "border-slate-200",
                    )}
                  >
                    <div className="relative w-full aspect-[4/3] rounded-lg overflow-hidden border border-slate-100 bg-slate-50 p-2">
                      {d.imageUrl && (
                        <Image src={d.imageUrl} alt="" fill className="object-contain p-1.5" />
                      )}
                    </div>
                    <span className="flex items-center gap-1">
                      <span
                        className={cn(
                          "w-5 h-5 rounded-full flex items-center justify-center border font-black text-[10px]",
                          review
                            ? isCorrect
                              ? "bg-emerald-500 text-white border-emerald-500"
                              : chosenWrong
                                ? "bg-rose-500 text-white border-rose-500"
                                : "bg-slate-100 text-slate-500 border-slate-300"
                            : isSelected
                              ? "bg-[#1985F6] text-white border-[#1985F6]"
                              : "bg-slate-100 text-slate-500 border-slate-300",
                        )}
                      >
                        {d.label}
                      </span>
                      {review && <ChoiceBadge detail={d} correctLabel={q.correctLabel} userVal={userVal} />}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}

/** RW2: two-column text conversation (Daisy / Paul) */
function TextConversationLayout({
  part,
  structureName,
  questions,
  answers,
  onChange,
  review,
}: PartRendererProps & { questions: ExamQuestion[] }): ReactElement {
  const partAnswers = answers[part.id] ?? {}
  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-5 h-full overflow-hidden">
      <div className="md:col-span-5 flex flex-col justify-between bg-slate-50 border border-slate-200/80 p-5 rounded-2xl h-full overflow-y-auto">
        <div className="flex flex-col gap-3">
          <div className="p-3.5 bg-white border border-slate-200 rounded-xl shadow-sm">
            <span className="px-2.5 py-1 bg-violet-600 text-white font-extrabold text-[10px] uppercase rounded-md tracking-wider">
              {structureName}
            </span>
            <h3 className="text-slate-700 text-xs font-black mt-2 leading-relaxed">{part.title}</h3>
          </div>
          {part.imageUrl && (
            <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden border-2 border-slate-200 bg-white shadow-sm mt-2">
              <Image src={part.imageUrl} alt="Conversation illustration" fill className="object-contain p-2" />
            </div>
          )}
        </div>
      </div>

      <div className="md:col-span-7 flex flex-col gap-4 h-full overflow-y-auto pr-1">
        {questions.map((q, idx) => {
          const userVal = (partAnswers[q.id] as string | undefined) ?? undefined
          if (q.isExample) {
            return (
              <div key={q.id} className="p-4 bg-slate-100 border border-slate-200 rounded-2xl flex flex-col gap-2.5 mb-1">
                <div className="flex items-center gap-2">
                  <span className="px-1.5 py-0.5 bg-slate-400 text-white rounded font-bold text-[9px]">Ví dụ</span>
                  <h4 className="font-black text-xs text-slate-800">Paul: &quot;{q.title}&quot;</h4>
                </div>
                <div className="flex flex-col gap-1.5 pl-6 border-l-2 border-slate-200">
                  <span className="text-slate-500 text-[10px] font-black uppercase tracking-wider">Daisy:</span>
                  {q.details.map((d) => (
                    <div key={d.id} className="flex items-center gap-2 text-xs">
                      <span className={cn("font-black", d.label === q.correctLabel ? "text-emerald-600" : "text-slate-500")}>
                        {d.label}. {d.text}
                      </span>
                      {d.label === q.correctLabel && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                    </div>
                  ))}
                </div>
              </div>
            )
          }

          return (
            <div key={q.id} className="bg-slate-50 border border-slate-200 p-4 rounded-2xl flex flex-col gap-3 shadow-sm">
              <div className="flex items-center gap-2.5">
                <span className="w-6 h-6 rounded-full bg-[#1985F6] text-white font-extrabold flex items-center justify-center text-xs shrink-0 shadow-sm">
                  {idx}
                </span>
                <h4 className="font-black text-xs text-slate-700">Daisy: &quot;{q.title}&quot;</h4>
              </div>

              <div className="flex flex-col gap-2 pl-8 border-l-2 border-slate-200/50">
                <span className="text-slate-500 text-[10px] font-black uppercase tracking-wider mb-1">Paul:</span>
                {q.details.map((d) => {
                  const isSelected = userVal === d.label
                  const isCorrect = d.label === q.correctLabel
                  const chosenWrong = isSelected && !isCorrect
                  return (
                    <button
                      key={d.id}
                      type="button"
                      disabled={Boolean(review)}
                      onClick={() => onChange(part.id, q.id, d.label)}
                      className={cn(
                        "px-3 py-2.5 rounded-xl border-2 text-left flex items-start gap-2.5 transition-all",
                        review ? "pointer-events-none" : "cursor-pointer hover:border-[#4DA7FF]/50",
                        review
                          ? isCorrect
                            ? "border-emerald-500 bg-emerald-50 font-black text-emerald-700"
                            : chosenWrong
                              ? "border-rose-500 bg-rose-50 font-black text-rose-700"
                              : "border-slate-200 bg-white text-slate-600 font-semibold"
                          : isSelected
                            ? "border-[#1985F6] bg-[#1985F6]/5 font-black text-[#1985F6] shadow-sm scale-[1.01]"
                            : "border-slate-200 bg-white text-slate-600 font-semibold",
                      )}
                    >
                      <span className="font-extrabold text-xs">{d.label}.</span>
                      <span className="text-xs">{d.text}</span>
                      {review && (
                        <ChoiceBadge detail={d} correctLabel={q.correctLabel} userVal={userVal} />
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export function PartMultichoice(props: PartRendererProps): ReactElement {
  const questions = props.part.questions
  return hasImageChoices(questions) ? (
    <ImageChoiceLayout {...props} questions={questions} />
  ) : (
    <TextConversationLayout {...props} questions={questions} />
  )
}