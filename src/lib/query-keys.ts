import type { HistoryQuery } from '@/schemas/history'
import type { RankingPeriod } from '@/schemas/ranking'

/**
 * Every query that holds one student's data starts with 'me', so PrivateDataCleanup can drop them all
 * when the session ends (spec 2026-11-18-read-only-screens §2.2).
 */
export const queryKeys = {
  me: () => ['me'] as const,
  notificationsAll: () => ['me', 'notifications'] as const,
  notifications: (filter: 'all' | 'unread') => ['me', 'notifications', 'list', filter] as const,
  unreadCount: () => ['me', 'notifications', 'unread-count'] as const,
  tasks: () => ['me', 'tasks'] as const,
  history: (query: HistoryQuery) => ['me', 'history', query] as const,
  notebook: () => ['me', 'notebook'] as const,
  myRank: (period: RankingPeriod) => ['me', 'rank', period] as const,
}
