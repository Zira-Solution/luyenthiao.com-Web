import type { Metadata } from 'next'

import { ChallengeLobbyView } from '@/components/challenges'
import { getPlanets } from '@/lib/api/public'
import fixturePlanets from '@/schemas/__fixtures__/planets.json'
import { toPlanets } from '@/schemas/planet'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Đấu trường theo cấp độ',
  description: 'Chọn đề thi và mở phòng thách đấu tiếng Anh trực tuyến.',
}

export default async function ChallengeLevelPage({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<React.ReactElement> {
  const [{ slug }, res] = await Promise.all([params, getPlanets()])
  const planets = res.ok ? res.data : toPlanets(fixturePlanets)
  return <ChallengeLobbyView planets={planets} initialSlug={slug} />
}
