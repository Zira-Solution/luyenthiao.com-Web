import type { Metadata } from 'next'

import { ChallengeLobbyView } from '@/components/challenges'
import { ROUTES } from '@/constants'
import { getPlanets } from '@/lib/api/public'
import fixturePlanets from '@/schemas/__fixtures__/planets.json'
import { toPlanets } from '@/schemas/planet'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Đấu trường trực tuyến',
  description: 'Thách đấu tiếng Anh thời gian thực cùng bạn bè hoặc Bot AI.',
  alternates: { canonical: ROUTES.CHALLENGES },
}

export default async function ChallengesPage(): Promise<React.ReactElement> {
  const res = await getPlanets()
  const planets = res.ok ? res.data : toPlanets(fixturePlanets)
  return <ChallengeLobbyView planets={planets} />
}
