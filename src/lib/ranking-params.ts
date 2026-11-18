import { RANKING_PERIODS, type RankingPeriod } from '@/schemas/ranking'

export interface RankingQuery {
  period: RankingPeriod
  page: number
  schoolId?: number
}

type SearchParams = Record<string, string | string[] | undefined>

const MAX_PAGE = 100
const MAX_INT32 = 2_147_483_647

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value
}

function positiveInt(value: string | undefined, max?: number): number | undefined {
  if (!value || !/^\d+$/.test(value)) return undefined
  const n = Number(value)
  if (n < 1 || n > MAX_INT32 || (max !== undefined && n > max)) return undefined
  return n
}

/**
 * Only known values reach the backend: arbitrary query strings would multiply uncached backend calls
 * from Vercel's shared IPs (spec §2.1).
 */
export function parseRankingQuery(searchParams: SearchParams): RankingQuery {
  const rawPeriod = first(searchParams.period)
  const period = RANKING_PERIODS.find((p) => p === rawPeriod) ?? 'all'
  const page = positiveInt(first(searchParams.page), MAX_PAGE) ?? 1
  const schoolId = positiveInt(first(searchParams.school))
  return schoolId ? { period, page, schoolId } : { period, page }
}

export function toBackendPeriod(period: RankingPeriod): 'WEEK' | 'MONTH' | undefined {
  if (period === 'week') return 'WEEK'
  if (period === 'month') return 'MONTH'
  return undefined
}

export function rankingHref(base: string, query: RankingQuery): string {
  const params = new URLSearchParams()
  if (query.period !== 'all') params.set('period', query.period)
  if (query.schoolId) params.set('school', String(query.schoolId))
  if (query.page > 1) params.set('page', String(query.page))
  const qs = params.toString()
  return qs ? `${base}?${qs}` : base
}
