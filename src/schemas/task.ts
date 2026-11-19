import { z } from '@/lib/zod'
import type { Task, TaskGroup, TaskIcon } from '@/types/task'

export const tasksSchema = z.array(
  z.object({
    id: z.number().int(),
    title: z.string(),
    description: z.string(),
    category: z.string(),
    targetCount: z.number().int(),
    actionType: z.string(),
    points: z.number(),
    currentCount: z.number().int(),
    completed: z.boolean(),
    claimed: z.boolean(),
  }),
)
export const claimResultSchema = z.object({ success: z.literal(true), pointsAwarded: z.number() })

const GROUPS: Record<string, TaskGroup> = {
  DAILY: 'daily',
  WEEKLY: 'weekly',
  ACHIEVEMENT: 'achievement',
}
const ICONS: Record<string, TaskIcon> = {
  COMPLETE_EXAM: 'exam',
  SCORE_90: 'trophy',
  COMPLETE_SPEAKING: 'speaking',
  COMPLETE_WRITING: 'writing',
  PLAY_CHALLENGE: 'challenge',
}

export const TASK_GROUP_LABELS: Record<TaskGroup, string> = {
  daily: 'Nhiệm vụ hằng ngày',
  weekly: 'Nhiệm vụ hằng tuần',
  achievement: 'Thành tích',
  other: 'Nhiệm vụ khác',
}

export function toTasks(rows: z.output<typeof tasksSchema>): Task[] {
  return rows.map((row) => ({
    id: row.id,
    group: GROUPS[row.category] ?? 'other',
    icon: ICONS[row.actionType] ?? 'exam',
    title: row.title,
    description: row.description,
    progress: row.currentCount,
    target: row.targetCount,
    done: row.completed,
    claimed: row.claimed,
    points: row.points,
  }))
}
