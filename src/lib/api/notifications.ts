import { parseOrThrow } from '@/lib/api/parse'
import { authFetch } from '@/lib/api-client'
import { notificationsSchema, toNotifications, unreadCountSchema } from '@/schemas/notification'
import type { Notification } from '@/types/notification'

export type NotificationFilter = 'all' | 'unread'

export async function fetchMyNotifications(filter: NotificationFilter): Promise<Notification[]> {
  const data = await authFetch<unknown>(`/notifications/my?filter=${filter}`)
  return toNotifications(parseOrThrow(notificationsSchema, data, '/notifications/my'))
}

export async function fetchUnreadCount(): Promise<number> {
  const data = await authFetch<unknown>('/notifications/unread-count')
  return parseOrThrow(unreadCountSchema, data, '/notifications/unread-count').count
}

export async function markNotificationRead(id: number): Promise<void> {
  await authFetch<unknown>(`/notifications/${id}/read`, { method: 'POST' })
}

export async function markAllNotificationsRead(): Promise<void> {
  await authFetch<unknown>('/notifications/read-all', { method: 'POST' })
}
