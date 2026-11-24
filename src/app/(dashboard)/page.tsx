import type { Metadata } from 'next'

import { DashboardView } from '@/components/dashboard'
import { ROUTES } from '@/constants'
import { getPlanets } from '@/lib/api/public'
import fixturePlanets from '@/schemas/__fixtures__/planets.json'
import { toPlanets } from '@/schemas/planet'

export const metadata: Metadata = {
  title: 'Trang chủ',
  description: 'Khám Phá Các Thế Giới Diệu Kỳ và bắt đầu luyện thi tiếng Anh theo từng cấp độ.',
  keywords: ['luyện thi tiếng Anh', 'học tiếng Anh', 'thi thử', 'trang chủ', 'thế giới diệu kỳ'],
  alternates: { canonical: ROUTES.HOME },
  openGraph: {
    title: 'Khám Phá Các Thế Giới Diệu Kỳ | luyenthiao.com',
    description: 'Khám Phá Các Thế Giới Diệu Kỳ và bắt đầu luyện thi tiếng Anh theo từng cấp độ.',
    url: ROUTES.HOME,
    type: 'website',
  },
}

interface DashboardPageProps {
  searchParams?: Promise<{ planet?: string }>
}

export default async function DashboardPage({
  searchParams,
}: DashboardPageProps): Promise<React.ReactElement> {
  const [result, resolvedParams] = await Promise.all([
    getPlanets(),
    searchParams ? searchParams : Promise.resolve(undefined),
  ])

  // Fallback gracefully to fixture data when backend is not running (e.g. mobile UI testing)
  const planets = result.ok ? result.data : toPlanets(fixturePlanets)

  return <DashboardView planets={planets} initialSlug={resolvedParams?.planet} />
}
