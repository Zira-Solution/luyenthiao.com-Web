'use client'

import type { ReactElement } from 'react'

import { Field, NumberInput, TextAreaInput, TextInput } from '../editor-field'

import { MediaPickerField } from '@/components/admin/media'
import { defaultWritingPrompt } from '@/lib/exam-blank'
import { useExamEditorStore } from '@/store/exam-editor-store'
import type { WritingPrompt, WritingStoryImage } from '@/types/writing'

export interface PartFormWriteProps {
  structIdx: number
  partIdx: number
}

const SLOTS: readonly WritingStoryImage['slot'][] = ['story-img-1', 'story-img-2', 'story-img-3']

export function PartFormWrite({ structIdx, partIdx }: PartFormWriteProps): ReactElement {
  const draft = useExamEditorStore((s) => s.draft)
  const patchPart = useExamEditorStore((s) => s.patchPart)

  const part = draft?.structures[structIdx]?.parts[partIdx]
  if (!part) return <div />

  const prompt: WritingPrompt = part.prompt ?? defaultWritingPrompt()

  const patchPrompt = (patch: Partial<WritingPrompt>) =>
    patchPart(structIdx, partIdx, (p) => ({
      ...p,
      prompt: { ...(p.prompt ?? defaultWritingPrompt()), ...patch },
    }))

  const patchSlotImage = (slot: WritingStoryImage['slot'], patch: Partial<WritingStoryImage>) => {
    const map = new Map(prompt.images.map((img) => [img.slot, img]))
    const nextImages = SLOTS.map((s, idx) => {
      const base = map.get(s) ?? { slot: s, src: null, alt: `Ảnh ${idx + 1}` }
      return s === slot ? { ...base, ...patch } : base
    })
    patchPrompt({ images: nextImages })
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-1 gap-3 rounded-xl border border-slate-200 bg-white p-3.5 sm:grid-cols-2">
        <Field label="Tiêu đề đề bài viết">
          <TextInput
            value={prompt.title}
            onChange={(v) => patchPrompt({ title: v })}
            placeholder="VD: Phần 1 — Viết câu chuyện"
          />
        </Field>
        <Field label="Điểm tối đa">
          <NumberInput
            value={part.maxScore ?? 5}
            min={1}
            max={100}
            onChange={(n) => patchPart(structIdx, partIdx, (p) => ({ ...p, maxScore: n || 5 }))}
          />
        </Field>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-3.5">
        <Field label="Hướng dẫn / Đề bài cho học viên">
          <TextAreaInput
            value={prompt.instruction}
            onChange={(v) => patchPrompt({ instruction: v })}
            rows={4}
            placeholder="VD: Look at the three pictures. Write about this story. Write 20 or more words."
          />
        </Field>
      </div>

      <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-3.5">
        <p className="text-xs font-medium text-slate-600">Ảnh minh họa câu chuyện (tối đa 3 ảnh)</p>
        {SLOTS.map((slot, idx) => {
          const item = prompt.images.find((i) => i.slot === slot) ?? {
            slot,
            src: null,
            alt: `Ảnh ${idx + 1}`,
          }
          return (
            <div
              key={slot}
              className="flex flex-col gap-2 rounded-lg border border-slate-200 bg-slate-50 p-3"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-semibold text-slate-700">Khung ảnh {idx + 1}</span>
                <div className="w-44">
                  <TextInput
                    value={item.alt}
                    onChange={(v) => patchSlotImage(slot, { alt: v })}
                    placeholder={`Mô tả ảnh ${idx + 1}`}
                  />
                </div>
              </div>
              <MediaPickerField
                kind="image"
                value={item.src}
                onChange={(v) => patchSlotImage(slot, { src: v })}
              />
            </div>
          )
        })}
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-3.5">
        <Field label="Bài mẫu tham khảo (không bắt buộc)">
          <TextAreaInput
            value={prompt.sampleAnswer}
            onChange={(v) => patchPrompt({ sampleAnswer: v })}
            rows={3}
            placeholder="Đáp án gợi ý để giám khảo/học viên đối chiếu…"
          />
        </Field>
      </div>
    </div>
  )
}
