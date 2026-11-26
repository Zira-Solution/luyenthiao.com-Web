'use client'

import { useQuery } from '@tanstack/react-query'

import {
  getAdminStats,
  listAdminAttempts,
  listAdminChallengeResults,
  listAdminChallengeRooms,
  listAdminPoints,
} from '@/lib/api/admin/stats'
import { retryTransient, useIsAuthenticated } from '@/lib/private-query'
import {
  queryKeys,
  type AdminAttemptQueryParams,
  type AdminChallengeQueryParams,
  type AdminPointQueryParams,
} from '@/lib/query-keys'

export function useAdminStats() {
  const enabled = useIsAuthenticated()
  return useQuery({
    queryKey: queryKeys.adminStats(),
    queryFn: getAdminStats,
    enabled,
    retry: retryTransient,
  })
}

export function useAdminAttempts(params?: AdminAttemptQueryParams) {
  return useQuery({
    queryKey: queryKeys.adminAttempts(params),
    queryFn: () => listAdminAttempts(params),
  })
}

export function useAdminChallengeRooms(params?: AdminChallengeQueryParams) {
  return useQuery({
    queryKey: queryKeys.adminChallengeRooms(params),
    queryFn: () => listAdminChallengeRooms(params),
  })
}

export function useAdminChallengeResults(params?: AdminChallengeQueryParams) {
  return useQuery({
    queryKey: queryKeys.adminChallengeResults(params),
    queryFn: () => listAdminChallengeResults(params),
  })
}

export function useAdminPoints(params?: AdminPointQueryParams) {
  return useQuery({
    queryKey: queryKeys.adminPoints(params),
    queryFn: () => listAdminPoints(params),
  })
}
