import type { Metadata } from 'next'
import type { ReactElement } from 'react'

import { WritingGradingView } from '@/components/admin'

export const metadata: Metadata = {
  title: 'Chấm bài Writing | Luyenthiao CMS',
  description: 'Xem đề bài, bài viết và chấm điểm rubric chi tiết cho bài thi Writing.',
  keywords: ['admin', 'writing grading', 'Luyenthiao CMS'],
  alternates: { canonical: '/admin/grading' },
  robots: { index: false, follow: false },
  openGraph: {
    title: 'Chấm bài Writing | Luyenthiao CMS',
    description: 'Màn hình chấm điểm bài thi Writing.',
  },
}

export default async function AdminWritingGradingPage({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<ReactElement> {
  const { id } = await params
  return <WritingGradingView submissionId={id} />
}
