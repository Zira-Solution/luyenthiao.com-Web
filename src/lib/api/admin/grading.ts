import { parseOrThrow } from '@/lib/api/parse'
import { authFetch } from '@/lib/api-client'
import type { AdminGradingQueueQueryParams } from '@/lib/query-keys'
import {
  adminSpeakingSubmissionSchema,
  adminWritingSubmissionSchema,
  pagedSpeakingQueueSchema,
  pagedWritingQueueSchema,
  type AdminSpeakingSubmission,
  type AdminWritingSubmission,
  type GradeSpeakingInput,
  type GradeWritingInput,
  type PagedSpeakingQueue,
  type PagedWritingQueue,
} from '@/schemas/admin-grading'

function buildGradingQueueQuery(params?: AdminGradingQueueQueryParams): string {
  const sp = new URLSearchParams()
  if (params?.status) sp.set('status', params.status)
  if (params?.q?.trim()) sp.set('q', params.q.trim())
  sp.set('page', String(params?.page && params.page >= 1 ? params.page : 1))
  sp.set('limit', String(params?.limit && params.limit >= 1 ? params.limit : 20))
  return `?${sp.toString()}`
}

export async function listAdminWritingQueue(
  params?: AdminGradingQueueQueryParams,
): Promise<PagedWritingQueue> {
  const res = await authFetch<unknown>(
    `/writing-submissions/queue${buildGradingQueueQuery(params)}`,
  )
  return parseOrThrow(pagedWritingQueueSchema, res, '/writing-submissions/queue')
}

export async function getAdminWritingSubmission(id: string): Promise<AdminWritingSubmission> {
  const res = await authFetch<unknown>(`/writing-submissions/${encodeURIComponent(id)}`)
  return parseOrThrow(adminWritingSubmissionSchema, res, '/writing-submissions/:id')
}

export async function gradeWritingSubmission(
  id: string,
  input: GradeWritingInput,
): Promise<AdminWritingSubmission> {
  const res = await authFetch<unknown>(`/writing-submissions/${encodeURIComponent(id)}/grade`, {
    method: 'PUT',
    body: JSON.stringify(input),
  })
  return parseOrThrow(adminWritingSubmissionSchema, res, '/writing-submissions/:id/grade')
}

export async function listAdminSpeakingQueue(
  params?: AdminGradingQueueQueryParams,
): Promise<PagedSpeakingQueue> {
  const res = await authFetch<unknown>(
    `/speaking-submissions/queue${buildGradingQueueQuery(params)}`,
  )
  return parseOrThrow(pagedSpeakingQueueSchema, res, '/speaking-submissions/queue')
}

export async function getAdminSpeakingSubmission(id: string): Promise<AdminSpeakingSubmission> {
  const res = await authFetch<unknown>(`/speaking-submissions/${encodeURIComponent(id)}`)
  return parseOrThrow(adminSpeakingSubmissionSchema, res, '/speaking-submissions/:id')
}

export async function gradeSpeakingSubmission(
  id: string,
  input: GradeSpeakingInput,
): Promise<AdminSpeakingSubmission> {
  const res = await authFetch<unknown>(`/speaking-submissions/${encodeURIComponent(id)}/grade`, {
    method: 'PUT',
    body: JSON.stringify(input),
  })
  return parseOrThrow(adminSpeakingSubmissionSchema, res, '/speaking-submissions/:id/grade')
}
