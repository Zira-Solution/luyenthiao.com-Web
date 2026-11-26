'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import {
  createAdminNotification,
  deleteAdminNotification,
  listAdminNotifications,
} from '@/lib/api/admin/notifications'
import { queryKeys, type AdminNotificationQueryParams } from '@/lib/query-keys'
import type { CreateAdminNotificationInput } from '@/schemas/admin-notification'

export function useAdminNotifications(params?: AdminNotificationQueryParams) {
  return useQuery({
    queryKey: queryKeys.adminNotifications(params),
    queryFn: () => listAdminNotifications(params),
  })
}

export function useCreateAdminNotification() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: CreateAdminNotificationInput) => createAdminNotification(input),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['admin', 'notifications'] })
      void qc.invalidateQueries({ queryKey: ['me', 'notifications'] })
    },
  })
}

export function useDeleteAdminNotification() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => deleteAdminNotification(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['admin', 'notifications'] })
    },
  })
}
