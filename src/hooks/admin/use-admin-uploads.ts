'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { deleteR2Upload, listR2Uploads, uploadR2File } from '@/lib/api/admin'
import { retryTransient, useIsAuthenticated } from '@/lib/private-query'
import { queryKeys, type AdminUploadQueryParams } from '@/lib/query-keys'

export function useR2Uploads(params?: AdminUploadQueryParams, enabled = true) {
  const authed = useIsAuthenticated()
  return useQuery({
    queryKey: queryKeys.adminUploads(params),
    queryFn: () => listR2Uploads(params),
    enabled: authed && enabled,
    retry: retryTransient,
  })
}

export function useUploadR2File() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (file: File) => uploadR2File(file),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin', 'uploads'] })
    },
  })
}

export function useDeleteR2Upload() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (key: string) => deleteR2Upload(key),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin', 'uploads'] })
    },
  })
}
