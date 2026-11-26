'use client'

import { Bookmark, BookmarkCheck, BookOpen, Filter, Search, Volume2 } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useMemo, useRef, useState } from 'react'

import { useMyNotebook, useSaveNotebookEntry, useSearchVocab } from '@/hooks'
import { ApiError } from '@/lib/api-client'
import { levelLabel } from '@/lib/level-label'
import { useIsAuthenticated } from '@/lib/private-query'
import { cn } from '@/lib/utils'
import type { PublicVocabWord } from '@/schemas/vocab'

const VOCAB_LEVELS = [
  'starters',
  'movers',
  'flyers',
  'ket',
  'pet',
  'toefl_primary',
  'toefl_junior',
  'ioe',
]

interface VocabLibraryViewProps {
  embedded?: boolean
}

export function VocabLibraryView({ embedded = false }: VocabLibraryViewProps): React.ReactElement {
  const authed = useIsAuthenticated()
  const [searchInput, setSearchInput] = useState('')
  const [debouncedQ, setDebouncedQ] = useState('')
  const [level, setLevel] = useState('ALL')
  const [topic, setTopic] = useState('ALL')
  const [notesById, setNotesById] = useState<Record<number, string>>({})
  const [editingNoteId, setEditingNoteId] = useState<number | null>(null)
  const [savedIds, setSavedIds] = useState<Set<number>>(() => new Set())
  const [actionError, setActionError] = useState<string | null>(null)
  const [actionSuccess, setActionSuccess] = useState<string | null>(null)
  const [playingId, setPlayingId] = useState<number | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQ(searchInput)
    }, 250)
    return () => clearTimeout(timer)
  }, [searchInput])

  const { data: words = [], isPending, error, refetch } = useSearchVocab({
    q: debouncedQ,
    level,
    topic,
  })
  const { data: myNotebook } = useMyNotebook()
  const saveMutation = useSaveNotebookEntry()

  const topicOptions = useMemo(() => {
    const set = new Set<string>()
    for (const w of words) {
      if (w.topic?.trim()) set.add(w.topic.trim())
    }
    if (topic !== 'ALL' && topic.trim()) set.add(topic.trim())
    return Array.from(set).sort((a, b) => a.localeCompare(b, 'vi'))
  }, [words, topic])

  const savedWordKeys = useMemo(() => {
    const set = new Set<string>()
    for (const item of myNotebook ?? []) {
      set.add(`${item.word.trim().toLowerCase()}::${item.level.trim().toLowerCase()}`)
    }
    return set
  }, [myNotebook])

  const isSavedWord = (word: PublicVocabWord): boolean =>
    savedIds.has(word.id) ||
    savedWordKeys.has(`${word.word.trim().toLowerCase()}::${word.level.trim().toLowerCase()}`)

  const speakWord = (word: PublicVocabWord) => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
    }
    setPlayingId(word.id)
    if (word.audioUrl) {
      const audio = new Audio(word.audioUrl)
      audioRef.current = audio
      audio.onended = () => setPlayingId(null)
      audio.onerror = () => setPlayingId(null)
      audio.play().catch(() => setPlayingId(null))
      return
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel()
      const utterance = new SpeechSynthesisUtterance(word.word)
      utterance.lang = 'en-US'
      utterance.rate = 0.85
      utterance.onend = () => setPlayingId(null)
      utterance.onerror = () => setPlayingId(null)
      window.speechSynthesis.speak(utterance)
    } else {
      setPlayingId(null)
    }
  }

  const handleSaveWord = (word: PublicVocabWord) => {
    setActionError(null)
    setActionSuccess(null)
    const note = notesById[word.id]?.trim()
    saveMutation.mutate(
      {
        vocabId: word.id,
        notes: note || undefined,
      },
      {
        onSuccess: () => {
          setSavedIds((prev) => new Set(prev).add(word.id))
          setEditingNoteId(null)
          setActionSuccess(`Đã lưu "${word.word}" vào Sổ tay từ vựng!`)
        },
        onError: (err) => {
          setActionError(
            err instanceof ApiError
              ? err.message
              : 'Không thể lưu từ vựng lúc này, vui lòng thử lại.',
          )
        },
      },
    )
  }

  return (
    <div
      className={cn(
        'flex w-full flex-col items-center',
        !embedded && 'min-h-screen px-4 pt-28 pb-32 md:px-8',
      )}
    >
      {!embedded && (
        <div className="mb-6 flex w-full max-w-5xl flex-wrap items-center justify-between gap-4">
          <div className="text-shadow-game-title text-left">
            <h1 className="font-heading text-3xl font-black tracking-wide text-white uppercase drop-shadow-md md:text-4xl">
              Kho Từ Vựng
            </h1>
            <p className="mt-1 text-sm font-semibold text-blue-100/90">
              Tra cứu từ vựng chuẩn theo cấp độ và lưu ngay vào Sổ tay của bạn.
            </p>
          </div>
          <Link
            href="/notebook"
            className="inline-flex items-center gap-2 rounded-2xl border-2 border-amber-300/60 bg-amber-400/20 px-4 py-2.5 text-sm font-extrabold text-amber-100 backdrop-blur-sm transition-colors hover:bg-amber-400/30"
          >
            <BookOpen className="h-4 w-4" />
            <span>Mở Sổ tay của tôi</span>
          </Link>
        </div>
      )}

      {/* Search & Filters */}
      <div className="bg-ranking-table-bg border-ranking-table-border text-shadow-game-title mb-6 flex w-full max-w-5xl flex-col gap-3 rounded-[2rem] border-3 p-5 shadow-[0_15px_30px_rgba(0,0,0,0.4)] backdrop-blur-sm md:flex-row md:items-center">
        <div className="bg-game-input-focus-shadow border-ranking-table-border flex flex-1 items-center rounded-xl border-2 px-4 py-2.5 shadow-inner focus-within:border-blue-400">
          <Search className="mr-3 h-5 w-5 shrink-0 text-blue-300" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Nhập từ tiếng Anh, nghĩa tiếng Việt hoặc ví dụ..."
            aria-label="Tìm trong kho từ vựng"
            className="w-full bg-transparent text-sm font-semibold text-white placeholder-blue-300/50 outline-none"
          />
        </div>

        <div className="relative w-full md:w-48">
          <select
            value={level}
            onChange={(e) => setLevel(e.target.value)}
            aria-label="Lọc theo cấp độ"
            className="bg-game-input-focus-shadow hover:bg-game-input-hover-bg border-ranking-table-border w-full cursor-pointer appearance-none rounded-xl border-2 px-4 py-2.5 text-sm font-semibold text-white shadow-inner outline-none focus:border-blue-400"
          >
            <option value="ALL" className="bg-game-dropdown-bg text-white">
              Tất cả cấp độ
            </option>
            {VOCAB_LEVELS.map((lv) => (
              <option key={lv} value={lv} className="bg-game-dropdown-bg text-white">
                {levelLabel(lv)}
              </option>
            ))}
          </select>
          <Filter className="pointer-events-none absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 text-blue-300" />
        </div>

        <div className="relative w-full md:w-48">
          <select
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            aria-label="Lọc theo chủ đề"
            className="bg-game-input-focus-shadow hover:bg-game-input-hover-bg border-ranking-table-border w-full cursor-pointer appearance-none rounded-xl border-2 px-4 py-2.5 text-sm font-semibold text-white shadow-inner outline-none focus:border-blue-400"
          >
            <option value="ALL" className="bg-game-dropdown-bg text-white">
              Tất cả chủ đề
            </option>
            {topicOptions.map((tp) => (
              <option key={tp} value={tp} className="bg-game-dropdown-bg text-white">
                {tp}
              </option>
            ))}
          </select>
          <Filter className="pointer-events-none absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 text-blue-300" />
        </div>
      </div>

      {actionError && (
        <div
          role="alert"
          className="mb-4 w-full max-w-5xl rounded-2xl border border-rose-400/50 bg-rose-950/80 px-4 py-3 text-sm font-semibold text-rose-100"
        >
          {actionError}
        </div>
      )}

      {actionSuccess && (
        <div
          role="status"
          className="mb-4 w-full max-w-5xl rounded-2xl border border-emerald-400/50 bg-emerald-950/80 px-4 py-3 text-sm font-semibold text-emerald-100"
        >
          {actionSuccess}
        </div>
      )}

      {isPending ? (
        <div className="grid w-full max-w-5xl grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, idx) => (
            <div
              key={idx}
              className="bg-ranking-table-bg border-ranking-table-border h-56 animate-pulse rounded-[1.5rem] border-2"
            />
          ))}
        </div>
      ) : error ? (
        <div className="bg-ranking-table-bg border-ranking-table-border w-full max-w-lg rounded-[2rem] border-3 p-8 text-center">
          <p className="font-semibold text-rose-200">Không thể tải kho từ vựng lúc này.</p>
          <button
            type="button"
            onClick={() => refetch()}
            className="mt-4 cursor-pointer rounded-xl bg-amber-400 px-5 py-2 text-sm font-black text-slate-900 hover:bg-amber-300"
          >
            Thử lại
          </button>
        </div>
      ) : words.length === 0 ? (
        <div className="bg-ranking-table-bg border-ranking-table-border w-full max-w-lg rounded-[2rem] border-3 p-8 text-center">
          <p className="text-lg font-extrabold text-white">Không tìm thấy từ vựng phù hợp</p>
          <p className="mt-1 text-sm text-blue-200/80">
            Hãy thử từ khóa khác hoặc bỏ lọc cấp độ / chủ đề.
          </p>
        </div>
      ) : (
        <div className="grid w-full max-w-5xl grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {words.map((word) => {
            const saved = isSavedWord(word)
            const noteOpen = editingNoteId === word.id
            const isSavingThis = saveMutation.isPending && saveMutation.variables?.vocabId === word.id

            return (
              <div
                key={word.id}
                className="bg-ranking-table-bg border-ranking-table-border text-shadow-game-title flex flex-col justify-between rounded-[1.5rem] border-2 p-5 shadow-lg transition-transform hover:-translate-y-0.5"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-heading text-xl font-black text-white">{word.word}</h3>
                        {word.type && (
                          <span className="rounded-md bg-white/10 px-2 py-0.5 text-[10px] font-bold text-blue-200 lowercase">
                            ({word.type})
                          </span>
                        )}
                      </div>
                      {word.ipa && (
                        <p className="mt-0.5 font-mono text-xs font-semibold text-amber-200/90">
                          {word.ipa}
                        </p>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => speakWord(word)}
                      aria-label={`Nghe phát âm ${word.word}`}
                      className={cn(
                        'flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full transition-colors',
                        playingId === word.id
                          ? 'bg-emerald-500 text-white'
                          : 'bg-blue-500/25 text-blue-200 hover:bg-blue-500/40',
                      )}
                    >
                      <Volume2 className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="mt-2.5 flex flex-wrap gap-1.5">
                    <span className="rounded-full bg-indigo-500/30 px-2.5 py-0.5 text-[10px] font-black tracking-wide text-indigo-100 uppercase">
                      {levelLabel(word.level)}
                    </span>
                    {word.topic && (
                      <span className="rounded-full bg-amber-400/20 px-2.5 py-0.5 text-[10px] font-bold text-amber-200">
                        {word.topic}
                      </span>
                    )}
                  </div>

                  <p className="text-yellow-350 mt-3 text-base font-extrabold">{word.meaningVi}</p>

                  {(word.exampleEn || word.exampleVi) && (
                    <div className="mt-3 rounded-xl bg-blue-950/55 p-3 text-xs leading-relaxed text-blue-100">
                      {word.exampleEn && <p className="font-semibold text-white">{word.exampleEn}</p>}
                      {word.exampleVi && (
                        <p className="mt-1 text-blue-300/85">{word.exampleVi}</p>
                      )}
                    </div>
                  )}
                </div>

                <div className="mt-4 space-y-2 border-t border-white/10 pt-3">
                  {noteOpen && (
                    <input
                      type="text"
                      value={notesById[word.id] ?? ''}
                      onChange={(e) =>
                        setNotesById((prev) => ({ ...prev, [word.id]: e.target.value }))
                      }
                      placeholder="Ghi chú cá nhân (tùy chọn)..."
                      aria-label={`Ghi chú cho ${word.word}`}
                      className="w-full rounded-xl border border-white/20 bg-slate-900/70 px-3 py-1.5 text-xs text-white placeholder-slate-400 outline-none focus:border-amber-300"
                    />
                  )}

                  {authed ? (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        disabled={isSavingThis}
                        onClick={() => handleSaveWord(word)}
                        className={cn(
                          'flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-xs font-extrabold transition-colors disabled:opacity-60',
                          saved
                            ? 'border border-emerald-400/40 bg-emerald-500/20 text-emerald-100 hover:bg-emerald-500/30'
                            : 'bg-gradient-to-b from-amber-300 to-amber-500 text-slate-950 shadow-sm hover:brightness-105',
                        )}
                      >
                        {saved ? (
                          <>
                            <BookmarkCheck className="h-4 w-4" />
                            <span>{isSavingThis ? 'Đang lưu...' : 'Đã lưu · Cập nhật'}</span>
                          </>
                        ) : (
                          <>
                            <Bookmark className="h-4 w-4" />
                            <span>{isSavingThis ? 'Đang lưu...' : 'Lưu vào Sổ tay'}</span>
                          </>
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setEditingNoteId((cur) => (cur === word.id ? null : word.id))
                        }
                        className="cursor-pointer rounded-xl border border-white/15 bg-white/10 px-2.5 py-2 text-[11px] font-bold text-blue-100 hover:bg-white/20"
                      >
                        Ghi chú
                      </button>
                    </div>
                  ) : (
                    <Link
                      href={`/login?redirect=${encodeURIComponent('/vocab')}`}
                      className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-amber-300/50 bg-amber-400/20 px-3 py-2 text-xs font-extrabold text-amber-100 hover:bg-amber-400/30"
                    >
                      <Bookmark className="h-4 w-4" />
                      <span>Đăng nhập để lưu</span>
                    </Link>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
