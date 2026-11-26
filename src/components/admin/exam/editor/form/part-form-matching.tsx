'use client'

import { Plus, Trash2 } from 'lucide-react'
import { type ReactElement } from 'react'

import { Field, TextInput } from '../editor-field'

import { MediaPickerField } from '@/components/admin/media'
import { blankDetail, defaultQuestion } from '@/lib/exam-factories'
import { cn } from '@/lib/utils'
import { useExamEditorStore } from '@/store/exam-editor-store'
import type { ExamDetail, ExamQuestion, WordBoxItem } from '@/types/exam'

export interface PartFormMatchingProps {
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
        { ...defaultQuestion('matching'), details: [blankDetail('matching', '')] },
      ],
    }))

  return (
    <div className="flex flex-col gap-3">
      {hasDuplicate(part.wordBox) && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-medium text-rose-700">
          Hai thẻ cùng chữ gây hiển thị sai — hãy đổi chữ trùng.
        </div>
      )}

      {part.questions.filter((q) => !q.isExample && q.details.length > 1).length > 0 && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-medium text-amber-800">
          Một số câu có nhiều hơn 1 ô — player chỉ dùng ô đầu tiên.
        </div>
      )}

      <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700">
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
        type="button"
        onClick={addItem}
        className="inline-flex cursor-pointer items-center gap-1.5 self-start rounded-lg border border-dashed border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:border-slate-400 hover:text-slate-900"
      >
        <Plus className="size-3.5" aria-hidden="true" />+ Thêm vật phẩm
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

  const answer = detail?.correctAnswers?.[0] ?? ''

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-3.5">
      <div className="flex items-center justify-between gap-2">
        <label className="flex cursor-pointer items-center gap-2 text-xs font-medium text-slate-700">
          <input
            type="checkbox"
            checked={q.isExample}
            onChange={(e) => onPatch({ isExample: e.target.checked })}
            className="accent-brand-primary"
          />
          Là ví dụ
        </label>
        <button
          type="button"
          onClick={onRemove}
          className="cursor-pointer rounded-lg border border-rose-200 bg-rose-50 p-1.5 text-rose-700 transition-colors hover:bg-rose-100"
          aria-label="Xóa vật phẩm"
        >
          <Trash2 className="size-4" aria-hidden="true" />
        </button>
      </div>

      {detail && (
        <div className="grid w-full grid-cols-1 gap-2.5 sm:grid-cols-2">
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
              onChange={(e) =>
                patchDetail({ correctAnswers: e.target.value ? [e.target.value] : [] })
              }
              className="focus:border-brand-primary focus:ring-brand-primary/20 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:ring-2 focus:outline-none"
            >
              <option value="" className="text-slate-900">
                — Chọn thẻ —
              </option>
              {letters.map((l, idx) => (
                <option key={`${l}-${idx}`} value={l} className="text-slate-900">
                  {l}
                </option>
              ))}
            </select>
          </Field>
          <div className="flex items-end">
            {answer && !letters.includes(answer) && (
              <span className={cn('text-xs font-medium text-rose-700')}>
                Đáp án &quot;{answer}&quot; không còn tồn tại trong cột phải.
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
