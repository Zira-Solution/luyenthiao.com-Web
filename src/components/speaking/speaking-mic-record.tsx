'use client'

import { AlertTriangle, AudioLines, Play, RotateCcw, Square } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'

const MAX_SECONDS = 10

interface SpeakingMicRecordProps {
  onRecorded: (recorded: { duration: number; blobUrl: string }) => void
  onReset?: () => void
  label?: string
  /** Gọi khi không truy cập được micro (từ chối quyền hoặc thiết bị lỗi). */
  onError?: () => void
}

function formatSeconds(total: number): string {
  const m = Math.floor(total / 60)
  const s = total % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

/**
 * Thu âm câu trả lời bằng MediaRecorder; hỗ trợ ghi / dừng / nghe lại.
 * - Tự dừng sau 10 giây (MAX_SECONDS).
 * - Hiển thị đếm ngược + trạng thái ghi rõ ràng.
 * - Báo lỗi khi user từ chối hoặc mic không hoạt động.
 */
export function SpeakingMicRecord({
  onRecorded,
  onReset,
  label = 'Nhấn để ghi âm',
  onError,
}: SpeakingMicRecordProps): React.ReactElement {
  const [recording, setRecording] = useState(false)
  const [seconds, setSeconds] = useState(0)
  const [blobUrl, setBlobUrl] = useState('')
  const [error, setError] = useState(false)
  const recorderRef = useRef<MediaRecorder | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const secondsRef = useRef(0)
  const blobUrlRef = useRef('')

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }, [])

  const stop = useCallback(() => {
    recorderRef.current?.stop()
    recorderRef.current = null
    streamRef.current?.getTracks().forEach((t) => t.stop())
    streamRef.current = null
    setRecording(false)
    clearTimer()
  }, [clearTimer])

  // Dọn dẹp khi unmount.
  useEffect(
    () => () => {
      clearTimer()
      recorderRef.current?.stop()
      streamRef.current?.getTracks().forEach((t) => t.stop())
      setRecording(false)
      if (blobUrlRef.current) {
        URL.revokeObjectURL(blobUrlRef.current)
        blobUrlRef.current = ''
      }
    },
    [clearTimer],
  )

  const start = async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setError(true)
      onError?.()
      return
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const recorder = new MediaRecorder(stream)
      streamRef.current = stream
      chunksRef.current = []
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data)
      }
      recorder.onstop = () => {
        const type = recorder.mimeType || 'audio/webm'
        const blob = new Blob(chunksRef.current, { type })
        const url = URL.createObjectURL(blob)
        if (blobUrlRef.current) URL.revokeObjectURL(blobUrlRef.current)
        blobUrlRef.current = url
        setBlobUrl(url)
        const duration = secondsRef.current
        setSeconds(0)
        secondsRef.current = 0
        onRecorded?.({ duration, blobUrl: url })
      }
      recorderRef.current = recorder
      recorder.start()
      secondsRef.current = 0
      setSeconds(0)
      setError(false)
      setRecording(true)
      timerRef.current = setInterval(() => {
        secondsRef.current += 1
        setSeconds(secondsRef.current)
        // Tự dừng sau giới hạn.
        if (secondsRef.current >= MAX_SECONDS) stop()
      }, 1000)
    } catch (err) {
      setRecording(false)
      setError(true)
      onError?.()
      void err
    }
  }

  const reset = () => {
    secondsRef.current = 0
    clearTimer()
    stop()
    if (blobUrlRef.current) {
      URL.revokeObjectURL(blobUrlRef.current)
      blobUrlRef.current = ''
    }
    setBlobUrl('')
    setError(false)
    setSeconds(0)
    onReset?.()
  }

  // Trạng thái lỗi mic.
  if (error) {
    return (
      <div className="flex w-full flex-col items-center gap-3 rounded-2xl border-2 border-red-200 bg-red-50 px-5 py-4 text-center">
        <span className="bg-semantic-danger flex h-11 w-11 items-center justify-center rounded-full text-white">
          <AlertTriangle className="h-6 w-6" aria-hidden />
        </span>
        <p className="text-sm font-semibold text-red-700">
          Không thể truy cập micro. Vui lòng cho phép quyền micro trong trình duyệt rồi thử lại.
        </p>
        <button
          type="button"
          onClick={reset}
          className="bg-semantic-danger cursor-pointer rounded-full px-6 py-2 text-sm font-bold text-white shadow transition-transform hover:scale-105"
        >
          Thử lại
        </button>
      </div>
    )
  }

  // Trạng thái đã ghi xong → nghe lại.
  if (blobUrl) {
    return (
      <div className="flex flex-col items-center gap-3">
        <audio controls src={blobUrl} className="h-11 w-64" />
        <button
          type="button"
          onClick={reset}
          className="flex cursor-pointer items-center gap-2 rounded-full border border-slate-300 px-5 py-2 text-sm font-bold text-slate-600 transition-colors hover:bg-slate-100"
        >
          <RotateCcw className="h-4 w-4" aria-hidden />
          Ghi lại
        </button>
      </div>
    )
  }

  const remaining = Math.max(MAX_SECONDS - seconds, 0)

  return (
    <div className="flex flex-col items-center gap-2">
      <button
        type="button"
        onClick={() => (recording ? stop() : void start())}
        className={
          recording
            ? 'bg-semantic-danger relative flex h-20 w-20 cursor-pointer items-center justify-center rounded-full text-white shadow-lg ring-4 ring-red-300 transition-transform active:scale-95'
            : 'bg-brand-primary relative flex h-20 w-20 cursor-pointer items-center justify-center rounded-full text-white shadow-lg ring-4 ring-blue-200 transition-transform hover:scale-105 active:scale-95'
        }
        aria-label={recording ? 'Dừng ghi âm' : label}
      >
        {recording ? (
          <Square className="h-8 w-8 fill-current" aria-hidden />
        ) : (
          <AudioLines className="h-8 w-8" aria-hidden />
        )}
        {/* Vòng đếm ngược quanh nút khi đang ghi. */}
        {recording ? (
          <svg
            viewBox="0 0 44 44"
            className="pointer-events-none absolute inset-0 -m-[6px] h-[calc(100%+12px)] w-[calc(100%+12px)] -rotate-90"
          >
            <circle
              cx="22"
              cy="22"
              r="20"
              fill="none"
              stroke="rgba(255,255,255,0.35)"
              strokeWidth="3"
            />
            <circle
              cx="22"
              cy="22"
              r="20"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray={`${(remaining / MAX_SECONDS) * 2 * Math.PI * 20} ${2 * Math.PI * 20}`}
            />
          </svg>
        ) : null}
      </button>
      <p
        className={
          'flex items-center gap-2 text-sm font-medium ' +
          (recording ? 'text-red-600' : 'text-slate-600')
        }
      >
        {recording ? (
          <>
            <span className="bg-semantic-danger h-2 w-2 animate-pulse rounded-full" />
            <span>
              Đang ghi âm {formatSeconds(seconds)} / 0:{String(MAX_SECONDS).padStart(2, '0')}
            </span>
          </>
        ) : (
          <>
            <Play className="text-brand-primary h-4 w-4" aria-hidden />
            <span>{label}</span>
          </>
        )}
      </p>
      {!recording ? (
        <p className="text-[11px] leading-tight text-slate-400">
          Tối đa 10 giây · bấm lần nữa để dừng sớm
        </p>
      ) : null}
    </div>
  )
}
