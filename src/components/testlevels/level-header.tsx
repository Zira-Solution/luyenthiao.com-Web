'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import type { ReactElement } from 'react'

import { DEFAULT_SITE_CONFIG_CLIENT } from '@/components/admin/site-config/site-config-defaults'
import { DEMO_SPEAKING_TEST_PATH } from '@/constants'
import { useSiteConfig } from '@/providers/site-config-provider'

interface LevelHeaderProps {
  levelName: string
  examIds?: string[]
}

export function LevelHeader({ levelName, examIds }: LevelHeaderProps): ReactElement {
  const router = useRouter()
  const { config, resolveAsset, mapText } = useSiteConfig()
  const backText = mapText('back')
  const videoText = mapText('videoSpeaking')
  const randomText = mapText('random')
  const backButtonSrc = resolveAsset(
    config.mapAssets.backButton,
    DEFAULT_SITE_CONFIG_CLIENT.mapAssets.backButton ?? '',
  )
  const backButtonMobileSrc = resolveAsset(
    config.mapAssets.backButtonMobile,
    DEFAULT_SITE_CONFIG_CLIENT.mapAssets.backButtonMobile ?? '',
  )
  const titleRibbonSrc = resolveAsset(
    config.mapAssets.titleRibbon,
    DEFAULT_SITE_CONFIG_CLIENT.mapAssets.titleRibbon ?? '',
  )
  const videoButtonSrc = resolveAsset(
    config.mapAssets.videoButton,
    DEFAULT_SITE_CONFIG_CLIENT.mapAssets.videoButton ?? '',
  )
  const randomButtonSrc = resolveAsset(
    config.mapAssets.randomButton,
    DEFAULT_SITE_CONFIG_CLIENT.mapAssets.randomButton ?? '',
  )
  const randomButtonMobileSrc = resolveAsset(
    config.mapAssets.randomButtonMobile,
    DEFAULT_SITE_CONFIG_CLIENT.mapAssets.randomButtonMobile ?? '',
  )

  const handleRandom = () => {
    if (examIds && examIds.length > 0) {
      const idx = Math.floor(Math.random() * examIds.length)
      const chosen = examIds[idx]
      if (chosen) {
        router.push(`/check-point/${chosen}`)
        return
      }
    }
    router.push('/check-point/demo')
  }
  return (
    <header className="pointer-events-none fixed top-0 right-0 left-0 z-30 flex w-full items-center justify-between px-[3%] pt-2 md:pt-4">
      {/* Back Button */}
      <div className="pointer-events-auto w-[25%] max-w-[415px]">
        {/* Desktop Back Button */}
        <Link
          href="/"
          className="block hidden w-full max-w-[330px] transition-transform hover:scale-105 active:scale-95 sm:block"
        >
          <div className="relative aspect-[357/113] w-full">
            <Image
              src={backButtonSrc}
              alt={backText}
              fill
              priority
              unoptimized
              className="object-contain"
            />
            <div className="absolute inset-0 top-[14%] right-[16.5%] bottom-[42%] left-[50%] flex items-center justify-center">
              <span className="font-heading text-xs font-black tracking-wider text-white uppercase select-none md:text-sm lg:text-base">
                {backText}
              </span>
            </div>
          </div>
        </Link>
        {/* Mobile Back Button */}
        <Link
          href="/"
          className="block w-[55%] max-w-[169px] transition-transform hover:scale-105 active:scale-95 sm:hidden"
        >
          <div className="relative aspect-[189/113] w-full">
            <Image
              src={backButtonMobileSrc}
              alt={backText}
              fill
              priority
              unoptimized
              className="object-contain"
            />
          </div>
        </Link>
      </div>

      {/* Center Title & Speaking Banner */}
      <div className="pointer-events-auto relative flex w-[46%] max-w-[654px] -translate-y-[15%] flex-col items-center sm:-translate-y-[27%]">
        {/* Ribbon Title */}
        <div className="relative aspect-[632/140] w-full">
          <Image
            src={titleRibbonSrc}
            alt="Tiêu đề"
            fill
            priority
            unoptimized
            className="object-contain"
          />
          <div className="absolute inset-0 flex items-center justify-center pt-[5.5%]">
            <span className="font-heading text-xs font-black tracking-widest text-white uppercase drop-shadow-[0_2px_3px_rgba(0,0,0,0.6)] select-none sm:text-lg md:text-2xl lg:text-3xl">
              {levelName}
            </span>
          </div>
        </div>

        {/* Video Speaking Button (Positioned absolute below ribbon) */}
        <div className="absolute bottom-0 left-1/2 z-10 w-[70%] -translate-x-1/2 translate-y-[65%] sm:translate-y-[70%]">
          <Link
            href={DEMO_SPEAKING_TEST_PATH}
            className="relative block aspect-[456/126] w-full transition-transform hover:scale-105 active:scale-95"
          >
            <Image
              src={videoButtonSrc}
              alt={videoText}
              fill
              unoptimized
              className="object-contain"
            />
            <div className="absolute inset-0 top-[30%] right-[16%] bottom-[37%] left-[14%] flex items-center justify-center">
              <span className="font-heading text-[8px] font-black tracking-wider text-white uppercase drop-shadow-md select-none sm:text-[10px] md:text-[13px]">
                🎬 {videoText}
              </span>
            </div>
          </Link>
        </div>
      </div>

      {/* Random Button */}
      <div className="pointer-events-auto flex w-[25%] max-w-[415px] justify-end">
        {/* Desktop Random Button */}
        <button
          type="button"
          onClick={handleRandom}
          className="relative hidden aspect-[415/112] w-full max-w-[330px] cursor-pointer transition-transform hover:scale-105 active:scale-95 sm:block"
        >
          <Image
            src={randomButtonSrc}
            alt={randomText}
            fill
            priority
            unoptimized
            className="object-contain"
          />
          <div className="absolute inset-0 top-[14%] right-[43%] bottom-[42%] left-[11%] flex items-center justify-center">
            <span className="font-heading text-xs font-black tracking-wider text-white uppercase select-none md:text-sm lg:text-base">
              🎲 {randomText}
            </span>
          </div>
        </button>
        {/* Mobile Random Button */}
        <button
          type="button"
          onClick={handleRandom}
          aria-label="Chọn đề ngẫu nhiên"
          className="relative aspect-[186/112] w-[55%] max-w-[169px] cursor-pointer transition-transform hover:scale-105 active:scale-95 sm:hidden"
        >
          <Image
            src={randomButtonMobileSrc}
            alt={randomText}
            fill
            priority
            unoptimized
            className="object-contain"
          />
        </button>
      </div>
    </header>
  )
}
