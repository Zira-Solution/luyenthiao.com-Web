'use client'

import { useQuery } from '@tanstack/react-query'

import { searchPublicVocabClient } from '@/lib/api/vocab'
import { queryKeys } from '@/lib/query-keys'
import type { VocabSearchParams } from '@/schemas/vocab'

export function useSearchVocab(params: VocabSearchParams, enabled = true) {
  return useQuery({
    queryKey: queryKeys.publicVocabSearch(params),
    queryFn: () => searchPublicVocabClient(params),
    enabled,
    staleTime: 60_000,
  })
}
