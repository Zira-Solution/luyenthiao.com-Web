"use client"

import { Plus, Trash2 } from "lucide-react"
import { type ReactElement } from "react"

import { Field, TextInput } from "../editor-field"

import { MediaPickerField } from "@/components/admin/media"
import { blankDetail, defaultQuestion, nextLetter } from "@/lib/exam/factories"
import { useExamEditorStore } from "@/store/exam-editor-store"
import type { ExamDetail, ExamQuestion } from "@/types/exam"


interface PartFormMultichoiceProps {
  structIdx: number
  partIdx: number
}

export function PartFormMultichoice({ structIdx, partIdx }: PartFormMultichoiceProps): ReactElement {
  const draft = useExamEditorStore((s) => s.draft)
  const patchPart = useExamEditorStore((s) => s.patchPart)

  const part = draft?.structures[structIdx]?.parts[partIdx]
  if (!part) return <div />

  const hasImage = part.questions.some((q) =>
    q.details.some((d) => (d.imageUrl?.length ?? 0) > 0),
  )

  const addQuestion = () =>
    patchPart(structIdx, partIdx, (p) => ({
      ...p,
      questions: [...p.questions, defaultQuestion("multichoice")],
    }))

  return (
    <div className="flex flex-col gap-3 px-4 pb-4">
      <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-semibold text-white/80">
        Kiểu hiển thị: {hasImage ? "Thẻ ảnh" : "Hội thoại văn bản"}
        <span className="block text-xs font-normal text-white/50 mt-0.5">
          Để có thẻ ảnh: chọn ảnh cho ít nhất một lựa chọn.
        </span>
      </div>

      {part.questions.map((q, qi) => (
        <MultichoiceQuestionCard
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

function MultichoiceQuestionCard({
  q,
  onPatch,
}: {
  q: ExamQuestion
  onPatch: (patch: Partial<ExamQuestion>) => void
}): ReactElement {
  const used = q.details.map((d) => d.label).filter(Boolean) as string[]

  const addChoice = () =>
    onPatch({
      details: [...q.details, blankDetail("multichoice", nextLetter(used))],
    })

  const patchDetail = (di: number, patch: Partial<ExamDetail>) =>
    onPatch({ details: q.details.map((d, i) => (i === di ? { ...d, ...patch } : d)) })

  const removeChoice = (di: number) => {
    const removing = q.details[di]
    const patch: Partial<ExamQuestion> = {
      details: q.details.filter((_, i) => i !== di),
    }
    if (removing && q.correctLabel === removing.label) patch.correctLabel = null
    onPatch(patch)
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-black/10 overflow-hidden">
      <div className="px-3 py-2 bg-white/5 flex items-center justify-between gap-2">
        <label className="flex items-center gap-2 text-white/70 text-xs font-bold cursor-pointer">
          <input
            type="checkbox"
            checked={q.isExample}
            onChange={(e) => onPatch({ isExample: e.target.checked })}
            className="accent-brand-primary"
          />
          Là ví dụ (hiện đáp án, không chấm)
        </label>
      </div>

      <div className="px-3 py-3 flex flex-col gap-3">
        <Field label="Câu hỏi">
          <TextInput
            value={q.title ?? ""}
            onChange={(v) => onPatch({ title: v })}
            placeholder='VD: Daisy: "Where …?"'
          />
        </Field>

        <div className="flex flex-col gap-2">
          <span className="text-white/60 text-[11px] font-black uppercase tracking-wide">
            Lựa chọn
          </span>
          {q.details.map((d, di) => (
            <div key={d.id} className="flex items-start gap-2 rounded-xl border border-white/10 bg-white/5 p-2.5">
              <span className="w-8 h-8 shrink-0 rounded-lg bg-brand-primary text-white grid place-items-center font-black text-sm">
                {d.label}
              </span>
              <div className="flex-1 min-w-0 flex flex-col gap-2">
                <div className="grid grid-cols-2 gap-2">
                  <TextInput
                    value={d.label}
                    onChange={(v) => patchDetail(di, { label: v })}
                    placeholder="A"
                  />
                  <TextInput
                    value={d.text ?? ""}
                    onChange={(v) => patchDetail(di, { text: v })}
                    placeholder="Nội dung"
                  />
                </div>
                <MediaPickerField
                  kind="image"
                  value={d.imageUrl}
                  onChange={(v) => patchDetail(di, { imageUrl: v })}
                />
              </div>
              <label className="inline-flex flex-col items-center gap-1 text-white/60 text-[11px] font-bold cursor-pointer shrink-0">
                <input
                  type="radio"
                  checked={q.correctLabel === d.label}
                  onChange={() => onPatch({ correctLabel: d.label })}
                  className="accent-brand-primary w-4 h-4"
                />
                Đúng
              </label>
              <button
                onClick={() => removeChoice(di)}
                className="p-2 rounded-lg bg-white/5 hover:bg-game-danger-to text-white/60 hover:text-white transition-colors cursor-pointer"
                aria-label="Xóa lựa chọn"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
          <button
            onClick={addChoice}
            className="inline-flex items-center gap-1.5 self-start px-3 py-1.5 rounded-lg border border-dashed border-white/25 hover:border-white/40 text-white/60 hover:text-white text-xs font-bold transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            + Thêm lựa chọn
          </button>
        </div>
      </div>
    </div>
  )
}