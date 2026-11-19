import { z } from '@/lib/zod'
import type { Notification, NotificationType } from '@/types/notification'

export const notificationsSchema = z.array(
  z.object({
    id: z.number().int(),
    title: z.string(),
    message: z.string(),
    type: z.string(),
    createdAt: z.string(),
    isRead: z.boolean(),
  }),
)
export const unreadCountSchema = z.object({ count: z.number().int() })

const TYPE_MAP: Record<string, NotificationType> = { REWARD: 'reward', EVENT: 'event' }

export function toNotifications(rows: z.output<typeof notificationsSchema>): Notification[] {
  return rows.map((row) => ({
    id: row.id,
    type: TYPE_MAP[row.type] ?? 'system',
    title: row.title,
    message: row.message,
    createdAt: row.createdAt,
    read: row.isRead,
  }))
}
