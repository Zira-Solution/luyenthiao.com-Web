import { describe, expect, it } from 'vitest'

import {
  buildSubjectivePayloads,
  computeManualMaxScore,
  countWords,
  hydrateAnswersFromAttemptData,
  speakKey,
  toCheckpointSummary,
} from './student-exam'

import type { Exam } from '@/types/exam'

const sampleExam: Exam = {
  id: 'exam-1',
  name: 'Flyers Full Test',
  levelSlug: 'flyers',
  levelName: 'FLYERS',
  structures: [
    {
      id: 's1',
      name: 'Reading',
      minutes: 25,
      parts: [
        {
          id: 'p-mc',
          kind: 'multichoice',
          title: 'Part 1',
          questions: [
            {
              id: 'q1',
              isExample: false,
              details: [],
              correctLabel: 'A',
            },
          ],
        },
      ],
    },
    {
      id: 's2',
      name: 'Writing & Speaking',
      minutes: 20,
      parts: [
        {
          id: 'p-w',
          kind: 'write',
          title: 'Story Writing',
          maxScore: 5,
          questions: [],
        },
        {
          id: 'p-s',
          kind: 'speak',
          title: 'Speaking',
          maxScore: 10,
          speakKind: 'mic-plain',
          speakQuestions: [
            { id: 'sq1', kind: 'mic-plain', text: 'Tell me about your school.' },
            { id: 'sq2', kind: 'choose-object', text: 'Pick the red ball.' },
          ],
          questions: [],
        },
      ],
    },
  ],
}

describe('student-exam helpers', () => {
  it('counts words and computes manual maxScore cleanly', () => {
    expect(countWords('   ')).toBe(0)
    expect(countWords('One   two\nthree')).toBe(3)
    expect(computeManualMaxScore(sampleExam)).toBe(15)
  })

  it('builds writes and speaks payloads compatible with ExamAttemptsService', () => {
    const answers = {
      'p-w': { essay: 'Two kids went camping yesterday.' },
      'p-s': {
        [speakKey('sq1', 'duration')]: '6',
        [speakKey('sq2', 'selected')]: 'choice-b',
      },
    }
    const { writes, speaks } = buildSubjectivePayloads(sampleExam, answers, {
      'p-s::sq1': 'https://cdn.example.com/rec/sq1.webm',
    })

    expect(writes).toEqual([
      {
        partId: 'p-w',
        answerText: 'Two kids went camping yesterday.',
        wordCount: 5,
      },
    ])
    expect(speaks).toEqual([
      {
        partId: 'p-s',
        answers: {
          sq1: {
            questionId: 'sq1',
            answered: true,
            duration: 6,
            recorded: true,
            audioUrl: 'https://cdn.example.com/rec/sq1.webm',
          },
          sq2: {
            questionId: 'sq2',
            answered: true,
            selected: 'choice-b',
          },
        },
      },
    ])
  })

  it('rehydrates AnswerMap from stored backend attempt data', () => {
    const hydrated = hydrateAnswersFromAttemptData({
      answers: { 'p-mc': { q1: 'A' } },
      writes: [{ partId: 'p-w', answerText: 'Hello world', wordCount: 2 }],
      speaks: [
        {
          partId: 'p-s',
          answers: {
            sq1: { audioUrl: '/rec/a.webm', duration: 4 },
          },
        },
      ],
    })
    expect(hydrated['p-mc']).toEqual({ q1: 'A' })
    expect(hydrated['p-w']).toEqual({ essay: 'Hello world' })
    expect(hydrated['p-s']?.[speakKey('sq1', 'audioUrl')]).toBe('/rec/a.webm')
    expect(hydrated['p-s']?.[speakKey('sq1', 'duration')]).toBe('4')
  })

  it('summarizes exam structures for ExamModeSelectModal', () => {
    const summary = toCheckpointSummary(sampleExam, 3)
    expect(summary).toEqual({
      level: 'flyers',
      levelName: 'FLYERS',
      challengeNumber: 3,
      totalMinutes: 45,
      parts: [
        { name: 'Reading', minutes: 25, maxScore: 1 },
        { name: 'Writing & Speaking', minutes: 20, maxScore: 15 },
      ],
    })
  })
})
