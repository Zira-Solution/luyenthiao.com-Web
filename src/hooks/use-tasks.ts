'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { claimTask, fetchMyTasks } from '@/lib/api/tasks'
import { retryTransient, useIsAuthenticated } from '@/lib/private-query'
import { queryKeys } from '@/lib/query-keys'

export function useMyTasks() {
  const enabled = useIsAuthenticated()
  return useQuery({
    queryKey: queryKeys.tasks(),
    queryFn: fetchMyTasks,
    enabled,
    retry: retryTransient,
  })
}

export function useClaimTask() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: claimTask,
    onSettled: () => queryClient.invalidateQueries({ queryKey: queryKeys.tasks() }),
  })
}
