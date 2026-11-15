export { gradeExam, type GradeResult, type DetailGrade } from "./exam-grade"
export {
  normalizeExam,
  type RawCheckPoint,
} from "./exam-normalize"
export { examSchema } from "@/schemas/exam"
export { getColorName, isColorCode } from "./exam-color"
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
} from "./exam-storage"

export type { Exam, ExamDetail, ExamPart, ExamQuestion, ExamStructure, PartKind } from "@/types/exam"