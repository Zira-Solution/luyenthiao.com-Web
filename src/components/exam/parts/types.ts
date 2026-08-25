import type { ComponentType } from "react"

import type { DetailGrade } from "@/lib/exam"
import type { AnswerMap, ExamPart } from "@/types/exam"

export interface ReviewContext {
  getGrade(key: string): DetailGrade | undefined
  partScore?: { correct: number; total: number }
}

export interface PartRendererProps {
  part: ExamPart
  structureName: string
  answers: AnswerMap
  onChange: (partId: string, key: string, value: string | null) => void
  review?: ReviewContext
}

export type PartRenderer = ComponentType<PartRendererProps>