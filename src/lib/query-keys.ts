import type { HistoryQuery } from '@/schemas/history'
import type { RankingPeriod } from '@/schemas/ranking'

export interface AdminExamQueryParams {
  q?: string
  level?: string
  page?: number
  limit?: number
}

export interface AdminQuestionQueryParams {
  level?: string
  skill?: string
  kind?: string
  q?: string
  page?: number
  limit?: number
}

export interface AdminUploadQueryParams {
  type?: 'image' | 'audio'
  prefix?: string
  cursor?: string
  limit?: number
}

export interface AdminGradingQueueQueryParams {
  status?: 'PENDING' | 'GRADED'
  q?: string
  page?: number
  limit?: number
}

export interface AdminVocabQueryParams {
  level?: string
  topic?: string
  active?: boolean
  q?: string
  page?: number
  limit?: number
}

export interface AdminNotificationQueryParams {
  type?: string
  q?: string
  page?: number
  limit?: number
}

export interface AdminUserQueryParams {
  q?: string
  role?: 'USER' | 'ADMIN'
  schoolId?: number
  isBanned?: boolean
  page?: number
  limit?: number
}

export interface AdminAttemptQueryParams {
  q?: string
  level?: string
  userId?: number
  page?: number
  limit?: number
}

export interface AdminChallengeQueryParams {
  status?: string
  level?: string
  q?: string
  page?: number
  limit?: number
}

export interface AdminPointQueryParams {
  q?: string
  source?: string
  userId?: number
  page?: number
  limit?: number
}

/**
 * Every query that holds one student's data starts with 'me', and every CMS query starts with
 * 'admin', so PrivateDataCleanup drops both cleanly when the session ends or switches users.
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
  myExam: (id: string) => ['me', 'exams', 'detail', id] as const,
  myExamAttempt: (id: string) => ['me', 'exam-attempts', 'detail', id] as const,
  myWritingHistory: (attemptId: string) =>
    ['me', 'writing-submissions', 'history', attemptId] as const,
  myWritingSubmission: (id: string) => ['me', 'writing-submissions', 'detail', id] as const,
  mySpeakingHistory: (attemptId: string) =>
    ['me', 'speaking-submissions', 'history', attemptId] as const,
  mySpeakingSubmission: (id: string) => ['me', 'speaking-submissions', 'detail', id] as const,
  publicExams: (level?: string, skill?: string) =>
    ['public', 'exams', level ?? 'all', skill ?? 'all'] as const,
  demoExam: () => ['public', 'exams', 'demo'] as const,
  publicVocabSearch: (params?: { q?: string; level?: string; topic?: string }) =>
    ['public', 'vocab', 'search', params ?? {}] as const,
  publicSiteConfig: () => ['public', 'site-config'] as const,
  myChallengeHistory: () => ['me', 'challenges', 'history'] as const,
  publicChallengeResult: (id: string) => ['public', 'challenges', 'result', id] as const,

  admin: () => ['admin'] as const,
  adminStats: () => ['admin', 'stats'] as const,
  adminExams: (params?: AdminExamQueryParams) => ['admin', 'exams', 'list', params ?? {}] as const,
  adminExam: (id: string) => ['admin', 'exams', 'detail', id] as const,
  adminQuestions: (params?: AdminQuestionQueryParams) =>
    ['admin', 'questions', 'list', params ?? {}] as const,
  adminUploads: (params?: AdminUploadQueryParams) => ['admin', 'uploads', params ?? {}] as const,
  adminPlanets: () => ['admin', 'planets'] as const,
  adminSiteConfig: () => ['admin', 'site-config'] as const,
  adminWritingQueue: (params?: AdminGradingQueueQueryParams) =>
    ['admin', 'grading', 'writing', 'queue', params ?? {}] as const,
  adminWritingSubmission: (id: string) => ['admin', 'grading', 'writing', 'detail', id] as const,
  adminSpeakingQueue: (params?: AdminGradingQueueQueryParams) =>
    ['admin', 'grading', 'speaking', 'queue', params ?? {}] as const,
  adminSpeakingSubmission: (id: string) => ['admin', 'grading', 'speaking', 'detail', id] as const,
  adminGradingCounts: () => ['admin', 'grading', 'counts'] as const,
  adminVocab: (params?: AdminVocabQueryParams) => ['admin', 'vocab', 'list', params ?? {}] as const,
  adminTasks: () => ['admin', 'tasks', 'list'] as const,
  adminSchools: () => ['admin', 'schools', 'list'] as const,
  adminNotifications: (params?: AdminNotificationQueryParams) =>
    ['admin', 'notifications', 'list', params ?? {}] as const,
  adminUsers: (params?: AdminUserQueryParams) => ['admin', 'users', 'list', params ?? {}] as const,
  adminUserDetail: (id: number) => ['admin', 'users', 'detail', id] as const,
  adminAttempts: (params?: AdminAttemptQueryParams) => ['admin', 'attempts', params ?? {}] as const,
  adminChallengeRooms: (params?: AdminChallengeQueryParams) =>
    ['admin', 'challenges', 'rooms', params ?? {}] as const,
  adminChallengeResults: (params?: AdminChallengeQueryParams) =>
    ['admin', 'challenges', 'results', params ?? {}] as const,
  adminPoints: (params?: AdminPointQueryParams) => ['admin', 'points', params ?? {}] as const,
}
