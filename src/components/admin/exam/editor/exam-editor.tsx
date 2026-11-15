"use client"

import { ArrowLeft, Plus, Save, Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useState, type ReactElement } from "react"

import { Field, NumberInput, TextInput } from "./editor-field"
import { PartCard } from "./part-card"
import { ValidationPanel } from "./validation-panel"

import { ROUTES } from "@/constants"
import { clearDraft, loadDraft, saveDraft } from "@/lib/admin-draft"
import { examSchema, type Exam, type ExamPart, type ExamStructure } from "@/lib/exam"
import { blankExam, blankPart, blankStructure, structurePartCount } from "@/lib/exam-blank"
import { selectDirty, useExamEditorStore } from "@/store/exam-editor-store"
import { useExamStore } from "@/store/exam-store"


interface ExamEditorProps {
  examId: string
}

export function ExamEditor({ examId }: ExamEditorProps): ReactElement {
  const router = useRouter()
  const isNew = examId === "new"

  const hydrate = useExamStore((s) => s.hydrate)
  const addExam = useExamStore((s) => s.add)
  const updateExam = useExamStore((s) => s.update)

  const draft = useExamEditorStore((s) => s.draft)
  const init = useExamEditorStore((s) => s.init)
  const reset = useExamEditorStore((s) => s.reset)
  const patchExam = useExamEditorStore((s) => s.patchExam)
  const patchStruct = useExamEditorStore((s) => s.patchStruct)
  const dirty = useExamEditorStore(selectDirty)

  const [saveError, setSaveError] = useState<string | null>(null)
  const [draftMeta, setDraftMeta] = useState<{ savedAt: number } | null>(null)

  const draftKey = isNew ? "new" : examId
  const draftSnapshot = useExamEditorStore((s) => s.draft)

  // Autosave — ghi bản nháp sau 400ms im lặng
  useEffect(() => {
    if (!draftSnapshot) return
    const t = setTimeout(() => {
      saveDraft(draftKey, draftSnapshot)
    }, 400)
    return () => clearTimeout(t)
  }, [draftSnapshot, draftKey])

  useEffect(() => {
    hydrate()
    const existing = loadDraft(draftKey)
    // eslint-disable-next-line react-hooks/set-state-in-effect -- restore banner cần biết trạng thái nháp ở lúc mount
    if (existing) setDraftMeta({ savedAt: existing.savedAt })
    let initial: Exam | null = null
    if (isNew) {
      initial = blankExam()
    } else {
      const found = useExamStore.getState().exams.find((e) => e.id === examId)
      if (found) initial = JSON.parse(JSON.stringify(found)) as Exam
    }
    if (initial) init(initial)
    return () => {
      reset()
      setDraftMeta(null)
    }
  }, [examId, isNew, hydrate, init, reset, draftKey])

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

  if (!draft) {
    return (
      <div className="min-h-screen bg-dashboard-bg font-sans flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-white" />
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
    patchStruct(structIdx, (s) => ({ ...s, parts: [...s.parts, blankPart("gapfill")] }))

  const save = () => {
    setSaveError(null)
    if (!draft) return

    const st = useExamEditorStore.getState()
    const jsonTexts = st.jsonTexts
    const jsonMode = st.jsonMode

    let parseError: string | null = null
    const finalPartsPerStruct: ExamStructure[] = draft.structures.map((s) => {
      const parts: ExamPart[] = s.parts.map((p) => {
        // Chỉ áp dụng buffer JSON cho phần đang bật "chế độ nâng cao"
        if (!jsonMode[p.id]) return p
        const raw = jsonTexts[p.id]?.trim()
        if (!raw) {
          parseError = `Phần "${p.title || p.id}" chưa có dữ liệu câu hỏi.`
          return p
        }
        try {
          return { ...p, questions: JSON.parse(raw) as ExamPart["questions"] }
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
      setSaveError(
        `Dữ liệu không hợp lệ: ${first?.path.join(".")} ${first?.message}`,
      )
      return
    }
    if (isNew) addExam(final)
    else updateExam(final)
    clearDraft(draftKey)
    setDraftMeta(null)
    router.push(ROUTES.ADMIN_EXAM)
  }

  return (
    <div className="min-h-screen bg-dashboard-bg font-sans">
      <header className="border-b border-white/10 bg-topbar-login-bg/80 backdrop-blur sticky top-0 z-20">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
          <button
            onClick={() => router.push(ROUTES.ADMIN_EXAM)}
            className="inline-flex items-center gap-2 text-white/70 hover:text-white font-black text-sm uppercase transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            {isNew ? "Tạo đề mới" : "Sửa đề thi"}
          </button>
          <div className="flex items-center gap-3">
            {dirty && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-primary/20 border border-brand-primary/40 px-3 py-1 text-brand-primary text-xs font-black uppercase">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-primary animate-pulse" />
                Chưa lưu
              </span>
            )}
            <span className="text-white/40 text-xs font-mono hidden sm:inline">
              {isNew ? "(mới)" : draft.id}
            </span>
            <button
              onClick={save}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-game-cta-to hover:bg-game-cta-from text-white font-black text-sm uppercase transition-colors cursor-pointer shadow-lg"
            >
              <Save className="w-4 h-4" />
              Lưu đề
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8 flex flex-col gap-6">
        {saveError && (
          <div className="bg-game-danger-to/20 border border-game-danger-from rounded-2xl px-4 py-3 text-white font-bold text-sm">
            {saveError}
          </div>
        )}

        {draftMeta && (
          <div className="flex flex-wrap items-center gap-3 bg-brand-primary/15 border border-brand-primary/40 rounded-2xl px-4 py-3">
            <p className="text-brand-primary text-sm font-bold flex-1 min-w-[200px]">
              Bạn có một bản nháp chưa lưu ({new Date(draftMeta.savedAt).toLocaleTimeString("vi-VN")}).
            </p>
            <button
              onClick={restoreDraft}
              className="px-4 py-2 rounded-xl bg-brand-primary text-white font-black text-xs uppercase transition-colors cursor-pointer hover:opacity-90"
            >
              Khôi phục
            </button>
            <button
              onClick={discardDraft}
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs uppercase transition-colors cursor-pointer"
            >
              Bỏ nháp
            </button>
          </div>
        )}

        {/* Metadata */}
        <section className="bg-white/5 border border-white/10 rounded-3xl p-6 flex flex-col gap-4">
          <h2 className="text-white font-black uppercase tracking-wide text-sm">Thông tin chung</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Field label="Tên đề thi">
              <TextInput
                value={draft.name}
                onChange={(v) => patchExam((d) => ({ ...d, name: v }))}
                placeholder="VD: Movers Practice Test 1"
              />
            </Field>
            <Field label="Tên cấp độ">
              <TextInput
                value={draft.levelName}
                onChange={(v) => patchExam((d) => ({ ...d, levelName: v }))}
                placeholder="VD: MOVERS"
              />
            </Field>
            <Field label="Slug cấp độ">
              <TextInput
                value={draft.levelSlug}
                onChange={(v) => patchExam((d) => ({ ...d, levelSlug: v }))}
                placeholder="VD: movers"
              />
            </Field>
          </div>
        </section>

        {/* Structures */}
        <section className="bg-white/5 border border-white/10 rounded-3xl p-6">
          <ValidationPanel exam={draft} />
        </section>

        <section className="flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <h2 className="text-white font-black uppercase tracking-wide text-sm">
              Cấu trúc đề thi ({structurePartCount(draft)} phần)
            </h2>
            <button
              onClick={addStructure}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-black text-xs uppercase transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Thêm cấu trúc
            </button>
          </div>

          {draft.structures.map((structure, si) => (
            <div key={structure.id} className="bg-white/5 border border-white/10 rounded-3xl p-6">
              <div className="flex items-center justify-between gap-4 mb-4">
                <div className="grid grid-cols-2 gap-3 flex-1 max-w-md">
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
                  onClick={() => removeStructure(si)}
                  disabled={draft.structures.length === 1}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white/5 hover:bg-game-danger-to text-white/70 hover:text-white font-bold text-xs uppercase transition-colors cursor-pointer disabled:opacity-30 disabled:pointer-events-none"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Xóa
                </button>
              </div>

              {structure.parts.map((part, pi) => (
                <PartCard key={part.id} structIdx={si} partIdx={pi} />
              ))}

              <button
                onClick={() => addPart(si)}
                className="mt-3 w-full py-2.5 rounded-xl border border-dashed border-white/20 hover:border-white/40 text-white/60 hover:text-white font-bold text-xs uppercase transition-colors cursor-pointer"
              >
                + Thêm phần
              </button>
            </div>
          ))}
        </section>
      </main>
    </div>
  )
}