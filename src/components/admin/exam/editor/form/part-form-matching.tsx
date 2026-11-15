"use client"

import { Plus, Trash2 } from "lucide-react"
import { type ReactElement } from "react"

import { Field, TextInput } from "../editor-field"

import { MediaPickerField } from "@/components/admin/media"
import { blankDetail, defaultQuestion } from "@/lib/exam-factories"
import { cn } from "@/lib/utils"
import { useExamEditorStore } from "@/store/exam-editor-store"
import type { ExamDetail, ExamQuestion, WordBoxItem } from "@/types/exam"


interface PartFormMatchingProps {
  structIdx: number
  partIdx: number
}

export function PartFormMatching({ structIdx, partIdx }: PartFormMatchingProps): ReactElement {
  const draft = useExamEditorStore((s) => s.draft)
  const patchPart = useExamEditorStore((s) => s.patchPart)

  const part = draft?.structures[structIdx]?.parts[partIdx]
  if (!part) return <div />

  const letters = (part.wordBox ?? []).map((w) => w.label).filter(Boolean) as string[]

  const addItem = () =>
    patchPart(structIdx, partIdx, (p) => ({
      ...p,
      questions: [
        ...p.questions,
        { ...defaultQuestion("matching"), details: [blankDetail("matching", "")] },
      ],
    }))

  return (
    <div className="flex flex-col gap-3 px-4 pb-4">
      {hasDuplicate(part.wordBox) && (
        <div className="rounded-xl border border-game-danger-from/50 bg-game-danger-to/15 px-3 py-2 text-game-danger-from text-xs font-semibold">
          Hai thẻ cùng chữ gây hiển thị sai — hãy đổi chữ trùng.
        </div>
      )}

      {part.questions.filter((q) => !q.isExample && q.details.length > 1).length > 0 && (
        <div className="rounded-xl border border-semantic-warning/40 bg-semantic-warning/10 px-3 py-2 text-semantic-warning text-xs font-semibold">
          Một số câu có nhiều hơn 1 ô — player chỉ dùng ô đầu tiên.
        </div>
      )}

      <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-semibold text-white/80">
        Cột phải: {letters.length} thẻ chữ. Cột trái: các vật phẩm bên dưới.
      </div>

      {part.questions.map((q, qi) => (
        <MatchingItemRow
          key={q.id}
          q={q}
          letters={letters}
          onPatch={(patch) =>
            patchPart(structIdx, partIdx, (p) => ({
              ...p,
              questions: p.questions.map((it, i) => (i === qi ? { ...it, ...patch } : it)),
            }))
          }
          onRemove={() =>
            patchPart(structIdx, partIdx, (p) => ({
              ...p,
              questions: p.questions.filter((_, i) => i !== qi),
            }))
          }
        />
      ))}

      <button
        onClick={addItem}
        className="inline-flex items-center gap-1.5 self-start px-3 py-1.5 rounded-lg border border-dashed border-white/25 hover:border-white/40 text-white/60 hover:text-white text-xs font-bold transition-colors cursor-pointer"
      >
        <Plus className="w-3.5 h-3.5" />
        + Thêm vật phẩm
      </button>
    </div>
  )
}

function hasDuplicate(wordBox: WordBoxItem[] | undefined): boolean {
  const labels = (wordBox ?? []).map((w) => w.label).filter((l): l is string => !!l)
  return new Set(labels).size !== labels.length
}

function MatchingItemRow({
  q,
  letters,
  onPatch,
  onRemove,
}: {
  q: ExamQuestion
  letters: string[]
  onPatch: (patch: Partial<ExamQuestion>) => void
  onRemove: () => void
}): ReactElement {
  const detail = q.details[0]
  const patchDetail = (patch: Partial<ExamDetail>) =>
    onPatch({
      details: q.details.map((d, i) => (i === 0 ? { ...d, ...patch } : d)),
    })

  const answer = detail?.correctAnswers?.[0] ?? ""

  return (
    <div className="rounded-2xl border border-white/10 bg-black/10 p-3 flex flex-col gap-2">
      <div className="flex items-center justify-between gap-2">
        <label className="flex items-center gap-2 text-white/70 text-xs font-bold cursor-pointer">
          <input
            type="checkbox"
            checked={q.isExample}
            onChange={(e) => onPatch({ isExample: e.target.checked })}
            className="accent-brand-primary"
          />
          Là ví dụ
        </label>
        <button
          onClick={onRemove}
          className="p-2 rounded-lg bg-white/5 hover:bg-game-danger-to text-white/60 hover:text-white transition-colors cursor-pointer"
          aria-label="Xóa vật phẩm"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {detail && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full">
          <Field label="Tên vật phẩm">
            <TextInput
              value={detail.label}
              onChange={(v) => patchDetail({ label: v })}
              placeholder="VD: Con cá"
            />
          </Field>
          <Field label="Ảnh vật phẩm">
            <MediaPickerField
              kind="image"
              value={detail.imageUrl}
              onChange={(v) => patchDetail({ imageUrl: v })}
            />
          </Field>
          <Field label="Đáp án đúng">
            <select
              value={answer}
              onChange={(e) => patchDetail({ correctAnswers: e.target.value ? [e.target.value] : [] })}
              className="bg-white/10 text-white font-semibold text-sm rounded-xl px-3 py-2.5 focus:outline-none border border-transparent focus:border-brand-primary"
            >
              <option value="" className="text-slate-900">
                — Chọn thẻ —
              </option>
              {letters.map((l) => (
                <option key={l} value={l} className="text-slate-900">
                  {l}
                </option>
              ))}
            </select>
          </Field>
          <div className="flex items-end">
            {answer && !letters.includes(answer) && (
              <span className={cn("text-game-danger-from text-xs font-semibold")}>
                Đáp án &quot;{answer}&quot; không còn tồn tại trong cột phải.
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  )
}