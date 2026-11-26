'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import {
  createAdminSchool,
  deleteAdminSchool,
  listAdminSchools,
  updateAdminSchool,
} from '@/lib/api/admin/schools'
import { queryKeys } from '@/lib/query-keys'
import type { SaveAdminSchoolInput } from '@/schemas/admin-school'

export function useAdminSchools() {
  return useQuery({
    queryKey: queryKeys.adminSchools(),
    queryFn: listAdminSchools,
  })
}

export function useCreateAdminSchool() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: SaveAdminSchoolInput) => createAdminSchool(input),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.adminSchools() })
      void qc.invalidateQueries({ queryKey: queryKeys.adminStats() })
    },
  })
}

export function useUpdateAdminSchool() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: Partial<SaveAdminSchoolInput> }) =>
      updateAdminSchool(id, input),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.adminSchools() })
    },
  })
}

export function useDeleteAdminSchool() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => deleteAdminSchool(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.adminSchools() })
      void qc.invalidateQueries({ queryKey: queryKeys.adminStats() })
    },
  })
}
