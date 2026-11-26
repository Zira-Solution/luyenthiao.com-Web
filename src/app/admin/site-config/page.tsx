import type { Metadata } from 'next'
import type { ReactElement } from 'react'

import { SiteConfigView } from '@/components/admin'

export const metadata: Metadata = {
  title: 'Cấu hình trang chủ | Luyenthiao CMS',
  description: 'Chỉnh sửa hình ảnh, icon, nhãn và ngôn ngữ giao diện hệ thống qua site-config.',
  keywords: ['admin', 'site-config', 'assets', 'Luyenthiao CMS'],
  alternates: { canonical: '/admin/site-config' },
  robots: { index: false, follow: false },
  openGraph: {
    title: 'Cấu hình trang chủ | Luyenthiao CMS',
    description: 'Quản lý cấu hình hình ảnh và ngôn ngữ Luyenthiao CMS.',
  },
}

export default function AdminSiteConfigPage(): ReactElement {
  return <SiteConfigView />
}
