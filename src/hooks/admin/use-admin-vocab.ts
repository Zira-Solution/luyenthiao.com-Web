'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import {
  createAdminVocab,
  deleteAdminVocab,
  listAdminVocab,
  updateAdminVocab,
} from '@/lib/api/admin/vocab'
import { queryKeys, type AdminVocabQueryParams } from '@/lib/query-keys'
import type { SaveAdminVocabInput } from '@/schemas/admin-vocab'

export function useAdminVocab(params?: AdminVocabQueryParams) {
  return useQuery({
    queryKey: queryKeys.adminVocab(params),
    queryFn: () => listAdminVocab(params),
  })
}

export function useCreateAdminVocab() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: SaveAdminVocabInput) => createAdminVocab(input),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['admin', 'vocab'] })
      void qc.invalidateQueries({ queryKey: queryKeys.adminStats() })
    },
  })
}

export function useUpdateAdminVocab() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: Partial<SaveAdminVocabInput> }) =>
      updateAdminVocab(id, input),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['admin', 'vocab'] })
    },
  })
}

export function useDeleteAdminVocab() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => deleteAdminVocab(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['admin', 'vocab'] })
      void qc.invalidateQueries({ queryKey: queryKeys.adminStats() })
    },
  })
}
