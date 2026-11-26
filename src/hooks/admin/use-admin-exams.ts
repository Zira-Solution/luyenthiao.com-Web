'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import {
  createAdminExam,
  deleteAdminExam,
  getAdminExam,
  listAdminExams,
  toggleExamDemo,
  updateAdminExam,
} from '@/lib/api/admin'
import { retryTransient, useIsAuthenticated } from '@/lib/private-query'
import { queryKeys, type AdminExamQueryParams } from '@/lib/query-keys'
import type { Exam } from '@/types/exam'

export function useAdminExams(params?: AdminExamQueryParams) {
  const enabled = useIsAuthenticated()
  return useQuery({
    queryKey: queryKeys.adminExams(params),
    queryFn: async () => {
      const res = await listAdminExams(params)
      return Array.isArray(res) ? res : res.items
    },
    enabled,
    retry: retryTransient,
  })
}

export function useAdminExam(id: string) {
  const enabled = useIsAuthenticated() && Boolean(id) && id !== 'new'
  return useQuery({
    queryKey: queryKeys.adminExam(id),
    queryFn: () => getAdminExam(id),
    enabled,
    retry: retryTransient,
  })
}

export function useCreateAdminExam() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (exam: Exam) => createAdminExam(exam),
    onSuccess: (created) => {
      queryClient.setQueryData(queryKeys.adminExam(created.id), created)
      void queryClient.invalidateQueries({ queryKey: ['admin', 'exams'] })
      void queryClient.invalidateQueries({ queryKey: ['admin', 'questions'] })
    },
  })
}

export function useUpdateAdminExam() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, exam }: { id: string; exam: Exam }) => updateAdminExam(id, exam),
    onSuccess: (updated) => {
      queryClient.setQueryData(queryKeys.adminExam(updated.id), updated)
      void queryClient.invalidateQueries({ queryKey: ['admin', 'exams'] })
      void queryClient.invalidateQueries({ queryKey: ['admin', 'questions'] })
    },
  })
}

export function useToggleExamDemo() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, isDemo }: { id: string; isDemo: boolean }) => toggleExamDemo(id, isDemo),
    onSuccess: (updated) => {
      queryClient.setQueryData(queryKeys.adminExam(updated.id), updated)
      void queryClient.invalidateQueries({ queryKey: ['admin', 'exams'] })
    },
  })
}

export function useDeleteAdminExam() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteAdminExam(id),
    onSuccess: (_res, id) => {
      queryClient.removeQueries({ queryKey: queryKeys.adminExam(id) })
      void queryClient.invalidateQueries({ queryKey: ['admin', 'exams'] })
    },
  })
}
