import type { Metadata } from 'next'

import { RankingView } from '@/components/ranking'
import { ROUTES } from '@/constants'
import { getPublicSchools, getStudentRanking } from '@/lib/api/public'
import { parseRankingQuery } from '@/lib/ranking-params'

export const metadata: Metadata = {
  title: 'Bảng xếp hạng',
  description: 'Xem thứ hạng học viên theo tuần, tháng và mọi thời gian.',
  keywords: ['bảng xếp hạng', 'xếp hạng học viên', 'luyện thi tiếng Anh'],
  alternates: { canonical: ROUTES.RANKING },
  openGraph: {
    title: 'Bảng xếp hạng | luyenthiao.com',
    description: 'Xem thứ hạng học viên theo tuần, tháng và mọi thời gian.',
    url: ROUTES.RANKING,
    type: 'website',
  },
}

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function RankingPage({
  searchParams,
}: PageProps): Promise<React.ReactElement> {
  const query = parseRankingQuery(await searchParams)
  const [ranking, schools] = await Promise.all([getStudentRanking(query), getPublicSchools()])
  return <RankingView query={query} ranking={ranking} schools={schools.ok ? schools.data : []} />
}
