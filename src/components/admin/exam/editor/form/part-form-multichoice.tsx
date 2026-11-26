'use client'

import { Plus, Trash2 } from 'lucide-react'
import { type ReactElement } from 'react'

import { Field, TextInput } from '../editor-field'

import { MediaPickerField } from '@/components/admin/media'
import { blankDetail, defaultQuestion, nextLetter } from '@/lib/exam-factories'
import { useExamEditorStore } from '@/store/exam-editor-store'
import type { ExamDetail, ExamQuestion } from '@/types/exam'

export interface PartFormMultichoiceProps {
  structIdx: number
  partIdx: number
}

export function PartFormMultichoice({
  structIdx,
  partIdx,
}: PartFormMultichoiceProps): ReactElement {
  const draft = useExamEditorStore((s) => s.draft)
  const patchPart = useExamEditorStore((s) => s.patchPart)

  const part = draft?.structures[structIdx]?.parts[partIdx]
  if (!part) return <div />

  const hasImage = part.questions.some((q) => q.details.some((d) => (d.imageUrl?.length ?? 0) > 0))

  const addQuestion = () =>
    patchPart(structIdx, partIdx, (p) => ({
      ...p,
      questions: [...p.questions, defaultQuestion('multichoice')],
    }))

  return (
    <div className="flex flex-col gap-3">
      <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700">
        Kiểu hiển thị: {hasImage ? 'Thẻ ảnh' : 'Hội thoại văn bản'}
        <span className="mt-0.5 block font-normal text-slate-500">
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
        type="button"
        onClick={addQuestion}
        className="inline-flex cursor-pointer items-center gap-1.5 self-start rounded-lg border border-dashed border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:border-slate-400 hover:text-slate-900"
      >
        <Plus className="size-3.5" aria-hidden="true" />+ Thêm câu hỏi
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
      details: [...q.details, blankDetail('multichoice', nextLetter(used))],
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
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <div className="flex items-center justify-between gap-2 border-b border-slate-200 bg-slate-50 px-3.5 py-2">
        <label className="flex cursor-pointer items-center gap-2 text-xs font-medium text-slate-700">
          <input
            type="checkbox"
            checked={q.isExample}
            onChange={(e) => onPatch({ isExample: e.target.checked })}
            className="accent-brand-primary"
          />
          Là ví dụ (hiện đáp án, không chấm)
        </label>
      </div>

      <div className="flex flex-col gap-3 p-3.5">
        <Field label="Câu hỏi">
          <TextInput
            value={q.title ?? ''}
            onChange={(v) => onPatch({ title: v })}
            placeholder='VD: Daisy: "Where …?"'
          />
        </Field>

        <div className="flex flex-col gap-2">
          <span className="text-xs font-medium text-slate-600">Lựa chọn</span>
          {q.details.map((d, di) => (
            <div
              key={d.id}
              className="flex items-start gap-2.5 rounded-lg border border-slate-200 bg-slate-50/70 p-2.5"
            >
              <span className="bg-admin-primary grid size-8 shrink-0 place-items-center rounded-lg text-sm font-semibold text-white">
                {d.label}
              </span>
              <div className="flex min-w-0 flex-1 flex-col gap-2">
                <div className="grid grid-cols-2 gap-2">
                  <TextInput
                    value={d.label}
                    onChange={(v) => patchDetail(di, { label: v })}
                    placeholder="A"
                  />
                  <TextInput
                    value={d.text ?? ''}
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
              <label className="inline-flex shrink-0 cursor-pointer flex-col items-center gap-1 text-xs font-medium text-slate-600">
                <input
                  type="radio"
                  checked={q.correctLabel === d.label}
                  onChange={() => onPatch({ correctLabel: d.label })}
                  className="accent-brand-primary size-4"
                />
                Đúng
              </label>
              <button
                type="button"
                onClick={() => removeChoice(di)}
                className="cursor-pointer rounded-lg border border-rose-200 bg-rose-50 p-2 text-rose-700 transition-colors hover:bg-rose-100"
                aria-label="Xóa lựa chọn"
              >
                <Trash2 className="size-4" aria-hidden="true" />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={addChoice}
            className="inline-flex cursor-pointer items-center gap-1.5 self-start rounded-lg border border-dashed border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:border-slate-400 hover:bg-slate-50 hover:text-slate-900"
          >
            <Plus className="size-3.5" aria-hidden="true" />+ Thêm lựa chọn
          </button>
        </div>
      </div>
    </div>
  )
}
