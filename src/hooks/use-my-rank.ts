'use client'

import { useQuery } from '@tanstack/react-query'

import { fetchMyRank } from '@/lib/api/ranking-me'
import { retryTransient, useIsAuthenticated } from '@/lib/private-query'
import { queryKeys } from '@/lib/query-keys'
import type { RankingPeriod } from '@/schemas/ranking'

export function useMyRank(period: RankingPeriod) {
  const enabled = useIsAuthenticated()
  return useQuery({
    queryKey: queryKeys.myRank(period),
    queryFn: () => fetchMyRank(period),
    enabled,
    retry: retryTransient,
  })
}
