"use client"

import { useEffect, useRef, useState } from "react"

import type { SpeakingDraggable, SpeakingSceneSlot } from "@/types/speaking"

export type SceneMode = "mark" | "drag"

interface SpeakingSceneProps {
  sceneBg?: string
  slots: SpeakingSceneSlot[]
  draggable?: SpeakingDraggable
  mode: SceneMode
  selectedId?: string
  placed?: boolean
  correctTargetId?: string
  onSelect?: (id: string) => void
  onDrop?: (targetId: string, matched: boolean) => void
}

interface DragPos {
  x: number
  y: number
}

/**
 * Bức tranh cảnh tương tác dùng đúng asset thật: nền cảnh + các vật overlay
 * theo toạ độ % của API. Vẽ bằng SVG (viewBox = kích thước thật của ảnh) nên
 * tỷ lệ được giữ tự động và không cần inline style.
 */
export function SpeakingScene({
  sceneBg,
  slots,
  draggable,
  mode,
  selectedId,
  placed,
  correctTargetId,
  onSelect,
  onDrop,
}: SpeakingSceneProps): React.ReactElement {
  const boxRef = useRef<HTMLDivElement | null>(null)
  const [drag, setDrag] = useState<DragPos | null>(null)
  const [vw, setVw] = useState(1200)
  const [vh, setVh] = useState(900)

  // Đọc kích thước thật của nền cảnh để dựng viewBox đúng tỷ lệ.
  useEffect(() => {
    if (!sceneBg) return
    const img = new Image()
    img.onload = () => {
      if (img.naturalWidth > 0 && img.naturalHeight > 0) {
        setVw(img.naturalWidth)
        setVh(img.naturalHeight)
      }
    }
    img.src = sceneBg
  }, [sceneBg])

  const toPos = (clientX: number, clientY: number): DragPos => {
    const rect = boxRef.current?.getBoundingClientRect()
    if (!rect) return { x: 0, y: 0 }
    return {
      x: ((clientX - rect.left) / rect.width) * vw,
      y: ((clientY - rect.top) / rect.height) * vh,
    }
  }

  const finishDrag = (pos: DragPos) => {
    if (!onDrop) return
    let best: SpeakingSceneSlot | null = null
    let bestDist = Infinity
    for (const slot of slots) {
      const cx = vw * (slot.left / 100) + vw * (slot.width / 200)
      const cy = vh * (slot.top / 100) + vh * (slot.height / 200)
      const dist = Math.hypot(pos.x - cx, pos.y - cy)
      if (dist < bestDist) {
        bestDist = dist
        best = slot
      }
    }
    if (best && bestDist < Math.max(vw, vh) * 0.08) {
      onDrop(best.id, best.id === correctTargetId)
    }
    setDrag(null)
  }

  return (
    <div
      ref={boxRef}
      onPointerMove={(e) => {
        if (mode === "drag") setDrag(toPos(e.clientX, e.clientY))
      }}
      onPointerUp={(e) => {
        if (mode === "drag") finishDrag(toPos(e.clientX, e.clientY))
      }}
      className="relative w-full select-none overflow-hidden rounded-[1.75rem] border-4 border-[#f0d9b0] shadow-2xl"
    >
      {sceneBg ? (
        <svg viewBox={`0 0 ${vw} ${vh}`} className="block h-auto w-full" role="img" aria-label="Bức tranh cảnh vật">
          <image href={sceneBg} x={0} y={0} width={vw} height={vh} preserveAspectRatio="xMidYMid slice" />

          {/* Các vật overlay (Phần 1a) hoặc ô đích (Phần 1c). */}
          {slots.map((slot) => {
            const bx = vw * (slot.left / 100)
            const by = vh * (slot.top / 100)
            const bw = Math.max(vw * (slot.width / 100), 8)
            const bh = Math.max(vh * (slot.height / 100), 8)
            const active = mode === "mark" && selectedId === slot.id
            return (
              <g
                key={slot.id}
                onClick={() => (mode === "mark" ? onSelect?.(slot.id) : undefined)}
                className="cursor-pointer"
                role={mode === "mark" ? "button" : undefined}
                aria-label={slot.label}
              >
                <title>{slot.label}</title>
                {slot.src ? (
                  <image href={slot.src} x={bx} y={by} width={bw} height={bh} />
                ) : (
                  <rect
                    x={bx}
                    y={by}
                    width={bw}
                    height={bh}
                    rx={8}
                    fill="#ffffff"
                    fillOpacity={0.55}
                    stroke="#e2b13c"
                    strokeWidth={2}
                    strokeDasharray="6 5"
                  />
                )}
                {mode === "mark" ? (
                  <circle
                    cx={bx + bw / 2}
                    cy={by + bh / 2}
                    r={Math.max(bw, bh) * 0.55}
                    fill="transparent"
                    stroke={active ? "#22c55e" : "#ffffff"}
                    strokeWidth={active ? 5 : 3}
                    opacity={0.9}
                  />
                ) : null}
              </g>
            )
          })}

          {/* Đồ vật kéo (Phần 1c). */}
          {mode === "drag" && draggable && !placed ? (
            <g className="cursor-grab active:cursor-grabbing">
              <title>Kéo {draggable.label}</title>
              <image
                href={draggable.src}
                x={drag ? drag.x - vw * 0.05 : vw * 0.9}
                y={drag ? drag.y - vh * 0.06 : vh * 0.82}
                width={vw * 0.1}
                height={vh * (draggable.label === "ô tô" ? 0.08 : 0.14)}
              />
            </g>
          ) : null}
        </svg>
      ) : (
        <div className="flex aspect-[4/3] w-full items-center justify-center rounded-3xl bg-slate-100">
          <p className="text-slate-400">Bức tranh cảnh vật</p>
        </div>
      )}
    </div>
  )
}