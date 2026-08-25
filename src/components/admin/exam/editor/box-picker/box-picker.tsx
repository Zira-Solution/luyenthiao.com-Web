"use client"

import { MousePointer2, X } from "lucide-react"
import Image from "next/image"
import { useRef, useState, type PointerEvent, type ReactElement } from "react"

import { cn } from "@/lib/utils"
import type { Box, ExamDetail } from "@/types/exam"

export interface BoxRect {
  x0: number
  y0: number
  x1: number
  y1: number
}

interface BoxPickerProps {
  imageUrl: string | null
  details: ExamDetail[]
  selectedId: string | null
  onSelect: (id: string) => void
  onDraw: (id: string, box: Box) => void
  onClear: (id: string) => void
}

export function BoxPicker({
  imageUrl,
  details,
  selectedId,
  onSelect,
  onDraw,
  onClear,
}: BoxPickerProps): ReactElement {
  const overlayRef = useRef<HTMLDivElement | null>(null)
  const [rect, setRect] = useState<BoxRect | null>(null)

  const selected = details.find((d) => d.id === selectedId) ?? null

  const pct = (e: PointerEvent): { x: number; y: number } => {
    const r = overlayRef.current?.getBoundingClientRect()
    if (!r) return { x: 0, y: 0 }
    return {
      x: ((e.clientX - r.left) / r.width) * 100,
      y: ((e.clientY - r.top) / r.height) * 100,
    }
  }

  const onPointerDown = (e: PointerEvent<HTMLDivElement>): void => {
    if (!selectedId) return
    e.currentTarget.setPointerCapture(e.pointerId)
    const p = pct(e)
    setRect({ x0: p.x, y0: p.y, x1: p.x, y1: p.y })
  }

  const onPointerMove = (e: PointerEvent<HTMLDivElement>): void => {
    if (!rect) return
    const p = pct(e)
    setRect((r) => (r ? { ...r, x1: p.x, y1: p.y } : r))
  }

  const onPointerUp = (): void => {
    if (!rect) return
    const left = Math.min(rect.x0, rect.x1)
    const top = Math.min(rect.y0, rect.y1)
    const width = Math.abs(rect.x1 - rect.x0)
    const height = Math.abs(rect.y1 - rect.y0)
    setRect(null)
    if (width < 1.5 || height < 1.5) return
    if (!selectedId) return
    const r2 = (v: number): string => `${Math.round(v * 100) / 100}%`
    onDraw(selectedId, { left: r2(left), top: r2(top), width: r2(width), height: r2(height) })
  }

  const isEmptyBox = (b: Box | null | undefined): boolean =>
    !b || !b.left || !b.top || !b.width || !b.height

  if (!imageUrl) {
    return (
      <div className="rounded-xl border border-dashed border-white/25 p-6 text-center text-white/50 text-sm">
        Chọn ảnh nền trước khi vẽ ô thả.
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="relative w-full max-w-[680px] aspect-[1.33] border border-white/15 rounded-2xl overflow-hidden bg-black/20">
        <Image
          src={imageUrl}
          alt="Nền"
          fill
          className="object-contain pointer-events-none select-none"
          draggable={false}
        />
        <div
          ref={overlayRef}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          className={cn(
            "absolute inset-0 touch-none",
            selectedId ? "cursor-crosshair" : "cursor-not-allowed",
          )}
        >
          {details.map((d) => {
            const active = d.id === selectedId
            return (
              <button
                key={d.id}
                type="button"
                onClick={() => onSelect(d.id)}
                className="absolute border-2 rounded-lg transition-all"
                style={{
                  left: d.box?.left ?? "0%",
                  top: d.box?.top ?? "0%",
                  width: d.box?.width ?? "0%",
                  height: d.box?.height ?? "0%",
                }}
              >
                <span
                  className={cn(
                    "absolute -top-4 -left-1 px-1.5 rounded text-[10px] font-black text-white",
                    active ? "bg-brand-primary" : "bg-slate-500",
                  )}
                >
                  {d.label}
                </span>
                {!isEmptyBox(d.box) && (
                  <span
                    role="button"
                    tabIndex={-1}
                    onClick={(e) => {
                      e.stopPropagation()
                      onClear(d.id)
                    }}
                    className="absolute -top-4 -right-1 w-4 h-4 rounded bg-game-danger-to text-white grid place-items-center cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </span>
                )}
              </button>
            )
          })}

          {rect && (
            <div
              className="absolute border-2 border-brand-primary bg-brand-primary/15 pointer-events-none"
              style={{
                left: `${Math.min(rect.x0, rect.x1)}%`,
                top: `${Math.min(rect.y0, rect.y1)}%`,
                width: `${Math.abs(rect.x1 - rect.x0)}%`,
                height: `${Math.abs(rect.y1 - rect.y0)}%`,
              }}
            />
          )}

          {!selectedId && (
            <span className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1 px-2 py-1 rounded bg-black/50 text-white text-[11px] font-semibold">
              <MousePointer2 className="w-3 h-3" /> Chọn một ô bên dưới rồi kéo để vẽ
            </span>
          )}
        </div>
      </div>

      {selected && <ManualBoxInputs box={selected.box} onApplyBox={(b) => onDraw(selected.id, b)} />}
    </div>
  )
}

function ManualBoxInputs({
  box,
  onApplyBox,
}: {
  box: Box | null | undefined
  onApplyBox: (b: Box) => void
}): ReactElement {
  const num = (v: string | undefined, fallback: number): number => {
    const n = parseFloat((v ?? "").replace("%", ""))
    return Number.isFinite(n) ? n : fallback
  }
  const clamp = (n: number): number => Math.max(0, Math.min(100, Math.round(n * 100) / 100))

  const patch = (key: keyof Box, raw: string) => {
    const n = clamp(parseFloat(raw) || 0)
    onApplyBox({
      left: num(box?.left, 0).toString() + "%",
      top: num(box?.top, 0).toString() + "%",
      width: num(box?.width, 0).toString() + "%",
      height: num(box?.height, 0).toString() + "%",
      [key]: n + "%",
    })
  }

  if (!box || !box.left) {
    return <span className="text-white/40 text-xs">Chưa vẽ ô — kéo trên ảnh để đặt vị trí.</span>
  }

  return (
    <div className="grid grid-cols-4 gap-2 max-w-[680px]">
      {(
        [
          ["X", box.left],
          ["Y", box.top],
          ["Rộng", box.width],
          ["Cao", box.height],
        ] as [string, string][]
      ).map(([label, value]) => (
        <label key={label} className="flex items-center gap-1.5 text-white/60 text-xs font-bold">
          {label}
          <input
            value={value.replace("%", "")}
            onChange={(e) => patch(label === "X" ? "left" : label === "Y" ? "top" : label === "Rộng" ? "width" : "height", e.target.value)}
            type="number"
            min={0}
            max={100}
            className="w-full bg-white/10 text-white text-xs rounded-lg px-2 py-1.5 focus:outline-none border border-white/15 focus:border-brand-primary"
          />
        </label>
      ))}
    </div>
  )
}