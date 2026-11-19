import { z } from '@/lib/zod'

export const RANKING_PERIODS = ['week', 'month', 'all'] as const
export type RankingPeriod = (typeof RANKING_PERIODS)[number]

/** Public leaderboard row (backend M4): strict, so a returning identity field fails loudly. */
const studentRankSchema = z.strictObject({
  rank: z.number().int(),
  displayName: z.string(),
  schoolName: z.string(),
  totalPoints: z.number(),
})

const schoolRankSchema = z.object({
  rank: z.number().int(),
  schoolId: z.number().int(),
  name: z.string(),
  city: z.string(),
  studentCount: z.number().int(),
  totalPoints: z.number(),
})

export const studentRankingPageSchema = z.object({
  items: z.array(studentRankSchema),
  total: z.number().int(),
})
export const schoolRankingPageSchema = z.object({
  items: z.array(schoolRankSchema),
  total: z.number().int(),
})
export const myRankSchema = z.object({
  rank: z.number().int(),
  fullName: z.string(),
  schoolName: z.string(),
  totalPoints: z.number(),
})
export const publicSchoolsSchema = z.array(
  z.object({ id: z.number().int(), name: z.string(), city: z.string() }),
)

export type StudentRankingPage = z.output<typeof studentRankingPageSchema>
export type SchoolRankingPage = z.output<typeof schoolRankingPageSchema>
export type MyRank = z.output<typeof myRankSchema>
export type PublicSchool = z.output<typeof publicSchoolsSchema>[number]

export const RANKING_PAGE_SIZE = 50
