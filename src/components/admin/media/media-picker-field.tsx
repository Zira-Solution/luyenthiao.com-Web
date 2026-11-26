'use client'

import { ImageIcon, Link2, Music, Plus, Trash2 } from 'lucide-react'
import Image from 'next/image'
import { useState, type ReactElement } from 'react'

import { MediaBrowserDialog } from './media-browser-dialog'

import type { MediaKind } from '@/lib/admin-media'

export interface MediaPickerFieldProps {
  kind: MediaKind
  value: string | null | undefined
  onChange: (v: string | null) => void
}

function isValidMediaUrl(value: string): boolean {
  if (value.startsWith('/')) return true
  try {
    const parsed = new URL(value)
    return parsed.protocol === 'https:' || parsed.protocol === 'http:'
  } catch {
    return false
  }
}

export function MediaPickerField({ kind, value, onChange }: MediaPickerFieldProps): ReactElement {
  const [open, setOpen] = useState(false)
  const [urlMode, setUrlMode] = useState(false)
  const [urlInput, setUrlInput] = useState('')
  const [urlWarn, setUrlWarn] = useState(false)

  const choosePath = (path: string) => {
    onChange(path)
  }

  const applyUrl = () => {
    const v = urlInput.trim()
    if (!v) return
    if (isValidMediaUrl(v)) {
      onChange(v)
      setUrlMode(false)
      setUrlInput('')
      setUrlWarn(false)
    } else {
      setUrlWarn(true)
    }
  }

  const isExternal = Boolean(value && (value.startsWith('https://') || value.startsWith('http://')))

  return (
    <div className="flex items-center gap-2.5">
      {value ? (
        <div className="grid size-14 shrink-0 place-items-center overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
          {kind === 'image' ? (
            <Image
              src={value}
              alt="Thumb"
              width={56}
              height={56}
              unoptimized={isExternal}
              className="size-full object-contain"
            />
          ) : (
            <div className="flex w-full flex-col items-center gap-0.5 px-1 text-slate-600">
              <Music className="size-4" aria-hidden="true" />
              <span className="w-full truncate text-center text-[10px] font-medium">
                {value.split('/').pop()}
              </span>
            </div>
          )}
        </div>
      ) : (
        <div className="grid size-14 shrink-0 place-items-center rounded-lg border border-dashed border-slate-300 bg-slate-50 text-slate-400">
          {kind === 'image' ? (
            <ImageIcon className="size-4" aria-hidden="true" />
          ) : (
            <Music className="size-4" aria-hidden="true" />
          )}
        </div>
      )}

      <div className="min-w-0 flex-1">
        {urlMode ? (
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2">
              <input
                autoFocus
                value={urlInput}
                onChange={(e) => {
                  setUrlInput(e.target.value)
                  setUrlWarn(false)
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') applyUrl()
                }}
                placeholder="Đường dẫn /… hoặc https://…"
                className="focus:border-brand-primary focus:ring-brand-primary/20 min-w-0 flex-1 rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-sm text-slate-900 placeholder:text-slate-500 focus:ring-2 focus:outline-none"
              />
              <button
                type="button"
                onClick={applyUrl}
                className="bg-admin-primary hover:bg-admin-primary-hover shrink-0 cursor-pointer rounded-lg px-3 py-1.5 text-xs font-semibold text-white transition-colors"
              >
                OK
              </button>
              <button
                type="button"
                onClick={() => {
                  setUrlMode(false)
                  setUrlWarn(false)
                }}
                className="shrink-0 cursor-pointer rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50"
              >
                Hủy
              </button>
            </div>
            {urlWarn && (
              <span className="text-xs font-medium text-amber-700">
                URL cần bắt đầu bằng / hoặc http(s):// hợp lệ.
              </span>
            )}
          </div>
        ) : (
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50"
            >
              <Plus className="size-3.5" aria-hidden="true" />
              Thư viện
            </button>
            <button
              type="button"
              onClick={() => setUrlMode(true)}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50"
            >
              <Link2 className="size-3.5" aria-hidden="true" />
              Dán URL
            </button>
            {value && (
              <button
                type="button"
                onClick={() => onChange(null)}
                className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-medium text-rose-700 transition-colors hover:bg-rose-100"
              >
                <Trash2 className="size-3.5" aria-hidden="true" />
                Xóa
              </button>
            )}
          </div>
        )}
      </div>

      <MediaBrowserDialog
        kind={kind}
        open={open}
        onOpenChange={setOpen}
        value={value}
        onSelect={choosePath}
      />
    </div>
  )
}
