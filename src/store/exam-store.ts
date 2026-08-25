"use client"

import { create } from "zustand"

import {
  deleteExam,
  exportExams,
  importExams,
  loadExams,
  upsertExam,
} from "@/lib/exam"
import type { Exam } from "@/types/exam"

interface ExamStoreState {
  exams: Exam[]
  hydrated: boolean
  hydrate: () => void
  add: (exam: Exam) => void
  update: (exam: Exam) => void
  remove: (id: string) => void
  exportAll: () => void
  importFromFile: (file: File) => Promise<{ added: number; skipped: number }>
}

export const useExamStore = create<ExamStoreState>((set, get) => ({
  exams: [],
  hydrated: false,

  hydrate: () => {
    if (get().hydrated) return
    set({ exams: loadExams(), hydrated: true })
  },

  add: (exam) => {
    const exams = upsertExam(exam)
    set({ exams })
  },

  update: (exam) => {
    const exams = upsertExam(exam)
    set({ exams })
  },

  remove: (id) => {
    const exams = deleteExam(id)
    set({ exams })
  },

  exportAll: () => {
    exportExams(get().exams)
  },

  importFromFile: async (file) => {
    const result = await importExams(file)
    set({ exams: loadExams(), hydrated: true })
    return result
  },
}))