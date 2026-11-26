'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { getAdminSiteConfig, saveAdminSiteConfig } from '@/lib/api/admin/site-config'
import { queryKeys } from '@/lib/query-keys'
import type { AdminSiteConfig } from '@/schemas/admin-site-config'

export function useAdminSiteConfig() {
  return useQuery({
    queryKey: queryKeys.adminSiteConfig(),
    queryFn: getAdminSiteConfig,
  })
}

export function useSaveAdminSiteConfig() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: AdminSiteConfig) => saveAdminSiteConfig(input),
    onSuccess: (saved) => {
      qc.setQueryData(queryKeys.adminSiteConfig(), saved)
    },
  })
}
