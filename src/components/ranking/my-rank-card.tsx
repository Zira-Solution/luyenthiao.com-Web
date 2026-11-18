'use client'

import Link from 'next/link'

import { useMyRank } from '@/hooks/use-my-rank'
import { formatScore } from '@/lib/utils'
import type { RankingPeriod } from '@/schemas/ranking'
import { useAuthStore } from '@/store/auth-store'

const CARD_CLASS =
  'w-full bg-ranking-table-bg backdrop-blur-sm rounded-[2rem] px-6 py-4 border-3 border-ranking-table-border shadow-[0_15px_30px_rgba(0,0,0,0.4)] mb-6 text-center text-white font-extrabold text-sm md:text-base'

interface MyRankCardProps {
  period: RankingPeriod
}

export function MyRankCard({ period }: MyRankCardProps): React.ReactElement {
  const status = useAuthStore((state) => state.status)
  if (status === 'idle') return <div className={CARD_CLASS}>Đang tải hạng của bạn…</div>
  if (status === 'unauthenticated') {
    return (
      <div className={CARD_CLASS}>
        <Link href="/login?redirect=%2Franking" className="text-yellow-400 hover:underline">
          Đăng nhập để xem hạng của bạn
        </Link>
      </div>
    )
  }
  return <SignedInRank period={period} />
}

function SignedInRank({ period }: MyRankCardProps): React.ReactElement {
  const { data, isPending, error } = useMyRank(period)
  let content: string
  if (error) content = error instanceof Error ? error.message : 'Không tải được hạng của bạn.'
  else if (isPending || !data) content = 'Đang tải hạng của bạn…'
  else
    content = `Hạng của bạn: #${data.rank} · ${data.fullName} · ${formatScore(data.totalPoints)} điểm`
  return <div className={CARD_CLASS}>{content}</div>
}
