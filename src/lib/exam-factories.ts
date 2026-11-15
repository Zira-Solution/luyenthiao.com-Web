import { createId } from "@/lib/exam-blank"
import type { ExamDetail, ExamQuestion, PartKind } from "@/types/exam"

export function blankDetail(kind: PartKind, label: string): ExamDetail {
  const detail: ExamDetail = { id: createId("d"), label, correctAnswers: [] }
  if (kind === "dragdrop") detail.box = null
  return detail
}

/** Question mới đúng theo kind — riêng multichoice thêm correctLabel như schema. */
export function defaultQuestion(kind: PartKind): ExamQuestion {
  const base: ExamQuestion = {
    id: createId("q"),
    isExample: false,
    title: "",
    details: [],
  }
  if (kind === "multichoice") base.correctLabel = null
  return base
}

const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("")

export function nextLetter(used: string[]): string {
  return LETTERS.find((l) => !used.includes(l)) ?? "Z"
}