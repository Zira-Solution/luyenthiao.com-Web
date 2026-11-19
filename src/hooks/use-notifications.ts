'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import {
  fetchMyNotifications,
  fetchUnreadCount,
  markAllNotificationsRead,
  markNotificationRead,
  type NotificationFilter,
} from '@/lib/api/notifications'
import { retryTransient, useIsAuthenticated } from '@/lib/private-query'
import { queryKeys } from '@/lib/query-keys'

export function useMyNotifications(filter: NotificationFilter) {
  const enabled = useIsAuthenticated()
  return useQuery({
    queryKey: queryKeys.notifications(filter),
    queryFn: () => fetchMyNotifications(filter),
    enabled,
    retry: retryTransient,
  })
}

export function useUnreadCount() {
  const enabled = useIsAuthenticated()
  return useQuery({
    queryKey: queryKeys.unreadCount(),
    queryFn: fetchUnreadCount,
    enabled,
    retry: retryTransient,
    staleTime: 60_000,
    refetchOnWindowFocus: true,
  })
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: markNotificationRead,
    onSettled: () => queryClient.invalidateQueries({ queryKey: queryKeys.notificationsAll() }),
  })
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: markAllNotificationsRead,
    onSettled: () => queryClient.invalidateQueries({ queryKey: queryKeys.notificationsAll() }),
  })
}
