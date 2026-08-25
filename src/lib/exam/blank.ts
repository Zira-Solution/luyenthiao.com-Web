import type { Exam, ExamPart, ExamQuestion, ExamStructure, PartKind } from "@/types/exam"

export function createId(prefix: string): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return `${prefix}_${crypto.randomUUID()}`
  }
  return `${prefix}_${Date.now()}_${Math.floor(Math.random() * 1e6)}`
}

export function blankQuestion(): ExamQuestion {
  return {
    id: createId("q"),
    isExample: false,
    title: "",
    details: [],
  }
}

export function blankPart(kind: PartKind = "gapfill"): ExamPart {
  return {
    id: createId("p"),
    kind,
    title: "",
    questions: [blankQuestion()],
  }
}

export function blankStructure(index: number): ExamStructure {
  return {
    id: createId("s"),
    name: index === 0 ? "Listening" : "Reading - Writing",
    minutes: index === 0 ? 35 : 30,
    parts: [blankPart("gapfill")],
  }
}

export function blankExam(): Exam {
  return {
    id: createId("exam"),
    name: "",
    levelSlug: "movers",
    levelName: "MOVERS",
    structures: [blankStructure(0), blankStructure(1)],
  }
}

export const PART_KIND_LABEL: Record<PartKind, string> = {
  dragdrop: "Kéo & thả",
  matching: "Nối từ",
  multichoice: "Trắc nghiệm",
  gapfill: "Điền từ",
}

export const PART_KINDS = Object.keys(PART_KIND_LABEL) as PartKind[]

export function structurePartCount(exam: Exam): number {
  return exam.structures.reduce((acc, s) => acc + s.parts.length, 0)
}