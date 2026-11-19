import { afterEach, describe, expect, it, vi } from 'vitest'

import { parseOrThrow } from '@/lib/api/parse'
import { ApiError, GENERIC_ERROR_MESSAGE } from '@/lib/api-client'
import { z } from '@/lib/zod'

describe('parseOrThrow', () => {
  afterEach(() => vi.restoreAllMocks())

  it('returns the parsed value', () => {
    expect(parseOrThrow(z.object({ n: z.number() }), { n: 1 }, '/x')).toEqual({ n: 1 })
  })

  it('throws a non-retryable ApiError and logs the path on a wrong shape', () => {
    const log = vi.spyOn(console, 'error').mockImplementation(() => {})
    let error: unknown
    try {
      parseOrThrow(z.object({ n: z.number() }), { n: 'one' }, '/tasks/my')
    } catch (err) {
      error = err
    }
    expect(error).toBeInstanceOf(ApiError)
    expect((error as ApiError).message).toBe(GENERIC_ERROR_MESSAGE)
    expect((error as ApiError).code).toBe('INVALID_RESPONSE')
    expect((error as ApiError).status).toBe(200)
    expect(log).toHaveBeenCalledWith(expect.stringContaining('/tasks/my'))
  })
})
