export type PartKind = "dragdrop" | "matching" | "multichoice" | "gapfill"

export interface Box {
  left: string
  top: string
  width: string
  height: string
}

export interface WordBoxItem {
  label: string
  imageId?: string | null
}

export interface ExamDetail {
  id: string
  label: string
  box?: Box | null
  imageUrl?: string | null
  /** Nội dung hiển thị cho lựa chọn text-based (multichoice RW2). */
  text?: string | null
  correctAnswers: string[]
  options?: string[]
}

export interface ExamQuestion {
  id: string
  isExample: boolean
  title?: string | null
  promptHtml?: string | null
  choices?: WordBoxItem[]
  correctLabel?: string | null
  details: ExamDetail[]
}

export interface ExamPart {
  id: string
  kind: PartKind
  title: string
  audioUrl?: string | null
  imageUrl?: string | null
  wordBox?: WordBoxItem[]
  extraHtml?: string | null
  questions: ExamQuestion[]
}

export interface ExamStructure {
  id: string
  name: string
  minutes: number
  parts: ExamPart[]
}

export interface Exam {
  id: string
  name: string
  levelSlug: string
  levelName: string
  structures: ExamStructure[]
}

/**
 * Đáp án người dùng — key = detailId (dragdrop/gapfill/matching), questionId (multichoice).
 * Format giữ nguyên từ bản cũ để tương thích localStorage `ela.attempts.v1`.
 */
export type AnswerMap = Record<string, Record<string, string>>