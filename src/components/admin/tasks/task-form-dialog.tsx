'use client'

import { Loader2, X } from 'lucide-react'
import { useState, type ReactElement } from 'react'

import {
  TASK_ACTION_TYPES,
  TASK_CATEGORIES,
  type AdminTask,
  type SaveAdminTaskInput,
} from '@/schemas/admin-task'

export interface TaskFormDialogProps {
  open: boolean
  editing: AdminTask | null
  submitting: boolean
  onClose: () => void
  onSave: (input: SaveAdminTaskInput, editingId?: number) => Promise<void>
}

export function TaskFormDialog(props: TaskFormDialogProps): ReactElement | null {
  if (!props.open) return null
  return <TaskFormDialogInner key={props.editing?.id ?? 'new'} {...props} />
}

function TaskFormDialogInner({
  editing,
  submitting,
  onClose,
  onSave,
}: TaskFormDialogProps): ReactElement {
  const [title, setTitle] = useState(() => editing?.title ?? '')
  const [description, setDescription] = useState(() => editing?.description || '')
  const [category, setCategory] = useState<(typeof TASK_CATEGORIES)[number]>(
    () => editing?.category ?? 'DAILY',
  )
  const [actionType, setActionType] = useState<(typeof TASK_ACTION_TYPES)[number]>(
    () => editing?.actionType ?? 'COMPLETE_EXAM',
  )
  const [targetCount, setTargetCount] = useState(() => String(editing?.targetCount ?? 1))
  const [points, setPoints] = useState(() => String(editing?.points ?? 10))
  const [sortOrder, setSortOrder] = useState(() => String(editing?.sortOrder ?? 0))
  const [active, setActive] = useState(() => editing?.active ?? true)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg(null)
    if (!title.trim()) {
      setErrorMsg('Tiêu đề nhiệm vụ không được để trống.')
      return
    }
    const targetNum = Number.parseInt(targetCount, 10)
    const pointsNum = Number.parseInt(points, 10)
    const orderNum = Number.parseInt(sortOrder, 10)
    if (!Number.isFinite(targetNum) || targetNum < 1) {
      setErrorMsg('Mục tiêu hoàn thành phải >= 1.')
      return
    }
    if (!Number.isFinite(pointsNum) || pointsNum < 1) {
      setErrorMsg('Điểm thưởng phải >= 1.')
      return
    }

    try {
      await onSave(
        {
          title: title.trim(),
          description: description.trim(),
          category,
          actionType,
          targetCount: targetNum,
          points: pointsNum,
          sortOrder: Number.isFinite(orderNum) ? orderNum : 0,
          active,
        },
        editing?.id,
      )
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Không lưu được nhiệm vụ.')
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={editing ? 'Sửa nhiệm vụ' : 'Tạo nhiệm vụ mới'}
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-800/40 p-4"
    >
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h2 className="text-lg font-semibold text-slate-900">
            {editing ? `Chỉnh sửa nhiệm vụ #${editing.id}` : 'Tạo nhiệm vụ mới'}
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
            <label htmlFor="task-title" className="mb-1 block text-xs font-semibold text-slate-700">
              Tiêu đề nhiệm vụ *
            </label>
            <input
              id="task-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="VD: Hoàn thành 1 bài luyện thi"
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-500"
            />
          </div>

          <div>
            <label htmlFor="task-desc" className="mb-1 block text-xs font-semibold text-slate-700">
              Mô tả chi tiết
            </label>
            <textarea
              id="task-desc"
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="task-cat" className="mb-1 block text-xs font-semibold text-slate-700">
                Nhóm chu kỳ (category)
              </label>
              <select
                id="task-cat"
                value={category}
                onChange={(e) => setCategory(e.target.value as (typeof TASK_CATEGORIES)[number])}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900"
              >
                {TASK_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="task-action"
                className="mb-1 block text-xs font-semibold text-slate-700"
              >
                Hành động ghi nhận
              </label>
              <select
                id="task-action"
                value={actionType}
                onChange={(e) =>
                  setActionType(e.target.value as (typeof TASK_ACTION_TYPES)[number])
                }
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900"
              >
                {TASK_ACTION_TYPES.map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="task-target"
                className="mb-1 block text-xs font-semibold text-slate-700"
              >
                Mục tiêu (targetCount)
              </label>
              <input
                id="task-target"
                type="number"
                min={1}
                value={targetCount}
                onChange={(e) => setTargetCount(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900"
              />
            </div>

            <div>
              <label
                htmlFor="task-points"
                className="mb-1 block text-xs font-semibold text-slate-700"
              >
                Điểm thưởng (points)
              </label>
              <input
                id="task-points"
                type="number"
                min={1}
                value={points}
                onChange={(e) => setPoints(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900"
              />
            </div>
          </div>

          <div>
            <label htmlFor="task-order" className="mb-1 block text-xs font-semibold text-slate-700">
              Thứ tự hiển thị (sortOrder)
            </label>
            <input
              id="task-order"
              type="number"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="w-36 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900"
            />
          </div>

          <label className="inline-flex cursor-pointer items-center gap-2 text-sm font-medium text-slate-800">
            <input
              type="checkbox"
              checked={active}
              onChange={(e) => setActive(e.target.checked)}
              className="size-4 rounded border-slate-300 text-blue-600"
            />
            Đang kích hoạt
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
              {editing ? 'Lưu thay đổi' : 'Tạo nhiệm vụ'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
