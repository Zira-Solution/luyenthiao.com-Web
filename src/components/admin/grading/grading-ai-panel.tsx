import { Sparkles } from 'lucide-react'
import type { ReactElement } from 'react'

export interface GradingAiPanelProps {
  aiScore?: number | null
  aiFeedback?: unknown
  maxScore: number
}

function formatAiFeedbackLines(raw: unknown): { label?: string; text: string }[] {
  if (raw == null) return []
  if (typeof raw === 'string') {
    const trimmed = raw.trim()
    return trimmed ? [{ text: trimmed }] : []
  }
  if (typeof raw === 'object') {
    const obj = raw as Record<string, unknown>
    const out: { label?: string; text: string }[] = []
    if (typeof obj.comment === 'string' && obj.comment.trim()) {
      out.push({ label: 'Nhận xét AI', text: obj.comment.trim() })
    }
    if (typeof obj.errors === 'string' && obj.errors.trim()) {
      out.push({ label: 'Lỗi AI phát hiện', text: obj.errors.trim() })
    }
    if (typeof obj.tips === 'string' && obj.tips.trim()) {
      out.push({ label: 'Gợi ý AI', text: obj.tips.trim() })
    }
    if (out.length > 0) return out
    const serialized = JSON.stringify(raw, null, 2)
    return serialized && serialized !== '{}' ? [{ text: serialized }] : []
  }
  return []
}

export function GradingAiPanel({
  aiScore,
  aiFeedback,
  maxScore,
}: GradingAiPanelProps): ReactElement | null {
  const lines = formatAiFeedbackLines(aiFeedback)
  if (aiScore == null && lines.length === 0) return null

  return (
    <section
      aria-label="Gợi ý tham khảo từ AI"
      className="rounded-xl border border-indigo-200 bg-indigo-50 p-4"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold tracking-wide text-indigo-800 uppercase">
          <Sparkles className="size-3.5" aria-hidden="true" />
          Gợi ý AI (chỉ đọc)
        </span>
        {typeof aiScore === 'number' && (
          <span className="rounded-md bg-white px-2.5 py-0.5 text-xs font-semibold text-indigo-700 ring-1 ring-indigo-200">
            Điểm AI đề xuất: {aiScore}/{maxScore}
          </span>
        )}
      </div>

      {lines.length > 0 && (
        <div className="mt-2.5 space-y-2 text-sm text-indigo-950">
          {lines.map((item, idx) => (
            <div key={idx} className="rounded-lg bg-white p-3 ring-1 ring-indigo-100">
              {item.label && (
                <p className="mb-1 text-xs font-semibold text-indigo-700">{item.label}</p>
              )}
              <p className="whitespace-pre-wrap">{item.text}</p>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
