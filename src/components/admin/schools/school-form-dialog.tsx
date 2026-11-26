'use client'

import { Loader2, X } from 'lucide-react'
import { useState, type ReactElement } from 'react'

import type { AdminSchool, SaveAdminSchoolInput } from '@/schemas/admin-school'

export interface SchoolFormDialogProps {
  open: boolean
  editing: AdminSchool | null
  submitting: boolean
  onClose: () => void
  onSave: (input: SaveAdminSchoolInput, editingId?: number) => Promise<void>
}

export function SchoolFormDialog(props: SchoolFormDialogProps): ReactElement | null {
  if (!props.open) return null
  return <SchoolFormDialogInner key={props.editing?.id ?? 'new'} {...props} />
}

function SchoolFormDialogInner({
  editing,
  submitting,
  onClose,
  onSave,
}: SchoolFormDialogProps): ReactElement {
  const [name, setName] = useState(() => editing?.name ?? '')
  const [city, setCity] = useState(() => editing?.city || '')
  const [active, setActive] = useState(() => editing?.active ?? true)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg(null)
    if (!name.trim()) {
      setErrorMsg('Tên trường không được để trống.')
      return
    }
    try {
      await onSave(
        {
          name: name.trim(),
          city: city.trim(),
          active,
        },
        editing?.id,
      )
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Không lưu được thông tin trường.')
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={editing ? 'Sửa trường học' : 'Thêm trường học'}
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-800/40 p-4"
    >
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h2 className="text-lg font-semibold text-slate-900">
            {editing ? `Sửa trường học #${editing.id}` : 'Thêm trường học mới'}
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
          <div>
            <label
              htmlFor="school-name"
              className="mb-1 block text-xs font-semibold text-slate-700"
            >
              Tên trường *
            </label>
            <input
              id="school-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="VD: Tiểu học Kim Liên"
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-500"
            />
          </div>

          <div>
            <label
              htmlFor="school-city"
              className="mb-1 block text-xs font-semibold text-slate-700"
            >
              Tỉnh / Thành phố
            </label>
            <input
              id="school-city"
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="VD: Hà Nội"
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-500"
            />
          </div>

          <label className="inline-flex cursor-pointer items-center gap-2 text-sm font-medium text-slate-800">
            <input
              type="checkbox"
              checked={active}
              onChange={(e) => setActive(e.target.checked)}
              className="size-4 rounded border-slate-300 text-blue-600"
            />
            Hiển thị khi đăng ký tài khoản
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
              {editing ? 'Lưu thay đổi' : 'Thêm trường'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
