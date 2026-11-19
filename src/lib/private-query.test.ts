import { describe, expect, it } from 'vitest'

import { ApiError } from '@/lib/api-client'
import { retryTransient } from '@/lib/private-query'

describe('retryTransient', () => {
  it('retries network failures and 5xx at most twice', () => {
    expect(retryTransient(0, new ApiError('x', 0))).toBe(true)
    expect(retryTransient(1, new ApiError('x', 503))).toBe(true)
    expect(retryTransient(2, new ApiError('x', 503))).toBe(false)
  })

  it('never retries 4xx, a bad payload, or a non-ApiError', () => {
    expect(retryTransient(0, new ApiError('x', 401))).toBe(false)
    expect(retryTransient(0, new ApiError('x', 404))).toBe(false)
    expect(retryTransient(0, new ApiError('x', 200, 'INVALID_RESPONSE'))).toBe(false)
    expect(retryTransient(0, new Error('boom'))).toBe(false)
  })
})
