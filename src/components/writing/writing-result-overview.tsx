'use client'

import { RotateCw, Play } from 'lucide-react'
import Image from 'next/image'

import { DEFAULT_SITE_CONFIG_CLIENT } from '@/components/admin/site-config/site-config-defaults'
import { useSiteConfig } from '@/providers/site-config-provider'
import type { WritingAttempt } from '@/types/writing'

interface WritingResultOverviewProps {
  attempt: WritingAttempt
  studentName?: string
  onRetake: () => void
  onReview: () => void
  onNext: () => void
}

/** Trang kết quả sau khi nộp bài Viết (overview cập nhật điểm + hành động). */
export function WritingResultOverview({
  attempt,
  studentName = 'HỌC VIÊN',
  onRetake,
  onReview,
  onNext,
}: WritingResultOverviewProps): React.ReactElement {
  const { score, maxScore, headerTitle, badge } = attempt
  const initial = (studentName.trim()[0] || 'H').toUpperCase()
  const { config, resolveAsset } = useSiteConfig()
  const bgSrc = resolveAsset(
    config.globalAssets.background,
    DEFAULT_SITE_CONFIG_CLIENT.globalAssets.background ?? '',
  )
  const congratulationSrc = resolveAsset(
    config.writingAssets.congratulationImage,
    DEFAULT_SITE_CONFIG_CLIENT.writingAssets.congratulationImage ?? '',
  )

  return (
    <div className="bg-page-bg relative flex min-h-[100dvh] w-full flex-col items-center overflow-y-auto px-4 py-8">
      <Image
        src={bgSrc}
        alt=""
        fill
        priority
        unoptimized
        className="pointer-events-none object-cover opacity-80"
      />

      <div className="relative z-10 flex w-full max-w-3xl flex-col items-center text-center">
        {/* Hồ sơ thí sinh */}
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-b from-sky-300 to-blue-500 font-black text-white ring-2 ring-white/30">
            {initial}
          </span>
          <span className="text-lg font-black text-white">{studentName.toUpperCase()}</span>
        </div>

        {/* Ngữ cảnh chúc mừng */}
        <div className="mt-6 flex flex-col items-center">
          <Image
            src={congratulationSrc}
            alt="Chúc mừng"
            width={420}
            height={110}
            unoptimized
            className="object-contain drop-shadow-lg"
          />
          <p className="mt-4 text-sm font-semibold text-white/85">Bạn vừa đạt số điểm</p>

          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-8xl leading-none font-black text-white drop-shadow-[0_3px_0_rgba(0,0,0,0.6)]">
              {score}
            </span>
            <span className="text-4xl font-black text-white/70">/{maxScore}</span>
          </div>

          <div className="mt-4 rounded-full bg-black/20 px-5 py-2 text-xs font-bold tracking-widest text-white/90 uppercase">
            {badge} - Writing - {headerTitle}
          </div>
        </div>

        {/* Hành động */}
        <div className="mt-12 grid w-full grid-cols-1 items-center gap-5 sm:grid-cols-[1fr_1.4fr_1fr]">
          <ActionIcon
            icon={<RotateCw className="h-6 w-6" />}
            label="Làm lại bài"
            onClick={onRetake}
          />
          <button
            type="button"
            onClick={onReview}
            className="order-last w-full cursor-pointer rounded-2xl bg-gradient-to-b from-orange-400 to-orange-600 px-4 py-3 text-sm font-black tracking-widest text-white uppercase shadow-xl transition-transform hover:scale-[1.02] active:scale-95 sm:order-none"
          >
            Xem lại bài thi của bạn
          </button>
          <ActionIcon
            icon={<Play className="h-6 w-6 translate-x-0.5" />}
            label="Làm bài tiếp theo"
            onClick={onNext}
          />
        </div>
      </div>

      {/* Linh vật trang trí */}
      <div className="pointer-events-none fixed right-4 bottom-4 z-0 flex flex-col items-end">
        <span className="mb-2 origin-bottom-right rotate-90 rounded-t-lg bg-amber-400 px-2 py-1 text-[10px] font-black tracking-widest text-amber-900 uppercase">
          Hỗ trợ trực tuyến
        </span>
      </div>
    </div>
  )
}

function ActionIcon({
  icon,
  label,
  onClick,
}: {
  icon: React.ReactElement
  label: string
  onClick: () => void
}): React.ReactElement {
  return (
    <button type="button" onClick={onClick} className="group cursor-pointer">
      <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-b from-purple-500 to-purple-800 text-white shadow-lg transition-transform group-hover:scale-105">
        {icon}
      </span>
      <span className="mt-2 block text-xs font-black tracking-wider text-white uppercase">
        {label}
      </span>
    </button>
  )
}
