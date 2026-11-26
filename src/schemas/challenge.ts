import { z } from '@/lib/zod'

export const REACTION_EMOJIS = ['👍', '❤️', '😂', '😮', '😢', '🔥'] as const
export type ReactionEmoji = (typeof REACTION_EMOJIS)[number]
export const REACTION_COOLDOWN_MS = 1500

export const challengeKindSchema = z.enum(['multichoice', 'gapfill', 'matching', 'dragdrop'])
export type ChallengeKind = z.output<typeof challengeKindSchema>

export const detailBoxSchema = z.object({
  left: z.string(),
  top: z.string(),
  width: z.string(),
  height: z.string(),
})

export const sanitizedDetailSchema = z.object({
  id: z.string(),
  label: z.string().optional(),
  options: z.array(z.string()).optional(),
  box: detailBoxSchema.nullable().optional(),
})

export const clientQuestionSchema = z.object({
  id: z.string(),
  kind: challengeKindSchema,
  title: z.string().nullable().optional(),
  promptHtml: z.string().nullable().optional(),
  wordBox: z.array(z.object({ label: z.string() })).nullable().optional(),
  details: z.array(sanitizedDetailSchema),
})

export type ClientQuestion = z.output<typeof clientQuestionSchema>

export const roomPlayerSchema = z.object({
  id: z.string(),
  userId: z.number().nullable().optional(),
  name: z.string(),
  isBot: z.boolean().default(false),
  isHost: z.boolean().default(false),
  score: z.number().default(0),
  answeredCount: z.number().default(0),
  submitted: z.boolean().default(false),
})

export type ChallengeRoomPlayer = z.output<typeof roomPlayerSchema>

export const roomStateSchema = z.object({
  code: z.string(),
  status: z.enum(['waiting', 'playing', 'finished']),
  levelSlug: z.string(),
  examId: z.string(),
  title: z.string(),
  maxPlayers: z.number(),
  totalQuestions: z.number().default(0),
  players: z.array(roomPlayerSchema),
})

export type ChallengeRoomState = z.output<typeof roomStateSchema>

export const gameBeginSchema = z.object({
  questions: z.array(clientQuestionSchema),
  total: z.number(),
  totalMs: z.number(),
  startedAt: z.number(),
  answers: z.record(z.string(), z.record(z.string(), z.string())).optional(),
  submitted: z.boolean().optional(),
})

export type ChallengeGameBegin = z.output<typeof gameBeginSchema>

export const leaderboardPayloadSchema = z.object({
  players: z.array(roomPlayerSchema),
})

export const reactionBroadcastSchema = z.object({
  playerId: z.string(),
  name: z.string(),
  emoji: z.string(),
})

export type ChallengeReaction = z.output<typeof reactionBroadcastSchema> & {
  receivedAt: number
  key: string
}

export const challengeHistoryItemSchema = z.object({
  resultId: z.string(),
  code: z.string(),
  title: z.string(),
  levelSlug: z.string(),
  examId: z.string(),
  playedAt: z.string(),
  totalQuestions: z.number(),
  myScore: z.number(),
  myRank: z.number().nullable().optional(),
  playerCount: z.number(),
})

export const challengeHistoryListSchema = z.array(challengeHistoryItemSchema)
export type ChallengeHistoryItem = z.output<typeof challengeHistoryItemSchema>

export const challengeResultPlayerSchema = z.object({
  id: z.string(),
  name: z.string(),
  isBot: z.boolean().default(false),
  userId: z.number().nullable().optional(),
  score: z.number().default(0),
})

export const challengeResultSchema = z.object({
  id: z.string(),
  roomId: z.string().nullable().optional(),
  code: z.string(),
  levelSlug: z.string(),
  examId: z.string(),
  title: z.string(),
  totalQuestions: z.number(),
  players: z.array(challengeResultPlayerSchema),
  winnerId: z.string().nullable().optional(),
  playedAt: z.string(),
})

export type ChallengeResult = z.output<typeof challengeResultSchema>

export type ChallengeAnswers = Record<string, Record<string, string>>

export function countAnsweredQuestions(
  questions: ClientQuestion[],
  answers: ChallengeAnswers,
): number {
  let count = 0
  for (const q of questions) {
    const ans = answers[q.id]
    if (!ans) continue
    if (Object.values(ans).some((v) => v && v.trim().length > 0)) {
      count++
    }
  }
  return count
}
