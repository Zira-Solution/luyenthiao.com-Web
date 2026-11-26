'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import {
  createAdminTask,
  deleteAdminTask,
  listAdminTasks,
  updateAdminTask,
} from '@/lib/api/admin/tasks'
import { queryKeys } from '@/lib/query-keys'
import type { SaveAdminTaskInput } from '@/schemas/admin-task'

export function useAdminTasks() {
  return useQuery({
    queryKey: queryKeys.adminTasks(),
    queryFn: listAdminTasks,
  })
}

export function useCreateAdminTask() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: SaveAdminTaskInput) => createAdminTask(input),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.adminTasks() })
      void qc.invalidateQueries({ queryKey: queryKeys.adminStats() })
    },
  })
}

export function useUpdateAdminTask() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: Partial<SaveAdminTaskInput> }) =>
      updateAdminTask(id, input),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.adminTasks() })
    },
  })
}

export function useDeleteAdminTask() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => deleteAdminTask(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.adminTasks() })
      void qc.invalidateQueries({ queryKey: queryKeys.adminStats() })
    },
  })
}
