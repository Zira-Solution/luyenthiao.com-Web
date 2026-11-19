import { z } from '@/lib/zod'

export const historySchema = z.array(
  z.object({
    id: z.string(),
    kind: z.string(),
    title: z.string(),
    levelSlug: z.string(),
    score: z.number(),
    maxScore: z.number(),
    status: z.string(),
    correctCount: z.number().int(),
    totalQuestions: z.number().int(),
    timeSpentSec: z.number().int(),
    createdAt: z.string(),
    detailUrl: z.string(),
  }),
)
export type HistoryItem = z.output<typeof historySchema>[number]

export type HistoryKind = 'EXAM' | 'WRITING' | 'SPEAKING'
export type HistoryStatus = 'passed' | 'failed' | 'pending' | 'graded'

/** Server-side filters of GET /history/my. Omitted keys mean "all". */
export interface HistoryQuery {
  kind?: HistoryKind
  status?: HistoryStatus
  levelSlug?: string
}

export const HISTORY_KIND_LABELS: Record<HistoryKind, string> = {
  EXAM: 'Thi',
  WRITING: 'Viết',
  SPEAKING: 'Nói',
}
export const HISTORY_STATUS_LABELS: Record<HistoryStatus, string> = {
  passed: 'Đạt',
  failed: 'Chưa đạt',
  pending: 'Chờ chấm',
  graded: 'Đã chấm',
}

export function kindLabel(kind: string): string {
  return HISTORY_KIND_LABELS[kind as HistoryKind] ?? kind
}
export function statusLabel(status: string): string {
  return HISTORY_STATUS_LABELS[status as HistoryStatus] ?? status
}
