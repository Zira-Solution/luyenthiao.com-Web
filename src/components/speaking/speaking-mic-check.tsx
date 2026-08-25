"use client"

import Image from "next/image"

import { SpeakingMicRecord } from "./speaking-mic-record"

interface SpeakingMicCheckProps {
  onSkip: () => void
  onDone: () => void
}

/** Bảng kiểm tra micro trước khi thi (copy + asset thật của Flyer). */
export function SpeakingMicCheck({
  onSkip,
  onDone,
}: SpeakingMicCheckProps): React.ReactElement {
  return (
    <div className="relative flex min-h-[100dvh] w-full items-center justify-center overflow-y-auto bg-page-bg px-4 py-10">
      <Image
        src="/clone-assets/speaking/bg.894c95ef.png"
        alt=""
        fill
        priority
        className="pointer-events-none object-cover opacity-25"
      />

      <div className="relative z-10 flex w-full max-w-[620px] flex-col items-center rounded-[36px] bg-white p-8 text-center shadow-2xl ring-4 ring-amber-200/70">
        <Image
          src="/clone-assets/speaking/ic-micro.298eb73f.png"
          alt="Micro"
          width={64}
          height={64}
          className="h-16 w-16 object-contain drop-shadow"
        />

        <h1 className="mt-4 text-2xl font-black uppercase tracking-wide text-slate-900">
          Kiểm tra micro của bạn
        </h1>
        <p className="mt-3 max-w-md text-sm leading-relaxed text-slate-500">
          Để hoàn thành hoạt động này, bạn phải cho phép truy cập vào micrô của
          hệ thống. Nhấp vào nút bên dưới để bắt đầu.
        </p>

        <div className="mt-6 w-full rounded-3xl bg-amber-50 px-6 py-6 ring-1 ring-amber-200">
          <SpeakingMicRecord onRecorded={() => {}} label="KIỂM TRA MICRO" />
        </div>

        <div className="mt-7 flex flex-col items-center gap-3">
          <button
            type="button"
            onClick={onDone}
            className="cursor-pointer rounded-full bg-gradient-to-b from-emerald-400 to-emerald-600 px-12 py-3.5 text-base font-black uppercase tracking-widest text-white shadow-xl ring-4 ring-emerald-200 transition-transform hover:scale-105 active:scale-95"
          >
            Bắt đầu bài thi
          </button>
          <button
            type="button"
            onClick={onSkip}
            className="cursor-pointer text-sm font-bold text-slate-500 transition-colors hover:text-slate-700"
          >
            BỎ QUA VÀ BẮT ĐẦU BÀI THI
          </button>
        </div>
      </div>
    </div>
  )
}