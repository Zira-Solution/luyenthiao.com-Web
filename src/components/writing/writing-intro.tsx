import { LayoutGrid, Timer, Upload, type LucideIcon } from "lucide-react"
import Image from "next/image"

import type { WritingTest } from "@/types/writing"

interface WritingIntroProps {
  test: WritingTest
  onStart: () => void
}

const INSTRUCTIONS: { icon: LucideIcon; text: string }[] = [
  {
    icon: LayoutGrid,
    text: "Bài thi được chia thành 1 phần. Tên của mỗi phần được đề cập trên đầu trang.",
  },
  {
    icon: Timer,
    text: "Bộ đếm thời gian hoạt động để nhắc thí sinh biết thời gian còn lại của bài thi.",
  },
  {
    icon: Upload,
    text: "Thí sinh Nộp bài khi đã hoàn thành bài thi. Thí sinh đảm bảo đã hoàn thành hết các câu hỏi khi nộp bài.",
  },
]

const GRADING_OPTIONS: { id: string; label: string; hint: string; default: boolean }[] = [
  {
    id: "teacher",
    label: "Yêu cầu giáo viên chấm điểm bài",
    hint: "Liên hệ giáo viên của bạn để xin mã lớp học",
    default: false,
  },
  {
    id: "ai",
    label: "Yêu cầu FLYER AI chấm bài trả điểm nhanh",
    hint: "Miễn phí",
    default: true,
  },
]

function IntroItem({
  icon: Icon,
  text,
}: {
  icon: LucideIcon
  text: string
}): React.ReactElement {
  return (
    <li className="flex items-start gap-3 rounded-2xl border border-sky-100 bg-sky-50 px-4 py-3">
      <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-sky-100">
        <Icon className="h-5 w-5 text-sky-700" />
      </span>
      <p className="text-sm leading-relaxed text-slate-700">{text}</p>
    </li>
  )
}

function GradingOption({
  option,
}: {
  option: (typeof GRADING_OPTIONS)[number]
}): React.ReactElement {
  return (
    <label className="flex cursor-pointer items-start gap-3 text-sm">
      <Image
        src={
          option.default
            ? "/clone-assets/writing/radio-checked.png"
            : "/clone-assets/writing/radio.png"
        }
        alt=""
        width={24}
        height={24}
        className="mt-0.5 object-contain"
      />
      <span className="leading-snug text-slate-700">
        {option.label}
        {option.hint ? (
          <span className="text-xs text-slate-500"> ({option.hint})</span>
        ) : null}
      </span>
    </label>
  )
}

/** Màn chờ giới thiệu trước khi bắt đầu bài thi Viết (nút "Bước tiếp theo"). */
export function WritingIntro({ test, onStart }: WritingIntroProps): React.ReactElement {
  return (
    <div className="relative flex min-h-[100dvh] w-full items-center justify-center overflow-y-auto bg-page-bg px-4 py-10">
      <Image
        src="/clone-assets/bg.1e17df80.png"
        alt=""
        fill
        priority
        className="object-cover opacity-80 pointer-events-none"
      />

      <div className="relative z-10 w-full max-w-[720px] rounded-[36px] border-4 border-teal-400/80 bg-white p-8 shadow-2xl">
        <button
          type="button"
          aria-label="Quay lại"
          className="absolute left-5 top-5 flex h-11 w-11 cursor-pointer items-center justify-center rounded-2xl bg-white shadow-md transition-transform hover:scale-105 active:scale-95"
        >
          <Image
            src="/clone-assets/writing/arrow-left.png"
            alt=""
            width={22}
            height={14}
            className="object-contain"
          />
        </button>

        <div className="flex flex-col items-center text-center">
          <span className="rounded-full bg-gradient-to-r from-purple-600 to-fuchsia-600 px-5 py-1.5 text-xs font-black uppercase tracking-wider text-white shadow">
            {test.name}
          </span>
          <h1 className="mt-3 text-3xl font-black tracking-wide text-slate-900">
            Bài thi viết
          </h1>
        </div>

        <ul className="mt-6 flex flex-col gap-4">
          {INSTRUCTIONS.map((item) => (
            <IntroItem key={item.text} icon={item.icon} text={item.text} />
          ))}
        </ul>

        <div className="mt-6 space-y-3 rounded-2xl bg-sky-50 p-4">
          {GRADING_OPTIONS.map((opt) => (
            <GradingOption key={opt.id} option={opt} />
          ))}
        </div>

        <div className="mt-8 flex flex-col items-center">
          <button
            type="button"
            onClick={onStart}
            className="cursor-pointer rounded-full bg-gradient-to-b from-purple-500 to-purple-700 px-14 py-4 text-base font-black uppercase tracking-widest text-white shadow-xl ring-4 ring-purple-300/50 transition-transform hover:scale-105 active:scale-95"
          >
            Bước tiếp theo
          </button>
        </div>
      </div>
    </div>
  )
}