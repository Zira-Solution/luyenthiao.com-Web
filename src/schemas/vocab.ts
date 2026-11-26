import { z } from '@/lib/zod'
import { optStr } from '@/schemas/admin-common'

export const publicVocabWordSchema = z.object({
  id: z.number().int(),
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

export const publicVocabListSchema = z.array(publicVocabWordSchema)

export type PublicVocabWord = z.output<typeof publicVocabWordSchema>

export const savedNotebookEntrySchema = z.object({
  id: z.number().int(),
  isFavorite: z.boolean(),
  memorized: z.boolean(),
  notes: z.string().nullable().optional(),
  vocab: publicVocabWordSchema.partial().extend({
    word: z.string(),
    meaningVi: z.string(),
  }),
})

export type SavedNotebookEntry = z.output<typeof savedNotebookEntrySchema>

export interface VocabSearchParams {
  q?: string
  level?: string
  topic?: string
}

export interface SaveNotebookWordInput {
  vocabId: number
  notes?: string
  isFavorite?: boolean
  memorized?: boolean
}
