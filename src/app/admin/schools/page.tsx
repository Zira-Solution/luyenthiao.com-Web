import type { Metadata } from 'next'
import type { ReactElement } from 'react'

import { SchoolsAdminView } from '@/components/admin'

export const metadata: Metadata = {
  title: 'Quản lý Trường học | Luyenthiao CMS',
  description: 'Quản lý danh sách trường học liên kết và thống kê học viên.',
  keywords: ['admin', 'schools', 'Luyenthiao CMS'],
  alternates: { canonical: '/admin/schools' },
  robots: { index: false, follow: false },
  openGraph: {
    title: 'Quản lý Trường học | Luyenthiao CMS',
    description: 'Quản lý trường học Luyenthiao CMS.',
  },
}

export default function AdminSchoolsPage(): ReactElement {
  return <SchoolsAdminView />
}
