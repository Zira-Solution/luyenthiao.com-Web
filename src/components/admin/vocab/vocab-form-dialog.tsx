'use client'

import { Loader2, X } from 'lucide-react'
import { useState, type ReactElement } from 'react'

import { MediaPickerField } from '@/components/admin/media'
import type { AdminVocabWord, SaveAdminVocabInput } from '@/schemas/admin-vocab'

export interface VocabFormDialogProps {
  open: boolean
  editing: AdminVocabWord | null
  submitting: boolean
  levelOptions: { slug: string; name: string }[]
  onClose: () => void
  onSave: (input: SaveAdminVocabInput, editingId?: number) => Promise<void>
}

const WORD_TYPES = ['n', 'v', 'adj', 'adv', 'prep', 'phrase'] as const

export function VocabFormDialog(props: VocabFormDialogProps): ReactElement | null {
  if (!props.open) return null
  return <VocabFormDialogInner key={props.editing?.id ?? 'new'} {...props} />
}

function VocabFormDialogInner({
  editing,
  submitting,
  levelOptions,
  onClose,
  onSave,
}: VocabFormDialogProps): ReactElement {
  const [word, setWord] = useState(() => editing?.word ?? '')
  const [ipa, setIpa] = useState(() => editing?.ipa || '')
  const [type, setType] = useState(() => editing?.type || 'n')
  const [meaningVi, setMeaningVi] = useState(() => editing?.meaningVi ?? '')
  const [exampleEn, setExampleEn] = useState(() => editing?.exampleEn ?? '')
  const [exampleVi, setExampleVi] = useState(() => editing?.exampleVi ?? '')
  const [audioUrl, setAudioUrl] = useState(() => editing?.audioUrl || '')
  const [level, setLevel] = useState(() => editing?.level || levelOptions[0]?.slug || 'starters')
  const [topic, setTopic] = useState(() => editing?.topic || '')
  const [active, setActive] = useState(() => editing?.active ?? true)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg(null)
    if (!word.trim()) {
      setErrorMsg('Từ vựng không được để trống.')
      return
    }
    if (!meaningVi.trim()) {
      setErrorMsg('Nghĩa tiếng Việt không được để trống.')
      return
    }
    try {
      await onSave(
        {
          word: word.trim(),
          ipa: ipa.trim(),
          type: type.trim() || 'n',
          meaningVi: meaningVi.trim(),
          exampleEn: exampleEn.trim() || undefined,
          exampleVi: exampleVi.trim() || undefined,
          audioUrl: audioUrl.trim(),
          level: level.trim() || 'starters',
          topic: topic.trim(),
          active,
        },
        editing?.id,
      )
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Không lưu được từ vựng.')
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={editing ? 'Chỉnh sửa từ vựng' : 'Thêm từ vựng'}
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-800/40 p-4"
    >
      <div className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h2 className="text-lg font-semibold text-slate-900">
            {editing ? `Sửa từ vựng: ${editing.word}` : 'Thêm từ vựng mới'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng"
            className="cursor-pointer rounded-lg p-1.5 text-slate-500 hover:bg-slate-100"
          >
            <X className="size-4" aria-hidden="true" />
          </button>
        </div>

        {errorMsg && (
          <div
            role="alert"
            className="mt-4 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-medium text-rose-700"
          >
            {errorMsg}
          </div>
        )}

        <form noValidate onSubmit={(e) => void handleSubmit(e)} className="mt-4 space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="vocab-word"
                className="mb-1 block text-xs font-semibold text-slate-700"
              >
                Từ vựng *
              </label>
              <input
                id="vocab-word"
                type="text"
                value={word}
                onChange={(e) => setWord(e.target.value)}
                placeholder="VD: adventure"
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-500"
              />
            </div>
            <div>
              <label
                htmlFor="vocab-ipa"
                className="mb-1 block text-xs font-semibold text-slate-700"
              >
                Phiên âm (IPA)
              </label>
              <input
                id="vocab-ipa"
                type="text"
                value={ipa}
                onChange={(e) => setIpa(e.target.value)}
                placeholder="VD: /ədˈventʃər/"
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-500"
              />
            </div>

            <div>
              <label
                htmlFor="vocab-type"
                className="mb-1 block text-xs font-semibold text-slate-700"
              >
                Từ loại
              </label>
              <select
                id="vocab-type"
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900"
              >
                {WORD_TYPES.map((wt) => (
                  <option key={wt} value={wt}>
                    {wt}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="vocab-level"
                className="mb-1 block text-xs font-semibold text-slate-700"
              >
                Cấp độ
              </label>
              <input
                id="vocab-level"
                list="vocab-level-options"
                type="text"
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                placeholder="starters / movers / flyers..."
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-500"
              />
              <datalist id="vocab-level-options">
                {levelOptions.map((l) => (
                  <option key={l.slug} value={l.slug}>
                    {l.name}
                  </option>
                ))}
              </datalist>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="vocab-meaning"
                className="mb-1 block text-xs font-semibold text-slate-700"
              >
                Nghĩa tiếng Việt *
              </label>
              <input
                id="vocab-meaning"
                type="text"
                value={meaningVi}
                onChange={(e) => setMeaningVi(e.target.value)}
                placeholder="Cuộc phiêu lưu"
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-500"
              />
            </div>
            <div>
              <label
                htmlFor="vocab-topic"
                className="mb-1 block text-xs font-semibold text-slate-700"
              >
                Chủ đề (topic)
              </label>
              <input
                id="vocab-topic"
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="Explore, Animals, School..."
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-500"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="vocab-ex-en"
              className="mb-1 block text-xs font-semibold text-slate-700"
            >
              Ví dụ tiếng Anh
            </label>
            <input
              id="vocab-ex-en"
              type="text"
              value={exampleEn}
              onChange={(e) => setExampleEn(e.target.value)}
              placeholder="Learning English is an exciting adventure."
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-500"
            />
          </div>

          <div>
            <label
              htmlFor="vocab-ex-vi"
              className="mb-1 block text-xs font-semibold text-slate-700"
            >
              Dịch ví dụ tiếng Việt
            </label>
            <input
              id="vocab-ex-vi"
              type="text"
              value={exampleVi}
              onChange={(e) => setExampleVi(e.target.value)}
              placeholder="Học tiếng Anh là một chuyến phiêu lưu đầy thú vị."
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-500"
            />
          </div>

          <div>
            <p className="mb-1.5 text-xs font-semibold text-slate-700">File phát âm (audioUrl)</p>
            <MediaPickerField
              kind="audio"
              value={audioUrl}
              onChange={(v) => setAudioUrl(v ?? '')}
            />
          </div>

          <label className="inline-flex cursor-pointer items-center gap-2 text-sm font-medium text-slate-800">
            <input
              type="checkbox"
              checked={active}
              onChange={(e) => setActive(e.target.checked)}
              className="size-4 rounded border-slate-300 text-blue-600"
            />
            Đang kích hoạt cho học viên tra cứu
          </label>

          <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="cursor-pointer rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="bg-admin-primary hover:bg-admin-primary-hover inline-flex cursor-pointer items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
            >
              {submitting && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
              {editing ? 'Lưu thay đổi' : 'Thêm từ vựng'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
