'use client'

import { CheckCircle2, RotateCcw } from 'lucide-react'
import { useState } from 'react'

import { SafeHtml } from '@/components/common'
import { cn } from '@/lib/utils'
import type { ClientQuestion } from '@/schemas/challenge'

interface ChallengeQuestionCardProps {
  question: ClientQuestion
  index: number
  total: number
  answers: Record<string, string>
  disabled?: boolean
  onChangeDetail: (detailId: string, value: string) => void
}

function splitGapfillPrompt(html: string): Array<{ kind: 'text' | 'blank'; value: string }> {
  const plain = html.replace(/<\/?p>/gi, ' ').replace(/\s+/g, ' ').trim()
  const parts: Array<{ kind: 'text' | 'blank'; value: string }> = []
  const re = /\{\{(\d+)\}\}/g
  let last = 0
  let match: RegExpExecArray | null
  while ((match = re.exec(plain)) !== null) {
    if (match.index > last) {
      parts.push({ kind: 'text', value: plain.slice(last, match.index) })
    }
    parts.push({ kind: 'blank', value: match[1] ?? '' })
    last = match.index + match[0].length
  }
  if (last < plain.length) {
    parts.push({ kind: 'text', value: plain.slice(last) })
  }
  return parts
}

export function ChallengeQuestionCard({
  question,
  index,
  total,
  answers,
  disabled = false,
  onChangeDetail,
}: ChallengeQuestionCardProps): React.ReactElement {
  const [selectedWord, setSelectedWord] = useState<string | null>(null)
  const hasInlineBlanks =
    question.kind === 'gapfill' &&
    Boolean(question.promptHtml && /\{\{\d+\}\}/.test(question.promptHtml))

  return (
    <div className="rounded-[2rem] border-2 border-white/25 bg-white/95 p-5 text-slate-900 shadow-2xl backdrop-blur md:p-7">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-3">
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-indigo-600 px-3 py-1 text-xs font-black tracking-wide text-white uppercase">
            Câu {index + 1}/{total}
          </span>
          <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-[11px] font-extrabold text-amber-800 uppercase">
            {question.kind === 'multichoice'
              ? 'Trắc nghiệm'
              : question.kind === 'gapfill'
                ? 'Điền từ'
                : question.kind === 'matching'
                  ? 'Nối cặp'
                  : 'Kéo thả'}
          </span>
        </div>
        {Object.values(answers).some((v) => v && v.trim().length > 0) && (
          <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600">
            <CheckCircle2 className="h-4 w-4" />
            Đã trả lời
          </span>
        )}
      </div>

      {question.title && (
        <h2 className="font-heading mb-3 text-lg font-black text-slate-900 md:text-xl">
          {question.title}
        </h2>
      )}

      {question.promptHtml && !hasInlineBlanks && (
        <div className="mb-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm leading-relaxed text-slate-800">
          <SafeHtml html={question.promptHtml} />
        </div>
      )}

      {/* MULTICHOICE & MATCHING */}
      {(question.kind === 'multichoice' || question.kind === 'matching') && (
        <div className="space-y-4">
          {question.details.map((detail, dIdx) => {
            const current = answers[detail.id] ?? ''
            const opts = detail.options ?? []
            return (
              <div
                key={detail.id}
                className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4"
              >
                <p className="mb-2.5 text-sm font-extrabold text-slate-800">
                  {detail.label || `Mục ${dIdx + 1}`}
                </p>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {opts.map((opt) => {
                    const selected = current === opt
                    return (
                      <button
                        key={opt}
                        type="button"
                        disabled={disabled}
                        onClick={() => onChangeDetail(detail.id, opt)}
                        className={cn(
                          'cursor-pointer rounded-xl border-2 px-3.5 py-2.5 text-left text-sm font-bold transition-all disabled:cursor-not-allowed disabled:opacity-60',
                          selected
                            ? 'border-indigo-600 bg-indigo-600 text-white shadow-md'
                            : 'border-slate-200 bg-white text-slate-800 hover:border-indigo-300 hover:bg-indigo-50/50',
                        )}
                      >
                        {opt}
                      </button>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* GAPFILL */}
      {question.kind === 'gapfill' && (
        <div className="space-y-3">
          {hasInlineBlanks && question.promptHtml ? (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-base leading-loose font-medium text-slate-800">
              {splitGapfillPrompt(question.promptHtml).map((seg, sIdx) => {
                if (seg.kind === 'text') {
                  return <span key={sIdx}>{seg.value} </span>
                }
                const blankIndex = Math.max(0, Number(seg.value) - 1)
                const detail = question.details[blankIndex] ?? question.details[0]
                if (!detail) return null
                return (
                  <input
                    key={`${detail.id}-${sIdx}`}
                    type="text"
                    disabled={disabled}
                    value={answers[detail.id] ?? ''}
                    onChange={(e) => onChangeDetail(detail.id, e.target.value)}
                    placeholder={`Ô ${seg.value}`}
                    aria-label={`Ô trống ${seg.value}`}
                    className="mx-1.5 inline-block w-32 rounded-lg border-2 border-indigo-300 bg-white px-2.5 py-1 text-center text-sm font-black text-indigo-900 outline-none focus:border-indigo-600 disabled:opacity-60"
                  />
                )
              })}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {question.details.map((detail, dIdx) => (
                <label
                  key={detail.id}
                  className="flex flex-col gap-1.5 rounded-2xl border border-slate-200 bg-slate-50 p-3.5"
                >
                  <span className="text-xs font-extrabold tracking-wide text-slate-600 uppercase">
                    Ô trống {dIdx + 1}
                  </span>
                  <input
                    type="text"
                    disabled={disabled}
                    value={answers[detail.id] ?? ''}
                    onChange={(e) => onChangeDetail(detail.id, e.target.value)}
                    placeholder="Nhập đáp án..."
                    aria-label={`Ô trống ${dIdx + 1}`}
                    className="rounded-xl border-2 border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-900 outline-none focus:border-indigo-600 disabled:opacity-60"
                  />
                </label>
              ))}
            </div>
          )}
        </div>
      )}

      {/* DRAGDROP (Click word -> click slot) */}
      {question.kind === 'dragdrop' && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-3.5">
            <p className="mb-2 text-xs font-extrabold tracking-wide text-amber-800 uppercase">
              Kho từ chọn (chạm từ rồi chạm vào ô cần đặt)
            </p>
            <div className="flex flex-wrap gap-2">
              {(question.wordBox ?? []).map((item) => {
                const chosen = selectedWord === item.label
                const usedInSlot = Object.values(answers).includes(item.label)
                return (
                  <button
                    key={item.label}
                    type="button"
                    disabled={disabled}
                    onClick={() => setSelectedWord(chosen ? null : item.label)}
                    className={cn(
                      'cursor-pointer rounded-xl border-2 px-3 py-1.5 text-sm font-black transition-all disabled:cursor-not-allowed',
                      chosen
                        ? 'scale-105 border-indigo-600 bg-indigo-600 text-white shadow'
                        : usedInSlot
                          ? 'border-emerald-300 bg-emerald-100 text-emerald-800'
                          : 'border-amber-300 bg-white text-slate-900 hover:border-indigo-400',
                    )}
                  >
                    {item.label}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {question.details.map((detail, dIdx) => {
              const current = answers[detail.id] ?? ''
              return (
                <div
                  key={detail.id}
                  className="flex items-center justify-between gap-2 rounded-2xl border-2 border-dashed border-indigo-300 bg-indigo-50/40 p-3"
                >
                  <button
                    type="button"
                    disabled={disabled}
                    onClick={() => {
                      if (selectedWord) {
                        onChangeDetail(detail.id, selectedWord)
                        setSelectedWord(null)
                      }
                    }}
                    className="flex flex-1 cursor-pointer items-center justify-between text-left"
                  >
                    <span className="text-xs font-extrabold text-slate-600">Vị trí {dIdx + 1}:</span>
                    <span
                      className={cn(
                        'rounded-lg px-2.5 py-1 text-sm font-black',
                        current ? 'bg-indigo-600 text-white' : 'bg-white text-slate-400',
                      )}
                    >
                      {current || (selectedWord ? `Đặt "${selectedWord}"` : 'Trống')}
                    </span>
                  </button>
                  {current && !disabled && (
                    <button
                      type="button"
                      onClick={() => onChangeDetail(detail.id, '')}
                      aria-label={`Xóa ô ${dIdx + 1}`}
                      className="cursor-pointer rounded-lg p-1.5 text-slate-500 hover:bg-white hover:text-rose-600"
                    >
                      <RotateCcw className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
