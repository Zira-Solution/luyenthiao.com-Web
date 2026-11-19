'use client'

import { useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'

import { queryKeys } from '@/lib/query-keys'
import { useAuthStore } from '@/store/auth-store'

/**
 * Drops every 'me' query when the session ends or a different user signs in, so the next person on
 * the same tab never sees the previous student's data.
 */
export function PrivateDataCleanup(): null {
  const queryClient = useQueryClient()

  useEffect(
    () =>
      useAuthStore.subscribe((state, prev) => {
        const ended = prev.status === 'authenticated' && state.status !== 'authenticated'
        const switched =
          prev.status === 'authenticated' &&
          state.status === 'authenticated' &&
          prev.user?.id !== state.user?.id
        // Ended: nobody is signed in, so drop the data. Switched: removeQueries does not notify
        // mounted observers (screens would keep the previous user's data), so reset instead: it
        // cancels in-flight fetches, notifies observers and refetches active queries as the new user.
        if (ended) queryClient.removeQueries({ queryKey: queryKeys.me() })
        else if (switched) void queryClient.resetQueries({ queryKey: queryKeys.me() })
      }),
    [queryClient],
  )

  return null
}
