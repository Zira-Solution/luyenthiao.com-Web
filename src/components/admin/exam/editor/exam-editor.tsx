"use client"

import { ArrowLeft, Code2, Plus, Save, Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useState, type ChangeEvent, type ReactElement } from "react"

import { PART_RENDERERS } from "@/components/exam/parts"
import { ROUTES } from "@/constants"
import {
  examSchema,
  type Exam,
  type ExamPart,
  type ExamQuestion,
  type ExamStructure,
  type PartKind,
} from "@/lib/exam"
import {
  blankExam,
  blankPart,
  blankStructure,
  PART_KIND_LABEL,
  PART_KINDS,
  structurePartCount,
} from "@/lib/exam/blank"
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

  const [draft, setDraft] = useState<Exam | null>(null)
  const [questionJsons, setQuestionJsons] = useState<Record<string, string>>({})
  const [saveError, setSaveError] = useState<string | null>(null)

  useEffect(() => {
    hydrate()
    let initial: Exam | null = null
    if (isNew) {
      initial = blankExam()
    } else {
      const found = useExamStore.getState().exams.find((e) => e.id === examId)
      if (found) initial = JSON.parse(JSON.stringify(found))
    }
    if (initial) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- Nạp draft ban đầu từ params / localStorage khi mở editor
      setDraft(initial)
      const jsons: Record<string, string> = {}
      initial.structures.forEach((s) => s.parts.forEach((p) => {
        jsons[p.id] = JSON.stringify(p.questions ?? [], null, 2)
      }))
      setQuestionJsons(jsons)
    }
     
  }, [examId, isNew, hydrate])

  if (!draft) {
    return (
      <div className="min-h-screen bg-dashboard-bg font-sans flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-white" />
      </div>
    )
  }

  const patchExam = (fn: (d: Exam) => Exam) => setDraft((prev) => (prev ? fn(prev) : prev))

  const patchStruct = (structIdx: number, fn: (s: ExamStructure) => ExamStructure) =>
    patchExam((d) => ({
      ...d,
      structures: d.structures.map((s, i) => (i === structIdx ? fn(s) : s)),
    }))

  const patchPart = (
    structIdx: number,
    partIdx: number,
    fn: (p: ExamPart) => ExamPart,
  ) =>
    patchStruct(structIdx, (s) => ({
      ...s,
      parts: s.parts.map((p, i) => (i === partIdx ? fn(p) : p)),
    }))

  const addStructure = () =>
    patchExam((d) => ({ ...d, structures: [...d.structures, blankStructure(d.structures.length)] }))

  const removeStructure = (idx: number) =>
    patchExam((d) => ({ ...d, structures: d.structures.filter((_, i) => i !== idx) }))

  const addPart = (structIdx: number) =>
    patchStruct(structIdx, (s) => ({ ...s, parts: [...s.parts, blankPart("gapfill")] }))

  const removePart = (structIdx: number, part: ExamPart) =>
    patchStruct(structIdx, (s) => ({ ...s, parts: s.parts.filter((p) => p.id !== part.id) }))

  const changePartKind = (structIdx: number, partIdx: number, kind: PartKind) => {
    const current = draft.structures[structIdx]?.parts?.[partIdx]
    if (!current || current.kind === kind) return
    if (!window.confirm("Đổi loại phần sẽ xóa câu hỏi hiện tại. Tiếp tục?")) return
    const newPart = { ...blankPart(kind), id: current.id, title: current.title }
    patchExam((d) => ({
      ...d,
      structures: d.structures.map((s, i) =>
        i === structIdx
          ? { ...s, parts: s.parts.map((p, pi) => (pi === partIdx ? newPart : p)) }
          : s,
      ),
    }))
    const nextParts = newPart.questions ?? []
    setQuestionJsons((prev) => ({ ...prev, [newPart.id]: JSON.stringify(nextParts, null, 2) }))
  }

  const save = () => {
    setSaveError(null)
    if (!draft) return

    let parseError: string | null = null
    const finalPartsPerStruct: ExamStructure[] = draft.structures.map((s) => {
      const parts: ExamPart[] = s.parts.map((p) => {
        const raw = questionJsons[p.id]?.trim()
        if (!raw) {
          parseError = `Phần "${p.title || p.id}" chưa có dữ liệu câu hỏi.`
          return p
        }
        try {
          return { ...p, questions: JSON.parse(raw) as ExamQuestion[] }
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
      setSaveError(`Dữ liệu không hợp lệ: ${first?.path.join(".")} ${first?.message}`)
      return
    }
    if (isNew) addExam(final)
    else updateExam(final)
    router.push(ROUTES.ADMIN_EXAM)
  }

  const setQuestionJson = (partId: string, value: string) =>
    setQuestionJsons((prev) => ({ ...prev, [partId]: value }))

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
          <div className="flex items-center gap-2">
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
                <div key={part.id} className="flex-1">
                  <PartCard
                    part={part}
                    json={questionJsons[part.id] ?? ""}
                    onJsonChange={(v) => setQuestionJson(part.id, v)}
                    onTitleChange={(v) => patchPart(si, pi, (p) => ({ ...p, title: v }))}
                    onKindChange={(k) => changePartKind(si, pi, k)}
                    onRemove={() => removePart(si, part)}
                  />
                </div>
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

function PartCard({
  part,
  json,
  onJsonChange,
  onTitleChange,
  onKindChange,
  onRemove,
}: {
  part: ExamPart
  json: string
  onJsonChange: (v: string) => void
  onTitleChange: (v: string) => void
  onKindChange: (k: PartKind) => void
  onRemove: () => void
}): ReactElement {
  const [expanded, setExpanded] = useState(false)
  return (
    <div className="mt-3 rounded-2xl border border-white/10 bg-black/10 overflow-hidden">
      <div className="flex flex-wrap items-center gap-3 px-4 py-3">
        <span className="px-2.5 py-1 rounded-lg bg-brand-primary text-white font-black text-[11px] uppercase">
          Phần
        </span>
        <select
          value={part.kind}
          onChange={(e) => onKindChange(e.target.value as PartKind)}
          className="bg-white/10 text-white font-bold text-sm rounded-lg px-3 py-1.5 focus:outline-none border border-white/10"
        >
          {PART_KINDS.map((k) => (
            <option key={k} value={k} className="text-slate-900">
              {PART_KIND_LABEL[k]}
            </option>
          ))}
        </select>
        <input
          value={part.title}
          onChange={(e) => onTitleChange(e.target.value)}
          placeholder="Tiêu đề phần (VD: Nghe & nối tên)"
          className="flex-1 min-w-[180px] bg-transparent border-b border-white/20 focus:border-brand-primary focus:outline-none text-white font-semibold text-sm py-1.5 placeholder:text-white/30"
        />
        <button
          onClick={() => setExpanded((e) => !e)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white font-bold text-xs uppercase transition-colors cursor-pointer"
        >
          <Code2 className="w-3.5 h-3.5" />
          {expanded ? "Ẩn" : "Câu hỏi"}
        </button>
        <button
          onClick={onRemove}
          className="p-1.5 rounded-lg bg-white/5 hover:bg-game-danger-to text-white/60 hover:text-white transition-colors cursor-pointer"
          title="Xóa phần"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {expanded && (
        <div className="px-4 pb-4 space-y-3">
          <p className="text-white/40 text-xs font-semibold">
            Mảng <code>questions</code> dạng JSON — mỗi phần tử:{" "}
            <code className="text-white/70">{"{ id, isExample, title, details[ { id, label, correctAnswers, ... } ] }"}</code>
          </p>
          <textarea
            value={json}
            onChange={(e) => onJsonChange(e.target.value)}
            spellCheck={false}
            className="w-full h-56 bg-slate-900/70 text-white/90 font-mono text-xs rounded-xl border border-white/10 p-3 focus:border-brand-primary focus:outline-none resize-y"
          />
          <PreviewPart part={part} json={json} />
        </div>
      )}
    </div>
  )
}

function PreviewPart({ part, json }: { part: ExamPart; json: string }): ReactElement {
  const trimmed = json.trim()
  let parsed: ExamQuestion[] | null = null
  let error: string | null = null
  if (!trimmed) {
    error = "Thêm mảng questions để xem trước."
  } else {
    try {
      const v = JSON.parse(trimmed) as unknown
      if (Array.isArray(v)) parsed = v as ExamQuestion[]
      else error = "questions phải là một mảng JSON."
    } catch {
      error = "JSON chưa hợp lệ — chỉnh đúng mới xem trước được."
    }
  }

  const Renderer = PART_RENDERERS[part.kind]
  if (parsed && Renderer) {
    const previewPart: ExamPart = { ...part, questions: parsed }
    return (
      <div>
        <p className="text-white/40 text-xs font-bold uppercase mb-2">Xem trước</p>
        <div className="bg-white rounded-2xl p-4 max-h-[420px] overflow-auto text-slate-900">
          <Renderer part={previewPart} structureName="Preview" answers={{}} onChange={() => {}} />
        </div>
      </div>
    )
  }

  return <p className="text-amber-400 text-xs font-semibold">{error}</p>
}

function Field({ label, children }: { label: string; children: React.ReactNode }): ReactElement {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-white/60 text-[11px] font-black uppercase tracking-wide">{label}</span>
      {children}
    </label>
  )
}

function TextInput({
  value,
  onChange,
  placeholder,
}: {
  value: string
  onChange: (v: string) => void
  placeholder?: string
}): ReactElement {
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="bg-white/10 text-white font-semibold text-sm rounded-xl px-3 py-2.5 focus:outline-none border border-transparent focus:border-brand-primary placeholder:text-white/30"
    />
  )
}

function NumberInput({
  value,
  onChange,
}: {
  value: number
  onChange: (n: number) => void
}): ReactElement {
  return (
    <input
      type="number"
      min={1}
      value={value}
      onChange={(e: ChangeEvent<HTMLInputElement>) =>
        onChange(parseInt(e.target.value, 10) || 1)
      }
      className="bg-white/10 text-white font-semibold text-sm rounded-xl px-3 py-2.5 focus:outline-none border border-transparent focus:border-brand-primary"
    />
  )
}