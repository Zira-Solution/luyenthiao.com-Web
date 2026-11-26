import { parseOrThrow } from '@/lib/api/parse'
import { apiFetch } from '@/lib/api-client'
import {
  publicVocabListSchema,
  type PublicVocabWord,
  type VocabSearchParams,
} from '@/schemas/vocab'

export async function searchPublicVocabClient(
  params: VocabSearchParams = {},
): Promise<PublicVocabWord[]> {
  const sp = new URLSearchParams()
  const q = params.q?.trim()
  const level = params.level?.trim()
  const topic = params.topic?.trim()
  if (q) sp.set('q', q)
  if (level && level !== 'ALL') sp.set('level', level)
  if (topic && topic !== 'ALL') sp.set('topic', topic)
  const qs = sp.toString()
  const path = qs ? `/vocab/search?${qs}` : '/vocab/search'
  const raw = await apiFetch<unknown>(path)
  return parseOrThrow(publicVocabListSchema, raw, path)
}
