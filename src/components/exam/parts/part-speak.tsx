'use client'

import Image from 'next/image'
import type { ReactElement } from 'react'

import type { PartRendererProps } from './types'

import { SpeakingMicRecord } from '@/components/speaking/speaking-mic-record'
import { speakKey } from '@/lib/student-exam'
import { cn } from '@/lib/utils'

export function PartSpeak({
  part,
  structureName,
  answers,
  onChange,
  review,
  interactive = false,
  speakingBlobs,
  onSpeakingRecorded,
}: PartRendererProps): ReactElement {
  const questions = part.speakQuestions ?? []
  const partAnswers = answers[part.id] ?? {}

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 shadow-xs">
        <div className="flex items-center justify-between gap-2">
          <span className="rounded bg-violet-600 px-2 py-0.5 text-[10px] font-extrabold tracking-wider text-white uppercase">
            {structureName}
          </span>
          <span className="text-xs font-semibold text-slate-500">
            {part.speakKind ?? 'mic-plain'} · Tối đa {part.maxScore ?? 10} điểm
          </span>
        </div>
        <h3 className="mt-2 text-sm font-bold text-slate-800">{part.title || 'Phần Nói'}</h3>
      </div>

      {questions.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-xs text-slate-500">
          Chưa có câu hỏi nói nào.
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {questions.map((q, idx) => {
            const mediaSrc = q.zoomCard || q.sceneBg
            const isExternal = Boolean(
              mediaSrc && (mediaSrc.startsWith('http://') || mediaSrc.startsWith('https://')),
            )
            const selected = partAnswers[speakKey(q.id, 'selected')]
            const storedAudioUrl = partAnswers[speakKey(q.id, 'audioUrl')]
            const recordedBlob = speakingBlobs?.[`${part.id}::${q.id}`]

            return (
              <div
                key={q.id || idx}
                className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-xs"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-slate-500">
                    Câu {idx + 1} · {q.kind}
                  </span>
                  {recordedBlob && (
                    <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-bold text-emerald-700">
                      Đã thu {recordedBlob.duration}s
                    </span>
                  )}
                </div>
                <p className="mt-1 text-sm font-medium text-slate-900">
                  {q.text || '(Chưa nhập lời thoại câu hỏi)'}
                </p>
                {q.vi && <p className="mt-0.5 text-xs text-slate-500">{q.vi}</p>}
                {mediaSrc && (
                  <div className="relative mt-2.5 h-32 w-full overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
                    <Image
                      src={mediaSrc}
                      alt={q.text || 'Speaking media'}
                      fill
                      sizes="320px"
                      unoptimized={isExternal}
                      className="object-contain p-1"
                    />
                  </div>
                )}

                {interactive && Array.isArray(q.choices) && q.choices.length > 0 && (
                  <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {q.choices.map((c) => {
                      const active = selected === c.id
                      return (
                        <button
                          key={c.id}
                          type="button"
                          disabled={Boolean(review)}
                          onClick={() => onChange(part.id, speakKey(q.id, 'selected'), c.id)}
                          className={cn(
                            'cursor-pointer rounded-lg border px-3 py-2 text-left text-xs font-semibold transition-colors',
                            active
                              ? 'border-blue-600 bg-blue-50 text-blue-800'
                              : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50',
                          )}
                        >
                          {c.label || c.id}
                        </button>
                      )
                    })}
                  </div>
                )}

                {interactive && Array.isArray(q.scene) && q.scene.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {q.scene.map((slot) => {
                      const active = selected === slot.id
                      return (
                        <button
                          key={slot.id}
                          type="button"
                          disabled={Boolean(review)}
                          onClick={() => onChange(part.id, speakKey(q.id, 'selected'), slot.id)}
                          className={cn(
                            'cursor-pointer rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition-colors',
                            active
                              ? 'border-blue-600 bg-blue-50 text-blue-800'
                              : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100',
                          )}
                        >
                          {slot.label || slot.id}
                        </button>
                      )
                    })}
                  </div>
                )}

                {interactive && !review && (
                  <div className="mt-3">
                    <SpeakingMicRecord
                      label="Ghi âm câu trả lời"
                      onRecorded={(rec) => {
                        if (rec.blob) {
                          onSpeakingRecorded?.(part.id, q.id, {
                            blob: rec.blob,
                            blobUrl: rec.blobUrl,
                            duration: rec.duration,
                          })
                        }
                        onChange(part.id, speakKey(q.id, 'duration'), String(rec.duration))
                      }}
                      onReset={() => {
                        onSpeakingRecorded?.(part.id, q.id, null)
                        onChange(part.id, speakKey(q.id, 'duration'), null)
                      }}
                    />
                  </div>
                )}

                {interactive && review && storedAudioUrl && (
                  <div className="mt-3 rounded-lg border border-blue-200 bg-blue-50 p-2.5">
                    <p className="mb-1 text-xs font-semibold text-blue-800">Bản thu âm đã nộp</p>
                    <audio
                      controls
                      preload="metadata"
                      src={storedAudioUrl}
                      className="h-9 w-full"
                    />
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
