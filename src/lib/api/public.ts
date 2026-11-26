import 'server-only'

import type { PublicResult } from '@/lib/api/public-result'
import { env } from '@/lib/env'
import { toBackendPeriod, type RankingQuery } from '@/lib/ranking-params'
import { z } from '@/lib/zod'
import { examSchema } from '@/schemas/exam'
import { planetsSchema, toPlanets, type Planet } from '@/schemas/planet'
import {
  RANKING_PAGE_SIZE,
  publicSchoolsSchema,
  schoolRankingPageSchema,
  studentRankingPageSchema,
  type PublicSchool,
  type SchoolRankingPage,
  type StudentRankingPage,
} from '@/schemas/ranking'
import { publicExamListSchema, type PublicExamSummary } from '@/schemas/student-exam'
import type { Exam } from '@/types/exam'

const REVALIDATE_SECONDS = 60
const TIMEOUT_MS = 5000

/**
 * Public data for server components. Never throws: CI and Vercel build without a backend, and one
 * failing block must not take the page down (spec 2026-11-18-read-only-screens §2.1).
 */
async function getPublic<S extends z.ZodType>(
  path: string,
  schema: S,
  options: { noStore?: boolean } = {},
): Promise<PublicResult<z.output<S>>> {
  try {
    const response = await fetch(`${env.API_URL}${path}`, {
      headers: { Accept: 'application/json' },
      ...(options.noStore ? { cache: 'no-store' as const } : { next: { revalidate: REVALIDATE_SECONDS } }),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    })
    if (!response.ok) {
      console.error(`[public-api] ${path}: HTTP ${response.status}`)
      return { ok: false }
    }
    const parsed = schema.safeParse(await response.json())
    if (!parsed.success) {
      console.error(`[public-api] ${path}: unexpected response shape`)
      return { ok: false }
    }
    return { ok: true, data: parsed.data }
  } catch (error) {
    console.error(
      `[public-api] ${path}: ${error instanceof Error ? error.message : 'request failed'}`,
    )
    return { ok: false }
  }
}

export async function getPlanets(): Promise<PublicResult<Planet[]>> {
  const result = await getPublic('/planets/public', planetsSchema)
  return result.ok ? { ok: true, data: toPlanets(result.data) } : result
}

export function getStudentRanking(query: RankingQuery): Promise<PublicResult<StudentRankingPage>> {
  const params = new URLSearchParams({ page: String(query.page), limit: String(RANKING_PAGE_SIZE) })
  const period = toBackendPeriod(query.period)
  if (period) params.set('period', period)
  if (query.schoolId) params.set('schoolId', String(query.schoolId))
  return getPublic(`/ranking?${params}`, studentRankingPageSchema)
}

export function getSchoolRanking(
  query: Pick<RankingQuery, 'period' | 'page'>,
): Promise<PublicResult<SchoolRankingPage>> {
  const params = new URLSearchParams({ page: String(query.page), limit: String(RANKING_PAGE_SIZE) })
  const period = toBackendPeriod(query.period)
  if (period) params.set('period', period)
  return getPublic(`/ranking/schools?${params}`, schoolRankingPageSchema)
}

export function getPublicSchools(): Promise<PublicResult<PublicSchool[]>> {
  return getPublic('/schools/public', publicSchoolsSchema)
}

export function getPublicExams(
  level?: string,
  skill?: string,
): Promise<PublicResult<PublicExamSummary[]>> {
  const params = new URLSearchParams()
  if (level) params.set('level', level)
  if (skill) params.set('skill', skill)
  const qs = params.toString()
  return getPublic(qs ? `/exams/public?${qs}` : '/exams/public', publicExamListSchema, {
    noStore: true,
  })
}

export async function getPublicDemoExam(): Promise<PublicResult<Exam>> {
  const result = await getPublic('/exams/demo', examSchema, { noStore: true })
  return result.ok ? { ok: true, data: result.data as Exam } : result
}
