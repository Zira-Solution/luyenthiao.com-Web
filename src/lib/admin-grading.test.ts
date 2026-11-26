import { describe, expect, it } from 'vitest'

import {
  countSpeakingRecordedAnswers,
  extractSubmissionPartContext,
  normalizeWritingFeedback,
  resolveSpeakingAnswerAudio,
} from '@/lib/admin-grading'

describe('admin-grading helpers', () => {
  it('trích xuất đúng part theo partId và fallback maxScore 5/10', () => {
    const sub = {
      partId: 'pw-2',
      examAttempt: {
        id: 'att-1',
        examTitle: 'Flyers Test',
        createdAt: '2026-11-26T00:00:00Z',
        exam: {
          id: 'ex-1',
          name: 'Flyers Test',
          levelSlug: 'flyers',
          data: {
            structures: [
              {
                parts: [
                  { id: 'pw-1', kind: 'write', title: 'Write 1', maxScore: 5 },
                  {
                    id: 'pw-2',
                    kind: 'write',
                    title: 'Write 2',
                    maxScore: 15,
                    prompt: {
                      title: 'Story',
                      instruction: 'Look and write',
                      images: [],
                      sampleAnswer: 'Sample',
                    },
                  },
                ],
              },
            ],
          },
        },
      },
    }

    const ctx = extractSubmissionPartContext(sub, 'write')
    expect(ctx.maxScore).toBe(15)
    expect(ctx.prompt?.instruction).toBe('Look and write')

    const missingExamCtx = extractSubmissionPartContext(
      { partId: '', examAttempt: { id: 'a2', examTitle: 'X', createdAt: '', exam: null } },
      'speak',
    )
    expect(missingExamCtx.maxScore).toBe(10)
    expect(missingExamCtx.examDeleted).toBe(true)
  })

  it('chuẩn hóa feedback Writing từ null hoặc chuỗi hoặc object', () => {
    expect(normalizeWritingFeedback(null)).toEqual({ comment: '', errors: '', tips: '' })
    expect(normalizeWritingFeedback('Tốt')).toEqual({ comment: 'Tốt', errors: '', tips: '' })
    expect(normalizeWritingFeedback({ comment: 'Ok', tips: 'More details' })).toEqual({
      comment: 'Ok',
      errors: '',
      tips: 'More details',
    })
  })

  it('phân giải URL audio Speaking hỗ trợ R2, relative /rec và cảnh báo blob-only', () => {
    expect(
      resolveSpeakingAnswerAudio({ audioUrl: 'https://cdn.example.com/rec/a.webm' }, ''),
    ).toEqual({
      kind: 'audio',
      url: 'https://cdn.example.com/rec/a.webm',
      relativeWarning: false,
    })

    expect(
      resolveSpeakingAnswerAudio({ audioUrl: '/rec/a.webm' }, 'https://cdn.example.com/'),
    ).toEqual({
      kind: 'audio',
      url: 'https://cdn.example.com/rec/a.webm',
      relativeWarning: false,
    })

    expect(resolveSpeakingAnswerAudio({ audioUrl: '/rec/a.webm' }, '')).toEqual({
      kind: 'audio',
      url: '/rec/a.webm',
      relativeWarning: true,
    })

    expect(resolveSpeakingAnswerAudio({ blobUrl: 'blob:http://localhost/123' }, '')).toEqual({
      kind: 'blob-only',
      blobUrl: 'blob:http://localhost/123',
    })

    expect(resolveSpeakingAnswerAudio({ audioUrl: 'javascript:alert(1)' }, '')).toEqual({
      kind: 'none',
    })
  })

  it('đếm số câu đã trả lời và có audio cloud', () => {
    expect(
      countSpeakingRecordedAnswers({
        q1: { answered: true, audioUrl: '/rec/1.webm' },
        q2: { answered: true, selected: 'slot-1' },
        q3: { answered: false },
      }),
    ).toEqual({ totalAnswered: 2, cloudAudioCount: 1 })
  })
})
