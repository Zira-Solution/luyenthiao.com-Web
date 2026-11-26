'use client'

import { ArrowRight, History, PlusCircle, Swords, Trophy, Users } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useMemo, useRef, useState } from 'react'

import { useChallengeHistory, usePublicExams } from '@/hooks'
import { getSharedChallengeSocket } from '@/lib/challenge-socket'
import { levelLabel } from '@/lib/level-label'
import { cn } from '@/lib/utils'
import type { Planet } from '@/schemas/planet'
import { useAuthStore } from '@/store/auth-store'

interface ChallengeLobbyViewProps {
  planets: Planet[]
  initialSlug?: string
}

const DEFAULT_LEVEL_OPTIONS = [
  'starters',
  'movers',
  'flyers',
  'ket',
  'pet',
  'toefl_primary',
  'toefl_junior',
  'ioe',
]

export function ChallengeLobbyView({
  planets,
  initialSlug,
}: ChallengeLobbyViewProps): React.ReactElement {
  const router = useRouter()
  const authStatus = useAuthStore((s) => s.status)
  const accessToken = useAuthStore((s) => s.accessToken)
  const authed = authStatus === 'authenticated' && Boolean(accessToken)

  const levelChoices = useMemo(() => {
    const slugs = new Set<string>()
    for (const p of planets) {
      if (p.slug) slugs.add(p.slug)
    }
    for (const s of DEFAULT_LEVEL_OPTIONS) slugs.add(s)
    return Array.from(slugs)
  }, [planets])

  const defaultLevel =
    initialSlug && levelChoices.includes(initialSlug) ? initialSlug : (levelChoices[0] ?? 'starters')

  const [levelSlug, setLevelSlug] = useState(defaultLevel)
  const [selectedExamId, setSelectedExamId] = useState('')
  const [roomTitle, setRoomTitle] = useState('Đấu trường tốc độ')
  const [maxPlayers, setMaxPlayers] = useState(4)
  const [joinCode, setJoinCode] = useState('')
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const socketRef = useRef<ReturnType<typeof getSharedChallengeSocket> | null>(null)

  const { data: allExams = [], isPending: examsLoading } = usePublicExams()
  const { data: history = [], isPending: historyLoading } = useChallengeHistory()

  const filteredExams = useMemo(() => {
    const byLevel = allExams.filter((e) => e.levelSlug === levelSlug)
    const pool = byLevel.length > 0 ? byLevel : allExams
    return pool.filter(
      (e) =>
        e.skills.length === 0 ||
        e.skills.some((s) => !['writing', 'speaking'].includes(s.toLowerCase())),
    )
  }, [allExams, levelSlug])

  const effectiveExamId =
    selectedExamId && filteredExams.some((e) => e.id === selectedExamId)
      ? selectedExamId
      : (filteredExams[0]?.id ?? '')

  const handleCreateRoom = (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg(null)
    if (!authed) {
      router.push(`/login?redirect=${encodeURIComponent('/challenges')}`)
      return
    }
    if (!effectiveExamId) {
      setErrorMsg('Hiện chưa có đề thi trắc nghiệm phù hợp để tạo phòng.')
      return
    }

    setIsCreating(true)
    const socket = getSharedChallengeSocket(useAuthStore.getState().accessToken)
    socketRef.current = socket

    const emitCreate = () => {
      socket.emit('room:create', {
        levelSlug,
        examId: effectiveExamId,
        title: roomTitle.trim() || 'Đấu trường tốc độ',
        maxPlayers,
      })
    }

    const onCreated = (payload: { code?: string }) => {
      clearTimeout(timeout)
      detach()
      setIsCreating(false)
      if (payload?.code) {
        router.push(`/challenges/room/${payload.code}`)
      }
    }

    const onRoomError = (payload: { message?: string }) => {
      clearTimeout(timeout)
      detach()
      setIsCreating(false)
      setErrorMsg(payload?.message || 'Không tạo được phòng đấu.')
    }

    const onConnectError = () => {
      clearTimeout(timeout)
      detach()
      setIsCreating(false)
      setErrorMsg('Kết nối Socket.IO tới đấu trường thất bại.')
    }

    const detach = () => {
      socket.off('connect', emitCreate)
      socket.off('room:created', onCreated)
      socket.off('room:error', onRoomError)
      socket.off('connect_error', onConnectError)
    }

    const timeout = setTimeout(() => {
      detach()
      setIsCreating(false)
      setErrorMsg('Không thể kết nối máy chủ đấu trường, vui lòng thử lại.')
    }, 8000)

    socket.on('room:created', onCreated)
    socket.on('room:error', onRoomError)
    socket.on('connect_error', onConnectError)
    if (socket.connected) {
      emitCreate()
    } else {
      socket.on('connect', emitCreate)
    }
  }

  const handleJoinByCode = (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg(null)
    const cleaned = joinCode.trim().toUpperCase()
    if (cleaned.length < 4) {
      setErrorMsg('Vui lòng nhập mã phòng hợp lệ (6 ký tự).')
      return
    }
    if (!authed) {
      router.push(`/login?redirect=${encodeURIComponent(`/challenges/room/${cleaned}`)}`)
      return
    }
    router.push(`/challenges/room/${cleaned}`)
  }

  return (
    <div className="min-h-screen px-4 pt-28 pb-32 md:px-8">
      <div className="mx-auto max-w-6xl space-y-8">
        {/* Hero Header */}
        <section className="rounded-[2.2rem] border-2 border-white/25 bg-gradient-to-br from-indigo-900/90 via-purple-900/85 to-slate-900/90 p-6 text-white shadow-2xl backdrop-blur md:p-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-amber-300/40 bg-amber-400/20 px-3.5 py-1 text-xs font-black tracking-wider text-amber-200 uppercase">
                <Swords className="h-4 w-4" />
                <span>Đấu Trường Trực Tuyến</span>
              </div>
              <h1 className="font-heading mt-3 text-3xl font-black tracking-wide uppercase drop-shadow md:text-4xl">
                Thách Đấu Thời Gian Thực
              </h1>
              <p className="mt-1.5 max-w-2xl text-sm font-medium text-indigo-100/90">
                Tạo phòng thi đấu cùng bạn bè hoặc luyện tốc độ cùng Bot AI, cập nhật bảng xếp hạng
                từng giây và ghi điểm trên Bảng Vàng!
              </p>
            </div>
            {!authed && (
              <Link
                href="/login?redirect=%2Fchallenges"
                className="rounded-2xl bg-gradient-to-b from-amber-300 to-amber-500 px-5 py-3 text-sm font-black text-slate-950 uppercase shadow-lg hover:brightness-105"
              >
                Đăng nhập để thi đấu
              </Link>
            )}
          </div>
        </section>

        {errorMsg && (
          <div
            role="alert"
            className="rounded-2xl border-2 border-rose-400/60 bg-rose-950/85 px-5 py-3.5 text-sm font-bold text-rose-100"
          >
            {errorMsg}
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Create Room */}
          <form
            onSubmit={handleCreateRoom}
            className="space-y-4 rounded-[2rem] border-2 border-white/20 bg-slate-900/80 p-6 text-white shadow-xl backdrop-blur lg:col-span-7"
          >
            <div className="flex items-center gap-2.5 border-b border-white/10 pb-3">
              <PlusCircle className="h-5 w-5 text-amber-300" />
              <h2 className="font-heading text-xl font-black uppercase">Tạo Phòng Mới</h2>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-extrabold tracking-wide text-blue-200 uppercase">
                  Cấp độ / Hành tinh
                </span>
                <select
                  value={levelSlug}
                  onChange={(e) => {
                    setLevelSlug(e.target.value)
                    setSelectedExamId('')
                  }}
                  aria-label="Chọn cấp độ đấu trường"
                  className="rounded-xl border-2 border-white/15 bg-slate-950/80 px-3.5 py-2.5 text-sm font-bold text-white outline-none focus:border-amber-300"
                >
                  {levelChoices.map((slug) => (
                    <option key={slug} value={slug}>
                      {levelLabel(slug)}
                    </option>
                  ))}
                </select>
              </label>

              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-extrabold tracking-wide text-blue-200 uppercase">
                  Số người tối đa
                </span>
                <select
                  value={maxPlayers}
                  onChange={(e) => setMaxPlayers(Number(e.target.value))}
                  aria-label="Số người tối đa"
                  className="rounded-xl border-2 border-white/15 bg-slate-950/80 px-3.5 py-2.5 text-sm font-bold text-white outline-none focus:border-amber-300"
                >
                  <option value={2}>2 người</option>
                  <option value={4}>4 người</option>
                  <option value={6}>6 người</option>
                </select>
              </label>
            </div>

            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-extrabold tracking-wide text-blue-200 uppercase">
                Bộ đề thi đấu
              </span>
              <select
                value={effectiveExamId}
                onChange={(e) => setSelectedExamId(e.target.value)}
                disabled={examsLoading}
                aria-label="Chọn đề thi đấu"
                className="rounded-xl border-2 border-white/15 bg-slate-950/80 px-3.5 py-2.5 text-sm font-bold text-white outline-none focus:border-amber-300 disabled:opacity-60"
              >
                {filteredExams.length === 0 ? (
                  <option value="">
                    {examsLoading ? 'Đang tải danh sách đề...' : 'Chưa có đề phù hợp'}
                  </option>
                ) : (
                  filteredExams.map((ex) => (
                    <option key={ex.id} value={ex.id}>
                      {ex.name} ({levelLabel(ex.levelSlug)})
                    </option>
                  ))
                )}
              </select>
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-extrabold tracking-wide text-blue-200 uppercase">
                Tên trận đấu
              </span>
              <input
                type="text"
                value={roomTitle}
                onChange={(e) => setRoomTitle(e.target.value)}
                maxLength={60}
                placeholder="VD: Đấu trường Flyers cuối tuần"
                className="rounded-xl border-2 border-white/15 bg-slate-950/80 px-3.5 py-2.5 text-sm font-bold text-white outline-none focus:border-amber-300"
              />
            </label>

            <button
              type="submit"
              disabled={isCreating || (!authed ? false : !effectiveExamId)}
              className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl bg-gradient-to-b from-amber-300 to-amber-500 px-6 py-3.5 text-sm font-black tracking-wide text-slate-950 uppercase shadow-lg transition-transform hover:brightness-105 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Swords className="h-4 w-4" />
              <span>
                {!authed
                  ? 'Đăng nhập để Tạo phòng'
                  : isCreating
                    ? 'Đang mở phòng...'
                    : 'Tạo Phòng Thi Đấu'}
              </span>
            </button>
          </form>

          {/* Join by Code */}
          <form
            onSubmit={handleJoinByCode}
            className="flex flex-col justify-between space-y-4 rounded-[2rem] border-2 border-white/20 bg-slate-900/80 p-6 text-white shadow-xl backdrop-blur lg:col-span-5"
          >
            <div className="space-y-4">
              <div className="flex items-center gap-2.5 border-b border-white/10 pb-3">
                <Users className="h-5 w-5 text-sky-300" />
                <h2 className="font-heading text-xl font-black uppercase">Vào Bằng Mã Phòng</h2>
              </div>
              <p className="text-sm text-blue-100/80">
                Nhập mã 6 ký tự từ bạn bè hoặc chủ phòng để tham gia ngay lập tức.
              </p>
              <input
                type="text"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                maxLength={8}
                placeholder="VD: X9K2PM"
                aria-label="Mã phòng thi đấu"
                className="w-full rounded-2xl border-2 border-white/20 bg-slate-950/90 px-4 py-3.5 text-center font-mono text-2xl font-black tracking-[0.35em] text-amber-300 uppercase outline-none focus:border-sky-400"
              />
            </div>

            <button
              type="submit"
              className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl bg-gradient-to-b from-sky-400 to-blue-600 px-6 py-3.5 text-sm font-black tracking-wide text-white uppercase shadow-lg transition-transform hover:brightness-105 active:scale-[0.99]"
            >
              <span>Tham Gia Ngay</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>
        </div>

        {/* History */}
        <section className="rounded-[2rem] border-2 border-white/20 bg-slate-900/80 p-6 text-white shadow-xl backdrop-blur">
          <div className="mb-4 flex items-center gap-2.5 border-b border-white/10 pb-3">
            <History className="h-5 w-5 text-emerald-300" />
            <h2 className="font-heading text-xl font-black uppercase">Lịch Sử Đấu Trường</h2>
          </div>

          {!authed ? (
            <p className="text-sm text-blue-200/80">
              Đăng nhập để xem lịch sử các trận thách đấu và thứ hạng của bạn.
            </p>
          ) : historyLoading ? (
            <p className="text-sm text-blue-200/80">Đang tải lịch sử đấu trường...</p>
          ) : history.length === 0 ? (
            <p className="text-sm text-blue-200/80">
              Bạn chưa tham gia trận thách đấu nào. Hãy tạo phòng hoặc luyện cùng Bot AI nhé!
            </p>
          ) : (
            <div className="space-y-2.5">
              {history.map((item) => (
                <Link
                  key={item.resultId}
                  href={`/challenges/result/${item.resultId}`}
                  className={cn(
                    'flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 transition-colors hover:border-amber-300/40 hover:bg-slate-900',
                  )}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="rounded bg-indigo-500/30 px-2 py-0.5 font-mono text-xs font-black text-indigo-200">
                        {item.code}
                      </span>
                      <span className="font-bold text-white">{item.title}</span>
                    </div>
                    <p className="mt-0.5 text-xs text-blue-200/75">
                      {levelLabel(item.levelSlug)} · {item.playerCount} người chơi ·{' '}
                      {new Date(item.playedAt).toLocaleString('vi-VN')}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    {item.myRank != null && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-400/20 px-3 py-1 text-xs font-black text-amber-200">
                        <Trophy className="h-3.5 w-3.5" />
                        Hạng #{item.myRank}
                      </span>
                    )}
                    <span className="rounded-xl bg-emerald-500/20 px-3 py-1 text-xs font-black text-emerald-200">
                      {item.myScore} điểm
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
