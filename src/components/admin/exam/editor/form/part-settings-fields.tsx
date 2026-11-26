'use client'

import { Plus, Trash2 } from 'lucide-react'
import { type ReactElement } from 'react'

import { TextAreaInput, TextInput } from '../editor-field'

import { MediaPickerField } from '@/components/admin/media'
import { SafeHtml } from '@/components/common'
import { nextLetter } from '@/lib/exam-factories'
import { useExamEditorStore } from '@/store/exam-editor-store'
import type { WordBoxItem } from '@/types/exam'

export interface PartSettingsFieldsProps {
  structIdx: number
  partIdx: number
}

export function PartSettingsFields({ structIdx, partIdx }: PartSettingsFieldsProps): ReactElement {
  const draft = useExamEditorStore((s) => s.draft)
  const patchPart = useExamEditorStore((s) => s.patchPart)

  const part = draft?.structures[structIdx]?.parts[partIdx]
  if (!part) return <div />

  const set = (patch: Partial<typeof part>) =>
    patchPart(structIdx, partIdx, (p) => ({ ...p, ...patch }))

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-2 rounded-xl border border-slate-200 bg-white p-3.5">
        <p className="text-xs font-medium text-slate-600">Âm thanh phần nghe</p>
        <MediaPickerField
          kind="audio"
          value={part.audioUrl}
          onChange={(v) => set({ audioUrl: v })}
        />
        <p className="text-xs text-slate-500">
          Chỉ phát khi phần thuộc cấu trúc thứ nhất (Listening).
        </p>
      </div>

      {(part.kind === 'gapfill' || part.kind === 'multichoice') && (
        <div className="flex flex-col gap-2 rounded-xl border border-slate-200 bg-white p-3.5">
          <p className="text-xs font-medium text-slate-600">Ảnh minh họa</p>
          <MediaPickerField
            kind="image"
            value={part.imageUrl}
            onChange={(v) => set({ imageUrl: v })}
          />
        </div>
      )}

      {(part.kind === 'matching' || part.kind === 'gapfill') && (
        <div className="flex flex-col gap-2 rounded-xl border border-slate-200 bg-white p-3.5">
          <p className="text-xs font-medium text-slate-600">
            {part.kind === 'matching' ? 'Cột phải — các thẻ chữ' : 'Hộp từ gợi ý'}
          </p>
          <WordBoxEditor
            mode={part.kind === 'matching' ? 'auto' : 'text'}
            items={part.wordBox ?? []}
            onChange={(items) => set({ wordBox: items })}
          />
        </div>
      )}

      {part.kind === 'gapfill' && (
        <div className="flex flex-col gap-2 rounded-xl border border-slate-200 bg-white p-3.5">
          <p className="text-xs font-medium text-slate-600">Khối HTML bổ sung (bảng từ)</p>
          <TextAreaInput
            value={part.extraHtml ?? ''}
            onChange={(v) => set({ extraHtml: v })}
            rows={3}
            placeholder="<table>…</table> (tuỳ chọn)"
          />
          {part.extraHtml && (
            <SafeHtml
              as="div"
              className="max-h-40 overflow-auto rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-900"
              html={part.extraHtml}
            />
          )}
        </div>
      )}
    </div>
  )
}

interface WordBoxEditorProps {
  mode: 'auto' | 'text'
  items: WordBoxItem[]
  onChange: (items: WordBoxItem[]) => void
}

function WordBoxEditor({ mode, items, onChange }: WordBoxEditorProps): ReactElement {
  const usedLetters = items.map((i) => i.label).filter((l) => l && /^[A-Z]$/.test(l))
  const add = () => {
    const letter = nextLetter(usedLetters)
    onChange([...items, { label: mode === 'auto' ? letter : '' }])
  }

  const patch = (idx: number, patch: Partial<WordBoxItem>) =>
    onChange(items.map((it, i) => (i === idx ? { ...it, ...patch } : it)))

  return (
    <div className="flex flex-col gap-2">
      {items.map((item, idx) => (
        <div key={idx} className="flex items-center gap-2">
          {mode === 'auto' ? (
            <span className="bg-admin-primary grid size-8 shrink-0 place-items-center rounded-lg text-xs font-semibold text-white">
              {item.label || '?'}
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
            type="button"
            onClick={() => onChange(items.filter((_, i) => i !== idx))}
            className="cursor-pointer rounded-lg border border-rose-200 bg-rose-50 p-2 text-rose-700 transition-colors hover:bg-rose-100"
            aria-label="Xóa thẻ"
          >
            <Trash2 className="size-4" aria-hidden="true" />
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={add}
        className="inline-flex cursor-pointer items-center gap-1.5 self-start rounded-lg border border-dashed border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:border-slate-400 hover:bg-slate-50 hover:text-slate-900"
      >
        <Plus className="size-3.5" aria-hidden="true" />+ Thêm thẻ
      </button>
    </div>
  )
}
