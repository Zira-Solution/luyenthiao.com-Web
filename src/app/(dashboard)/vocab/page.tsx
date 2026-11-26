import type { Metadata } from 'next'

import { VocabLibraryView } from '@/components/vocab'
import { ROUTES } from '@/constants'

export const metadata: Metadata = {
  title: 'Kho từ vựng',
  description: 'Tra cứu kho từ vựng tiếng Anh theo cấp độ, chủ đề và lưu vào sổ tay học tập.',
  keywords: ['kho từ vựng', 'tra cứu từ vựng', 'học từ vựng tiếng Anh'],
  alternates: { canonical: ROUTES.VOCAB },
  openGraph: {
    title: 'Kho từ vựng | luyenthiao.com',
    description: 'Tra cứu kho từ vựng tiếng Anh theo cấp độ, chủ đề và lưu vào sổ tay học tập.',
    url: ROUTES.VOCAB,
    type: 'website',
  },
}

export default function VocabPage(): React.ReactElement {
  return <VocabLibraryView />
}
