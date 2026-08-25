import { examSchema } from "./schema"

import type { AnswerMap, Exam } from "@/types/exam"


const EXAMS_KEY = "ela.exams.v1"
const ATTEMPTS_KEY = "ela.attempts.v1"

export interface ExamAttempt {
  examId: string
  answers: AnswerMap
  grade: { correct: number; total: number }
  submittedAt: string
}

function isBrowser(): boolean {
  return typeof window !== "undefined"
}

export function loadExams(): Exam[] {
  if (!isBrowser()) return []
  try {
    const raw = window.localStorage.getItem(EXAMS_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return []
    return parsed.filter((item) => examSchema.safeParse(item).success) as Exam[]
  } catch {
    return []
  }
}

function persistExams(exams: Exam[]): void {
  if (!isBrowser()) return
  window.localStorage.setItem(EXAMS_KEY, JSON.stringify(exams))
}

export function saveExams(exams: Exam[]): void {
  persistExams(exams)
}

export function upsertExam(exam: Exam): Exam[] {
  const exams = loadExams()
  const idx = exams.findIndex((e) => e.id === exam.id)
  const next = idx >= 0 ? [...exams] : [...exams, exam]
  if (idx >= 0) next[idx] = exam
  persistExams(next)
  return next
}

export function deleteExam(id: string): Exam[] {
  const next = loadExams().filter((e) => e.id !== id)
  persistExams(next)
  return next
}

interface StoredAttempts {
  [examId: string]: ExamAttempt
}

export function saveAttempt(attempt: ExamAttempt): void {
  if (!isBrowser()) return
  const raw = window.localStorage.getItem(ATTEMPTS_KEY)
  let existing: StoredAttempts = {}
  if (raw) {
    try {
      existing = JSON.parse(raw) as StoredAttempts
    } catch {
      existing = {}
    }
  }
  existing[attempt.examId] = attempt
  window.localStorage.setItem(ATTEMPTS_KEY, JSON.stringify(existing))
}

export function loadAttempt(examId: string): ExamAttempt | null {
  if (!isBrowser()) return null
  try {
    const raw = window.localStorage.getItem(ATTEMPTS_KEY)
    if (!raw) return null
    const existing = JSON.parse(raw) as StoredAttempts
    return existing[examId] ?? null
  } catch {
    return null
  }
}

export function exportExams(exams: Exam[], filename = "ela-exams.json"): void {
  if (!isBrowser()) return
  const blob = new Blob([JSON.stringify(exams, null, 2)], {
    type: "application/json",
  })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement("a")
  anchor.href = url
  anchor.download = filename
  document.body.appendChild(anchor)
  anchor.click()
  document.body.removeChild(anchor)
  URL.revokeObjectURL(url)
}

export async function importExams(file: File): Promise<{ added: number; skipped: number }> {
  const text = await file.text()
  let parsed: unknown
  try {
    parsed = JSON.parse(text)
  } catch {
    return { added: 0, skipped: 1 }
  }
  const list = Array.isArray(parsed) ? parsed : [parsed]
  const valid: Exam[] = []
  let skipped = 0
  for (const item of list) {
    const check = examSchema.safeParse(item)
    if (check.success) valid.push(check.data)
    else skipped += 1
  }
  const existing = loadExams()
  const merged = new Map<string, Exam>()
  for (const e of existing) merged.set(e.id, e)
  for (const e of valid) merged.set(e.id, e)
  persistExams(Array.from(merged.values()))
  return { added: valid.length, skipped }
}