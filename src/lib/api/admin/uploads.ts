import { parseOrThrow } from '@/lib/api/parse'
import { authFetch } from '@/lib/api-client'
import type { AdminUploadQueryParams } from '@/lib/query-keys'
import { adminDeleteMessageSchema } from '@/schemas/admin-exam'
import {
  r2ListResponseSchema,
  r2UploadResultSchema,
  type R2ListResponse,
} from '@/schemas/admin-upload'

function buildUploadQuery(params?: AdminUploadQueryParams): string {
  if (!params) return ''
  const sp = new URLSearchParams()
  if (params.type) sp.set('type', params.type)
  if (params.prefix?.trim()) sp.set('prefix', params.prefix.trim())
  if (params.cursor?.trim()) sp.set('cursor', params.cursor.trim())
  if (params.limit && params.limit >= 1) sp.set('limit', String(params.limit))
  const qs = sp.toString()
  return qs ? `?${qs}` : ''
}

export async function listR2Uploads(params?: AdminUploadQueryParams): Promise<R2ListResponse> {
  const path = `/uploads${buildUploadQuery(params)}`
  const res = await authFetch<unknown>(path)
  return parseOrThrow(r2ListResponseSchema, res, '/uploads')
}

export async function uploadR2File(file: File): Promise<{ url: string }> {
  const form = new FormData()
  form.append('file', file)
  const res = await authFetch<unknown>('/uploads', {
    method: 'POST',
    body: form,
  })
  return parseOrThrow(r2UploadResultSchema, res, '/uploads')
}

export async function deleteR2Upload(key: string): Promise<{ message: string }> {
  const res = await authFetch<unknown>(`/uploads?key=${encodeURIComponent(key)}`, {
    method: 'DELETE',
  })
  return parseOrThrow(adminDeleteMessageSchema, res, '/uploads')
}
