'use client'

import { useQuery } from '@tanstack/react-query'

import { fetchChallengeHistory, fetchChallengeResult } from '@/lib/api/challenges'
import { retryTransient, useIsAuthenticated } from '@/lib/private-query'
import { queryKeys } from '@/lib/query-keys'

export function useChallengeHistory() {
  const enabled = useIsAuthenticated()
  return useQuery({
    queryKey: queryKeys.myChallengeHistory(),
    queryFn: fetchChallengeHistory,
    enabled,
    retry: retryTransient,
  })
}

export function useChallengeResult(id: string, enabled = true) {
  return useQuery({
    queryKey: queryKeys.publicChallengeResult(id),
    queryFn: () => fetchChallengeResult(id),
    enabled: Boolean(id) && enabled,
    retry: 1,
  })
}
