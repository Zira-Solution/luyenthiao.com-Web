import { z } from '@/lib/zod'

export const notebookSchema = z.array(
  z.object({
    id: z.number().int(),
    isFavorite: z.boolean(),
    memorized: z.boolean(),
    notes: z.string().nullable(),
    vocab: z.object({
      word: z.string(),
      ipa: z.string(),
      type: z.string(),
      meaningVi: z.string(),
      exampleEn: z.string().nullable(),
      exampleVi: z.string().nullable(),
      audioUrl: z.string(),
      level: z.string(),
    }),
  }),
)

export interface NotebookWord {
  id: number
  word: string
  ipa: string
  type: string
  meaningVi: string
  exampleEn: string | null
  exampleVi: string | null
  /** null when the backend has no recording (it sends ''). */
  audioUrl: string | null
  level: string
  isFavorite: boolean
  memorized: boolean
}

export function toNotebookWords(rows: z.output<typeof notebookSchema>): NotebookWord[] {
  return rows.map((row) => ({
    id: row.id,
    word: row.vocab.word,
    ipa: row.vocab.ipa,
    type: row.vocab.type,
    meaningVi: row.vocab.meaningVi,
    exampleEn: row.vocab.exampleEn || null,
    exampleVi: row.vocab.exampleVi || null,
    audioUrl: row.vocab.audioUrl || null,
    level: row.vocab.level,
    isFavorite: row.isFavorite,
    memorized: row.memorized,
  }))
}

export type NotebookPatch = Partial<Pick<NotebookWord, 'isFavorite' | 'memorized'>>
