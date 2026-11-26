'use client'

import { Code2, Plus, RotateCcw, Trash2 } from 'lucide-react'
import { useState, type ReactElement } from 'react'

import { Field, NumberInput, TextAreaInput, TextInput } from '../editor-field'

import { MediaPickerField } from '@/components/admin/media'
import { blankSpeakQuestion } from '@/lib/exam-blank'
import { useExamEditorStore } from '@/store/exam-editor-store'
import type { SpeakingQuestion, SpeakingQuestionKind } from '@/types/speaking'

export interface PartFormSpeakProps {
  structIdx: number
  partIdx: number
}

const SPEAK_KIND_OPTIONS: ReadonlyArray<{ value: SpeakingQuestionKind; label: string }> = [
  { value: 'mic-plain', label: 'Hỏi đáp thu âm (mic-plain)' },
  { value: 'mic-answer', label: 'Nhìn cảnh trả lời (mic-answer)' },
  { value: 'mic-zoom', label: 'Phóng to thẻ nói (mic-zoom)' },
  { value: 'scene-mark', label: 'Chọn vật trên tranh (scene-mark)' },
  { value: 'choose-object', label: 'Chọn thẻ ảnh đúng (choose-object)' },
  { value: 'drag-object', label: 'Kéo vật vào tranh (drag-object)' },
]

export function PartFormSpeak({ structIdx, partIdx }: PartFormSpeakProps): ReactElement {
  const draft = useExamEditorStore((s) => s.draft)
  const patchPart = useExamEditorStore((s) => s.patchPart)
  const [jsonOpen, setJsonOpen] = useState(false)
  const [jsonDraft, setJsonDraft] = useState('')
  const [jsonError, setJsonError] = useState<string | null>(null)

  const part = draft?.structures[structIdx]?.parts[partIdx]
  if (!part) return <div />

  const speakKind: SpeakingQuestionKind = part.speakKind ?? 'mic-plain'
  const questions: SpeakingQuestion[] = part.speakQuestions ?? []

  const updateQuestions = (next: SpeakingQuestion[]) =>
    patchPart(structIdx, partIdx, (p) => ({ ...p, speakQuestions: next }))

  const addQuestion = () => updateQuestions([...questions, blankSpeakQuestion(speakKind)])

  const patchQuestion = (qi: number, patch: Partial<SpeakingQuestion>) =>
    updateQuestions(questions.map((q, idx) => (idx === qi ? { ...q, ...patch } : q)))

  const removeQuestion = (qi: number) => updateQuestions(questions.filter((_, idx) => idx !== qi))

  const toggleJson = () => {
    if (!jsonOpen) {
      setJsonDraft(JSON.stringify(questions, null, 2))
      setJsonError(null)
      setJsonOpen(true)
    } else {
      setJsonOpen(false)
    }
  }

  const applyJson = (raw: string) => {
    setJsonDraft(raw)
    try {
      const parsed = JSON.parse(raw) as unknown
      if (!Array.isArray(parsed)) {
        setJsonError('speakQuestions phải là mảng JSON.')
        return
      }
      setJsonError(null)
      updateQuestions(parsed as SpeakingQuestion[])
    } catch {
      setJsonError('JSON chưa hợp lệ — form vẫn giữ dữ liệu cũ.')
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-1 gap-3 rounded-xl border border-slate-200 bg-white p-3.5 sm:grid-cols-2">
        <Field label="Kiểu bài nói (speakKind)">
          <select
            value={speakKind}
            onChange={(e) => {
              const nextKind = e.target.value as SpeakingQuestionKind
              patchPart(structIdx, partIdx, (p) => ({ ...p, speakKind: nextKind }))
            }}
            className="focus:border-brand-primary focus:ring-brand-primary/20 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:ring-2 focus:outline-none"
          >
            {SPEAK_KIND_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Điểm tối đa">
          <NumberInput
            value={part.maxScore ?? 10}
            min={1}
            max={100}
            onChange={(n) => patchPart(structIdx, partIdx, (p) => ({ ...p, maxScore: n || 10 }))}
          />
        </Field>
      </div>

      {questions.map((q, qi) => (
        <div
          key={q.id || qi}
          className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-3.5"
        >
          <div className="flex items-center justify-between gap-2 border-b border-slate-200 pb-2">
            <span className="text-xs font-semibold text-slate-700">
              Câu nói #{qi + 1} · <span className="font-mono text-slate-500">{q.kind}</span>
            </span>
            <button
              type="button"
              onClick={() => removeQuestion(qi)}
              className="inline-flex cursor-pointer items-center gap-1 rounded-lg border border-rose-200 bg-rose-50 px-2.5 py-1 text-xs font-medium text-rose-700 transition-colors hover:bg-rose-100"
            >
              <Trash2 className="size-3" aria-hidden="true" />
              Xóa
            </button>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label="Dạng câu">
              <select
                value={q.kind}
                onChange={(e) =>
                  patchQuestion(qi, { kind: e.target.value as SpeakingQuestionKind })
                }
                className="focus:border-brand-primary focus:ring-brand-primary/20 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:ring-2 focus:outline-none"
              >
                {SPEAK_KIND_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Ghi chú tiếng Việt (tùy chọn)">
              <TextInput
                value={q.vi ?? ''}
                onChange={(v) => patchQuestion(qi, { vi: v })}
                placeholder="VD: Giới thiệu bản thân"
              />
            </Field>
          </div>

          <Field label="Câu hỏi / Lời thoại giám khảo">
            <TextAreaInput
              value={q.text}
              onChange={(v) => patchQuestion(qi, { text: v })}
              rows={2}
              placeholder="VD: What is your name? / Look at the picture…"
            />
          </Field>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label="Ảnh nền / Bức tranh (sceneBg)">
              <MediaPickerField
                kind="image"
                value={q.sceneBg ?? null}
                onChange={(v) => patchQuestion(qi, { sceneBg: v ?? undefined })}
              />
            </Field>
            <Field label="Ảnh phóng to (zoomCard)">
              <MediaPickerField
                kind="image"
                value={q.zoomCard ?? null}
                onChange={(v) => patchQuestion(qi, { zoomCard: v ?? undefined })}
              />
            </Field>
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={addQuestion}
        className="inline-flex cursor-pointer items-center gap-1.5 self-start rounded-lg border border-dashed border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:border-slate-400 hover:text-slate-900"
      >
        <Plus className="size-3.5" aria-hidden="true" />+ Thêm câu nói
      </button>

      <div className="flex flex-col gap-2 rounded-xl border border-slate-200 bg-white p-3">
        <div className="flex items-center justify-between gap-2">
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600">
            <Code2 className="size-3.5" aria-hidden="true" />
            JSON nâng cao (tọa độ scene / palette / choices)
          </span>
          <button
            type="button"
            onClick={toggleJson}
            className="cursor-pointer rounded-lg border border-slate-300 bg-white px-3 py-1 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50"
          >
            {jsonOpen ? 'Ẩn JSON' : 'Mở JSON'}
          </button>
        </div>

        {jsonOpen && (
          <>
            <textarea
              value={jsonDraft}
              onChange={(e) => applyJson(e.target.value)}
              spellCheck={false}
              className="focus:border-brand-primary focus:ring-brand-primary/20 h-48 w-full resize-y rounded-lg border border-slate-300 bg-slate-50 p-3 font-mono text-xs text-slate-900 focus:ring-2 focus:outline-none"
            />
            {jsonError && (
              <div className="flex items-center justify-between gap-2 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2">
                <span className="text-xs font-medium text-rose-700">{jsonError}</span>
                <button
                  type="button"
                  onClick={() => {
                    setJsonDraft(JSON.stringify(questions, null, 2))
                    setJsonError(null)
                  }}
                  className="inline-flex cursor-pointer items-center gap-1 rounded-lg border border-slate-300 bg-white px-2.5 py-1 text-xs font-medium text-slate-700"
                >
                  <RotateCcw className="size-3" aria-hidden="true" />
                  Khôi phục
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
