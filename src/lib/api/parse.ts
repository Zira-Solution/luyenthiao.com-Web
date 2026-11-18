import { ApiError, GENERIC_ERROR_MESSAGE } from '@/lib/api-client'
import type { z } from '@/lib/zod'

/**
 * Validates a private API response. A wrong shape means the contract drifted: log the path (never the
 * body, it holds a student's data) and throw a non-retryable error the UI shows generically.
 */
export function parseOrThrow<S extends z.ZodType>(
  schema: S,
  data: unknown,
  path: string,
): z.output<S> {
  const parsed = schema.safeParse(data)
  if (!parsed.success) {
    console.error(`[api] ${path}: unexpected response shape`)
    throw new ApiError(GENERIC_ERROR_MESSAGE, 200, 'INVALID_RESPONSE')
  }
  return parsed.data
}
