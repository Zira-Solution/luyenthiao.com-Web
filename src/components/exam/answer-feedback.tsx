import { Check, X } from "lucide-react"
import type { ReactElement } from "react"

import { getColorName, isColorCode } from "@/lib/exam"
import { cn } from "@/lib/utils"

interface AnswerFeedbackProps {
  grade?: { status: "correct" | "wrong" | "empty"; correctAnswers: string[] }
  format?: "text" | "color"
  className?: string
}

function colorDot(hex: string): ReactElement {
  return (
    <span
      className="inline-block w-3 h-3 rounded-full border border-black/10 shadow-sm shrink-0"
      style={{ backgroundColor: hex }}
    />
  )
}

function answerChip(answer: string, format: "text" | "color"): ReactElement {
  const isColor = format === "color" && isColorCode(answer)
  return (
    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-black">
      {isColor && colorDot(answer)}
      <span>{isColor ? getColorName(answer) : answer}</span>
    </span>
  )
}

export function AnswerFeedback({
  grade,
  format = "text",
  className,
}: AnswerFeedbackProps): ReactElement {
  const answers = grade?.correctAnswers ?? []

  if (!grade || grade.status === "correct") {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1",
          className,
        )}
      >
        <Check className="w-4 h-4 text-emerald-600" />
      </span>
    )
  }

  return (
    <span className={cn("inline-flex items-center gap-1", className)}>
      <X
        className={cn(
          "w-4 h-4",
          grade.status === "wrong" ? "text-rose-600" : "text-slate-400",
        )}
      />
      {answers.length > 0 && (
        <span className="inline-flex flex-wrap items-center gap-1">
          <span className="text-[10px] font-black text-slate-500 uppercase">
            Đáp án:
          </span>
          {answers.slice(0, 2).map((a) => (
            <span key={a}>{answerChip(a, format)}</span>
          ))}
        </span>
      )}
    </span>
  )
}