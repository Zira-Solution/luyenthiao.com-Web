import { parseOrThrow } from '@/lib/api/parse'
import { authFetch } from '@/lib/api-client'
import type { AdminUserQueryParams } from '@/lib/query-keys'
import {
  adminUserDetailSchema,
  adminUserRowSchema,
  pagedAdminUsersSchema,
  type AdminUserDetail,
  type AdminUserRow,
  type PagedAdminUsers,
  type UpdateAdminUserInput,
} from '@/schemas/admin-users'

function buildUsersQuery(params?: AdminUserQueryParams): string {
  const sp = new URLSearchParams()
  if (params?.q?.trim()) sp.set('q', params.q.trim())
  if (params?.role) sp.set('role', params.role)
  if (typeof params?.schoolId === 'number') sp.set('schoolId', String(params.schoolId))
  if (typeof params?.isBanned === 'boolean') sp.set('isBanned', String(params.isBanned))
  sp.set('page', String(params?.page && params.page >= 1 ? params.page : 1))
  sp.set('limit', String(params?.limit && params.limit >= 1 ? params.limit : 20))
  return `?${sp.toString()}`
}

export async function listAdminUsers(params?: AdminUserQueryParams): Promise<PagedAdminUsers> {
  const res = await authFetch<unknown>(`/users${buildUsersQuery(params)}`)
  return parseOrThrow(pagedAdminUsersSchema, res, '/users')
}

export async function getAdminUserDetail(id: number): Promise<AdminUserDetail> {
  const res = await authFetch<unknown>(`/users/${id}`)
  return parseOrThrow(adminUserDetailSchema, res, '/users/:id')
}

export async function updateAdminUser(
  id: number,
  input: UpdateAdminUserInput,
): Promise<AdminUserRow> {
  const res = await authFetch<unknown>(`/users/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  })
  return parseOrThrow(adminUserRowSchema, res, '/users/:id')
}
