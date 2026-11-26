"use client"

import { ArrowLeft, ClipboardList } from "lucide-react"
import Image from "next/image"

import { DEFAULT_SITE_CONFIG_CLIENT } from "@/components/admin/site-config/site-config-defaults"
import { useSiteConfig } from "@/providers/site-config-provider"
import type { SpeakingAttempt } from "@/types/speaking"

interface SpeakingResultProps {
  attempt: SpeakingAttempt
  onReview: () => void
  onBack?: () => void
}

/** Màn kết quả sau khi nộp bài Nói. */
export function SpeakingResult({
  attempt,
  onReview,
  onBack,
}: SpeakingResultProps): React.ReactElement {
  const { config, resolveAsset } = useSiteConfig()
  const ga = config.globalAssets
  const dga = DEFAULT_SITE_CONFIG_CLIENT.globalAssets
  const bgSrc = resolveAsset(ga.background, dga.background ?? "")
  const frameSrc = resolveAsset(ga.resultFrame, dga.resultFrame ?? "")
  const trophySrc = resolveAsset(ga.trophyIcon, dga.trophyIcon ?? "")

  return (
    <div className="relative min-h-[100dvh] w-full overflow-y-auto bg-page-bg px-4 py-10">
      <Image
        src={bgSrc}
        alt=""
        fill
        priority
        unoptimized
        className="pointer-events-none object-cover opacity-80"
      />

      <div className="relative z-10 mx-auto flex w-full max-w-xl flex-col items-center text-center">
        <button
          type="button"
          onClick={onBack}
          className="absolute left-2 top-2 flex h-11 w-11 cursor-pointer items-center justify-center rounded-2xl bg-white/20 shadow backdrop-blur hover:bg-white/30"
          aria-label="Quay lại"
        >
          <ArrowLeft className="h-5 w-5 text-white" aria-hidden />
        </button>

        <div className="relative mt-4">
          <Image
            src={frameSrc}
            alt=""
            width={120}
            height={120}
            unoptimized
            className="object-contain"
          />
          <span className="absolute inset-0 flex items-center justify-center text-6xl">
            👦
          </span>
        </div>

        <p className="mt-2 text-2xl font-black tracking-widest text-white drop-shadow">
          {attempt.userName}
        </p>

        <div className="mt-6 flex items-center gap-2 text-5xl">
          <Image
            src={trophySrc}
            alt=""
            width={52}
            height={52}
            unoptimized
            className="object-contain"
          />
        </div>

        <h1 className="mt-5 text-3xl font-black uppercase tracking-wide text-white drop-shadow-lg">
          Bạn vừa hoàn thành bài thi
        </h1>
        <p className="mt-3 text-sm font-semibold text-purple-100">
          {attempt.testTitle}
        </p>

        <div className="mt-8 flex w-full flex-col items-center gap-4">
          <button
            type="button"
            onClick={onReview}
            className="flex cursor-pointer items-center gap-2 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 px-10 py-4 text-base font-black uppercase tracking-wide text-white shadow-xl ring-4 ring-amber-200/60 transition-transform hover:scale-105"
          >
            <ClipboardList className="h-5 w-5" aria-hidden />
            Xem lại bài nói của bạn
          </button>
          <p className="max-w-sm text-sm text-purple-200">
            Liên hệ với giáo viên để vào lớp và được chấm điểm hoặc...
          </p>
        </div>
      </div>
    </div>
  )
}