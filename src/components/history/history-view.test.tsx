import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { HistoryView } from '@/components/history/history-view'
import history from '@/schemas/__fixtures__/history.json'

const calls: unknown[] = []
vi.mock('@/hooks/use-history', () => ({
  useMyHistory: (query: unknown) => {
    calls.push(query)
    return { data: history, isPending: false, error: null, refetch: vi.fn() }
  },
}))

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}))

describe('HistoryView', () => {
  afterEach(() => {
    cleanup()
    calls.length = 0
  })

  it('renders the attempts with labels', () => {
    render(<HistoryView />)
    const first = history[0]
    if (!first) throw new Error('fixture is empty')
    expect(screen.getByText(first.title)).toBeTruthy()
    expect(screen.getAllByText('Movers (A1)').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Chờ chấm').length).toBeGreaterThan(0)
    expect(screen.getAllByText('17/11/2026 09:13').length).toBeGreaterThan(0)
  })

  it('sends the kind filter to the server', () => {
    render(<HistoryView />)
    fireEvent.click(screen.getByText('Viết'))
    expect(calls.at(-1)).toEqual({ kind: 'WRITING' })
  })

  it('sends the status filter to the server', () => {
    render(<HistoryView />)
    fireEvent.change(screen.getByLabelText('Lọc theo trạng thái'), { target: { value: 'passed' } })
    expect(calls.at(-1)).toEqual({ status: 'passed' })
  })

  it('filters by title in the browser', () => {
    render(<HistoryView />)
    fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'không có' } })
    expect(screen.getByText('Chưa có bài làm nào.')).toBeTruthy()
  })
})
