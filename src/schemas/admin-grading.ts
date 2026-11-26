import { z } from '@/lib/zod'
import { optNum, optStr } from '@/schemas/admin-common'

export const gradingUserSchema = z.object({
  id: z.number(),
  username: z.string(),
  fullName: optStr(),
  email: optStr(),
})

export const gradingGraderSchema = z.object({
  id: z.number(),
  username: z.string(),
  fullName: optStr(),
})

export const gradingAttemptRefSchema = z.object({
  id: z.string(),
  examTitle: optStr(),
  createdAt: optStr(),
  exam: z
    .object({
      id: z.string(),
      name: optStr(),
      levelSlug: optStr(),
      data: z.unknown().optional(),
    })
    .nullable()
    .optional(),
})

export const submissionStatusSchema = z.enum(['PENDING', 'GRADED'])

export const writingFeedbackInputSchema = z.object({
  comment: z.string().default(''),
  errors: z.string().default(''),
  tips: z.string().default(''),
})

export type WritingFeedbackInput = z.output<typeof writingFeedbackInputSchema>

export const adminWritingSubmissionSchema = z.object({
  id: z.string(),
  examAttemptId: z.string(),
  partId: optStr(),
  userId: z.number(),
  answerText: optStr(),
  wordCount: optNum(),
  score: z.number().nullable().optional(),
  status: submissionStatusSchema.catch('PENDING'),
  feedback: z.unknown().nullable().optional(),
  aiScore: z.number().nullable().optional(),
  aiFeedback: z.unknown().nullable().optional(),
  gradedById: z.number().nullable().optional(),
  gradedAt: z.string().nullable().optional(),
  submittedAt: z.string(),
  examAttempt: gradingAttemptRefSchema.nullable().optional(),
  user: gradingUserSchema.nullable().optional(),
  grader: gradingGraderSchema.nullable().optional(),
})

export const adminSpeakingSubmissionSchema = z.object({
  id: z.string(),
  examAttemptId: z.string(),
  partId: optStr(),
  userId: z.number(),
  answers: z
    .record(z.string(), z.unknown())
    .nullish()
    .transform((v) => v ?? {}),
  autoScore: z.number().nullable().optional(),
  manualScore: z.number().nullable().optional(),
  totalScore: z.number().nullable().optional(),
  status: submissionStatusSchema.catch('PENDING'),
  feedback: z.string().nullable().optional(),
  aiScore: z.number().nullable().optional(),
  aiFeedback: z.string().nullable().optional(),
  gradedById: z.number().nullable().optional(),
  gradedAt: z.string().nullable().optional(),
  submittedAt: z.string(),
  examAttempt: gradingAttemptRefSchema.nullable().optional(),
  user: gradingUserSchema.nullable().optional(),
  grader: gradingGraderSchema.nullable().optional(),
})

export const queueCountsSchema = z.object({
  pending: z.number(),
  graded: z.number(),
})

export const pagedWritingQueueSchema = z.object({
  items: z.array(adminWritingSubmissionSchema),
  total: z.number(),
  page: z.number(),
  limit: z.number(),
  counts: queueCountsSchema,
})

export const pagedSpeakingQueueSchema = z.object({
  items: z.array(adminSpeakingSubmissionSchema),
  total: z.number(),
  page: z.number(),
  limit: z.number(),
  counts: queueCountsSchema,
})

export type AdminWritingSubmission = z.output<typeof adminWritingSubmissionSchema>
export type AdminSpeakingSubmission = z.output<typeof adminSpeakingSubmissionSchema>
export type PagedWritingQueue = z.output<typeof pagedWritingQueueSchema>
export type PagedSpeakingQueue = z.output<typeof pagedSpeakingQueueSchema>

export interface GradeWritingInput {
  score: number
  feedback: WritingFeedbackInput
}

export interface GradeSpeakingInput {
  manualScore: number
  feedback: string
}
