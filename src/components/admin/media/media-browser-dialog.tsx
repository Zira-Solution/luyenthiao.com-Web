"use client"

import { Check, Music, Search } from "lucide-react"
import Image from "next/image"
import { useState, type ReactElement } from "react"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui"
import { useMediaLibrary } from "@/hooks/use-media-library"
import type { MediaItem, MediaKind } from "@/lib/admin-media"
import { cn } from "@/lib/utils"

interface MediaBrowserDialogProps {
  kind: MediaKind
  open: boolean
  onOpenChange: (open: boolean) => void
  value: string | null | undefined
  onSelect: (path: string) => void
}

const PAGE = 24

export function MediaBrowserDialog({
  kind,
  open,
  onOpenChange,
  value,
  onSelect,
}: MediaBrowserDialogProps): ReactElement {
  const { data, isLoading, error } = useMediaLibrary(kind)
  const [search, setSearch] = useState("")
  const [visible, setVisible] = useState(PAGE)

  const filtered = (data ?? []).filter((item) => {
    const q = search.trim().toLowerCase()
    if (!q) return true
    return item.name.toLowerCase().includes(q) || item.dir.toLowerCase().includes(q)
  })

  const shown = filtered.slice(0, visible)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-slate-900 border border-white/10 text-white">
        <DialogHeader>
          <DialogTitle className="text-white font-black uppercase tracking-wide">
            {kind === "image" ? "Thư viện ảnh" : "Thư viện âm thanh"}
          </DialogTitle>
        </DialogHeader>

        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setVisible(PAGE)
            }}
            placeholder="Tìm theo tên file hoặc thư mục…"
            className="w-full bg-white/10 text-white text-sm rounded-xl pl-9 pr-3 py-2.5 focus:outline-none border border-white/10 focus:border-brand-primary placeholder:text-white/30"
          />
        </div>

        {isLoading && (
          <div className="text-white/60 text-sm py-10 text-center">Đang tải thư viện…</div>
        )}
        {error && (
          <div className="bg-game-danger-to/20 border border-game-danger-from rounded-xl text-white text-sm p-3">
            Không tải được thư viện. Hãy chắc chắn files nằm trong{" "}
            <code className="text-white/70">public/clone-assets</code>.
          </div>
        )}
        {!isLoading && !error && shown.length === 0 && (
          <div className="text-white/50 text-sm py-10 text-center">Không có file phù hợp.</div>
        )}

        {kind === "image" ? (
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-[50vh] overflow-auto pr-1">
            {shown.map((item) => (
              <ImageCard
                key={item.path}
                item={item}
                active={value === item.path}
                onSelect={() => {
                  onSelect(item.path)
                  onOpenChange(false)
                }}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-2 max-h-[50vh] overflow-auto pr-1">
            {shown.map((item) => (
              <AudioRow
                key={item.path}
                item={item}
                active={value === item.path}
                onSelect={() => {
                  onSelect(item.path)
                  onOpenChange(false)
                }}
              />
            ))}
          </div>
        )}

        {filtered.length > visible && (
          <button
            onClick={() => setVisible((v) => v + PAGE)}
            className="w-full py-2 rounded-xl border border-white/15 hover:border-white/30 text-white/70 hover:text-white font-bold text-xs uppercase transition-colors cursor-pointer"
          >
            Tải thêm ({filtered.length - visible} còn lại)
          </button>
        )}
      </DialogContent>
    </Dialog>
  )
}

function ImageCard({
  item,
  active,
  onSelect,
}: {
  item: MediaItem
  active: boolean
  onSelect: () => void
}): ReactElement {
  return (
    <button
      onClick={onSelect}
      className={cn(
        "relative aspect-square rounded-lg overflow-hidden border cursor-pointer transition-colors",
        active ? "border-brand-primary" : "border-white/15 hover:border-white/40",
      )}
    >
      <Image
        src={item.path}
        alt={item.name}
        fill
        sizes="120px"
        className="object-contain p-1"
      />
      {active && (
        <span className="absolute top-1 right-1 w-5 h-5 rounded-full bg-brand-primary text-white grid place-items-center">
          <Check className="w-3.5 h-3.5" />
        </span>
      )}
    </button>
  )
}

function AudioRow({
  item,
  active,
  onSelect,
}: {
  item: MediaItem
  active: boolean
  onSelect: () => void
}): ReactElement {
  return (
    <button
      onClick={onSelect}
      className={cn(
        "flex items-center gap-3 rounded-xl border px-3 py-2 cursor-pointer transition-colors text-left",
        active ? "border-brand-primary bg-brand-primary/10" : "border-white/15 hover:border-white/40",
      )}
    >
      <span className="text-white/60 shrink-0">
        <Music className="w-4 h-4" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="text-white text-sm font-semibold truncate">{item.name}</div>
        <div className="text-white/40 text-[11px]">{item.dir}</div>
      </div>
      {active && (
        <span className="w-5 h-5 rounded-full bg-brand-primary text-white grid place-items-center shrink-0">
          <Check className="w-3.5 h-3.5" />
        </span>
      )}
    </button>
  )
}