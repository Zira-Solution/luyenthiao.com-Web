import { z } from '@/lib/zod'
import { optStr } from '@/schemas/admin-common'

export const adminVocabWordSchema = z.object({
  id: z.number(),
  word: z.string(),
  ipa: optStr(),
  type: optStr('n'),
  meaningVi: z.string(),
  exampleEn: z.string().nullable().optional(),
  exampleVi: z.string().nullable().optional(),
  audioUrl: optStr(),
  level: optStr('starters'),
  topic: optStr(),
  active: z.boolean().default(true),
})

export const pagedAdminVocabSchema = z.object({
  items: z.array(adminVocabWordSchema),
  total: z.number(),
  page: z.number(),
  limit: z.number(),
})

export type AdminVocabWord = z.output<typeof adminVocabWordSchema>
export type PagedAdminVocab = z.output<typeof pagedAdminVocabSchema>

export interface SaveAdminVocabInput {
  word: string
  ipa?: string
  type?: string
  meaningVi: string
  exampleEn?: string
  exampleVi?: string
  audioUrl?: string
  level?: string
  topic?: string
  active?: boolean
}
