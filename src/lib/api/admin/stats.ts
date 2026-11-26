import { parseOrThrow } from '@/lib/api/parse'
import { authFetch } from '@/lib/api-client'
import type {
  AdminAttemptQueryParams,
  AdminChallengeQueryParams,
  AdminPointQueryParams,
} from '@/lib/query-keys'
import {
  adminStatsSchema,
  pagedAdminAttemptsSchema,
  pagedAdminChallengeResultsSchema,
  pagedAdminChallengeRoomsSchema,
  pagedAdminPointsSchema,
  type AdminStats,
  type PagedAdminAttempts,
  type PagedAdminChallengeResults,
  type PagedAdminChallengeRooms,
  type PagedAdminPoints,
} from '@/schemas/admin-stats'

function withPagination(sp: URLSearchParams, page?: number, limit?: number): string {
  sp.set('page', String(page && page >= 1 ? page : 1))
  sp.set('limit', String(limit && limit >= 1 ? limit : 20))
  return `?${sp.toString()}`
}

export async function getAdminStats(): Promise<AdminStats> {
  const res = await authFetch<unknown>('/admin/stats')
  return parseOrThrow(adminStatsSchema, res, '/admin/stats')
}

export async function listAdminAttempts(
  params?: AdminAttemptQueryParams,
): Promise<PagedAdminAttempts> {
  const sp = new URLSearchParams()
  if (params?.q?.trim()) sp.set('q', params.q.trim())
  if (params?.level && params.level !== 'all') sp.set('level', params.level)
  if (typeof params?.userId === 'number') sp.set('userId', String(params.userId))
  const res = await authFetch<unknown>(
    `/admin/attempts${withPagination(sp, params?.page, params?.limit)}`,
  )
  return parseOrThrow(pagedAdminAttemptsSchema, res, '/admin/attempts')
}

export async function listAdminChallengeRooms(
  params?: AdminChallengeQueryParams,
): Promise<PagedAdminChallengeRooms> {
  const sp = new URLSearchParams()
  if (params?.status && params.status !== 'all') sp.set('status', params.status)
  if (params?.q?.trim()) sp.set('q', params.q.trim())
  const res = await authFetch<unknown>(
    `/admin/challenges/rooms${withPagination(sp, params?.page, params?.limit)}`,
  )
  return parseOrThrow(pagedAdminChallengeRoomsSchema, res, '/admin/challenges/rooms')
}

export async function listAdminChallengeResults(
  params?: AdminChallengeQueryParams,
): Promise<PagedAdminChallengeResults> {
  const sp = new URLSearchParams()
  if (params?.level && params.level !== 'all') sp.set('level', params.level)
  if (params?.q?.trim()) sp.set('q', params.q.trim())
  const res = await authFetch<unknown>(
    `/admin/challenges/results${withPagination(sp, params?.page, params?.limit)}`,
  )
  return parseOrThrow(pagedAdminChallengeResultsSchema, res, '/admin/challenges/results')
}

export async function listAdminPoints(params?: AdminPointQueryParams): Promise<PagedAdminPoints> {
  const sp = new URLSearchParams()
  if (params?.q?.trim()) sp.set('q', params.q.trim())
  if (params?.source && params.source !== 'all') sp.set('source', params.source)
  if (typeof params?.userId === 'number') sp.set('userId', String(params.userId))
  const res = await authFetch<unknown>(
    `/admin/points${withPagination(sp, params?.page, params?.limit)}`,
  )
  return parseOrThrow(pagedAdminPointsSchema, res, '/admin/points')
}
