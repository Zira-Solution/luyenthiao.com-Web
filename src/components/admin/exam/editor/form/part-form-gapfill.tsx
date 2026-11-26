'use client'

import { AlignLeft, Plus, Trash2 } from 'lucide-react'
import { useRef, type ReactElement } from 'react'

import { Field } from '../editor-field'
import { TagsInput } from '../tags-input'

import { blankDetail, defaultQuestion } from '@/lib/exam-factories'
import { cn } from '@/lib/utils'
import { useExamEditorStore } from '@/store/exam-editor-store'
import type { ExamDetail, ExamQuestion } from '@/types/exam'

export interface PartFormGapfillProps {
  structIdx: number
  partIdx: number
}

export function PartFormGapfill({ structIdx, partIdx }: PartFormGapfillProps): ReactElement {
  const draft = useExamEditorStore((s) => s.draft)
  const patchPart = useExamEditorStore((s) => s.patchPart)

  const part = draft?.structures[structIdx]?.parts[partIdx]
  if (!part) return <div />

  const realCount = part.questions.filter((q) => !q.isExample).length
  const variant = realCount <= 1 ? 'Đoạn văn chỗ trống' : 'Dạng hàng (mỗi ô 1 dòng)'

  const addQuestion = () =>
    patchPart(structIdx, partIdx, (p) => ({
      ...p,
      questions: [...p.questions, defaultQuestion('gapfill')],
    }))

  return (
    <div className="flex flex-col gap-3">
      <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700">
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
        type="button"
        onClick={addQuestion}
        className="inline-flex cursor-pointer items-center gap-1.5 self-start rounded-lg border border-dashed border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:border-slate-400 hover:text-slate-900"
      >
        <Plus className="size-3.5" aria-hidden="true" />+ Thêm câu hỏi
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
  const prompt = q.promptHtml ?? ''
  const referenced = new Set(Array.from(prompt.matchAll(/\{\{(\d+)\}\}/g), (m) => m[1] as string))
  const labelSet = new Set(q.details.map((d) => d.label))
  const missingRefs = Array.from(referenced).filter((n) => !labelSet.has(n))

  const taRef = useRef<HTMLTextAreaElement | null>(null)

  const patchDetail = (di: number, patch: Partial<ExamDetail>) =>
    onPatch({ details: q.details.map((d, i) => (i === di ? { ...d, ...patch } : d)) })

  const removeDetail = (di: number) => onPatch({ details: q.details.filter((_, i) => i !== di) })

  const addBlank = () =>
    onPatch({ details: [...q.details, blankDetail('gapfill', String(q.details.length + 1))] })

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
      onPatch({ details: [...q.details, blankDetail('gapfill', String(n))] })
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
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <div className="flex items-center justify-between gap-2 border-b border-slate-200 bg-slate-50 px-3.5 py-2">
        <label className="flex cursor-pointer items-center gap-2 text-xs font-medium text-slate-700">
          <input
            type="checkbox"
            checked={q.isExample}
            onChange={(e) => onPatch({ isExample: e.target.checked })}
            className="accent-brand-primary"
          />
          Là ví dụ — không chấm điểm
        </label>
        <button
          type="button"
          onClick={() => onPatch({ details: [] })}
          className="inline-flex cursor-pointer items-center gap-1 rounded-lg border border-rose-200 bg-rose-50 px-2.5 py-1 text-xs font-medium text-rose-700 transition-colors hover:bg-rose-100"
        >
          <Trash2 className="size-3" aria-hidden="true" />
          Bỏ ô trống
        </button>
      </div>

      <div className="flex flex-col gap-3 p-3.5">
        <Field label="Đoạn văn / Câu hỏi">
          <div className="flex flex-col gap-1.5">
            <div className="relative">
              <textarea
                ref={taRef}
                value={prompt}
                onChange={(e) => onPatch({ promptHtml: e.target.value })}
                rows={3}
                spellCheck={false}
                className="focus:border-brand-primary focus:ring-brand-primary/20 w-full resize-y rounded-lg border border-slate-300 bg-white px-3 py-2 pr-24 text-sm text-slate-900 placeholder:text-slate-500 focus:ring-2 focus:outline-none"
                placeholder="Nhập đoạn văn, dùng {{1}}, {{2}}…"
              />
              <button
                type="button"
                onClick={insertBlankMarker}
                className="bg-admin-primary hover:bg-admin-primary-hover absolute top-2 right-2 inline-flex cursor-pointer items-center gap-1 rounded-md px-2.5 py-1 text-xs font-semibold text-white transition-colors"
              >
                <AlignLeft className="size-3" aria-hidden="true" />
                Chỗ trống
              </button>
            </div>
            {missingRefs.length > 0 && (
              <span className="text-xs font-medium text-rose-700">
                {missingRefs.map((n) => `{{${n}}}`).join(', ')} chưa có ô tương ứng
              </span>
            )}
          </div>
        </Field>

        <div className="flex flex-col gap-2">
          <span className="text-xs font-medium text-slate-600">Ô trống</span>
          {q.details.length === 0 && (
            <span className="text-xs text-slate-500">Chưa có ô trống nào.</span>
          )}
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
            type="button"
            onClick={addBlank}
            className="inline-flex cursor-pointer items-center gap-1.5 self-start rounded-lg border border-dashed border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:border-slate-400 hover:bg-slate-50 hover:text-slate-900"
          >
            <Plus className="size-3.5" aria-hidden="true" />+ Thêm ô trống
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
  let hint: { text: string; tone: 'danger' | 'warning' } | null = null
  if (!isReferenced) {
    if (hasOptions) {
      hint = {
        text: "Ô này hiển thị thành khối 'Choose the best name' ở cột trái",
        tone: 'warning',
      }
    } else {
      hint = { text: 'Ô này sẽ không bao giờ hiển thị', tone: 'danger' }
    }
  }

  return (
    <div className="flex items-start gap-2.5 rounded-lg border border-slate-200 bg-slate-50/70 p-3">
      <span className="bg-admin-primary grid size-7 shrink-0 place-items-center rounded-md text-xs font-semibold text-white">
        {d.label}
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-2">
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
              'text-xs font-medium',
              hint.tone === 'danger' ? 'text-rose-700' : 'text-amber-800',
            )}
          >
            {hint.text}
          </span>
        )}
        <button
          type="button"
          onClick={onRemove}
          className="inline-flex cursor-pointer items-center gap-1 self-start rounded-lg border border-rose-200 bg-rose-50 px-2.5 py-1 text-xs font-medium text-rose-700 transition-colors hover:bg-rose-100"
        >
          <Trash2 className="size-3" aria-hidden="true" />
          Xóa ô
        </button>
      </div>
    </div>
  )
}
