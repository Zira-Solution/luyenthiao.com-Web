'use client'

import Image from 'next/image'
import type { ReactElement } from 'react'

import type { PartRendererProps } from './types'

import { countWords } from '@/lib/student-exam'

export function PartWrite({
  part,
  structureName,
  answers,
  onChange,
  review,
  interactive = false,
}: PartRendererProps): ReactElement {
  const prompt = part.prompt
  const images = (prompt?.images ?? []).filter((img) => Boolean(img.src))
  const essay = answers[part.id]?.essay ?? ''
  const wordCount = countWords(essay)

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 shadow-xs">
        <div className="flex items-center justify-between gap-2">
          <span className="rounded bg-violet-600 px-2 py-0.5 text-[10px] font-extrabold tracking-wider text-white uppercase">
            {structureName}
          </span>
          <span className="text-xs font-semibold text-slate-500">
            Tối đa {part.maxScore ?? 5} điểm (Chấm tay)
          </span>
        </div>
        <h3 className="mt-2 text-sm font-bold text-slate-800">{part.title || 'Phần Viết'}</h3>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4">
        <p className="text-sm font-semibold text-slate-900">{prompt?.title || 'Đề bài viết'}</p>
        <p className="mt-1.5 text-sm leading-relaxed whitespace-pre-line text-slate-700">
          {prompt?.instruction || 'Chưa nhập hướng dẫn viết bài.'}
        </p>

        {images.length > 0 && (
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
            {images.map((img) => {
              const src = img.src ?? ''
              const isExternal = src.startsWith('http://') || src.startsWith('https://')
              return (
                <div
                  key={img.slot}
                  className="relative aspect-square overflow-hidden rounded-lg border border-slate-200 bg-slate-50"
                >
                  <Image
                    src={src}
                    alt={img.alt || img.slot}
                    fill
                    sizes="200px"
                    unoptimized={isExternal}
                    className="object-contain p-1.5"
                  />
                </div>
              )
            })}
          </div>
        )}

        {interactive ? (
          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-between">
              <label
                htmlFor={`write-essay-${part.id}`}
                className="text-xs font-bold tracking-wide text-slate-700 uppercase"
              >
                Bài làm của bạn
              </label>
              <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600">
                {wordCount} từ
              </span>
            </div>
            {review ? (
              <div className="min-h-36 rounded-xl border border-slate-200 bg-slate-50 p-3.5 text-sm leading-relaxed whitespace-pre-wrap text-slate-800">
                {essay.trim() || '(Chưa nhập nội dung bài viết)'}
              </div>
            ) : (
              <textarea
                id={`write-essay-${part.id}`}
                rows={7}
                value={essay}
                onChange={(e) => onChange(part.id, 'essay', e.target.value)}
                placeholder="Nhập bài viết tiếng Anh của bạn tại đây..."
                className="w-full rounded-xl border border-slate-300 bg-slate-50 p-3.5 text-sm leading-relaxed text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none"
              />
            )}
          </div>
        ) : (
          <div className="mt-4 rounded-lg border border-dashed border-slate-300 bg-slate-50 p-3 text-xs text-slate-500">
            Học viên sẽ nhập bài viết tại đây; giáo viên/admin chấm điểm trong mục Chấm bài Writing.
          </div>
        )}

        {prompt?.sampleAnswer && (!interactive || Boolean(review)) && (
          <div className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 p-3">
            <p className="text-xs font-semibold text-emerald-800">Bài mẫu tham khảo</p>
            <p className="mt-1 text-xs leading-relaxed whitespace-pre-line text-emerald-900">
              {prompt.sampleAnswer}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
