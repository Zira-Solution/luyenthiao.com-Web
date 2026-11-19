import { describe, expect, it } from 'vitest'

import { parseRankingQuery, rankingHref, toBackendPeriod } from '@/lib/ranking-params'

describe('parseRankingQuery', () => {
  it('defaults to all time, page 1, no school', () => {
    expect(parseRankingQuery({})).toEqual({ period: 'all', page: 1 })
  })

  it('accepts valid values', () => {
    expect(parseRankingQuery({ period: 'week', page: '3', school: '4' })).toEqual({
      period: 'week',
      page: 3,
      schoolId: 4,
    })
  })

  it('falls back on anything else', () => {
    expect(parseRankingQuery({ period: 'day', page: '0', school: 'x' })).toEqual({
      period: 'all',
      page: 1,
    })
    expect(parseRankingQuery({ school: '99999999999999999999' })).toEqual({
      period: 'all',
      page: 1,
    })
    expect(parseRankingQuery({ page: '101' })).toEqual({ period: 'all', page: 1 })
    expect(parseRankingQuery({ page: '2.5', school: '-1' })).toEqual({ period: 'all', page: 1 })
    expect(parseRankingQuery({ period: ['month', 'week'] })).toEqual({ period: 'month', page: 1 })
  })
})

describe('toBackendPeriod', () => {
  it('maps week/month and omits all', () => {
    expect(toBackendPeriod('week')).toBe('WEEK')
    expect(toBackendPeriod('month')).toBe('MONTH')
    expect(toBackendPeriod('all')).toBeUndefined()
  })
})

describe('rankingHref', () => {
  it('omits defaults', () => {
    expect(rankingHref('/ranking', { period: 'all', page: 1 })).toBe('/ranking')
    expect(rankingHref('/ranking', { period: 'month', page: 2, schoolId: 3 })).toBe(
      '/ranking?period=month&school=3&page=2',
    )
  })
})
