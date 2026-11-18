import { describe, expect, it } from 'vitest'

import history from '@/schemas/__fixtures__/history.json'
import { historySchema, kindLabel, statusLabel } from '@/schemas/history'

describe('history schema', () => {
  it('parses the real payload', () => {
    expect(historySchema.parse(history)).toEqual(history)
  })

  it('labels kinds and statuses, passing unknown values through', () => {
    expect(kindLabel('EXAM')).toBe('Thi')
    expect(statusLabel('pending')).toBe('Chờ chấm')
    expect(statusLabel('archived')).toBe('archived')
  })
})
