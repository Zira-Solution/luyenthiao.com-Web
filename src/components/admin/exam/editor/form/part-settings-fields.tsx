"use client"

import { Plus, Trash2 } from "lucide-react"
import { type ReactElement } from "react"

import { TextAreaInput, TextInput } from "../editor-field"

import { MediaPickerField } from "@/components/admin/media"
import { nextLetter } from "@/lib/exam-factories"
import { useExamEditorStore } from "@/store/exam-editor-store"
import type { WordBoxItem } from "@/types/exam"


interface PartSettingsFieldsProps {
  structIdx: number
  partIdx: number
}

export function PartSettingsFields({ structIdx, partIdx }: PartSettingsFieldsProps): ReactElement {
  const draft = useExamEditorStore((s) => s.draft)
  const patchPart = useExamEditorStore((s) => s.patchPart)

  const part = draft?.structures[structIdx]?.parts[partIdx]
  if (!part) return <div />

  const set = (patch: Partial<typeof part>) => patchPart(structIdx, partIdx, (p) => ({ ...p, ...patch }))

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-2xl border border-white/10 bg-white/5 p-3 flex flex-col gap-2">
        <p className="text-white/60 text-[11px] font-black uppercase tracking-wide">
          Âm thanh phần nghe
        </p>
        <MediaPickerField kind="audio" value={part.audioUrl} onChange={(v) => set({ audioUrl: v })} />
        <p className="text-white/40 text-[11px]">
          Chỉ phát khi phần thuộc cấu trúc thứ nhất (Listening).
        </p>
      </div>

      {(part.kind === "gapfill" || part.kind === "multichoice") && (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-3 flex flex-col gap-2">
          <p className="text-white/60 text-[11px] font-black uppercase tracking-wide">
            Ảnh minh họa
          </p>
          <MediaPickerField
            kind="image"
            value={part.imageUrl}
            onChange={(v) => set({ imageUrl: v })}
          />
        </div>
      )}

      {(part.kind === "matching" || part.kind === "gapfill") && (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-3 flex flex-col gap-2">
          <p className="text-white/60 text-[11px] font-black uppercase tracking-wide">
            {part.kind === "matching" ? "Cột phải — các thẻ chữ" : "Hộp từ gợi ý"}
          </p>
          <WordBoxEditor
            mode={part.kind === "matching" ? "auto" : "text"}
            items={part.wordBox ?? []}
            onChange={(items) => set({ wordBox: items })}
          />
        </div>
      )}

      {part.kind === "gapfill" && (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-3 flex flex-col gap-2">
          <p className="text-white/60 text-[11px] font-black uppercase tracking-wide">
            Khối HTML bổ sung (bảng từ)
          </p>
          <TextAreaInput
            value={part.extraHtml ?? ""}
            onChange={(v) => set({ extraHtml: v })}
            rows={3}
            placeholder="<table>…</table> (tuỳ chọn)"
          />
          {part.extraHtml && (
            <div
              className="rounded-xl bg-white/90 text-slate-900 p-3 overflow-auto max-h-40 text-sm"
              dangerouslySetInnerHTML={{ __html: part.extraHtml }}
            />
          )}
        </div>
      )}
    </div>
  )
}

interface WordBoxEditorProps {
  mode: "auto" | "text"
  items: WordBoxItem[]
  onChange: (items: WordBoxItem[]) => void
}

function WordBoxEditor({ mode, items, onChange }: WordBoxEditorProps): ReactElement {
  const usedLetters = items.map((i) => i.label).filter((l) => l && /^[A-Z]$/.test(l))
  const add = () => {
    const letter = nextLetter(usedLetters)
    onChange([...items, { label: mode === "auto" ? letter : "" }])
  }

  const patch = (idx: number, patch: Partial<WordBoxItem>) =>
    onChange(items.map((it, i) => (i === idx ? { ...it, ...patch } : it)))

  return (
    <div className="flex flex-col gap-2">
      {items.map((item, idx) => (
        <div key={idx} className="flex items-center gap-2">
          {mode === "auto" ? (
            <span className="w-8 h-8 shrink-0 rounded-lg bg-brand-primary text-white grid place-items-center font-black">
              {item.label || "?"}
            </span>
          ) : (
            <TextInput
              value={item.label}
              onChange={(v) => patch(idx, { label: v })}
              placeholder="Chữ gợi ý"
            />
          )}
          <div className="flex-1">
            <MediaPickerField
              kind="image"
              value={item.imageId}
              onChange={(v) => patch(idx, { imageId: v })}
            />
          </div>
          <button
            onClick={() => onChange(items.filter((_, i) => i !== idx))}
            className="p-2 rounded-lg bg-white/5 hover:bg-game-danger-to text-white/60 hover:text-white transition-colors cursor-pointer"
            aria-label="Xóa thẻ"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ))}
      <button
        onClick={add}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-dashed border-white/25 hover:border-white/40 text-white/60 hover:text-white text-xs font-bold transition-colors cursor-pointer self-start"
      >
        <Plus className="w-3.5 h-3.5" />
        + Thêm thẻ
      </button>
    </div>
  )
}