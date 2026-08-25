import { RotateCw, Play } from "lucide-react"
import Image from "next/image"

import type { WritingAttempt } from "@/types/writing"

interface WritingResultOverviewProps {
  attempt: WritingAttempt
  onRetake: () => void
  onReview: () => void
  onNext: () => void
}

/** Trang kết quả sau khi nộp bài Viết (overview cập nhật điểm + hành động). */
export function WritingResultOverview({
  attempt,
  onRetake,
  onReview,
  onNext,
}: WritingResultOverviewProps): React.ReactElement {
  const { score, maxScore, headerTitle, badge } = attempt

  return (
    <div className="relative flex min-h-[100dvh] w-full flex-col items-center overflow-y-auto bg-page-bg px-4 py-8">
      <Image
        src="/clone-assets/bg.1e17df80.png"
        alt=""
        fill
        priority
        className="object-cover opacity-80 pointer-events-none"
      />

      <div className="relative z-10 flex w-full max-w-3xl flex-col items-center text-center">
        {/* Hồ sơ thí sinh */}
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-b from-sky-300 to-blue-500 font-black text-white ring-2 ring-white/30">
            P
          </span>
          <span className="text-lg font-black text-white">PHÚC</span>
        </div>

        {/* Ngữ cảnh chúc mừng */}
        <div className="mt-6 flex flex-col items-center">
          <Image
            src="/clone-assets/writing/congratulation-vi.png"
            alt="Chúc mừng"
            width={420}
            height={110}
            className="object-contain drop-shadow-lg"
          />
          <p className="mt-4 text-sm font-semibold text-white/85">Bạn vừa đạt số điểm</p>

          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-8xl font-black leading-none text-white drop-shadow-[0_3px_0_rgba(0,0,0,0.6)]">
              {score}
            </span>
            <span className="text-4xl font-black text-white/70">/{maxScore}</span>
          </div>

          <div className="mt-4 rounded-full bg-black/20 px-5 py-2 text-xs font-bold uppercase tracking-widest text-white/90">
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
            className="order-last w-full cursor-pointer rounded-2xl bg-gradient-to-b from-orange-400 to-orange-600 px-4 py-3 text-sm font-black uppercase tracking-widest text-white shadow-xl transition-transform hover:scale-[1.02] active:scale-95 sm:order-none"
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
      <div className="pointer-events-none fixed bottom-4 right-4 z-0 flex flex-col items-end">
        <span className="mb-2 rotate-90 origin-bottom-right rounded-t-lg bg-amber-400 px-2 py-1 text-[10px] font-black uppercase tracking-widest text-amber-900">
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
      <span className="mt-2 block text-xs font-black uppercase tracking-wider text-white">
        {label}
      </span>
    </button>
  )
}