import { parseOrThrow } from '@/lib/api/parse'
import { authFetch } from '@/lib/api-client'
import type { AdminVocabQueryParams } from '@/lib/query-keys'
import {
  adminVocabWordSchema,
  pagedAdminVocabSchema,
  type AdminVocabWord,
  type PagedAdminVocab,
  type SaveAdminVocabInput,
} from '@/schemas/admin-vocab'

function buildVocabQuery(params?: AdminVocabQueryParams): string {
  const sp = new URLSearchParams()
  if (params?.level && params.level !== 'all') sp.set('level', params.level)
  if (params?.topic?.trim()) sp.set('topic', params.topic.trim())
  if (typeof params?.active === 'boolean') sp.set('active', String(params.active))
  if (params?.q?.trim()) sp.set('q', params.q.trim())
  sp.set('page', String(params?.page && params.page >= 1 ? params.page : 1))
  sp.set('limit', String(params?.limit && params.limit >= 1 ? params.limit : 20))
  return `?${sp.toString()}`
}

export async function listAdminVocab(params?: AdminVocabQueryParams): Promise<PagedAdminVocab> {
  const res = await authFetch<unknown>(`/vocab${buildVocabQuery(params)}`)
  return parseOrThrow(pagedAdminVocabSchema, res, '/vocab')
}

export async function createAdminVocab(input: SaveAdminVocabInput): Promise<AdminVocabWord> {
  const res = await authFetch<unknown>('/vocab', {
    method: 'POST',
    body: JSON.stringify(input),
  })
  return parseOrThrow(adminVocabWordSchema, res, '/vocab')
}

export async function updateAdminVocab(
  id: number,
  input: Partial<SaveAdminVocabInput>,
): Promise<AdminVocabWord> {
  const res = await authFetch<unknown>(`/vocab/${id}`, {
    method: 'PUT',
    body: JSON.stringify(input),
  })
  return parseOrThrow(adminVocabWordSchema, res, '/vocab/:id')
}

export async function deleteAdminVocab(id: number): Promise<unknown> {
  return authFetch<unknown>(`/vocab/${id}`, { method: 'DELETE' })
}
