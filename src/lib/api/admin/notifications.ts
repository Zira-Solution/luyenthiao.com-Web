import { parseOrThrow } from '@/lib/api/parse'
import { authFetch } from '@/lib/api-client'
import type { AdminNotificationQueryParams } from '@/lib/query-keys'
import {
  adminNotificationSchema,
  notificationSearchUsersSchema,
  pagedAdminNotificationsSchema,
  type AdminNotification,
  type CreateAdminNotificationInput,
  type NotificationSearchUser,
  type PagedAdminNotifications,
} from '@/schemas/admin-notification'

function buildNotificationQuery(params?: AdminNotificationQueryParams): string {
  const sp = new URLSearchParams()
  if (params?.type && params.type !== 'all') sp.set('type', params.type)
  if (params?.q?.trim()) sp.set('q', params.q.trim())
  sp.set('page', String(params?.page && params.page >= 1 ? params.page : 1))
  sp.set('limit', String(params?.limit && params.limit >= 1 ? params.limit : 20))
  return `?${sp.toString()}`
}

export async function listAdminNotifications(
  params?: AdminNotificationQueryParams,
): Promise<PagedAdminNotifications> {
  const res = await authFetch<unknown>(`/notifications${buildNotificationQuery(params)}`)
  return parseOrThrow(pagedAdminNotificationsSchema, res, '/notifications')
}

export async function createAdminNotification(
  input: CreateAdminNotificationInput,
): Promise<AdminNotification> {
  const res = await authFetch<unknown>('/notifications', {
    method: 'POST',
    body: JSON.stringify(input),
  })
  return parseOrThrow(adminNotificationSchema, res, '/notifications')
}

export async function deleteAdminNotification(id: number): Promise<unknown> {
  return authFetch<unknown>(`/notifications/${id}`, { method: 'DELETE' })
}

export async function searchNotificationUsers(q: string): Promise<NotificationSearchUser[]> {
  const sp = new URLSearchParams({ q: q.trim() })
  const res = await authFetch<unknown>(`/notifications/users/search?${sp.toString()}`)
  return parseOrThrow(notificationSearchUsersSchema, res, '/notifications/users/search')
}
