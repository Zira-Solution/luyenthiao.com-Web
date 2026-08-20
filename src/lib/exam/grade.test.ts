import { describe, expect, it } from "vitest"

import { gradeExam } from "./grade"

import type { AnswerMap, Exam } from "@/types/exam"


const dragdropDetail = {
  id: "dd-detail",
  label: "A",
  correctAnswers: ["Peter"],
}
const matchingDetail = {
  id: "mt-detail",
  label: "A comic book",
  correctAnswers: ["E"],
}
const multichoiceQuestion = {
  id: "mc-q",
  isExample: false,
  title: "Q",
  promptHtml: null,
  correctLabel: "B",
  details: [],
}
const gapDetail = {
  id: "gp-detail",
  label: "1",
  correctAnswers: ["Smith"],
}

const exam: Exam = {
  id: "exam-1",
  name: "Fixture",
  levelSlug: "movers",
  levelName: "Movers",
  structures: [
    {
      id: "struct-listening",
      name: "Listening",
      minutes: 35,
      parts: [
        {
          id: "part-dd",
          kind: "dragdrop",
          title: "DD",
          questions: [
            {
              id: "dd-q",
              isExample: false,
              title: null,
              promptHtml: null,
              choices: [],
              correctLabel: null,
              details: [dragdropDetail],
            },
          ],
        },
        {
          id: "part-matching",
          kind: "matching",
          title: "MT",
          questions: [
            {
              id: "mt-q",
              isExample: false,
              title: null,
              promptHtml: null,
              choices: [],
              correctLabel: null,
              details: [matchingDetail],
            },
          ],
        },
        {
          id: "part-mc",
          kind: "multichoice",
          title: "MC",
          questions: [multichoiceQuestion],
        },
        {
          id: "part-gapfill",
          kind: "gapfill",
          title: "GP",
          questions: [
            {
              id: "gp-q",
              isExample: true,
              title: null,
              promptHtml: null,
              choices: [],
              correctLabel: null,
              details: [
                {
                  id: "gp-example",
                  label: "0",
                  correctAnswers: ["example"],
                },
              ],
            },
            {
              id: "gp-q2",
              isExample: false,
              title: null,
              promptHtml: null,
              choices: [],
              correctLabel: null,
              details: [
                { ...gapDetail, correctAnswers: ["Smith", "J. Smith"] },
              ],
            },
          ],
        },
      ],
    },
    {
      id: "struct-rw",
      name: "Reading - Writing",
      minutes: 30,
      parts: [
        {
          id: "part-rw-mc",
          kind: "multichoice",
          title: "RW2",
          questions: [
            {
              id: "rw-mc-q",
              isExample: false,
              title: "Did you enjoy your holiday?",
              promptHtml: null,
              correctLabel: "C",
              details: [],
            },
          ],
        },
      ],
    },
  ],
}

describe("gradeExam", () => {
  it("scores dragdrop exact match correct", () => {
    const answers: AnswerMap = { "part-dd": { "dd-detail": "Peter" } }
    const grade = gradeExam(exam, answers)
    expect(grade.byKey["dd-detail"]?.status).toBe("correct")
    expect(grade.total.correct).toBe(1)
  })

  it("scores dragdrop mismatch wrong", () => {
    const answers: AnswerMap = { "part-dd": { "dd-detail": "Lily" } }
    const grade = gradeExam(exam, answers)
    expect(grade.byKey["dd-detail"]?.status).toBe("wrong")
  })

  it("scores dragdrop missing answer empty", () => {
    const grade = gradeExam(exam, {})
    expect(grade.byKey["dd-detail"]?.status).toBe("empty")
  })

  it("scores matching by detail id", () => {
    expect(gradeExam(exam, { "part-matching": { "mt-detail": "E" } }).byKey["mt-detail"]?.status).toBe(
      "correct",
    )
    expect(
      gradeExam(exam, { "part-matching": { "mt-detail": "A" } }).byKey["mt-detail"]?.status,
    ).toBe("wrong")
  })

  it("scores multichoice by question.correctLabel", () => {
    // L4 / RW2 bug regression: correct when value === correctLabel
    expect(gradeExam(exam, { "part-mc": { "mc-q": "B" } }).byKey["mc-q"]?.status).toBe("correct")
    expect(gradeExam(exam, { "part-mc": { "mc-q": "A" } }).byKey["mc-q"]?.status).toBe("wrong")
    expect(gradeExam(exam, { "part-rw-mc": { "rw-mc-q": "C" } }).byKey["rw-mc-q"]?.status).toBe(
      "correct",
    )
  })

  it("scores gapfill case-insensitive with any accepted answer", () => {
    expect(gradeExam(exam, { "part-gapfill": { "gp-detail": "smith" } }).byKey["gp-detail"]?.status).toBe(
      "correct",
    )
    expect(gradeExam(exam, { "part-gapfill": { "gp-detail": "J. SMITH" } }).byKey["gp-detail"]?.status).toBe(
      "correct",
    )
    expect(gradeExam(exam, { "part-gapfill": { "gp-detail": "wrong" } }).byKey["gp-detail"]?.status).toBe(
      "wrong",
    )
  })

  it("ignores isExample and treats empty answers as empty", () => {
    const grade = gradeExam(exam, {})
    expect(grade.byKey["gp-example"]).toBeUndefined()
    expect(grade.byKey["gp-detail"]?.status).toBe("empty")
    expect(grade.total.correct).toBe(0)
  })

  it("aggregates byPart and byStructure totals", () => {
    const grade = gradeExam(exam, {})
    // dragdrop 1, matching 1, multichoice 1, gapfill 1, rw-mc 1 = 5 total
    expect(grade.total.total).toBe(5)
    expect(grade.byStructure["struct-listening"]?.total).toBe(4)
    expect(grade.byStructure["struct-rw"]?.total).toBe(1)
    expect(grade.byPart["part-dd"]?.total).toBe(1)
  })
})