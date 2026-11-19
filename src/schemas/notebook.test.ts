import { describe, expect, it } from 'vitest'

import notebook from '@/schemas/__fixtures__/notebook.json'
import { notebookSchema, toNotebookWords } from '@/schemas/notebook'

describe('notebook schema', () => {
  it('parses and flattens the real payload', () => {
    const [first] = toNotebookWords(notebookSchema.parse(notebook))
    const raw = notebook[0]
    if (!raw) throw new Error('fixture is empty')
    expect(first).toEqual({
      id: 3,
      word: 'curious',
      ipa: '/ˈkjʊəriəs/',
      type: 'adj',
      meaningVi: raw.vocab.meaningVi,
      exampleEn: raw.vocab.exampleEn,
      exampleVi: raw.vocab.exampleVi,
      audioUrl: null,
      level: 'starters',
      isFavorite: false,
      memorized: true,
    })
  })
})
