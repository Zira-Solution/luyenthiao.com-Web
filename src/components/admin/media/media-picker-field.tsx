"use client"

import { ImageIcon, Link2, Music, Plus, Trash2 } from "lucide-react"
import Image from "next/image"
import { useState, type ReactElement } from "react"


import { MediaBrowserDialog } from "./media-browser-dialog"

import type { MediaKind } from "@/lib/admin-media"
import { cn } from "@/lib/utils"

interface MediaPickerFieldProps {
  kind: MediaKind
  value: string | null | undefined
  onChange: (v: string | null) => void
}

export function MediaPickerField({ kind, value, onChange }: MediaPickerFieldProps): ReactElement {
  const [open, setOpen] = useState(false)
  const [urlMode, setUrlMode] = useState(false)
  const [urlInput, setUrlInput] = useState("")
  const [urlWarn, setUrlWarn] = useState(false)

  const choosePath = (path: string) => {
    onChange(path)
  }

  const applyUrl = () => {
    const v = urlInput.trim()
    if (!v) return
    if (v.startsWith("/")) {
      onChange(v)
      setUrlMode(false)
      setUrlInput("")
      setUrlWarn(false)
    } else {
      setUrlWarn(true)
    }
  }

  return (
    <div className="flex items-center gap-2">
      {value ? (
        <div className="w-16 h-16 shrink-0 rounded-lg border border-white/15 overflow-hidden bg-black/20 grid place-items-center">
          {kind === "image" ? (
            <Image
              src={value}
              alt="Thumb"
              width={64}
              height={64}
              className="w-full h-full object-contain"
            />
          ) : (
            <div className="flex flex-col items-center gap-0.5 text-white/60 px-1">
              <Music className="w-5 h-5" />
              <span className="text-[9px] font-semibold text-center truncate w-full">
                {value.split("/").pop()}
              </span>
            </div>
          )}
        </div>
      ) : (
        <div className="w-16 h-16 shrink-0 rounded-lg border border-dashed border-white/20 grid place-items-center text-white/30">
          {kind === "image" ? <ImageIcon className="w-5 h-5" /> : <Music className="w-5 h-5" />}
        </div>
      )}

      <div className="flex-1 min-w-0">
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
                  if (e.key === "Enter") applyUrl()
                }}
                placeholder="Đường dẫn bắt đầu bằng /…"
                className="flex-1 min-w-0 bg-white/10 text-white text-sm rounded-lg px-2.5 py-1.5 focus:outline-none border border-white/15 focus:border-brand-primary placeholder:text-white/30"
              />
              <button
                onClick={applyUrl}
                className="shrink-0 px-3 py-1.5 rounded-lg bg-brand-primary text-white font-bold text-xs cursor-pointer"
              >
                OK
              </button>
              <button
                onClick={() => {
                  setUrlMode(false)
                  setUrlWarn(false)
                }}
                className="shrink-0 px-2 py-1.5 rounded-lg bg-white/10 text-white/70 font-bold text-xs cursor-pointer"
              >
                Hủy
              </button>
            </div>
            {urlWarn && (
              <span className="text-semantic-warning text-[11px] font-semibold">
                URL ngoài sẽ không hiển thị được — hãy tải file vào public/clone-assets.
              </span>
            )}
          </div>
        ) : (
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              onClick={() => setOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              Thư viện
            </button>
            <button
              onClick={() => setUrlMode(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-colors cursor-pointer"
            >
              <Link2 className="w-3.5 h-3.5" />
              Dán URL
            </button>
            {value && (
              <button
                onClick={() => onChange(null)}
                className={cn(
                  "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-game-danger-to/30 text-white/70 hover:text-white text-xs font-bold transition-colors cursor-pointer",
                )}
              >
                <Trash2 className="w-3.5 h-3.5" />
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