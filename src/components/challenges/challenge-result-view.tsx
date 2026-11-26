'use client'

import { ArrowLeft, Bot, Check, Copy, Medal, RotateCcw, Trophy } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

import { useChallengeResult } from '@/hooks'
import { levelLabel } from '@/lib/level-label'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/store/auth-store'

interface ChallengeResultViewProps {
  id: string
}

export function ChallengeResultView({ id }: ChallengeResultViewProps): React.ReactElement {
  const user = useAuthStore((s) => s.user)
  const { data: result, isPending, error } = useChallengeResult(id)
  const [copied, setCopied] = useState(false)

  const handleCopyShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {
      // ignore in headless browsers
    }
  }

  if (isPending) {
    return (
      <main className="bg-dashboard-bg flex min-h-screen items-center justify-center p-6 text-white">
        <p className="font-heading text-lg font-bold">Đang tổng kết bảng vàng trận đấu...</p>
      </main>
    )
  }

  if (error || !result) {
    return (
      <main className="bg-dashboard-bg flex min-h-screen items-center justify-center p-6 text-white">
        <div className="w-full max-w-md rounded-3xl border-2 border-white/25 bg-slate-900/90 p-7 text-center shadow-2xl">
          <h1 className="font-heading text-xl font-black text-rose-300 uppercase">
            Không tìm thấy kết quả trận đấu
          </h1>
          <Link
            href="/challenges"
            className="mt-5 inline-flex rounded-2xl bg-amber-400 px-5 py-2.5 text-sm font-black text-slate-950 uppercase"
          >
            Về Đấu Trường
          </Link>
        </div>
      </main>
    )
  }

  const userExt = user as (typeof user & { fullName?: string; username?: string }) | null
  const viewerName = (userExt?.fullName || userExt?.username || '').trim().toLowerCase()

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#1e1047] via-[#2b1768] to-[#0f172a] px-4 py-8 text-white md:px-8">
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link
            href="/challenges"
            className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-black uppercase hover:bg-white/20"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Về Đấu Trường</span>
          </Link>
          <button
            type="button"
            onClick={handleCopyShare}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-amber-300/40 bg-amber-400/20 px-4 py-2 text-xs font-black text-amber-100 uppercase hover:bg-amber-400/35"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-300" /> : <Copy className="h-3.5 w-3.5" />}
            <span>{copied ? 'Đã sao chép link' : 'Chia sẻ kết quả'}</span>
          </button>
        </div>

        <section className="rounded-[2.2rem] border-2 border-amber-300/40 bg-white/10 p-6 text-center shadow-2xl backdrop-blur md:p-8">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-400 text-slate-950 shadow-lg">
            <Trophy className="h-9 w-9" />
          </div>
          <h1 className="font-heading mt-4 text-3xl font-black tracking-wide uppercase">
            Kết Quả Trận Thách Đấu
          </h1>
          <p className="mt-1 text-sm font-semibold text-amber-200">
            {result.title} · Mã {result.code} · {levelLabel(result.levelSlug)} ·{' '}
            {result.totalQuestions} câu hỏi
          </p>

          <div className="mt-6 space-y-3 text-left">
            {result.players.map((p, idx) => {
              const isViewer =
                (user?.id != null && p.userId === user.id) ||
                (!p.userId && viewerName.length > 0 && p.name.trim().toLowerCase() === viewerName)
              return (
                <div
                  key={p.id}
                  className={cn(
                    'flex items-center justify-between rounded-2xl border px-5 py-3.5',
                    idx === 0
                      ? 'border-amber-300/70 bg-amber-400/20'
                      : isViewer
                        ? 'border-sky-400/70 bg-sky-500/20'
                        : 'border-white/10 bg-slate-950/60',
                  )}
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15 font-mono text-sm font-black">
                      {idx === 0 ? <Medal className="h-5 w-5 text-amber-300" /> : `#${idx + 1}`}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-white">{p.name}</span>
                        {p.isBot && (
                          <span className="inline-flex items-center gap-1 rounded bg-sky-500/30 px-2 py-0.5 text-[10px] font-bold text-sky-200">
                            <Bot className="h-3 w-3" />
                            BOT
                          </span>
                        )}
                        {isViewer && (
                          <span className="rounded bg-emerald-500/30 px-2 py-0.5 text-[10px] font-bold text-emerald-200">
                            Bạn
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <span className="rounded-xl bg-white/15 px-4 py-1.5 text-base font-black text-amber-200">
                    {p.score} điểm
                  </span>
                </div>
              )
            })}
          </div>

          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Link
              href="/challenges"
              className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-b from-amber-300 to-amber-500 px-6 py-3 text-sm font-black text-slate-950 uppercase shadow-lg hover:brightness-105"
            >
              <RotateCcw className="h-4 w-4" />
              <span>Chơi Trận Mới</span>
            </Link>
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-2xl border border-white/25 bg-white/10 px-6 py-3 text-sm font-black text-white uppercase hover:bg-white/20"
            >
              Về Trang Chủ
            </Link>
          </div>
        </section>
      </div>
    </main>
  )
}
