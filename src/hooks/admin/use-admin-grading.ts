'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import {
  getAdminSpeakingSubmission,
  getAdminWritingSubmission,
  gradeSpeakingSubmission,
  gradeWritingSubmission,
  listAdminSpeakingQueue,
  listAdminWritingQueue,
} from '@/lib/api/admin/grading'
import { queryKeys, type AdminGradingQueueQueryParams } from '@/lib/query-keys'
import type { GradeSpeakingInput, GradeWritingInput } from '@/schemas/admin-grading'

export function useAdminWritingQueue(params?: AdminGradingQueueQueryParams) {
  return useQuery({
    queryKey: queryKeys.adminWritingQueue(params),
    queryFn: () => listAdminWritingQueue(params),
  })
}

export function useAdminWritingSubmission(id: string | null) {
  return useQuery({
    queryKey: queryKeys.adminWritingSubmission(id ?? ''),
    queryFn: () => getAdminWritingSubmission(id!),
    enabled: Boolean(id),
  })
}

export function useGradeWritingSubmission() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: GradeWritingInput }) =>
      gradeWritingSubmission(id, input),
    onSuccess: (updated, { id }) => {
      qc.setQueryData(queryKeys.adminWritingSubmission(id), updated)
      void qc.invalidateQueries({ queryKey: ['admin', 'grading'] })
      void qc.invalidateQueries({ queryKey: queryKeys.adminStats() })
    },
  })
}

export function useAdminSpeakingQueue(params?: AdminGradingQueueQueryParams) {
  return useQuery({
    queryKey: queryKeys.adminSpeakingQueue(params),
    queryFn: () => listAdminSpeakingQueue(params),
  })
}

export function useAdminSpeakingSubmission(id: string | null) {
  return useQuery({
    queryKey: queryKeys.adminSpeakingSubmission(id ?? ''),
    queryFn: () => getAdminSpeakingSubmission(id!),
    enabled: Boolean(id),
  })
}

export function useGradeSpeakingSubmission() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: GradeSpeakingInput }) =>
      gradeSpeakingSubmission(id, input),
    onSuccess: (updated, { id }) => {
      qc.setQueryData(queryKeys.adminSpeakingSubmission(id), updated)
      void qc.invalidateQueries({ queryKey: ['admin', 'grading'] })
      void qc.invalidateQueries({ queryKey: queryKeys.adminStats() })
    },
  })
}

export function useAdminGradingCounts(): {
  writingPending: number
  speakingPending: number
  totalPending: number
} {
  const writing = useAdminWritingQueue({ status: 'PENDING', page: 1, limit: 1 })
  const speaking = useAdminSpeakingQueue({ status: 'PENDING', page: 1, limit: 1 })
  const writingPending = writing.data?.counts.pending ?? 0
  const speakingPending = speaking.data?.counts.pending ?? 0
  return {
    writingPending,
    speakingPending,
    totalPending: writingPending + speakingPending,
  }
}
