'use client'

import { MousePointer2, X } from 'lucide-react'
import Image from 'next/image'
import { useRef, useState, type PointerEvent, type ReactElement } from 'react'

import { cn } from '@/lib/utils'
import type { Box, ExamDetail } from '@/types/exam'

export interface BoxRect {
  x0: number
  y0: number
  x1: number
  y1: number
}

export interface BoxPickerProps {
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
      <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm text-slate-500">
        Chọn ảnh nền trước khi vẽ ô thả.
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="relative aspect-[1.33] w-full max-w-[680px] overflow-hidden rounded-xl border border-slate-300 bg-slate-100">
        <Image
          src={imageUrl}
          alt="Nền"
          fill
          className="pointer-events-none object-contain select-none"
          draggable={false}
        />
        <div
          ref={overlayRef}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          className={cn(
            'absolute inset-0 touch-none',
            selectedId ? 'cursor-crosshair' : 'cursor-not-allowed',
          )}
        >
          {details.map((d) => {
            const active = d.id === selectedId
            return (
              <button
                key={d.id}
                type="button"
                onClick={() => onSelect(d.id)}
                className="absolute rounded-lg border-2 transition-all"
                style={{
                  left: d.box?.left ?? '0%',
                  top: d.box?.top ?? '0%',
                  width: d.box?.width ?? '0%',
                  height: d.box?.height ?? '0%',
                }}
              >
                <span
                  className={cn(
                    'absolute -top-4 -left-1 rounded px-1.5 text-[10px] font-semibold text-white',
                    active ? 'bg-admin-primary' : 'bg-slate-500',
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
                    className="absolute -top-4 -right-1 grid size-4 cursor-pointer place-items-center rounded bg-rose-600 text-white hover:bg-rose-700"
                  >
                    <X className="size-3" aria-hidden="true" />
                  </span>
                )}
              </button>
            )
          })}

          {rect && (
            <div
              className="border-brand-primary bg-brand-primary/15 pointer-events-none absolute border-2"
              style={{
                left: `${Math.min(rect.x0, rect.x1)}%`,
                top: `${Math.min(rect.y0, rect.y1)}%`,
                width: `${Math.abs(rect.x1 - rect.x0)}%`,
                height: `${Math.abs(rect.y1 - rect.y0)}%`,
              }}
            />
          )}

          {!selectedId && (
            <span className="absolute bottom-2 left-1/2 flex -translate-x-1/2 items-center gap-1 rounded bg-black/50 px-2 py-1 text-[11px] font-medium text-white">
              <MousePointer2 className="size-3" aria-hidden="true" /> Chọn một ô bên dưới rồi kéo để
              vẽ
            </span>
          )}
        </div>
      </div>

      {selected && (
        <ManualBoxInputs box={selected.box} onApplyBox={(b) => onDraw(selected.id, b)} />
      )}
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
    const n = parseFloat((v ?? '').replace('%', ''))
    return Number.isFinite(n) ? n : fallback
  }
  const clamp = (n: number): number => Math.max(0, Math.min(100, Math.round(n * 100) / 100))

  const patch = (key: keyof Box, raw: string) => {
    const n = clamp(parseFloat(raw) || 0)
    onApplyBox({
      left: num(box?.left, 0).toString() + '%',
      top: num(box?.top, 0).toString() + '%',
      width: num(box?.width, 0).toString() + '%',
      height: num(box?.height, 0).toString() + '%',
      [key]: n + '%',
    })
  }

  if (!box || !box.left) {
    return <span className="text-xs text-slate-500">Chưa vẽ ô — kéo trên ảnh để đặt vị trí.</span>
  }

  return (
    <div className="grid max-w-[680px] grid-cols-4 gap-2">
      {(
        [
          ['X', box.left],
          ['Y', box.top],
          ['Rộng', box.width],
          ['Cao', box.height],
        ] as [string, string][]
      ).map(([label, value]) => (
        <label key={label} className="flex items-center gap-1.5 text-xs font-medium text-slate-600">
          {label}
          <input
            value={value.replace('%', '')}
            onChange={(e) =>
              patch(
                label === 'X'
                  ? 'left'
                  : label === 'Y'
                    ? 'top'
                    : label === 'Rộng'
                      ? 'width'
                      : 'height',
                e.target.value,
              )
            }
            type="number"
            min={0}
            max={100}
            className="focus:border-brand-primary focus:ring-brand-primary/20 w-full rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-xs text-slate-900 focus:ring-2 focus:outline-none"
          />
        </label>
      ))}
    </div>
  )
}
