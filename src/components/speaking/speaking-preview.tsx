import { ArrowLeft, FileText, Mic, Play, Volume2 } from "lucide-react"
import Image from "next/image"

import type { SpeakingAnswer, SpeakingAttempt } from "@/types/speaking"

interface SpeakingPreviewProps {
  attempt: SpeakingAttempt
  answers?: Record<string, SpeakingAnswer>
  onBack?: () => void
}

const OOPS =
  "Oops bạn ơi! Bạn quên trả lời câu hỏi này rồi nè. Lần làm bài tiếp theo bạn hãy trả lời hoặc kiểm tra lại mic và đảm bảo ghi âm tốt câu hỏi để có thể xem lại bài làm nhé!"

function AnswerSummary({
  answer,
}: {
  answer?: SpeakingAnswer
}): React.ReactElement {
  if (!answer?.answered) {
    return (
      <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3">
        <p className="text-sm leading-relaxed text-red-500">{OOPS}</p>
      </div>
    )
  }
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3">
      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-semantic-success text-white">
        <Play className="h-4 w-4 fill-current" aria-hidden />
      </span>
      <div className="text-sm">
        <p className="font-bold text-emerald-700">
          {answer.detail ?? "Bạn đã trả lời câu hỏi"}
        </p>
        {answer.duration !== undefined ? (
          <p className="text-xs text-emerald-600">
            Đã ghi âm · {answer.duration}s
          </p>
        ) : null}
      </div>
    </div>
  )
}

/** Trang chi tiết đáp án sau khi nộp bài Nói. */
export function SpeakingPreview({
  attempt,
  answers = {},
  onBack,
}: SpeakingPreviewProps): React.ReactElement {
  return (
    <div className="flex min-h-[100dvh] w-full flex-col bg-slate-100">
      <header className="flex items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 py-3 shadow-sm">
        <button
          type="button"
          onClick={onBack}
          className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200"
          aria-label="Quay lại"
        >
          <ArrowLeft className="h-5 w-5 text-slate-600" />
        </button>
        <p className="font-bold text-slate-800">Kết quả bài nói</p>
        <button
          type="button"
          className="flex cursor-pointer items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-sm font-bold text-white hover:bg-slate-700"
        >
          <FileText className="h-4 w-4" aria-hidden />
          Report
        </button>
      </header>

      <main className="mx-auto w-full max-w-3xl px-4 py-6">
        <section className="flex items-center gap-4 rounded-3xl bg-white p-5 shadow-sm">
          <Image
            src="/clone-assets/media/STARTERS.374b914a.png"
            alt="STARTERS logo"
            width={52}
            height={52}
            className="object-contain"
          />
          <div className="flex-1">
            <h1 className="text-lg font-black text-slate-900">
              {attempt.testTitle}
            </h1>
            <p className="text-sm text-slate-500">
              {attempt.userName} · Flyer ID: {attempt.flyerId}
            </p>
          </div>
          <div className="relative h-16 w-16">
            <Image
              src="/clone-assets/writing/default-frame.png"
              alt=""
              fill
              className="object-contain"
            />
            <span className="absolute inset-0 flex items-center justify-center text-3xl">
              👦
            </span>
          </div>
        </section>

        <h2 className="mt-8 text-center text-lg font-black tracking-wide text-purple-700">
          CHI TIẾT ĐÁP ÁN - CÂU TRẢ LỜI
        </h2>

        {attempt.parts.map((part) => (
          <section key={part.id} className="mt-8">
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-brand-primary px-2.5 py-1 text-xs font-black uppercase text-white">
                {part.indexLabel}
              </span>
              <h3 className="font-bold text-slate-800">{part.title}</h3>
            </div>

            <div className="mt-4 flex flex-col gap-3">
              {part.questions.map((q, i) => (
                <article
                  key={q.id}
                  className="rounded-3xl bg-white p-4 shadow-sm"
                >
                  <p className="text-xs font-bold uppercase text-slate-400">
                    Câu hỏi {i + 1}
                  </p>
                  <div className="mt-2 flex items-center gap-2 text-slate-700">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-purple-100">
                      <Volume2 className="h-4 w-4 text-purple-700" aria-hidden />
                    </span>
                    <span className="font-medium">{q.text}</span>
                  </div>
                  <div className="mt-3">
                    <AnswerSummary answer={answers[q.id]} />
                  </div>
                </article>
              ))}
            </div>
          </section>
        ))}

        <div className="mt-8 flex justify-center">
          <button
            type="button"
            className="flex cursor-pointer items-center gap-2 rounded-full bg-gradient-to-r from-purple-500 to-purple-700 px-10 py-3 text-sm font-black uppercase tracking-wide text-white shadow-lg transition-transform hover:scale-105"
          >
            <Mic className="h-4 w-4" aria-hidden />
            Nghe lại bài nói
          </button>
        </div>
      </main>
    </div>
  )
}