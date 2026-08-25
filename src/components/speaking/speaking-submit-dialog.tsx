"use client"

import { Loader2 } from "lucide-react"

interface SpeakingSubmitDialogProps {
  open: boolean
  unanswered: number
  submitting: boolean
  onCancel: () => void
  onConfirm: () => void
}

/** Modal xác nhận nộp bài thi Nói. */
export function SpeakingSubmitDialog({
  open,
  unanswered,
  submitting,
  onCancel,
  onConfirm,
}: SpeakingSubmitDialogProps): React.ReactElement | null {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-3xl bg-white p-7 shadow-2xl">
        <h2 className="text-center text-xl font-black text-slate-900">
          Xác nhận nộp bài thi
        </h2>
        <p className="mt-3 text-center text-slate-600">
          Bạn có chắc chắn muốn nộp bài không?
        </p>
        {unanswered > 0 ? (
          <p className="mt-2 text-center text-sm font-semibold text-amber-600">
            Còn {unanswered} câu chưa trả lời.
          </p>
        ) : null}

        <div className="mt-6 flex justify-center gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={submitting}
            className="cursor-pointer rounded-full border border-slate-300 px-6 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-50"
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={submitting}
            className="flex cursor-pointer items-center gap-2 rounded-full bg-semantic-danger px-8 py-2.5 text-sm font-bold text-white shadow transition-transform hover:scale-105"
          >
            {submitting ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            ) : null}
            Có, nộp bài
          </button>
        </div>
      </div>
    </div>
  )
}