import type { Metadata } from 'next'
import type { ReactElement } from 'react'

import { ExamEditor } from '@/components/admin/exam/editor/exam-editor'

interface PageProps {
  params: Promise<{ id: string }>
}

export const metadata: Metadata = {
  title: 'Sửa đề thi | Luyenthiao CMS',
  description: 'Chỉnh sửa nội dung đề thi tiếng Anh.',
  keywords: ['admin', 'sửa đề thi', 'exam', 'Luyenthiao CMS'],
  alternates: { canonical: '/admin/exam' },
  robots: { index: false, follow: false },
  openGraph: {
    title: 'Sửa đề thi | Luyenthiao CMS',
    description: 'Chỉnh sửa nội dung đề thi tiếng Anh.',
  },
}

export default async function AdminExamEditorPage({ params }: PageProps): Promise<ReactElement> {
  const { id } = await params
  return <ExamEditor examId={id} />
}
