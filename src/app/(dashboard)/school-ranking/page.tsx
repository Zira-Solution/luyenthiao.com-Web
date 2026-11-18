import type { Metadata } from 'next'

import { SchoolRankingView } from '@/components/ranking'
import { ROUTES } from '@/constants'
import { getSchoolRanking } from '@/lib/api/public'
import { parseRankingQuery } from '@/lib/ranking-params'

export const metadata: Metadata = {
  title: 'Xếp hạng trường',
  description: 'So sánh thành tích luyện thi tiếng Anh giữa các trường.',
  keywords: ['xếp hạng trường', 'thi đua', 'luyện thi tiếng Anh'],
  alternates: { canonical: ROUTES.SCHOOL_RANKING },
  openGraph: {
    title: 'Xếp hạng trường | luyenthiao.com',
    description: 'So sánh thành tích luyện thi tiếng Anh giữa các trường.',
    url: ROUTES.SCHOOL_RANKING,
    type: 'website',
  },
}

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function SchoolRankingPage({
  searchParams,
}: PageProps): Promise<React.ReactElement> {
  const query = parseRankingQuery(await searchParams)
  const ranking = await getSchoolRanking({ period: query.period, page: query.page })
  return <SchoolRankingView query={{ period: query.period, page: query.page }} ranking={ranking} />
}
