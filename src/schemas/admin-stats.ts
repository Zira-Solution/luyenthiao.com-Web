import { z } from '@/lib/zod'
import { optStr } from '@/schemas/admin-common'

const briefUserSchema = z.object({
  id: z.number(),
  username: z.string(),
  fullName: optStr(),
})

export const recentAttemptItemSchema = z.object({
  id: z.string(),
  examId: z.string().nullable().optional(),
  examTitle: z.string(),
  levelSlug: optStr(),
  score: z.number(),
  total: z.number(),
  createdAt: z.string(),
  user: briefUserSchema.nullable().optional(),
})

export const adminStatsSchema = z.object({
  usersTotal: z.number(),
  usersBanned: z.number(),
  examsTotal: z.number(),
  examsDemo: z.number(),
  questionsTotal: z.number(),
  planetsTotal: z.number(),
  attemptsTotal: z.number(),
  writingPending: z.number(),
  speakingPending: z.number(),
  challengesTotal: z.number(),
  vocabTotal: z.number(),
  tasksTotal: z.number(),
  schoolsTotal: z.number(),
  recentAttempts: z.array(recentAttemptItemSchema).default([]),
})

export const adminAttemptRowSchema = z.object({
  id: z.string(),
  examId: z.string().nullable().optional(),
  userId: z.number(),
  levelSlug: optStr(),
  examTitle: z.string(),
  score: z.number(),
  total: z.number(),
  correctCount: z.number().default(0),
  totalQuestions: z.number().default(0),
  timeSpentSec: z.number().default(0),
  createdAt: z.string(),
  user: briefUserSchema.nullable().optional(),
  _count: z
    .object({
      writingSubmissions: z.number().default(0),
      speakingSubmissions: z.number().default(0),
    })
    .optional(),
})

export const pagedAdminAttemptsSchema = z.object({
  items: z.array(adminAttemptRowSchema),
  total: z.number(),
  page: z.number(),
  limit: z.number(),
})

export const challengePlayerRowSchema = z.object({
  id: z.string(),
  userId: z.number().nullable().optional(),
  name: z.string(),
  isBot: z.boolean().default(false),
  isHost: z.boolean().default(false),
  score: z.number().default(0),
})

export const adminChallengeRoomSchema = z.object({
  id: z.string(),
  code: z.string(),
  levelSlug: optStr(),
  examId: optStr(),
  title: optStr(),
  status: z.string(),
  maxPlayers: z.number().default(2),
  totalQuestions: z.number().default(0),
  createdAt: z.string(),
  startedAt: z.string().nullable().optional(),
  finishedAt: z.string().nullable().optional(),
  players: z.array(challengePlayerRowSchema).default([]),
})

export const pagedAdminChallengeRoomsSchema = z.object({
  items: z.array(adminChallengeRoomSchema),
  total: z.number(),
  page: z.number(),
  limit: z.number(),
})

export const adminChallengeResultSchema = z.object({
  id: z.string(),
  roomId: z.string().nullable().optional(),
  code: z.string(),
  levelSlug: optStr(),
  examId: optStr(),
  title: optStr(),
  totalQuestions: z.number().default(0),
  players: z.unknown(),
  winnerId: z.string().nullable().optional(),
  playedAt: z.string(),
})

export const pagedAdminChallengeResultsSchema = z.object({
  items: z.array(adminChallengeResultSchema),
  total: z.number(),
  page: z.number(),
  limit: z.number(),
})

export const adminPointLogSchema = z.object({
  id: z.number(),
  userId: z.number(),
  points: z.number(),
  source: z.string(),
  refId: optStr(),
  createdAt: z.string(),
  user: briefUserSchema.nullable().optional(),
})

export const pagedAdminPointsSchema = z.object({
  items: z.array(adminPointLogSchema),
  total: z.number(),
  page: z.number(),
  limit: z.number(),
})

export type AdminStats = z.output<typeof adminStatsSchema>
export type AdminAttemptRow = z.output<typeof adminAttemptRowSchema>
export type PagedAdminAttempts = z.output<typeof pagedAdminAttemptsSchema>
export type AdminChallengeRoom = z.output<typeof adminChallengeRoomSchema>
export type PagedAdminChallengeRooms = z.output<typeof pagedAdminChallengeRoomsSchema>
export type AdminChallengeResult = z.output<typeof adminChallengeResultSchema>
export type PagedAdminChallengeResults = z.output<typeof pagedAdminChallengeResultsSchema>
export type AdminPointLog = z.output<typeof adminPointLogSchema>
export type PagedAdminPoints = z.output<typeof pagedAdminPointsSchema>
