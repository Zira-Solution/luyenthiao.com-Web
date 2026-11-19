import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { UnreadBadge } from '@/components/common/unread-badge'

const state = { count: 0 as number | undefined }
vi.mock('@/hooks/use-notifications', () => ({ useUnreadCount: () => ({ data: state.count }) }))

describe('UnreadBadge', () => {
  afterEach(() => cleanup())

  it('renders nothing without unread notifications', () => {
    state.count = 0
    const { container } = render(<UnreadBadge />)
    expect(container.textContent).toBe('')
  })

  it('shows the count, capped at 9+', () => {
    state.count = 2
    render(<UnreadBadge />)
    expect(screen.getByLabelText('2 thông báo chưa đọc').textContent).toBe('2')
    cleanup()
    state.count = 12
    render(<UnreadBadge />)
    expect(screen.getByLabelText('12 thông báo chưa đọc').textContent).toBe('9+')
  })
})
