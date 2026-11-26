import type { Metadata } from 'next'
import type { ReactElement } from 'react'

import { NotificationsAdminView } from '@/components/admin'

export const metadata: Metadata = {
  title: 'Quản lý Thông báo | Luyenthiao CMS',
  description: 'Gửi thông báo toàn hệ thống hoặc tới từng học viên và quản lý thông báo đã gửi.',
  keywords: ['admin', 'notifications', 'Luyenthiao CMS'],
  alternates: { canonical: '/admin/notifications' },
  robots: { index: false, follow: false },
  openGraph: {
    title: 'Quản lý Thông báo | Luyenthiao CMS',
    description: 'Quản lý thông báo Luyenthiao CMS.',
  },
}

export default function AdminNotificationsPage(): ReactElement {
  return <NotificationsAdminView />
}
