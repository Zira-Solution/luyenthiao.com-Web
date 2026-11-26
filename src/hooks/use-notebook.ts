'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import {
  deleteNotebookEntry,
  fetchMyNotebook,
  saveNotebookEntry,
  updateNotebookEntry,
} from '@/lib/api/notebook'
import { retryTransient, useIsAuthenticated } from '@/lib/private-query'
import { queryKeys } from '@/lib/query-keys'
import type { NotebookPatch } from '@/schemas/notebook'
import type { SaveNotebookWordInput } from '@/schemas/vocab'

export function useMyNotebook() {
  const enabled = useIsAuthenticated()
  return useQuery({
    queryKey: queryKeys.notebook(),
    queryFn: fetchMyNotebook,
    enabled,
    retry: retryTransient,
  })
}

export function useSaveNotebookEntry() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: SaveNotebookWordInput) => saveNotebookEntry(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.notebook() })
    },
  })
}

export function useUpdateNotebookEntry() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, patch }: { id: number; patch: NotebookPatch }) =>
      updateNotebookEntry(id, patch),
    onSettled: () => queryClient.invalidateQueries({ queryKey: queryKeys.notebook() }),
  })
}

export function useDeleteNotebookEntry() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteNotebookEntry,
    onSettled: () => queryClient.invalidateQueries({ queryKey: queryKeys.notebook() }),
  })
}
