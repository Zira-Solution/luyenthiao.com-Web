import { parseOrThrow } from '@/lib/api/parse'
import { authFetch } from '@/lib/api-client'
import type { AdminExamQueryParams } from '@/lib/query-keys'
import {
  adminDeleteMessageSchema,
  adminExamListResponseSchema,
  type PagedAdminExams,
} from '@/schemas/admin-exam'
import { examSchema } from '@/schemas/exam'
import type { Exam } from '@/types/exam'

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export type AdminExamPayload = Omit<Exam, 'id'> & { id?: string }

export function toSaveExamPayload(exam: Exam): AdminExamPayload {
  const { id, ...rest } = exam
  return UUID_RE.test(id) ? { id, ...rest } : rest
}

function buildExamQuery(params?: AdminExamQueryParams): string {
  if (!params) return ''
  const sp = new URLSearchParams()
  if (params.q?.trim()) sp.set('q', params.q.trim())
  if (params.level?.trim()) sp.set('level', params.level.trim())
  if (params.page && params.page >= 1) sp.set('page', String(params.page))
  if (params.limit && params.limit >= 1) sp.set('limit', String(params.limit))
  const qs = sp.toString()
  return qs ? `?${qs}` : ''
}

export async function listAdminExams(
  params?: AdminExamQueryParams,
): Promise<Exam[] | PagedAdminExams> {
  const path = `/exams${buildExamQuery(params)}`
  const res = await authFetch<unknown>(path)
  return parseOrThrow(adminExamListResponseSchema, res, '/exams')
}

export async function getAdminExam(id: string): Promise<Exam> {
  const path = `/exams/${encodeURIComponent(id)}`
  const res = await authFetch<unknown>(path)
  return parseOrThrow(examSchema, res, '/exams/:id')
}

export async function createAdminExam(exam: Exam): Promise<Exam> {
  const res = await authFetch<unknown>('/exams', {
    method: 'POST',
    body: JSON.stringify(toSaveExamPayload(exam)),
  })
  return parseOrThrow(examSchema, res, '/exams')
}

export async function updateAdminExam(id: string, exam: Exam): Promise<Exam> {
  const res = await authFetch<unknown>(`/exams/${encodeURIComponent(id)}`, {
    method: 'PUT',
    body: JSON.stringify({ ...toSaveExamPayload(exam), id }),
  })
  return parseOrThrow(examSchema, res, '/exams/:id')
}

export async function toggleExamDemo(id: string, isDemo: boolean): Promise<Exam> {
  const res = await authFetch<unknown>(`/exams/${encodeURIComponent(id)}/demo`, {
    method: 'PATCH',
    body: JSON.stringify({ isDemo }),
  })
  return parseOrThrow(examSchema, res, '/exams/:id/demo')
}

export async function deleteAdminExam(id: string): Promise<{ message: string }> {
  const res = await authFetch<unknown>(`/exams/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  })
  return parseOrThrow(adminDeleteMessageSchema, res, '/exams/:id')
}
