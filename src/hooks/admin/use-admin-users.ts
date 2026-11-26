'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { getAdminUserDetail, listAdminUsers, updateAdminUser } from '@/lib/api/admin/users'
import { queryKeys, type AdminUserQueryParams } from '@/lib/query-keys'
import type { UpdateAdminUserInput } from '@/schemas/admin-users'

export function useAdminUsers(params?: AdminUserQueryParams) {
  return useQuery({
    queryKey: queryKeys.adminUsers(params),
    queryFn: () => listAdminUsers(params),
  })
}

export function useAdminUserDetail(id: number | null) {
  return useQuery({
    queryKey: queryKeys.adminUserDetail(id ?? 0),
    queryFn: () => getAdminUserDetail(id!),
    enabled: Boolean(id && id > 0),
  })
}

export function useUpdateAdminUser() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: UpdateAdminUserInput }) =>
      updateAdminUser(id, input),
    onSuccess: (_, { id }) => {
      void qc.invalidateQueries({ queryKey: ['admin', 'users'] })
      void qc.invalidateQueries({ queryKey: queryKeys.adminUserDetail(id) })
      void qc.invalidateQueries({ queryKey: queryKeys.adminStats() })
    },
  })
}
