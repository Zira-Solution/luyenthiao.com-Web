import Image from 'next/image'

interface SpeakingIntroProps {
  name: string
  onStart: () => void
}

/** Một dòng hướng dẫn chung với icon (asset) thật. */
function GuidelineRow({
  src,
  alt,
  strong,
  text,
}: {
  src: string
  alt: string
  strong: string
  text: string
}): React.ReactElement {
  return (
    <li className="flex items-center gap-4 rounded-2xl border border-amber-200/60 bg-white px-5 py-4 shadow-sm">
      <span className="flex h-12 w-12 shrink-0 items-center justify-center">
        <Image src={src} alt={alt} width={48} height={48} className="h-12 w-12 object-contain" />
      </span>
      <span className="text-base font-semibold text-slate-700">
        <span className="font-black text-slate-900">{strong}</span> {text}
      </span>
    </li>
  )
}

/** Màn hướng dẫn chung trước khi bắt đầu ghi âm (copy + asset thật của Luyện Thi Ảo). */
export function SpeakingIntro({ name, onStart }: SpeakingIntroProps): React.ReactElement {
  return (
    <div className="bg-page-bg relative flex min-h-[100dvh] w-full flex-col items-center overflow-y-auto px-4 py-6">
      <Image
        src="/clone-assets/speaking/bg.894c95ef.webp"
        alt=""
        fill
        priority
        className="pointer-events-none object-cover opacity-25"
      />

      {/* Header: TRỞ VỀ + timer + kim cương */}
      <header className="relative z-10 flex w-full max-w-4xl items-center justify-between">
        <button type="button" className="flex cursor-pointer items-center gap-1">
          <Image
            src="/clone-assets/speaking/btn-out.94d0dd6c.webp"
            alt=""
            width={112}
            height={46}
            className="h-11 w-auto object-contain"
          />
        </button>
        <div className="flex items-center gap-1">
          <Image
            src="/clone-assets/speaking/box-time.2ac9e25e.webp"
            alt=""
            width={112}
            height={44}
            className="h-11 w-auto object-contain"
          />
        </div>
      </header>

      <div className="relative z-10 mt-8 w-full max-w-[680px] flex-1">
        <div className="flex flex-col items-center text-center">
          <span className="rounded-2xl bg-[#e63a2e] px-5 py-1.5 text-sm font-black tracking-wider text-white uppercase shadow">
            {name}
          </span>
          <h1 className="mt-3 text-4xl font-black tracking-wide text-slate-900 drop-shadow-sm">
            Bài thi Nói
          </h1>
          <p className="mt-2 text-sm font-bold tracking-widest text-amber-600 uppercase">
            Hướng dẫn chung
          </p>
        </div>

        <ul className="mt-7 flex flex-col gap-3">
          <GuidelineRow
            src="/clone-assets/speaking/sound.e34e2ea7.webp"
            alt="Bật âm thanh"
            strong="BẬT ÂM THANH"
            text="khi làm bài"
          />
          <GuidelineRow
            src="/clone-assets/speaking/mix.a2c7f937.webp"
            alt="Tai nghe"
            strong="Kiểm tra TAI NGHE"
            text="THU ÂM"
          />
          <GuidelineRow
            src="/clone-assets/speaking/book.4e98e9a5.webp"
            alt="Hoàn thành tất cả"
            strong="HOÀN THÀNH TẤT CẢ"
            text="câu hỏi để nộp bài"
          />
        </ul>

        {/* Yêu cầu chấm bài */}
        <div className="mt-5 flex items-center justify-center gap-3 rounded-2xl border-2 border-amber-300 bg-white px-5 py-3 shadow-sm">
          <Image
            src="/clone-assets/speaking/un-check.1f84877f.webp"
            alt=""
            width={24}
            height={24}
            className="h-6 w-6"
          />
          <span className="text-base font-semibold text-slate-700">
            Yêu cầu Luyện Thi Ảo AI chấm bài
          </span>
        </div>

        <div className="mt-8 flex flex-col items-center">
          <button
            type="button"
            onClick={onStart}
            className="flex cursor-pointer items-center gap-3 rounded-full bg-gradient-to-b from-[#ff7a2f] to-[#e8530a] px-14 py-4 text-lg font-black tracking-widest text-white uppercase shadow-xl ring-4 ring-orange-300/60 transition-transform hover:scale-105 active:scale-95"
          >
            <span>Bước tiếp theo</span>
            <Image
              src="/clone-assets/speaking/next-step.c3496d88.png"
              alt=""
              width={30}
              height={22}
              className="h-6 w-auto"
            />
          </button>
          <div className="mt-4 flex items-center gap-2">
            <Image
              src="/clone-assets/speaking/icon-diamonds.580d8a36.webp"
              alt=""
              width={24}
              height={22}
              className="h-6 w-auto"
            />
            <span className="text-sm font-bold text-slate-600">0</span>
          </div>
        </div>
      </div>
    </div>
  )
}
