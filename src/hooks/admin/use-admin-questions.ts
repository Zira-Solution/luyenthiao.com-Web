'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import {
  createAdminQuestion,
  deleteAdminQuestion,
  listAdminQuestions,
  updateAdminQuestion,
} from '@/lib/api/admin'
import { retryTransient, useIsAuthenticated } from '@/lib/private-query'
import { queryKeys, type AdminQuestionQueryParams } from '@/lib/query-keys'
import type { PagedAdminQuestions, SaveAdminQuestionInput } from '@/schemas/admin-question'

function toPagedQuestions(
  res: Awaited<ReturnType<typeof listAdminQuestions>>,
  params?: AdminQuestionQueryParams,
): PagedAdminQuestions {
  if (!Array.isArray(res)) return res
  return {
    items: res,
    total: res.length,
    page: params?.page ?? 1,
    limit: params?.limit ?? (res.length || 20),
  }
}

export function useAdminQuestions(params?: AdminQuestionQueryParams, enabled = true) {
  const authed = useIsAuthenticated()
  return useQuery({
    queryKey: queryKeys.adminQuestions(params),
    queryFn: async () => toPagedQuestions(await listAdminQuestions(params), params),
    enabled: authed && enabled,
    retry: retryTransient,
  })
}

export function useCreateAdminQuestion() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: SaveAdminQuestionInput) => createAdminQuestion(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin', 'questions'] })
    },
  })
}

export function useUpdateAdminQuestion() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: SaveAdminQuestionInput }) =>
      updateAdminQuestion(id, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin', 'questions'] })
    },
  })
}

export function useDeleteAdminQuestion() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteAdminQuestion(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin', 'questions'] })
    },
  })
}
