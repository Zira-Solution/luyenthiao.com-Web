import type { Metadata } from 'next'

import { ChallengeRoomView } from '@/components/challenges'

export const metadata: Metadata = {
  title: 'Phòng thi đấu trực tuyến',
  description: 'Phòng thi đấu tiếng Anh thời gian thực.',
}

export default async function ChallengeRoomPage({
  params,
}: {
  params: Promise<{ code: string }>
}): Promise<React.ReactElement> {
  const { code } = await params
  return <ChallengeRoomView code={code} />
}
