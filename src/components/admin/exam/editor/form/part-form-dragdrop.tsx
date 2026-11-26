'use client'

import { Plus, Trash2 } from 'lucide-react'
import { useState, type ReactElement } from 'react'

import { BoxPicker } from '../box-picker'
import { Field } from '../editor-field'

import { MediaPickerField } from '@/components/admin/media'
import { getColorName, isColorCode } from '@/lib/exam'
import { blankDetail, defaultQuestion } from '@/lib/exam-factories'
import { cn } from '@/lib/utils'
import { useExamEditorStore } from '@/store/exam-editor-store'
import type { ExamQuestion, WordBoxItem } from '@/types/exam'

export interface PartFormDragdropProps {
  structIdx: number
  partIdx: number
}

export function PartFormDragdrop({ structIdx, partIdx }: PartFormDragdropProps): ReactElement {
  const draft = useExamEditorStore((s) => s.draft)
  const patchPart = useExamEditorStore((s) => s.patchPart)
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const part = draft?.structures[structIdx]?.parts[partIdx]
  if (!part) return <div />

  const main = part.questions.find((q) => !q.isExample) ?? part.questions[0] ?? null
  const activeCount = part.questions.filter((q) => !q.isExample).length

  const patchMain = (patch: Partial<ExamQuestion>) => {
    if (!main) return
    patchPart(structIdx, partIdx, (p) => ({
      ...p,
      questions: p.questions.map((q) => (q.id === main.id ? { ...q, ...patch } : q)),
    }))
  }

  const ensureQuestion = () => {
    const q = { ...defaultQuestion('dragdrop'), details: [blankDetail('dragdrop', '1')] }
    patchPart(structIdx, partIdx, (p) => ({ ...p, questions: [...p.questions, q] }))
    setSelectedId(q.details[0]?.id ?? null)
  }

  const patchDetail = (di: number, patch: Partial<ExamQuestion['details'][number]>) => {
    if (!main) return
    patchMain({
      details: main.details.map((d, i) => (i === di ? { ...d, ...patch } : d)),
    })
  }

  const addBox = () => {
    if (!main) return
    patchMain({
      details: [...main.details, blankDetail('dragdrop', String(main.details.length + 1))],
    })
  }

  const choices = main?.choices ?? []
  const choiceLabels = choices.map((c) => c.label).filter(Boolean) as string[]

  return (
    <div className="flex flex-col gap-3">
      {activeCount > 1 && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-medium text-amber-800">
          Player chỉ dùng câu đầu tiên, các câu khác bị bỏ qua.
        </div>
      )}

      {!main ? (
        <button
          type="button"
          onClick={ensureQuestion}
          className="inline-flex cursor-pointer items-center gap-1.5 self-start rounded-lg border border-dashed border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:border-slate-400 hover:text-slate-900"
        >
          <Plus className="size-3.5" aria-hidden="true" />+ Tạo câu chính
        </button>
      ) : (
        <>
          <div className="flex flex-col gap-2 rounded-xl border border-slate-200 bg-white p-3.5">
            <p className="text-xs font-medium text-slate-600">Ảnh nền</p>
            <MediaPickerField
              kind="image"
              value={main.promptHtml ?? null}
              onChange={(v) => patchMain({ promptHtml: v })}
            />
            <p className="text-xs text-slate-500">
              Lưu ý: field này là đường dẫn ảnh nền cho cả bức tranh.
            </p>
          </div>

          <div className="flex flex-col gap-2 rounded-xl border border-slate-200 bg-white p-3.5">
            <p className="text-xs font-medium text-slate-600">Các thẻ kéo (tên vật phẩm)</p>
            <ChoiceEditor choices={choices} onChange={(c) => patchMain({ choices: c })} />
          </div>

          <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-3.5">
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs font-medium text-slate-600">Ô thả trên ảnh</p>
              <button
                type="button"
                onClick={addBox}
                className="inline-flex cursor-pointer items-center gap-1 rounded-lg border border-slate-300 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50"
              >
                <Plus className="size-3" aria-hidden="true" />+ Thêm ô
              </button>
            </div>

            <BoxPicker
              imageUrl={main.promptHtml ?? null}
              details={main.details}
              selectedId={selectedId}
              onSelect={setSelectedId}
              onDraw={(id, box) =>
                patchMain({
                  details: main.details.map((d) => (d.id === id ? { ...d, box } : d)),
                })
              }
              onClear={(id) =>
                patchMain({
                  details: main.details.map((d) => (d.id === id ? { ...d, box: null } : d)),
                })
              }
            />

            <div className="flex flex-col gap-2">
              {main.details.map((d, di) => {
                const isActive = d.id === selectedId
                return (
                  <div
                    key={d.id}
                    onClick={() => setSelectedId(d.id)}
                    className={cn(
                      'flex cursor-pointer items-center gap-2.5 rounded-lg border p-2.5 transition-colors',
                      isActive
                        ? 'border-brand-primary ring-brand-primary/30 bg-slate-50 ring-1'
                        : 'border-slate-200 bg-white hover:border-slate-300',
                    )}
                  >
                    <span
                      className={cn(
                        'grid size-8 shrink-0 place-items-center rounded-lg text-sm font-semibold',
                        isActive ? 'bg-admin-primary text-white' : 'bg-slate-100 text-slate-700',
                      )}
                    >
                      {d.label}
                    </span>
                    {isActive && (
                      <span className="hidden text-xs font-medium text-slate-700 md:inline">
                        Đang chọn để vẽ
                      </span>
                    )}
                    <Field label="Đáp án đúng">
                      <select
                        value={d.correctAnswers?.[0] ?? ''}
                        onChange={(e) =>
                          patchDetail(di, {
                            correctAnswers: e.target.value ? [e.target.value] : [],
                          })
                        }
                        className="focus:border-brand-primary focus:ring-brand-primary/20 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-900 focus:ring-2 focus:outline-none"
                      >
                        <option value="" className="text-slate-900">
                          — Chọn thẻ —
                        </option>
                        {choiceLabels.map((l, li) => (
                          <option key={`${l}-${li}`} value={l} className="text-slate-900">
                            {isColorCode(l) ? getColorName(l) : l}
                          </option>
                        ))}
                      </select>
                    </Field>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        setSelectedId(null)
                        patchMain({
                          details: main.details.filter((_, i) => i !== di),
                        })
                      }}
                      className="cursor-pointer rounded-lg border border-rose-200 bg-rose-50 p-2 text-rose-700 transition-colors hover:bg-rose-100"
                      aria-label="Xóa ô"
                      title="Xóa ô"
                    >
                      <Trash2 className="size-4" aria-hidden="true" />
                    </button>
                  </div>
                )
              })}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

function ChoiceEditor({
  choices,
  onChange,
}: {
  choices: WordBoxItem[]
  onChange: (c: WordBoxItem[]) => void
}): ReactElement {
  const add = () => onChange([...choices, { label: '' }])
  return (
    <div className="flex flex-col gap-2">
      {choices.map((c, i) => {
        const isColor = isColorCode(c.label)
        return (
          <div key={i} className="flex items-center gap-2">
            {isColor ? (
              <span
                className="size-8 shrink-0 rounded-lg border border-slate-300"
                style={{ backgroundColor: c.label }}
              />
            ) : (
              <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-slate-100 text-xs font-semibold text-slate-700 uppercase">
                {c.label.slice(0, 2) || '?'}
              </span>
            )}
            <input
              value={c.label}
              onChange={(e) =>
                onChange(choices.map((it, j) => (j === i ? { ...it, label: e.target.value } : it)))
              }
              placeholder={isColor ? getColorName(c.label) : 'Tên thẻ (hoặc #hex để tô màu)'}
              className="focus:border-brand-primary focus:ring-brand-primary/20 flex-1 rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-sm text-slate-900 placeholder:text-slate-500 focus:ring-2 focus:outline-none"
            />
            <button
              type="button"
              onClick={() => onChange(choices.filter((_, j) => j !== i))}
              className="cursor-pointer rounded-lg border border-rose-200 bg-rose-50 p-2 text-rose-700 transition-colors hover:bg-rose-100"
              aria-label="Xóa thẻ"
            >
              <Trash2 className="size-4" aria-hidden="true" />
            </button>
          </div>
        )
      })}
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
