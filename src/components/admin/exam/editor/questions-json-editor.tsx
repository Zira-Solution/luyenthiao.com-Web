'use client'

import { Code2, RotateCcw } from 'lucide-react'
import { useRef, useState, type ReactElement } from 'react'

import { useExamEditorStore } from '@/store/exam-editor-store'
import type { ExamQuestion } from '@/types/exam'

export interface QuestionsJsonEditorProps {
  structIdx: number
  partIdx: number
}

export function QuestionsJsonEditor({
  structIdx,
  partIdx,
}: QuestionsJsonEditorProps): ReactElement {
  const draft = useExamEditorStore((s) => s.draft)
  const json = useExamEditorStore((s) => s.jsonTexts)
  const jsonMode = useExamEditorStore((s) => s.jsonMode)
  const patchPart = useExamEditorStore((s) => s.patchPart)
  const setJsonText = useExamEditorStore((s) => s.setJsonText)
  const setJsonMode = useExamEditorStore((s) => s.setJsonMode)

  const part = draft?.structures[structIdx]?.parts[partIdx]
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [error, setError] = useState<string | null>(null)

  if (!part) return <div />

  const isJson = !!jsonMode[part.id]
  const buffer = json[part.id] ?? ''

  const enterJsonMode = () => {
    setJsonText(part.id, JSON.stringify(part.questions ?? [], null, 2))
    setError(null)
    setJsonMode(part.id, true)
  }

  const onTextChange = (v: string) => {
    setJsonText(part.id, v)
    setError(null)
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      const latest = useExamEditorStore.getState().jsonTexts[part.id] ?? ''
      const trimmed = latest.trim()
      if (!trimmed) {
        setError('questions rỗng.')
        return
      }
      try {
        const parsed = JSON.parse(trimmed) as unknown
        if (!Array.isArray(parsed)) {
          setError('questions phải là một mảng JSON.')
          return
        }
        // parse-then-commit: chỉ ghi khi JSON hợp lệ
        patchPart(structIdx, partIdx, (p) => ({ ...p, questions: parsed as ExamQuestion[] }))
        setError(null)
      } catch {
        setError('JSON chưa hợp lệ — dữ liệu form giữ nguyên.')
      }
    }, 400)
  }

  const leaveJsonMode = () => {
    if (error) return // không cho thoát khi buffer đang lỗi
    setJsonMode(part.id, false)
  }

  const rejectChanges = () => {
    setJsonText(part.id, JSON.stringify(part.questions ?? [], null, 2))
    setError(null)
    if (timerRef.current) clearTimeout(timerRef.current)
  }

  return (
    <div className="flex flex-col gap-2 rounded-xl border border-slate-200 bg-white p-3">
      <div className="flex items-center justify-between gap-2">
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600">
          <Code2 className="size-3.5" aria-hidden="true" />
          Chế độ nâng cao (JSON)
        </span>
        {!isJson && (
          <button
            type="button"
            onClick={enterJsonMode}
            className="cursor-pointer rounded-lg border border-slate-300 bg-white px-3 py-1 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50"
          >
            Bật JSON
          </button>
        )}
        {isJson && !error && (
          <button
            type="button"
            onClick={leaveJsonMode}
            className="bg-admin-primary hover:bg-admin-primary-hover cursor-pointer rounded-lg px-3 py-1 text-xs font-semibold text-white transition-colors"
          >
            Về Form
          </button>
        )}
      </div>

      {isJson && (
        <>
          <textarea
            value={buffer}
            onChange={(e) => onTextChange(e.target.value)}
            spellCheck={false}
            className="focus:border-brand-primary focus:ring-brand-primary/20 h-56 w-full resize-y rounded-lg border border-slate-300 bg-slate-50 p-3 font-mono text-xs text-slate-900 focus:ring-2 focus:outline-none"
          />
          {error && (
            <div className="flex items-center justify-between gap-2 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2">
              <span className="text-xs font-medium text-rose-700">{error}</span>
              <button
                type="button"
                onClick={rejectChanges}
                className="inline-flex cursor-pointer items-center gap-1 rounded-lg border border-slate-300 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50"
              >
                <RotateCcw className="size-3" aria-hidden="true" />
                Bỏ thay đổi
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
