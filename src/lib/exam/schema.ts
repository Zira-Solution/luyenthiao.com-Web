import { z } from "zod"

const boxSchema = z.object({
  left: z.string(),
  top: z.string(),
  width: z.string(),
  height: z.string(),
})

const wordBoxItemSchema = z.object({
  label: z.string(),
  imageId: z.string().nullable().optional(),
})

const examDetailSchema = z.object({
  id: z.string(),
  label: z.string(),
  box: boxSchema.nullable().optional(),
  imageUrl: z.string().nullable().optional(),
  text: z.string().nullable().optional(),
  correctAnswers: z.array(z.string()),
  options: z.array(z.string()).optional(),
})

const examQuestionSchema = z.object({
  id: z.string(),
  isExample: z.boolean(),
  title: z.string().nullable().optional(),
  promptHtml: z.string().nullable().optional(),
  choices: z.array(wordBoxItemSchema).optional(),
  correctLabel: z.string().nullable().optional(),
  details: z.array(examDetailSchema),
})

export const examPartSchema = z.object({
  id: z.string(),
  kind: z.enum(["dragdrop", "matching", "multichoice", "gapfill"]),
  title: z.string(),
  audioUrl: z.string().nullable().optional(),
  imageUrl: z.string().nullable().optional(),
  wordBox: z.array(wordBoxItemSchema).optional(),
  extraHtml: z.string().nullable().optional(),
  questions: z.array(examQuestionSchema),
})

export const examStructureSchema = z.object({
  id: z.string(),
  name: z.string(),
  minutes: z.number(),
  parts: z.array(examPartSchema),
})

export const examSchema = z.object({
  id: z.string(),
  name: z.string(),
  levelSlug: z.string(),
  levelName: z.string(),
  structures: z.array(examStructureSchema),
})

export type ExamSchema = z.infer<typeof examSchema>