export { gradeExam, type GradeResult, type DetailGrade } from "./grade"
export {
  normalizeExam,
  type RawCheckPoint,
} from "./normalize"
export { examSchema } from "./schema"
export { getColorName, isColorCode } from "./color"
export {
  loadExams,
  saveExams,
  upsertExam,
  deleteExam,
  saveAttempt,
  loadAttempt,
  exportExams,
  importExams,
  type ExamAttempt,
} from "./storage"

export type { Exam, ExamDetail, ExamPart, ExamQuestion, ExamStructure, PartKind } from "@/types/exam"