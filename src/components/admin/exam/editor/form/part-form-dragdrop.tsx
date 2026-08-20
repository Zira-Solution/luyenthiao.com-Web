"use client"

import { Plus, Trash2 } from "lucide-react"
import { useState, type ReactElement } from "react"

import { BoxPicker } from "../box-picker"
import { Field } from "../editor-field"

import { MediaPickerField } from "@/components/admin/media"
import { getColorName, isColorCode } from "@/lib/exam"
import { blankDetail, defaultQuestion } from "@/lib/exam/factories"
import { useExamEditorStore } from "@/store/exam-editor-store"
import type { ExamQuestion, WordBoxItem } from "@/types/exam"



interface PartFormDragdropProps {
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
    const q = { ...defaultQuestion("dragdrop"), details: [blankDetail("dragdrop", "1")] }
    patchPart(structIdx, partIdx, (p) => ({ ...p, questions: [...p.questions, q] }))
    setSelectedId(q.details[0]?.id ?? null)
  }

  const patchDetail = (di: number, patch: Partial<ExamQuestion["details"][number]>) => {
    if (!main) return
    patchMain({
      details: main.details.map((d, i) => (i === di ? { ...d, ...patch } : d)),
    })
  }

  const addBox = () => {
    if (!main) return
    patchMain({
      details: [...main.details, blankDetail("dragdrop", String(main.details.length + 1))],
    })
  }

  const choices = main?.choices ?? []
  const choiceLabels = choices.map((c) => c.label).filter(Boolean) as string[]

  return (
    <div className="flex flex-col gap-3 px-4 pb-4">
      {activeCount > 1 && (
        <div className="rounded-xl border border-semantic-warning/40 bg-semantic-warning/10 px-3 py-2 text-semantic-warning text-xs font-semibold">
          Player chỉ dùng câu đầu tiên, các câu khác bị bỏ qua.
        </div>
      )}

      {!main ? (
        <button
          onClick={ensureQuestion}
          className="inline-flex items-center gap-1.5 self-start px-3 py-1.5 rounded-lg border border-dashed border-white/25 hover:border-white/40 text-white/60 hover:text-white text-xs font-bold transition-colors cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          + Tạo câu chính
        </button>
      ) : (
        <>
          <div className="rounded-xl border border-white/10 bg-white/5 p-3 flex flex-col gap-2">
            <p className="text-white/60 text-[11px] font-black uppercase tracking-wide">Ảnh nền</p>
            <MediaPickerField
              kind="image"
              value={main.promptHtml ?? null}
              onChange={(v) => patchMain({ promptHtml: v })}
            />
            <p className="text-white/40 text-[11px]">
              Lưu ý: field này là đường dẫn ảnh nền cho cả bức tranh.
            </p>
          </div>

          <div className="rounded-xl border border-white/10 bg-white/5 p-3 flex flex-col gap-2">
            <p className="text-white/60 text-[11px] font-black uppercase tracking-wide">
              Các thẻ kéo (tên vật phẩm)
            </p>
            <ChoiceEditor
              choices={choices}
              onChange={(c) => patchMain({ choices: c })}
            />
          </div>

          <div className="rounded-xl border border-white/10 bg-white/5 p-3 flex flex-col gap-3">
            <div className="flex items-center justify-between gap-2">
              <p className="text-white/60 text-[11px] font-black uppercase tracking-wide">
                Ô thả trên ảnh
              </p>
              <button
                onClick={addBox}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white text-[11px] font-bold transition-colors cursor-pointer"
              >
                <Plus className="w-3 h-3" />
                + Thêm ô
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
                    className={`flex items-center gap-2 rounded-xl border p-2 transition-colors cursor-pointer ${
                      isActive
                        ? "border-brand-primary bg-brand-primary/10"
                        : "border-white/10 bg-white/5 hover:border-white/25"
                    }`}
                  >
                    <span
                      className={`w-8 h-8 shrink-0 rounded-lg grid place-items-center font-black text-sm text-white ${
                        isActive ? "bg-brand-primary" : "bg-white/10 text-white/70"
                      }`}
                    >
                      {d.label}
                    </span>
                    {isActive && (
                      <span className="hidden md:inline text-white/50 text-[10px] font-bold uppercase">
                        Đang chọn để vẽ
                      </span>
                    )}
                  <Field label="Đáp án đúng">
                    <select
                      value={d.correctAnswers?.[0] ?? ""}
                      onChange={(e) =>
                        patchDetail(di, {
                          correctAnswers: e.target.value ? [e.target.value] : [],
                        })
                      }
                      className="bg-white/10 text-white font-semibold text-sm rounded-xl px-3 py-2 focus:outline-none border border-transparent focus:border-brand-primary"
                    >
                      <option value="" className="text-slate-900">
                        — Chọn thẻ —
                      </option>
                      {choiceLabels.map((l) => (
                        <option key={l} value={l} className="text-slate-900">
                          {isColorCode(l) ? getColorName(l) : l}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setSelectedId(null)
                      patchMain({
                        details: main.details.filter((_, i) => i !== di),
                      })
                    }}
                    className="p-2 rounded-lg bg-white/5 hover:bg-game-danger-to text-white/60 hover:text-white transition-colors cursor-pointer"
                    aria-label="Xóa ô"
                    title="Xóa ô"
                  >
                    <Trash2 className="w-4 h-4" />
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
  const add = () => onChange([...choices, { label: "" }])
  return (
    <div className="flex flex-col gap-2">
      {choices.map((c, i) => {
        const isColor = isColorCode(c.label)
        return (
          <div key={i} className="flex items-center gap-2">
            {isColor ? (
              <span
                className="w-8 h-8 shrink-0 rounded-lg border border-white/20"
                style={{ backgroundColor: c.label }}
              />
            ) : (
              <span className="w-8 h-8 shrink-0 rounded-lg bg-white/10 text-white/70 grid place-items-center text-xs font-bold uppercase">
                {c.label.slice(0, 2) || "?"}
              </span>
            )}
            <input
              value={c.label}
              onChange={(e) =>
                onChange(choices.map((it, j) => (j === i ? { ...it, label: e.target.value } : it)))
              }
              placeholder={isColor ? getColorName(c.label) : "Tên thẻ (hoặc #hex để tô màu)"}
              className="flex-1 bg-white/10 text-white text-sm rounded-lg px-2.5 py-1.5 focus:outline-none border border-transparent focus:border-brand-primary placeholder:text-white/30"
            />
            <button
              onClick={() => onChange(choices.filter((_, j) => j !== i))}
              className="p-2 rounded-lg bg-white/5 hover:bg-game-danger-to text-white/60 hover:text-white transition-colors cursor-pointer"
              aria-label="Xóa thẻ"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )
      })}
      <button
        onClick={add}
        className="inline-flex items-center gap-1.5 self-start px-3 py-1.5 rounded-lg border border-dashed border-white/25 hover:border-white/40 text-white/60 hover:text-white text-xs font-bold transition-colors cursor-pointer"
      >
        <Plus className="w-3.5 h-3.5" />
        + Thêm thẻ
      </button>
    </div>
  )
}