'use client'

import { useUnreadCount } from '@/hooks/use-notifications'

/** Unread-notification counter for the bell. Guests have no data (the query is disabled), so it renders nothing. */
export function UnreadBadge(): React.ReactElement | null {
  const { data: count } = useUnreadCount()
  if (!count || count <= 0) return null
  return (
    <span
      role="status"
      aria-label={`${count} thông báo chưa đọc`}
      className="absolute -top-1.5 -right-1.5 flex h-4 min-w-4 items-center justify-center rounded-full border border-white bg-red-500 px-1 text-[9px] leading-none font-black text-white"
    >
      {count > 9 ? '9+' : count}
    </span>
  )
}
