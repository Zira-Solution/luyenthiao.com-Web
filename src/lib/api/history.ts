import { parseOrThrow } from '@/lib/api/parse'
import { authFetch } from '@/lib/api-client'
import { historySchema, type HistoryItem, type HistoryQuery } from '@/schemas/history'

export async function fetchMyHistory(query: HistoryQuery): Promise<HistoryItem[]> {
  const params = new URLSearchParams()
  if (query.kind) params.set('kind', query.kind)
  if (query.status) params.set('status', query.status)
  if (query.levelSlug) params.set('levelSlug', query.levelSlug)
  const qs = params.toString()
  const data = await authFetch<unknown>(qs ? `/history/my?${qs}` : '/history/my')
  return parseOrThrow(historySchema, data, '/history/my')
}
