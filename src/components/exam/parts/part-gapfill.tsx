"use client"

import Image from "next/image"
import type { ReactElement } from "react"

import type { PartRendererProps } from "./types"

import { AnswerFeedback } from "@/components/exam/answer-feedback"
import type { DetailGrade } from "@/lib/exam"
import { cn } from "@/lib/utils"
import type { ExamDetail, ExamPart } from "@/types/exam"


function gapfillVariant(part: ExamPart): "form-rows" | "inline-passage" {
  const realQuestions = part.questions.filter((q) => !q.isExample).length
  return realQuestions <= 1 ? "inline-passage" : "form-rows"
}

function referencedLabels(promptHtml: string): Set<string> {
  const set = new Set<string>()
  const re = /{{(\d+)}}/g
  let m: RegExpExecArray | null
  while ((m = re.exec(promptHtml)) !== null) {
    if (m[1]) set.add(m[1])
  }
  return set
}

function splitPrompt(promptHtml: string): { text: string; label?: string }[] {
  const stripped = promptHtml.replace(/<\/?p>/g, "")
  const re = /({{(\d+)}})/g
  const out: { text: string; label?: string }[] = []
  let lastIndex = 0
  let m: RegExpExecArray | null
  while ((m = re.exec(stripped)) !== null) {
    if (m.index > lastIndex) out.push({ text: stripped.slice(lastIndex, m.index) })
    out.push({ label: m[2], text: m[0] })
    lastIndex = m.index + m[0].length
  }
  if (lastIndex < stripped.length) out.push({ text: stripped.slice(lastIndex) })
  return out
}

function InlineBlank({
  detail,
  value,
  onChange,
  review,
  grade,
}: {
  detail: ExamDetail
  value: string
  onChange: (v: string | null) => void
  review: boolean
  grade?: DetailGrade
}): ReactElement {
  const baseSelect =
    "inline-block mx-1.5 px-2.5 py-1 border-2 rounded-lg focus:outline-none font-black text-xs align-middle max-w-[130px] shadow-sm"
  const baseInput =
    "inline-block mx-1.5 px-3 py-0.5 border-b-2 focus:outline-none font-black text-xs text-center w-36 rounded align-middle"

  const selectClass = review
    ? cn(baseSelect, "bg-slate-50 text-slate-800 pointer-events-none",
        grade?.status === "correct"
          ? "border-emerald-500"
          : grade?.status === "wrong"
            ? "border-rose-500 bg-rose-50"
            : "border-slate-200")
    : cn(baseSelect, "border-slate-200 bg-slate-50 text-slate-800 cursor-pointer focus:border-[#1985F6]")

  const inputClass = review
    ? cn(baseInput, "bg-slate-50 pointer-events-none",
        grade?.status === "correct"
          ? "border-emerald-500"
          : grade?.status === "wrong"
            ? "border-rose-500 bg-rose-50"
            : "border-slate-300")
    : cn(baseInput, "border-slate-300 bg-slate-50 focus:border-[#1985F6]")

  if (detail.options && detail.options.length > 0) {
    return (
      <>
        <select value={value} disabled={review} onChange={(e) => onChange(e.target.value || null)} className={selectClass}>
          <option value="">Chọn...</option>
          {detail.options.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
        {review && grade && <AnswerFeedback grade={grade} />}
      </>
    )
  }

  return (
    <>
      <input
        type="text"
        value={value}
        readOnly={review}
        onChange={(e) => onChange(e.target.value || null)}
        placeholder="..."
        className={inputClass}
      />
      {review && grade && <AnswerFeedback grade={grade} />}
    </>
  )
}

/** Listening form-rows (L2): left intro/image, right numbered rows + text input */
function FormRowsLayout({
  part,
  structureName,
  answers,
  onChange,
  review,
}: PartRendererProps): ReactElement {
  const partAnswers = answers[part.id] ?? {}
  const questions = part.questions

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-5 h-full overflow-hidden">
      <div className="md:col-span-5 flex flex-col justify-between bg-slate-50 border border-slate-200/80 p-5 rounded-2xl h-full overflow-y-auto">
        <div>
          <span className="px-2.5 py-1 bg-violet-600 text-white font-extrabold text-[10px] uppercase rounded-md tracking-wider">
            {structureName}
          </span>
          <h3 className="text-slate-800 text-base font-black mt-3 leading-snug">{part.title}</h3>

          {part.imageUrl && (
            <div className="relative w-full h-[160px] rounded-xl overflow-hidden border border-slate-200/80 bg-white my-4 shrink-0 shadow-sm">
              <Image src={part.imageUrl} alt="Banner" fill className="object-contain" />
            </div>
          )}

          <p className="text-slate-500 text-xs mt-2 font-medium">
            Điền từ khóa chính xác nghe được trong tệp âm thanh bên dưới.
          </p>
        </div>
      </div>

      <div className="md:col-span-7 bg-slate-100/50 border border-slate-200/60 p-5 rounded-2xl h-full overflow-y-auto flex flex-col gap-4">
        <div className="flex flex-col gap-3">
          {questions.map((q) => {
            if (q.isExample) {
              return (
                <div key={q.id} className="p-3 bg-slate-100 border border-slate-200 rounded-xl text-xs font-semibold text-slate-500">
                  <strong>Ví dụ:</strong>{" "}
                  <span dangerouslySetInnerHTML={{ __html: q.promptHtml ?? "" }} />
                </div>
              )
            }
            return (
              <div key={q.id} className="flex flex-col gap-2">
                {q.details.map((d) => {
                  const userVal = (partAnswers[d.id] as string | undefined) ?? ""
                  const textPrompt = q.promptHtml ?? ""
                  const grade = review ? review.getGrade(d.id) : undefined
                  return (
                    <div
                      key={d.id}
                      className={cn(
                        "flex items-center gap-3 p-3 rounded-xl shadow-sm",
                        review
                          ? grade?.status === "correct"
                            ? "bg-emerald-50 border-2 border-emerald-500"
                            : grade?.status === "wrong"
                              ? "bg-rose-50 border-2 border-rose-500"
                              : "bg-white border border-slate-200"
                          : "bg-white border border-slate-200",
                      )}
                    >
                      <span className="w-7 h-7 rounded-full bg-[#1985F6] text-white font-extrabold flex items-center justify-center text-xs shrink-0">
                        {d.label}
                      </span>
                      <div className="flex-1 flex items-center justify-between gap-4">
                        <div
                          dangerouslySetInnerHTML={{
                            __html: textPrompt.replace(`{{${d.label}}}`, "______"),
                          }}
                          className="text-xs font-bold text-slate-700"
                        />
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            readOnly={Boolean(review)}
                            value={userVal}
                            onChange={(e) => onChange(part.id, d.id, e.target.value || null)}
                            placeholder="..."
                            className={cn(
                              "w-32 px-3 py-1.5 border-2 rounded-lg focus:outline-none text-xs font-black text-center bg-slate-50",
                              review
                                ? grade?.status === "correct"
                                  ? "border-emerald-500"
                                  : grade?.status === "wrong"
                                    ? "border-rose-500 bg-rose-50"
                                    : "border-slate-200"
                                : "border-slate-200 focus:border-[#1985F6]",
                            )}
                          />
                          {review && grade && <AnswerFeedback grade={grade} />}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

/** Reading-Writing inline passage: left visuals, right passage + inline blanks */
function InlinePassageLayout({
  part,
  structureName,
  answers,
  onChange,
  review,
}: PartRendererProps): ReactElement {
  const partAnswers = answers[part.id] ?? {}
  const mainQuestion = part.questions.find((q) => !q.isExample)
  const exampleQuestions = part.questions.filter((q) => q.isExample)
  const placeholderLabels = mainQuestion ? referencedLabels(mainQuestion.promptHtml ?? "") : new Set<string>()
  const unreferencedChoices = (mainQuestion?.details ?? []).filter(
    (d) => d.options && d.options.length > 0 && !placeholderLabels.has(d.label),
  )

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-5 h-full overflow-hidden">
      <div className="md:col-span-5 flex flex-col gap-4 bg-slate-50 border border-slate-200/80 p-5 rounded-2xl h-full overflow-y-auto">
        <div className="p-3.5 bg-white border border-slate-200 rounded-xl shadow-sm">
          <span className="px-2.5 py-1 bg-violet-600 text-white font-extrabold text-[10px] uppercase rounded-md tracking-wider">
            {structureName}
          </span>
          <h3 className="text-slate-700 text-xs font-black mt-2 leading-relaxed">{part.title}</h3>
        </div>

        {part.imageUrl && (
          <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden border-2 border-slate-200 bg-white shadow-sm">
            <Image src={part.imageUrl} alt="Story illustration" fill className="object-contain p-2" />
          </div>
        )}

        {part.wordBox && part.wordBox.length > 0 && (
          <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm">
            <h4 className="font-extrabold text-[10px] text-slate-500 uppercase tracking-wide border-b pb-2 mb-3">
              Hộp từ gợi ý
            </h4>
            <div className="grid grid-cols-2 gap-2.5">
              {part.wordBox.map((img) => (
                <div key={img.label} className="bg-slate-50 p-2 rounded-xl border border-slate-200 flex flex-col items-center gap-1.5 shadow-sm">
                  <div className="relative w-full aspect-[4/3] rounded-lg overflow-hidden border border-slate-100 bg-white p-1">
                    {img.imageId && <Image src={img.imageId} alt="" fill className="object-contain" />}
                  </div>
                  <span className="text-[10px] font-black text-slate-700 text-center leading-tight">
                    {img.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {part.extraHtml && (
          <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm">
            <h4 className="font-extrabold text-[10px] text-slate-500 uppercase tracking-wide border-b pb-2 mb-3">
              Các từ chọn
            </h4>
            <div className="text-xs" dangerouslySetInnerHTML={{ __html: part.extraHtml }} />
          </div>
        )}

        {unreferencedChoices.map((d) => (
          <TitleChoiceBlock
            key={d.id}
            detail={d}
            value={partAnswers[d.id] as string | undefined}
            onChange={(v) => onChange(part.id, d.id, v)}
            review={Boolean(review)}
          />
        ))}
      </div>

      <div className="md:col-span-7 flex flex-col gap-3 overflow-y-auto pr-1">
        {exampleQuestions.map((q) => (
          <div key={q.id} className="p-3.5 bg-slate-100 border border-slate-200 rounded-xl text-xs text-slate-600 font-semibold">
            <span className="px-1.5 py-0.5 bg-slate-400 text-white rounded font-bold text-[9px] mr-2">Ví dụ</span>
            <span dangerouslySetInnerHTML={{ __html: q.promptHtml ?? "" }} />
          </div>
        ))}

        {mainQuestion && (
          <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-sm text-xs font-semibold text-slate-700 leading-loose">
            {splitPrompt(mainQuestion.promptHtml ?? "").map((seg, i) => {
              if (seg.label) {
                const detail = mainQuestion.details.find((d) => d.label === seg.label)
                if (!detail) return <span key={`${seg.label}-${i}`}>{seg.text}</span>
                const userVal = (partAnswers[detail.id] as string | undefined) ?? ""
                const grade = review ? review.getGrade(detail.id) : undefined
                return (
                  <InlineBlank
                    key={detail.id}
                    detail={detail}
                    value={userVal}
                    onChange={(v) => onChange(part.id, detail.id, v)}
                    review={Boolean(review)}
                    grade={grade}
                  />
                )
              }
              return <span key={i} dangerouslySetInnerHTML={{ __html: seg.text }} />
            })}
          </div>
        )}
      </div>
    </div>
  )
}

function TitleChoiceBlock({
  detail,
  value,
  onChange,
  review,
}: {
  detail: ExamDetail
  value: string | undefined
  onChange: (v: string | null) => void
  review: boolean
}): ReactElement {
  const options = detail.options ?? []
  return (
    <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm flex flex-col gap-3">
      <h4 className="font-black text-xs text-slate-700">
        ({detail.label}) Choose the best name:
      </h4>
      <div className="flex flex-col gap-2">
        {options.map((o) => {
          const isSelected = value === o
          const isCorrect = detail.correctAnswers.includes(o)
          const chosenWrong = isSelected && !isCorrect
          return (
            <button
              key={o}
              type="button"
              disabled={review}
              onClick={() => onChange(o)}
              className={cn(
                "px-3 py-2 rounded-xl border-2 text-left flex items-start gap-2.5 transition-all",
                review ? "pointer-events-none" : "cursor-pointer hover:border-[#4DA7FF]/50",
                review
                  ? isCorrect
                    ? "border-emerald-500 bg-emerald-50 font-black text-emerald-700"
                    : chosenWrong
                      ? "border-rose-500 bg-rose-50 font-black text-rose-700"
                      : "border-slate-200 bg-white text-slate-600 font-semibold"
                  : isSelected
                    ? "border-[#1985F6] bg-[#1985F6]/5 font-black text-[#1985F6] scale-[1.01] shadow-sm"
                    : "border-slate-200 bg-white text-slate-600 font-semibold",
              )}
            >
              <span className="text-xs">{o}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

export function PartGapfill(props: PartRendererProps): ReactElement {
  return gapfillVariant(props.part) === "form-rows" ? (
    <FormRowsLayout {...props} />
  ) : (
    <InlinePassageLayout {...props} />
  )
}