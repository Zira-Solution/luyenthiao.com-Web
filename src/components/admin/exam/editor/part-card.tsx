'use client'

import { BookPlus, Code2, Trash2 } from 'lucide-react'
import { useState, type ReactElement } from 'react'

import { PartFormDragdrop } from './form/part-form-dragdrop'
import { PartFormGapfill } from './form/part-form-gapfill'
import { PartFormMatching } from './form/part-form-matching'
import { PartFormMultichoice } from './form/part-form-multichoice'
import { PartFormSpeak } from './form/part-form-speak'
import { PartFormWrite } from './form/part-form-write'
import { PartSettingsFields } from './form/part-settings-fields'
import { PartPreview } from './part-preview'
import { QuestionBankPickerDialog } from './question-bank-picker-dialog'
import { QuestionsJsonEditor } from './questions-json-editor'

import { blankPart, PART_KIND_LABEL, PART_KINDS } from '@/lib/exam-blank'
import { useExamEditorStore } from '@/store/exam-editor-store'
import type { ExamQuestion, PartKind } from '@/types/exam'
import type { SpeakingQuestion } from '@/types/speaking'
import type { WritingPrompt } from '@/types/writing'

export interface PartCardProps {
  structIdx: number
  partIdx: number
}

export function PartCard({ structIdx, partIdx }: PartCardProps): ReactElement {
  const draft = useExamEditorStore((s) => s.draft)
  const patchPart = useExamEditorStore((s) => s.patchPart)
  const patchStruct = useExamEditorStore((s) => s.patchStruct)

  const part = draft?.structures[structIdx]?.parts[partIdx]
  const [expanded, setExpanded] = useState(false)
  const [pickerOpen, setPickerOpen] = useState(false)

  if (!part) return <div />

  const isSubjective = part.kind === 'write' || part.kind === 'speak'

  const changePartKind = (kind: PartKind) => {
    if (part.kind === kind) return
    if (!window.confirm('Đổi loại phần sẽ xóa câu hỏi hiện tại. Tiếp tục?')) return
    const newPart = { ...blankPart(kind), id: part.id, title: part.title }
    patchPart(structIdx, partIdx, () => newPart)
    useExamEditorStore.getState().setJsonMode(newPart.id, false)
    useExamEditorStore
      .getState()
      .setJsonText(newPart.id, JSON.stringify(newPart.questions ?? [], null, 2))
  }

  const removePart = () =>
    patchStruct(structIdx, (s) => ({ ...s, parts: s.parts.filter((p) => p.id !== part.id) }))

  const insertObjectiveQuestion = (q: ExamQuestion) => {
    patchPart(structIdx, partIdx, (p) => {
      const next = [...p.questions, q]
      useExamEditorStore.getState().setJsonText(p.id, JSON.stringify(next, null, 2))
      return { ...p, questions: next }
    })
  }

  const insertWritePrompt = (prompt: WritingPrompt) => {
    patchPart(structIdx, partIdx, (p) => ({ ...p, prompt }))
  }

  const insertSpeakQuestion = (sq: SpeakingQuestion) => {
    patchPart(structIdx, partIdx, (p) => ({
      ...p,
      speakQuestions: [...(p.speakQuestions ?? []), sq],
    }))
  }

  return (
    <div className="mt-3 overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
      <div className="flex flex-wrap items-center gap-2.5 border-b border-slate-200 bg-white px-4 py-2.5">
        <span className="bg-admin-primary rounded-md px-2 py-0.5 text-xs font-semibold text-white">
          Phần
        </span>
        <select
          value={part.kind}
          onChange={(e) => changePartKind(e.target.value as PartKind)}
          className="focus:border-brand-primary focus:ring-brand-primary/20 rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-sm font-medium text-slate-900 focus:ring-2 focus:outline-none"
        >
          {PART_KINDS.map((k) => (
            <option key={k} value={k} className="text-slate-900">
              {PART_KIND_LABEL[k]}
            </option>
          ))}
        </select>
        <input
          value={part.title}
          onChange={(e) => patchPart(structIdx, partIdx, (p) => ({ ...p, title: e.target.value }))}
          placeholder="Tiêu đề phần (VD: Nghe & nối tên)"
          className="focus:border-brand-primary min-w-[180px] flex-1 border-b border-slate-200 bg-transparent py-1 text-sm font-medium text-slate-900 placeholder:text-slate-500 focus:outline-none"
        />
        <button
          type="button"
          onClick={() => {
            setExpanded(true)
            setPickerOpen(true)
          }}
          className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50"
        >
          <BookPlus className="size-3.5" aria-hidden="true" />
          Chèn từ kho
        </button>
        <button
          type="button"
          onClick={() => setExpanded((e) => !e)}
          className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50"
        >
          <Code2 className="size-3.5" aria-hidden="true" />
          {expanded ? 'Ẩn' : 'Câu hỏi'}
        </button>
        <button
          type="button"
          onClick={removePart}
          className="cursor-pointer rounded-lg border border-rose-200 bg-rose-50 p-1.5 text-rose-700 transition-colors hover:bg-rose-100"
          title="Xóa phần"
        >
          <Trash2 className="size-3.5" aria-hidden="true" />
        </button>
      </div>

      {expanded && (
        <div className="grid grid-cols-1 gap-4 p-4 xl:grid-cols-2">
          <div className="flex min-w-0 flex-col gap-3">
            {!isSubjective && <PartSettingsFields structIdx={structIdx} partIdx={partIdx} />}
            <KindForm structIdx={structIdx} partIdx={partIdx} />
            {!isSubjective && <QuestionsJsonEditor structIdx={structIdx} partIdx={partIdx} />}
          </div>

          <div className="w-full self-start xl:sticky xl:top-20">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-xs font-medium text-slate-500">Xem trước</p>
            </div>
            <PartPreview part={part} structureName={draft?.structures[structIdx]?.name ?? ''} />
          </div>
        </div>
      )}

      <QuestionBankPickerDialog
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        partKind={part.kind}
        speakKind={part.speakKind}
        examLevelSlug={draft?.levelSlug}
        onPickObjective={insertObjectiveQuestion}
        onPickWritePrompt={insertWritePrompt}
        onPickSpeakQuestion={insertSpeakQuestion}
      />
    </div>
  )
}

function KindForm({ structIdx, partIdx }: { structIdx: number; partIdx: number }): ReactElement {
  const draft = useExamEditorStore((s) => s.draft)
  const part = draft?.structures[structIdx]?.parts[partIdx]
  if (!part) return <div />
  switch (part.kind) {
    case 'gapfill':
      return <PartFormGapfill structIdx={structIdx} partIdx={partIdx} />
    case 'multichoice':
      return <PartFormMultichoice structIdx={structIdx} partIdx={partIdx} />
    case 'matching':
      return <PartFormMatching structIdx={structIdx} partIdx={partIdx} />
    case 'dragdrop':
      return <PartFormDragdrop structIdx={structIdx} partIdx={partIdx} />
    case 'write':
      return <PartFormWrite structIdx={structIdx} partIdx={partIdx} />
    case 'speak':
      return <PartFormSpeak structIdx={structIdx} partIdx={partIdx} />
  }
}
