import { z } from '@/lib/zod'
import { optStr } from '@/schemas/admin-common'

export const TASK_CATEGORIES = ['DAILY', 'WEEKLY', 'ACHIEVEMENT'] as const
export const TASK_ACTION_TYPES = [
  'COMPLETE_EXAM',
  'COMPLETE_SPEAKING',
  'COMPLETE_WRITING',
  'PLAY_CHALLENGE',
  'WIN_CHALLENGE',
  'SCORE_90',
] as const

export const adminTaskSchema = z.object({
  id: z.number(),
  title: z.string(),
  description: optStr(),
  category: z.enum(TASK_CATEGORIES),
  targetCount: z.number().default(1),
  actionType: z.enum(TASK_ACTION_TYPES),
  points: z.number().default(10),
  active: z.boolean().default(true),
  sortOrder: z.number().default(0),
})

export const adminTasksSchema = z.array(adminTaskSchema)

export type AdminTask = z.output<typeof adminTaskSchema>

export interface SaveAdminTaskInput {
  title: string
  description?: string
  category: (typeof TASK_CATEGORIES)[number]
  targetCount: number
  actionType: (typeof TASK_ACTION_TYPES)[number]
  points: number
  active?: boolean
  sortOrder?: number
}
