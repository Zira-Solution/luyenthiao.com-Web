import { parseOrThrow } from '@/lib/api/parse'
import { apiFetch, authFetch } from '@/lib/api-client'
import {
  challengeHistoryListSchema,
  challengeResultSchema,
  type ChallengeHistoryItem,
  type ChallengeResult,
} from '@/schemas/challenge'

export async function fetchChallengeHistory(): Promise<ChallengeHistoryItem[]> {
  const raw = await authFetch<unknown>('/challenges/history')
  return parseOrThrow(challengeHistoryListSchema, raw, '/challenges/history')
}

export async function fetchChallengeResult(id: string): Promise<ChallengeResult> {
  const path = `/challenges/result/${encodeURIComponent(id)}`
  const raw = await apiFetch<unknown>(path)
  return parseOrThrow(challengeResultSchema, raw, path)
}
