"use client"

import { AlignLeft, Plus, Trash2 } from "lucide-react"
import { useRef, type ReactElement } from "react"

import { Field } from "../editor-field"
import { TagsInput } from "../tags-input"

import { blankDetail, defaultQuestion } from "@/lib/exam/factories"
import { cn } from "@/lib/utils"
import { useExamEditorStore } from "@/store/exam-editor-store"
import type { ExamDetail, ExamQuestion } from "@/types/exam"


interface PartFormGapfillProps {
  structIdx: number
  partIdx: number
}

export function PartFormGapfill({ structIdx, partIdx }: PartFormGapfillProps): ReactElement {
  const draft = useExamEditorStore((s) => s.draft)
  const patchPart = useExamEditorStore((s) => s.patchPart)

  const part = draft?.structures[structIdx]?.parts[partIdx]
  if (!part) return <div />

  const realCount = part.questions.filter((q) => !q.isExample).length
  const variant = realCount <= 1 ? "Đoạn văn chỗ trống" : "Dạng hàng (mỗi ô 1 dòng)"

  const addQuestion = () =>
    patchPart(structIdx, partIdx, (p) => ({
      ...p,
      questions: [...p.questions, defaultQuestion("gapfill")],
    }))

  return (
    <div className="flex flex-col gap-3 px-4 pb-4">
      <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-semibold text-white/80">
        Khuôn dạng: {variant}
      </div>

      {part.questions.map((q, qi) => (
        <GapfillQuestionCard
          key={q.id}
          q={q}
          onPatch={(patch) =>
            patchPart(structIdx, partIdx, (p) => ({
              ...p,
              questions: p.questions.map((it, i) => (i === qi ? { ...it, ...patch } : it)),
            }))
          }
        />
      ))}

      <button
        onClick={addQuestion}
        className="inline-flex items-center gap-1.5 self-start px-3 py-1.5 rounded-lg border border-dashed border-white/25 hover:border-white/40 text-white/60 hover:text-white text-xs font-bold transition-colors cursor-pointer"
      >
        <Plus className="w-3.5 h-3.5" />
        + Thêm câu hỏi
      </button>
    </div>
  )
}

function GapfillQuestionCard({
  q,
  onPatch,
}: {
  q: ExamQuestion
  onPatch: (patch: Partial<ExamQuestion>) => void
}): ReactElement {
  const prompt = q.promptHtml ?? ""
  const referenced = new Set(
    Array.from(prompt.matchAll(/\{\{(\d+)\}\}/g), (m) => m[1] as string),
  )
  const labelSet = new Set(q.details.map((d) => d.label))
  const missingRefs = Array.from(referenced).filter((n) => !labelSet.has(n))

  const taRef = useRef<HTMLTextAreaElement | null>(null)

  const patchDetail = (di: number, patch: Partial<ExamDetail>) =>
    onPatch({ details: q.details.map((d, i) => (i === di ? { ...d, ...patch } : d)) })

  const removeDetail = (di: number) => onPatch({ details: q.details.filter((_, i) => i !== di) })

  const addBlank = () =>
    onPatch({ details: [...q.details, blankDetail("gapfill", String(q.details.length + 1))] })

  const insertBlankMarker = () => {
    const n = q.details.length + 1
    const marker = `{{${n}}}`
    const ta = taRef.current
    const val = ta ? ta.value : prompt
    const start = ta?.selectionStart ?? val.length
    const end = ta?.selectionEnd ?? val.length
    const next = val.slice(0, start) + marker + val.slice(end)
    onPatch({ promptHtml: next })
    if (!labelSet.has(String(n))) {
      onPatch({ details: [...q.details, blankDetail("gapfill", String(n))] })
    }
    requestAnimationFrame(() => {
      const t = taRef.current
      if (t) {
        const pos = start + marker.length
        t.focus()
        t.setSelectionRange(pos, pos)
      }
    })
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-black/10 overflow-hidden">
      <div className="flex items-center justify-between gap-2 px-3 py-2 bg-white/5">
        <label className="flex items-center gap-2 text-white/70 text-xs font-bold cursor-pointer">
          <input
            type="checkbox"
            checked={q.isExample}
            onChange={(e) => onPatch({ isExample: e.target.checked })}
            className="accent-brand-primary"
          />
          Là ví dụ — không chấm điểm
        </label>
        <button
          onClick={() => onPatch({ details: [] })}
          className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-white/5 hover:bg-game-danger-to/30 text-white/50 hover:text-white text-[11px] transition-colors cursor-pointer"
        >
          <Trash2 className="w-3 h-3" />
          Bỏ ô trống
        </button>
      </div>

      <div className="px-3 py-3 flex flex-col gap-3">
        <Field label="Đoạn văn / Câu hỏi">
          <div className="flex flex-col gap-1.5">
            <div className="relative">
              <textarea
                ref={taRef}
                value={prompt}
                onChange={(e) => onPatch({ promptHtml: e.target.value })}
                rows={3}
                spellCheck={false}
                className="w-full bg-white/10 text-white text-sm rounded-xl px-3 py-2.5 pr-24 focus:outline-none border border-transparent focus:border-brand-primary placeholder:text-white/30 resize-y"
                placeholder="Nhập đoạn văn, dùng {{1}}, {{2}}…"
              />
              <button
                onClick={insertBlankMarker}
                className="absolute top-2 right-2 inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-brand-primary text-white text-[11px] font-black uppercase cursor-pointer hover:opacity-90"
              >
                <AlignLeft className="w-3 h-3" />
                Chỗ trống
              </button>
            </div>
            {missingRefs.length > 0 && (
              <span className="text-game-danger-from text-[11px] font-semibold">
                {missingRefs.map((n) => `{{${n}}}`).join(", ")} chưa có ô tương ứng
              </span>
            )}
          </div>
        </Field>

        <div className="flex flex-col gap-2">
          <span className="text-white/60 text-[11px] font-black uppercase tracking-wide">Ô trống</span>
          {q.details.length === 0 && <span className="text-white/40 text-xs">Chưa có ô trống nào.</span>}
          {q.details.map((d, di) => (
            <BlankRow
              key={d.id}
              d={d}
              isReferenced={referenced.has(d.label)}
              onPatch={(patch) => patchDetail(di, patch)}
              onRemove={() => removeDetail(di)}
            />
          ))}
          <button
            onClick={addBlank}
            className="inline-flex items-center gap-1.5 self-start px-3 py-1.5 rounded-lg border border-dashed border-white/25 hover:border-white/40 text-white/60 hover:text-white text-xs font-bold transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            + Thêm ô trống
          </button>
        </div>
      </div>
    </div>
  )
}

function BlankRow({
  d,
  isReferenced,
  onPatch,
  onRemove,
}: {
  d: ExamDetail
  isReferenced: boolean
  onPatch: (patch: Partial<ExamDetail>) => void
  onRemove: () => void
}): ReactElement {
  const hasOptions = (d.options?.length ?? 0) > 0
  let hint: { text: string; tone: "danger" | "warning" } | null = null
  if (!isReferenced) {
    if (hasOptions) {
      hint = {
        text: "Ô này hiển thị thành khối 'Choose the best name' ở cột trái",
        tone: "warning",
      }
    } else {
      hint = { text: "Ô này sẽ không bao giờ hiển thị", tone: "danger" }
    }
  }

  return (
    <div className="flex items-start gap-2 rounded-xl border border-white/10 bg-white/5 p-2.5">
      <span className="w-8 h-8 shrink-0 rounded-lg bg-brand-primary text-white grid place-items-center font-black text-sm">
        {d.label}
      </span>
      <div className="flex-1 flex flex-col gap-2 min-w-0">
        <Field label="Các lựa chọn (để trống = tự gõ)">
          <TagsInput
            values={d.options}
            onChange={(v) => onPatch({ options: v })}
            placeholder="a, an, the…"
          />
        </Field>
        <Field label="Đáp án chấp nhận">
          <TagsInput
            values={d.correctAnswers}
            onChange={(v) => onPatch({ correctAnswers: v ?? [] })}
            placeholder="Nhấn Enter để thêm đáp án"
          />
        </Field>
        {hint && (
          <span
            className={cn(
              "text-[11px] font-semibold",
              hint.tone === "danger" ? "text-game-danger-from" : "text-semantic-warning",
            )}
          >
            {hint.text}
          </span>
        )}
        <button
          onClick={onRemove}
          className="self-start inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-white/5 hover:bg-game-danger-to/30 text-white/50 hover:text-white text-[11px] transition-colors cursor-pointer"
        >
          <Trash2 className="w-3 h-3" />
          Xóa ô
        </button>
      </div>
    </div>
  )
}