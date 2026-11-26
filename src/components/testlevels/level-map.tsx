'use client'

import Image from 'next/image'
import Link from 'next/link'
import type { ReactElement } from 'react'

import { DEFAULT_SITE_CONFIG_CLIENT } from '@/components/admin/site-config/site-config-defaults'
import { useSiteConfig } from '@/providers/site-config-provider'
import type { PublicExamSummary } from '@/schemas/student-exam'

interface LevelMapData {
  name: string
  total: number
  unlocked: number
  mapBackground: string
  mobileBackground: string
}

interface LevelMapProps {
  level: LevelMapData
  exams?: PublicExamSummary[]
}

const SEGMENT_COORDINATES = [
  { top: 6.960857, left: 60.825363, isRounded: true },
  { top: 8.201304, left: 31.756756, isRounded: false },
  { top: 25.0234, left: 38.825364, isRounded: false },
  { top: 29.916123, left: 62.525987, isRounded: false },
  { top: 47.390494, left: 47.713098, isRounded: false },
  { top: 62.629937, left: 60.631873, isRounded: false },
  { top: 63.000931, left: 35.239085, isRounded: false },
  { top: 79.72973, left: 32.380457, isRounded: false },
  { top: 84.43616, left: 61.746362, isRounded: false },
]

export function LevelMap({ level, exams }: LevelMapProps): ReactElement {
  const { config, resolveAsset, mapText } = useSiteConfig()
  const checkpointBadgeSrc = resolveAsset(
    config.mapAssets.checkpointBadge,
    DEFAULT_SITE_CONFIG_CLIENT.mapAssets.checkpointBadge ?? '',
  )
  const checkpointTitleSrc = resolveAsset(
    config.mapAssets.checkpointTitle,
    DEFAULT_SITE_CONFIG_CLIENT.mapAssets.checkpointTitle ?? '',
  )
  const checkpointDisabledSrc = resolveAsset(
    config.mapAssets.checkpointDisabled,
    DEFAULT_SITE_CONFIG_CLIENT.mapAssets.checkpointDisabled ?? '',
  )
  const lockedBadgeSrc = resolveAsset(
    config.mapAssets.lockedBadge,
    DEFAULT_SITE_CONFIG_CLIENT.mapAssets.lockedBadge ?? '',
  )
  const checkpointTitleDisabledSrc = resolveAsset(
    config.mapAssets.checkpointTitleDisabled,
    DEFAULT_SITE_CONFIG_CLIENT.mapAssets.checkpointTitleDisabled ?? '',
  )
  const segmentSize = 9
  const totalSegments = Math.max(1, Math.ceil((level.total || 9) / segmentSize))
  const segments = Array.from({ length: totalSegments }, (_, i) => i)
  const mapBg = level.mapBackground || '/clone-assets/exam/bg-map.73c46437.jpg'
  const isExternalBg = mapBg.startsWith('http://') || mapBg.startsWith('https://')

  return (
    <div className="flex w-full flex-col">
      {segments.map((segmentIndex) => {
        // Calculate which level IDs belong to this segment
        const startLevel = segmentIndex * segmentSize + 1
        const endLevel = Math.min(startLevel + segmentSize - 1, level.total)
        const segmentButtons = Array.from(
          { length: endLevel - startLevel + 1 },
          (_, btnIdx) => startLevel + btnIdx,
        )

        return (
          <div
            key={segmentIndex}
            className="relative -ml-[25%] aspect-[1920/1847] w-[150%] overflow-visible sm:ml-0 sm:w-full"
          >
            {/* Background Image for Segment */}
            <Image
              src={mapBg}
              alt={`Bản đồ phân đoạn ${segmentIndex + 1}`}
              width={1920}
              height={1847}
              priority={segmentIndex < 2}
              unoptimized={isExternalBg}
              className="pointer-events-none z-0 h-full w-full object-cover select-none"
            />

            {/* Checkpoints container */}
            <div className="absolute inset-0 z-10">
              {segmentButtons.map((levelNum, index) => {
                const coord = SEGMENT_COORDINATES[index]
                if (!coord) return null

                const matchedExam = exams?.[levelNum - 1]
                const isUnlocked = exams ? Boolean(matchedExam) : levelNum <= level.unlocked
                const isRounded = coord.isRounded
                const checkpointHref = matchedExam
                  ? `/check-point/${matchedExam.id}`
                  : '/check-point/7778495e-531b-4039-a3ea-321874ba1a7a'
                const checkpointLabel = matchedExam?.name || `Thử thách ${levelNum}`

                return (
                  <div
                    key={levelNum}
                    className={`absolute aspect-square w-[11.715915%] ${
                      isRounded ? 'rounded-full' : ''
                    }`}
                    style={{
                      // clone-gate-ignore
                      top: `${coord.top}%`,
                      left: `${coord.left}%`,
                    }}
                  >
                    {isUnlocked ? (
                      <Link
                        href={checkpointHref}
                        title={checkpointLabel}
                        className="relative block h-full w-full transition-transform duration-200 hover:scale-110 active:scale-95"
                      >
                        {/* Checkpoint circular badge */}
                        <Image
                          src={checkpointBadgeSrc}
                          alt={checkpointLabel}
                          fill
                          unoptimized
                          className="object-contain drop-shadow-[0_4px_8px_rgba(0,0,0,0.4)]"
                        />
                        {/* Checkpoint Number */}
                        <div className="absolute inset-0 top-[28%] flex justify-center">
                          <span className="font-heading text-sm font-black text-[#000e41] drop-shadow-[0_1px_1px_rgba(255,255,255,0.6)] select-none sm:text-xl md:text-2xl">
                            {levelNum}
                          </span>
                        </div>
                        {/* Checkpoint Title ribbon */}
                        <div className="absolute top-[64.159292%] -left-[16.371681%] aspect-[319/113] w-[132.743362%]">
                          <Image
                            src={checkpointTitleSrc}
                            alt=""
                            fill
                            unoptimized
                            className="object-contain"
                          />
                          <div className="absolute inset-0 flex items-center justify-center px-[15%] pt-[8%] pb-[6%]">
                            <span className="font-heading truncate text-[8px] font-black tracking-wider text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] select-none sm:text-[10px] md:text-xs">
                              {checkpointLabel}
                            </span>
                          </div>
                        </div>
                      </Link>
                    ) : (
                      <div className="relative h-full w-full opacity-90">
                        {/* Checkpoint circular badge disabled */}
                        <Image
                          src={checkpointDisabledSrc}
                          alt={`${mapText('challengeLabel', { n: levelNum })} (khoá)`}
                          fill
                          unoptimized
                          className="object-contain drop-shadow-[0_2px_4px_rgba(0,0,0,0.2)]"
                        />
                        {/* Checkpoint Number */}
                        <div className="absolute inset-0 top-[28%] flex justify-center">
                          <span className="font-heading text-sm font-black text-[#000e41]/60 select-none sm:text-xl md:text-2xl">
                            {levelNum}
                          </span>
                        </div>
                        {/* Locked Padlock Badge */}
                        <div className="absolute top-0 right-[1%] z-10 aspect-[183/231] w-[28.105263%]">
                          <Image
                            src={lockedBadgeSrc}
                            alt="Bị khoá"
                            fill
                            unoptimized
                            className="object-contain"
                          />
                        </div>
                        {/* Checkpoint Title ribbon disabled */}
                        <div className="absolute top-[64.159292%] -left-[16.371681%] aspect-[319/113] w-[132.743362%]">
                          <Image
                            src={checkpointTitleDisabledSrc}
                            alt=""
                            fill
                            unoptimized
                            className="object-contain"
                          />
                          <div className="absolute inset-0 flex items-center justify-center px-[15%] pt-[8%] pb-[6%]">
                            <span className="font-heading truncate text-[8px] font-black tracking-wider text-white/60 drop-shadow-[0_1px_1px_rgba(0,0,0,0.5)] select-none sm:text-[10px] md:text-xs">
                              {mapText('challengeLabel', { n: levelNum })}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}
