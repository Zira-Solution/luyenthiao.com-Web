import type { Metadata } from 'next'
import type { ReactElement } from 'react'

import { QuestionBankView } from '@/components/admin'

export const metadata: Metadata = {
  title: 'Kho câu hỏi | Luyenthiao CMS',
  description: 'Quản lý ngân hàng câu hỏi dùng chung theo hành tinh, kỹ năng và dạng câu.',
  keywords: ['admin', 'kho câu hỏi', 'questions', 'Luyenthiao CMS'],
  alternates: { canonical: '/admin/questions' },
  robots: { index: false, follow: false },
  openGraph: {
    title: 'Kho câu hỏi | Luyenthiao CMS',
    description: 'Quản lý ngân hàng câu hỏi Luyenthiao CMS.',
  },
}

export default function AdminQuestionsPage(): ReactElement {
  return <QuestionBankView />
}
