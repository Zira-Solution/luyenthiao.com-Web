'use client'

import { AlertTriangle, CheckCircle2 } from 'lucide-react'
import type { ReactElement } from 'react'

import { validateExam } from '@/lib/admin-validate'
import type { Exam } from '@/lib/exam'
import { PART_KIND_LABEL } from '@/lib/exam-blank'

export interface ValidationPanelProps {
  exam: Exam
}

export function ValidationPanel({ exam }: ValidationPanelProps): ReactElement {
  const issues = validateExam(exam)
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        {issues.length === 0 ? (
          <CheckCircle2 className="size-4 text-emerald-600" aria-hidden="true" />
        ) : (
          <AlertTriangle className="size-4 text-amber-600" aria-hidden="true" />
        )}
        <span className="text-sm font-semibold text-slate-900">
          Kiểm tra hợp lệ — {issues.length === 0 ? 'tất cả OK' : `${issues.length} vấn đề cần fix`}
        </span>
      </div>

      {issues.length > 0 && (
        <ul className="flex flex-col gap-1.5">
          {issues.map((i) => (
            <li
              key={i.key}
              className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-medium text-amber-800"
            >
              <AlertTriangle className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
              <span>
                {i.kind ? `[${PART_KIND_LABEL[i.kind]}] ` : ''}
                {i.message}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
