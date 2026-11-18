import { describe, expect, it } from 'vitest'

import { formatDateTimeVi, formatRelativeTimeVi } from '@/lib/format'

const now = new Date('2026-11-18T10:00:00.000Z')

describe('formatRelativeTimeVi', () => {
  it.each([
    ['2026-11-18T09:59:30.000Z', 'Vừa xong'],
    ['2026-11-18T09:55:00.000Z', '5 phút trước'],
    ['2026-11-18T07:00:00.000Z', '3 giờ trước'],
    ['2026-11-16T10:00:00.000Z', '2 ngày trước'],
    ['2026-11-01T10:00:00.000Z', '01/11/2026'],
    ['2026-11-18T10:05:00.000Z', 'Vừa xong'],
  ])('%s -> %s', (iso, expected) => {
    expect(formatRelativeTimeVi(iso, now)).toBe(expected)
  })

  it('returns an empty string for an invalid date', () => {
    expect(formatRelativeTimeVi('nope', now)).toBe('')
  })
})

describe('formatDateTimeVi', () => {
  it('formats in Vietnam time as dd/MM/yyyy HH:mm', () => {
    expect(formatDateTimeVi('2026-11-17T02:13:29.485Z')).toBe('17/11/2026 09:13')
  })

  it('returns an empty string for an invalid date', () => {
    expect(formatDateTimeVi('')).toBe('')
  })
})
