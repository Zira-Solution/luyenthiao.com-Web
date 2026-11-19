'use client'

import { keepPreviousData, useQuery } from '@tanstack/react-query'

import { fetchMyHistory } from '@/lib/api/history'
import { retryTransient, useIsAuthenticated } from '@/lib/private-query'
import { queryKeys } from '@/lib/query-keys'
import type { HistoryQuery } from '@/schemas/history'

export function useMyHistory(query: HistoryQuery) {
  const enabled = useIsAuthenticated()
  return useQuery({
    queryKey: queryKeys.history(query),
    queryFn: () => fetchMyHistory(query),
    enabled,
    placeholderData: keepPreviousData,
    retry: retryTransient,
  })
}
