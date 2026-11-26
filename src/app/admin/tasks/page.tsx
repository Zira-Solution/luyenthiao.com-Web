import type { Metadata } from 'next'
import type { ReactElement } from 'react'

import { TasksAdminView } from '@/components/admin'

export const metadata: Metadata = {
  title: 'Quản lý Nhiệm vụ | Luyenthiao CMS',
  description: 'Thiết lập nhiệm vụ hàng ngày, hàng tuần, thành tựu và điểm thưởng.',
  keywords: ['admin', 'tasks', 'gamification', 'Luyenthiao CMS'],
  alternates: { canonical: '/admin/tasks' },
  robots: { index: false, follow: false },
  openGraph: {
    title: 'Quản lý Nhiệm vụ | Luyenthiao CMS',
    description: 'Quản lý nhiệm vụ Luyenthiao CMS.',
  },
}

export default function AdminTasksPage(): ReactElement {
  return <TasksAdminView />
}
