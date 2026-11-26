import type { Metadata } from 'next'
import type { ReactElement } from 'react'

import { AttemptsAdminView } from '@/components/admin'

export const metadata: Metadata = {
  title: 'Lịch sử làm bài | Luyenthiao CMS',
  description: 'Tra cứu lượt làm bài thi thử và điểm số của học viên trên toàn hệ thống.',
  keywords: ['admin', 'exam attempts', 'monitoring', 'Luyenthiao CMS'],
  alternates: { canonical: '/admin/attempts' },
  robots: { index: false, follow: false },
  openGraph: {
    title: 'Lịch sử làm bài | Luyenthiao CMS',
    description: 'Giám sát bài làm học viên Luyenthiao CMS.',
  },
}

export default function AdminAttemptsPage(): ReactElement {
  return <AttemptsAdminView />
}
