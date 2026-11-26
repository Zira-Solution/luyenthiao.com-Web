import { parseOrThrow } from '@/lib/api/parse'
import { apiFetch, authFetch } from '@/lib/api-client'
import type { AdminSpeakingSubmission, AdminWritingSubmission } from '@/schemas/admin-grading'
import { examSchema } from '@/schemas/exam'
import {
  publicExamListSchema,
  serverExamAttemptSchema,
  speakingHistoryListSchema,
  studentSpeakingSubmissionSchema,
  studentWritingSubmissionSchema,
  uploadRecordingResultSchema,
  writingHistoryListSchema,
  type AttemptSpeakingSummary,
  type AttemptWritingSummary,
  type PublicExamSummary,
  type ServerExamAttempt,
} from '@/schemas/student-exam'
import type { Exam } from '@/types/exam'

export interface SubmitExamAttemptInput {
  examId?: string
  levelSlug?: string
  examTitle?: string
  clientAttemptId?: string
  score: number
  total?: number
  correctCount?: number
  totalQuestions?: number
  timeSpentSec?: number
  data?: Record<string, unknown>
}

export async function fetchPublicExamsClient(
  level?: string,
  skill?: string,
): Promise<PublicExamSummary[]> {
  const sp = new URLSearchParams()
  if (level) sp.set('level', level)
  if (skill) sp.set('skill', skill)
  const qs = sp.toString()
  const res = await apiFetch<unknown>(qs ? `/exams/public?${qs}` : '/exams/public')
  return parseOrThrow(publicExamListSchema, res, '/exams/public')
}

export async function fetchDemoExamClient(): Promise<Exam> {
  const res = await apiFetch<unknown>('/exams/demo')
  return parseOrThrow(examSchema, res, '/exams/demo') as Exam
}

export async function fetchExamById(id: string): Promise<Exam> {
  const res = await authFetch<unknown>(`/exams/${encodeURIComponent(id)}`)
  return parseOrThrow(examSchema, res, '/exams/:id') as Exam
}

export async function submitExamAttempt(input: SubmitExamAttemptInput): Promise<ServerExamAttempt> {
  const res = await authFetch<unknown>('/exam-attempts', {
    method: 'POST',
    body: JSON.stringify(input),
  })
  return parseOrThrow(serverExamAttemptSchema, res, '/exam-attempts')
}

export async function fetchExamAttempt(id: string): Promise<ServerExamAttempt> {
  const res = await authFetch<unknown>(`/exam-attempts/${encodeURIComponent(id)}`)
  return parseOrThrow(serverExamAttemptSchema, res, '/exam-attempts/:id')
}

export async function uploadRecordingAudio(
  blob: Blob,
  filename = `recording-${Date.now()}.webm`,
): Promise<{ url: string }> {
  const fd = new FormData()
  fd.append('file', blob, filename)
  const res = await authFetch<unknown>('/uploads/recording', {
    method: 'POST',
    body: fd,
  })
  return parseOrThrow(uploadRecordingResultSchema, res, '/uploads/recording')
}

export async function fetchWritingHistory(attemptId: string): Promise<AttemptWritingSummary[]> {
  const sp = new URLSearchParams({ attemptId })
  const res = await authFetch<unknown>(`/writing-submissions/history?${sp.toString()}`)
  return parseOrThrow(writingHistoryListSchema, res, '/writing-submissions/history')
}

export async function fetchWritingSubmission(id: string): Promise<AdminWritingSubmission> {
  const res = await authFetch<unknown>(`/writing-submissions/${encodeURIComponent(id)}`)
  return parseOrThrow(studentWritingSubmissionSchema, res, '/writing-submissions/:id')
}

export async function fetchSpeakingHistory(attemptId: string): Promise<AttemptSpeakingSummary[]> {
  const sp = new URLSearchParams({ attemptId })
  const res = await authFetch<unknown>(`/speaking-submissions/history?${sp.toString()}`)
  return parseOrThrow(speakingHistoryListSchema, res, '/speaking-submissions/history')
}

export async function fetchSpeakingSubmission(id: string): Promise<AdminSpeakingSubmission> {
  const res = await authFetch<unknown>(`/speaking-submissions/${encodeURIComponent(id)}`)
  return parseOrThrow(studentSpeakingSubmissionSchema, res, '/speaking-submissions/:id')
}
