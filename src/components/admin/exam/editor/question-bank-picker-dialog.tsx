'use client'

import { Plus, Search } from 'lucide-react'
import { useState, type ReactElement } from 'react'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui'
import { useAdminQuestions } from '@/hooks/admin'
import { createId } from '@/lib/exam-blank'
import type { AdminQuestion } from '@/schemas/admin-question'
import type { ExamQuestion, PartKind } from '@/types/exam'
import type { SpeakingQuestion, SpeakingQuestionKind } from '@/types/speaking'
import type { WritingPrompt } from '@/types/writing'

export interface QuestionBankPickerDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  partKind: PartKind
  speakKind?: SpeakingQuestionKind | null
  examLevelSlug?: string
  onPickObjective: (question: ExamQuestion) => void
  onPickWritePrompt: (prompt: WritingPrompt) => void
  onPickSpeakQuestion: (question: SpeakingQuestion) => void
}

function summarizeQuestion(item: AdminQuestion): string {
  const q = item.question
  if (typeof q.title === 'string' && q.title.trim()) return q.title
  if (typeof q.instruction === 'string' && q.instruction.trim()) return q.instruction
  if (typeof q.text === 'string' && q.text.trim()) return q.text
  if (typeof q.promptHtml === 'string' && q.promptHtml.trim()) return q.promptHtml
  return JSON.stringify(q).slice(0, 90)
}

export function QuestionBankPickerDialog({
  open,
  onOpenChange,
  partKind,
  speakKind,
  examLevelSlug,
  onPickObjective,
  onPickWritePrompt,
  onPickSpeakQuestion,
}: QuestionBankPickerDialogProps): ReactElement {
  const [search, setSearch] = useState('')
  const [matchLevel, setMatchLevel] = useState(true)

  const targetKind =
    partKind === 'write'
      ? 'writing_prompt'
      : partKind === 'speak'
        ? (speakKind ?? undefined)
        : partKind

  const targetSkill = partKind === 'speak' && !speakKind ? 'speaking' : undefined

  const { data, isLoading, error } = useAdminQuestions(
    {
      level: matchLevel && examLevelSlug ? examLevelSlug : undefined,
      kind: targetKind,
      skill: targetSkill,
      q: search.trim() || undefined,
      page: 1,
      limit: 30,
    },
    open,
  )

  const items = data?.items ?? []

  const handleSelect = (item: AdminQuestion) => {
    const raw = JSON.parse(JSON.stringify(item.question)) as Record<string, unknown>
    if (partKind === 'write') {
      onPickWritePrompt({
        title: typeof raw.title === 'string' ? raw.title : 'Phần 1',
        instruction: typeof raw.instruction === 'string' ? raw.instruction : '',
        images: Array.isArray(raw.images) ? (raw.images as WritingPrompt['images']) : [],
        sampleAnswer: typeof raw.sampleAnswer === 'string' ? raw.sampleAnswer : '',
      })
    } else if (partKind === 'speak') {
      const sq: SpeakingQuestion = {
        ...(raw as unknown as SpeakingQuestion),
        id: createId('sq'),
        kind:
          (typeof raw.kind === 'string' ? (raw.kind as SpeakingQuestionKind) : speakKind) ??
          'mic-plain',
        text: typeof raw.text === 'string' ? raw.text : '',
      }
      onPickSpeakQuestion(sq)
    } else {
      const eq: ExamQuestion = {
        id: createId('q'),
        isExample: Boolean(raw.isExample),
        title: typeof raw.title === 'string' ? raw.title : '',
        promptHtml: typeof raw.promptHtml === 'string' ? raw.promptHtml : undefined,
        choices: Array.isArray(raw.choices) ? (raw.choices as ExamQuestion['choices']) : undefined,
        correctLabel: typeof raw.correctLabel === 'string' ? raw.correctLabel : null,
        details: Array.isArray(raw.details) ? (raw.details as ExamQuestion['details']) : [],
        skillTags: Array.isArray(raw.skillTags) ? (raw.skillTags as string[]) : item.skillTags,
      }
      onPickObjective(eq)
    }
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="admin-theme max-w-2xl border border-slate-200 bg-white text-slate-900 shadow-xl">
        <DialogHeader>
          <DialogTitle className="font-sans text-base font-semibold tracking-normal text-slate-900">
            Chèn từ kho câu hỏi
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative min-w-[200px] flex-1">
            <Search
              className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400"
              aria-hidden="true"
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm nội dung câu hỏi…"
              className="focus:border-brand-primary focus:ring-brand-primary/20 w-full rounded-lg border border-slate-300 bg-white py-2 pr-3 pl-9 text-sm text-slate-900 placeholder:text-slate-500 focus:ring-2 focus:outline-none"
            />
          </div>

          {examLevelSlug && (
            <label className="flex cursor-pointer items-center gap-2 text-xs font-medium text-slate-700">
              <input
                type="checkbox"
                checked={matchLevel}
                onChange={(e) => setMatchLevel(e.target.checked)}
                className="accent-brand-primary"
              />
              Chỉ cấp độ {examLevelSlug}
            </label>
          )}
        </div>

        {isLoading && (
          <div className="py-10 text-center text-sm text-slate-500">Đang tải kho câu hỏi…</div>
        )}
        {Boolean(error) && (
          <div className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
            Không tải được danh sách câu hỏi từ kho.
          </div>
        )}
        {!isLoading && !error && items.length === 0 && (
          <div className="py-10 text-center text-sm text-slate-500">
            Không tìm thấy câu hỏi phù hợp trong kho.
          </div>
        )}

        {!isLoading && !error && items.length > 0 && (
          <div className="flex max-h-[50vh] flex-col gap-2 overflow-auto pr-1">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="rounded bg-blue-50 px-2 py-0.5 text-[11px] font-semibold text-blue-700">
                      {item.kind}
                    </span>
                    {item.levelSlug && (
                      <span className="rounded bg-slate-200 px-2 py-0.5 text-[11px] font-medium text-slate-700">
                        {item.levelSlug}
                      </span>
                    )}
                    {item.skillTags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <p className="mt-1.5 truncate text-sm font-medium text-slate-900">
                    {summarizeQuestion(item)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleSelect(item)}
                  className="bg-admin-primary hover:bg-admin-primary-hover inline-flex shrink-0 cursor-pointer items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-semibold text-white transition-colors"
                >
                  <Plus className="size-3.5" aria-hidden="true" />
                  Chèn
                </button>
              </div>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
