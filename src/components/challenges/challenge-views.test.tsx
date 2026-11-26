import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { ChallengeLobbyView } from '@/components/challenges/challenge-lobby-view'
import { ChallengeQuestionCard } from '@/components/challenges/challenge-question-card'
import { ChallengeResultView } from '@/components/challenges/challenge-result-view'
import type { ClientQuestion } from '@/schemas/challenge'
import { useAuthStore } from '@/store/auth-store'

const mocks = vi.hoisted(() => ({
  push: vi.fn(),
  replace: vi.fn(),
}))

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mocks.push, replace: mocks.replace }),
}))

vi.mock('@/hooks', () => ({
  usePublicExams: () => ({
    data: [
      {
        id: 'ex-1',
        name: 'Flyers Practice #1',
        levelSlug: 'flyers',
        levelName: 'FLYERS',
        skills: ['general'],
        order: 1,
      },
      {
        id: 'ex-w',
        name: 'Writing Only',
        levelSlug: 'flyers',
        levelName: 'FLYERS',
        skills: ['writing'],
        order: 2,
      },
    ],
    isPending: false,
  }),
  useChallengeHistory: () => ({
    data: [
      {
        resultId: 'res-abc',
        code: 'ZZ99KK',
        title: 'Flyers Speedrun',
        levelSlug: 'flyers',
        examId: 'ex-1',
        playedAt: '2026-11-26T09:00:00.000Z',
        totalQuestions: 5,
        myScore: 4,
        myRank: 1,
        playerCount: 2,
      },
    ],
    isPending: false,
  }),
  useChallengeResult: () => ({
    data: {
      id: 'res-abc',
      roomId: 'room-1',
      code: 'ZZ99KK',
      levelSlug: 'flyers',
      examId: 'ex-1',
      title: 'Flyers Speedrun',
      totalQuestions: 5,
      winnerId: 'p1',
      playedAt: '2026-11-26T09:00:00.000Z',
      players: [
        { id: 'p1', name: 'Minh', isBot: false, userId: 99, score: 5 },
        { id: 'p2', name: 'Bot Mây', isBot: true, userId: null, score: 3 },
      ],
    },
    isPending: false,
    error: null,
  }),
}))

describe('Challenge UI views', () => {
  beforeEach(() => {
    mocks.push.mockReset()
    mocks.replace.mockReset()
    useAuthStore.setState({
      status: 'authenticated',
      accessToken: 'jwt',
      user: { id: 99, role: 'USER', username: 'minh', fullName: 'Minh' } as never,
    })
  })

  afterEach(() => {
    cleanup()
    useAuthStore.setState({ status: 'idle', accessToken: null, user: null })
  })

  it('ChallengeLobbyView filters out writing/speaking exams, shows history, and joins room by code', () => {
    render(<ChallengeLobbyView planets={[]} initialSlug="flyers" />)

    expect(screen.getByText('Flyers Practice #1 (Flyers (A2))')).toBeInTheDocument()
    expect(screen.queryByText(/Writing Only/)).toBeNull()
    expect(screen.getByText('Flyers Speedrun')).toBeInTheDocument()
    expect(screen.getByText('Hạng #1')).toBeInTheDocument()

    fireEvent.change(screen.getByLabelText('Mã phòng thi đấu'), {
      target: { value: 'ab12cd' },
    })
    fireEvent.click(screen.getByRole('button', { name: /Tham Gia Ngay/i }))
    expect(mocks.push).toHaveBeenCalledWith('/challenges/room/AB12CD')
  })

  it('ChallengeQuestionCard renders multichoice & gapfill safely and emits detail updates', () => {
    const onChangeDetail = vi.fn()
    const q: ClientQuestion = {
      id: 'q1',
      kind: 'multichoice',
      title: 'Chọn từ đúng',
      promptHtml: '<p>Look at the picture</p>',
      details: [{ id: 'd1', label: 'The cat is ...', options: ['sleeping', 'running'] }],
    }
    const { rerender } = render(
      <ChallengeQuestionCard
        question={q}
        index={0}
        total={2}
        answers={{}}
        onChangeDetail={onChangeDetail}
      />,
    )
    fireEvent.click(screen.getByRole('button', { name: 'sleeping' }))
    expect(onChangeDetail).toHaveBeenCalledWith('d1', 'sleeping')

    const gf: ClientQuestion = {
      id: 'q2',
      kind: 'gapfill',
      title: 'Điền chỗ trống',
      promptHtml: '<p>She eats an {{1}}.</p>',
      details: [{ id: 'g1' }],
    }
    rerender(
      <ChallengeQuestionCard
        question={gf}
        index={1}
        total={2}
        answers={{}}
        onChangeDetail={onChangeDetail}
      />,
    )
    fireEvent.change(screen.getByLabelText('Ô trống 1'), { target: { value: 'apple' } })
    expect(onChangeDetail).toHaveBeenCalledWith('g1', 'apple')
  })

  it('ChallengeResultView highlights current player & displays final scoreboard', () => {
    render(<ChallengeResultView id="res-abc" />)
    expect(screen.getByText('Minh')).toBeInTheDocument()
    expect(screen.getByText('Bạn')).toBeInTheDocument()
    expect(screen.getByText('Bot Mây')).toBeInTheDocument()
    expect(screen.getByText('5 điểm')).toBeInTheDocument()
  })
})
