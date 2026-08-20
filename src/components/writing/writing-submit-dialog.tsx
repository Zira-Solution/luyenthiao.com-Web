interface WritingSubmitDialogProps {
  open: boolean
  onCancel: () => void
  onConfirm: () => void
  submitting: boolean
}

/** Hộp thoại xác nhận trước khi nộp bài thi Viết. */
export function WritingSubmitDialog({
  open,
  onCancel,
  onConfirm,
  submitting,
}: WritingSubmitDialogProps): React.ReactElement {
  if (!open) return <></>

  return (
    <div
      role="presentation"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-6"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="submit-writing-title"
        className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl"
      >
        <div className="flex items-center justify-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-100">
            <MaterialLabel />
          </span>
          <h2
            id="submit-writing-title"
            className="text-xl font-black text-slate-800"
          >
            Thông báo
          </h2>
        </div>

        <p className="mt-5 text-center text-sm font-semibold text-slate-600">
          Bạn có chắc chắn muốn nộp bài thi?
        </p>

        <div className="mt-8 grid grid-cols-2 gap-4">
          <button
            type="button"
            onClick={onCancel}
            disabled={submitting}
            className="cursor-pointer rounded-2xl border-2 border-slate-200 bg-white py-3 text-sm font-black uppercase tracking-wider text-slate-600 transition-colors hover:bg-slate-50 disabled:opacity-50"
          >
            Huỷ
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={submitting}
            className="cursor-pointer rounded-2xl bg-gradient-to-b from-purple-500 to-purple-700 py-3 text-sm font-black uppercase tracking-wider text-white shadow-lg transition-transform hover:scale-[1.02] active:scale-95 disabled:opacity-60"
          >
            {submitting ? "Đang nộp…" : "Nộp bài"}
          </button>
        </div>
      </div>
    </div>
  )
}

function MaterialLabel(): React.ReactElement {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="h-5 w-5 text-amber-600"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  )
}