import type { Metadata } from 'next'
import type { ReactElement } from 'react'

import { AdminOverview } from '@/components/admin'

export const metadata: Metadata = {
  title: 'Tổng quan quản trị | Luyenthiao CMS',
  description: 'Trung tâm quản lý nội dung và đề thi trên Luyenthiao CMS.',
  keywords: ['admin', 'cms', 'luyenthiao', 'quản trị'],
  alternates: { canonical: '/admin' },
  robots: { index: false, follow: false },
  openGraph: {
    title: 'Tổng quan quản trị | Luyenthiao CMS',
    description: 'Trung tâm quản lý nội dung và đề thi trên Luyenthiao CMS.',
  },
}

export default function AdminOverviewPage(): ReactElement {
  return <AdminOverview />
}
