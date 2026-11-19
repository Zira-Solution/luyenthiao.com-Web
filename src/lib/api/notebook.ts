import { parseOrThrow } from '@/lib/api/parse'
import { authFetch } from '@/lib/api-client'
import {
  notebookSchema,
  toNotebookWords,
  type NotebookPatch,
  type NotebookWord,
} from '@/schemas/notebook'

export async function fetchMyNotebook(): Promise<NotebookWord[]> {
  return toNotebookWords(
    parseOrThrow(notebookSchema, await authFetch<unknown>('/notebook/my'), '/notebook/my'),
  )
}

export async function updateNotebookEntry(id: number, patch: NotebookPatch): Promise<void> {
  await authFetch<unknown>(`/notebook/${id}`, { method: 'PATCH', body: JSON.stringify(patch) })
}

export async function deleteNotebookEntry(id: number): Promise<void> {
  await authFetch<unknown>(`/notebook/${id}`, { method: 'DELETE' })
}
