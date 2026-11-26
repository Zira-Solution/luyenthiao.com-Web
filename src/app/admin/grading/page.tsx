import type { Metadata } from 'next'
import type { ReactElement } from 'react'

import { GradingQueueView } from '@/components/admin'

export const metadata: Metadata = {
  title: 'Chấm bài Speaking & Writing | Luyenthiao CMS',
  description:
    'Hàng đợi chấm điểm bài thi Speaking và Writing dành cho giáo viên và quản trị viên.',
  keywords: ['admin', 'grading', 'speaking', 'writing', 'Luyenthiao CMS'],
  alternates: { canonical: '/admin/grading' },
  robots: { index: false, follow: false },
  openGraph: {
    title: 'Chấm bài Speaking & Writing | Luyenthiao CMS',
    description: 'Quản lý hàng đợi chấm điểm bài thi tự luận.',
  },
}

export default function AdminGradingPage(): ReactElement {
  return <GradingQueueView />
}
