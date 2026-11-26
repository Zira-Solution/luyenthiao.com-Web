import { z } from '@/lib/zod'
import { optStr } from '@/schemas/admin-common'

export const NOTIFICATION_TYPES = ['SYSTEM', 'EVENT', 'REWARD', 'ANNOUNCEMENT'] as const

export const adminNotificationUserSchema = z.object({
  id: z.number(),
  username: z.string(),
  fullName: optStr(),
  email: optStr(),
})

export const adminNotificationSchema = z.object({
  id: z.number(),
  title: z.string(),
  message: z.string(),
  type: z.enum(NOTIFICATION_TYPES).catch('SYSTEM'),
  targetUserId: z.number().nullable().optional(),
  createdAt: z.string(),
  targetUser: adminNotificationUserSchema.nullable().optional(),
  _count: z
    .object({
      reads: z.number().default(0),
    })
    .optional(),
})

export const pagedAdminNotificationsSchema = z.object({
  items: z.array(adminNotificationSchema),
  total: z.number(),
  page: z.number(),
  limit: z.number(),
})

export const notificationSearchUserSchema = z.object({
  id: z.number(),
  username: z.string(),
  fullName: optStr(),
})

export const notificationSearchUsersSchema = z.array(notificationSearchUserSchema)

export type AdminNotification = z.output<typeof adminNotificationSchema>
export type PagedAdminNotifications = z.output<typeof pagedAdminNotificationsSchema>
export type NotificationSearchUser = z.output<typeof notificationSearchUserSchema>

export interface CreateAdminNotificationInput {
  title: string
  message: string
  type: (typeof NOTIFICATION_TYPES)[number]
  targetUserId?: number
}
