import type { Metadata } from 'next'
import type { ReactElement } from 'react'

import { PlanetsAdminView } from '@/components/admin'

export const metadata: Metadata = {
  title: 'Quản trị Hành tinh | Luyenthiao CMS',
  description: 'Thêm, sửa, sắp xếp thứ tự và cấu hình hình ảnh R2 cho các hành tinh học tập.',
  keywords: ['admin', 'planets', 'worlds', 'Luyenthiao CMS'],
  alternates: { canonical: '/admin/planets' },
  robots: { index: false, follow: false },
  openGraph: {
    title: 'Quản trị Hành tinh | Luyenthiao CMS',
    description: 'Quản lý thế giới học tập Luyenthiao CMS.',
  },
}

export default function AdminPlanetsPage(): ReactElement {
  return <PlanetsAdminView />
}
