import type { Metadata } from 'next'
import type { ReactElement } from 'react'

import { VocabAdminView } from '@/components/admin'

export const metadata: Metadata = {
  title: 'Quản lý Từ vựng | Luyenthiao CMS',
  description: 'Quản lý kho từ vựng, chủ đề, cấp độ và file âm thanh phát âm R2.',
  keywords: ['admin', 'vocab', 'vocabulary', 'Luyenthiao CMS'],
  alternates: { canonical: '/admin/vocab' },
  robots: { index: false, follow: false },
  openGraph: {
    title: 'Quản lý Từ vựng | Luyenthiao CMS',
    description: 'Quản lý từ vựng Luyenthiao CMS.',
  },
}

export default function AdminVocabPage(): ReactElement {
  return <VocabAdminView />
}
