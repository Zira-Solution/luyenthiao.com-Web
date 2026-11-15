import { describe, expect, it } from "vitest"

import { examSchema } from "./exam"

import { normalizeExam } from "@/lib/exam-normalize"
import examMock from "@/mocks/exam-7778495e.json"

describe("normalizeExam", () => {
  const raw = (examMock as { data?: { checkPoint?: unknown } }).data?.checkPoint
  const exam = normalizeExam(raw as never)

  it("parses mock successfully and passes schema", () => {
    expect(exam).not.toBeNull()
    expect(examSchema.safeParse(exam).success).toBe(true)
  })

  it("contains 2 structures with 5 + 6 parts", () => {
    expect(exam?.structures).toHaveLength(2)
    const [listening, rw] = exam?.structures ?? []
    expect(listening?.parts).toHaveLength(5)
    expect(listening?.name).toBe("Listening")
    expect(rw?.parts).toHaveLength(6)
    expect(rw?.name).toBe("Reading - Writing")
    expect(listening?.minutes).toBe(35)
    expect(rw?.minutes).toBe(30)
  })

  it("has details with correct answers across parts", () => {
    const totalCorrect = (exam?.structures ?? []).reduce((acc, s) => {
      return (
        acc +
        s.parts.reduce((pAcc, p) => {
          return (
            pAcc +
            p.questions.reduce((qAcc, q) => {
              return qAcc + q.details.filter((d) => d.correctAnswers.length > 0).length
            }, 0)
          )
        }, 0)
      )
    }, 0)
    expect(totalCorrect).toBeGreaterThan(0)
  })

  it("gives every multichoice question a correctLabel", () => {
    const mcQuestions = (exam?.structures ?? []).flatMap((s) =>
      s.parts.filter((p) => p.kind === "multichoice").flatMap((p) => p.questions),
    )
    expect(mcQuestions.length).toBeGreaterThan(0)
    for (const q of mcQuestions) {
      expect(q.correctLabel).toBeTruthy()
    }
  })

  it("maps part kinds correctly", () => {
    const kinds = (exam?.structures ?? []).flatMap((s) => s.parts.map((p) => p.kind))
    expect(kinds).toContain("dragdrop")
    expect(kinds).toContain("matching")
    expect(kinds).toContain("multichoice")
    expect(kinds).toContain("gapfill")
  })

  it("keeps listening gapfill as text-input form (no wordBox options)", () => {
    const listening = exam?.structures[0]
    const l2 = listening?.parts[1]
    expect(l2?.kind).toBe("gapfill")
    // L2 uses text input → các detail không được gán options từ wordBox (vì không có wordBox)
    expect(l2?.wordBox).toBeUndefined()
  })

  it("derives story title fixup options for RW3 detail 6", () => {
    const rw = exam?.structures[1]
    const story = rw?.parts[2]
    const titleDetail = story?.questions[0]?.details.find((d) => d.label === "6")
    expect(titleDetail?.options).toHaveLength(3)
    expect(titleDetail?.correctAnswers).toEqual(["Jim had a weird dream"])
  })
})