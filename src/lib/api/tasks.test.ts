import { describe, expect, it } from 'vitest'

import { claimErrorMessage } from '@/lib/api/tasks'
import { ApiError } from '@/lib/api-client'

describe('claimErrorMessage', () => {
  it.each([
    [400, 'Chưa hoàn thành nhiệm vụ.'],
    [404, 'Nhiệm vụ không còn tồn tại.'],
    [409, 'Bạn đã nhận thưởng nhiệm vụ này.'],
  ])('%i -> %s', (status, message) => {
    expect(claimErrorMessage(new ApiError('x', status, null, true))).toBe(message)
  })

  it('falls back to the ApiError message, then the generic one', () => {
    expect(claimErrorMessage(new ApiError('Máy chủ bận', 503))).toBe('Máy chủ bận')
    expect(claimErrorMessage(new Error('x'))).toBe(
      'Không thể kết nối máy chủ, vui lòng thử lại sau.',
    )
  })
})
