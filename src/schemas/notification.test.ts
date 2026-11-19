import { describe, expect, it } from 'vitest'

import notifications from '@/schemas/__fixtures__/notifications.json'
import unread from '@/schemas/__fixtures__/unread.json'
import { notificationsSchema, toNotifications, unreadCountSchema } from '@/schemas/notification'

describe('notification schemas', () => {
  it('parse and map the real payload', () => {
    const first = notifications[0]
    if (!first) throw new Error('fixture is empty')
    const result = toNotifications(notificationsSchema.parse(notifications))
    expect(result).toHaveLength(notifications.length)
    expect(result[0]).toEqual({
      id: first.id,
      type: 'reward',
      title: first.title,
      message: first.message,
      createdAt: first.createdAt,
      read: first.isRead,
    })
    expect(unreadCountSchema.parse(unread)).toEqual({ count: 2 })
  })

  it('maps ANNOUNCEMENT and unknown types to system', () => {
    const rows = notificationsSchema.parse(notifications)
    const types = toNotifications(rows.map((r) => ({ ...r, type: 'ANNOUNCEMENT' })))
    expect(new Set(types.map((t) => t.type))).toEqual(new Set(['system']))
  })
})
