import { describe, expect, it } from 'vitest'

import { validateExam } from '@/lib/admin-validate'
import type { Exam } from '@/types/exam'

function baseExam(): Exam {
  return {
    id: 'e1',
    name: 'Flyers Full',
    levelSlug: 'flyers',
    levelName: 'FLYERS',
    structures: [
      {
        id: 's1',
        name: 'Writing & Speaking',
        minutes: 20,
        parts: [],
      },
    ],
  }
}

describe('validateExam (write & speak)', () => {
  it('flags missing write prompt title/instruction and passes when complete', () => {
    const invalid = baseExam()
    invalid.structures[0]?.parts.push({
      id: 'pw',
      kind: 'write',
      title: 'Viết truyện',
      maxScore: 5,
      prompt: { title: '', instruction: '', images: [], sampleAnswer: '' },
      questions: [],
    })
    expect(validateExam(invalid).some((i) => i.key === 'pw.prompt')).toBe(true)

    const valid = baseExam()
    valid.structures[0]?.parts.push({
      id: 'pw',
      kind: 'write',
      title: 'Viết truyện',
      maxScore: 5,
      prompt: {
        title: 'Phần 1',
        instruction: 'Look at the pictures and write the story',
        images: [],
        sampleAnswer: 'Sample',
      },
      questions: [],
    })
    expect(validateExam(valid)).toEqual([])
  })

  it('flags empty speakQuestions and passes when configured', () => {
    const invalid = baseExam()
    invalid.structures[0]?.parts.push({
      id: 'ps',
      kind: 'speak',
      title: 'Nói phần 1',
      maxScore: 10,
      speakKind: 'mic-plain',
      speakQuestions: [],
      questions: [],
    })
    expect(validateExam(invalid).some((i) => i.key === 'ps.speakQuestions')).toBe(true)

    const valid = baseExam()
    valid.structures[0]?.parts.push({
      id: 'ps',
      kind: 'speak',
      title: 'Nói phần 1',
      maxScore: 10,
      speakKind: 'mic-plain',
      speakQuestions: [{ id: 'sq1', kind: 'mic-plain', text: 'Tell me about your school.' }],
      questions: [],
    })
    expect(validateExam(valid)).toEqual([])
  })
})
