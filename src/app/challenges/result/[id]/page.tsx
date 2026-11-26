import type { Metadata } from 'next'

import { ChallengeResultView } from '@/components/challenges'

export const metadata: Metadata = {
  title: 'Kết quả trận thách đấu',
  description: 'Bảng xếp hạng và tổng kết điểm trận thách đấu tiếng Anh.',
}

export default async function ChallengeResultPage({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<React.ReactElement> {
  const { id } = await params
  return <ChallengeResultView id={id} />
}
