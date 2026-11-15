"use client"

import { Code2, Trash2 } from "lucide-react"
import { useState, type ReactElement } from "react"


import { PartFormDragdrop } from "./form/part-form-dragdrop"
import { PartFormGapfill } from "./form/part-form-gapfill"
import { PartFormMatching } from "./form/part-form-matching"
import { PartFormMultichoice } from "./form/part-form-multichoice"
import { PartSettingsFields } from "./form/part-settings-fields"
import { PartPreview } from "./part-preview"
import { QuestionsJsonEditor } from "./questions-json-editor"

import { blankPart, PART_KIND_LABEL, PART_KINDS } from "@/lib/exam-blank"
import { useExamEditorStore } from "@/store/exam-editor-store"
import type { PartKind } from "@/types/exam"

interface PartCardProps {
  structIdx: number
  partIdx: number
}

export function PartCard({ structIdx, partIdx }: PartCardProps): ReactElement {
  const draft = useExamEditorStore((s) => s.draft)
  const patchPart = useExamEditorStore((s) => s.patchPart)
  const patchStruct = useExamEditorStore((s) => s.patchStruct)

  const part = draft?.structures[structIdx]?.parts[partIdx]
  const [expanded, setExpanded] = useState(false)

  if (!part) return <div />

  const changePartKind = (kind: PartKind) => {
    if (part.kind === kind) return
    if (!window.confirm("Đổi loại phần sẽ xóa câu hỏi hiện tại. Tiếp tục?")) return
    const newPart = { ...blankPart(kind), id: part.id, title: part.title }
    patchPart(structIdx, partIdx, () => newPart)
    useExamEditorStore.getState().setJsonMode(newPart.id, false)
    useExamEditorStore.getState().setJsonText(
      newPart.id,
      JSON.stringify(newPart.questions ?? [], null, 2),
    )
  }

  const removePart = () =>
    patchStruct(structIdx, (s) => ({ ...s, parts: s.parts.filter((p) => p.id !== part.id) }))

  return (
    <div className="mt-3 rounded-2xl border border-white/10 bg-black/10 overflow-hidden">
      <div className="flex flex-wrap items-center gap-3 px-4 py-3">
        <span className="px-2.5 py-1 rounded-lg bg-brand-primary text-white font-black text-[11px] uppercase">
          Phần
        </span>
        <select
          value={part.kind}
          onChange={(e) => changePartKind(e.target.value as PartKind)}
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
          onChange={(e) =>
            patchPart(structIdx, partIdx, (p) => ({ ...p, title: e.target.value }))
          }
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
          onClick={removePart}
          className="p-1.5 rounded-lg bg-white/5 hover:bg-game-danger-to text-white/60 hover:text-white transition-colors cursor-pointer"
          title="Xóa phần"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {expanded && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 px-4 py-4">
          <div className="flex flex-col min-w-0">
            <PartSettingsFields structIdx={structIdx} partIdx={partIdx} />
            <KindForm structIdx={structIdx} partIdx={partIdx} />
            <QuestionsJsonEditor structIdx={structIdx} partIdx={partIdx} />
          </div>

          <div className="xl:sticky xl:top-24 self-start w-full">
            <div className="flex items-center justify-between mb-2">
              <p className="text-white/40 text-xs font-bold uppercase">Xem trước</p>
            </div>
            <PartPreview part={part} structureName={draft?.structures[structIdx]?.name ?? ""} />
          </div>
        </div>
      )}
    </div>
  )
}

function KindForm({ structIdx, partIdx }: { structIdx: number; partIdx: number }): ReactElement {
  const draft = useExamEditorStore((s) => s.draft)
  const part = draft?.structures[structIdx]?.parts[partIdx]
  if (!part) return <div />
  switch (part.kind) {
    case "gapfill":
      return <PartFormGapfill structIdx={structIdx} partIdx={partIdx} />
    case "multichoice":
      return <PartFormMultichoice structIdx={structIdx} partIdx={partIdx} />
    case "matching":
      return <PartFormMatching structIdx={structIdx} partIdx={partIdx} />
    case "dragdrop":
      return <PartFormDragdrop structIdx={structIdx} partIdx={partIdx} />
  }
}