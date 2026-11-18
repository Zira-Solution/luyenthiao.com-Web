import type { Metadata } from 'next'

import { DashboardView } from '@/components/dashboard'
import { ROUTES } from '@/constants'
import { getPlanets } from '@/lib/api/public'

export const metadata: Metadata = {
  title: 'Trang chủ',
  description: 'Chọn hành tinh và bắt đầu luyện thi tiếng Anh theo từng cấp độ.',
  keywords: ['luyện thi tiếng Anh', 'học tiếng Anh', 'thi thử', 'trang chủ'],
  alternates: { canonical: ROUTES.HOME },
  openGraph: {
    title: 'Trang chủ | luyenthiao.com',
    description: 'Chọn hành tinh và bắt đầu luyện thi tiếng Anh theo từng cấp độ.',
    url: ROUTES.HOME,
    type: 'website',
  },
}

export default async function DashboardPage(): Promise<React.ReactElement> {
  const result = await getPlanets()
  return <DashboardView planets={result.ok ? result.data : null} />
}
