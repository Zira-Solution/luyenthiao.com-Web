import { parseOrThrow } from '@/lib/api/parse'
import { authFetch } from '@/lib/api-client'
import { toBackendPeriod } from '@/lib/ranking-params'
import { myRankSchema, type MyRank, type RankingPeriod } from '@/schemas/ranking'

export async function fetchMyRank(period: RankingPeriod): Promise<MyRank> {
  const backendPeriod = toBackendPeriod(period)
  const path = backendPeriod ? `/ranking/me?period=${backendPeriod}` : '/ranking/me'
  return parseOrThrow(myRankSchema, await authFetch<unknown>(path), '/ranking/me')
}
