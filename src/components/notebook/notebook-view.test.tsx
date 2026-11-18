import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { NotebookView } from '@/components/notebook/notebook-view'
import { ApiError } from '@/lib/api-client'
import notebook from '@/schemas/__fixtures__/notebook.json'
import { notebookSchema, toNotebookWords } from '@/schemas/notebook'

const words = toNotebookWords(notebookSchema.parse(notebook))
const update = vi.fn()
const remove = vi.fn()
const query = { data: words, isPending: false, error: null, refetch: vi.fn() }

vi.mock('@/hooks/use-notebook', () => ({
  useMyNotebook: () => query,
  useUpdateNotebookEntry: () => ({ mutate: update, isPending: false }),
  useDeleteNotebookEntry: () => ({ mutate: remove, isPending: false }),
}))

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}))

describe('NotebookView', () => {
  afterEach(() => {
    cleanup()
    update.mockReset()
    remove.mockReset()
    query.data = words
    vi.restoreAllMocks()
  })

  it('renders the student words', () => {
    render(<NotebookView />)
    for (const w of words) expect(screen.getAllByText(w.word).length).toBeGreaterThan(0)
  })

  it('shows grammar as coming soon', () => {
    render(<NotebookView />)
    fireEvent.click(screen.getByText('Ngữ pháp'))
    expect(screen.getByText('Ngữ pháp sắp có. Hãy quay lại sau nhé!')).toBeTruthy()
  })

  it('deletes a word after confirmation', () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true)
    render(<NotebookView />)
    const first = words[0]
    if (!first) throw new Error('expected a word')
    fireEvent.click(screen.getByRole('button', { name: `Xoá ${first.word}` }))
    expect(remove).toHaveBeenCalledWith(first.id, expect.anything())
  })

  it('does not delete when the confirmation is cancelled', () => {
    vi.spyOn(window, 'confirm').mockReturnValue(false)
    render(<NotebookView />)
    const first = words[0]
    if (!first) throw new Error('expected a word')
    fireEvent.click(screen.getByRole('button', { name: `Xoá ${first.word}` }))
    expect(remove).not.toHaveBeenCalled()
  })

  it('shows the API message when a mutation fails', () => {
    update.mockImplementation((_vars: unknown, options?: { onError?: (e: unknown) => void }) => {
      options?.onError?.(new ApiError('Không tìm thấy từ trong sổ tay.', 404, null, true))
    })
    render(<NotebookView />)
    const first = words[0]
    if (!first) throw new Error('expected a word')
    fireEvent.click(screen.getByRole('button', { name: `Đánh dấu sao ${first.word}` }))
    expect(screen.getByRole('alert').textContent).toBe('Không tìm thấy từ trong sổ tay.')
  })

  it('exposes the star state and toggles it', () => {
    render(<NotebookView />)
    const first = words[0]
    if (!first) throw new Error('expected a word')
    const star = screen.getByRole('button', { name: `Đánh dấu sao ${first.word}` })
    expect(star.getAttribute('aria-pressed')).toBe('false')
    fireEvent.click(star)
    expect(update).toHaveBeenCalledWith({ id: 3, patch: { isFavorite: true } }, expect.anything())
  })

  it('flips a card with its flip button, not when pressing the star', () => {
    render(<NotebookView />)
    const first = words[0]
    if (!first) throw new Error('expected a word')
    const flip = screen.getByRole('button', { name: `Lật thẻ ${first.word}` })
    expect(flip.getAttribute('aria-pressed')).toBe('false')
    fireEvent.click(screen.getByRole('button', { name: `Đánh dấu sao ${first.word}` }))
    expect(flip.getAttribute('aria-pressed')).toBe('false')
    fireEvent.click(flip)
    expect(flip.getAttribute('aria-pressed')).toBe('true')
  })

  it('shows the empty notebook message', () => {
    query.data = []
    render(<NotebookView />)
    expect(
      screen.getByText('Sổ tay trống. Từ bạn tra trong lúc làm bài sẽ xuất hiện ở đây.'),
    ).toBeTruthy()
  })
})
