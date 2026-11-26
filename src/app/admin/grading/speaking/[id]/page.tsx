import type { Metadata } from 'next'
import type { ReactElement } from 'react'

import { SpeakingGradingView } from '@/components/admin'

export const metadata: Metadata = {
  title: 'Chấm bài Speaking | Luyenthiao CMS',
  description: 'Nghe audio ghi âm và chấm điểm từng phần thi Speaking của học viên.',
  keywords: ['admin', 'speaking grading', 'Luyenthiao CMS'],
  alternates: { canonical: '/admin/grading' },
  robots: { index: false, follow: false },
  openGraph: {
    title: 'Chấm bài Speaking | Luyenthiao CMS',
    description: 'Màn hình chấm điểm bài thi Speaking.',
  },
}

export default async function AdminSpeakingGradingPage({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<ReactElement> {
  const { id } = await params
  return <SpeakingGradingView submissionId={id} />
}
