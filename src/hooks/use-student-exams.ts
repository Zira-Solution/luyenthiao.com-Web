'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import {
  fetchDemoExamClient,
  fetchExamAttempt,
  fetchExamById,
  fetchPublicExamsClient,
  fetchSpeakingHistory,
  fetchSpeakingSubmission,
  fetchWritingHistory,
  fetchWritingSubmission,
  submitExamAttempt,
  type SubmitExamAttemptInput,
} from '@/lib/api/student-exams'
import { useIsAuthenticated } from '@/lib/private-query'
import { queryKeys } from '@/lib/query-keys'

export function useStudentExam(id: string, enabled = true) {
  const authed = useIsAuthenticated()
  return useQuery({
    queryKey: queryKeys.myExam(id),
    queryFn: () => fetchExamById(id),
    enabled: Boolean(id) && enabled && authed,
  })
}

export function usePublicExams(level?: string, skill?: string, enabled = true) {
  return useQuery({
    queryKey: queryKeys.publicExams(level, skill),
    queryFn: () => fetchPublicExamsClient(level, skill),
    enabled,
    staleTime: 60_000,
  })
}

export function useDemoExam(enabled = true) {
  return useQuery({
    queryKey: queryKeys.demoExam(),
    queryFn: fetchDemoExamClient,
    enabled,
    retry: false,
  })
}

export function useExamAttempt(id: string, enabled = true) {
  const authed = useIsAuthenticated()
  return useQuery({
    queryKey: queryKeys.myExamAttempt(id),
    queryFn: () => fetchExamAttempt(id),
    enabled: Boolean(id) && enabled && authed,
  })
}

export function useSubmitExamAttempt() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: SubmitExamAttemptInput) => submitExamAttempt(input),
    onSuccess: (attempt) => {
      qc.setQueryData(queryKeys.myExamAttempt(attempt.id), attempt)
      void qc.invalidateQueries({ queryKey: queryKeys.me() })
    },
  })
}

export function useWritingSubmissionDetail(id: string, enabled = true) {
  const authed = useIsAuthenticated()
  return useQuery({
    queryKey: queryKeys.myWritingSubmission(id),
    queryFn: () => fetchWritingSubmission(id),
    enabled: Boolean(id) && enabled && authed,
  })
}

export function useWritingHistory(attemptId: string, enabled = true) {
  const authed = useIsAuthenticated()
  return useQuery({
    queryKey: queryKeys.myWritingHistory(attemptId),
    queryFn: () => fetchWritingHistory(attemptId),
    enabled: Boolean(attemptId) && enabled && authed,
  })
}

export function useSpeakingSubmissionDetail(id: string, enabled = true) {
  const authed = useIsAuthenticated()
  return useQuery({
    queryKey: queryKeys.mySpeakingSubmission(id),
    queryFn: () => fetchSpeakingSubmission(id),
    enabled: Boolean(id) && enabled && authed,
  })
}

export function useSpeakingHistory(attemptId: string, enabled = true) {
  const authed = useIsAuthenticated()
  return useQuery({
    queryKey: queryKeys.mySpeakingHistory(attemptId),
    queryFn: () => fetchSpeakingHistory(attemptId),
    enabled: Boolean(attemptId) && enabled && authed,
  })
}
