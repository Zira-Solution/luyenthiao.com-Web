import type { Exam, ExamPart } from "@/lib/exam"

export interface ValidationIssue {
  key: string
  kind: ExamPart["kind"] | null
  message: string
}

const nonEmpty = (v: string | null | undefined): string | null =>
  !v || !v.trim() ? "bắt buộc" : null

export function validateExam(exam: Exam): ValidationIssue[] {
  const issues: ValidationIssue[] = []

  if (nonEmpty(exam.name)) issues.push({ key: "exam.name", kind: null, message: "Tên đề thi bắt buộc." })
  if (nonEmpty(exam.levelName)) issues.push({ key: "exam.levelName", kind: null, message: "Tên cấp độ bắt buộc." })
  if (nonEmpty(exam.levelSlug)) issues.push({ key: "exam.levelSlug", kind: null, message: "Slug cấp độ bắt buộc." })
  if (exam.structures.length === 0) issues.push({ key: "exam.structures", kind: null, message: "Đề thi cần ít nhất một cấu trúc." })

  exam.structures.forEach((s, si) => {
    if (nonEmpty(s.name)) issues.push({ key: `s${si}.name`, kind: null, message: `Cấu trúc "${s.name || si + 1}": thiếu tên tên cấu trúc.` })
    if (s.minutes <= 0) issues.push({ key: `s${si}.minutes`, kind: null, message: `Cấu trúc "${s.name || si + 1}": thời gian phải lớn hơn 0.` })
    if (s.parts.length === 0) issues.push({ key: `s${si}.parts`, kind: null, message: `Cấu trúc "${s.name || si + 1}": chưa có phần nào.` })

    s.parts.forEach((p) => {
      const partLabel = p.title || "phần chưa đặt tên"
      if (nonEmpty(p.title)) issues.push({ key: `${p.id}.title`, kind: p.kind, message: `Phần "${partLabel}": thiếu tiêu đề.` })
      if (p.kind === "gapfill" || p.kind === "multichoice") {
        if (nonEmpty(p.imageUrl)) issues.push({ key: `${p.id}.image`, kind: p.kind, message: `Phần "${partLabel}": thiếu ảnh nền.` })
      }
      if (p.kind === "dragdrop" || p.kind === "matching") {
        if (nonEmpty(p.audioUrl)) issues.push({ key: `${p.id}.audio`, kind: p.kind, message: `Phần "${partLabel}": thiếu audio.` })
      }

      const qs = p.questions
      if (qs.length === 0) {
        issues.push({ key: `${p.id}.questions`, kind: p.kind, message: `Phần "${partLabel}": chưa có câu hỏi.` })
        return
      }

      if (p.kind === "dragdrop" || p.kind === "matching") {
        const main = qs.find((q) => !q.isExample) ?? qs[0]
        const choices = (main?.choices ?? []).map((c) => c.label)
        if (choices.length === 0) issues.push({ key: `${p.id}.choices`, kind: p.kind, message: `Phần "${partLabel}": các thẻ chưa khai báo đáp án.` })
        main?.details.forEach((d) => {
          const has = (d.correctAnswers ?? []).some((a) => choices.includes(a))
          if (!has) issues.push({ key: `${p.id}.d_${d.id}`, kind: p.kind, message: `Phần "${partLabel}": ô "${d.label}" chưa chọn đáp án đúng.` })
        })
      }
    })
  })

  return issues
}