import { z } from '@/lib/zod'
import { optNum, optStr } from '@/schemas/admin-common'
import {
  adminSpeakingSubmissionSchema,
  adminWritingSubmissionSchema,
  submissionStatusSchema,
} from '@/schemas/admin-grading'
import { examSchema } from '@/schemas/exam'

export const publicExamSummarySchema = z.object({
  id: z.string(),
  name: optStr(),
  levelSlug: optStr(),
  levelName: optStr(),
  order: z.number().int().min(0).nullable().optional(),
  skills: z.array(z.string()).default([]),
})

export const publicExamListSchema = z.array(publicExamSummarySchema)

export const attemptWritingSummarySchema = z.object({
  id: z.string(),
  partId: optStr(),
  answerText: optStr(),
  wordCount: optNum(),
  score: z.number().nullable().optional(),
  status: submissionStatusSchema.catch('PENDING'),
  feedback: z.unknown().nullable().optional(),
  aiScore: z.number().nullable().optional(),
  aiFeedback: z.unknown().nullable().optional(),
  gradedAt: z.string().nullable().optional(),
  submittedAt: optStr(),
})

export const attemptSpeakingSummarySchema = z.object({
  id: z.string(),
  partId: optStr(),
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
  gradedAt: z.string().nullable().optional(),
  submittedAt: optStr(),
})

export const serverExamAttemptSchema = z.object({
  id: z.string(),
  examId: z.string().nullable().optional(),
  userId: z.number().optional(),
  levelSlug: optStr(),
  examTitle: optStr(),
  score: optNum(),
  total: optNum(100),
  correctCount: optNum(),
  totalQuestions: optNum(),
  timeSpentSec: optNum(),
  createdAt: optStr(),
  data: z.unknown().nullable().optional(),
  exam: z
    .object({
      id: z.string(),
      name: optStr(),
      levelSlug: optStr(),
      data: examSchema.or(z.unknown()).optional(),
    })
    .nullable()
    .optional(),
  writingSubmissions: z.array(attemptWritingSummarySchema).default([]),
  speakingSubmissions: z.array(attemptSpeakingSummarySchema).default([]),
})

export const uploadRecordingResultSchema = z.object({
  url: z.string().min(1),
})

export const writingHistoryListSchema = z.array(attemptWritingSummarySchema)
export const speakingHistoryListSchema = z.array(attemptSpeakingSummarySchema)

export { adminWritingSubmissionSchema as studentWritingSubmissionSchema }
export { adminSpeakingSubmissionSchema as studentSpeakingSubmissionSchema }

export type PublicExamSummary = z.output<typeof publicExamSummarySchema>
export type ServerExamAttempt = z.output<typeof serverExamAttemptSchema>
export type AttemptWritingSummary = z.output<typeof attemptWritingSummarySchema>
export type AttemptSpeakingSummary = z.output<typeof attemptSpeakingSummarySchema>
