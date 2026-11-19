'use client'

import { ApiError } from '@/lib/api-client'
import { useAuthStore } from '@/store/auth-store'

/** Retry only what may succeed on a second try: network failures and 5xx, at most twice. */
export function retryTransient(failureCount: number, error: unknown): boolean {
  return (
    failureCount < 2 && error instanceof ApiError && (error.status === 0 || error.status >= 500)
  )
}

/** Private queries run only for a signed-in student (`enabled`). */
export function useIsAuthenticated(): boolean {
  return useAuthStore((state) => state.status === 'authenticated')
}
