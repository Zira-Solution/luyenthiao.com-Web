import type { Metadata } from 'next'
import type { ReactElement } from 'react'

import { ChallengesAdminView } from '@/components/admin'

export const metadata: Metadata = {
  title: 'Đấu trường & Nhật ký điểm | Luyenthiao CMS',
  description: 'Theo dõi phòng đấu trường Thách đấu, kết quả và nhật ký cộng điểm.',
  keywords: ['admin', 'challenges', 'points', 'Luyenthiao CMS'],
  alternates: { canonical: '/admin/challenges' },
  robots: { index: false, follow: false },
  openGraph: {
    title: 'Đấu trường & Nhật ký điểm | Luyenthiao CMS',
    description: 'Giám sát đấu trường và điểm thưởng Luyenthiao CMS.',
  },
}

export default function AdminChallengesPage(): ReactElement {
  return <ChallengesAdminView />
}
