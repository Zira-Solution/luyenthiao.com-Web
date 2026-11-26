import { parseOrThrow } from '@/lib/api/parse'
import { authFetch } from '@/lib/api-client'
import type { AdminQuestionQueryParams } from '@/lib/query-keys'
import { adminDeleteMessageSchema } from '@/schemas/admin-exam'
import {
  adminQuestionListResponseSchema,
  adminQuestionSchema,
  type AdminQuestion,
  type PagedAdminQuestions,
  type SaveAdminQuestionInput,
} from '@/schemas/admin-question'

function buildQuestionQuery(params?: AdminQuestionQueryParams): string {
  if (!params) return ''
  const sp = new URLSearchParams()
  if (params.level?.trim()) sp.set('level', params.level.trim())
  if (params.skill?.trim()) sp.set('skill', params.skill.trim())
  if (params.kind?.trim()) sp.set('kind', params.kind.trim())
  if (params.q?.trim()) sp.set('q', params.q.trim())
  if (params.page && params.page >= 1) sp.set('page', String(params.page))
  if (params.limit && params.limit >= 1) sp.set('limit', String(params.limit))
  const qs = sp.toString()
  return qs ? `?${qs}` : ''
}

export async function listAdminQuestions(
  params?: AdminQuestionQueryParams,
): Promise<AdminQuestion[] | PagedAdminQuestions> {
  const path = `/questions${buildQuestionQuery(params)}`
  const res = await authFetch<unknown>(path)
  return parseOrThrow(adminQuestionListResponseSchema, res, '/questions')
}

export async function getAdminQuestion(id: string): Promise<AdminQuestion> {
  const res = await authFetch<unknown>(`/questions/${encodeURIComponent(id)}`)
  return parseOrThrow(adminQuestionSchema, res, '/questions/:id')
}

export async function createAdminQuestion(input: SaveAdminQuestionInput): Promise<AdminQuestion> {
  const res = await authFetch<unknown>('/questions', {
    method: 'POST',
    body: JSON.stringify(input),
  })
  return parseOrThrow(adminQuestionSchema, res, '/questions')
}

export async function updateAdminQuestion(
  id: string,
  input: SaveAdminQuestionInput,
): Promise<AdminQuestion> {
  const res = await authFetch<unknown>(`/questions/${encodeURIComponent(id)}`, {
    method: 'PUT',
    body: JSON.stringify(input),
  })
  return parseOrThrow(adminQuestionSchema, res, '/questions/:id')
}

export async function deleteAdminQuestion(id: string): Promise<{ message: string }> {
  const res = await authFetch<unknown>(`/questions/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  })
  return parseOrThrow(adminDeleteMessageSchema, res, '/questions/:id')
}
