import { describe, expect, it } from 'vitest'

import tasks from '@/schemas/__fixtures__/tasks.json'
import { tasksSchema, toTasks } from '@/schemas/task'

describe('task schemas', () => {
  it('parse and map the real payload', () => {
    const first = tasks[0]
    if (!first) throw new Error('fixture is empty')
    const result = toTasks(tasksSchema.parse(tasks))
    expect(result).toHaveLength(tasks.length)
    expect(result[0]).toEqual({
      id: 7,
      group: 'achievement',
      icon: 'exam',
      title: first.title,
      description: first.description,
      progress: 3,
      target: 20,
      done: false,
      claimed: false,
      points: 200,
    })
    expect(new Set(result.map((t) => t.group))).toEqual(new Set(['achievement', 'daily', 'weekly']))
  })

  it('maps unknown categories and actions to safe defaults', () => {
    const [row] = tasksSchema.parse(tasks)
    if (!row) throw new Error('fixture is empty')
    expect(toTasks([{ ...row, category: 'X', actionType: 'Y' }])[0]).toMatchObject({
      group: 'other',
      icon: 'exam',
    })
  })
})
