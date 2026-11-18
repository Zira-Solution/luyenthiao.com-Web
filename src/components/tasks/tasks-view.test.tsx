import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { TasksView } from '@/components/tasks/tasks-view'
import { ApiError } from '@/lib/api-client'
import tasks from '@/schemas/__fixtures__/tasks.json'
import { tasksSchema, toTasks } from '@/schemas/task'
import type { Task } from '@/types/task'

const base = toTasks(tasksSchema.parse(tasks))
const first = base[0] as Task
const claimable = { ...(base[1] as Task), done: true, claimed: false }
const claimed = { ...(base[2] as Task), done: true, claimed: true }
const data = [first, claimable, claimed, ...base.slice(3)]
const mutate = vi.fn()
const claimState = { isPending: false }

vi.mock('next/navigation', () => ({ useRouter: () => ({ push: vi.fn() }) }))
vi.mock('@/hooks/use-tasks', () => ({
  useMyTasks: () => ({ data, isPending: false, error: null, refetch: vi.fn() }),
  useClaimTask: () => ({ mutate, isPending: claimState.isPending }),
}))

describe('TasksView', () => {
  afterEach(() => {
    cleanup()
    mutate.mockReset()
    claimState.isPending = false
  })

  it('groups tasks under their headings and shows points', () => {
    render(<TasksView />)
    expect(screen.getByText('Thành tích')).toBeTruthy()
    expect(screen.getByText('Nhiệm vụ hằng ngày')).toBeTruthy()
    expect(screen.getAllByText(`${first.points} điểm`).length).toBeGreaterThan(0)
    expect(screen.queryByText('120')).toBeNull()
  })

  it('claims a completed task', () => {
    render(<TasksView />)
    fireEvent.click(screen.getByText('Nhận thưởng'))
    expect(mutate).toHaveBeenCalledWith(claimable.id, expect.any(Object))
  })

  it('disables claimed tasks', () => {
    render(<TasksView />)
    expect((screen.getByText('Đã nhận').closest('button') as HTMLButtonElement).disabled).toBe(true)
  })

  it('does not claim while a claim is pending', () => {
    claimState.isPending = true
    render(<TasksView />)
    fireEvent.click(screen.getByText('Nhận thưởng'))
    expect(mutate).not.toHaveBeenCalled()
  })

  it('does not claim when the card body is clicked', () => {
    render(<TasksView />)
    fireEvent.click(screen.getByText(claimable.title))
    expect(mutate).not.toHaveBeenCalled()
  })

  it('shows the claim notice on success', () => {
    mutate.mockImplementation((_id: number, options: { onSuccess: (points: number) => void }) =>
      options.onSuccess(50),
    )
    render(<TasksView />)
    fireEvent.click(screen.getByText('Nhận thưởng'))
    expect(screen.getByText('+50 điểm')).toBeTruthy()
  })

  it('shows the mapped claim error', () => {
    mutate.mockImplementation((_id: number, options: { onError: (error: unknown) => void }) =>
      options.onError(new ApiError('x', 409, null, true)),
    )
    render(<TasksView />)
    fireEvent.click(screen.getByText('Nhận thưởng'))
    expect(screen.getByText('Bạn đã nhận thưởng nhiệm vụ này.')).toBeTruthy()
  })
})
