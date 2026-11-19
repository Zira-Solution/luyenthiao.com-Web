import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { NotificationsView } from '@/components/notifications/notifications-view'
import notifications from '@/schemas/__fixtures__/notifications.json'
import { notificationsSchema, toNotifications } from '@/schemas/notification'

const data = toNotifications(notificationsSchema.parse(notifications))
const markRead = vi.fn()
const markAll = vi.fn()
const unread = { data: undefined as number | undefined }
const query = { data, isPending: false, error: null as Error | null, refetch: vi.fn() }

vi.mock('next/navigation', () => ({ useRouter: () => ({ push: vi.fn() }) }))
vi.mock('@/hooks/use-notifications', () => ({
  useMyNotifications: () => query,
  useUnreadCount: () => unread,
  useMarkNotificationRead: () => ({ mutate: markRead, isPending: false }),
  useMarkAllNotificationsRead: () => ({ mutate: markAll, isPending: false }),
}))

describe('NotificationsView', () => {
  afterEach(() => {
    cleanup()
    markRead.mockReset()
    markAll.mockReset()
    query.data = data
    query.error = null
    unread.data = undefined
  })

  it('renders the notifications from the API', () => {
    render(<NotificationsView />)
    for (const n of data) expect(screen.getByText(n.title)).toBeTruthy()
  })

  it('marks an unread notification as read when clicked', () => {
    render(<NotificationsView />)
    const target = data.find((n) => !n.read)
    if (!target) throw new Error('fixture has no unread notification')
    fireEvent.click(screen.getByText(target.title))
    expect(markRead).toHaveBeenCalledWith(target.id)
  })

  it('shows the error with a retry button', () => {
    query.data = undefined as unknown as typeof data
    query.error = new Error('Không thể kết nối máy chủ, vui lòng thử lại sau.')
    render(<NotificationsView />)
    fireEvent.click(screen.getByText('Thử lại'))
    expect(query.refetch).toHaveBeenCalled()
  })

  it('disables mark-all when the server unread count is 0', () => {
    unread.data = 0
    render(<NotificationsView />)
    const button = screen.getByText('Đánh dấu tất cả').closest('button') as HTMLButtonElement
    expect(button.disabled).toBe(true)
  })

  it('calls markAll when there are unread notifications', () => {
    unread.data = 2
    render(<NotificationsView />)
    fireEvent.click(screen.getByText('Đánh dấu tất cả'))
    expect(markAll).toHaveBeenCalled()
  })

  it('shows the empty state', () => {
    query.data = []
    render(<NotificationsView />)
    expect(screen.getByText('Không có thông báo nào.')).toBeTruthy()
  })
})
