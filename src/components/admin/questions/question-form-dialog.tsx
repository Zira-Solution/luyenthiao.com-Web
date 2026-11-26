'use client'

import { useState, type ReactElement } from 'react'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui'
import type { AdminPlanet } from '@/schemas/admin-planet'
import {
  QUESTION_KINDS,
  SKILL_TAGS,
  type AdminQuestion,
  type SaveAdminQuestionInput,
} from '@/schemas/admin-question'

export interface QuestionFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  initial: AdminQuestion | null
  planets: AdminPlanet[]
  isSubmitting: boolean
  onSubmit: (payload: SaveAdminQuestionInput, editingId?: string) => Promise<void>
}

export function QuestionFormDialog({
  open,
  onOpenChange,
  initial,
  planets,
  isSubmitting,
  onSubmit,
}: QuestionFormDialogProps): ReactElement {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="admin-theme max-w-2xl border border-slate-200 bg-white text-slate-900 shadow-xl">
        <DialogHeader>
          <DialogTitle className="font-sans text-base font-semibold tracking-normal text-slate-900">
            {initial ? 'Cập nhật câu hỏi' : 'Tạo câu hỏi mới'}
          </DialogTitle>
        </DialogHeader>
        {open && (
          <QuestionFormInner
            key={initial?.id ?? 'new'}
            initial={initial}
            planets={planets}
            isSubmitting={isSubmitting}
            onCancel={() => onOpenChange(false)}
            onSubmit={onSubmit}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}

function QuestionFormInner({
  initial,
  planets,
  isSubmitting,
  onCancel,
  onSubmit,
}: {
  initial: AdminQuestion | null
  planets: AdminPlanet[]
  isSubmitting: boolean
  onCancel: () => void
  onSubmit: (payload: SaveAdminQuestionInput, editingId?: string) => Promise<void>
}): ReactElement {
  const [levelSlug, setLevelSlug] = useState(initial?.levelSlug ?? planets[0]?.slug ?? 'movers')
  const [kind, setKind] = useState(initial?.kind ?? 'multichoice')
  const [skillTags, setSkillTags] = useState<string[]>(initial?.skillTags ?? ['reading'])
  const [jsonText, setJsonText] = useState(() =>
    JSON.stringify(
      initial?.question ?? {
        title: '',
        isExample: false,
        details: [],
      },
      null,
      2,
    ),
  )
  const [error, setError] = useState<string | null>(null)

  const toggleSkill = (tag: string) => {
    setSkillTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]))
  }

  const handleSave = async () => {
    setError(null)
    let parsedQuestion: Record<string, unknown>
    try {
      const parsed = JSON.parse(jsonText) as unknown
      if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
        setError('Nội dung JSON câu hỏi phải là một object.')
        return
      }
      parsedQuestion = parsed as Record<string, unknown>
    } catch {
      setError('JSON câu hỏi chưa hợp lệ.')
      return
    }

    try {
      await onSubmit(
        {
          levelSlug,
          kind,
          skillTags,
          question: parsedQuestion,
        },
        initial?.id,
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lưu câu hỏi thất bại.')
    }
  }

  const hasSlugInPlanets = planets.some((p) => p.slug === levelSlug)

  return (
    <div className="flex flex-col gap-4">
      {error && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-medium text-rose-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <label className="flex flex-col gap-1">
          <span className="text-xs font-medium text-slate-600">Hành tinh (cấp độ)</span>
          <select
            aria-label="Hành tinh (câu hỏi)"
            value={levelSlug}
            onChange={(e) => setLevelSlug(e.target.value)}
            className="focus:border-brand-primary focus:ring-brand-primary/20 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:ring-2 focus:outline-none"
          >
            {!hasSlugInPlanets && levelSlug && <option value={levelSlug}>{levelSlug}</option>}
            {planets.map((p) => (
              <option key={p.id} value={p.slug}>
                {p.name} ({p.slug})
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-xs font-medium text-slate-600">Loại câu hỏi</span>
          <select
            aria-label="Loại câu hỏi"
            value={kind}
            onChange={(e) => setKind(e.target.value)}
            className="focus:border-brand-primary focus:ring-brand-primary/20 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:ring-2 focus:outline-none"
          >
            {QUESTION_KINDS.map((k) => (
              <option key={k} value={k}>
                {k}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="flex flex-col gap-1.5">
        <span className="text-xs font-medium text-slate-600">Nhãn kỹ năng</span>
        <div className="flex flex-wrap gap-3">
          {SKILL_TAGS.map((tag) => (
            <label
              key={tag}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700"
            >
              <input
                type="checkbox"
                checked={skillTags.includes(tag)}
                onChange={() => toggleSkill(tag)}
                className="accent-brand-primary"
              />
              {tag}
            </label>
          ))}
        </div>
      </div>

      <label className="flex flex-col gap-1">
        <span className="text-xs font-medium text-slate-600">Dữ liệu câu hỏi (JSON)</span>
        <textarea
          value={jsonText}
          onChange={(e) => setJsonText(e.target.value)}
          rows={10}
          spellCheck={false}
          className="focus:border-brand-primary focus:ring-brand-primary/20 w-full resize-y rounded-lg border border-slate-300 bg-slate-50 p-3 font-mono text-xs text-slate-900 focus:ring-2 focus:outline-none"
        />
      </label>

      <div className="flex justify-end gap-2 border-t border-slate-200 pt-3">
        <button
          type="button"
          onClick={onCancel}
          className="cursor-pointer rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          Hủy
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={isSubmitting}
          className="bg-admin-primary hover:bg-admin-primary-hover cursor-pointer rounded-lg px-4 py-2 text-sm font-semibold text-white shadow-xs transition-colors disabled:opacity-50"
        >
          {isSubmitting ? 'Đang lưu…' : 'Lưu câu hỏi'}
        </button>
      </div>
    </div>
  )
}
