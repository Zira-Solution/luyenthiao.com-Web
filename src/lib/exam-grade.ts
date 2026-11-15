import type { AnswerMap, Exam } from "@/types/exam"

export interface DetailGrade {
  status: "correct" | "wrong" | "empty"
  correctAnswers: string[]
}

export interface GradeResult {
  byKey: Record<string, DetailGrade>
  byPart: Record<string, { correct: number; total: number }>
  byStructure: Record<string, { correct: number; total: number }>
  total: { correct: number; total: number }
}

function emptyGrade(): GradeResult {
  return { byKey: {}, byPart: {}, byStructure: {}, total: { correct: 0, total: 0 } }
}

function tag(
  byKey: GradeResult["byKey"],
  key: string,
  correctAnswers: string[],
  value: string | undefined,
): DetailGrade {
  let status: DetailGrade["status"] = "empty"
  if (value && value.trim().length > 0) {
    status = correctAnswers.includes(value) ? "correct" : "wrong"
  }
  const grade: DetailGrade = { status, correctAnswers }
  byKey[key] = grade
  return grade
}

function tagGapfill(
  byKey: GradeResult["byKey"],
  key: string,
  correctAnswers: string[],
  value: string | undefined,
): DetailGrade {
  let status: DetailGrade["status"] = "empty"
  const normalized = (value ?? "").trim().toLowerCase()
  if (normalized.length > 0) {
    const hit = correctAnswers.some(
      (c) => c.trim().toLowerCase() === normalized,
    )
    status = hit ? "correct" : "wrong"
  }
  const grade: DetailGrade = { status, correctAnswers }
  byKey[key] = grade
  return grade
}

export function gradeExam(exam: Exam, answers: AnswerMap): GradeResult {
  const result = emptyGrade()

  for (const structure of exam.structures) {
    let structCorrect = 0
    let structTotal = 0

    for (const part of structure.parts) {
      const partAnswers = answers[part.id] ?? {}
      let partCorrect = 0
      let partTotal = 0

      for (const question of part.questions) {
        if (question.isExample) continue

        if (part.kind === "multichoice") {
          partTotal += 1
          structTotal += 1
          const value = partAnswers[question.id]
          const correctAnswers = question.correctLabel ? [question.correctLabel] : []
          const grade = tag(result.byKey, question.id, correctAnswers, value)
          if (grade.status === "correct") {
            partCorrect += 1
            structCorrect += 1
          }
          continue
        }

        for (const detail of question.details) {
          partTotal += 1
          structTotal += 1
          const value = partAnswers[detail.id]
          const grade =
            part.kind === "gapfill"
              ? tagGapfill(result.byKey, detail.id, detail.correctAnswers, value)
              : tag(result.byKey, detail.id, detail.correctAnswers, value)
          if (grade.status === "correct") {
            partCorrect += 1
            structCorrect += 1
          }
        }
      }

      result.byPart[part.id] = { correct: partCorrect, total: partTotal }
    }

    result.byStructure[structure.id] = {
      correct: structCorrect,
      total: structTotal,
    }
  }

  result.total.correct = Object.values(result.byStructure).reduce(
    (acc, s) => acc + s.correct,
    0,
  )
  result.total.total = Object.values(result.byStructure).reduce(
    (acc, s) => acc + s.total,
    0,
  )

  return result
}