"use client"

import { Code2, RotateCcw } from "lucide-react"
import { useRef, useState, type ReactElement } from "react"

import { useExamEditorStore } from "@/store/exam-editor-store"
import type { ExamQuestion } from "@/types/exam"

interface QuestionsJsonEditorProps {
  structIdx: number
  partIdx: number
}

export function QuestionsJsonEditor({ structIdx, partIdx }: QuestionsJsonEditorProps): ReactElement {
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
  const buffer = json[part.id] ?? ""

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
      const latest = useExamEditorStore.getState().jsonTexts[part.id] ?? ""
      const trimmed = latest.trim()
      if (!trimmed) {
        setError("questions rỗng.")
        return
      }
      try {
        const parsed = JSON.parse(trimmed) as unknown
        if (!Array.isArray(parsed)) {
          setError("questions phải là một mảng JSON.")
          return
        }
        // parse-then-commit: chỉ ghi khi JSON hợp lệ
        patchPart(structIdx, partIdx, (p) => ({ ...p, questions: parsed as ExamQuestion[] }))
        setError(null)
      } catch {
        setError("JSON chưa hợp lệ — dữ liệu form giữ nguyên.")
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
    <div className="mt-3 rounded-xl border border-white/10 bg-black/10 p-3 flex flex-col gap-2">
      <div className="flex items-center justify-between gap-2">
        <span className="inline-flex items-center gap-1.5 text-white/60 text-xs font-bold">
          <Code2 className="w-3.5 h-3.5" />
          Chế độ nâng cao (JSON)
        </span>
        {!isJson && (
          <button
            onClick={enterJsonMode}
            className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-colors cursor-pointer"
          >
            Bật JSON
          </button>
        )}
        {isJson && !error && (
          <button
            onClick={leaveJsonMode}
            className="px-3 py-1.5 rounded-lg bg-brand-primary hover:opacity-90 text-white text-xs font-bold transition-colors cursor-pointer"
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
            className="w-full h-56 bg-slate-900/70 text-white/90 font-mono text-xs rounded-xl border border-white/10 p-3 focus:border-brand-primary focus:outline-none resize-y"
          />
          {error && (
            <div className="flex items-center justify-between gap-2 rounded-xl border border-game-danger-from/50 bg-game-danger-to/15 px-3 py-2">
              <span className="text-game-danger-from text-xs font-semibold">{error}</span>
              <button
                onClick={rejectChanges}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white text-[11px] font-bold transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                Bỏ thay đổi
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}