import { Sparkles, ArrowLeft } from 'lucide-react'

import { WritingStoryImage } from './writing-story-image'

import type { WritingAttempt } from '@/types/writing'

interface WritingReviewProps {
  attempt: WritingAttempt
  onBack: () => void
  onRetake: () => void
  onExitReview: () => void
}

function countWords(text: string): number {
  const trimmed = text.trim()
  if (!trimmed) return 0
  return trimmed.split(/\s+/).length
}

function FeedbackCard({
  title,
  icon,
  children,
}: {
  title: string
  icon: React.ReactElement
  children: React.ReactNode
}): React.ReactElement {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center gap-2 border-b border-slate-100 bg-slate-50 px-4 py-3">
        {icon}
        <span className="text-sm font-black tracking-wider text-slate-800 uppercase">{title}</span>
      </div>
      <div className="px-4 py-4 text-sm leading-relaxed text-slate-600">{children}</div>
    </div>
  )
}

/** Trang Xem lại bài: chấm điểm + nhận xét chi tiết từ Luyện Thi Ảo AI. */
export function WritingReview({
  attempt,
  onBack,
  onRetake,
  onExitReview,
}: WritingReviewProps): React.ReactElement {
  const { prompt, maxScore, score, userAnswer, feedback } = attempt

  return (
    <div className="relative min-h-[100dvh] w-full bg-slate-50 text-slate-800">
      <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-slate-200 bg-white px-4 py-3 shadow-sm">
        <button
          type="button"
          onClick={onBack}
          aria-label="Quay lại"
          className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl bg-slate-100 transition hover:bg-slate-200"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-sm font-black tracking-wide uppercase">
            {attempt.headerTitle || 'Flyers - Bài thi Viết'}
          </h1>
          <p className="text-xs text-slate-500">
            Điểm và nhận xét từ Luyện Thi Ảo AI cho phần viết
          </p>
        </div>
        <button
          type="button"
          onClick={onExitReview}
          className="ml-auto cursor-pointer rounded-full bg-gradient-to-b from-purple-500 to-purple-700 px-5 py-2 text-xs font-black tracking-wider text-white uppercase shadow transition-transform hover:scale-[1.03] active:scale-95"
        >
          Xem lại bài thi của bạn
        </button>
      </header>

      <main className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-6">
        {/* Tổng điểm */}
        <section className="rounded-3xl bg-gradient-to-br from-indigo-600 to-purple-700 p-6 text-white shadow-lg">
          <div className="flex flex-col items-center text-center">
            <span className="text-sm font-bold tracking-widest text-purple-100 uppercase">
              Tổng điểm toàn bài
            </span>
            <div className="mt-2 flex items-end gap-1">
              <span className="text-6xl leading-none font-black drop-shadow">{score}</span>
              <span className="pb-1 text-2xl font-black text-purple-200">/{maxScore}</span>
            </div>
            <p className="mt-1 text-xs font-medium text-purple-100">
              điểm và nhận xét từ Luyện Thi Ảo AI cho phần viết
            </p>
          </div>
        </section>

        {/* Phần 1 */}
        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-sm font-black tracking-wider text-slate-800 uppercase">
              {prompt.title}
            </h2>
          </div>
          <p className="mt-3 text-sm leading-relaxed font-medium text-slate-700">
            {prompt.instruction}
          </p>

          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            {prompt.images.map((img) => (
              <WritingStoryImage key={img.slot} image={img} />
            ))}
          </div>

          {/* Gợi ý (đáp án mẫu) */}
          <div className="mt-5 rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
            <span className="text-xs font-black tracking-wider text-emerald-700 uppercase">
              Gợi ý
            </span>
            <p className="mt-2 text-sm leading-relaxed text-emerald-900">{prompt.sampleAnswer}</p>
          </div>

          {/* Câu trả lời của thí sinh */}
          <div className="mt-4 rounded-2xl border border-slate-200 p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black tracking-wider text-slate-700 uppercase">
                Câu trả lời của bạn
              </span>
              <span className="rounded-full bg-purple-100 px-3 py-1 text-xs font-black text-purple-700">
                Số từ: {countWords(userAnswer)}
              </span>
            </div>
            <p className="mt-2 text-sm leading-relaxed whitespace-pre-wrap text-slate-600">
              {userAnswer.trim() ? userAnswer : '(Chưa có câu trả lời)'}
            </p>
          </div>
        </section>

        {/* Nhận xét Luyện Thi Ảo AI */}
        <section className="grid gap-4 lg:grid-cols-3">
          <FeedbackCard
            title="Nhận xét của Luyện Thi Ảo AI"
            icon={<Sparkles className="h-4 w-4 text-purple-600" />}
          >
            {feedback.comment}
          </FeedbackCard>
          <FeedbackCard
            title="Lỗi sai"
            icon={<span className="text-sm font-black text-rose-500">!</span>}
          >
            {feedback.errors}
          </FeedbackCard>
          <FeedbackCard
            title="Gợi ý cải thiện"
            icon={<span className="text-sm font-black text-sky-600">↑</span>}
          >
            {feedback.tips}
          </FeedbackCard>
        </section>

        <div className="grid gap-4 sm:grid-cols-2">
          <button
            type="button"
            onClick={onRetake}
            className="cursor-pointer rounded-2xl border-2 border-slate-200 bg-white py-3 text-sm font-black tracking-wider text-slate-600 uppercase transition hover:bg-slate-50"
          >
            Làm lại bài
          </button>
          <button
            type="button"
            onClick={onExitReview}
            className="cursor-pointer rounded-2xl bg-gradient-to-b from-purple-500 to-purple-700 py-3 text-sm font-black tracking-wider text-white uppercase shadow-lg transition-transform hover:scale-[1.02] active:scale-95"
          >
            Làm bài tiếp theo
          </button>
        </div>
      </main>
    </div>
  )
}
