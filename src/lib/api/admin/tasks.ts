import { parseOrThrow } from '@/lib/api/parse'
import { authFetch } from '@/lib/api-client'
import {
  adminTaskSchema,
  adminTasksSchema,
  type AdminTask,
  type SaveAdminTaskInput,
} from '@/schemas/admin-task'

export async function listAdminTasks(): Promise<AdminTask[]> {
  const res = await authFetch<unknown>('/tasks')
  return parseOrThrow(adminTasksSchema, res, '/tasks')
}

export async function createAdminTask(input: SaveAdminTaskInput): Promise<AdminTask> {
  const res = await authFetch<unknown>('/tasks', {
    method: 'POST',
    body: JSON.stringify(input),
  })
  return parseOrThrow(adminTaskSchema, res, '/tasks')
}

export async function updateAdminTask(
  id: number,
  input: Partial<SaveAdminTaskInput>,
): Promise<AdminTask> {
  const res = await authFetch<unknown>(`/tasks/${id}`, {
    method: 'PUT',
    body: JSON.stringify(input),
  })
  return parseOrThrow(adminTaskSchema, res, '/tasks/:id')
}

export async function deleteAdminTask(id: number): Promise<unknown> {
  return authFetch<unknown>(`/tasks/${id}`, { method: 'DELETE' })
}
