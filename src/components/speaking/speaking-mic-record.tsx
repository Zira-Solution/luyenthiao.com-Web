"use client"

import { AudioLines, Play, Square } from "lucide-react"
import { useCallback, useEffect, useRef, useState } from "react"

interface SpeakingMicRecordProps {
  onRecorded: (recorded: { duration: number; blobUrl: string }) => void
  onReset?: () => void
  label?: string
}

function formatSeconds(total: number): string {
  const m = Math.floor(total / 60)
  const s = total % 60
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
}

/**
 * Thu âm câu trả lời bằng MediaRecorder; hỗ trợ ghi / dừng / nghe lại.
 */
export function SpeakingMicRecord({
  onRecorded,
  onReset,
  label = "Nhấn để ghi âm",
}: SpeakingMicRecordProps): React.ReactElement {
  const [recording, setRecording] = useState(false)
  const [seconds, setSeconds] = useState(0)
  const [blobUrl, setBlobUrl] = useState("")
  const recorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const secondsRef = useRef(0)

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }, [])

  const stop = useCallback(() => {
    recorderRef.current?.stop()
    recorderRef.current = null
    setRecording(false)
    clearTimer()
  }, [clearTimer])

  useEffect(() => () => {
    clearTimer()
    recorderRef.current?.stop()
    if (blobUrl) URL.revokeObjectURL(blobUrl)
  }, [blobUrl, clearTimer])

  const start = async () => {
    if (!navigator.mediaDevices?.getUserMedia) return
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    const recorder = new MediaRecorder(stream)
    chunksRef.current = []
    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data)
    }
    recorder.onstop = () => {
      stream.getTracks().forEach((t) => t.stop())
      const type = recorder.mimeType || "audio/webm"
      const blob = new Blob(chunksRef.current, { type })
      const url = URL.createObjectURL(blob)
      setBlobUrl(url)
      const duration = secondsRef.current
      setSeconds(0)
      onRecorded?.({ duration, blobUrl: url })
    }
    recorderRef.current = recorder
    recorder.start()
    secondsRef.current = 0
    setSeconds(0)
    setRecording(true)
    timerRef.current = setInterval(() => {
      secondsRef.current = secondsRef.current + 1
      setSeconds((s) => s + 1)
    }, 1000)
  }

  const reset = () => {
    secondsRef.current = 0
    stop()
    setBlobUrl("")
    setSeconds(0)
    onReset?.()
  }

  if (blobUrl) {
    return (
      <div className="flex flex-col items-center gap-3">
        <audio controls src={blobUrl} className="h-11 w-64" />
        <button
          type="button"
          onClick={reset}
          className="cursor-pointer rounded-full border border-slate-300 px-5 py-2 text-sm font-bold text-slate-600 transition-colors hover:bg-slate-100"
        >
          Ghi lại
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <button
        type="button"
        onPointerDown={() => void start()}
        className={
          recording
            ? "flex h-20 w-20 cursor-pointer items-center justify-center rounded-full bg-semantic-danger text-white shadow-lg ring-4 ring-red-300"
            : "flex h-20 w-20 cursor-pointer items-center justify-center rounded-full bg-brand-primary text-white shadow-lg ring-4 ring-blue-200 transition-transform hover:scale-105"
        }
        aria-label={recording ? "Dừng ghi âm" : label}
      >
        {recording ? (
          <Square className="h-8 w-8 fill-current" aria-hidden />
        ) : (
          <AudioLines className="h-8 w-8" aria-hidden />
        )}
      </button>
      <p className="flex items-center gap-2 text-sm font-medium text-slate-600">
        {recording ? (
          <>
            <span className="h-2 w-2 animate-pulse rounded-full bg-semantic-danger" />
            Đang ghi âm {formatSeconds(seconds)}
          </>
        ) : (
          <Play className="h-4 w-4 text-brand-primary" aria-hidden />
        )}
        {!recording ? label : ""}
      </p>
    </div>
  )
}