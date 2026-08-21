'use client'

import Image from 'next/image'
import { useState } from 'react'

import type { SpeakingDraggable, SpeakingSceneSlot } from '@/types/speaking'

export type SceneMode = 'mark' | 'drag'

interface SpeakingSceneProps {
  sceneBg?: string
  slots: SpeakingSceneSlot[]
  palette?: SpeakingDraggable[]
  mode: SceneMode
  selectedId?: string
  placed?: boolean
  correctTargetId?: string
  correctDraggableId?: string
  onSelect?: (id: string) => void
  onDrop?: (targetId: string, objectId: string, matched: boolean) => void
}

/**
 * Bức tranh cảnh tương tác dùng đúng asset thật. Vẽ bằng SVG (tỷ lệ tự giữ).
 *
 * - `mark` (Phần 1a): chạm thẳng vào vật trong cảnh để chọn.
 * - `drag` (Phần 1c): hiện hàng đồ vật để chọn → nhấn vật đúng → nhấn ô đích
 *   trong cảnh để đặt (tránh thao tác kéo-thả khó trên touch/small screen).
 */
export function SpeakingScene({
  sceneBg,
  slots,
  palette,
  mode,
  selectedId,
  placed,
  correctTargetId,
  correctDraggableId,
  onSelect,
  onDrop,
}: SpeakingSceneProps): React.ReactElement {
  const [pickedId, setPickedId] = useState<string | null>(null)
  const pickedObject = palette?.find((p) => p.id === pickedId)

  const handleSlotClick = (slot: SpeakingSceneSlot) => {
    if (mode === 'mark') {
      onSelect?.(slot.id)
      return
    }
    // drag: phải chọn đúng đồ vật trước (hoặc bất kỳ vật nào để thử).
    if (!pickedId) return
    const objectCorrect = pickedId === correctDraggableId
    const targetCorrect = slot.id === correctTargetId
    const id = pickedId
    setPickedId(null)
    onDrop?.(slot.id, id, objectCorrect && targetCorrect)
  }

  const placeTarget = selectedId ? slots.find((s) => s.id === selectedId) : undefined
  const objectReady = mode === 'drag' && pickedObject !== undefined

  return (
    <div className="w-full select-none">
      <div className="relative w-full overflow-hidden rounded-[1.75rem] border-4 border-[#f0d9b0] shadow-2xl">
        {sceneBg ? (
          <svg
            viewBox="0 0 1200 900"
            className="block h-auto w-full"
            role="img"
            aria-label="Bức tranh cảnh vật"
          >
            <image
              href={sceneBg}
              x={0}
              y={0}
              width={1200}
              height={900}
              preserveAspectRatio="xMidYMid slice"
            />

            {/* Các vật / ô đích. */}
            {slots.map((slot) => {
              const bx = (1200 * slot.left) / 100
              const by = (900 * slot.top) / 100
              const bw = Math.max((1200 * slot.width) / 100, 8)
              const bh = Math.max((900 * slot.height) / 100, 8)
              const active = mode === 'mark' && selectedId === slot.id
              // drag: ô đích đúng được gợi ý khi đã chọn đúng đồ vật.
              const isTarget = mode === 'drag' && slot.id === correctTargetId
              const hint = isTarget && objectReady && pickedObject?.id === correctDraggableId
              return (
                <g
                  key={slot.id}
                  onClick={() => handleSlotClick(slot)}
                  className="cursor-pointer"
                  role="button"
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
                      fillOpacity={isTarget ? 0.45 : 0.18}
                      stroke={hint ? '#16a34a' : isTarget ? '#22c55e' : '#e2b13c'}
                      strokeWidth={hint ? 4 : 2}
                      strokeDasharray="6 5"
                    />
                  )}
                  {mode === 'mark' ? (
                    <circle
                      cx={bx + bw / 2}
                      cy={by + bh / 2}
                      r={Math.max(bw, bh) * 0.55}
                      fill="transparent"
                      stroke={active ? '#22c55e' : '#ffffff'}
                      strokeWidth={active ? 5 : 3}
                      opacity={0.9}
                    />
                  ) : null}
                </g>
              )
            })}

            {/* Đồ vật đã đặt đúng (Phần 1c). */}
            {mode === 'drag' && placeTarget && placed ? (
              <g>
                <title>Đã đặt</title>
                <image
                  href={pickedObject?.src ?? ''}
                  x={(1200 * placeTarget.left) / 100}
                  y={(900 * placeTarget.top) / 100}
                  width={(1200 * placeTarget.width) / 100 + 6}
                  height={(900 * placeTarget.height) / 100 + 6}
                />
                <rect
                  x={(1200 * placeTarget.left) / 100 - 4}
                  y={(900 * placeTarget.top) / 100 - 4}
                  width={(1200 * placeTarget.width) / 100 + 14}
                  height={(900 * placeTarget.height) / 100 + 14}
                  rx={8}
                  fill="none"
                  stroke="#22c55e"
                  strokeWidth={4}
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

      {/* Hàng đồ vật để chọn (Phần 1c). */}
      {mode === 'drag' && palette ? (
        <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
          {palette.map((item) => {
            const isPicked = pickedId === item.id
            const isCorrect = item.id === correctDraggableId
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setPickedId(item.id)}
                aria-pressed={isPicked}
                aria-label={item.label}
                className={
                  'flex cursor-pointer flex-col items-center gap-1 rounded-2xl border-4 px-3 py-2 shadow-md transition-transform hover:scale-105 active:scale-95 ' +
                  (isPicked
                    ? 'border-emerald-500 bg-emerald-50 ring-4 ring-emerald-200'
                    : 'border-[#f0d9b0] bg-white')
                }
              >
                <Image
                  src={item.src}
                  alt={item.label}
                  width={52}
                  height={52}
                  draggable={false}
                  className="h-14 w-14 object-contain"
                />
                <span
                  className={
                    'text-[10px] font-bold tracking-wide uppercase ' +
                    (isCorrect ? 'text-emerald-600' : 'text-slate-500')
                  }
                >
                  {item.label}
                </span>
              </button>
            )
          })}
        </div>
      ) : null}

      {mode === 'drag' ? (
        <p className="mt-2 text-center text-xs font-semibold text-slate-500">
          {pickedObject
            ? `Đã chọn "${pickedObject.label}". Nhấn vào vị trí đúng trong bức tranh để đặt.`
            : 'Chọn đồ vật rồi nhấn vào vị trí đúng trong bức tranh.'}
        </p>
      ) : null}
    </div>
  )
}
