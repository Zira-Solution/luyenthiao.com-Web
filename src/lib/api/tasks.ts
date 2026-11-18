import { parseOrThrow } from '@/lib/api/parse'
import { ApiError, GENERIC_ERROR_MESSAGE, authFetch } from '@/lib/api-client'
import { claimResultSchema, tasksSchema, toTasks } from '@/schemas/task'
import type { Task } from '@/types/task'

export async function fetchMyTasks(): Promise<Task[]> {
  return toTasks(parseOrThrow(tasksSchema, await authFetch<unknown>('/tasks/my'), '/tasks/my'))
}

export async function claimTask(id: number): Promise<number> {
  const data = await authFetch<unknown>(`/tasks/${id}/claim`, { method: 'POST' })
  return parseOrThrow(claimResultSchema, data, '/tasks/:id/claim').pointsAwarded
}

const CLAIM_ERRORS: Record<number, string> = {
  400: 'Chưa hoàn thành nhiệm vụ.',
  404: 'Nhiệm vụ không còn tồn tại.',
  409: 'Bạn đã nhận thưởng nhiệm vụ này.',
}

export function claimErrorMessage(error: unknown): string {
  if (error instanceof ApiError) return CLAIM_ERRORS[error.status] ?? error.message
  return GENERIC_ERROR_MESSAGE
}
