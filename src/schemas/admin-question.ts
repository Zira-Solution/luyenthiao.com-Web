import { z } from '@/lib/zod'

export const QUESTION_KINDS = [
  'multichoice',
  'gapfill',
  'dragdrop',
  'matching',
  'writing_prompt',
  'mic-plain',
  'mic-answer',
  'mic-zoom',
  'scene-mark',
  'choose-object',
  'drag-object',
] as const

export const SKILL_TAGS = ['listening', 'reading', 'writing', 'speaking'] as const

export const adminQuestionSchema = z.object({
  id: z.string(),
  levelSlug: z.string(),
  kind: z.string(),
  skillTags: z.array(z.string()),
  question: z.record(z.string(), z.unknown()),
})

export const adminQuestionListSchema = z.array(adminQuestionSchema)

export const pagedAdminQuestionsSchema = z.object({
  items: adminQuestionListSchema,
  total: z.number().int(),
  page: z.number().int(),
  limit: z.number().int(),
})

export const adminQuestionListResponseSchema = z.union([
  adminQuestionListSchema,
  pagedAdminQuestionsSchema,
])

export type AdminQuestion = z.output<typeof adminQuestionSchema>
export type PagedAdminQuestions = z.output<typeof pagedAdminQuestionsSchema>

export interface SaveAdminQuestionInput {
  levelSlug: string
  kind: string
  skillTags: string[]
  question: Record<string, unknown>
}
