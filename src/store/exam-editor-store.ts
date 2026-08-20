"use client"

import { create } from "zustand"

import type { Exam, ExamPart, ExamStructure } from "@/types/exam"

interface ExamEditorState {
  draft: Exam | null
  baseline: string // JSON của bản đã lưu — để tính dirty
  jsonTexts: Record<string, string> // buffer JSON theo partId
  jsonMode: Record<string, boolean> // bật/off "chế độ nâng cao" theo partId
  init: (exam: Exam) => void
  reset: () => void
  patchExam: (fn: (d: Exam) => Exam) => void
  patchStruct: (structIdx: number, fn: (s: ExamStructure) => ExamStructure) => void
  patchPart: (structIdx: number, partIdx: number, fn: (p: ExamPart) => ExamPart) => void
  setJsonText: (partId: string, text: string) => void
  setJsonMode: (partId: string, on: boolean) => void
}

export const useExamEditorStore = create<ExamEditorState>((set) => ({
  draft: null,
  baseline: "",
  jsonTexts: {},
  jsonMode: {},

  init: (exam) =>
    set({
      draft: exam,
      baseline: JSON.stringify(exam),
      jsonTexts: Object.fromEntries(
        exam.structures.flatMap((s) =>
          s.parts.map((p) => [p.id, JSON.stringify(p.questions ?? [], null, 2)] as const),
        ),
      ),
      jsonMode: Object.fromEntries(
        exam.structures.flatMap((s) => s.parts.map((p) => [p.id, false] as const)),
      ),
    }),

  reset: () => set({ draft: null, baseline: "", jsonTexts: {}, jsonMode: {} }),

  patchExam: (fn) => set((st) => (st.draft ? { draft: fn(st.draft) } : st)),

  patchStruct: (structIdx, fn) =>
    set((st) =>
      st.draft
        ? {
            draft: {
              ...st.draft,
              structures: st.draft.structures.map((s, i) => (i === structIdx ? fn(s) : s)),
            },
          }
        : st,
    ),

  patchPart: (structIdx, partIdx, fn) =>
    set((st) => {
      if (!st.draft) return st
      const patch = (s: ExamStructure, si: number): ExamStructure =>
        si === structIdx
          ? { ...s, parts: s.parts.map((p, pi) => (pi === partIdx ? fn(p) : p)) }
          : s
      return { draft: { ...st.draft, structures: st.draft.structures.map(patch) } }
    }),

  setJsonText: (partId, text) =>
    set((st) => ({ jsonTexts: { ...st.jsonTexts, [partId]: text } })),

  setJsonMode: (partId, on) =>
    set((st) => ({ jsonMode: { ...st.jsonMode, [partId]: on } })),
}))

export function selectDirty(st: ExamEditorState): boolean {
  return st.draft !== null && JSON.stringify(st.draft) !== st.baseline
}