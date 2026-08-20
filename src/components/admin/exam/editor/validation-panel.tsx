"use client"

import { AlertTriangle, CheckCircle2 } from "lucide-react"
import type { ReactElement } from "react"

import { validateExam } from "@/lib/admin/validate"
import type { Exam } from "@/lib/exam"
import { PART_KIND_LABEL } from "@/lib/exam/blank"

interface ValidationPanelProps {
  exam: Exam
}

export function ValidationPanel({ exam }: ValidationPanelProps): ReactElement {
  const issues = validateExam(exam)
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        {issues.length === 0 ? (
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
        ) : (
          <AlertTriangle className="w-4 h-4 text-amber-400" />
        )}
        <span className="text-white font-black text-xs uppercase tracking-wide">
          Kiểm tra hợp lệ — {issues.length === 0 ? "tất cả OK" : `${issues.length} vấn đề cần fix`}
        </span>
      </div>

      {issues.length > 0 && (
        <ul className="flex flex-col gap-1.5">
          {issues.map((i) => (
            <li
              key={i.key}
              className="flex items-start gap-2 text-amber-300/90 text-xs font-semibold bg-amber-400/5 border border-amber-400/20 rounded-lg px-3 py-2"
            >
              <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
              <span>
                {i.kind ? `[${PART_KIND_LABEL[i.kind]}] ` : ""}
                {i.message}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}