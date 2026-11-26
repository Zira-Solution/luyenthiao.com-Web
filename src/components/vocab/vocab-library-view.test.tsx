import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { VocabLibraryView } from '@/components/vocab/vocab-library-view'
import type { PublicVocabWord } from '@/schemas/vocab'
import { useAuthStore } from '@/store/auth-store'

const mocks = vi.hoisted(() => ({
  saveMutate: vi.fn(),
  refetch: vi.fn(),
  words: [
    {
      id: 11,
      word: 'dolphin',
      ipa: '/ˈdɒlfɪn/',
      type: 'n',
      meaningVi: 'cá heo',
      exampleEn: 'Dolphins swim fast.',
      exampleVi: 'Cá heo bơi rất nhanh.',
      audioUrl: '',
      level: 'movers',
      topic: 'Animals',
      active: true,
    },
    {
      id: 12,
      word: 'telescope',
      ipa: '/ˈtelɪskəʊp/',
      type: 'n',
      meaningVi: 'kính thiên văn',
      exampleEn: '',
      exampleVi: '',
      audioUrl: '',
      level: 'flyers',
      topic: 'Space',
      active: true,
    },
  ] as PublicVocabWord[],
}))

vi.mock('@/hooks', () => ({
  useSearchVocab: () => ({
    data: mocks.words,
    isPending: false,
    error: null,
    refetch: mocks.refetch,
  }),
  useMyNotebook: () => ({
    data: [
      {
        id: 1,
        word: 'telescope',
        ipa: '/ˈtelɪskəʊp/',
        type: 'n',
        meaningVi: 'kính thiên văn',
        exampleEn: null,
        exampleVi: null,
        audioUrl: null,
        level: 'flyers',
        isFavorite: false,
        memorized: false,
      },
    ],
  }),
  useSaveNotebookEntry: () => ({
    mutate: mocks.saveMutate,
    isPending: false,
    variables: undefined,
  }),
}))

describe('VocabLibraryView', () => {
  beforeEach(() => {
    mocks.saveMutate.mockReset()
    useAuthStore.setState({
      status: 'authenticated',
      accessToken: 'token',
      user: { id: 1, role: 'USER', username: 'student' } as never,
    })
  })

  afterEach(() => {
    cleanup()
    useAuthStore.setState({ status: 'idle', accessToken: null, user: null })
  })

  it('renders searched vocab words, shows saved badge for existing notebook words, and calls save with optional note', () => {
    render(<VocabLibraryView />)

    expect(screen.getByText('dolphin')).toBeInTheDocument()
    expect(screen.getByText('cá heo')).toBeInTheDocument()
    expect(screen.getByText('Đã lưu · Cập nhật')).toBeInTheDocument()

    const noteButtons = screen.getAllByRole('button', { name: 'Ghi chú' })
    fireEvent.click(noteButtons[0]!)
    fireEvent.change(screen.getByLabelText('Ghi chú cho dolphin'), {
      target: { value: 'Động vật biển thông minh' },
    })

    fireEvent.click(screen.getByRole('button', { name: 'Lưu vào Sổ tay' }))
    expect(mocks.saveMutate).toHaveBeenCalledWith(
      { vocabId: 11, notes: 'Động vật biển thông minh' },
      expect.anything(),
    )
  })

  it('prompts guest users to log in before saving', () => {
    useAuthStore.setState({ status: 'idle', accessToken: null, user: null })
    render(<VocabLibraryView />)

    const links = screen.getAllByRole('link', { name: 'Đăng nhập để lưu' })
    expect(links.length).toBe(2)
    expect(links[0]?.getAttribute('href')).toContain('/login?redirect=')
  })
})
