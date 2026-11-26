'use client'

import {
  Bot,
  Check,
  Copy,
  Crown,
  LogOut,
  Play,
  Send,
  Swords,
  Timer,
  Users,
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { Socket } from 'socket.io-client'

import { ChallengeQuestionCard } from './challenge-question-card'

import { getSharedChallengeSocket } from '@/lib/challenge-socket'
import { levelLabel } from '@/lib/level-label'
import { cn } from '@/lib/utils'
import {
  countAnsweredQuestions,
  REACTION_COOLDOWN_MS,
  REACTION_EMOJIS,
  type ChallengeAnswers,
  type ChallengeGameBegin,
  type ChallengeReaction,
  type ChallengeRoomPlayer,
  type ChallengeRoomState,
  type ReactionEmoji,
} from '@/schemas/challenge'
import { useAuthStore } from '@/store/auth-store'

interface ChallengeRoomViewProps {
  code: string
}

function formatMs(ms: number): string {
  const totalSec = Math.max(0, Math.floor(ms / 1000))
  const m = Math.floor(totalSec / 60)
  const s = totalSec % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

function ChallengeRoomInner({ code }: { code: string }): React.ReactElement {
  const router = useRouter()
  const authStatus = useAuthStore((s) => s.status)
  const accessToken = useAuthStore((s) => s.accessToken)
  const user = useAuthStore((s) => s.user)

  const [roomState, setRoomState] = useState<ChallengeRoomState | null>(null)
  const [gameData, setGameData] = useState<ChallengeGameBegin | null>(null)
  const [leaderboard, setLeaderboard] = useState<ChallengeRoomPlayer[]>([])
  const [countdown, setCountdown] = useState<number | null>(null)
  const [answers, setAnswers] = useState<ChallengeAnswers>({})
  const [submitted, setSubmitted] = useState(false)
  const [activeIdx, setActiveIdx] = useState(0)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [reactions, setReactions] = useState<ChallengeReaction[]>([])
  const [remainingMs, setRemainingMs] = useState(0)
  const [reactionCooling, setReactionCooling] = useState(false)

  const socketRef = useRef<Socket | null>(null)
  const lastSyncRef = useRef(0)
  const syncTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const reactionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const upperCode = code.toUpperCase()

  useEffect(() => {
    if (authStatus === 'unauthenticated') {
      router.replace(`/login?redirect=${encodeURIComponent(`/challenges/room/${upperCode}`)}`)
    }
  }, [authStatus, router, upperCode])

  useEffect(() => {
    if (authStatus !== 'authenticated' || !accessToken) return

    const socket = getSharedChallengeSocket(accessToken)
    socketRef.current = socket

    const emitJoin = () => {
      setErrorMsg(null)
      socket.emit('room:join', { code: upperCode })
    }
    const onState = (state: ChallengeRoomState) => {
      setRoomState(state)
      setLeaderboard(state.players)
    }
    const onCountdown = (payload: { seconds?: number }) => {
      setCountdown(payload?.seconds ?? 3)
    }
    const onBegin = (begin: ChallengeGameBegin) => {
      setCountdown(null)
      setGameData(begin)
      if (begin.answers) setAnswers(begin.answers)
      if (begin.submitted) setSubmitted(true)
      const left = begin.startedAt + begin.totalMs - Date.now()
      setRemainingMs(Math.max(0, left))
    }
    const onLeaderboard = (payload: { players?: ChallengeRoomPlayer[] }) => {
      if (payload?.players) setLeaderboard(payload.players)
    }
    const onReaction = (payload: { playerId: string; name: string; emoji: string }) => {
      const entry: ChallengeReaction = {
        ...payload,
        receivedAt: Date.now(),
        key: `${payload.playerId}-${Date.now()}-${Math.random()}`,
      }
      setReactions((prev) => [...prev.slice(-4), entry])
    }
    const onEnd = (payload: { resultId?: string }) => {
      if (payload?.resultId) {
        router.push(`/challenges/result/${payload.resultId}`)
      }
    }
    const onError = (payload: { message?: string }) => {
      setErrorMsg(payload?.message || 'Có lỗi xảy ra trong phòng đấu.')
    }

    socket.on('connect', emitJoin)
    socket.on('room:state', onState)
    socket.on('game:countdown', onCountdown)
    socket.on('game:begin', onBegin)
    socket.on('leaderboard', onLeaderboard)
    socket.on('reaction:broadcast', onReaction)
    socket.on('game:end', onEnd)
    socket.on('room:error', onError)

    if (socket.connected) {
      emitJoin()
    }

    return () => {
      if (syncTimerRef.current) clearTimeout(syncTimerRef.current)
      if (reactionTimerRef.current) clearTimeout(reactionTimerRef.current)
      socket.off('connect', emitJoin)
      socket.off('room:state', onState)
      socket.off('game:countdown', onCountdown)
      socket.off('game:begin', onBegin)
      socket.off('leaderboard', onLeaderboard)
      socket.off('reaction:broadcast', onReaction)
      socket.off('game:end', onEnd)
      socket.off('room:error', onError)
      socketRef.current = null
    }
  }, [authStatus, accessToken, upperCode, router])

  // Countdown tick (3..2..1)
  useEffect(() => {
    if (countdown == null || countdown <= 0) return
    const timer = setTimeout(() => {
      setCountdown((c) => (c != null && c > 1 ? c - 1 : null))
    }, 1000)
    return () => clearTimeout(timer)
  }, [countdown])

  // Race deadline ticker
  useEffect(() => {
    if (!gameData) return
    const tick = () => {
      const left = gameData.startedAt + gameData.totalMs - Date.now()
      setRemainingMs(Math.max(0, left))
    }
    const timer = setInterval(tick, 1000)
    return () => clearInterval(timer)
  }, [gameData])

  const me = useMemo(() => {
    const players = roomState?.players ?? []
    return players.find((p) => p.userId === user?.id) ?? players.find((p) => !p.isBot)
  }, [roomState, user])

  const isHost = Boolean(me?.isHost)
  const displayPlayers = leaderboard.length > 0 ? leaderboard : (roomState?.players ?? [])

  const syncAnswers = useCallback(
    (nextAnswers: ChallengeAnswers) => {
      if (!gameData || !socketRef.current) return
      const answered = countAnsweredQuestions(gameData.questions, nextAnswers)
      const now = Date.now()
      const elapsed = now - lastSyncRef.current
      if (elapsed >= 1000) {
        lastSyncRef.current = now
        socketRef.current.emit('answer:sync', {
          code: upperCode,
          answers: nextAnswers,
          answered,
        })
      } else {
        if (syncTimerRef.current) clearTimeout(syncTimerRef.current)
        syncTimerRef.current = setTimeout(() => {
          lastSyncRef.current = Date.now()
          socketRef.current?.emit('answer:sync', {
            code: upperCode,
            answers: nextAnswers,
            answered,
          })
        }, 1000 - elapsed)
      }
    },
    [gameData, upperCode],
  )

  const handleAnswerChange = (questionId: string, detailId: string, value: string) => {
    if (submitted) return
    setAnswers((prev) => {
      const next: ChallengeAnswers = {
        ...prev,
        [questionId]: {
          ...(prev[questionId] ?? {}),
          [detailId]: value,
        },
      }
      syncAnswers(next)
      return next
    })
  }

  const handleAddBot = () => {
    socketRef.current?.emit('room:add_bot', { code: upperCode })
  }

  const handleStartGame = () => {
    socketRef.current?.emit('game:start', { code: upperCode })
  }

  const handleSubmitRace = () => {
    if (submitted) return
    setSubmitted(true)
    socketRef.current?.emit('answer:submit', {
      code: upperCode,
      answers,
    })
  }

  const handleLeave = () => {
    socketRef.current?.emit('room:leave')
    router.push('/challenges')
  }

  const handleReaction = (emoji: ReactionEmoji) => {
    if (reactionCooling) return
    setReactionCooling(true)
    socketRef.current?.emit('reaction:send', { code: upperCode, emoji })
    if (reactionTimerRef.current) clearTimeout(reactionTimerRef.current)
    reactionTimerRef.current = setTimeout(() => {
      setReactionCooling(false)
    }, REACTION_COOLDOWN_MS)
  }

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(upperCode)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {
      // clipboard blocked in headless test
    }
  }

  if (authStatus === 'idle') {
    return (
      <main className="bg-dashboard-bg flex min-h-screen items-center justify-center p-6 text-white">
        <p className="font-heading text-lg font-bold">Đang xác thực phiên đấu trường...</p>
      </main>
    )
  }

  if (errorMsg && !roomState && !gameData) {
    return (
      <main className="bg-dashboard-bg flex min-h-screen items-center justify-center p-6 text-white">
        <div className="w-full max-w-md rounded-3xl border-2 border-white/25 bg-slate-900/90 p-7 text-center shadow-2xl">
          <h1 className="font-heading text-xl font-black text-rose-300 uppercase">
            Không thể vào phòng {upperCode}
          </h1>
          <p className="mt-2 text-sm text-slate-200">{errorMsg}</p>
          <Link
            href="/challenges"
            className="mt-5 inline-flex rounded-2xl bg-amber-400 px-5 py-2.5 text-sm font-black text-slate-950 uppercase"
          >
            Quay lại Đấu Trường
          </Link>
        </div>
      </main>
    )
  }

  const activeQuestion = gameData?.questions[activeIdx]
  const answeredCount = gameData ? countAnsweredQuestions(gameData.questions, answers) : 0

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#1a1040] via-[#24165c] to-[#0f172a] px-4 py-6 text-white md:px-8">
      {/* Countdown Overlay */}
      {countdown != null && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-950/85 backdrop-blur-md">
          <p className="font-heading text-lg font-black tracking-widest text-amber-300 uppercase">
            Chuẩn bị thi đấu
          </p>
          <p className="font-heading mt-3 animate-bounce text-8xl font-black text-white">
            {countdown}
          </p>
        </div>
      )}

      <div className="mx-auto max-w-6xl space-y-6">
        {/* Top Arena Header */}
        <header className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-white/15 bg-white/10 px-5 py-3.5 backdrop-blur">
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-400 px-3 py-1 font-mono text-sm font-black text-slate-950">
              {upperCode}
            </span>
            <button
              type="button"
              onClick={handleCopyCode}
              className="inline-flex cursor-pointer items-center gap-1 rounded-full bg-white/10 px-3 py-1 text-xs font-bold hover:bg-white/20"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-300" /> : <Copy className="h-3.5 w-3.5" />}
              <span>{copied ? 'Đã sao chép' : 'Sao chép mã'}</span>
            </button>
            <div>
              <p className="font-heading text-sm font-black md:text-base">
                {roomState?.title ?? `Phòng ${upperCode}`}
              </p>
              {roomState?.levelSlug && (
                <p className="text-xs text-indigo-200">{levelLabel(roomState.levelSlug)}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            {gameData && (
              <div className="inline-flex items-center gap-1.5 rounded-full border border-amber-300/40 bg-amber-400/20 px-4 py-1.5 font-mono text-sm font-black text-amber-200">
                <Timer className="h-4 w-4" />
                <span>{formatMs(remainingMs)}</span>
              </div>
            )}
            <button
              type="button"
              onClick={handleLeave}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-rose-300/40 bg-rose-500/20 px-4 py-1.5 text-xs font-black text-rose-100 uppercase hover:bg-rose-500/35"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Rời phòng</span>
            </button>
          </div>
        </header>

        {errorMsg && (
          <div
            role="alert"
            className="rounded-2xl border border-rose-400/50 bg-rose-950/80 px-4 py-3 text-sm font-bold text-rose-100"
          >
            {errorMsg}
          </div>
        )}

        {/* WAITING ROOM vs LIVE RACE */}
        {!gameData ? (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            <section className="space-y-5 rounded-[2rem] border border-white/15 bg-white/10 p-6 backdrop-blur lg:col-span-8">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-3">
                <h1 className="font-heading flex items-center gap-2 text-xl font-black uppercase">
                  <Users className="h-5 w-5 text-amber-300" />
                  <span>
                    Phòng chờ ({roomState?.players.length ?? 0}/{roomState?.maxPlayers ?? 4})
                  </span>
                </h1>
                <span className="rounded-full bg-indigo-500/30 px-3 py-1 text-xs font-extrabold text-indigo-100">
                  {roomState?.totalQuestions ?? 0} câu hỏi thi đấu
                </span>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {(roomState?.players ?? []).map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between rounded-2xl border border-white/15 bg-slate-950/60 p-4"
                  >
                    <div className="flex items-center gap-3">
                      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-500/40 text-white">
                        {p.isBot ? <Bot className="h-5 w-5" /> : <Swords className="h-5 w-5" />}
                      </span>
                      <div>
                        <p className="font-extrabold text-white">{p.name}</p>
                        <p className="text-xs text-indigo-200">
                          {p.isBot ? 'Bot AI' : p.userId === user?.id ? 'Bạn' : 'Người chơi'}
                        </p>
                      </div>
                    </div>
                    {p.isHost && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-400/20 px-2.5 py-1 text-xs font-black text-amber-200">
                        <Crown className="h-3.5 w-3.5" />
                        Chủ phòng
                      </span>
                    )}
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap gap-3 pt-2">
                {isHost ? (
                  <>
                    <button
                      type="button"
                      onClick={handleAddBot}
                      disabled={(roomState?.players.length ?? 0) >= (roomState?.maxPlayers ?? 4)}
                      className="inline-flex cursor-pointer items-center gap-2 rounded-2xl border border-sky-300/40 bg-sky-500/25 px-5 py-3 text-sm font-black text-sky-100 uppercase hover:bg-sky-500/40 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <Bot className="h-4 w-4" />
                      <span>Thêm Bot AI</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleStartGame}
                      className="inline-flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-2xl bg-gradient-to-b from-emerald-400 to-emerald-600 px-6 py-3 text-sm font-black text-white uppercase shadow-lg hover:brightness-105"
                    >
                      <Play className="h-4 w-4" />
                      <span>Bắt Đầu Trận Đấu</span>
                    </button>
                  </>
                ) : (
                  <p className="rounded-2xl bg-white/10 px-4 py-3 text-sm font-bold text-indigo-100">
                    Đang chờ chủ phòng nhấn Bắt đầu trận đấu...
                  </p>
                )}
              </div>
            </section>

            {/* Reactions Panel */}
            <aside className="flex flex-col justify-between space-y-4 rounded-[2rem] border border-white/15 bg-white/10 p-6 backdrop-blur lg:col-span-4">
              <div>
                <h2 className="font-heading text-base font-black uppercase">Cảm Xúc Phòng Đấu</h2>
                <div className="mt-3 flex flex-wrap gap-2">
                  {REACTION_EMOJIS.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => handleReaction(emoji)}
                      aria-label={`Gửi cảm xúc ${emoji}`}
                      className="cursor-pointer rounded-2xl border border-white/20 bg-white/10 px-3.5 py-2 text-xl transition-transform hover:scale-110 active:scale-95"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2 rounded-2xl bg-slate-950/50 p-4 text-xs">
                {reactions.length === 0 ? (
                  <p className="text-indigo-200/70">Chưa có biểu cảm nào.</p>
                ) : (
                  reactions.map((r) => (
                    <p key={r.key} className="font-semibold text-white">
                      <span className="mr-1.5 text-base">{r.emoji}</span>
                      <span>{r.name}</span>
                    </p>
                  ))
                )}
              </div>
            </aside>
          </div>
        ) : (
          /* LIVE RACE ARENA */
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            <section className="space-y-4 lg:col-span-8">
              {/* Question Navigator Pills */}
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/15 bg-white/10 px-4 py-3 backdrop-blur">
                <div className="flex flex-wrap gap-1.5">
                  {gameData.questions.map((q, idx) => {
                    const hasAns = Object.values(answers[q.id] ?? {}).some(
                      (v) => v && v.trim().length > 0,
                    )
                    return (
                      <button
                        key={q.id}
                        type="button"
                        onClick={() => setActiveIdx(idx)}
                        className={cn(
                          'h-9 w-9 cursor-pointer rounded-xl text-xs font-black transition-all',
                          activeIdx === idx
                            ? 'bg-amber-400 text-slate-950 shadow'
                            : hasAns
                              ? 'bg-emerald-500/80 text-white'
                              : 'bg-white/15 text-white hover:bg-white/25',
                        )}
                      >
                        {idx + 1}
                      </button>
                    )
                  })}
                </div>

                <button
                  type="button"
                  disabled={submitted}
                  onClick={handleSubmitRace}
                  className="inline-flex cursor-pointer items-center gap-1.5 rounded-2xl bg-gradient-to-b from-emerald-400 to-emerald-600 px-5 py-2 text-xs font-black text-white uppercase shadow-md hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Send className="h-3.5 w-3.5" />
                  <span>
                    {submitted
                      ? 'Đã nộp bài'
                      : `Nộp bài (${answeredCount}/${gameData.total})`}
                  </span>
                </button>
              </div>

              {submitted ? (
                <div className="rounded-[2rem] border-2 border-emerald-400/50 bg-emerald-950/80 p-8 text-center shadow-2xl">
                  <h2 className="font-heading text-2xl font-black text-emerald-200 uppercase">
                    Đã nộp bài thi đấu!
                  </h2>
                  <p className="mt-2 text-sm text-emerald-100/90">
                    Hệ thống đang tổng kết điểm từ các đấu thủ còn lại và sẽ chuyển thẳng sang bảng
                    xếp hạng kết quả.
                  </p>
                </div>
              ) : activeQuestion ? (
                <ChallengeQuestionCard
                  question={activeQuestion}
                  index={activeIdx}
                  total={gameData.total}
                  answers={answers[activeQuestion.id] ?? {}}
                  disabled={submitted}
                  onChangeDetail={(detailId, val) =>
                    handleAnswerChange(activeQuestion.id, detailId, val)
                  }
                />
              ) : null}

              {!submitted && gameData.questions.length > 1 && (
                <div className="flex justify-between">
                  <button
                    type="button"
                    disabled={activeIdx === 0}
                    onClick={() => setActiveIdx((i) => Math.max(0, i - 1))}
                    className="cursor-pointer rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-xs font-black uppercase hover:bg-white/20 disabled:opacity-40"
                  >
                    Câu trước
                  </button>
                  <button
                    type="button"
                    disabled={activeIdx >= gameData.questions.length - 1}
                    onClick={() =>
                      setActiveIdx((i) => Math.min(gameData.questions.length - 1, i + 1))
                    }
                    className="cursor-pointer rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-xs font-black uppercase hover:bg-white/20 disabled:opacity-40"
                  >
                    Câu tiếp
                  </button>
                </div>
              )}
            </section>

            {/* Live Leaderboard + Reactions */}
            <aside className="space-y-4 lg:col-span-4">
              <div className="rounded-[2rem] border border-white/15 bg-white/10 p-5 backdrop-blur">
                <h2 className="font-heading mb-3 text-base font-black uppercase">
                  Tiến Độ Trực Tiếp
                </h2>
                <div className="space-y-2.5">
                  {displayPlayers.map((p, idx) => (
                    <div
                      key={p.id}
                      className="flex items-center justify-between rounded-xl bg-slate-950/60 px-3.5 py-2.5 text-sm"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-black text-amber-300">
                          #{idx + 1}
                        </span>
                        <span className="font-bold text-white">{p.name}</span>
                        {p.isBot && (
                          <span className="rounded bg-sky-500/30 px-1.5 py-0.5 text-[10px] font-bold text-sky-200">
                            BOT
                          </span>
                        )}
                      </div>
                      <span
                        className={cn(
                          'rounded-full px-2.5 py-0.5 text-xs font-black',
                          p.submitted
                            ? 'bg-emerald-500/25 text-emerald-200'
                            : 'bg-white/10 text-indigo-100',
                        )}
                      >
                        {p.submitted ? 'Đã nộp' : `${p.answeredCount ?? 0}/${gameData.total}`}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-[2rem] border border-white/15 bg-white/10 p-5 backdrop-blur">
                <div className="flex flex-wrap gap-2">
                  {REACTION_EMOJIS.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => handleReaction(emoji)}
                      aria-label={`Thả ${emoji}`}
                      className="cursor-pointer rounded-xl bg-white/10 px-2.5 py-1.5 text-lg hover:bg-white/25"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
                {reactions.length > 0 && (
                  <div className="mt-3 space-y-1 text-xs text-indigo-100">
                    {reactions.map((r) => (
                      <p key={r.key}>
                        {r.emoji} <span className="font-bold">{r.name}</span>
                      </p>
                    ))}
                  </div>
                )}
              </div>
            </aside>
          </div>
        )}
      </div>
    </main>
  )
}

export function ChallengeRoomView({ code }: ChallengeRoomViewProps): React.ReactElement {
  return <ChallengeRoomInner key={code.toUpperCase()} code={code} />
}
