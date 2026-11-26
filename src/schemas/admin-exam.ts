import { z } from '@/lib/zod'
import { examSchema } from '@/schemas/exam'

export const adminExamListSchema = z.array(examSchema)

export const pagedAdminExamsSchema = z.object({
  items: adminExamListSchema,
  total: z.number().int(),
  page: z.number().int(),
  limit: z.number().int(),
})

export const adminExamListResponseSchema = z.union([adminExamListSchema, pagedAdminExamsSchema])

export const adminDeleteMessageSchema = z.object({
  message: z.string(),
})

export type PagedAdminExams = z.output<typeof pagedAdminExamsSchema>
