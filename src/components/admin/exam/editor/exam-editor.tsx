'use client'

import { ArrowLeft, Plus, Save, Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState, type ReactElement } from 'react'

import { Field, NumberInput, TextInput } from './editor-field'
import { PartCard } from './part-card'
import { ValidationPanel } from './validation-panel'

import { AdminPageHeader } from '@/components/admin/shell'
import { ROUTES } from '@/constants'
import {
  useAdminExam,
  useAdminPlanets,
  useCreateAdminExam,
  useUpdateAdminExam,
} from '@/hooks/admin'
import { clearDraft, loadDraft, saveDraft } from '@/lib/admin-draft'
import { examSchema, type Exam, type ExamPart, type ExamStructure } from '@/lib/exam'
import { blankExam, blankPart, blankStructure, structurePartCount } from '@/lib/exam-blank'
import { selectDirty, useExamEditorStore } from '@/store/exam-editor-store'

export interface ExamEditorProps {
  examId: string
}

export function ExamEditor({ examId }: ExamEditorProps): ReactElement {
  const router = useRouter()
  const isNew = examId === 'new'
  const draftKey = isNew ? 'new' : examId

  const { data: serverExam, isLoading, error } = useAdminExam(examId)
  const { data: planets = [] } = useAdminPlanets()
  const createExam = useCreateAdminExam()
  const updateExam = useUpdateAdminExam()

  const draft = useExamEditorStore((s) => s.draft)
  const init = useExamEditorStore((s) => s.init)
  const reset = useExamEditorStore((s) => s.reset)
  const patchExam = useExamEditorStore((s) => s.patchExam)
  const patchStruct = useExamEditorStore((s) => s.patchStruct)
  const dirty = useExamEditorStore(selectDirty)

  const [saveError, setSaveError] = useState<string | null>(null)
  const [draftMeta, setDraftMeta] = useState<{ savedAt: number } | null>(() => {
    const existing = loadDraft(draftKey)
    return existing ? { savedAt: existing.savedAt } : null
  })

  // Autosave — ghi bản nháp cục bộ phòng mất mạng sau 400ms im lặng
  useEffect(() => {
    if (!draft) return
    const t = setTimeout(() => {
      saveDraft(draftKey, draft)
    }, 400)
    return () => clearTimeout(t)
  }, [draft, draftKey])

  useEffect(() => {
    const currentId = useExamEditorStore.getState().draft?.id
    if (isNew) {
      if (!currentId) init(blankExam())
    } else if (serverExam && currentId !== serverExam.id) {
      init(JSON.parse(JSON.stringify(serverExam)) as Exam)
    }
  }, [isNew, serverExam, init])

  useEffect(() => {
    return () => {
      reset()
    }
  }, [examId, reset])

  const restoreDraft = () => {
    const existing = loadDraft(draftKey)
    if (existing) {
      init(existing.exam)
      setDraftMeta(null)
    }
  }

  const discardDraft = () => {
    clearDraft(draftKey)
    setDraftMeta(null)
  }

  if (!isNew && error) {
    return (
      <div className="rounded-xl border border-rose-200 bg-white p-8 text-center shadow-xs">
        <p className="text-base font-semibold text-rose-700">
          {error instanceof Error ? error.message : 'Không tải được đề thi từ máy chủ.'}
        </p>
        <button
          type="button"
          onClick={() => router.push(ROUTES.ADMIN_EXAM)}
          className="mt-4 inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Quay lại danh sách
        </button>
      </div>
    )
  }

  if (!draft || (!isNew && isLoading)) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="border-brand-primary size-10 animate-spin rounded-full border-2 border-t-transparent" />
      </div>
    )
  }

  const addStructure = () =>
    patchExam((d) => ({
      ...d,
      structures: [...d.structures, blankStructure(d.structures.length)],
    }))

  const removeStructure = (idx: number) =>
    patchExam((d) => ({ ...d, structures: d.structures.filter((_, i) => i !== idx) }))

  const addPart = (structIdx: number) =>
    patchStruct(structIdx, (s) => ({ ...s, parts: [...s.parts, blankPart('gapfill')] }))

  const handleSelectPlanet = (slug: string) => {
    const matched = planets.find((p) => p.slug === slug)
    patchExam((d) => ({
      ...d,
      levelSlug: slug,
      levelName: matched ? matched.name : slug.toUpperCase(),
    }))
  }

  const examTitle = draft.name || 'Đề thi mới'
  const isSaving = createExam.isPending || updateExam.isPending

  const save = async () => {
    setSaveError(null)
    if (!draft || isSaving) return

    const st = useExamEditorStore.getState()
    const jsonTexts = st.jsonTexts
    const jsonMode = st.jsonMode

    let parseError: string | null = null
    const finalPartsPerStruct: ExamStructure[] = draft.structures.map((s) => {
      const parts: ExamPart[] = s.parts.map((p) => {
        if (!jsonMode[p.id]) return p
        const raw = jsonTexts[p.id]?.trim()
        if (!raw) {
          parseError = `Phần "${p.title || p.id}" chưa có dữ liệu câu hỏi.`
          return p
        }
        try {
          return { ...p, questions: JSON.parse(raw) as ExamPart['questions'] }
        } catch {
          parseError = `JSON câu hỏi của phần "${p.title || p.id}" không hợp lệ.`
          return p
        }
      })
      return { ...s, parts }
    })

    if (parseError) {
      setSaveError(parseError)
      return
    }

    const final: Exam = { ...draft, structures: finalPartsPerStruct }
    const result = examSchema.safeParse(final)
    if (!result.success) {
      const first = result.error.issues[0]
      setSaveError(`Dữ liệu không hợp lệ: ${first?.path.join('.')} ${first?.message}`)
      return
    }

    try {
      if (isNew) {
        await createExam.mutateAsync(result.data)
      } else {
        await updateExam.mutateAsync({ id: examId, exam: result.data })
      }
      clearDraft(draftKey)
      setDraftMeta(null)
      router.push(ROUTES.ADMIN_EXAM)
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Lưu đề thi thất bại.')
    }
  }

  const hasCurrentPlanetInList = planets.some((p) => p.slug === draft.levelSlug)

  return (
    <>
      <AdminPageHeader
        title={examTitle}
        breadcrumbs={[
          { label: 'Trang chủ', href: '/' },
          { label: 'Đề thi', href: ROUTES.ADMIN_EXAM },
          { label: examTitle },
        ]}
        actions={
          <>
            <button
              type="button"
              onClick={() => router.push(ROUTES.ADMIN_EXAM)}
              className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
            >
              <ArrowLeft className="size-4" aria-hidden="true" />
              Quay lại
            </button>
            {dirty && (
              <span className="text-admin-primary inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs font-medium">
                <span className="bg-admin-primary size-1.5 animate-pulse rounded-full" />
                Chưa lưu
              </span>
            )}
            <span className="hidden font-mono text-xs text-slate-500 sm:inline">
              {isNew ? '(mới)' : draft.id}
            </span>
            <button
              type="button"
              onClick={save}
              disabled={isSaving}
              className="bg-admin-primary hover:bg-admin-primary-hover inline-flex cursor-pointer items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white shadow-xs transition-colors disabled:opacity-50"
            >
              <Save className="size-4" aria-hidden="true" />
              {isSaving ? 'Đang lưu…' : 'Lưu đề'}
            </button>
          </>
        }
      />

      <div className="flex flex-col gap-5">
        {saveError && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
            {saveError}
          </div>
        )}

        {draftMeta && (
          <div className="flex flex-wrap items-center gap-3 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3">
            <p className="text-admin-primary min-w-[200px] flex-1 text-sm font-medium">
              Bạn có một bản nháp chưa lưu (
              {new Date(draftMeta.savedAt).toLocaleTimeString('vi-VN')}).
            </p>
            <button
              type="button"
              onClick={restoreDraft}
              className="bg-admin-primary hover:bg-admin-primary-hover cursor-pointer rounded-lg px-3.5 py-1.5 text-xs font-semibold text-white transition-colors"
            >
              Khôi phục
            </button>
            <button
              type="button"
              onClick={discardDraft}
              className="cursor-pointer rounded-lg border border-slate-300 bg-white px-3.5 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50"
            >
              Bỏ nháp
            </button>
          </div>
        )}

        {/* Metadata */}
        <section className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-sm font-semibold text-slate-900">Thông tin chung</h2>
            <label className="flex cursor-pointer items-center gap-2 text-xs font-medium text-slate-700">
              <input
                type="checkbox"
                checked={Boolean(draft.isDemo)}
                onChange={(e) => patchExam((d) => ({ ...d, isDemo: e.target.checked }))}
                className="accent-brand-primary"
              />
              Đề dùng thử (Demo cho khách)
            </label>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
            <div className="xl:col-span-2">
              <Field label="Tên đề thi">
                <TextInput
                  value={draft.name}
                  onChange={(v) => patchExam((d) => ({ ...d, name: v }))}
                  placeholder="VD: Movers Practice Test 1"
                />
              </Field>
            </div>
            <Field label="Hành tinh">
              <select
                aria-label="Hành tinh"
                value={draft.levelSlug}
                onChange={(e) => handleSelectPlanet(e.target.value)}
                className="focus:border-brand-primary focus:ring-brand-primary/20 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:ring-2 focus:outline-none"
              >
                {!hasCurrentPlanetInList && draft.levelSlug && (
                  <option value={draft.levelSlug}>
                    {draft.levelName || draft.levelSlug} ({draft.levelSlug})
                  </option>
                )}
                {planets.map((p) => (
                  <option key={p.id} value={p.slug}>
                    {p.name} ({p.slug})
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Tên cấp độ">
              <TextInput
                value={draft.levelName}
                onChange={(v) => patchExam((d) => ({ ...d, levelName: v }))}
                placeholder="VD: MOVERS"
              />
            </Field>
            <div className="grid grid-cols-2 gap-2">
              <Field label="Slug cấp độ">
                <TextInput
                  value={draft.levelSlug}
                  onChange={(v) => patchExam((d) => ({ ...d, levelSlug: v }))}
                  placeholder="VD: movers"
                />
              </Field>
              <Field label="Thứ tự">
                <NumberInput
                  value={draft.order ?? 0}
                  min={0}
                  onChange={(n) => patchExam((d) => ({ ...d, order: n }))}
                />
              </Field>
            </div>
          </div>
        </section>

        {/* Validation */}
        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
          <ValidationPanel exam={draft} />
        </section>

        {/* Structures */}
        <section className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-900">
              Cấu trúc đề thi ({structurePartCount(draft)} phần)
            </h2>
            <button
              type="button"
              onClick={addStructure}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50"
            >
              <Plus className="size-3.5" aria-hidden="true" />
              Thêm cấu trúc
            </button>
          </div>

          {draft.structures.map((structure, si) => (
            <div
              key={structure.id}
              className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs"
            >
              <div className="mb-4 flex flex-wrap items-end justify-between gap-4">
                <div className="grid max-w-md flex-1 grid-cols-2 gap-3">
                  <Field label="Tên cấu trúc">
                    <TextInput
                      value={structure.name}
                      onChange={(v) => patchStruct(si, (s) => ({ ...s, name: v }))}
                      placeholder="VD: Listening"
                    />
                  </Field>
                  <Field label="Thời gian (phút)">
                    <NumberInput
                      value={structure.minutes}
                      onChange={(n) => patchStruct(si, (s) => ({ ...s, minutes: n }))}
                    />
                  </Field>
                </div>
                <button
                  type="button"
                  onClick={() => removeStructure(si)}
                  disabled={draft.structures.length === 1}
                  className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-medium text-rose-700 transition-colors hover:bg-rose-100 disabled:pointer-events-none disabled:opacity-40"
                >
                  <Trash2 className="size-3.5" aria-hidden="true" />
                  Xóa
                </button>
              </div>

              {structure.parts.map((part, pi) => (
                <PartCard key={part.id} structIdx={si} partIdx={pi} />
              ))}

              <button
                type="button"
                onClick={() => addPart(si)}
                className="mt-3 w-full cursor-pointer rounded-lg border border-dashed border-slate-300 py-2 text-xs font-medium text-slate-600 transition-colors hover:border-slate-400 hover:bg-slate-50 hover:text-slate-900"
              >
                + Thêm phần
              </button>
            </div>
          ))}
        </section>
      </div>
    </>
  )
}
