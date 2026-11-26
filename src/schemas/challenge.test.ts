import { describe, expect, it } from 'vitest'

import {
  challengeHistoryListSchema,
  challengeResultSchema,
  countAnsweredQuestions,
  roomStateSchema,
  type ClientQuestion,
} from '@/schemas/challenge'

describe('challenge schemas & helpers', () => {
  it('parses room:state payload safely', () => {
    const state = roomStateSchema.parse({
      code: 'AB12CD',
      status: 'waiting',
      levelSlug: 'flyers',
      examId: 'exam-1',
      title: 'Đấu trường Flyers',
      maxPlayers: 4,
      totalQuestions: 5,
      players: [
        { id: 'p1', userId: 7, name: 'An', isBot: false, isHost: true, score: 0 },
        { id: 'p2', userId: null, name: 'Bot Sao', isBot: true, isHost: false, score: 0 },
      ],
    })
    expect(state.code).toBe('AB12CD')
    expect(state.players).toHaveLength(2)
    expect(state.players[0]?.isHost).toBe(true)
  })

  it('parses challenge history & result payloads', () => {
    const history = challengeHistoryListSchema.parse([
      {
        resultId: 'res-1',
        code: 'AB12CD',
        title: 'Flyers Race',
        levelSlug: 'flyers',
        examId: 'exam-1',
        playedAt: '2026-11-26T10:00:00.000Z',
        totalQuestions: 5,
        myScore: 4,
        myRank: 1,
        playerCount: 2,
      },
    ])
    expect(history[0]?.myRank).toBe(1)

    const result = challengeResultSchema.parse({
      id: 'res-1',
      roomId: 'room-1',
      code: 'AB12CD',
      levelSlug: 'flyers',
      examId: 'exam-1',
      title: 'Flyers Race',
      totalQuestions: 5,
      winnerId: 'p1',
      playedAt: '2026-11-26T10:00:00.000Z',
      players: [
        { id: 'p1', name: 'An', isBot: false, userId: 7, score: 4 },
        { id: 'p2', name: 'Bot Sao', isBot: true, userId: null, score: 2 },
      ],
    })
    expect(result.players[0]?.score).toBe(4)
  })

  it('counts only questions with non-empty answers', () => {
    const questions: ClientQuestion[] = [
      { id: 'q1', kind: 'multichoice', details: [{ id: 'd1', options: ['A', 'B'] }] },
      { id: 'q2', kind: 'gapfill', details: [{ id: 'd2' }] },
    ]
    expect(
      countAnsweredQuestions(questions, {
        q1: { d1: 'A' },
        q2: { d2: '   ' },
      }),
    ).toBe(1)
  })
})
