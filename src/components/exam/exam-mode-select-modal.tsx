'use client'

import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

import { DEFAULT_SITE_CONFIG_CLIENT } from '@/components/admin/site-config/site-config-defaults'
import { cn } from '@/lib/utils'
import { useSiteConfig } from '@/providers/site-config-provider'

interface CheckpointData {
  level: string
  levelName: string
  challengeNumber: number
  totalMinutes: number
  parts: { name: string; maxScore: number; minutes: number }[]
}

export function ExamModeSelectModal({
  data,
  onStart,
}: {
  data: CheckpointData
  onStart: (mode: 'exam' | 'practice') => void
}) {
  const router = useRouter()
  const { config, resolveAsset } = useSiteConfig()
  const borderSrc = resolveAsset(
    config.checkpointAssets.border,
    DEFAULT_SITE_CONFIG_CLIENT.checkpointAssets.border ?? '',
  )
  const closeSrc = resolveAsset(
    config.checkpointAssets.closeButton,
    DEFAULT_SITE_CONFIG_CLIENT.checkpointAssets.closeButton ?? '',
  )
  const cornerLeftSrc = resolveAsset(
    config.checkpointAssets.cornerBottomLeft,
    DEFAULT_SITE_CONFIG_CLIENT.checkpointAssets.cornerBottomLeft ?? '',
  )
  const cornerRightSrc = resolveAsset(
    config.checkpointAssets.cornerBottomRight,
    DEFAULT_SITE_CONFIG_CLIENT.checkpointAssets.cornerBottomRight ?? '',
  )
  const rocketSrc = resolveAsset(
    config.checkpointAssets.rocket,
    DEFAULT_SITE_CONFIG_CLIENT.checkpointAssets.rocket ?? '',
  )
  const [mode, setMode] = useState<'exam' | 'practice'>('exam')
  const totalParts = data.parts.length

  const testTitle = `[${data.levelName}] Bài thi thử ${data.challengeNumber} - Nghe, Đọc, Viết`

  return (
    <div
      className="relative flex h-auto w-[520px] flex-col items-center rounded-[40px] p-6 shadow-2xl md:w-[720px] md:p-12"
      style={{
        background:
          'radial-gradient(50% 50%, var(--color-cp-modal-bg-top) 0%, var(--color-cp-modal-bg-bottom) 100%)',
      }}
    >
      {/* Border frame */}
      <Image
        src={borderSrc}
        alt=""
        fill
        unoptimized
        className="pointer-events-none object-fill"
        style={{ borderRadius: '40px' }}
      />

      {/* Close button */}
      <button
        onClick={() => router.push(`/testlevels/${data.level || 'movers'}`)}
        className="absolute top-4 right-4 z-20 h-10 w-10 cursor-pointer transition-transform hover:scale-105 active:scale-95"
        aria-label="Đóng"
      >
        <Image src={closeSrc} alt="Close" fill unoptimized className="object-contain" />
      </button>

      {/* Bottom decorations */}
      <Image
        src={cornerLeftSrc}
        alt=""
        width={180}
        height={90}
        unoptimized
        className="pointer-events-none absolute -bottom-4 -left-4 z-[3] max-md:hidden"
      />
      <Image
        src={cornerRightSrc}
        alt=""
        width={240}
        height={210}
        unoptimized
        className="pointer-events-none absolute -right-6 -bottom-4 z-[3] max-md:hidden"
      />

      {/* Title */}
      <div className="relative z-10 mb-6 w-full text-center">
        <h2
          className="font-heading m-0 mb-2 text-xl leading-snug text-white drop-shadow md:text-2xl"
          style={{ textShadow: 'rgba(0,0,0,0.45) 1.5px 2.5px 0px' }}
        >
          {testTitle}
        </h2>
        <h3
          className="m-0 text-sm font-black tracking-wider text-[#FFE03B] uppercase"
          style={{ textShadow: 'rgba(0,0,0,0.3) 1px 1.5px 0px' }}
        >
          Chọn chế độ
        </h3>
      </div>

      {/* Mode Tabs */}
      <div className="relative z-10 mb-6 flex w-full justify-center">
        <div className="bg-cp-tab-track relative flex h-[50px] w-[300px] rounded-xl border border-white/5 p-1 md:w-[380px]">
          <div
            role="tab"
            aria-selected={mode === 'exam'}
            onClick={() => setMode('exam')}
            className={cn(
              'flex h-full flex-1 cursor-pointer items-center justify-center rounded-lg transition-all',
              mode === 'exam' ? 'bg-cp-tab-active shadow-md' : 'hover:bg-white/5',
            )}
          >
            <span
              className={cn(
                'text-sm font-black tracking-wide uppercase',
                mode === 'exam' ? 'text-white' : 'text-cp-tab-muted',
              )}
            >
              Thi thử
            </span>
          </div>
          <div
            role="tab"
            aria-selected={mode === 'practice'}
            onClick={() => setMode('practice')}
            className={cn(
              'flex h-full flex-1 cursor-pointer items-center justify-center rounded-lg transition-all',
              mode === 'practice' ? 'bg-cp-tab-active shadow-md' : 'hover:bg-white/5',
            )}
          >
            <span
              className={cn(
                'text-sm font-black tracking-wide uppercase',
                mode === 'practice' ? 'text-white' : 'text-cp-tab-muted',
              )}
            >
              Luyện tập
            </span>
          </div>
        </div>
      </div>

      {/* Detail Card */}
      <div className="border-cp-card-border bg-cp-card-bg/60 relative z-10 mb-6 flex w-full max-w-[580px] flex-col rounded-3xl border p-5 shadow-inner backdrop-blur-sm md:p-6">
        <p className="mb-2 border-b border-white/10 pb-2 text-xs font-black tracking-wider text-[#FFE03B] uppercase">
          Chi tiết
        </p>
        <div className="bg-cp-tab-track/70 flex flex-col gap-4 rounded-2xl border border-white/5 p-4">
          <p className="m-0 text-xs leading-normal font-bold text-white">
            Bài kiểm tra có: <span className="font-black text-[#FFE03B]">{totalParts} Phần</span> -
            Tổng thời gian:{' '}
            <span className="font-black text-[#FFE03B]">{data.totalMinutes} Phút</span>
          </p>

          <div className="flex flex-col gap-3">
            {data.parts.map((part) => (
              <div
                key={part.name}
                className="flex flex-col gap-1 border-t border-white/5 pt-2.5 first:border-0 first:pt-0"
              >
                <span className="text-xs font-black tracking-wide text-white uppercase">
                  {part.name}
                </span>
                <div className="flex items-center gap-1.5 text-xs font-semibold text-white/80">
                  <span className="text-base leading-none text-[#FFE03B]">·</span>
                  <span>Điểm tối đa:</span>
                  <span className="font-black text-[#FFE03B]">{part.maxScore} Điểm</span>
                  <span className="text-white/40">/</span>
                  <span className="font-black text-[#FFE03B]">{part.minutes} Phút</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Start Button */}
      <div className="relative z-10 flex w-full justify-center">
        <button
          onClick={() => onStart(mode)}
          className="relative cursor-pointer transition-transform hover:scale-105 active:scale-95"
        >
          <div className="from-cp-start-from to-cp-start-to border-cp-start-border relative flex items-center gap-2 rounded-2xl border-b-4 bg-gradient-to-b px-8 py-3 shadow-lg">
            <Image
              src={rocketSrc}
              alt=""
              width={36}
              height={36}
              unoptimized
              className="-ml-1 h-8 w-8 object-contain"
            />
            <span
              className="text-sm font-black tracking-wider text-white uppercase"
              style={{ textShadow: 'rgba(0,0,0,0.45) 0.5px 2.5px 0px' }}
            >
              Bắt đầu
            </span>
          </div>
        </button>
      </div>
    </div>
  )
}
