import type { Exam } from "@/lib/exam"
import { examSchema } from "@/lib/exam"

const DRAFT_KEY_PREFIX = "ela.admin-exam-draft"

interface DraftRecord {
  examKey: string
  savedAt: number
  exam: Exam
}

function draftKey(examKey: string): string {
  return `${DRAFT_KEY_PREFIX}.${examKey}`
}

export function saveDraft(examKey: string, exam: Exam): void {
  try {
    const record: DraftRecord = { examKey, savedAt: Date.now(), exam }
    localStorage.setItem(draftKey(examKey), JSON.stringify(record))
  } catch {
    // bỏ qua (quota / private mode)
  }
}

export function loadDraft(examKey: string): DraftRecord | null {
  try {
    const raw = localStorage.getItem(draftKey(examKey))
    if (!raw) return null
    const parsed = JSON.parse(raw) as unknown as Partial<DraftRecord>
    if (!parsed || parsed.examKey !== examKey || !parsed.exam) return null
    const safe = examSchema.safeParse(parsed.exam)
    if (!safe.success) return null
    return { examKey, savedAt: parsed.savedAt ?? Date.now(), exam: safe.data }
  } catch {
    return null
  }
}

export function clearDraft(examKey: string): void {
  try {
    localStorage.removeItem(draftKey(examKey))
  } catch {
    // noop
  }
}